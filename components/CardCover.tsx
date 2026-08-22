import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import CardArt, { type ArtKey } from './CardArt';
import { colors, type as t } from '../theme';

export type Photo = {
  url?: string;          // remote (Unsplash, Pexels, later a traveller upload)
  local?: string;        // key into LOCAL_PHOTOS below, for images shipped in the app
  credit: string;        // photographer name
  creditUrl?: string;    // link to their profile / the photo page
  source?: string;       // 'unsplash' | 'pexels' | 'own' | 'traveller'
};

/**
 * Bundled images must be static require() calls — Metro resolves them at build
 * time, so a path built from a string will not work.
 */
const LOCAL_PHOTOS: Record<string, any> = {
  'kl-petronas': require('../assets/cards/kl-petronas.jpg'),
  'seychelles-mahe': require('../assets/cards/seychelles-mahe.jpg'),
  'muscat-muttrah': require('../assets/cards/muscat-muttrah.jpg'),
};

/**
 * A card cover is a real photograph when we have one that is properly licensed,
 * and the house illustration when we do not. The illustration is also the
 * fallback if the photo fails to load, so a card is never blank.
 *
 * Photos must come from a source that licenses commercial use — Unsplash,
 * Pexels, Yash's own camera, or (later) a traveller's verified trip.
 * Never from an image search.
 */
export default function CardCover({
  photo, art, height,
}: { photo?: Photo | null; art: ArtKey; height: number }) {
  const [failed, setFailed] = useState(false);

  const source =
    photo?.local && LOCAL_PHOTOS[photo.local] ? LOCAL_PHOTOS[photo.local]
    : photo?.url ? { uri: photo.url }
    : null;

  if (!source || failed) {
    return (
      <View style={{ height, overflow: 'hidden' }}>
        <CardArt art={art} height={height} />
      </View>
    );
  }

  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Image
        source={source}
        style={{ width: '100%', height }}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
      <View style={s.scrim} />
      {!!photo?.credit && (
        <Text style={s.credit} numberOfLines={1}>
          {photo.credit}
          {photo.source === 'traveller' ? ' · verified trip' : ''}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  scrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 56,
    backgroundColor: 'rgba(20,32,44,0.28)',
  },
  credit: {
    position: 'absolute', left: 14, bottom: 10,
    ...t.mono, fontSize: 9, letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.85)',
  },
});
