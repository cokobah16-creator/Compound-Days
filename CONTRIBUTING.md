# Repository notes

This repository holds the shipped builds of Compound Days — Waterside, exactly as packaged, plus the branches where changes are made to them.

## Layout (since build v33)

```
dist/        the playable game: serve this folder over HTTP (python3 -m http.server 8000 --directory dist)
dist/src/    runtime modules loaded after the base game in dist/index.html, in version order
dist/assets/ characters, wardrobe, props, env, materials and the vendored three.js r128
tools/       asset build scripts and the build stamp (tools/stamp-build.py)
check/       Node verification harness and its results
```

Builds before v33 (v1, v19, v21) used a flat layout with `index.html` at the root; see the git history.

## Imports

A build archive is committed byte-for-byte, including `dist/index.html` and its outer artifact wrapper, because the build id is a hash over every file under `dist` and the results files in `check/` (`results-authored.json`, `results-v33.json`, `results-feel.json`) record that id. `PACKAGE_MANIFEST.json` lists the SHA-256 of every packaged file; an import is only committed once every hash matches.

Before committing an import, two checks run here:

- a browser smoke test under headless Chromium that boots the game, completes player creation, enters the world, moves both players and checks that every asset request succeeds;
- the shipped Node harness, `node check/verify-authored.cjs`, `node check/verify-v33.cjs` and `node check/verify-feel.cjs`, which executes the real game logic with the vendored three.js and no browser.

## Modules

New behaviour goes in a new file under `dist/src/`, loaded after the existing modules, that wraps the earlier function and calls the original (`const base=fn; fn=function(){ ...; return base(); }`) with a one-line comment saying what the wrapper changes. Existing modules and the base page stay untouched unless a wrapper cannot reach the goal; then make the smallest edit and comment it. Functions a harness check needs to call directly (hooks, decision functions) get a name rather than being pushed anonymously.

## Measurements

The first-evening timeline (`S.firstEvening.log`, shown in the Menu and copied by **Copy evening timeline**) is the tester measurement. Its `played` seconds count time with the tab visible, panels included; nothing counts while the tab is hidden. The log is kept for local and companion households only; in online play nothing is seeded, counted or shown and it is stripped from the shared household document, so online play has no timeline. Keep code and docs agreeing on that definition when changing it.

## Branches

`master` tracks the shipped builds. Work that changes a build happens on a branch named for the change and is verified the same way before it is merged.

## Build stamp

After changing anything under `dist`, run `python3 tools/stamp-build.py` so the id in the game Menu matches the files. Never edit the stamp by hand.

## Hosting on Vercel

The Vercel project `compound_days` deploys the `master` branch. The game lives under `dist`, so `vercel.json` at the repository root rewrites `/`, `/assets/...` and `/src/...` to the files under `dist` and marks the assets immutable (every asset request already carries the build id as a query string). If the project's Root Directory is ever set to `dist` in the Vercel dashboard, Vercel ignores this file and serves `dist` directly, which is equivalent.

