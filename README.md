# Compound Days — Waterside

Build **v34a**, “Feel the actions”, on the authored-character line: the v33 environment and first-evening gameplay with the authored v21 character model and wardrobe, plus a companion that carries its end of the sofa, a first evening that completes with the companion alone, a stage-timing log, a phone performance floor and parallel wardrobe loading. The exact id is stamped in `dist/index.html` (`BUILD_ID`), shown in the game Menu and recorded in `PACKAGE_MANIFEST.json`.

A browser life game set in a Nigerian compound. Create two independent players, move the sofa into your flat, shop, cook, learn crafts, furnish your home and host neighbours.

## Play

Choose **Start with a companion** to play alone, or **Start a new household on this phone** for two people sharing one screen.

- Player 1: WASD to move, E to interact.
- Player 2: arrow keys to move, Enter to interact.
- Phones: use the on-screen sticks and action buttons. Landscape gives both players more room.
- Saves stay in that browser on that device. Published v30–v33 share an origin and save schema; v33a reads those saves and maps their retired looks (see below).

Cross-device play requires the inherited host's room/database API, which is unavailable on this static hosted copy. Companion and same-screen play are supported.

## v33 — The first evening

New households arrive at 3pm with six saved milestones: move the sofa, gather jollof ingredients, cook together, host neighbours, choose a home gift, and choose tomorrow’s visit. Open **Tasks** on desktop or phone for the journal. The normal free-play activities remain available.

- Existing saves stay unchanged until the player chooses to follow the evening; existing achievements count.
- The guided pre-party clock pauses at 6:30pm so ordinary wandering does not close the market. Pause guidance to restore normal time. There is no real-time completion deadline.
- A one-time optional welcome basket fills only missing jollof ingredients. A meal that was eaten or sold can be cooked again before hosting.
- Action-boundary saves preserve cooking answers and party choices. Continue reopens an unfinished recipe or party.
- The first guided housewarming avoids the rooftop rain detour and always offers a photo until one is taken. Later parties keep their existing weather behavior.
- A plant, rug or wall art reward can be claimed once. A full flat sends it to Build storage. The following morning delivers the player’s chosen Yard invitation.

## v34b — Your day in Palm Court

The living-compound loop from build v34-a15c4aa3, ported unchanged onto the authored-character line with the v34a carry work. Its four modules (`life-v34.js`, `life-ui-v34.js`, `life-world-v34.js`, `life-v34.css`) are byte-identical to the shipped package; the package itself is kept verbatim on the branch `import/v34-a15c4aa3`. The only change needed to combine the two lines was renaming a private wrapper variable in `feel-v34.js` (`menu34` to `feel_menu34`), because both lines declared it at the top level.

Open **Tasks** (or **Menu**) for the field journal: Today, Almanac, Garden, Finds, People and Home.

- **Fishing.** At the waterfront, cast, watch for the bite, and reel in. Six species record their first day, count and best size. Keep a catch for cooking, sell it or release it; a pending catch survives a reload and pays out once.
- **One crop.** Plant Tunde's pepper seedling on the veranda, water it on two different days with a night between, and harvest three peppers on day three. An unwatered plant waits.
- **Palm Court Finds.** Fifteen furnishings rotate through five discounted offers per game day; browse in the journal, buy near Market Road. Fish and peppers from the pantry sell there too.
- **Decorating.** At home, pick from storage and tap a valid cell; rotate, store, cancel, or undo the last edit. Rotated footprints and collision bounds agree, and solid furniture cannot be placed over a player.
- **Three neighbours.** Tunde, Mama Nkechi and Ada each have three small requests, one per neighbour per day, delivered in person. They refer to what you did and reward home items, recipes or money; Ada's last request brings her to visit the veranda.
- **Beach finds and directions.** Three shells a day on the shore, and a marked destination with distance to the pot, the waterfront, the market, home or a neighbour.

