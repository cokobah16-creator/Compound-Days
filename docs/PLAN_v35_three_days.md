# Compound Days — build plan v35: Three days in Palm Court

Status: draft for discussion. Base: branch `claude/authored-character`, build v34a-21291430.

## 1. What this build is for

Direction: Animal Crossing's cosy neighbourhood life, with Nigerian people, homes, food and social culture. The feeling to aim for: *I like living here. I want to see who is around, find something interesting, and make my home a little better.*

This build is the smallest thing that can prove or disprove that feeling: **one polished compound, three memorable neighbours, fishing, one growing crop, about fifteen desirable furnishings, and three enjoyable in-game days.** It does not expand the town. It makes the ordinary activities satisfying on their own, connects them so each one feeds the home, a collection or a relationship, and gives the next visit something to look forward to.

Days stay session-based: a relaxed clock, a clear "sleep until tomorrow", and a target of 20 to 35 minutes per day. Everything works alone with the companion; carrying, cooking and decorating together stay special.

## 2. Where v34a stands (facts from the code)

What exists and is reused as is:

- A household creator, the authored character and 16 wardrobe pieces, the courtyard, Market Road with eight stalls and daily price rerolls, two-station cooking with five recipes, the housewarming, the photo album, the guided first evening with its timeline log, the companion, and the Build grid (6 by 4 cells plus a balcony row).

What exists but is too thin to carry the feeling:

- **Fishing** is one hotspot on the waterfront rocks that rolls a 45 percent chance, costs 0.7 hours and drops a generic "fish" into the basket. No cast, no bite, no species, no sale.
- **Gardening** is two disconnected things: the balcony planter pays one pepper per morning by itself, and the square's bed grows a red fruit over three days that can never be harvested. Nothing can be watered, although Tunde talks about it.
- **The catalogue** has 22 items, 15 buyable, 12 with real models. Placement is walk-and-face with no rotation, no undo, no tap-to-cell. A picked-up item lives only in an unsaved ghost and is lost on reload. Stored bed, dining and kitchen can be bought twice. Nothing can be placed on the veranda or in the courtyard. There are no wall colours, floors or curtains.
- **Neighbours** have one affection number each, fixed standing spots per time slot, and 44 lines of dialogue written inline in code. Nobody remembers a gift, visits the flat or comments on a change. Mama Nkechi never moves. The noticeboard is three fixed cards.
- **Earning** is selling cooked dishes at the pop-up and one aso-ebi order. Fish and peppers cannot be sold.
- **Days** roll over correctly (market reroll, energy, weather, planter), but the end-of-day recap repeats one of five lines and nothing is left for you in the morning.

Thirty-one props already exist as glTF models, several of which are not yet catalogue items (wooden bench, plastic chair, terracotta and bucket plants, lantern, radio, television, cooler, market basket, water container, wash basins, mortar and pestle). That is most of the fifteen furnishings without new modelling.

## 3. The three days (the script we build to)

The sequence below is what a tester should be able to do without coaching. Each day ends at the bed with "Sleep until tomorrow" and a short recap that names what will be waiting.

**Day 1 — Moving in (exists, tightened).** Create the household, carry the sofa in, meet Mrs. Oyelaran, shop, cook jollof together, host the small housewarming, group photo, first gift, choose tomorrow's plan. Tunde mentions he has seedlings for your balcony. Recap: "Tunde said he would leave something for you."

**Day 2 — A morning that is yours.** Pepper seedlings are at the door with a note from Tunde. Plant them in the balcony planter and water them (visible stage 1). Walk to the waterfront: the cast, the bite, the catch. Sell the fish at the fish stall or the pop-up toward the woven chair you saw in the catalogue. Mama Nkechi asks for tomatoes for her Friday jollof; deliver them and she gives you her jollof base recipe. Back home, buy and place the chair on the veranda. Ada stops by on her way from the Yard, sits in the chair, and says something about it. Recap: "The seedlings need water in the morning. Ada said she might bring a stool."

**Day 3 — Harvest and company.** Water the peppers: stage 3, harvest three ata rodo. A plant vendor is on Market Road today with two plants and a bucket plant for the veranda. Cook with your own peppers; the dish is marked "from the balcony" in the almanac. Tunde comes to see the planter and leaves a second seedling tray. The day ends with a small courtyard evening: Nkechi brings a cooler, Ada brings the stool, the neighbours use what you placed. Recap: "Market day is Saturday. Dayo's fabrics will be in."

Everything in the script maps to a system below. Nothing in the script needs a system that is not listed.

## 4. Systems, with acceptance criteria

### 4.1 Everyday activities and rewards

