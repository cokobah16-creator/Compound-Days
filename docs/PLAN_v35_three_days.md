# Compound Days — build plan v35: Three days in Palm Court

Status: built as v35-01eaa7a2 on branch `claude/authored-character`. The plan was written against v34b-3a5b01c3; changes made during the build are noted where they apply and summarised below.

**Build status.** Steps 0 and 2 to 7 of section 10 are built, with eleven harnesses passing and reproducing byte for byte, a runtime review, a phone-viewport playthrough of all three days in headless Chromium, and a copy and culture read. Still to do: step 1 (a real-phone run) and step 8's phone pass and five testers. Changes from the plan during the build:
- Day 2 opens with ₦1,700 to ₦1,800 on the shopping path (4.1).
- Three veranda cells are decorable, not four (4.2).
- Day 3 has "Wait on the veranda until six" on Today, and Sleep asks once while the evening is still to come (4.4).
- A new household can invite Ada to the day-1 housewarming, and Finds labels the armchair as from her workshop, so her chair story is set up before day 2.
- The veranda evening is off in online play, which this build does not support.

## 1. What this build is for

Direction: Animal Crossing's cosy neighbourhood life, with Nigerian people, homes, food and social culture. The feeling to aim for: *I like living here. I want to see who is around, find something interesting, and make my home a little better.*

This build is the smallest thing that can prove or disprove that feeling: **one polished compound, three memorable neighbours, fishing, one growing crop, fifteen desirable furnishings, and three enjoyable in-game days.** It does not expand the town. v34 already built most of the activities. v35 tunes them so each one matters, connects them with a morning, an evening and a purse that says no, and adds the measurements that decide whether we expand.

Days stay session-based: no real-world deadline, a clear "Sleep until tomorrow", and a target of 20 to 35 real minutes per day that we measure rather than assume. Everything works alone with the companion. Carrying, cooking and decorating together stay special.

## 2. Where v34b stands (verified in the browser and in Node)

**Reused as is:** the creator, the authored v21 character and 16 wardrobe pieces, the courtyard, Market Road (eight stalls, daily rerolls), two-station cooking, the housewarming, the album, the guided first evening with its timeline, the companion carry, and the Build grid with its veranda row.

**The living-compound loop (v34)** is a six-tab field journal (Today, Almanac, Garden, Finds, People, Home) opened from Tasks or the Menu.
- **Fishing:** Act at the rocks opens a panel: Cast, a bite after 2.2 to 4.4 s of unpaused time, then Reel in. The bite waits, so no fish is lost. The clock is frozen while the panel is open, and a reel costs 9 game minutes. Six species, with a different pool after 18:00, and almanac entries with a size roll. The catch card offers Keep, Sell (₦1,100–2,600) or Release.
- **Crop:** a pepper pot is fixed on the veranda, so there is no planter to buy. Plant (stage 1). A watered day adds a stage overnight. Stage 3 gives three peppers and the pot resets. An unwatered plant waits. As coded, a day-3 harvest needs planting and watering on day 1.
- **Palm Court Finds:** a Market Road stall offering five of the fifteen furnishings per day over a three-day cycle, at 75% of Build price. Day 2 includes the armchair at ₦9,000. Browse anywhere, buy at the stall; purchases go to storage. Pantry fish (₦1,200) and peppers (₦600) sell here.
- **Decorating:** tap-to-cell, rotate, store, cancel and one undo, on a phone. Only the plant and the planter may stand on the veranda row.
- **Neighbours:** Tunde, Mama Nkechi and Ada have three requests each, with one completion per neighbour per day and callback lines. Ada's third request (eight furnishings) unlocks a veranda visit, on day 3 at the earliest and only if her first was done on day 1.
- Also three shells a day, a directions marker, and a Today page with three soft goals.

