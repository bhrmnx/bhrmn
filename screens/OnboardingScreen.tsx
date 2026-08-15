import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { DNA_OPTIONS, MAX_DNA } from '../lib/travelDna';
import { colors, type as t } from '../theme';

type City = { id: string; name: string; country: string };

export default function OnboardingScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);

  const [name, setName] = useState(profile?.display_name ?? '');
  const [handle, setHandle] = useState(profile?.handle ?? '');

  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState<City | null>(null);
  const [searching, setSearching] = useState(false);

  const [dna, setDna] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // debounced city search
  useEffect(() => {
    if (step !== 1) return;
    const q = query.trim();
    if (q.length < 2) { setCities([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, name, country_code, parent:parent_id(name)')
        .eq('kind', 'city')
        .ilike('name', `${q}%`)
        .order('name')
        .limit(25);
      setSearching(false);
      if (error) { console.warn(error.message); return; }
      setCities(
        (data ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          country: r.parent?.name ?? r.country_code,
        }))
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [query, step]);

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length >= 2 && /^[a-z0-9_]{3,20}$/.test(handle.trim().toLowerCase());
    if (step === 1) return !!city;
    return dna.length > 0;
  }, [step, name, handle, city, dna]);

  function toggleDna(id: string) {
    setDna((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id)
      : cur.length >= MAX_DNA ? cur
      : [...cur, id]
    );
  }

  async function finish() {
    if (!session?.user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: name.trim(),
        handle: handle.trim().toLowerCase(),
        home_city_id: city!.id,
        dna_declared: dna,
      })
      .eq('id', session.user.id);
    setSaving(false);

    if (error) {
      const msg = error.message.includes('profiles_handle_key')
        ? 'That handle is taken. Try another.'
        : error.message;
      Alert.alert('Could not save', msg);
      if (error.message.includes('profiles_handle_key')) setStep(0);
      return;
    }
    await refreshProfile();
  }

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <View style={s.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[s.dot, i <= step && s.dotOn]} />
          ))}
        </View>

        {step === 0 && (
          <>
            <Text style={s.h}>What should we call you?</Text>
            <Text style={s.sub}>Your handle is how other travellers find you.</Text>

            <Text style={s.label}>NAME</Text>
            <TextInput style={s.input} value={name} onChangeText={setName}
              placeholder="Yash Thakur" placeholderTextColor={colors.inkFaint} />

            <Text style={s.label}>HANDLE</Text>
            <View style={s.handleRow}>
              <Text style={s.at}>@</Text>
              <TextInput
                style={[s.input, s.handleInput]}
                value={handle}
                onChangeText={(v) => setHandle(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yashthakur"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            <Text style={s.hint}>3–20 characters. Letters, numbers and underscores.</Text>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={s.h}>Where do you call home?</Text>
            <Text style={s.sub}>
              This is how Bhrmn shows you travellers passing through your city — the reason to open
              the app when you have no trip booked.
            </Text>

            <TextInput style={s.input} value={city ? `${city.name}, ${city.country}` : query}
              onChangeText={(v) => { setCity(null); setQuery(v); }}
              placeholder="Search your city" placeholderTextColor={colors.inkFaint}
              autoCorrect={false} />

            {searching && <ActivityIndicator style={{ marginTop: 8 }} color={colors.inkSoft} />}

            {!city && cities.length > 0 && (
              <FlatList
                style={s.list}
                data={cities}
                keyExtractor={(i) => i.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable style={s.cityRow} onPress={() => { setCity(item); setCities([]); }}>
                    <Text style={s.cityName}>{item.name}</Text>
                    <Text style={s.cityCountry}>{item.country}</Text>
                  </Pressable>
                )}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={s.h}>What kind of traveller are you?</Text>
            <Text style={s.sub}>
              Pick up to {MAX_DNA}. This is your starting Travel DNA — as you log real trips, Bhrmn
              works out the rest from what you actually do.
            </Text>

            <FlatList
              style={s.list}
              data={DNA_OPTIONS}
              keyExtractor={(i) => i.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const on = dna.includes(item.id);
                const full = dna.length >= MAX_DNA && !on;
                return (
                  <Pressable
                    style={[s.dnaRow, on && s.dnaOn, full && s.dnaOff]}
                    onPress={() => toggleDna(item.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.dnaLabel, on && s.dnaLabelOn]}>{item.label}</Text>
                      <Text style={s.dnaBlurb}>{item.blurb}</Text>
                    </View>
                    <View style={[s.check, on && s.checkOn]} />
                  </Pressable>
                );
              }}
            />
            <Text style={s.hint}>{dna.length} of {MAX_DNA} selected</Text>
          </>
        )}

        <View style={s.footer}>
          {step > 0 && (
            <Pressable onPress={() => setStep(step - 1)} disabled={saving}>
              <Text style={s.back}>Back</Text>
            </Pressable>
          )}
          <Pressable
            style={[s.btn, !canContinue && s.btnOff]}
            disabled={!canContinue || saving}
            onPress={() => (step < 2 ? setStep(step + 1) : finish())}
          >
            {saving ? <ActivityIndicator color={colors.sand} />
                    : <Text style={s.btnText}>{step < 2 ? 'Continue' : 'Create my profile'}</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 72, paddingBottom: 28 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot: { width: 26, height: 3, borderRadius: 2, backgroundColor: colors.hairline },
  dotOn: { backgroundColor: colors.indigo },
  h: { ...t.display, fontSize: 26, color: colors.indigo, marginBottom: 8 },
  sub: { ...t.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft, marginBottom: 26 },
  label: { ...t.mono, fontSize: 11, letterSpacing: 1, color: colors.inkSoft, marginBottom: 8 },
  input: {
    ...t.body, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.sand,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink, marginBottom: 16,
  },
  handleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  at: { ...t.body, color: colors.inkSoft, paddingTop: 14, paddingRight: 6, fontSize: 16 },
  handleInput: { flex: 1 },
  hint: { ...t.body, fontSize: 12, color: colors.inkFaint },
  list: { flexGrow: 0, maxHeight: 400, marginTop: 4 },
  cityRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  cityName: { ...t.body, color: colors.ink },
  cityCountry: { ...t.body, fontSize: 13, color: colors.inkFaint },
  dnaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.hairline, borderRadius: 10, marginBottom: 8,
    backgroundColor: colors.sand,
  },
  dnaOn: { borderColor: colors.teal, borderWidth: 2 },
  dnaOff: { opacity: 0.45 },
  dnaLabel: { ...t.body, fontSize: 15, color: colors.ink },
  dnaLabelOn: { fontWeight: '600' },
  dnaBlurb: { ...t.body, fontSize: 12, color: colors.inkFaint, marginTop: 2 },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.hairline },
  checkOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  footer: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 18, paddingTop: 18 },
  back: { ...t.body, color: colors.inkSoft },
  btn: { flex: 1, backgroundColor: colors.indigo, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  btnOff: { opacity: 0.4 },
  btnText: { ...t.body, color: colors.sand, fontWeight: '600' },
});