**Combining the lines.** The loop had never been seen rendering before this build, so it was played through in headless Chromium on the authored character and its defects are fixed in `dist/src/bridge-v34b.js`, loaded last; the four life modules stay byte-identical and every fix wraps an earlier function and calls it. Fishing: the float lands in open water past the rocks (it was inside a rock), the camera fit includes it (above the bottom sheet on a phone), it dips at the bite, and the rod is held in the hero's right hand with the arm raised, facing the float, then released after the catch. The request card in a neighbour's talk dialogue is legible (its title was cream on cream) and sits above Later. During the guided first evening **Tasks** and **Our tasks** open the evening journal again, and Today leads with the evening card. Decorating: Undo refuses when anything outside the editor changed the flat since the last edit (the placed sofa could be deleted), the selection follows its item when old Build takes another from storage, the sofa, mattress, table and fan cannot be stored, a piece carried in old Build is noted, starter furniture has its own icons, and the pepper pot's veranda cell stays free. Online: the journal's UI actions are local; remote replays carry the sender's editor selection and keep this device's selection and waypoint; a silent remote replay also keeps this device's cast, while a remote shared-panel action (a sit-and-wait, the next day, cooking) that opens or closes the panel here ends the cast cleanly, so the bite cannot reopen or replace the shared panel; a remote reel records the sender's catch on the host, and if this device was at the bite it ends the local bite and shows that catch instead of a dead Reel in; a remote change to the flat ends local Undo; a remote Menu action adds nothing to the open panel, and a remote talk no longer drops the request card into it. Smaller fixes: the pepper pot stands on a timber stand so it shows over the veranda wall; the harvest confirms with a toast; journal pages keep their scroll when re-rendered; phone tabs wrap into two rows; Finds lists today's five first and will not sell an upgrade the home already has; one 'Back to the compound' per page and no 'Rest until tomorrow' during the guided evening; Today's title follows the crop and the morning after the first evening keeps its gift and album line; a waiting cast pauses behind the Menu; with the companion on, only the human opens home, waterside and market actions; turned kitchens, beds and sofas are used from a reachable side and the plate sits on a turned table; Ada waits on a free veranda cell clear of Tunde's party spot; shells lie on the sand; the directions pill moves below the toast and the companion card and shows an arrow; toasts sit below the journal's tab strip while a journal page is open; the 'Already in your home' pill sits on its own line under the price; a turned piece with no free side (a crowded flat) is used from the nearest free spot around it, or its unrotated reach point if there is none; the fishing marker sits clear of the rocks; 'Back another day' art no longer shows mismatched light boxes. Shoreline water: the base waves (±0.12 around y 0.03) dipped below the beach slab and the ground under the sea, so at a trough the shallows vanished and the float seemed to sit on dry sand; the bridge patches the water's vertex shader so the waves ease to 30% near the shore and the surface rises slightly there, staying above the sand and seabed at the float and along the shore at every phase while the open sea keeps its full waves. `check/verify-bridge.cjs` covers each fix, and its results file is the same on every run.

## v34a — Feel the actions

Everything in this slice lives in `dist/src/feel-v34.js`, loaded last; the base page changed only for the script tag and the move-in hint.