**v34b bridge fixes (all five harnesses pass: verify-v34 10, verify-feel 20, verify-authored 9, verify-v33 10, verify-bridge 25; every results file reproduces byte for byte):** the float sits in open water and dips at the bite, and the rod is in the posed right hand. Request cards are readable in the talk panel. Tasks opens the evening journal during the guided evening. Undo cannot delete the sofa, and upgrades and starter furniture are guarded. Furniture has its own icons, scroll position is kept, and phone tabs wrap. The pot stands visibly on a reserved cell and shells lie on sand. Near the shore the water no longer drops below the sand, so the float always sits in water. Journal toasts sit below the tab strip. Life UI stays local in online play. A remote shared action or a remote reel ends this device's cast in any phase and shows the shared catch, and when the other player settles that catch first, this device's catch panel closes with a toast saying what they did. A turned piece in a crowded flat keeps its reach point per layout, so the hotspot scan costs under 0.1 ms a frame again. The companion no longer counts as "the player is home".

**Open issues carried in:**
- No real-phone run yet. Everything above was seen in SwiftShader and measured in Node; the shoreline water, the float framing and the journal layout still need a look on the test phones.
- For its 2.4 seconds a journal toast covers the page kicker, and on a phone half the heading.

**Missing for the script:** a purse that says no, a morning event, an evening with the neighbours, outdoor seats, wall colour and floor, day telemetry and rating, sound, and half the dialogue.

## 3. The three days (the script we build to)

A tester should manage this without coaching. Each day ends with "Sleep until tomorrow", a recap naming something waiting **tomorrow**, and a three-face rating. No line names a weekday (the calendar starts on Saturday, so one would contradict the HUD).

**Day 1 — Moving in (exists, tightened).** Create the household, carry the sofa in, meet Mrs. Oyelaran, shop or take the welcome basket, cook jollof together, host the small housewarming, take the photo, choose the gift and tomorrow's plan. At the party Tunde promises a seedling for the veranda pot, and Ada mentions the armchair she sold to Finds. Recap: "Tunde said he would leave something in your pot."

**Day 2 — A morning that is yours.** Tunde's seedling and note are by the pot; Today and the marker point to it. Plant and water it. At the waterfront, cast, watch the float and reel in. Keep one fish for Nkechi, sell the rest from the catch card, and deliver the fish to Nkechi (recipe, ₦1,000). Ada's armchair is a day-2 find at ₦9,000, and the purse is below that on every day-1 path (4.1), so one to six catches decide it. Buy it and place it on the veranda; Tunde and Ada credit the watering and the placing when you next talk. Recap: "The seedling will be taller by morning. Ada wants to hear where the chair went."

**Day 3 — Harvest and company.** The plant grew overnight to stage 2. Water it and it ripens on the spot (4.1). Harvest three peppers. Tell Tunde (₦1,500), take two peppers to Nkechi (₦2,000 and spices), and gather two shells for Ada (₦1,500). Buy a paint at Finds and recolour the front room. From 18:00 comes the **veranda evening** (4.4): Tunde, Nkechi and Ada each say one line that reads what you did, and Ada's is about the chair. Recap: "The lamp and the rug are back at Finds tomorrow. Tunde says the pot will fruit again."

**Day-2 budget.** Walking costs one game minute per real second; panels stop the clock.

| Beat | Clock | Real min (est.) |
|---|---|---|
| Plant, water, read Today | 0 | 1–2 |
| To the rocks, four casts | ~0.75 h | 4–6 |
| Finds, buy, find Nkechi | ~0.5 h | 3–5 |
| Home, place, look | ~0.2 h | 2–4 |
| Wandering, shells, cooking | rest | 8–15 |

The clock is not changed up front. If gate 5 shows a median day under 20 minutes, the clock outside the guided evening slows to half a game minute per second. Every beat maps to a system in section 4, and every system serves a beat.

## 4. Systems: tune and verify (v34 delivered) versus build (new)

### 4.1 Everyday activities and rewards

**Fishing: tune.** Keep the forgiving panel: no reaction window, no lost fish. The bite wait moves to wall-clock time so a phone below 20 fps, where the tick clamps each frame at 0.05 s, cannot stretch it. While the panel is open, Act (E, Enter, touch Act) presses its primary button, so the loop is one button. The world float twitches 0.6 s before the bite, and the bite gets a sound with a visual twin (4.5). Cut: the jetty, weather weights, companion fishing.
*Done when:* a new player keeps or sells a first fish within two minutes of reaching the rocks (gate 7), and the float shows on a phone.

