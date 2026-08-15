import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { DNA_OPTIONS } from '../lib/travelDna';
import { listTrips, fmtRange, nights, type TripRow } from '../lib/trips';
import { colors, type as t } from '../theme';

type Stats = {
  trip_count: number;
  verified_trip_count: number;
  country_count: number;
  city_count: number;
  days_travelled: number;
};

export default function ProfileScreen({ navigation }: any) {
  const { session, profile, signOut } = useAuth();
  const [homeCity, setHomeCity] = useState('—');
  const [stats, setStats] = useState<Stats | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);

  // Refetch every time the tab regains focus, so a newly saved trip shows up.
  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let alive = true;

      if (profile.home_city_id) {
        supabase.from('places').select('name, parent:parent_id(name)')
          .eq('id', profile.home_city_id).single()
          .then(({ data }: any) => {
            if (alive && data) setHomeCity(`${data.name}${data.parent?.name ? `, ${data.parent.name}` : ''}`);
          });
      }
      supabase.from('profile_stats').select('*').eq('profile_id', profile.id).single()
        .then(({ data }) => { if (alive && data) setStats(data as Stats); });

      listTrips(profile.id).then((r) => { if (alive) setTrips(r); }).catch(() => {});

      return () => { alive = false; };
    }, [profile?.id, profile?.home_city_id])
  );

  const dnaLabels = (profile?.dna_declared ?? [])
    .map((id) => DNA_OPTIONS.find((o) => o.id === id)?.label ?? id);

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.inner}>
      <Text style={s.kicker}>TRAVEL PASSPORT</Text>
      <Text style={s.name}>{profile?.display_name ?? '…'}</Text>
      <Text style={s.handle}>@{profile?.handle}</Text>

      <View style={s.card}>
        <View style={s.statsRow}>
          <Stat n={stats?.country_count ?? 0} l="COUNTRIES" />
          <Stat n={stats?.city_count ?? 0} l="CITIES" />
          <Stat n={stats?.trip_count ?? 0} l="TRIPS" />
          <Stat n={stats?.verified_trip_count ?? 0} l="VERIFIED" />
        </View>
        <View style={s.divider} />
        <Row label="HOME" value={homeCity} />
        <Row label="DAYS TRAVELLED" value={String(stats?.days_travelled ?? 0)} />
        <Row label="EMAIL" value={session?.user.email ?? '—'} />
      </View>

      <Text style={s.section}>TRAVEL DNA</Text>
      <View style={s.chips}>
        {dnaLabels.length === 0
          ? <Text style={s.empty}>None picked yet.</Text>
          : dnaLabels.map((l) => <View key={l} style={s.chip}><Text style={s.chipText}>{l}</Text></View>)}
      </View>

      <View style={s.tripHead}>
        <Text style={s.section}>TIMELINE</Text>
        <Pressable style={s.addBtn} onPress={() => navigation.navigate('addTrip')}>
          <Text style={s.addBtnText}>+ Add a trip</Text>
        </Pressable>
      </View>

      {trips.length === 0 ? (
        <Text style={s.note}>
          Your passport is empty. Add your first trip — even one from years ago — and the counters
          above start telling your story instead of nobody's.
        </Text>
      ) : (
        trips.map((tr) => (
          <View key={tr.id} style={s.trip}>
            <View style={s.tripTop}>
              <Text style={s.tripPlaces} numberOfLines={1}>
                {tr.places.join(' · ') || 'Somewhere'}
              </Text>
              {tr.is_verified
                ? <Text style={s.verified}>✓ VERIFIED</Text>
                : <Text style={s.unverified}>UNVERIFIED</Text>}
            </View>
            {!!tr.title && <Text style={s.tripTitle}>{tr.title}</Text>}
            <Text style={s.tripMeta}>
              {fmtRange(tr.start_date, tr.end_date)} · {nights(tr.start_date, tr.end_date)} nights
              {tr.visibility !== 'public' ? ` · ${tr.visibility === 'private' ? 'only me' : 'followers'}` : ''}
            </Text>
            {tr.companions.length > 0 && (
              <Text style={s.tripWith}>
                with {tr.companions.map((c) => `@${c.handle}${c.status === 'pending' ? ' (pending)' : ''}`).join(', ')}
              </Text>
            )}
            {!!tr.notes && <Text style={s.tripNotes} numberOfLines={3}>{tr.notes}</Text>}
          </View>
        ))
      )}

      <Pressable style={s.btn} onPress={signOut}>
        <Text style={s.btnText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statN}>{n}</Text>
      <Text style={s.statL}>{l}</Text>
    </View>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 28, paddingTop: 76, paddingBottom: 130 },
  kicker: { ...t.mono, fontSize: 11, letterSpacing: 1.6, color: colors.teal, marginBottom: 8 },
  name: { ...t.display, fontSize: 32, color: colors.indigo },
  handle: { ...t.body, fontSize: 15, color: colors.inkSoft, marginBottom: 24 },
  card: { backgroundColor: colors.sand, borderWidth: 1, borderColor: colors.hairline, borderRadius: 14, padding: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statN: { ...t.display, fontSize: 24, color: colors.indigo },
  statL: { ...t.mono, fontSize: 9, letterSpacing: 0.8, color: colors.inkSoft, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  rowLabel: { ...t.mono, fontSize: 11, letterSpacing: 1, color: colors.inkSoft },
  rowValue: { ...t.body, fontSize: 14, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  section: { ...t.mono, fontSize: 11, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 28, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.teal, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6 },
  chipText: { ...t.body, fontSize: 13, color: colors.teal },
  empty: { ...t.body, fontSize: 13, color: colors.inkFaint },
  tripHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    marginTop: 24, borderWidth: 1, borderColor: colors.indigo, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnText: { ...t.body, fontSize: 13, color: colors.indigo, fontWeight: '600' },
  note: { ...t.body, fontSize: 13, lineHeight: 20, color: colors.inkSoft },
  trip: {
    backgroundColor: colors.sand, borderWidth: 1, borderColor: colors.hairline,
    borderRadius: 12, padding: 16, marginBottom: 10,
  },
  tripTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  tripPlaces: { ...t.body, fontSize: 16, color: colors.ink, flex: 1, fontWeight: '600' },
  verified: { ...t.mono, fontSize: 9, letterSpacing: 0.8, color: colors.green },
  unverified: { ...t.mono, fontSize: 9, letterSpacing: 0.8, color: colors.inkFaint },
  tripTitle: { ...t.body, fontSize: 14, color: colors.inkSoft, fontStyle: 'italic', marginTop: 3 },
  tripMeta: { ...t.mono, fontSize: 11, color: colors.inkSoft, marginTop: 7 },
  tripWith: { ...t.body, fontSize: 13, color: colors.teal, marginTop: 6 },
  tripNotes: { ...t.body, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 8 },
  btn: {
    marginTop: 30, borderWidth: 1, borderColor: colors.hairline,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  btnText: { ...t.body, color: colors.ink },
});