**Fishing.** Two spots: the waterfront rocks (exists) and the jetty. Press Act to cast: the line and float are visible. A bite comes after a readable wait (1 to 4 seconds), the float dips with a sound and a small splash, and Act within a short window lands the catch; miss it and the fish is gone, no cost but time. A fish table of six species (tilapia, catfish, croaker, crayfish, snapper and a junk item such as a boot) with weights by time of day and weather, a size roll, and a first-catch almanac entry. Catches are named basket items; the fish stall and the pop-up buy them by species and size; "fish" recipes use any species. Companion can fish beside you.
Done when: a new player casts, bites and lands a fish within two minutes with no instruction beyond the on-screen prompt; the catch appears in the almanac and sells for a visible amount.

**One crop: ata rodo peppers.** Seedlings come from Tunde (the crate at the gate becomes the seedling tray). Plant in the balcony planter or the square bed. Growth has four visible stages driven by watering: a watered morning advances one stage, an unwatered morning does not; a watering can is a hotspot beside the planter and at the square tap. Harvest at stage 3 gives three peppers to the pantry and resets to stage 1 with a second tray. Tunde comments on the state of the plants when he passes.
Done when: the stages are visibly different at phone size, and the harvest lands in a dish within the same session.

**Earning.** Sell fish and peppers at the stalls and the pop-up; Nkechi's tomato order and its recipe reward; furniture rewards from Ada and Tunde that appear in Build storage with a note. Prices tuned so one good fishing hour plus one sale buys one mid-price item, so the chair is reachable on day 2.

**The Compound Almanac.** A tab on the album panel: fish, crops, recipes, fabrics, furnishings seen, each with a short line and the day it was first found. Plain text and small thumbnails in v35; the illustrated version is the art team's later deliverable.

**Market rotation.** Keep the daily price reroll; make the quality note matter (soft tomatoes cost a little quality in cooking). Add two visiting vendors with their own days: the plant seller (plants, bucket plant, seedling tray) and the furniture restorer (one or two catalogue items at a discount). Dayo's fabrics get a market day.

### 4.2 Home ownership

**Decorating that feels good.** Rotation in four directions, an undo for the last action, tap-to-cell on phones with the ghost preview kept, pick-up that survives reload, and one placement rule set shared by the flat, the veranda and the courtyard edge. Fix the double-buy of replaced items and the "bed cannot go where the mattress is" rule.

**The veranda.** A second placement zone along the front of Flat 3 for outdoor items: bench, plastic chairs, plants, lantern, cooler. Neighbours who visit use what is there.

**Fifteen desirable furnishings, all with models.** Curated from the existing models plus a short list of new ones:
- existing catalogue with models: indigo sofa, bed frame, dining table, chairs, standing fan, potted plant, woven armchair, coffee table, wardrobe, TV console, kitchen upgrade;
- existing props promoted to items: wooden bench, plastic chair set, terracotta plant, bucket plant, lantern, radio, television, cooler, market basket;
- new models needed: rug, bookshelf, floor lamp, wall art frame, speaker, balcony planter (these are primitives today).
The final fifteen are chosen so that every one is visibly different from the others at phone size and at least five are outdoor.

**Wall colour, floor and curtains.** Three wall colours, three floors and two curtain fabrics as cheap "paint" items that recolour the flat's surfaces. Visible, immediate, and the first thing testers will try.

**Storage and room upgrades.** Storage is a list already; give it a capacity and a wardrobe-based upgrade. Room upgrades (a wider flat) stay out of this build.

Done when: a tester places, rotates, undoes and moves an item on the veranda in under a minute on a phone, and the change survives a reload.

### 4.3 Three neighbours, deepened

Tunde, Mama Nkechi and Ada, because the three-day script needs exactly them. Mr. Bassey and Mrs. Oyelaran keep their current behaviour.

Each gets, as data rather than code:
- a routine: where they are in each slot, with a visible activity (Tunde watering, Nkechi at the shop then on the way home with the cooler, Ada at the Yard then the courtyard);
- preferences: favourite foods and a disliked one, two interests;
- memory: a small list of facts about you (gifts given, dishes served, items placed) that lines can read;
- a visit: they come to Flat 3 or the veranda once in the three days, stand, look at one placed item and say one line about it;
- about forty lines each for the three days, written in a dialogue table keyed by neighbour, context and memory, with no repeats inside a day.

Done when: a tester can name a fact about each of the three after day 3, and the "Ada noticed the chair" moment lands in the browser capture.

### 4.4 Days that leave something behind

