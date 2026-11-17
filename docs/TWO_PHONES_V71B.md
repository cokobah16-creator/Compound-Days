# v71b: two phones stay one household

Two-phone play replays each action on the other phone and lets the phone that writes the household (the **host**,
the first one in) send its copy to the other (the **guest**) as the repair. Running two copies of the game together
showed that this came apart in ordinary play, starting in the first three minutes of a session.
`dist/src/pair-v71b.js` is one new module, loaded last, that closes the cases below by wrapping existing functions.
No existing module and no line of the base page was edited apart from the script tag that loads it.
One-phone and companion play are unchanged, except that the album no longer draws a "picture" that is not an image:
with the module loaded, the 30 one-phone checks that keep a results file wrote byte-identical results.

Nothing here was tested on phones. See section 5.

## 1. What changed for players

| | Before (build v71-12c6662e) | Now |
| --- | --- | --- |
| Joining | About a second after joining, the second player's character screen stopped working: every choice threw an error, the screen did not show it, and choices could revert. | The screen keeps working; every choice is drawn and reaches the other phone. |
| Staying in step | The guest refused the host's household whenever it had pressed more buttons than the host, counting presses that are never sent, such as closing a panel. After a normal join it already had, so from the lobby on, nothing the host's copy would have repaired was repaired. | Only actions that are sent are counted. A guest whose action never arrived (the link was down) takes the host's household within seconds and is told its change did not arrive. |
| Moving furniture | A piece one player placed stayed "in the hands" on the other phone and came back as a free extra piece the next time that player carried anything. | The piece is put down on both phones. If the replaying phone cannot place it, an owned piece goes to storage; nothing is duplicated or lost. |
| Ending the day | Both players see the same single button. If both pressed it, two days passed and the two phones got different markets. | One day passes. |
| The sofa | Each phone decided for itself that the sofa was in. Nothing was written while the host's "It is in" panel stood open. Positions were never written, so a reload put the sofa back at the gate on one phone only. A partner who dropped left the other player tied to the sofa. | The sofa goes in once, as one shared action from the host. The household records where the players, the sofa and the crate are. If the partner is not connected, the sofa is set down with a message. |
| A phone that slept | A phone that held the meeting point, slept, and woke to find the other phone holding it asked for its old place for ever. Both phones played on separately with no message. | It joins the phone that holds the meeting point. |
| A third device | Anyone typing the code walked in as a second Player 2. The player who started the household, coming back by code alone, also became Player 2. | A device joining by code takes the seat nobody is using and is turned away when both are in use. |
| Sitting on the sofa | When one player sat down, the other phone's own player was seated too, with no panel, and could not move until they opened and closed their own Menu. | Only the player who sat is seated. |
| Smaller | The graphics-quality button changed the partner's setting too. "Start a new household" in the two-phone Menu replaced the shared household. Album pictures never came back after reopening. | The quality button stays on its own phone. The Menu button reads "Leave this household" and leaves; the household stays as it was on both phones. Opening the album fetches the pictures this phone has not got. |

## 2. How each wrap works

1. **The count.** `dispatch` raised `S.aseq` for every press; the guest ignores a household whose count is lower than
   its own. The wrap takes the press back when the action is in `LOCAL_ONLY` (never sent), in two-phone play only.
   `pairResync71b` handles the remaining case, a guest whose sent action was lost: when a host household arrives at
   least 1.5 s after the guest's last sent action, later than the last action it replayed, and still with a lower
   count, the guest takes it. If no household comes within 3 s the guest says hello, which makes the host write one.
2. **The character screen.** `applyState` replaced the whole state, and the household never carries `setup`. The wrap
   keeps this phone's `setup` and its own unfinished character across a household that arrives before it is ready.
3. **Carried pieces.** `placeGhost` cleared the carried piece on the placing phone only. The `placeItem` wrap clears
   it on the replaying phone as well, and sends an owned piece to storage when the replay cannot place it.
4. **The day.** In two-phone play `dispatch` adds the day being ended to a `nextday`; the outermost `nextday` wrap
   ignores one for a day that has already ended, so none of the modules that wrap `nextday` runs twice.
5. **The sofa.** `sofaSuccess` was called from each phone's frame loop. In two-phone play it now only fires on the
   host, as the action `sofaIn`, which both phones run. `stripState` adds the positions the one-phone save always
   wrote. The two-phone tick sets the sofa down when the partner is not connected.
6. **The sleeping phone.** `together47Room`'s `peerError` is wrapped: an "id taken" answer while this phone thinks
   it holds the meeting point makes it join whoever holds it now.
