import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { DNA_OPTIONS } from '../lib/travelDna';
import { listTrips, countriesVisited, fmtRange, nights, type TripRow } from '../lib/trips';
import PassportCard, { type PassportStats } from '../components/PassportCard';
import { colors, type as t } from '../theme';

type Stats = PassportStats & { verified_trip_count: number };

export default function ProfileScreen({ navigation }: any) {
  const { session, profile, signOut } = useAuth();
  const [homeCity, setHomeCity] = useState('—');
  const [stats, setStats] = useState<Stats | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [countries, setCountries] = useState<{ name: string; code: string; continent: string }[]>([]);

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
      countriesVisited(profile.id).then((c) => { if (alive) setCountries(c); }).catch(() => {});

      return () => { alive = false; };
    }, [profile?.id, profile?.home_city_id])
  );

  const dnaLabels = (profile?.dna_declared ?? [])
    .map((id) => DNA_OPTIONS.find((o) => o.id === id)?.label ?? id);

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.inner}>
      <PassportCard
        name={profile?.display_name ?? '…'}
        handle={profile?.handle ?? ''}
        metaLine={[homeCity !== '—' ? homeCity : null, dnaLabels.slice(0, 2).join(' / ') || null]
          .filter(Boolean).join(' · ')
          .toUpperCase()}
        travellerId={`TRV-${(profile?.id ?? '').slice(0, 4).toUpperCase()}-${(stats?.trip_count ?? 0).toString().padStart(2, '0')}`}
        stats={stats}
        countries={countries}
      />

      <View style={s.subStats}>
        <Text style={s.subStat}>
          {stats?.days_travelled ?? 0} days travelled
        </Text>
        <Text style={s.subStatDot}>·</Text>
        <Text style={s.subStat}>
          {stats?.verified_trip_count ?? 0} of {stats?.trip_count ?? 0} verified
        </Text>
      </View>

      <Text style={s.section}>TRAVEL DNA</Text>
      <View style={s.chips}>
        {dnaLabels.length === 0
          ? <Text style={s.empty}>None picked yet.</Text>
          : dnaLabels.map((l) => <View key={l} style={s.chip}><Text style={s.chipText}>{l}</Text></View>)}
      </View>

      <View style={s.tripHead}>
        <Text style={s.section}>TIMELINE</Text>
        <View style={s.headBtns}>
          <Pressable style={s.verifyBtn} onPress={() => navigation.navigate('verifyTrip')}>
            <Text style={s.verifyBtnText}>✓ Verify</Text>
          </Pressable>
          <Pressable style={s.addBtn} onPress={() => navigation.navigate('addTrip')}>
            <Text style={s.addBtnText}>+ Add a trip</Text>
          </Pressable>
        </View>
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

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 20, paddingTop: 68, paddingBottom: 130 },
  subStats: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 14 },
  subStat: { ...t.mono, fontSize: 10, letterSpacing: 0.6, color: colors.inkFaint },
  subStatDot: { ...t.mono, fontSize: 10, color: colors.inkFaint },
  section: { ...t.mono, fontSize: 11, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 28, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.teal, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6 },
  chipText: { ...t.body, fontSize: 13, color: colors.teal },
  empty: { ...t.body, fontSize: 13, color: colors.inkFaint },
  tripHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headBtns: { flexDirection: 'row', gap: 8, marginTop: 24 },
  addBtn: {
    borderWidth: 1, borderColor: colors.indigo, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnText: { ...t.body, fontSize: 13, color: colors.indigo, fontWeight: '600' },
  verifyBtn: {
    backgroundColor: colors.teal, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  verifyBtnText: { ...t.body, fontSize: 13, color: colors.sand, fontWeight: '600' },
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
