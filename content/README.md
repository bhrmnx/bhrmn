# Bhrmn content bank

The Magazine tab reads `cards.json`. No CMS, no database — a file in the repo is
the cheapest thing that works, and it version-controls the editorial history for free.

## Why this exists

A social graph of users who take ~3 trips a year produces well under one post a day.
An empty feed on day one is the single most likely way this product dies. Editorial
content works with zero other users on the platform, which is exactly what a private
beta needs.

**Target: 60 cards banked before the first invite goes out.** At 5 a week that is
12 weeks of runway.

## The five card types — ratios are locked

| Type | Share | What it is |
|---|---|---|
| `discovery` | 50% | A place the reader had not thought about. The backbone. |
| `dispatch` | 20% | Something happening *now* that changes a travel decision. |
| `itinerary` | 10% | A real route someone actually travelled, day by day. |
| `thisOrThat` | 10% | Two comparable places, and how people who went to both split. |
| `voice` | 10% | One traveller, one strong opinion, attributed. |

Cards tap through to a full overlay page. They never expand in place.

## Editorial rules

1. **Never invent a fact, a quote, or a person.** This is a verified-identity
   platform. Fabricated editorial poisons the thing the whole product sells.
2. Anything time-sensitive — prices, seasons, permits, opening hours — goes in
   `needsVerification` until checked against a primary source. Do not publish a card
   with a non-empty `needsVerification` array.
3. `dispatch` cards must carry a real `source` with a URL, and they expire. Set
   `staleAfter`.
4. `voice` cards need a real named traveller who actually went. No composites.
5. Write for someone with no trip booked. If a card only makes sense to someone
   already going there, it belongs on a Place page, not the Magazine.
6. Cut the second sentence if the first one already did the work.

## Schema

```
id                unique slug
type              discovery | dispatch | itinerary | thisOrThat | voice
status            draft | ready | published
place             { name, country, code }   ISO-3166 alpha-2
title             the hook. under ~60 chars
standfirst        one sentence under the title
body              array of paragraphs
facts             [{ label, value }]  shown as a strip
tags              array
accent            marigold | teal | terracotta | violet | green | chili
needsVerification array of strings — must be empty before status: ready
```

Type-specific: `dispatch` adds `source` + `staleAfter`. `itinerary` adds `days[]`.
`thisOrThat` adds `optionA` / `optionB` / `question`. `voice` adds `quote`,
`author`, `rating`.
