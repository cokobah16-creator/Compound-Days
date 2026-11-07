# Scene backgrounds (v44 "Sleek")

Every panel in the game is now a cream card that sits over a painted scene, like the fishing screen.
`dist/src/sleek-v44.js` picks the scene for whatever panel is open. A scene only shows once its picture
exists and its name is in `SLEEK44.ready` at the top of that file; until then the live 3D world shows
behind a soft scrim, so nothing breaks while pictures are missing.

## How to deliver a picture

- Size: landscape, 16:9, at least 1920 × 1080 (2560 × 1440 is better). PNG, JPG or WebP all work.
- File name: the name in the table, saved as `dist/assets/scenes/<name>.webp` (convert to WebP, quality about 82).
- Then add the name to `SLEEK44.ready` in `dist/src/sleek-v44.js` and run `python3 tools/stamp-build.py`.
- Composition: on a phone the card covers the lower half and the picture is cropped to its left-centre,
  so keep the subject in the **upper half and left-centre**, and keep the bottom 40% calm (water, ground, floor).
- No text, signs with words, logos or watermarks in the picture.

## The shared style (paste before every prompt)

> Warm painterly 3D illustration, soft stylised realism like a still from a cozy animated film, gentle depth of
> field, soft atmospheric haze, rich warm oranges and golds against teal and deep green, lived-in Nigerian
> waterfront town in the spirit of a Lagos lagoon-side neighbourhood: plastered two-storey buildings in faded
> paint, rusty zinc roofs, wooden stilt houses, palm trees, water hyacinth, laundry lines. Characters are Black
> Nigerians in ankara prints, seen from behind or side-on, faces small. No text, no logos, no UI.
> Landscape 16:9. Main subject in the upper-left two thirds; the lower 40% calm and simple.

## The scenes

