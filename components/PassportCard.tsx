import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { flagOf } from '../lib/trips';
import { colors, type as t } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GOLD = '#A9812E';
const GOLD_LIGHT = '#C9A34E';
const CARD_BG = '#FCFAF5';

export type PassportStats = {
  country_count: number;
  city_count: number;
  continent_count: number;
  trip_count: number;
  days_travelled: number;
};

type Country = { name: string; code: string; continent: string };

export default function PassportCard({
  name, handle, metaLine, travellerId, stats, countries,
}: {
  name: string;
  handle: string;
  metaLine: string;
  travellerId: string;
  stats: PassportStats | null;
  countries: Country[];
}) {
  const [open, setOpen] = useState(false);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  }

  return (
    <View style={s.card}>
      {/* gold foil edge */}
      <Svg width="100%" height={3} style={s.foil}>
        <Defs>
          <LinearGradient id="foil" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={GOLD_LIGHT} />
            <Stop offset="0.55" stopColor={GOLD} />
            <Stop offset="1" stopColor={GOLD_LIGHT} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={3} fill="url(#foil)" opacity={0.85} />
      </Svg>

      <View style={s.top}>
        <View style={s.brand}>
          <View style={s.monogram}>
            <Svg width={11} height={11} viewBox="0 0 12 12">
              <Path d="M6 1l1.3 2.8L10 5l-2.7 1.2L6 11l-1.3-4.8L2 5l2.7-1.2L6 1z" fill={GOLD} />
            </Svg>
          </View>
          <Text style={s.brandName}>bhrmn</Text>
        </View>
        <Text style={s.idLabel}>Traveller ID · {travellerId}</Text>
      </View>

      <View style={s.main}>
        <View style={s.portrait}>
          <Text style={s.initials}>{initials || '—'}</Text>
        </View>
        <View style={s.idText}>
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={1}>{name}</Text>
            <Svg width={14} height={14} viewBox="0 0 15 15">
              <Circle cx={7.5} cy={7.5} r={7.5} fill={GOLD} />
              <Path d="M4.5 7.6l2 2 4-4.4" stroke={CARD_BG} strokeWidth={1.3} fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={s.metaLine} numberOfLines={1}>{metaLine}</Text>
          <Text style={s.cardNumber}>@{handle}</Text>
        </View>
      </View>

      <View style={s.stats}>
        <CStat n={stats?.country_count ?? 0} l="Countries" gold onPress={countries.length ? toggle : undefined} />
        <CStat n={stats?.city_count ?? 0} l="Cities" />
        <CStat n={stats?.continent_count ?? 0} l="Continents" />
        <CStat n={stats?.trip_count ?? 0} l="Trips" last />
      </View>

      {open && (
        <View style={s.drawer}>
          <View style={s.drawerHead}>
            <Text style={s.drawerTitle}>{countries.length} COUNTRIES VISITED</Text>
            <Pressable onPress={toggle}><Text style={s.drawerClose}>Close ✕</Text></Pressable>
          </View>
          <View style={s.grid}>
            {countries.map((c) => (
              <View key={c.code} style={s.gridItem}>
                <Text style={s.flag}>{flagOf(c.code)}</Text>
                <Text style={s.gridName} numberOfLines={1}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function CStat({ n, l, gold, last, onPress }: {
  n: number; l: string; gold?: boolean; last?: boolean; onPress?: () => void;
}) {
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap style={[s.cstat, !last && s.cstatDivider]} onPress={onPress}>
      <Text style={[s.cnum, gold && onPress && s.cnumGold]}>{n}</Text>
      <Text style={s.clbl}>{l}</Text>
    </Wrap>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18, overflow: 'hidden', backgroundColor: CARD_BG,
    borderWidth: 1, borderColor: 'rgba(20,32,44,0.07)',
    shadowColor: '#14202C', shadowOpacity: 0.13, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 3,
  },
  foil: { position: 'absolute', top: 0, left: 0, right: 0 },
  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monogram: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(169,129,46,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  brandName: { ...t.mono, fontSize: 9, letterSpacing: 2.4, color: 'rgba(20,32,44,0.5)' },
  idLabel: { ...t.mono, fontSize: 8, letterSpacing: 1.3, color: 'rgba(20,32,44,0.3)' },
  main: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 18 },
  portrait: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#E4DAC3',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(169,129,46,0.35)',
  },
  initials: { ...t.display, fontSize: 20, color: '#7A6234' },
  idText: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...t.display, fontSize: 20, color: colors.ink, flexShrink: 1 },
  metaLine: { ...t.mono, fontSize: 9.5, letterSpacing: 0.8, color: 'rgba(20,32,44,0.42)', marginTop: 7 },
  cardNumber: { ...t.mono, fontSize: 9, letterSpacing: 1.3, color: 'rgba(20,32,44,0.28)', marginTop: 6 },
  stats: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 16, paddingBottom: 18, marginTop: 4 },
  cstat: { flex: 1, alignItems: 'center' },
  cstatDivider: { borderRightWidth: 1, borderRightColor: 'rgba(20,32,44,0.07)' },
  cnum: { ...t.display, fontSize: 20, color: colors.ink },
  cnumGold: { color: GOLD },
  clbl: { ...t.body, fontSize: 10, color: 'rgba(20,32,44,0.42)', marginTop: 4 },
  drawer: { backgroundColor: '#F6F2E9', borderTopWidth: 1, borderTopColor: 'rgba(20,32,44,0.06)' },
  drawerHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  drawerTitle: { ...t.mono, fontSize: 9.5, letterSpacing: 1.5, color: 'rgba(20,32,44,0.5)' },
  drawerClose: { ...t.mono, fontSize: 9.5, color: GOLD },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 20 },
  gridItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  flag: { fontSize: 14 },
  gridName: { ...t.body, fontSize: 12.5, color: colors.ink, flexShrink: 1 },
});
