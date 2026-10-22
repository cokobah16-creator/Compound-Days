# Repository notes

This repository holds the shipped builds of Compound Days — Waterside, exactly as packaged, plus the branches where changes are made to them.

## Layout (since build v33)

```
dist/        the playable game: serve this folder over HTTP (python3 -m http.server 8000 --directory dist)
dist/src/    runtime modules loaded after the base game in dist/index.html, in version order
dist/data/   dialogue data loaded as classic scripts (lines-v35.js)
dist/assets/ characters, wardrobe, props, env, materials and the vendored three.js r128
tools/       asset build scripts and the build stamp (tools/stamp-build.py)
check/       Node verification harness and its results
```

Builds before v33 (v1, v19, v21) used a flat layout with `index.html` at the root; see the git history.

## Imports

A build archive is committed byte-for-byte, including `dist/index.html` and its outer artifact wrapper, because the build id is a hash over every file under `dist` and the results files in `check/` (`results-authored.json`, `results-v33.json`, `results-feel.json`) record that id. `PACKAGE_MANIFEST.json` lists the SHA-256 of every packaged file; an import is only committed once every hash matches.

Before committing an import, two checks run here:

- a browser smoke test under headless Chromium that boots the game, completes player creation, enters the world, moves both players and checks that every asset request succeeds;
- the shipped Node harness, `node check/verify-authored.cjs`, `node check/verify-v33.cjs`, `node check/verify-feel.cjs`, `node check/verify-v34.cjs`, `node check/verify-bridge.cjs`, `node check/verify-tune-v35.cjs`, `node check/verify-lines-v35.cjs`, `node check/verify-log-v35.cjs`, `node check/verify-evening-v35.cjs`, `node check/verify-audio-v35.cjs` and `node check/verify-days-v35.cjs`, which executes the real game logic with the vendored three.js and no browser. Run each twice: every results file must be byte-identical across runs, so no results file may contain a wall-clock value (v35 code reads the wall clock only through `clock35()`, which the harnesses stub).

## Modules

New behaviour goes in a new file under `dist/src/`, loaded after the existing modules, that wraps the earlier function and calls the original (`const base=fn; fn=function(){ ...; return base(); }`) with a one-line comment saying what the wrapper changes. Existing modules and the base page stay untouched unless a wrapper cannot reach the goal; then make the smallest edit and comment it. Functions a harness check needs to call directly (hooks, decision functions) get a name rather than being pushed anonymously.

## Measurements

The first-evening timeline (`S.firstEvening.log`, shown in the Menu and copied by **Copy evening timeline**) is the tester measurement. Its `played` seconds count time with the tab visible, panels included; nothing counts while the tab is hidden. The log is kept for local and companion households only; in online play nothing is seeded, counted or shown and it is stripped from the shared household document, so online play has no timeline. Keep code and docs agreeing on that definition when changing it.

From v35 the day log sits beside it: `S.life.days[n]` (`dist/src/days-v35.js`) is the v35 tester measurement. `startedAt` is the day's first player input or dispatched action (not the moment the previous night ended), `sleptAt` is the Sleep press, and `playedMs` and `panelMs` count only while the tab is visible, the day has started and there was input in the last 60 seconds. Each Continue logs a `resume` event carrying its wall time. The latest seven days keep their events; older days keep totals and counts. It is kept for local and companion households only: online play has no log, and `life.days` is stripped from the shared household document. The Menu copy button copies the evening timeline and all days.

## Branches

`master` tracks the shipped builds. Work that changes a build happens on a branch named for the change and is verified the same way before it is merged.

## Build stamp

After changing anything under `dist`, run `python3 tools/stamp-build.py` so the id in the game Menu matches the files. Never edit the stamp by hand.

## Hosting on Vercel

The Vercel project `compound_days` deploys the `master` branch. The game lives under `dist`, so `vercel.json` at the repository root rewrites `/`, `/assets/...`, `/src/...` and `/data/...` to the files under `dist` and marks the assets immutable (every asset request already carries the build id as a query string). If the project's Root Directory is ever set to `dist` in the Vercel dashboard, Vercel ignores this file and serves `dist` directly, which is equivalent.

## Builds from other collaborators

A build delivered as an archive on a different line (for example v34-a15c4aa3, made on the shipped v33 with the generated character) is first committed verbatim on its own branch off the build it came from, named `import/<build id>`, so its exact change set stays reviewable. Its new modules are then ported onto the current line unchanged where possible; any name clash between classic-script modules is resolved by renaming the private name on our side, because two scripts declaring the same top-level `const` fail at load.

