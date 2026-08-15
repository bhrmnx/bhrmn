import { supabase } from './supabase';

export type Place = { id: string; name: string; country: string; kind: 'city' | 'country' };

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
    .select('id, name, country_code, kind, parent:parent_id(name)')
    .ilike('name', `${term}%`)
    .order('kind', { ascending: false }) // cities before countries
    .order('name')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    country: r.parent?.name ?? r.country_code,
    kind: r.kind as 'city' | 'country',
  }));
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