**Crop: one rule change.** The seedling arrives on the day-2 morning, so the pot is empty during the guided evening. Planting gives stage 1, and a watered day adds a stage overnight, as now. New: watering a stage-2 plant ripens it at once. So: day 2 plant and water, stage 2 overnight, day 3 water and harvest. Harvest gives three peppers and resets the same pot; there is no second tray. The Build planter keeps its base behaviour; unifying the two is deferred.
*Done when:* the harness drives that sequence, and the stages read at phone size from the default camera.

**Purse and prices: build.** New households start with ₦6,000, not ₦55,000; old saves are untouched. The welcome basket still fills missing jollof ingredients, so day 1 always completes. Day 2 then starts between ₦1,800 (everything affordable bought at the market; rice and oil cost more than the three cheapest ingredients leave) and ₦6,000 (the basket taken first). With Nkechi's ₦1,000 the basket path is still ₦2,000 short of the armchair and needs one or two catches; the shopping path is ₦6,200 short and needs four to six. `verify-days-v35` drives both paths: one catch and five catches respectively. ₦8,000 was rejected because the basket path plus Nkechi's ₦1,000 reaches ₦9,000 with no catch at all. Fish and pepper prices stay below a good dish (₦2,400–5,800), and request cash stays. Finds never asks for agreement at any price; the companion says one approving line.
*Done when:* the harness runs both day-1 extremes, shows the purse below ₦9,000 after Nkechi's errand on each, and places the armchair by the end of day 2 with the catches each path needs.

**Almanac and market: verify.** Add Nkechi's recipes to the almanac. The Finds cycle is the rotation; vendors, the restorer and market quality are cut.

### 4.2 Home ownership

**Decorating: verify, plus one rule.** The armchair and chairs get an `outdoor` flag for the veranda row. The cell in front of the only opening in the south wall stays a walkway, marked as reserved like the pot's cell. *As built:* the room cell just inside that opening and one veranda cell on the way to the pot are also kept clear, because a piece on either sealed the veranda or the pot off on foot. That leaves three veranda cells to decorate, and the Home grid explains the kept cells in one line.

**Fifteen furnishings: tune.** The fifteen are the v34 Finds list. Each gets a visible use or a neighbour line that reads it (the lamp lights at 18:00; Ada comments on the armchair). Items with neither go into the art brief.

**Wall colour and floor: build.** Three wall colours and two floors, always on offer at Finds (₦1,500–2,500), recolour the existing boxes via `S.home.wall` and `S.home.floor`. Curtains are deferred: the flat has no windows.
*Done when:* on a phone a tester places, turns and undoes the armchair on the veranda and paints the room in under a minute, surviving reload.

### 4.3 Three neighbours

The request chains are the memory and the "give" mechanic; there is no gift button or preference table. Build: about twenty-five lines each in a table keyed by neighbour, day and state, with no repeats inside a day. Writing starts in week one. No line names a weekday, price or item unless the game supplies it.

### 4.4 Days that leave something behind

**Morning event: build.** A table keyed by day and yesterday's log. On day 2 it is the seedling, whatever plan was chosen; the plan only decides which neighbour card leads on Today. On day 3: "It grew overnight", and Nkechi asks after peppers. Days 4 to 6: returning finds, Ada's invitation, fresh shells, an evening-fish hint. It replaces the one-off v33 morning panel but keeps its gift and album line.

**Veranda evening: build** (not the housewarming flow). On day 3 or later, between 18:00 and 22:00, while a human player is in the flat or on the veranda, Tunde, Nkechi and Ada walk from the gate to three standing spots in the open ground just outside the flat, facing the veranda. No veranda cell is reserved for them: the row is one cell deep and six wide, the pot holds one cell and the doorway needs another, so guest cells would leave almost nothing to decorate. The spots are chosen when the evening starts and validated against walls, placed items and the players. Each stands facing the player and gives one line; Ada's reads `lastDecor`, or the armchair if it is placed. Nobody sits: there is no sit clip, and NPC seating is deferred. The companion stands beside the player so the camera stays close, and the camera eases 25% nearer for the first line (*as built:* only while the player and all three guests still fit, which on a phone they rarely do, so the camera holds its fitted distance; the guests stand in a row on the street side of the rail and turn their faces toward the camera). If nobody is home, Today and the marker point there, and a missed evening repeats the next day. *As built:* from the morning of the evening's day, Today offers "Wait on the veranda until six", and Sleep asks once, offering to wait until six, so an early night cannot skip the evening by accident; the evening ends without counting if nobody stays home. Guests bring no props: there is no stool model, and the cooler is not an item. Ada's chain visit stays as a later reward.

