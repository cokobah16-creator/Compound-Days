# Compound Days — Waterside

Build **v34-a15c4aa3** — the first living-compound loop, continuing the published v33 guide and v32 visual foundation.

A browser life game set in a Nigerian compound. Create two independent players, move the sofa into your flat, shop, cook, learn crafts, furnish your home and host neighbours.

## Play

Choose **Start with a companion** to play alone, or **Start a new household on this phone** for two people sharing one screen.

- Player 1: WASD to move, E to interact.
- Player 2: arrow keys to move, Enter to interact.
- Phones: use the on-screen sticks and action buttons. Landscape gives both players more room.
- Saves stay in that browser on that device. Published v30–v34 share an origin and additive save schema.

Cross-device play requires the inherited host's room/database API, which is unavailable on this static hosted copy. Companion and same-screen play are supported.

## v34 — Your day in Palm Court

Open **Tasks** (or **Menu → Your day in Palm Court**) for the new illustrated field journal: Today, Almanac, Garden, Finds, People and Home. It links the existing first evening to a small repeatable daily loop. There is no real-world login deadline: days advance in the game, and plants do not wither while you are away.

- **Six fish discoveries.** Walk to the waterfront, cast, watch for the bite, then reel in when ready. Each species records its first day, count and best size. Keep a catch for cooking, sell it or release it. A pending catch survives reloading; its decision can only pay out once.
- **One forgiving crop.** Plant Tunde's welcome pepper seedling on the veranda. Water on two different days and sleep between them; the first harvest yields three peppers on day three. An unwatered plant waits. The pot gains leaves and red fruit in the world.
- **Fifteen familiar furnishings.** Palm Court Finds has five discounted offers per game day; all fifteen rotate over three days. Browse remotely, buy near Market Road. Inventory and purchases persist, and pantry fish and peppers can be sold there.
- **Touch-friendly decorating.** At home, choose from storage and tap a valid cell. Rotate, store, cancel a selection or undo the last edit. Footprints, collision bounds and upgrades agree; solid furniture cannot be placed over a player. Other transactions invalidate undo so it cannot duplicate rewards or purchases.
- **Three continuing neighbours.** Tunde, Mama Nkechi and Ada each have three small requests, limited to one completion per neighbour per day. They refer to your previous actions and give home items, recipes or money. Ada's final request unlocks a veranda visit. Talk to them in person to deliver things.
- **Beach finds and directions.** Three shells can be gathered each day. A marked destination and distance guide you to the pot, waterfront, market, home or a neighbour. The world includes the pepper pot, shore shells, fishing float and a striped furniture stall.

Suggested first three days: water and make a first catch; help a neighbour and furnish a corner; harvest the peppers and use them in the kitchen or a neighbour request. The old cooking, housewarming, craft and free-play systems remain available. This is an original Nigerian-compound life-game slice, not a copy of another game's assets or its full feature scope.

## v33 — The first evening

New households arrive at 3pm with six saved milestones: move the sofa, gather jollof ingredients, cook together, host neighbours, choose a home gift, and choose tomorrow’s visit. Open **Tasks** on desktop or phone for the journal. The normal free-play activities remain available.

- Existing saves stay unchanged until the player chooses to follow the evening; existing achievements count.
- The guided pre-party clock pauses at 6:30pm so ordinary wandering does not close the market. Pause guidance to restore normal time. There is no real-time completion deadline.
- A one-time optional welcome basket fills only missing jollof ingredients. A meal that was eaten or sold can be cooked again before hosting.
- Action-boundary saves preserve cooking answers and party choices. Continue reopens an unfinished recipe or party.
- The first guided housewarming avoids the rooftop rain detour and always offers a photo until one is taken. Later parties keep their existing weather behavior.
- A plant, rug or wall art reward can be claimed once. A full flat sends it to Build storage. The following morning delivers the player’s chosen Yard invitation.
- This is a playable guided slice, not a measured 20-minute playtest result. No new mesh or rendering changes were made in v33.

## The v32 visual pass

