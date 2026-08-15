// Travel DNA options, taken from the Travel Identity doc.
// These are self-declared at onboarding. Later they get cross-checked
// against real trip data (profiles.dna_derived) — declared vs. earned.

export type DnaOption = { id: string; label: string; blurb: string };

export const DNA_OPTIONS: DnaOption[] = [
  { id: 'adventure',   label: 'Adventure Traveler',  blurb: 'Treks, climbs, things with a risk briefing' },
  { id: 'backpacker',  label: 'Backpacker',          blurb: 'Long routes, hostels, buses over flights' },
  { id: 'solo',        label: 'Solo Traveler',       blurb: 'Most trips, just you' },
  { id: 'luxury',      label: 'Luxury Traveler',     blurb: 'Fewer trips, done properly' },
  { id: 'food',        label: 'Food Explorer',       blurb: 'You plan the city around the meals' },
  { id: 'wildlife',    label: 'Wildlife Enthusiast', blurb: 'Parks, safaris, up before dawn' },
  { id: 'roadtrip',    label: 'Road Trip Lover',     blurb: 'The drive is the point' },
  { id: 'photo',       label: 'Photographer',        blurb: 'You come back with work, not snapshots' },
  { id: 'history',     label: 'History Buff',        blurb: 'Ruins, museums, the story underneath' },
  { id: 'nomad',       label: 'Digital Nomad',       blurb: 'You work from wherever you are' },
  { id: 'slow',        label: 'Slow Traveler',       blurb: 'One place, long enough to know it' },
];

export const MAX_DNA = 3;
