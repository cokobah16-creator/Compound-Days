# Provenance: ideas borrowed for the bench, round 2

Bench round 2 (v36) takes eight ideas from ChatGPT's package, build **v36-70429384**. That package is kept verbatim on the branch `import/v36-70429384`, and none of its files were copied here.

Each idea was rewritten as our own code inside `dist/src/bench-v36.js` (section 10, "Round 2") and `dist/src/bench-v36.css`. Every top-level name ends in 36. The base page and the life modules are unchanged.

The comparison of the two builds (sections 3, 7, 8 and 9 of `gpt36/bench/COMPARE.md` in the working notes) holds the evidence for each defect. It is not part of this package.

The table gives, for each idea:
- **Source**: the place in build v36-70429384 where the idea is.
- **Where it landed**: the function or rule that implements it here.
- **Harness check**: the check in `check/verify-bench-v36.cjs`. Each of these checks fails on the build before this round.

| # | Idea | Source in build v36-70429384 | Where it landed | Harness check (mutants) |
|---|---|---|---|---|
| 1 | Act ignores an OS key repeat | `public/play/index.html` line 4276: the base keydown tests `!e.repeat` before setting the Act latch. | Here the base keydown is left alone. `benchKeyCap36` is a capture listener that notes the latch before the base listener runs. `benchKeyBub36`, which runs after the base listener, puts the latch back on a repeat. This applies only while the bench is in play (or the Act would sit or stand). | 21 (M20) |
| 2 | A window blur clears held input | `public/play/src/bench-v35.js` line 317: a `blur` handler clears keys, sticks, move/turn and act. | `benchBlur36`. It also runs on `visibilitychange` to hidden (`benchVis36`). It also clears the stick UI, the bench's raw inputs, latches, carry velocities, the chooser's step timers and the let-go and stand-up timers. | 22 (M21) |
| 3 | The clock pauses during the bench | `public/play/src/bench-v35.js` lines 301–302: `advanceClock33` is wrapped, and holds while a delivery is open or seated. | `benchClockHeld36`, which wraps `advanceClock33`, with a narrower scope. The clock holds only while the bench is carried by both, in the chooser and while it glides. It runs while the bench lies untouched, while one player holds an end and while they sit. `passTime` keeps the original. | 23 (M22, M23) |
| 4 | Hide the directions pill | `public/play/src/bench-v35.js` line 309: `lifeGuideEl34` is hidden while their HUD shows. | `benchPill36`, called from the camera wrapper. Only `visibility` is held. The earlier value and `aria-hidden` are restored exactly. The existing `body.bench36-busy` CSS rule stays. | 24 (M24) |
| 5 | A Today card and the top Menu entry | `public/play/src/bench-v35.js` lines 290–291: `todayHTML34` is wrapped with a "SOMETHING TO DO TOGETHER" invite. Lines 292–293: the Menu's first button. | `benchTodayCard36` and the `todayHTML34` wrapper, as one `life-note34` card before the chips, which is the evening card's pattern. Our Menu lines were already at the top. Pause and Find are added beside the reset. | 25 |
| 6 | Tappable chooser controls, with green or red ghost colouring | `public/play/src/bench-v35.js` line 311: ← and → buttons and one "agrees" button per player in their HUD. Line 112: a green or red preview by whether the spot is clear. | `benchChooserRender36` draws ◀ and ▶ in each view's strip, plus that view's own player's "agrees" button. The agreed state uses `aria-pressed` and a tick. `benchStripTap36` acts on `pointerdown`. `benchPick36` handles browsing. `benchGhostLook36` draws the ghost in the role yellow when the arrangement is free and red when it is not. It also draws an outline at seat height and a seat-direction arrow, both seen through the parapet, and faint outlines of the other two arrangements. CSS: `.bench36-pick .b36` sets a minimum of 44 px. | 26 (M25, M26) |
| 7 | Pause delivery and explore, and Find the bench | `public/play/src/bench-v35.js` line 237: the "Pause delivery and explore" button. Line 242: `benchPause35`. Line 248: `benchFind35` sets `LIFE34.waypoint`. | `benchPauseDelivery36` uses our safe set-down (`benchSafeDown36(…,'pause')`). It does not count as a set-down and does not reopen the chooser on the spot. In the chooser, the bench stays in the doorway. `benchFind36` and `benchFindClear36` place the life destination marker. It follows a reset and goes when either player takes an end. | 27 (M27) |
| 8 | A companion household switches to two players | `public/play/src/bench-v35.js` line 234: "Switch this household to two-player controls". Line 244: `benchLocal35` sets `S.ai=false`, and the switch is one-way. | `benchDuo36` and `benchSolo36` make the switch reversible. The switch is saved under `S.life.bench36.duo`, so a reload keeps two players with "Back to my companion". `S.ai`, `AI.on`, `AI.i`, the companion's position and the split views are restored when the pair stand up from the placed bench, at the end of a day with it placed, on a pause, on leaving or cancelling, or from "Back to my companion". | 28 (M28, M29) |

