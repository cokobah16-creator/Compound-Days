# v71b: two phones stay one household

Two-phone play replays each action on the other phone and lets the phone that writes the household (the **host**,
the first one in) send its copy to the other (the **guest**) as the repair. Running two copies of the game together
showed that this came apart in ordinary play, starting in the first three minutes of a session.
`dist/src/pair-v71b.js` is one new module, loaded last, that closes the cases below by wrapping existing functions.
No existing module and no line of the base page was edited apart from the script tag that loads it.
One-phone and companion play are unchanged, except that the album no longer draws a "picture" that is not an image:
with the module loaded, the one-phone checks that keep a results file wrote byte-identical results.

This is the second version of the module. Independent reviewers ran the first one against the same rig and in real
browsers and found that a late delivery was taken for a lost one, that a guest was not told about some lost changes
and told about others that had arrived, that what a player held with Build could still be lost or duplicated, that a
device being turned away could overwrite its own one-phone household, and a dozen smaller cases. Version 2 closes
those; section 3 lists the checks for each.

Nothing here was tested on phones. See section 5.

## 1. What changed for players

| | Before (build v71-12c6662e) | Now |
| --- | --- | --- |
| Joining | About a second after joining, the second player's character screen stopped working: every choice threw an error, the screen did not show it, and choices could revert. | The screen keeps working; every choice is drawn and reaches the other phone. |
| Staying in step | The guest refused the host's household whenever it had pressed more buttons than the host, counting presses that are never sent, such as closing a panel. After a normal join it already had, so from the lobby on, nothing the host's copy would have repaired was repaired. | Only actions that are sent are counted. Each sent action is numbered and the host's household says which it has heard, so a late action is never taken for a lost one. An action is lost only when the connection it was sent on has gone; then the guest takes the host's household and is told, or, if the host did nothing meanwhile, offers its own household, so what it did alone is kept. |
| Moving furniture | A piece one player placed stayed "in the hands" on the other phone and came back as a free extra piece the next time that player carried anything. | The piece is put down on both phones. What each player holds is part of the household, so a reload, leaving, two players taking the same piece or a placement lost with the connection neither loses nor duplicates a piece. |
| Ending the day | Both players see the same single button. If both pressed it, two days passed and the two phones got different markets. | One day passes, and a night panel left open past its night closes. |
| The sofa | Each phone decided for itself that the sofa was in. Nothing was written while the host's "It is in" panel stood open. Positions were never written, so a reload put the sofa back at the gate on one phone only. A partner who dropped left the other player tied to the sofa. | The sofa goes in once, as one shared action from the host. The household records where the players, the sofa and the crate are. If the partner is not connected, the sofa is set down with a message, on both phones once they meet again. |
| A phone that slept | A phone that held the meeting point, slept, and woke to find the other phone holding it asked for its old place for ever. Both phones played on separately with no message. | It joins the phone that holds the meeting point. A phone that wakes alone and writes its old household is outvoted by the host's next write. |
| A third device | Anyone typing the code walked in as a second Player 2. The player who started the household, coming back by code alone, also became Player 2. | A device joining by code takes the seat nobody is using, or with both free the seat it had in that household before. When both are in use it is turned away; until then it takes no household and writes none, so its own saved household is untouched and it never shows or acts in the other world. |
| Sitting on the sofa | When one player sat down, the other phone's own player was seated too, with no panel, and could not move until they opened and closed their own Menu. | Only the player who sat is seated. |
| Smaller | The graphics-quality button changed the partner's setting too. "Start a new household" in the two-phone Menu replaced the shared household. Album pictures never came back after reopening. Each phone's Bigger text and walking speed were overwritten by the other's household. A swap of cooking stations crossing an answer left both players in a panel that could not be served. | The quality button stays on its own phone. The Menu button reads "Leave this household" and leaves; the household stays as it was on both phones. Opening the album fetches the pictures this phone has not got, and the meeting-point holder is given the other phone's pictures. Bigger text stays per phone; a walking speed reaches the partner and stays. A swap no longer applies once a station has an answer. |

## 2. How each wrap works

