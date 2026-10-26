# Compound Days — Waterside

Build **v36-70429384** — One shared household, continuing the v35 game and v32 visual foundation.

A browser life game set in a Nigerian compound. Create two independent players, move the sofa into your flat, shop, cook, learn crafts, furnish your home and host neighbours.

## v36 — One phone each, one shared household

The primary title screen now opens a shared household. Each person signs in with
**their own ChatGPT account** on their own phone and gets a single full-screen
camera, one thumbstick, and Act. Keyboard/gamepad controls still work.

1. The Site owner shares the private Site with their partner as a viewer.
2. One person selects **Start our shared household**, or explicitly copies their
   existing device-local save with **Copy this phone’s household online**.
3. The partner selects **Join with a household code** and enters the full code.
4. Each person makes their own character, confirms ready, then moves in.
5. Later, either person selects their household on the title screen. Both phones
   can be closed between sessions; the shared save does not need a host phone.

A household code grants one of two membership slots inside the game. It does not
change the Site audience or bypass Site sign-in. The existing Site remains private;
the partner needs Site access before they can join. A second tab for the same
account returns to the same character, with explicit takeover if already active.

The prototype synchronizes positions, home placement/storage, the household purse,
pantry, dishes, garden, discoveries and neighbour progress. Menus remain on the
phone that opened them. Both players can contribute to the existing two-station
cooking activity. The online day advances through actions, avoiding two independent
clocks; both present players confirm before advancing to tomorrow. Either may
continue when the other is away. Existing offline saves are preserved separately.

Shared furniture placement uses the Home editor. Furniture is delivered for a new
online household so the old sofa-carrying tutorial does not block entry. The v35
bench delivery and continuous prop physics remain local-mode activities pending
online adaptation. Shared album records retain captions; captured image bytes
are not uploaded in this version. This is the first online household slice, not
a claim that every legacy physical co-op activity has been networked.

### Save and connection behavior

- Server-side membership uses the Sites-provided user identity.
- D1 transactions commit changes with field preconditions, a revision check and
  retry receipts. Repeated requests do not apply the same purchase twice.
- Unrelated field changes can merge. Conflicting edits keep the latest save and
  tell the affected player to retry; they never silently replace a partner’s edit.
- Changes awaiting acknowledgement are retained on the originating device and
  retried with the same operation ID. Further edits pause during reconnection.
- Position updates are independent of household saves; remote movement is
  interpolated. Phone latency and frame rate still need a real-device playtest.
- Gameplay calculations run in the clients. Membership, character ownership,
  write ordering and save integrity are checked by the server. This is a trusted
  two-person co-op model, not a competitive anti-cheat server.

### Validation

```sh
node check/verify-v36.mjs
node check/verify-v35.cjs
node check/verify-v33.cjs
node check/verify-v34.cjs
```

The online test runs two separate copies of the shipped game code against the
actual API handler and a local Cloudflare D1 database. It covers membership,
concurrent writes, retries, character setup, movement, decorating, cooking,
reconnection, shared-day approval, and the single full-screen render path.
The tests do not substitute for a physical two-phone session. The managed browser
previously could not create WebGL; visual and phone performance remain unverified.

### A 25-minute two-phone playtest

- 0–5: join using two accounts, create characters, move in.
- 5–10: walk apart. Open a menu on one phone while the other keeps walking.
- 10–15: place the starter lamp using Home. Confirm its position on both phones.
- 15–20: cook at separate stations; swap who starts the next activity.
- 20–25: leave and rejoin; confirm furnishings, purse and dishes. Briefly interrupt
  one connection and confirm that a pending change saves once after reconnection.

Observe whether both players keep control, whether both screens show the same
household changes, and whether saving/reconnecting is understandable. Ask: What
felt like a shared home? When did you wait unnecessarily? Was it easy to find
each other again?

## Local play

The title screen’s **Play on this device** section retains companion play and
local two-player play. Player 1 uses WASD + E; Player 2 uses arrows + Enter.
Local saves stay in that browser. Copying one online creates a separate shared
household and does not overwrite the local save.

## v35 — A Bench for Evening Gist

Open **Tasks → Try the bench delivery** or **Menu → A Bench for Evening Gist**.
Choose **Meet at the bench**. This opt-in activity uses two people on one device;
a companion household can explicitly switch to local two-player controls in its
activity panel. It does not support cross-device play or automatic companion steering.

- Both players press Act (P1 **E**, P2 **Enter**) to hold different ends. Initially
  P1 moves with WASD / their stick and P2 turns with left/right / their stick.
  Gamepad movement and action inputs use the existing assignments.
- Follow the gold rings from the gate, around the generator and planter, to the
  courtyard-facing veranda outside your flat. Swept bench and holder collision
  checks prevent sliding through walls or rotating a player into scenery.
- Either action button sets the bench down. Use its Menu panel to swap roles,
  reset to the last clear checkpoint, or pause the delivery and explore. The
  in-game clock waits while the activity is active; paused delivery restores it.
- At the veranda the characters step clear. Preview three positions with the
  arrow buttons or either player's left/right controls. Both players must agree
  using their own Act button or labelled approval button. A changed selection
  clears previous approvals. Occupied spots cannot be committed.
- The bench stays in the selected position after reloading. Stand nearby together
  and press Act to sit, then Act to get up. The existing rig's seated IK follows
  the bench's transform. Reload resumes safely on the ground, not on the seat.
- Interrupted carries resume grounded with neither player trapped holding an end.
  Replays require an explicit choice and do not duplicate the one-time memory.
  The household's other possessions, purse, and existing progression are retained.

Verification: `node check/verify-v35.cjs` runs nine groups against the shipped
Three.js runtime with the actual compound and loaded prop collisions. It covers
independent controls, the real main loop, pause/clock behaviour, safe resets,
three complete simulated deliveries, all three placement choices, double
approval, replay, reload, seating, and finite/idempotent geometry. The v33 and
v34 progression regressions also run. These are automated checks, not a human
co-op playtest. The cloud preview still cannot create a WebGL context; rendered
appearance and real-device frame rate remain unverified.

Suggested 25-minute playtest: 3 minutes to discover lifting, 7 for the first
route, 7 to replay with roles swapped, 5 to compare positions/sit/reload, and
3 to discuss whether both roles felt useful and which turns felt awkward.

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

The complete shared game now includes a server and database. The playable client
source and bundled assets live in `public/play/`; `dist/` is generated deployment
output. Hosting configuration is in `.openai/hosting.json`. Server endpoints are
in `app/api/household/route.ts`, with game save logic in `lib/households.mjs`.

Use the package manager specified in `package.json`, install dependencies and run
`pnpm dev`. Local D1 must have the SQL files in `drizzle/` applied first. The
included Sites scripts preserve the supported authentication and D1 bindings;
production sign-in is supplied by Sites. Never emulate identity in production.

For **offline/local play only**, the client still works without a build step:

```sh
python -m http.server 8000 --directory public/play
```

Open `http://localhost:8000` and choose **Play on this device**. This static command
does not start the shared-household API. Opening through `file://` can block assets.

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