**Recap and rating: build.** After sleep comes a recap naming tomorrow's event, then "How was today?" with three faces. After day 3's rating come two optional prompts: "One thing you want for your flat" and "One thing you know about a neighbour".

### 4.5 Companion and sound

The companion carries, cooks, follows and stands with you at the evening. It does not fish, garden or talk for you, and tap-to-cell acts for the human only. Sound is new: five cues (cast, nibble, bite, catch, water), each with a visual twin, because phones are often muted.

## 5. The visual workstream (runs in parallel, gated)

Commit to a soft, rounded, miniature Nigerian neighbourhood: stylised characters with recognisable Black features, expressive faces and well-shaped textured hair; warm plaster, colourful gates, zinc roofs, patterned fabrics and lush plants at one consistent level of detail; a gentler, more elevated camera; soft shadows and clear silhouettes; small animations everywhere.

- **Art brief in week one, before code:** cast, water and react clips for the current v21 base under `CHARACTER.md` (the bridge's arm pose stands in until then); pepper stages on the stand; the armchair and chairs on the veranda; wall and floor swatches.
- **One base, one outfit, approved first.** Silhouette and proportions are signed off on one finished base and outfit before any other outfit or hairstyle is rebuilt; changing proportions after clothing production has already cost two rebuilds. This gate does **not** block v35's clips, which carry over through the contract.
- Try a 30-degree lens with a higher pitch behind a flag, and keep the carry framing.
- Judge visuals on the test phones, not in SwiftShader.

## 6. Engineering plan

- **Wrap, do not edit.** New modules load after `bridge-v34b.js`:
  - `days-v35.js`: log, morning, recap, rating.
  - `evening-v35.js`
  - `tune-v35.js`: purse, crop rule, outdoor flag, paints, wall-clock bite, Act-to-primary, and the copy that must match the new rules: the Garden page and the day-3 Today intro (both say "two watered nights"), Tunde's first request card (shown from day 1 although the seedling now arrives on day 2), and the PLANS33 titles and details, which still offer a ₦1,000 Makers' Yard lesson with seedlings for a balcony planter. The base Tunde lines about planter seedlings stay until the planter and the pot are unified.
  - `audio-v35.js`
  - `dist/data/lines-v35.js`: dialogue.

  Life modules stay byte-identical while the collaborator's line is live. Save fields are additive and lazy, with no version bump.
- **Harness.** The five harnesses stay green. A new `check/verify-days-v35.cjs` drives the whole script with the companion through real actions: both purse paths, the crop sequence, fishing, buying, the armchair on the veranda, paint, deliveries, the evening, ratings and a complete day log. Its results reproduce byte for byte.
- **Captures:** the scratch Playwright scripts (controlled clock), as used for v34b, kept out of the repo; plus reviewer phone screenshots (d2-bite, d2-chair, d3-harvest, d3-evening).
- **Phones:** 30 fps median target. Gate: no `perfDecide34` step-down (under 24 fps for 10 s) during fishing or the evening. All timings are wall-clock.

## 7. Measurement

`days-v35.js` keeps `S.life.days[n] = {startedAt, sleptAt, playedMs, panelMs, rating, want, neighbour, events:[{t,k,a}]}` from day 1 for local and companion households. Online gets no log. Events: wake, morning, at-rocks, cast, bite, catch, plant, water, harvest, buy, sell, place, paint, request, shell, evening, sleep. The Menu copy button copies the evening timeline and all days, and the tester pastes it to the reviewer after each sitting.

Gates before expanding the town, with five new testers:
1. Four of five finish day 2 without coaching: a day-2 `sleptAt` plus the reviewer's note.
2. Day-3 `startedAt` is within 48 hours of day-2 `sleptAt`.
3. Day 3's mean rating is at least day 1's, and three of five give day 3 the top face.
4. Each tester answers both day-3 prompts specifically.
5. The median real day (`playedMs` + `panelMs`) is 20 to 35 minutes.
6. Four of five see the veranda evening on day 3.
7. First catch within two minutes of the first at-rocks event.

## 8. Out of scope for this build

The real-time clock; cross-device play (the static host cannot run it) and accounts; the café and community projects; room expansions; birthdays and the full calendar; the illustrated almanac; Bassey and Oyelaran depth; the jetty; vendors; storage capacity; NPC seating; curtains; a gift button and preference tables; **restoring furniture** (it needs a workbench flow and damaged models, and no beat uses it); **sewing** (the atelier exists and is untouched); **food orders** beyond Nkechi's dish request; sound beyond five cues; town growth.

## 9. Risks

- **Content:** seventy-five lines. The table and tooling come first, in week one.
- **Purse:** ₦6,000 may starve free play on the shopping path. Gate 1 and gate 5 watch for testers stuck below a price or days running long. The fallback raises catch prices rather than the purse, so the armchair still costs at least one catch.
- **Ada's chain:** for most testers the unlock lands on day 4. The evening carries the moment, so the chain is off the critical path.
- **Art:** if the clips slip, the procedural pose ships.
- **Phones:** v34 and v34b have only run in SwiftShader. A real-phone pass comes before testers.
- **The base page:** still one 450 KB file and a wrapper chain. The dialogue data split is the first step toward modules.

## 10. Order of work

0. Art brief and the dialogue table (week one).
1. A real-phone smoke test of v34b: the float and shoreline, the journal layout, decorating by touch, and the frame rate during fishing.
2. Tuning: purse, crop rule, wall-clock bite, Act-to-primary, outdoor seats with the walkway cell, and the crop and plan copy.
3. Day log, recap, rating, copy button.
4. Morning table and the day-2 seedling.
5. Veranda evening (the largest code item).
6. Wall colour and floor.
7. Sound cues.
8. `verify-days-v35`, captures, phone pass, five testers against the gates.

## Changelog (critique findings)

- **Producer, applied:** P1 crop rule. P2 purse and prices. P3 veranda evening, with guests standing in the open ground just outside the flat rather than on reserved veranda cells. P5 day log and gates. P6 day budget, with the clock tied to gate 5. P7 Ada stands. P8 no stool. P9 no second tray. P10 cuts (jetty, weather, second sale point, companion fishing, storage, quality, restorer, courtyard zone, almanac fabrics). P11 paint in the script, curtains deferred. P12 restoring and sewing deferred with reasons; the food order is Nkechi's dish request. P13 no gift or preference system. P14 art brief at step 0; clips do not wait for a new base. P16 visit trigger. P17 twenty-five lines each. P18 the plan choice only orders Today. P19 no migration. P20 walkway cell.
- **Producer, rejected:**
  - P4 WEEK change: weekday prose is removed instead. The loop runs on day ordinals, and shifting WEEK alters old saves for no gain.
  - P15 "no capture automation": the scratch Playwright scripts are used, kept out of the repo.
- **Design, applied:** D1 stage rule. D2 planter ownership (the v34 pot). D3 Ada's trigger, pose and framing. D4 one Act button, wall-clock wait, nibble, sound with twin, no jetty. D6 purse (₦6,000; the critique's ₦25,000 and a later ₦8,000 were both rejected, see section 4.1) and Ada's armchair. D7 tomorrow in the recap, morning rows to day 6. D8 the Finds fifteen with a use or a line. D9 the evening. D10 the seedling regardless of the plan. D13 frame-rate gate. D14 companion role, human-only tap.
- **Design, deferred:**
  - D5 slower clock, until gate 5.
  - D11 drooping and rain-as-watering, until a second crop.
- **Design, rejected:**
  - D4's 800 ms window and lost fish (cosy direction; a phone below 20 fps clamps each frame at 0.05 s, which would also stretch a reaction window).
  - D12 is moot: the v34 request gives a new recipe.
- **Plan review, applied:** the purse and day-2 money paths recomputed from the real prices; Finds never asks for agreement; the risk fallback raises catch prices instead of the purse; the walkway cell and the courtyard staging for the evening; the wall-clock bite wording; crop copy and the guided-evening plan list added to the tuning pass; shore water, toasts and the remote catch moved from open issues to fixed.
- **Engineering:** the critique is absent; the v34b inspection and re-verification inform sections 2 and 6.
