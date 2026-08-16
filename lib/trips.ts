import { supabase } from './supabase';

export type Place = {
  id: string;
  name: string;
  country: string;
  kind: 'city' | 'country';
  parentId: string | null;   // for a city, the id of its country
};

export type TripRow = {
  id: string;
  title: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  is_verified: boolean;
  visibility: 'public' | 'followers' | 'private';
  places: string[];
  companions: { handle: string; display_name: string; status: string }[];
};

export async function searchPlaces(q: string, limit = 25): Promise<Place[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const { data, error } = await supabase
    .from('places')
    .select('id, name, country_code, kind, parent_id, parent:parent_id(name)')
    .ilike('name', `${term}%`)
    .order('kind', { ascending: false }) // cities before countries
    .order('name')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(toPlace);
}

function toPlace(r: any): Place {
  return {
    id: r.id,
    name: r.name,
    country: r.parent?.name ?? r.country_code,
    kind: r.kind as 'city' | 'country',
    parentId: r.parent_id ?? null,
  };
}

/** Every city we know about inside a given country, for the add-trip nudge. */
export async function citiesInCountry(countryId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('id, name, country_code, kind, parent_id, parent:parent_id(name)')
    .eq('parent_id', countryId)
    .eq('kind', 'city')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(toPlace);
}

export async function searchPeople(q: string, excludeId: string) {
  const term = q.trim().replace(/^@/, '');
  if (term.length < 2) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name')
    .or(`handle.ilike.${term}%,display_name.ilike.${term}%`)
    .neq('id', excludeId)
    .limit(15);
  if (error) throw error;
  return data ?? [];
}

/**
 * Creates a trip plus its places and companion invites.
 * Supabase has no client-side transaction, so on a child-insert failure we
 * delete the parent trip rather than leaving a half-written record.
 */
export async function createTrip(input: {
  ownerId: string;
  title: string | null;
  startDate: string;   // YYYY-MM-DD
  endDate: string;
  notes: string | null;
  visibility: 'public' | 'followers' | 'private';
  placeIds: string[];
  companionIds: string[];
  /** Set when this trip came from a parsed ticket — turns it into a verified trip. */
  draftId?: string | null;
}) {
  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      owner_id: input.ownerId,
      title: input.title,
      start_date: input.startDate,
      end_date: input.endDate,
      notes: input.notes,
      visibility: input.visibility,
      source: 'manual',
    })
    .select('id')
    .single();
  if (error) throw error;

  try {
    if (input.placeIds.length) {
      const rows = input.placeIds.map((place_id, seq) => ({ trip_id: trip.id, place_id, seq }));
      const { error: pe } = await supabase.from('trip_places').insert(rows);
      if (pe) throw pe;
    }
    if (input.companionIds.length) {
      const rows = input.companionIds.map((profile_id) => ({
        trip_id: trip.id, profile_id, status: 'pending',
      }));
      const { error: ce } = await supabase.from('trip_companions').insert(rows);
      if (ce) throw ce;
    }
    // Verification is server-side only. The client cannot set is_verified —
    // a database trigger forces it false — so this RPC is the only way a trip
    // becomes verified, and only against a real parsed document.
    if (input.draftId) {
      const { error: ve } = await supabase.rpc('confirm_trip_from_draft', {
        _draft_id: input.draftId,
        _trip_id: trip.id,
      });
      if (ve) throw ve;
    }
  } catch (e) {
    await supabase.from('trips').delete().eq('id', trip.id);
    throw e;
  }
  return trip.id as string;
}

export async function listTrips(ownerId: string): Promise<TripRow[]> {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      id, title, start_date, end_date, notes, is_verified, visibility,
      trip_places ( seq, places ( name ) ),
      trip_companions ( status, profiles ( handle, display_name ) )
    `)
    .eq('owner_id', ownerId)
    .order('start_date', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    start_date: t.start_date,
    end_date: t.end_date,
    notes: t.notes,
    is_verified: t.is_verified,
    visibility: t.visibility,
    places: (t.trip_places ?? [])
      .sort((a: any, b: any) => a.seq - b.seq)
      .map((tp: any) => tp.places?.name)
      .filter(Boolean),
    companions: (t.trip_companions ?? []).map((tc: any) => ({
      handle: tc.profiles?.handle ?? '',
      display_name: tc.profiles?.display_name ?? '',
      status: tc.status,
    })),
  }));
}

/**
 * Resolve a place from a parsed ticket. Airport code first (unambiguous),
 * then a known alias (Bangalore -> Bengaluru), then the name itself.
 * Returns null rather than a wrong guess.
 */
export async function resolvePlace(
  opts: { code?: string | null; city?: string | null }
): Promise<Place | null> {
  const sel = 'id, name, country_code, kind, parent_id, parent:parent_id(name)';

  if (opts.code) {
    const { data } = await supabase.from('places').select(sel)
      .eq('iata', opts.code.toUpperCase()).limit(1).maybeSingle();
    if (data) return toPlace(data);
  }

  const city = opts.city?.trim();
  if (!city) return null;

  const { data: alias } = await supabase.from('place_aliases')
    .select('place_id').eq('alias', city.toLowerCase()).limit(1).maybeSingle();
  if (alias?.place_id) {
    const { data } = await supabase.from('places').select(sel).eq('id', alias.place_id).single();
    if (data) return toPlace(data);
  }

  const { data: byName } = await supabase.from('places').select(sel)
    .eq('kind', 'city').ilike('name', city).limit(1).maybeSingle();
  return byName ? toPlace(byName) : null;
}

/** Distinct countries the traveller has actually set foot in, for the drawer. */
export async function countriesVisited(ownerId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('trip_places(places(name, country_code, kind, continent))')
    .eq('owner_id', ownerId);
  if (error) throw error;

  const byCode = new Map<string, { name: string; code: string; continent: string }>();
  (data ?? []).forEach((t: any) =>
    (t.trip_places ?? []).forEach((tp: any) => {
      const pl = tp.places;
      if (!pl) return;
      if (!byCode.has(pl.country_code)) {
        byCode.set(pl.country_code, {
          // a city row carries its own name, so prefer a country-kind row for the label
          name: pl.kind === 'country' ? pl.name : pl.country_code,
          code: pl.country_code,
          continent: pl.continent ?? '',
        });
      } else if (pl.kind === 'country') {
        byCode.set(pl.country_code, { name: pl.name, code: pl.country_code, continent: pl.continent ?? '' });
      }
    })
  );
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** ISO-3166 alpha-2 -> regional indicator flag emoji. */
export function flagOf(code: string) {
  if (!code || code.length !== 2) return '🏳️';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

export function fmtRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const m = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' });
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) return `${s.getDate()}–${e.getDate()} ${m(e)} ${e.getFullYear()}`;
  if (sameYear) return `${s.getDate()} ${m(s)} – ${e.getDate()} ${m(e)} ${e.getFullYear()}`;
  return `${s.getDate()} ${m(s)} ${s.getFullYear()} – ${e.getDate()} ${m(e)} ${e.getFullYear()}`;
}

export function nights(start: string, end: string) {
  const ms = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
