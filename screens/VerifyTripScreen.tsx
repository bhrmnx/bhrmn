import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadAndParse, VerifyError, type ParsedTicket } from '../lib/verify';
import { colors, type as t } from '../theme';

export default function VerifyTripScreen({ navigation }: any) {
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<ParsedTicket | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  async function run(pick: () => Promise<{ uri: string; mimeType?: string; name?: string } | null>) {
    try {
      const file = await pick();
      if (!file) return;
      setBusy(true);
      setParsed(null);
      setDraftId(null);
      const res = await uploadAndParse({
        uri: file.uri, mimeType: file.mimeType, fileName: file.name,
      });
      setParsed(res.parsed);
      setDraftId(res.draftId);
    } catch (e: any) {
      if (e instanceof VerifyError && e.duplicate) {
        Alert.alert(
          'You have used this ticket already',
          'This exact document already backs a verified trip on your passport. One document, one trip — that is what keeps the badge meaning something.',
        );
      } else {
        Alert.alert('Could not read that', e.message ?? String(e));
      }
    } finally {
      setBusy(false);
    }
  }

  const fromLibrary = () => run(async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8,
    });
    if (r.canceled) return null;
    const a = r.assets[0];
    return { uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg', name: a.fileName ?? undefined };
  });

  const fromCamera = () => run(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Camera access needed', 'Allow camera access to photograph a ticket.'); return null; }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (r.canceled) return null;
    const a = r.assets[0];
    return { uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg', name: a.fileName ?? undefined };
  });

  const fromFiles = () => run(async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'], copyToCacheDirectory: true,
    });
    if (r.canceled) return null;
    const a = r.assets[0];
    return { uri: a.uri, mimeType: a.mimeType, name: a.name };
  });

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.inner}>
      <Text style={s.h}>Verify a trip</Text>
      <Text style={s.sub}>
        Upload a boarding pass, ticket or hotel confirmation. Bhrmn reads the dates and places off
        it and shows you a draft — nothing reaches your passport until you confirm it.
      </Text>

      <View style={s.actions}>
        <Pressable style={[s.btn, busy && s.off]} onPress={fromCamera} disabled={busy}>
          <Text style={s.btnText}>Photograph a ticket</Text>
        </Pressable>
        <Pressable style={[s.btnAlt, busy && s.off]} onPress={fromLibrary} disabled={busy}>
          <Text style={s.btnAltText}>Choose from photos</Text>
        </Pressable>
        <Pressable style={[s.btnAlt, busy && s.off]} onPress={fromFiles} disabled={busy}>
          <Text style={s.btnAltText}>Pick a PDF</Text>
        </Pressable>
      </View>

      {busy && (
        <View style={s.busy}>
          <ActivityIndicator color={colors.indigo} />
          <Text style={s.busyText}>Reading the document…</Text>
        </View>
      )}

      {parsed && (
        <Result
          p={parsed}
          onUse={() => navigation.replace('addTrip', { prefill: parsed, draftId })}
        />
      )}

      <Text style={s.privacy}>
        Your documents are private to you. They are stored so a trip can be verified, and they are
        never shown on your profile. Tickets and bookings only — no government ID or payment cards
        in this beta.
      </Text>
    </ScrollView>
  );
}

function Result({ p, onUse }: { p: ParsedTicket; onUse: () => void }) {
  const low = (p.confidence ?? 0) < 0.5;
  const nothing = !p.startDate && !p.destination?.city;

  return (
    <View style={s.result}>
      <View style={s.resultTop}>
        <Text style={s.resultKicker}>WHAT BHRMN READ</Text>
        <Text style={[s.conf, low && { color: colors.terracotta }]}>
          {Math.round((p.confidence ?? 0) * 100)}% confident
        </Text>
      </View>

      {nothing ? (
        <Text style={s.nothing}>
          Nothing usable came off that document. Try a sharper photo, or one where the dates and
          route are fully visible.
        </Text>
      ) : (
        <>
          <Field label="TYPE" value={p.documentKind ?? '—'} />
          <Field label="FROM" value={fmtPlace(p.origin)} />
          <Field label="TO" value={fmtPlace(p.destination)} />
          <Field label="DATES" value={[p.startDate, p.endDate].filter(Boolean).join(' → ') || '—'} />
          <Field label="CARRIER" value={p.carrier ?? '—'} />
          <Field label="REFERENCE" value={p.reference ?? '—'} />

          {low && (
            <Text style={s.warn}>
              Low confidence. Check every field before you use this — a wrong date is worse than no
              trip at all.
            </Text>
          )}

          <Pressable style={s.use} onPress={onUse}>
            <Text style={s.useText}>Use this to start a trip</Text>
          </Pressable>
          <Text style={s.hint}>You can edit everything on the next screen.</Text>
        </>
      )}
    </View>
  );
}

const fmtPlace = (pl: ParsedTicket['origin']) =>
  !pl ? '—' : [pl.city, pl.code ? `(${pl.code})` : null, pl.country].filter(Boolean).join(' ') || '—';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 24, paddingTop: 72, paddingBottom: 140 },
  h: { ...t.display, fontSize: 28, color: colors.indigo, marginBottom: 8 },
  sub: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginBottom: 26 },
  actions: { gap: 10 },
  btn: { backgroundColor: colors.indigo, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  btnText: { ...t.body, color: colors.sand, fontWeight: '600' },
  btnAlt: {
    borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.sand,
    borderRadius: 10, paddingVertical: 15, alignItems: 'center',
  },
  btnAltText: { ...t.body, color: colors.ink },
  off: { opacity: 0.5 },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  busyText: { ...t.body, fontSize: 14, color: colors.inkSoft },
  result: {
    marginTop: 26, borderWidth: 1, borderColor: colors.hairline,
    borderRadius: 14, backgroundColor: colors.sand, padding: 18,
  },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultKicker: { ...t.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft },
  conf: { ...t.mono, fontSize: 10, color: colors.teal },
  nothing: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
  field: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7 },
  fieldLabel: { ...t.mono, fontSize: 10, letterSpacing: 1, color: colors.inkFaint },
  fieldValue: { ...t.body, fontSize: 14, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  warn: { ...t.body, fontSize: 13, lineHeight: 19, color: colors.terracotta, marginTop: 12 },
  use: { marginTop: 18, backgroundColor: colors.teal, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  useText: { ...t.body, color: colors.sand, fontWeight: '600' },
  hint: { ...t.body, fontSize: 12, color: colors.inkFaint, textAlign: 'center', marginTop: 8 },
  privacy: { ...t.body, fontSize: 12, lineHeight: 18, color: colors.inkFaint, marginTop: 30 },
});