- Heads, eyes, hair, beards and accessories share a 1.24 scale with a 20 mm drop. A tapered lower-neck join gives the bases a friendlier silhouette of approximately six heads, while retaining the 27-joint skeleton and nine clips.
- The visible torso and arms use separately authored smooth contours. The inherited implicit surface had coupled inner arms with the waist, making skin fragments and distorted clothing. Its upper surfaces are now hidden; it remains a reference for legacy garments, hands, legs and animation compatibility.
- New tops and bottoms use a smooth fit cage for Base A / Base B and slim / balanced / fuller. The fit keeps sewn hems and shoulder seams continuous instead of following defects in the old surface.
- A plain crew tee, shorts and cream sneakers form the starter outfit. The tank is another selectable set. Five rebuilt tops have connected torso/shoulder/sleeve surfaces and physical hem walls; detached shoulder caps are removed.
- Signed coverage fields are composed across the complete outfit. Skin restored around one opening must remain outside every other worn piece. Waist, shorts, trouser and ankle boundaries no longer restore overlapping fragments. Wrist joins also receive a precise cut.
- Sneakers have a continuous upper, ankle collar, rounded sole and raised lace bars.
- A joined staircase replaces the stack of solid wall blocks. Sloped stringers, open handrails and tread nosings use four material batches. Collision boundaries and the ascending route are preserved. Rounded copings finish the terrace parapets.
- Creator and thumbnail scenes share a lit platform and curved backdrop. A cached soft contact texture grounds avatars. Gameplay uses a 34-degree lens with the existing viewport-aware framing.
- The v31 textured PBR materials, colour pipeline, fitted hairstyles, curved plants, environment palettes and day/evening lighting are retained. Lite quality keeps a diffuse material path.

## Verification

```sh
node check/verify-v32.cjs
node check/verify-v33.cjs
node check/verify-v34.cjs
```

The Node harness executes the shipped JavaScript, Three.js and glTF loader. It checks 35 wardrobe assets, 33 props, 18 body/build/face combinations, 810 clip samples, 24 seating cases, saves, colour conversion, eye openings, eyelids, garment topology, composed skin boundaries, contour geometry, contact-shadow height, cuff weights and eight courtyard presets. Results are stamped in `check/results-v32.json`; inherited checks retain `check/results-v30.json`.

The ten additional state-flow groups in `check/results-v33.json` exercise the real cooking and party actions, reloads, clock behavior, migration, reward deduplication and recovery paths.

The ten v34 groups in `check/results-v34.json` exercise migration, the actual multi-day crop cycle, pending catches, market purchases, neighbour deliveries, shell gathering, decoration/rotation/undo, visits, world geometry and full resume. These are runtime state and geometry checks, not a substitute for watching or playing the rendered game.

`check/review32/` contains **offline software renders of runtime meshes and albedo maps**. They are not WebGL gameplay screenshots and omit PBR reflections, transparency and contact-shadow composition.

```sh
node check/export-geometry.cjs check/geometry32
node check/export-world-v31.cjs check/geometry32
g++ -O2 -shared -fPIC check/raster.cpp -o check/raster.so
python check/render-geometry.py check/geometry32 check/review32
python check/make-review-v32.py
```

The v34 supervised browser preview served successfully, but the cloud browser reported **Error creating WebGL context** before the world could start. Browser appearance, phone frame rate and audio output remain unverified. The art is procedural and has not reached the painted concept sheets. Older traditional outfits and saved hairstyles remain provisional. There is no new speech animation or finger rig. The new fishing rod is a visual prop, not a new hand-rigged animation clip.

## Run a local copy

The game needs no build step or package installation. Serve `dist` through HTTP:

```sh
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Opening `index.html` through `file://` can block asset loading.

## Rebuild assets

Python tools require NumPy, SciPy and Pillow. Node tools use bundled Three.js. The final mask step tags new assets with the fit cage and composes bottom/foot coverage. Run it after regenerating any of these garments.

```sh
python tools/build-head-v31.py
python tools/build-materials-v31.py
node tools/build-hair-v31.cjs
python tools/build-starter-v30.py shorts office_trousers cargo_trousers
python tools/build-sneakers-v32.py
python tools/build-tailored-tops-v32.py
python tools/complete-masks-v32.py
python tools/stamp-build.py
node check/verify-v32.cjs
```

See `RIG_CONTRACT_V32.md` for current render-body, garment and head conventions. Earlier contracts remain as reference for the inherited assets. Third-party library attribution remains in the supplied files.
