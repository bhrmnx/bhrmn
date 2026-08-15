import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// Icon paths ported verbatim from bhrmn-feed.html — the prototype is ground truth.
type P = { color: string; size?: number };

export const MagazineIcon = ({ color, size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 5C8 3.5 5.5 3.2 3 4v11c2.5-0.8 5-0.5 7 1 2-1.5 4.5-1.8 7-1V4c-2.5-0.8-5-0.5-7 1z"
      stroke={color} strokeWidth={1.4} strokeLinejoin="round"
    />
    <Path d="M10 5v12" stroke={color} strokeWidth={1.4} />
  </Svg>
);

export const FollowingIcon = ({ color, size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx={7} cy={7} r={3} stroke={color} strokeWidth={1.4} />
    <Circle cx={15} cy={8} r={2.4} stroke={color} strokeWidth={1.4} />
    <Path d="M2 17c0-3 2.5-5 5-5s5 2 5 5" stroke={color} strokeWidth={1.4} />
    <Path d="M12.5 12.5c2 0 4.5 1.6 4.5 4.5" stroke={color} strokeWidth={1.4} />
  </Svg>
);

export const ExperiencesIcon = ({ color, size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.4}>
    <Circle cx={10} cy={10} r={7.6} />
    <Path d="M13.2 6.8l-2 4.4-4.4 2 2-4.4z" strokeLinejoin="round" />
  </Svg>
);

export const ProfileIcon = ({ color, size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={7} r={3.4} stroke={color} strokeWidth={1.4} />
    <Path d="M3 17c1-3.5 4-5.5 7-5.5s6 2 7 5.5" stroke={color} strokeWidth={1.4} />
  </Svg>
);