- **Carrying the sofa.** Neither holder nor the sofa may step up onto raised ground that is not a veranda slab (the back stairs, the landing, the roof): a step that would raise the level is cancelled like a wall, while a step that keeps or lowers the level is always allowed, so a pair that starts on the lower ramp simply walks down. One rate-limited toast explains that the sofa goes through the narrow passage on the left of the courtyard. The reference level for a carried sofa is the highest of its own resting samples and the two holders' current levels, so a grab from the upper grab window on the ramp still walks down at once. A sofa that an older save left resting on the stairs or the landing slides back (with a toast) to a validated courtyard spot when the world is entered or the sofa is next grabbed: the delivery spot by the gate first, then two courtyard spots, then a short search of nearby ground points, and a spot is taken only when it is collision-free (walls, furniture, the crate), on level ground, a player's width clear of the stair corridor and empty of players. The stair foot itself is never used, since a sofa there would seal the corridor for anyone coming down the ramp. In companion mode the companion carries its end: it follows a breadcrumb trail of the human's path one sofa length behind, pivots round corners by following the path, backs straight up when the human walks into it, swings to a clear angle at tight doorways, and lets go when the human sets the sofa down. The human holder walks at 0.92× instead of 0.7× in companion mode so the pair keeps at least 90 percent of solo walking speed on open ground along the sofa (a diagonal push starts nearer 87 percent while the sofa swings round). Two-human carrying keeps the base symmetric maths apart from the stairs rule. The move-in hints point players left to the passage and away from the stairs.
- **A first evening with a companion.** During the guided shop stage the companion shops for jollof ingredients only; its bag counts as the household's and is unpacked when the human is in the flat; a companion that is far from the kitchen is called in over a ground-level route before the stations open (not while it is up on the roof or the roof sequence is on: then the usual refusal stands), and a toast says when it has arrived so the stove can be used. The party picks, cooking station, gift and tomorrow choice already worked alone and are now proven in the harness with the companion driven by `aiDrive`/`aiThink`.
- **Stage timing log.** `S.firstEvening.log` records one entry per stage transition (`stage`, `at` wall-clock ms, `played`, `day`, game `time`). `played` counts seconds with the tab visible, panels included (the shop, the kitchen and the party are part of the evening); nothing counts while the tab is hidden. A save from before v34 gets one seeded entry for its current stage (played 0) on the first reconcile. The log persists in saves and is kept for local and companion households only: in online play (`NET.on`) nothing is seeded, counted or shown, and it is stripped from the shared household document, so it is absent there. The two Menu actions (`copyTimeline`, `menubtn`) are local-only and never replay on the other peer. The Menu shows it as its own line directly above the actions (*First evening: move 0 min · shop 0.4 min · total 3.2 min*), and **Copy evening timeline**, beside the tasks button, puts a compact text summary on the clipboard (or shows it in a panel when the clipboard is unavailable). This is the measurement for the four-of-five testers gate.
- **Phone floor.** When play (not panels, not the first 15 s after boot) stays under 24 fps for ten contiguous seconds the render scale steps down one notch (1.6 → 1.25 → 1.0); another ten seconds under 24 fps at 1.0 switches to lighter graphics live (shadows off and 1024 map, half the clouds and walkers, lite water, no rim light) and stores `lite` so the next load starts lighter. One toast per real step: a notch that would not change the pixel ratio (a device already at 1.0) is taken silently and the next notch follows at once, so such a device reaches lighter graphics after the first ten-second window, and a page already in lighter graphics gets no lite toast. The Menu shows the current state; it never steps up by itself. `perfDecide34` is the decision function the harness exercises.
- **Loading.** All sixteen wardrobe pieces are requested at once, the players' own pieces first (from the saved household or the creator defaults), with the per-piece callbacks and the single `spawnNPCs` preserved, so the creator preview appears as soon as the current look's pieces are in rather than after all sixteen. Measured under software rendering: 'Preparing your player' cleared 14.7 s after the creator opened instead of 66.3 s, and all sixteen pieces were cached at 91 s instead of 233 s.

## v33a — The authored character

Both players, both creator previews and the five named neighbours use the authored humanoid model from build v21 (`dist/assets/characters/efe.gltf.json`: modelled head, face and body, 27 joints, eight clips). Background walkers and sellers use the same model through `environment-v23.js`. The sixteen v21 wardrobe pieces are restored verbatim and bound as in v21: tee, jeans, sneakers; Ankara shirt, trousers, sandals; kaftan tunic, trousers, leather sandals; low taper, box braids, locs, afro, twists, long wig and the everyday head wrap. Office shirt, tracksuit and lounge set are painted onto the body's own clothing slots, as in v21. `CHARACTER.md` documents the binding contract and how a new base mesh must be delivered.

Kept from the v22–v33 line: the v23/v31 environment, materials and lighting; the v28 colour pipeline; the v30 sofa seating and creator tabs (Body with skin tone, Hair, Clothes, About you), retuned to the v21 rig; the v32 joined staircase, parapet copings, lit creator/thumbnail stage, contact shadow and 34-degree lens; the v33 first evening.

Removed: the procedurally generated body, its morph bases, builds and faces, the procedural head, presence (blink, breathing, glance, rim light), the fitted v30–v32 garments and the nineteen wardrobe files that existed only for the generated body, with their modules (`visual-v22`, `residents-v24`, `presence-v25`, `presets-v26`, `presence-data-v29`, `sculpt-v29-meta`, `bases-v29`, `presence-v29`, `head-v31-data`, `art-v31`), build tools, offline review renders and rig contracts. None of it fitted the authored model (see the last section of `CHARACTER.md`). It remains in git history at build v33-8df2a65a.

Saves from v26–v33 keep working: `dist/src/authored-v34.js` maps the retired outfit ids `starter`, `tankset`, `basics`, `everydayefe` to `tee` and `everydaytunde` to `ankara`, and the retired hair ids `none` to `low`, `curls` to `twists`, `braidbun` and `braidsup` to `braids`, on load, in new-game defaults and on looks received from a co-op peer. The other saved creator fields are ignored.

