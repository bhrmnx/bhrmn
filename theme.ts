// Design tokens ported from the bhrmn-feed.html prototype.
// The prototype is ground truth for visual decisions.

export const colors = {
  indigo: '#1C2838',
  sand: '#EFE6D3',
  paper: '#EDE7DA',
  ink: '#14202C',
  inkSoft: '#5C6672',
  inkFaint: '#9AA1A9',
  hairline: '#D8CFBC',

  marigold: '#E8B54A',
  teal: '#2E7D74',
  terracotta: '#C05A3E',
  green: '#4E7A52',
  violet: '#6B5B95',
  chili: '#B33A2B',
};

// Fraunces / Inter / IBM Plex Mono are the locked typefaces. Custom fonts need
// expo-font loading; until that lands these fall back to system faces that
// keep the same serif / sans / mono rhythm.
export const type = {
  display: { fontFamily: undefined as string | undefined, fontWeight: '700' as const, fontSize: 28 },
  body: { fontFamily: undefined as string | undefined, fontSize: 16 },
  mono: { fontFamily: undefined as string | undefined, fontSize: 12 },
};
