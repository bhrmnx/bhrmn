import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../lib/auth';
import {
  createTrip, searchPeople, searchPlaces, citiesInCountry, toISO, nights, type Place,
} from '../lib/trips';
import { colors, type as t } from '../theme';

type Person = { id: string; handle: string; display_name: string };
type Vis = 'public' | 'followers' | 'private';

export default function AddTripScreen({ navigation }: any) {
  const { session } = useAuth();

  const [places, setPlaces] = useState<Place[]>([]);
  const [pq, setPq] = useState('');
  const [pResults, setPResults] = useState<Place[]>([]);

  const today = new Date();
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [picking, setPicking] = useState<null | 'start' | 'end'>(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [vis, setVis] = useState<Vis>('public');

  const [cq, setCq] = useState('');
  const [cResults, setCResults] = useState<Person[]>([]);
  const [companions, setCompanions] = useState<Person[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      searchPlaces(pq).then(setPResults).catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [pq]);

  useEffect(() => {
    if (!session?.user) return;
    const id = setTimeout(() => {
      searchPeople(cq, session.user.id).then(setCResults).catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [cq, session?.user?.id]);

  // Cities we can offer for each selected country, so a country pick always
  // leads somewhere. Without this people log "Malaysia" and their city
  // counter never moves.
  const [suggested, setSuggested] = useState<Record<string, Place[]>>({});

  useEffect(() => {
    const countries = places.filter((p) => p.kind === 'country');
    countries.forEach((c) => {
      if (suggested[c.id]) return;
      citiesInCountry(c.id)
        .then((cs) => setSuggested((cur) => ({ ...cur, [c.id]: cs })))
        .catch(() => {});
    });
  }, [places]);

  function addPlace(p: Place) {
    setPlaces((cur) => (cur.find((x) => x.id === p.id) ? cur : [...cur, p]));
    setPq(''); setPResults([]);
  }

  const cityCount = places.filter((p) => p.kind === 'city').length;

  // countries the traveller picked but hasn't named a city inside yet
  const countriesNeedingCities = places.filter(
    (c) => c.kind === 'country' && !places.some((p) => p.kind === 'city' && p.parentId === c.id)
  );

  async function save() {
    if (!session?.user) return;
    if (places.length === 0) { Alert.alert('Where did you go?', 'Add at least one place.'); return; }
    if (end < start) { Alert.alert('Check the dates', 'The end date is before the start date.'); return; }

    // Soft gate, not a block. Countries-only is legitimate for a long overland
    // trip, but most of the time it just means the traveller stopped early.
    if (cityCount === 0) {
      const proceed = await new Promise<boolean>((resolve) =>
        Alert.alert(
          'No cities added',
          'Your cities counter will stay at zero and this trip will be vague on your timeline. Add the cities you actually stayed in?',
          [
            { text: 'Add cities', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Save anyway', onPress: () => resolve(true) },
          ]
        )
      );
      if (!proceed) return;
    }

    setSaving(true);
    try {
      await createTrip({
        ownerId: session.user.id,
        title: title.trim() || null,
        startDate: toISO(start),
        endDate: toISO(end),
        notes: notes.trim() || null,
        visibility: vis,
        placeIds: places.map((p) => p.id),
        companionIds: companions.map((c) => c.id),
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not save the trip', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  const n = nights(toISO(start), toISO(end));

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.h}>Add a trip</Text>
        <Text style={s.sub}>
          Every trip you log makes your passport harder to fake. You can attach a ticket later to
          get it verified.
        </Text>

        {/* WHERE */}
        <Text style={s.label}>WHERE</Text>
        {places.length > 0 && (
          <View style={s.chips}>
            {places.map((p, i) => (
              <Pressable key={p.id} style={s.chip} onPress={() => setPlaces(places.filter((x) => x.id !== p.id))}>
                <Text style={s.chipSeq}>{i + 1}</Text>
                <Text style={s.chipText}>{p.name}</Text>
                <Text style={s.chipX}>×</Text>
              </Pressable>
            ))}
          </View>
        )}
        <TextInput style={s.input} value={pq} onChangeText={setPq}
          placeholder={places.length ? 'Add another place' : 'Search a city or country'}
          placeholderTextColor={colors.inkFaint} autoCorrect={false} />
        {pResults.length > 0 && (
          <View style={s.results}>
            {pResults.slice(0, 8).map((p) => (
              <Pressable key={p.id} style={s.resultRow} onPress={() => addPlace(p)}>
                <View style={s.resultLeft}>
                  <Text style={s.resultName}>{p.name}</Text>
                  <Text style={[s.kind, p.kind === 'country' && s.kindCountry]}>
                    {p.kind === 'city' ? 'CITY' : 'COUNTRY'}
                  </Text>
                </View>
                <Text style={s.resultSub}>{p.kind === 'city' ? p.country : ''}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {countriesNeedingCities.map((c) => (
          <View key={c.id} style={s.nudge}>
            <Text style={s.nudgeTitle}>Where in {c.name}?</Text>
            <Text style={s.nudgeBody}>
              Countries alone don't say much. Cities are what make a passport specific.
            </Text>
            <View style={s.nudgeChips}>
              {(suggested[c.id] ?? []).map((city) => (
                <Pressable key={city.id} style={s.nudgeChip} onPress={() => addPlace(city)}>
                  <Text style={s.nudgeChipText}>+ {city.name}</Text>
                </Pressable>
              ))}
              {(suggested[c.id] ?? []).length === 0 && (
                <Text style={s.nudgeBody}>No cities on file yet — search above.</Text>
              )}
            </View>
          </View>
        ))}

        <Text style={s.hint}>
          Add places in the order you visited them. Cities count toward your passport
          {cityCount > 0 ? ` — ${cityCount} so far` : ''}. Tap a chip to remove it.
        </Text>

        {/* WHEN */}
        <Text style={s.label}>WHEN</Text>
        <View style={s.dateRow}>
          <Pressable style={s.dateBox} onPress={() => setPicking(picking === 'start' ? null : 'start')}>
            <Text style={s.dateLabel}>FROM</Text>
            <Text style={s.dateValue}>{start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </Pressable>
          <Pressable style={s.dateBox} onPress={() => setPicking(picking === 'end' ? null : 'end')}>
            <Text style={s.dateLabel}>TO</Text>
            <Text style={s.dateValue}>{end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </Pressable>
        </View>
        {picking && (
          <DateTimePicker
            value={picking === 'start' ? start : end}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date(2100, 0, 1)}
            onChange={(_, d) => {
              if (Platform.OS !== 'ios') setPicking(null);
              if (!d) return;
              if (picking === 'start') { setStart(d); if (end < d) setEnd(d); }
              else setEnd(d);
            }}
          />
        )}
        <Text style={s.hint}>{n === 0 ? 'Day trip' : `${n} night${n === 1 ? '' : 's'}`}</Text>

        {/* TITLE */}
        <Text style={s.label}>TITLE <Text style={s.opt}>optional</Text></Text>
        <TextInput style={s.input} value={title} onChangeText={setTitle}
          placeholder={places.length ? `e.g. ${places[0].name}, the long way` : 'Give it a name'}
          placeholderTextColor={colors.inkFaint} />

        {/* COMPANIONS */}
        <Text style={s.label}>WHO WITH <Text style={s.opt}>optional</Text></Text>
        {companions.length > 0 && (
          <View style={s.chips}>
            {companions.map((c) => (
              <Pressable key={c.id} style={s.chip} onPress={() => setCompanions(companions.filter((x) => x.id !== c.id))}>
                <Text style={s.chipText}>@{c.handle}</Text>
                <Text style={s.chipX}>×</Text>
              </Pressable>
            ))}
          </View>
        )}
        <TextInput style={s.input} value={cq} onChangeText={setCq}
          placeholder="Search by handle or name" placeholderTextColor={colors.inkFaint}
          autoCapitalize="none" autoCorrect={false} />
        {cResults.length > 0 && (
          <View style={s.results}>
            {cResults.map((p) => (
              <Pressable key={p.id} style={s.resultRow}
                onPress={() => { if (!companions.find((x) => x.id === p.id)) setCompanions([...companions, p]); setCq(''); setCResults([]); }}>
                <Text style={s.resultName}>{p.display_name}</Text>
                <Text style={s.resultSub}>@{p.handle}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={s.hint}>They confirm before it shows on their profile — that is what makes it a credential.</Text>

        {/* NOTES */}
        <Text style={s.label}>NOTES <Text style={s.opt}>optional</Text></Text>
        <TextInput style={[s.input, s.notes]} value={notes} onChangeText={setNotes}
          placeholder="What you'd want to remember in five years" placeholderTextColor={colors.inkFaint}
          multiline textAlignVertical="top" />

        {/* VISIBILITY */}
        <Text style={s.label}>WHO CAN SEE THIS</Text>
        <View style={s.segment}>
          {(['public', 'followers', 'private'] as Vis[]).map((v) => (
            <Pressable key={v} style={[s.segItem, vis === v && s.segOn]} onPress={() => setVis(v)}>
              <Text style={[s.segText, vis === v && s.segTextOn]}>
                {v === 'public' ? 'Everyone' : v === 'followers' ? 'Followers' : 'Only me'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={[s.btn, saving && s.btnOff]} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.sand} /> : <Text style={s.btnText}>Save trip</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={s.cancel}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 28, paddingTop: 68, paddingBottom: 140 },
  h: { ...t.display, fontSize: 28, color: colors.indigo, marginBottom: 6 },
  sub: { ...t.body, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginBottom: 26 },
  label: { ...t.mono, fontSize: 11, letterSpacing: 1, color: colors.inkSoft, marginTop: 22, marginBottom: 8 },
  opt: { color: colors.inkFaint },
  input: {
    ...t.body, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.sand,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink,
  },
  notes: { minHeight: 90, paddingTop: 13 },
  hint: { ...t.body, fontSize: 12, color: colors.inkFaint, marginTop: 7 },
  results: {
    borderWidth: 1, borderColor: colors.hairline, borderRadius: 10, marginTop: 6,
    backgroundColor: colors.sand, overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  resultName: { ...t.body, fontSize: 15, color: colors.ink },
  kind: {
    ...t.mono, fontSize: 8, letterSpacing: 0.8, color: colors.teal,
    borderWidth: 1, borderColor: colors.teal, borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1, overflow: 'hidden',
  },
  kindCountry: { color: colors.marigold, borderColor: colors.marigold },
  resultSub: { ...t.body, fontSize: 13, color: colors.inkFaint },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.teal,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  chipSeq: { ...t.mono, fontSize: 10, color: colors.sand, backgroundColor: colors.teal,
    width: 16, height: 16, borderRadius: 8, textAlign: 'center', lineHeight: 16, overflow: 'hidden' },
  chipText: { ...t.body, fontSize: 13, color: colors.teal },
  chipX: { ...t.body, fontSize: 15, color: colors.teal, opacity: 0.7 },
  nudge: {
    marginTop: 12, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: colors.marigold,
    backgroundColor: 'rgba(232,181,74,0.10)',
  },
  nudgeTitle: { ...t.body, fontSize: 14, fontWeight: '600', color: colors.ink },
  nudgeBody: { ...t.body, fontSize: 12, color: colors.inkSoft, marginTop: 3 },
  nudgeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  nudgeChip: {
    borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.sand,
    borderRadius: 16, paddingHorizontal: 11, paddingVertical: 6,
  },
  nudgeChipText: { ...t.body, fontSize: 13, color: colors.ink },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateBox: {
    flex: 1, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.sand,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
  },
  dateLabel: { ...t.mono, fontSize: 9, letterSpacing: 1, color: colors.inkFaint, marginBottom: 3 },
  dateValue: { ...t.body, fontSize: 15, color: colors.ink },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: colors.hairline, borderRadius: 10, overflow: 'hidden' },
  segItem: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.sand },
  segOn: { backgroundColor: colors.indigo },
  segText: { ...t.body, fontSize: 13, color: colors.inkSoft },
  segTextOn: { color: colors.sand, fontWeight: '600' },
  btn: { marginTop: 30, backgroundColor: colors.indigo, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  btnOff: { opacity: 0.6 },
  btnText: { ...t.body, color: colors.sand, fontWeight: '600' },
  cancel: { ...t.body, fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginTop: 16 },
});
