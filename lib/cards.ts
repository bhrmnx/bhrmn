import raw from '../content/cards.json';

export type Source = { name: string; url: string };
export type Fact = { label: string; value: string };
export type Day = { day: number; place: string; note?: string };
export type Photo = { url?: string; local?: string; credit: string; creditUrl?: string; source?: string };

export type Card = {
  id: string;
  type: 'discovery' | 'dispatch' | 'itinerary' | 'thisOrThat' | 'voice';
  status: 'draft' | 'ready' | 'published';
  accent: string;
  place: { name: string; country: string; code: string };
  title: string;
  standfirst: string;
  body?: string[];
  facts?: Fact[];
  tags?: string[];
  sources?: Source[];
  art?: string;
  photo?: Photo | null;
  needsVerification: string[];
  staleAfter?: string;
  question?: string;
  optionA?: { name: string; pitch: string; against: string };
  optionB?: { name: string; pitch: string; against: string };
  days?: Day[];
  quote?: string;
  author?: { handle: string; name: string; verifiedTrip: boolean; tripDates: string };
};

export const TYPE_LABEL: Record<Card['type'], string> = {
  discovery: 'DISCOVERY',
  dispatch: 'DISPATCH',
  itinerary: 'ITINERARY',
  thisOrThat: 'THIS OR THAT',
  voice: 'VOICE',
};

/**
 * Only cards that are genuinely publishable reach the feed:
 * status ready, nothing outstanding in needsVerification, not past staleAfter.
 * A drafted or unverified card never renders — that rule is the content bank's
 * whole point, so it is enforced in code rather than left to discipline.
 */
export function publishableCards(today = new Date()): Card[] {
  return (raw as Card[]).filter((c) => {
    if (c.status === 'draft') return false;
    if ((c.needsVerification ?? []).length > 0) return false;
    if (c.staleAfter && new Date(c.staleAfter) < today) return false;
    return true;
  });
}

export function allCards(): Card[] {
  return raw as Card[];
}
