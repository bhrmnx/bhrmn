import React, { useMemo, useState } from 'react';
import { FlatList, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardArt, { type ArtKey } from '../components/CardArt';
import { publishableCards, TYPE_LABEL, type Card } from '../lib/cards';
import { flagOf } from '../lib/trips';
import { colors, type as t } from '../theme';

const ACCENTS: Record<string, string> = {
  marigold: colors.marigold, teal: colors.teal, terracotta: colors.terracotta,
  violet: colors.violet, green: colors.green, chili: colors.chili,
};

export default function MagazineScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const cards = useMemo(() => publishableCards(), []);
  const [h, setH] = useState(0);
  const [index, setIndex] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setH(Math.round(e.nativeEvent.layout.height));

  if (cards.length === 0) {
    return (
      <View style={[s.empty, { paddingTop: insets.top + 80 }]}>
        <Text style={s.emptyTitle}>Nothing publishable yet</Text>
        <Text style={s.emptyBody}>
          Cards live in content/cards.json. One appears here only when its status is "ready"
          and its needsVerification list is empty.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.wrap} onLayout={onLayout}>
      {h > 0 && (
        <FlatList
          data={cards}
          keyExtractor={(c) => c.id}
          // One card fills the viewport exactly, so paging alone is enough —
          // mixing pagingEnabled with a mismatched snapToInterval is what made
          // this feel sticky before. No nested scroll view either.
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          getItemLayout={(_, i) => ({ length: h, offset: h * i, index: i })}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.y / h))}
          renderItem={({ item }) => (
            <CardFace
              card={item}
              height={h}
              topInset={insets.top}
              onOpen={() => navigation.navigate('cardDetail', { id: item.id })}
            />
          )}
        />
      )}

      <View style={[s.rail, { top: insets.top + 14 }]}>
        {cards.map((c, i) => (
          <View
            key={c.id}
            style={[
              s.railDot,
              i === index && { backgroundColor: ACCENTS[c.accent] ?? colors.marigold, width: 20 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function CardFace({ card, height, topInset, onOpen }: {
  card: Card; height: number; topInset: number; onOpen: () => void;
}) {
  const accent = ACCENTS[card.accent] ?? colors.marigold;
  const artHeight = Math.round(height * 0.42);

  return (
    <Pressable style={[s.card, { height }]} onPress={onOpen}>
      <View style={{ height: artHeight, overflow: 'hidden' }}>
        <CardArt art={(card.art ?? 'default') as ArtKey} height={artHeight} />
      </View>

      <View style={[s.body, { paddingTop: 20 }]}>
        <View style={s.kickerRow}>
          <Text style={[s.type, { color: accent }]}>{TYPE_LABEL[card.type]}</Text>
          <Text style={s.place}>{flagOf(card.place.code)}  {card.place.name}</Text>
        </View>

        <Text style={s.title} numberOfLines={3}>{card.title}</Text>
        <Text style={s.standfirst} numberOfLines={4}>{card.standfirst}</Text>

        {(card.facts ?? []).slice(0, 2).map((f) => (
          <View key={f.label} style={s.factRow}>
            <Text style={s.factLabel}>{f.label.toUpperCase()}</Text>
            <Text style={s.factValue} numberOfLines={2}>{f.value}</Text>
          </View>
        ))}

        <Text style={[s.tap, { color: accent }]}>Read the full card →</Text>
      </View>

      <View style={[s.topFade, { height: topInset + 8 }]} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  card: { backgroundColor: '#FBF9F4' },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 22 },
  kickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  type: { ...t.mono, fontSize: 10, letterSpacing: 2 },
  place: { ...t.mono, fontSize: 10, letterSpacing: 0.6, color: colors.inkSoft },
  title: { ...t.display, fontSize: 28, lineHeight: 34, color: colors.ink, marginBottom: 10 },
  standfirst: { ...t.body, fontSize: 15, lineHeight: 23, color: colors.inkSoft, marginBottom: 18 },
  factRow: { marginBottom: 10 },
  factLabel: { ...t.mono, fontSize: 9, letterSpacing: 1.2, color: colors.inkFaint, marginBottom: 2 },
  factValue: { ...t.body, fontSize: 13.5, color: colors.ink },
  tap: { ...t.body, fontSize: 13, fontWeight: '600', marginTop: 'auto' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.10)' },
  rail: { position: 'absolute', right: 16, flexDirection: 'row', gap: 4 },
  railDot: { width: 7, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)' },
  empty: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: 28 },
  emptyTitle: { ...t.display, fontSize: 24, color: colors.indigo, marginBottom: 10 },
  emptyBody: { ...t.body, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
});