## Not taken

Their route and world collisions were not taken: their test world misses 31 colliders. Their free 2D translation for the Move role was not taken, and neither was the clock freezing whenever a delivery is open. The edit to their base `index.html` tick loop was not taken, and neither was the one-way companion switch.

## The rest of round 2 (our own work, nothing borrowed)

Round 2 ships as build **v36-51c2a9ad**. Apart from the eight ideas above, everything in it comes from our own notes:

- **The carry ("guided lateral").** Our own carry-scheme study compared three prototypes against the shipped carry with a two-player model and by hand. It chose the guided prototype in a lateral-only form: walls and doorways move the bench sideways a few centimetres, never turn it. It landed as `BENCH36.GUIDE`, `benchAssistSlide36`, `benchAssistSwing36`, `benchFunnel36`, `benchTryG36` and `benchOpenCheck36` (section 3.5 of `dist/src/bench-v36.js`), with the Turn aids, the new prompts and the hidden area captions. Harness checks 3, 4, 5, 6, 9, 17, 18, 19 and 20 (mutants M15–M19).
- **The verifier's leftovers.** These came from our own review of build v36-934cd8fe: check 9 at corner 2, the README harness paragraph, the chooser frame counted in box tests, the first mover put back when a run is cancelled, the clearer ghost, and the holder who pinned the other player in the veranda doorway. They landed in section 11 of the module and in checks 9, 12, 17, 26 and 29 (mutants M30–M38).

## Round 3: review fixes (our own work, nothing borrowed)

Round 3 ships as build **v36-dac9dba8**. It fixes what two reviews of build v36-51c2a9ad found (a definition-of-done review with its own probes, and a play review with a modelled new pair in headless Chromium). Nothing in it comes from build v36-70429384.

- **A set-down is liftable only where each end can really be taken.** `benchReachPts36` now counts a cell near an end only when the straight step from it to the stand point is clear (`benchStepMemo36`, `benchStepAt36`: exact against the boxes `blocked()` tests, kept per cell). This covers the liftable rule, the order rule, the "needs this end" rule and the pinned rule. Check 6 (mutant M39).
- **The delivery zone wants the bench lined up.** `benchZoneYaw36` and `BENCH36.ZONEA` (30°). Check 20 (M40).
- **"Only Turn turns", counted exactly.** `benchCarryStep36` adds up the heading the Turn player's swing gave each frame and counts any other change. Check 3 (M41, M42).
- **A wedged pair can get out without the Menu.** `benchDownPlan36` (the set-down's dry run), `benchRefuseText36`, `benchDownCheck36` and `benchPutBack36`. Check 9 (M44, M53).
- **The turner's arrow.** `benchTurnSign36` and `benchScreenPt36`. The arrows keep clear of the prompt card through `benchPromptRect36`, `benchArrowSize36` and `benchClearPos36`. Checks 9 and 14 (M43, M48).
- **Smaller fixes.** The turn aid for a held swing (M45), the gate pillars fading (`benchOccList36`, `benchOccluders36`, M46), the player card keeping the role while stuck (M47), saved arrangement keys checked (`benchKey36`, M49), Find putting the player's destination back and its pill wording (`benchPillText36`, M50), the bench card in the first-evening journal (M51), and no "Wait for" a companion (M52). Checks 9, 12, 25, 27 and 28.
