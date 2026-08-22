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

### The two-tier sourcing standard

Learned the hard way: the first Malaysia dispatch card said the country had "just"
gone visa-free, cited a newspaper, and omitted the mandatory arrival card. All three
were wrong enough to strand a reader at an airport.

**Tier A — decision-affecting facts.** Visas, permits, entry rules, mandatory
insurance, road and pass closures, fees, anything with an expiry date. These need a
**primary or official source**: a government ministry, an embassy, a border-roads
authority, a park authority, an airline's own newsroom. A travel blog or a newspaper
is corroboration, never the basis. Always state the expiry and set `staleAfter`.

**Tier B — descriptive facts.** Geography, history, culture, what a place feels like.
A reputable reference is fine, but cite it. If a figure varies across sources — a peak
that is 5,033 m in one place and 5,054 m in another — leave the number out rather than
picking one.

**If you cannot source it, cut the sentence.** A card is not worse for saying less.
It is finished the moment removing another word would lose meaning.
3. `dispatch` cards must carry a real `source` with a URL, and they expire. Set
   `staleAfter`.
4. `voice` cards need a real named traveller who actually went. No composites.
5. Write for someone with no trip booked. If a card only makes sense to someone
   already going there, it belongs on a Place page, not the Magazine.
6. Cut the second sentence if the first one already did the work.

## Card photos

Covers use a real photograph when we have one that is properly licensed, and the house
SVG illustration otherwise. The illustration is also the fallback if a photo fails to
load, so a card is never blank.

**Never take an image from Google Images or a web search.** Google is an index, not a
licence. Almost everything there belongs to a photographer or agency, and agencies do
pursue commercial use. One demand letter costs more than this whole beta.

### Where photos may come from

| Source | Licence | Use |
|---|---|---|
| **Unsplash** | Unsplash License — free commercial use, attribution not required | Default for now |
| **Pexels** | Free commercial use | Alternative |
| **Wikimedia Commons** | Varies — check each file, most need attribution | Landmarks, historic sites |
| **Yash's own camera** | Yours | Best where you have been |
| **Traveller photos from verified trips** | Consent at upload | The long-term answer, once the platform has users |

We credit the photographer even when the licence does not require it.

### Adding a photo to a card

1. Find the shot on unsplash.com. Pick something specific, not a generic skyline.
2. Open the photo, right-click the image, copy the image address. It looks like
   `https://images.unsplash.com/photo-<id>?...`
3. Trim the query string and add your own sizing:
   `?auto=format&fit=crop&w=1200&q=70` — keeps the app fast on Indian mobile data.
4. Add to the card:

```json
"photo": {
  "url": "https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=1200&q=70",
  "credit": "Photographer Name / Unsplash",
  "creditUrl": "https://unsplash.com/@handle",
  "source": "unsplash"
}
```

Leave `photo` out entirely and the card falls back to its illustration. That is a
legitimate choice — a strong illustration beats a weak stock photo.

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