1. **The count, and what was heard.** `dispatch` raised `S.aseq` for every press; the guest ignores a household
   whose count is lower than its own. The wrap takes the press back when the action is in `LOCAL_ONLY` (never sent).
   Each sent action carries this phone's session and a number (`_p71`); the host's `applyRemote` records the last one
   heard from each seat in the household (`ack71b`), and a phone that writes the household itself puts its own last
   number there. A guest keeps the actions it sent that the household has not acknowledged, with the generation of
   the connection they went on. The generation rises when a connection this phone sends on closes or a new one opens
   (the room log's `hub lost`, `hub silent`, `guest out`, `guest silent`, `joined`, `holding`; not `signal lost`,
   which is the meeting service, with the phones' own connection still open). Only actions from an older generation
   are lost. If the host did nothing since the guest last took its household, the guest offers its own household as
   the newer copy; otherwise it takes the host's and is told. A guest with a lost action that hears nothing asks the
   host to write, on its own one-second timer because the lobby has no frames.
2. **The character screen.** `applyState` replaced the whole state, and the household never carries `setup`. The wrap
   keeps this phone's `setup` and its own unfinished character across a household that arrives before it is ready.
3. **Carried pieces.** `placeGhost` cleared the carried piece on the placing phone only. The `placeItem` wrap clears
   it on the replaying phone as well, and sends an owned piece to storage when the replay cannot place it.
   `stripState` writes what each player holds (`hands71b`), and the `applyState` wrap puts that in each player's hands
   without returning anything to storage, telling a player whose piece was taken first.
4. **The day.** In two-phone play `dispatch` adds the day the panel was opened for to a `nextday`; the outermost
   `nextday` wrap ignores one for a day that has already ended (and closes its panel), so none of the modules that
   wrap `nextday` runs twice. A household that moves the day on closes a night panel still open for the old one.
5. **The sofa.** `sofaSuccess` was called from each phone's frame loop. In two-phone play it now only fires on the
   host, as the action `sofaIn`, which both phones run. `stripState` adds the positions the one-phone save always
   wrote, and a phone that is not carrying the sofa puts it where the household says. The two-phone tick sets the
   sofa down when the partner is not connected (and on the partner's phone once they meet), and lets go of a sofa the
   household says is in.
6. **The sleeping phone.** `together47Room`'s `peerError` is wrapped: an "id taken" answer while this phone thinks
   it holds the meeting point makes it forget who it knew was there and join whoever holds it now. A host that gets
   an older household at its own revision writes again, one higher.
7. **Seats.** A device joining by code with no stored place first asks the meeting-point holder for the household.
   The holder says who is present before it answers anything and messages arrive in order, so when the answer is
   in, the list of seats in use is too, however slow the holder is. Until then the device applies no household,
   replays no action and writes nothing. With both seats free it takes the seat it had in that household: each phone
   remembers its seat per household (`cd3-seat71b-<code>`), since its one stored place names only the last household.
8. **Smaller.** `quality`, `netlobby` and `pairleave71b` are in `LOCAL_ONLY`; `aspeed` is sent, and replayed it only
   sets that speed (the action also redraws the Menu). Bigger text is kept per phone in `cd3-bigtext71b`.
   A replayed `sofaDown71b` tells the phone that lets go why. A guest gives the meeting-point holder its pictures each
   time it joins, also when the room joins again by itself. `newconfirm` and `newgame` in two-phone play open a "Leave this household?" panel; leaving writes first and keeps
   the stored place, so Continue together returns. `swapst` is refused once a station has an answer. `openAlbum`
   calls `netLoadPhotos`, which had no caller, and only takes a picture whose caption matches; any picture that is not
   an image data address is dropped. `sitStart` is skipped on the phone that is only replaying the partner's sit.

The catch-up and the sofa rules ride on the existing two-phone tick (`netTick`), so the per-frame hook list is
unchanged (17).

## 3. The checks

`check/two-phones.cjs` runs two or three copies of the shipped game in one Node process, joined through the real
room code in `dist/src/together-v47.js`. The DOM, WebGL, PeerJS and time are stand-ins (its header lists them);
every game script is real, and each copy has its own Three.js. A cut-off link holds messages and delivers them in
order when it is back, as a reliable data channel does; they are lost only if the connection closes first.
`Math.random` is seeded and no wall clock is read, so results repeat byte for byte.

`check/verify-pair-v71b.cjs` plays 28 scenarios on it. Every check runs even when an earlier one fails.

| | Scenario | On the build before (v71-12c6662e) |
| ---: | --- | --- |
| 1 | A normal join; the guest chooses on its character screen while the host's household arrives | fails: the screen's state is gone after joining |
| 2 | Eight presses that are never sent, then a host change | fails: the host's household never reaches the guest |
| 3 | A link down for 8 s (both purchases arrive, nobody is told) and for 45 s (the connection dies: the guest's purchase is kept if the host did nothing, otherwise the host's household stands and the guest is told once) | fails: the phones stay different |
| 4 | Two purchases in the same instant with money for one | fails: the phones stay different |
| 5 | Four carries with Build, two by each player | fails: the piece stays in the partner's hands |
| 6 | Two pieces put on one cell in the same instant | fails: one piece is lost |
| 7 | Both press the night panel's button; both keep their morning page | fails: two days pass |
| 8 | The sofa carried through the door | fails: not written while the panel is open |
| 9 | The partner's page reloads mid-carry | fails: the sofa is not set down |
| 10 | Both pages close and reopen | fails: both players are back at the gate |
| 11 | The meeting-point holder sleeps for a minute and a half and wakes | fails: it never rejoins |
| 12 | A third device; the starter returning by code with storage cleared | fails: the third device is let in |
| 13 | "Start a new household" in the two-phone Menu | fails: no way to leave |
| 14 | Album pictures after both reopen; a picture that is not an image | fails: no pictures |
| 15 | One player sits on the sofa | fails |
| 16 | What each player holds: a reload while carrying, two players taking one piece at once, leaving while carrying, a placement lost with the connection | fails: the piece is lost or duplicated |
| 17 | A device turned away keeps its own saved household after Try again and Back, never shows the other world, and nothing it does reaches it | fails: the device is let in |
| 18 | The guest's Bigger text and walking speed survive the host's household; the speed reaches the host, whose Menu is not redrawn | fails |
| 19 | A night panel left open on a phone that slept while the other ended the night | fails: the panel stays open |
| 20 | The sofa after a 10 s lock, after a 2 s reload, with an older-build host placing it, and with an older-build host's household after a set-down | fails: set down on one phone only |
| 21 | Swap stations as the other player answers | fails: an error, the dish cannot be served |
| 22 | Deliveries held for three seconds while the host writes | passes |
| 23 | A phone wakes alone and writes its old household while the host has Build open | passes |
| 24 | A picture taken while the partner was away; two pictures in the same instant | fails: the holder never shows it |
| 25 | What the guest did alone, which reached the host inside the household the guest wrote: a purchase just after the channel is replaced, two while the host is locked, a table put down between channels | fails: the phones stay different |
| 26 | The guest's link to the meeting service drops while deliveries are late | cannot run: it reads the module's own counters |
| 27 | A picture taken on the guest's phone while the connection was down, the room then joining again by itself | fails: never drawn |
| 28 | Leave a household, play another together, come back to the first by its code, Player 1 typing it first | fails: that build has no way to leave |

All 28 pass on this build. Run with `COMPOUND_GAME_DIR` pointed at the build before's `dist`, 25 fail and 22, 23 and
26 do not: those three guard against mistakes the first version of this module made (a late delivery taken for a lost
one, a woken phone splitting the pair, a signalling drop counted as a lost connection).

`check/bench-pair-v71b.cjs` repeats four of them in real browsers: one headless Chromium process per phone, the
game's own PeerJS, real WebRTC data channels, and a local signalling server (`check/local-peer-server.cjs`) so
nothing leaves the machine. Join and character screen, the guest staying in step after using its Menu, both
pressing the night button, and a third phone being turned away.

The sleeping-phone case was also run by hand in real browsers (first version), by stopping every process of the
meeting-point holder's browser for 88 seconds and continuing it. Before: the two phones stayed apart, with 61 "id
taken" refusals in 95 seconds. After: the woken phone was a guest of the other within 13 seconds (2 refusals), and a
purchase made afterwards showed the same purse on both.

`.github/workflows/pair-v71b.yml` runs both on pull requests that touch the two-phone code.

## 4. Not changed here

These need a decision, not a wrap:

- **Which copy wins after both phones changed things apart.** The host's, and the guest is told. Only when the host
  did nothing meanwhile is the guest's kept. Merging the two is a design question.
- **Who may send which action, and the household code as the only key.** The receiving phone still does not check
  who sent an action, and the code is still four characters.
- **A returning phone or a second device taking a seat that is in use through Continue together.** Only a join by
  code is seated.
- **The cell inside the flat door.** A piece placed there shuts the flat until someone inside stores it. Keeping the
  cell clear, as the veranda path is, changes the home editor for every household, and three existing checks use
  that cell as their free cell.
- **The cooking panel has no way out, either player ends the day for both, and a partner's actions show no message.**
  Those are design choices in the shared loop.
- **When two purchases collide, the player whose purchase loses is not told.** The purse and the bags are right on
  both phones; only the message is missing.
- **Lobby choices that never arrived.** A guest whose "ready" was lost is told to make its character again; the
  choices it made are not resent.

## 5. Not checked

Real phones, mobile networks, the public PeerJS signalling service, the relay (`api/turn.js`) and the live
deployment. The Node rig shows state and replay order; the browser bench shows the same code in real pages on one
machine. Neither shows what a phone does when it locks, changes network or is short of memory.
