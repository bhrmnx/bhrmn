import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * Flat illustrated card covers, in the same language as the bhrmn-feed.html
 * prototype: 390x200 viewBox, geometric shapes, house palette. Illustration
 * rather than photography — it always loads, never needs licensing, and keeps
 * the Magazine looking like one publication instead of a stock-photo feed.
 */
export type ArtKey = 'ziro' | 'kazbegi' | 'passport' | 'himalaya' | 'island' | 'default';

export default function CardArt({ art, height = 200 }: { art: ArtKey; height?: number }) {
  const A = ARTS[art] ?? ARTS.default;
  return (
    <Svg width="100%" height={height} viewBox="0 0 390 200" preserveAspectRatio="xMidYMid slice">
      {A}
    </Svg>
  );
}

const ARTS: Record<ArtKey, React.ReactNode> = {
  // Ziro — paddy terraces in a pine bowl, morning haze
  ziro: (
    <G>
      <Defs>
        <LinearGradient id="zsky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DCE7D4" />
          <Stop offset="1" stopColor="#F1EEE0" />
        </LinearGradient>
      </Defs>
      <Rect width="390" height="200" fill="url(#zsky)" />
      <Circle cx="72" cy="46" r="20" fill="#F5E3B8" opacity={0.9} />
      <Path d="M0 96 L58 56 L104 96 Z" fill="#8CA483" opacity={0.55} />
      <Path d="M78 100 L140 48 L198 100 Z" fill="#6E8A66" opacity={0.7} />
      <Path d="M170 98 L244 52 L318 98 Z" fill="#5A7455" opacity={0.75} />
      <Path d="M290 100 L344 62 L390 100 Z" fill="#6E8A66" opacity={0.6} />
      <Rect y="98" width="390" height="102" fill="#93A96B" />
      <Path d="M0 118 Q195 108 390 118 V200 H0 Z" fill="#7E9659" />
      <Path d="M0 146 Q195 134 390 146 V200 H0 Z" fill="#6B8349" />
      <G stroke="#4E7A4C" strokeWidth={2} opacity={0.5}>
        <Path d="M20 132 H370" /><Path d="M20 160 H370" /><Path d="M20 184 H370" />
      </G>
      <G fill="#3E5F3C">
        <Path d="M40 98 l7 -26 7 26 z" /><Path d="M62 98 l6 -20 6 20 z" />
        <Path d="M330 98 l7 -24 7 24 z" /><Path d="M352 98 l6 -18 6 18 z" />
      </G>
    </G>
  ),

  // Kazbegi — lone church on a ridge, big peak behind
  kazbegi: (
    <G>
      <Defs>
        <LinearGradient id="ksky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9FC0CE" />
          <Stop offset="1" stopColor="#E4EAE6" />
        </LinearGradient>
      </Defs>
      <Rect width="390" height="200" fill="url(#ksky)" />
      <Path d="M120 168 L232 34 L344 168 Z" fill="#7E8B95" />
      <Path d="M232 34 L268 77 L248 84 L232 72 L214 86 L196 77 Z" fill="#F4F1EA" />
      <Path d="M0 176 L86 92 L172 176 Z" fill="#5F6E79" />
      <Path d="M300 176 L360 118 L390 176 Z" fill="#6A7883" />
      <Rect y="168" width="390" height="32" fill="#4C5A50" />
      <Path d="M0 168 Q195 154 390 168 V200 H0 Z" fill="#3F4C43" />
      <G>
        <Rect x="146" y="126" width="30" height="30" fill="#E8E1D2" />
        <Path d="M146 126 h30 l-15 -14 z" fill="#C9A34E" />
        <Rect x="158" y="98" width="7" height="30" fill="#E8E1D2" />
        <Path d="M154 98 h15 l-7.5 -12 z" fill="#C9A34E" />
        <Rect x="159" y="140" width="5" height="16" fill="#8C8577" />
      </G>
    </G>
  ),

  // Dispatch — passport, stamp, boarding arc
  passport: (
    <G>
      <Rect width="390" height="200" fill="#1C2838" />
      <G opacity={0.14} stroke="#EFE6D3" strokeWidth={1}>
        <Circle cx="300" cy="60" r="54" fill="none" />
        <Circle cx="300" cy="60" r="38" fill="none" />
        <Path d="M246 60 H354 M300 6 V114" />
      </G>
      <Path d="M20 168 Q140 96 330 44" stroke="#E8A33D" strokeWidth={2} fill="none" strokeDasharray="6 7" />
      <Path d="M322 36 l20 8 -18 12 z" fill="#E8A33D" />
      <G>
        <Rect x="42" y="66" width="92" height="118" rx="8" fill="#2C3A4C" />
        <Rect x="42" y="66" width="92" height="118" rx="8" fill="none" stroke="#C9A34E" strokeWidth={1.5} />
        <Circle cx="88" cy="112" r="19" fill="none" stroke="#C9A34E" strokeWidth={1.5} />
        <Path d="M69 112 H107 M88 93 V131" stroke="#C9A34E" strokeWidth={1} />
        <Rect x="68" y="146" width="40" height="3" fill="#C9A34E" opacity={0.8} />
        <Rect x="74" y="156" width="28" height="3" fill="#C9A34E" opacity={0.5} />
      </G>
      <G transform="rotate(-14 196 128)" opacity={0.9}>
        <Rect x="152" y="104" width="88" height="48" rx="4" fill="none" stroke="#7FB89C" strokeWidth={2} />
        <Path d="M164 128 h64" stroke="#7FB89C" strokeWidth={2} />
        <Circle cx="196" cy="118" r="6" fill="none" stroke="#7FB89C" strokeWidth={2} />
      </G>
    </G>
  ),

  // This or That — two ranges, split down the middle
  himalaya: (
    <G>
      <Rect width="390" height="200" fill="#E9E3D4" />
      <Rect width="195" height="200" fill="#DCD6C6" />
      <Path d="M-10 170 L60 74 L130 170 Z" fill="#8C6A55" />
      <Path d="M60 74 L86 108 L72 114 L60 102 L48 116 L34 108 Z" fill="#F4F1EA" />
      <Path d="M96 170 L150 106 L204 170 Z" fill="#A07E63" opacity={0.85} />
      <Path d="M188 170 L252 88 L316 170 Z" fill="#6E7F8C" />
      <Path d="M252 88 L276 120 L262 126 L252 114 L240 128 L228 120 Z" fill="#F4F1EA" />
      <Path d="M292 170 L348 108 L400 170 Z" fill="#5C6C79" opacity={0.9} />
      <Rect y="170" width="390" height="30" fill="#C6BCA6" />
      <Rect x="193" width="4" height="200" fill="#EFE6D3" opacity={0.55} />
      <Circle cx="195" cy="100" r="17" fill="#EFE6D3" />
      <Path d="M188 100 h14 M195 93 v14" stroke="#8C7A5C" strokeWidth={2} strokeLinecap="round" />
    </G>
  ),

  // Voice / islands — granite boulders, shallow water
  island: (
    <G>
      <Rect width="390" height="200" fill="#7FC3CE" />
      <Rect y="118" width="390" height="82" fill="#4E9AA8" />
      <Path d="M0 118 Q195 100 390 118 V200 H0 Z" fill="#3D8391" />
      <Circle cx="322" cy="44" r="24" fill="#F5E3B8" />
      <Path d="M0 158 Q90 142 190 158 T390 156 V200 H0 Z" fill="#E7DCC2" />
      <G fill="#9C8F7B">
        <Path d="M40 158 q22 -34 46 -2 z" /><Path d="M96 158 q16 -22 32 -1 z" />
        <Path d="M262 156 q26 -40 54 -2 z" />
      </G>
      <G>
        <Path d="M196 158 v-40" stroke="#6B4E32" strokeWidth={5} />
        <Path d="M196 118 q-24 -10 -34 4 M196 118 q24 -10 34 4 M196 118 q-10 -22 4 -28 M196 118 q14 -18 26 -8"
          stroke="#3E7A4C" strokeWidth={5} fill="none" strokeLinecap="round" />
      </G>
    </G>
  ),

  default: (
    <G>
      <Rect width="390" height="200" fill="#EFE6D3" />
      <Path d="M0 140 Q98 96 195 140 T390 138 V200 H0 Z" fill="#C9BFA6" />
      <Circle cx="300" cy="56" r="22" fill="#E8A33D" opacity={0.85} />
    </G>
  ),
};