## Verification

```sh
node check/verify-authored.cjs
node check/verify-v33.cjs
node check/verify-feel.cjs
node check/verify-v34.cjs
node check/verify-bridge.cjs
```

The Node harness (`check/runtime-harness.cjs`) executes the shipped JavaScript with the bundled Three.js and glTF loader; nothing is rendered. `verify-feel.cjs` writes `check/results-feel.json` and covers the stairs rule (including a holder walking down off the lower ramp or from the upper grab window, and a sofa saved on the landing sliding back to a validated courtyard spot with the crate at the stair foot or players on the candidates, after which a grid search finds a path from the ramp into the courtyard that the player then walks), the companion carry (speed, steering, backing up, the full gate-to-flat route, release), the solo first evening with the companion driven by its own AI ticks (including the kitchen summon being skipped from the roof), the stage timing log, its seeding for older saves and its absence in online play, the performance step-down decisions including silent no-op notches, and the parallel prefetch bookkeeping. `verify-authored.cjs` writes `check/results-authored.json` and checks the hero (27 joints in hero order, 8 clips, five material-named body primitives, `hairMount`/`headCentre` extras), the sixteen wardrobe files (exactly those are referenced and parse, every skinned piece carries the hero's inverse bind matrices byte for byte), both players on the hero rig, every hair and outfit id equipping and hiding its slots with the painted outfits building cleanly, the save/network/default migration, the five neighbours plus walkers and sellers with their statures, the environment (surface registry, four-batch staircase, eight courtyard presets, material textures on disk, idempotent studio stage, 34-degree lens), seating in four sofa orientations (hips and feet at the retuned heights, sole meshes on the floor, trouser sink within the documented limit) with saves keeping standing positions, and the build id in the Menu. `verify-v33.cjs` writes `check/results-v33.json` and exercises the real cooking and party actions, reloads, clock behaviour, migration, reward deduplication and recovery paths. `verify-v34.cjs` writes `check/results-v34.json` and covers the living-compound loop: additive save migration, the multi-day crop cycle, pending catches settling once across reloads, market offers and purchases that cannot double-charge, neighbour requests and rewards, shell gathering, placement with rotation, storage and undo, Ada's visit, the world additions and a full resume. `verify-bridge.cjs` writes `check/results-bridge.json` and covers each v34b bridge fix: the fishing float, rod and camera fit, the talk-card contrast, Tasks during the guided evening, Undo after outside changes, the online replay rules through `applyRemote`, the pot stand and its reserved cell, icons, journal pages, Finds, editor selection and storage guards, turned furniture spots, the companion gates, Ada's spot, shells and markers, the directions pill and the journal scroll, shared-panel replays and a remote reel during a cast, the remote talk card, a turned sofa in a crowded flat, the shoreline water (its wave formula sampled over a full period at the float and along the shore), and the toast and pill placement.

Browser appearance, colour under the v28/v31 lighting, phone frame rate and audio are not covered by the harness and remain unverified in this build.

## Run a local copy

The game needs no build step or package installation. Serve `dist` through HTTP:

```sh
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Opening `index.html` through `file://` can block asset loading.

## Rebuild assets

Python tools require NumPy and Pillow. They are optional and not needed to play.

```sh
python tools/rebuild_wardrobe.py      # the six cloth shells and the low taper, on the skeleton embedded in the files
python tools/build_hair.py            # afro, twists and wig from the low-taper scalp
python tools/build-materials-v31.py   # the environment material maps
python tools/stamp-build.py           # always last after any change under dist/
node check/verify-authored.cjs        # rewrites check/results-authored.json for that stamp
node check/verify-v33.cjs             # rewrites check/results-v33.json
node check/verify-feel.cjs            # rewrites check/results-feel.json
node check/verify-v34.cjs             # rewrites check/results-v34.json
python tools/package-manifest.py      # refresh PACKAGE_MANIFEST.json after the results files
```

`tools/stamp-build.py` writes the build id (prefix `v34a-`) into `dist/index.html`; never edit it by hand. See `CHARACTER.md` for the character and wardrobe conventions and `CONTRIBUTING.md` for the repository layout. Third-party library attribution remains in the supplied files.
