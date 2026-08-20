import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, type as t } from '../theme';

/**
 * The short, readable version shown at signup. DPDP wants notice that is
 * itemised and in plain language — not a wall of clauses nobody reads.
 * The full notice lives in PRIVACY.md.
 */
const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: 'What Bhrmn stores',
    body: [
      'Your email, name, handle, home city and the traveller types you pick.',
      'Your trips: places, dates, notes, who you travelled with, and who you let see them.',
      'Any travel document you choose to upload — a ticket, boarding pass or booking confirmation — and the route, dates, carrier and booking reference read off it.',
    ],
  },
  {
    h: 'What Bhrmn never collects',
    body: [
      'No government ID — no Aadhaar, PAN, or passport data page.',
      'No payment cards. No precise location. No contacts.',
      'Bhrmn never reads your photo library. You pick individual files.',
    ],
  },
  {
    h: 'Your documents',
    body: [
      'Stored privately and partitioned per user, enforced at the database level.',
      'Never shown on your profile, in the feed, or to people you travel with.',
      'Sent once to an AI model to read the travel facts off them. Not used to train it.',
      'Deleted when you delete the trip, or your account.',
    ],
  },
  {
    h: 'Who else sees anything',
    body: [
      'Other travellers see only what you make public or share with followers.',
      'Companions you tag must confirm before a trip appears on their profile.',
      'Nothing is sold. No advertisers. No behavioural ad tracking.',
    ],
  },
  {
    h: 'Your rights',
    body: [
      'See what is held, correct it, or erase it by deleting your account.',
      'Withdraw consent at any time by deleting your account.',
      'Complain to hello@bhrmn.in, and to the Data Protection Board of India if unsatisfied.',
    ],
  },
  {
    h: '18 and over only',
    body: [
      'Bhrmn is not for under-18s. Indian data protection law treats under-18s as children and requires protections this beta is not built to provide.',
    ],
  },
];

export default function PolicySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.wrap}>
        <ScrollView contentContainerStyle={s.inner}>
          <Text style={s.h1}>How Bhrmn handles your data</Text>
          <Text style={s.sub}>
            The short version. Written to India's DPDP Act. Nothing here is buried.
          </Text>

          {SECTIONS.map((sec) => (
            <View key={sec.h} style={s.section}>
              <Text style={s.h2}>{sec.h}</Text>
              {sec.body.map((line) => (
                <View key={line} style={s.row}>
                  <View style={s.dot} />
                  <Text style={s.line}>{line}</Text>
                </View>
              ))}
            </View>
          ))}

          <Text style={s.foot}>
            This is a private beta run by an individual, not a company. The full notice ships with
            the app source as PRIVACY.md, and lists what is still outstanding before public launch —
            including legal review.
          </Text>
        </ScrollView>

        <Pressable style={s.close} onPress={onClose}>
          <Text style={s.closeText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 24, paddingTop: 32, paddingBottom: 40 },
  h1: { ...t.display, fontSize: 26, color: colors.indigo, marginBottom: 8 },
  sub: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginBottom: 24 },
  section: { marginBottom: 22 },
  h2: { ...t.mono, fontSize: 11, letterSpacing: 1.3, color: colors.teal, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.marigold, marginTop: 7 },
  line: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.ink, flex: 1 },
  foot: { ...t.body, fontSize: 12, lineHeight: 19, color: colors.inkFaint, marginTop: 10 },
  close: {
    margin: 20, backgroundColor: colors.indigo, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center',
  },
  closeText: { ...t.body, color: colors.sand, fontWeight: '600' },
});