Keep the session day and "Sleep until tomorrow". Add the morning: when a day starts, one thing is waiting (a tray at the door, a note on the board, a vendor in town), chosen from a small table by day and by what you did. The end-of-day recap names it. The noticeboard shows today's notices and tomorrow's. After each day's recap, a single question for testers: "How was today?" with three faces, stored in the timeline log.

### 4.5 The companion

Fishes beside you, waters when you water, carries one end, cooks its station, and comes to the courtyard evening. It does not talk to neighbours for you.

## 5. The visual workstream (runs in parallel, gated)

Commit to a soft, rounded, miniature Nigerian neighbourhood: stylised characters with recognisable Black features, expressive faces and well-shaped textured hair; warm plaster, colourful gates, zinc roofs, patterned fabrics and lush plants at one consistent level of detail; a gentler, more elevated camera; soft shadows and clear silhouettes; small animations everywhere.

Rules for this build:
- **One base, one outfit, approved first.** The character silhouette and proportions are signed off on a single finished base and outfit before any other outfit or hairstyle is rebuilt. Changing proportions after clothing production has already cost us two rebuilds.
- Character and environment assets are designed together, against one reference sheet, not shader changes alone.
- The code contract for a new base is in `CHARACTER.md`: 27 joints in the hero order, byte-identical inverse bind matrices across wardrobe pieces, material-named body primitives, hair in head space, eight clips. This build adds three clips to the contract: water, cast, react.
- Camera: try a 30-degree lens with a higher pitch for faces and furniture selection; keep the carry framing.
- All visual work is tested on the two or three phones the timeline testers use, not on a desktop.

## 6. Engineering plan

- **Modules, not edits to the base page.** One module per system under `dist/src`: `fishing-v35.js`, `garden-v35.js`, `home-v35.js`, `people-v35.js`, `almanac-v35.js`, `days-v35.js`, each wrapping base functions the way `feel-v34.js` does. Data tables (fish, items, dialogue, vendors, morning events) live in `dist/data/*.js` so writers can edit them without touching logic.
- **Save shape.** Bump the save version and add a migration step on load (none exists today) for the new fields: fish and pepper items, plant stages, item rotation, memory lists, almanac, morning events, the day ratings.
- **Base bugs fixed in passing** (all found by the readers, with line references in the map): ghost loss on reload, replaced-item double buy, replace-cell fit, the unreachable Ada stool branch, the write-only flags, the order-dependent rice-and-oil rebate.
- **Harness.** `check/verify-living.cjs` drives the three days with the companion using the real actions, the way `verify-v33.cjs` drives the first evening: plant, water, grow, harvest, cast, bite, catch, sell, buy and place with rotation, undo, visit and comment, morning event, ratings in the log. Browser captures of each day's key moment (seedlings at the door, the bite, Ada in the chair, the harvest) are part of the review.
- **Phones.** The performance floor from v34 stays; new props must be batched and the courtyard evening must hold 30 fps on the test phones with the people culling that exists.

## 7. Measurement

Extend the timeline log with activity events (cast, catch, water, harvest, sell, place, visit) and the three-face day rating, all in the Copy evening timeline text. Gates before expanding the town:
- four of five new testers finish day 2 without coaching;
- testers voluntarily start day 3 in the same sitting, or return for it within two days;
- the day ratings trend up from day 1 to day 3;
- each tester can name one thing they want for their flat and one thing about a neighbour.

## 8. Out of scope for this build

Real-time clock, cross-device visits and accounts, the café and community projects, room expansions, birthdays and the full calendar, the illustrated almanac art, Bassey and Oyelaran depth, sound beyond the fishing and watering cues, town growth.

## 9. Risks

- **Content volume.** Three neighbours at forty lines each is 120 lines for three days; the dialogue table and its tooling matter more than any feature. Writing starts in week one.
- **Models.** Six new furnishing models and four crop stages are on the art path; if they slip, the build ships with primitives for those and the furnishing count stays at fifteen by leaning on existing props.
- **The base page.** Every build adds a wrapping module to one 450 KB file; this is still workable for v35, but the save migration step and the data-table split are the first steps toward a real module layout, and should be done now.
- **Phone performance** with more props on the veranda and a courtyard evening; measured, not assumed.

## 10. Order of work

1. Decorating fixes and the veranda zone (unblocks everything the script places).
2. Fishing with the fish table and sale; one crop with watering and stages.
3. The fifteen furnishings and the paint items.
4. Dialogue tables and the three neighbours' routines, memory and visits.
5. Mornings, notices, recap and the day rating.
6. The almanac tab, vendors, market quality.
7. Harness, phone pass, timeline review with testers.

Sizes: 1 and 2 are each about the size of the v34 slice; 3 depends on art; 4 is mostly writing; 5 and 6 are small; 7 is continuous.
