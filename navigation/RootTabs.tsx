import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProfileStack from './ProfileStack';
import EmptyTab from '../screens/EmptyTab';
import { MagazineIcon, FollowingIcon, ExperiencesIcon, ProfileIcon } from './TabIcons';
import { colors, type as t } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, (p: { color: string }) => JSX.Element> = {
  magazine: MagazineIcon,
  following: FollowingIcon,
  experiences: ExperiencesIcon,
  profile: ProfileIcon,
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const Icon = ICONS[route.name];
        const color = focused ? colors.sand : 'rgba(239,230,211,0.55)';
        return (
          <Pressable
            key={route.key}
            style={s.tab}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <Icon color={color} />
            <Text style={[s.label, { color }]}>{route.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const MagazineScreen = () => (
  <EmptyTab
    kicker="MAGAZINE"
    title="The world, edited"
    body="The reason to open Bhrmn on a day with nothing booked. Hand-curated cards about places worth knowing about — not an algorithmic feed."
    bullets={[
      'Discovery — a place you had not thought about (50% of cards)',
      'Dispatch — what is happening somewhere right now (20%)',
      'Itinerary — a real route someone actually travelled (10%)',
      'This or That — two places, and where people who went to both landed (10%)',
      'Review / Voice — one traveller, one strong opinion (10%)',
    ]}
  />
);

const FollowingScreen = () => (
  <EmptyTab
    kicker="FOLLOWING"
    title="People you travel near"
    body="Trips from people you follow, and the Live Rail — travellers currently passing through your home city. Location stays city-level, and ghost mode is on until you turn it off."
    bullets={[
      'Trip posts from people you follow',
      'Live Rail — who is in your city this week',
      'Travel life events, not just photo dumps',
    ]}
  />
);

const ExperiencesScreen = () => (
  <EmptyTab
    kicker="EXPERIENCES"
    title="Things worth doing"
    body="Curated activities per destination, each carrying social proof from your own network — who you know has actually done this. Not a booking engine."
    bullets={[
      'Activities with real prices and duration',
      'Proof from your network — three people you know did this',
      'Fallback to a count when nobody in your network has',
    ]}
  />
);

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.paper, card: colors.indigo },
};

export default function RootTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="magazine"
        screenOptions={{ headerShown: false }}
        tabBar={(p) => <TabBar {...p} />}
      >
        <Tab.Screen name="magazine" component={MagazineScreen} />
        <Tab.Screen name="following" component={FollowingScreen} />
        <Tab.Screen name="experiences" component={ExperiencesScreen} />
        <Tab.Screen name="profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(19,28,41,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,230,211,0.08)',
    paddingTop: 12,
  },
  tab: { alignItems: 'center', gap: 5, flex: 1 },
  label: {
    ...t.mono,
    fontSize: 10,
    letterSpacing: 0.3,
    ...Platform.select({ ios: {}, android: { includeFontPadding: false } }),
  },
});
