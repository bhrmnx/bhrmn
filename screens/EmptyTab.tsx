import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, type as t } from '../theme';

/**
 * Honest placeholder for the three thin tabs.
 * States what will live here and why — no "coming soon".
 */
export default function EmptyTab({
  kicker, title, body, bullets,
}: { kicker: string; title: string; body: string; bullets: string[] }) {
  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.inner}>
      <Text style={s.kicker}>{kicker}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.body}>{body}</Text>
      <View style={s.card}>
        {bullets.map((b) => (
          <View key={b} style={s.row}>
            <View style={s.dot} />
            <Text style={s.rowText}>{b}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  inner: { padding: 28, paddingTop: 76, paddingBottom: 120 },
  kicker: { ...t.mono, fontSize: 11, letterSpacing: 1.6, color: colors.teal, marginBottom: 8 },
  title: { ...t.display, fontSize: 30, color: colors.indigo, marginBottom: 12 },
  body: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginBottom: 24 },
  card: {
    backgroundColor: colors.sand, borderWidth: 1, borderColor: colors.hairline,
    borderRadius: 14, padding: 20, gap: 14,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.marigold, marginTop: 7 },
  rowText: { ...t.body, fontSize: 14, lineHeight: 20, color: colors.ink, flex: 1 },
});
