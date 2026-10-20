# Repository notes

This repository holds the shipped builds of Compound Days — Waterside, exactly as packaged, plus the branches where changes are made to them.

## Layout (since build v33)

```
dist/        the playable game: serve this folder over HTTP (python3 -m http.server 8000 --directory dist)
dist/src/    runtime modules loaded after the base game in dist/index.html, in version order
dist/assets/ characters, wardrobe, props, env, materials and the vendored three.js r128
tools/       asset build scripts and the build stamp (tools/stamp-build.py)
check/       Node verification harness, results, and offline mesh reviews
```

Builds before v33 (v1, v19, v21) used a flat layout with `index.html` at the root; see the git history.

## Imports

A build archive is committed byte-for-byte, including `dist/index.html` and its outer artifact wrapper, because the build id is a hash over every file under `dist` and the review images carry that id. `PACKAGE_MANIFEST.json` lists the SHA-256 of every packaged file; an import is only committed once every hash matches.

Before committing an import, two checks run here:

- a browser smoke test under headless Chromium that boots the game, completes player creation, enters the world, moves both players and checks that every asset request succeeds;
- the shipped Node harness, `node check/verify-v33.cjs` and `node check/verify-v32.cjs`, which executes the real game logic with the vendored three.js and no browser.

## Branches

`master` tracks the shipped builds. Work that changes a build happens on a branch named for the change and is verified the same way before it is merged.

## Build stamp

After changing anything under `dist`, run `python3 tools/stamp-build.py` so the id in the game Menu matches the files. Never edit the stamp by hand.