7. **Seats.** A device joining by code with no stored place first asks the meeting-point holder for the household.
   The holder says who is present before it answers anything and messages arrive in order, so when the answer is
   in, the list of seats in use is too, however slow the holder is.
8. **Smaller.** `quality` and `netlobby` are added to `LOCAL_ONLY`. `newconfirm` and `newgame` in two-phone play
   open a "Leave this household?" panel; leaving keeps the stored place, so Continue together returns.
   `openAlbum` calls `netLoadPhotos`, which had no caller, and drops any picture that is not an image data address.
   `sitStart` is skipped on the phone that is only replaying the partner's sit.

The catch-up and the sofa rule ride on the existing two-phone tick (`netTick`), so the per-frame hook list is
unchanged (17).

## 3. The checks

`check/two-phones.cjs` runs two or three copies of the shipped game in one Node process, joined through the real
room code in `dist/src/together-v47.js`. The DOM, WebGL, PeerJS and time are stand-ins (its header lists them);
every game script is real. `Math.random` is seeded and no wall clock is read, so results repeat byte for byte.

`check/verify-pair-v71b.cjs` plays 15 scenarios on it:

| | Scenario | On the build before (v71-12c6662e) |
| ---: | --- | --- |
| 1 | A normal join; the guest chooses on its character screen while the host's household arrives | fails: the screen's state is gone after joining |
| 2 | Eight presses that are never sent, then a host change | fails: the host's household never reaches the guest |
| 3 | Two purchases while the link is down for ten seconds | fails: the phones stay different |
| 4 | Two purchases in the same instant with money for one | fails: the phones stay different |
| 5 | Four carries with Build, two by each player | fails: the piece stays in the partner's hands |
| 6 | Two pieces put on one cell in the same instant | fails: one piece is lost |
| 7 | Both press the night panel's button | fails: two days pass |
| 8 | The sofa carried through the door | fails: not written while the panel is open |
| 9 | The partner's page reloads mid-carry | fails: the sofa is not set down |
| 10 | Both pages close and reopen | fails: both players are back at the gate |
| 11 | The meeting-point holder sleeps for a minute and a half and wakes | fails: it never rejoins |
| 12 | A third device; the starter returning by code with storage cleared | fails: the third device is let in |
| 13 | "Start a new household" in the two-phone Menu | fails: no way to leave |
| 14 | Album pictures after both reopen; a picture that is not an image | fails: no pictures |
| 15 | One player sits on the sofa | fails: the partner is seated and cannot walk |

All 15 pass on this build and all 15 fail on the build before it, run with `COMPOUND_GAME_DIR` pointed at that
build's `dist`.

`check/bench-pair-v71b.cjs` repeats four of them in real browsers: one headless Chromium process per phone, the
game's own PeerJS, real WebRTC data channels, and a local signalling server (`check/local-peer-server.cjs`) so
nothing leaves the machine. Join and character screen, the guest staying in step after using its Menu, both
pressing the night button (presses 29 to 125 ms apart in three runs), and a third phone being turned away.

The sleeping-phone case was also run by hand in real browsers, by stopping every process of the meeting-point
holder's browser for 88 seconds and continuing it. Before: the two phones stayed apart, with 61 "id taken" refusals
in 95 seconds. Now: the woken phone was a guest of the other within 13 seconds (2 refusals), and a purchase made
afterwards showed the same purse on both.

`.github/workflows/pair-v71b.yml` runs both on pull requests that touch the two-phone code.

## 4. Not changed here

These need a decision, not a wrap:

- **Which copy wins after two phones played apart.** Still the higher revision, and one phone's progress is still
  discarded without a message. The revision also rises about every nine seconds a phone is open in the world, so
  "higher" does not mean "newer".
- **Who may send which action, and the household code as the only key.** The receiving phone still does not check
  who sent an action, and the code is still four characters.
- **The cell inside the flat door.** A piece placed there shuts the flat until someone inside stores it. Keeping the
  cell clear, as the veranda path is, changes the home editor for every household, and three existing checks use
  that cell as their free cell.
- **The cooking panel has no way out, either player ends the day for both, and a partner's actions show no message.**
  Those are design choices in the shared loop.
- **When two purchases collide, the player whose purchase loses is not told.** The purse and the bags are right on
  both phones; only the message is missing.

## 5. Not checked

Real phones, mobile networks, the public PeerJS signalling service, the relay (`api/turn.js`) and the live
deployment. The Node rig shows state and replay order; the browser bench shows the same code in real pages on one
machine. Neither shows what a phone does when it locks, changes network or is short of memory.