All scenes have a painting now (v45, from the owner's two batches).

| File | Shows behind |
|------|--------------|
| `title.webp` | The title screen and making your household (the gate with the keke) |
| `courtyard.webp` | The default by day: talking to neighbours, tasks, People and Garden pages, the Menu (the mango courtyard) |
| `evening.webp` | The same panels from six in the evening (the mango courtyard at dusk) |
| `morning.webp` | The Today page (the veranda rail by day) |
| `veranda.webp` | The evening gist at the rail, Ada's bench, Nkechi's and the pot panels (neighbours at the rail at dusk) |
| `board.webp` | The Palm Court noticeboard and its cards |
| `flat.webp` | Inside Flat 3: home, building and furnishing, the sofa (the living room) |
| `kitchen.webp` | The kitchen, cooking and dishes |
| `waterfront.webp` | Fishing, shells, the crab and the catch before five (the pier by day) |
| `waterfront-dusk.webp` | The same from five in the evening (the sunset shore) |
| `market.webp` | Market Road and the pop-up stall (the umbrella stalls) |
| `finds.webp` | Palm Court Finds, the Finds page (the furniture stall) |
| `grill.webp` | Aunty Bisi and Mallam (the gate with the grill) |
| `yard.webp` | The Makers' Yard |
| `atelier.webp` | The Aso-Ebi Atelier: fabric, fit check, the cuts |
| `roof.webp` | The roof terrace |
| `pitch.webp` | Street football |
| `night.webp` | Sleep, the end-of-day recap, past midnight (the gate under the moon) |
| `festival.webp` | Seasonal festivals, the housewarming, the square's stage (the square with bunting) |

### Strips inside the card (3:1, shown under the headline)

| File | Panel |
|------|-------|
| `waterfront-inset.webp` | Fishing, after the cast (the float sits over the painted one) |
| `inset-fishing-ready.webp` | Fishing, before the cast |
| `inset-catch.webp` | The catch |
| `inset-board.webp` | The Palm Court noticeboard |
| `inset-board-yard.webp` | A neighbour's errand and a thing given back (board cards) |
| `inset-suya.webp` | Mallam at the grill |
| `inset-carving.webp` | Talking to Ada, and a carving for Ada |
| `inset-polish.webp` | Ada's shelf |
| `inset-gist.webp` | The evening gist at the rail |

### 1. waterfront.webp (regenerate at full size)
> [shared style] Golden-hour sunset over a wide lagoon. In the left foreground, a boy in a green-and-gold
> geometric ankara shirt and a woven cap sits on a wooden jetty post holding a bamboo fishing rod, seen from
> behind. Stilt houses with laundry lines on the left, a far shore of houses and palms, a cable-stayed bridge
> silhouetted on the right horizon, the sun low and orange, its reflection a golden path on calm water, clumps of
> water hyacinth.

### 2. title.webp
> [shared style] Late-afternoon establishing view of "Palm Court", a small two-storey plastered compound with a
> wide green metal gate standing open onto a sandy street. Two young adults carry an indigo sofa toward the
> gate, seen from behind; a neighbour aunty in a headwrap watches from the balcony. Bougainvillea over the wall,
> a palm tree, a glimpse of the lagoon at the end of the street, warm sun raking across the walls.

### 3. courtyard.webp
> [shared style] Inside the shared courtyard of a Lagos compound in warm afternoon light. A shaded wooden bench
> under a palm, a clothesline with colourful wrappers, plants growing in old paint buckets, a noticeboard with
> pinned paper notes (no readable writing), doors and louvred windows of four flats around the yard, a plastic
> kettle and a stool, a neighbour sweeping in the background. Cozy, lived-in, welcoming.

### 4. flat.webp
> [shared style] Interior of a small newly rented flat at golden hour: an indigo sofa against a plastered wall,
> a standing fan, a borrowed wooden table with two mismatched chairs, a mattress rolled in the corner, a small
> kitchen corner with a two-burner gas stove and pots, louvred windows letting in warm light and palm shadows,
> a woven mat on a terrazzo floor. Homely and a little bare, full of promise.

### 5. market.webp
> [shared style] A busy but cozy market road at late afternoon: wooden stalls under striped umbrellas, a
> secondhand furniture stall with a lamp, a potted plant and a cane chair, a woman with a covered bowl of
> puff-puff on a stool, a suya grill with glowing coals and drifting smoke, a yellow keke parked by the curb,
> hand-painted stall fronts with no readable words, people in colourful prints walking, sunlight through dust.

### 6. yard.webp
> [shared style] An open-sided makers' workshop: a tailoring bench with a treadle sewing machine, bolts of
> ankara and aso-oke cloth on shelves, a dress form in a half-finished aso-ebi outfit, carpentry tools and a
> half-built chair on a workbench, wood shavings, beams of warm light through a zinc roof, a ceiling fan.

### 7. roof.webp
> [shared style] A flat roof terrace at dusk: black water tanks, a few plastic chairs and a low table, string
> lights just switching on, potted plants, a clothesline, and a wide view over rusty zinc rooftops to the
> lagoon and the bridge on the horizon under a pink and orange sky.

### 8. pitch.webp
> [shared style] A sandy street football pitch in the evening: goalposts made of stones and flip-flops, a worn
> leather ball, children and adults playing barefoot seen side-on and from behind, a single floodlight on a
> pole and the orange sky behind, low walls painted in faded colours, spectators on a bench.

### 9. morning.webp
> [shared style but cooler] Early morning in the same courtyard: soft blue and pale gold light, mist over the
> lagoon beyond the wall, steam rising from a kettle on a charcoal stove, a rooster on the wall, a window being
> opened, dew on plants in paint buckets, the day just beginning, calm and hopeful.

### 10. night.webp
> [shared style, night] The compound at night: a full moon over the lagoon, a few warm windows lit, a single
> bulb over a doorway, the bench empty, laundry still on the line, a cat on the wall, deep blue sky with stars,
> quiet and safe.

### 11. festival.webp
> [shared style] A compound festival at dusk: lanterns strung along the balcony rail, one long table made of
> every flat's table pushed together, covered with jollof rice, puff-puff and drinks, neighbours in matching
> aso-ebi dancing and laughing (seen side-on and from behind), a speaker and a small band, warm golden light,
> confetti-like flower petals. Joyful and cozy.
