import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardCover from '../components/CardCover';
import { type ArtKey } from '../components/CardArt';
import { allCards, TYPE_LABEL } from '../lib/cards';
import { flagOf } from '../lib/trips';
import { colors, type as t } from '../theme';

const ACCENTS: Record<string, string> = {
  marigold: colors.marigold, teal: colors.teal, terracotta: colors.terracotta,
  violet: colors.violet, green: colors.green, chili: colors.chili,
};

export default function CardDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const card = allCards().find((c) => c.id === route.params?.id);
  if (!card) return null;
  const accent = ACCENTS[card.accent] ?? colors.marigold;

  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <CardCover photo={card.photo} art={(card.art ?? 'default') as ArtKey} height={230} />

        <View style={s.body}>
          <View style={s.kickerRow}>
            <Text style={[s.type, { color: accent }]}>{TYPE_LABEL[card.type]}</Text>
            <Text style={s.place}>{flagOf(card.place.code)}  {card.place.name}, {card.place.country}</Text>
          </View>

          <Text style={s.title}>{card.title}</Text>
          <Text style={s.standfirst}>{card.standfirst}</Text>

          {card.type === 'thisOrThat' && card.optionA && card.optionB && (
            <View style={s.versus}>
              {!!card.question && <Text style={[s.question, { color: accent }]}>{card.question}</Text>}
              {[card.optionA, card.optionB].map((o, i) => (
                <View key={o.name} style={[s.option, i === 0 && { marginBottom: 10 }]}>
                  <Text style={s.optionName}>{o.name}</Text>
                  <Text style={s.optionPitch}>{o.pitch}</Text>
                  <Text style={s.optionAgainst}>But — {o.against}</Text>
                </View>
              ))}
            </View>
          )}

          {card.type === 'itinerary' && (card.days ?? []).length > 0 && (
            <View style={s.days}>
              {card.days!.map((d) => (
                <View key={d.day} style={s.dayRow}>
                  <View style={[s.dayNum, { borderColor: accent }]}>
                    <Text style={[s.dayNumText, { color: accent }]}>{d.day}</Text>
                  </View>
                  <View style={s.dayBody}>
                    <Text style={s.dayPlace}>{d.place}</Text>
                    {!!d.note && <Text style={s.dayNote}>{d.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {card.type === 'itinerary' && card.author?.verifiedTrip && (
            <View style={s.verifiedBy}>
              <Text style={s.verifiedByText}>
                ✓ Backed by a verified trip · @{card.author.handle} · {card.author.tripDates}
              </Text>
            </View>
          )}

          {(card.body ?? []).map((p, i) => <Text key={i} style={s.para}>{p}</Text>)}

          {(card.facts ?? []).length > 0 && (
            <View style={s.facts}>
              {card.facts!.map((f) => (
                <View key={f.label} style={s.factRow}>
                  <Text style={s.factLabel}>{f.label.toUpperCase()}</Text>
                  <Text style={s.factValue}>{f.value}</Text>
                </View>
              ))}
            </View>
          )}

          {(card.sources ?? []).length > 0 && (
            <View style={s.sources}>
              <Text style={s.sourcesLabel}>SOURCES</Text>
              {card.sources!.map((src) => (
                <Pressable key={src.url} onPress={() => Linking.openURL(src.url)}>
                  <Text style={[s.sourceLink, { color: accent }]}>{src.name} ↗</Text>
                </Pressable>
              ))}
            </View>
          )}

          {(card.tags ?? []).length > 0 && (
            <View style={s.tags}>
              {card.tags!.map((tg) => <Text key={tg} style={s.tag}>#{tg}</Text>)}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable style={[s.back, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>✕</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FBF9F4' },
  body: { paddingHorizontal: 24, paddingTop: 22 },
  kickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  type: { ...t.mono, fontSize: 10, letterSpacing: 2 },
  place: { ...t.mono, fontSize: 10, letterSpacing: 0.6, color: colors.inkSoft, flexShrink: 1, textAlign: 'right' },
  title: { ...t.display, fontSize: 30, lineHeight: 37, color: colors.ink, marginBottom: 12 },
  standfirst: { ...t.body, fontSize: 16, lineHeight: 25, color: colors.inkSoft, marginBottom: 22 },
  para: { ...t.body, fontSize: 15, lineHeight: 26, color: colors.ink, marginBottom: 16 },
  versus: { marginBottom: 20 },
  question: { ...t.mono, fontSize: 11, letterSpacing: 0.5, marginBottom: 12 },
  option: { borderWidth: 1, borderColor: colors.hairline, borderRadius: 12, padding: 15, backgroundColor: colors.sand },
  optionName: { ...t.display, fontSize: 18, color: colors.ink, marginBottom: 6 },
  optionPitch: { ...t.body, fontSize: 14, lineHeight: 22, color: colors.ink },
  optionAgainst: { ...t.body, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: 8, fontStyle: 'italic' },
  days: { gap: 2, marginBottom: 20 },
  dayRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 10 },
  dayNum: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNumText: { ...t.mono, fontSize: 12, fontWeight: '600' },
  dayBody: { flex: 1, paddingTop: 4 },
  dayPlace: { ...t.body, fontSize: 16, color: colors.ink, fontWeight: '600' },
  dayNote: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginTop: 4 },
  verifiedBy: {
    borderWidth: 1, borderColor: colors.green, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 20,
    backgroundColor: 'rgba(78,122,82,0.07)',
  },
  verifiedByText: { ...t.mono, fontSize: 10, letterSpacing: 0.5, color: colors.green },
  facts: { borderTopWidth: 1, borderTopColor: colors.hairline, marginTop: 6, paddingTop: 16, gap: 12 },
  factRow: { gap: 3 },
  factLabel: { ...t.mono, fontSize: 9, letterSpacing: 1.2, color: colors.inkFaint },
  factValue: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.ink },
  sources: { marginTop: 24, gap: 6 },
  sourcesLabel: { ...t.mono, fontSize: 9, letterSpacing: 1.2, color: colors.inkFaint, marginBottom: 2 },
  sourceLink: { ...t.body, fontSize: 12.5, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 },
  tag: { ...t.mono, fontSize: 10, color: colors.inkFaint },
  back: {
    position: 'absolute', left: 16, width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(20,32,44,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: colors.sand, fontSize: 16, lineHeight: 18 },
});
