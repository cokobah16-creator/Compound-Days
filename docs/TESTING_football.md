# Playtest script: Monkey post (v37)

One session, two players, one device, 25 minutes. The facilitator sets up, reads one scripted line, presses a few things in the game at fixed times and fills in the sheet. Everything else the players find in the game.

What is being tested: do two people find the ball and the controls without help, find Kemi and Emeka at the end of the street, and enjoy two or three matches against them, talking to each other as they play? Is the ball easy to follow on each half of the screen? Do the children feel like neighbours rather than opponents?

## Before the players arrive (about 10 minutes)

You need: the machine (or one phone held in landscape), one keyboard, this sheet printed or open on a second screen, a timer and a pen.

1. Serve the game: `python3 -m http.server 8000 --directory dist`.
2. Open `http://localhost:8000/?football=playtest`. The address keeps `?football=playtest` on the title screen and through making the household; it loses it on the first moment in the compound, when the move-in page closes (or **Continue** opens the saved household). That is expected: the flag is applied then, once, and held for this browser tab. In playtest mode the children are out at the end of the street from 06:00 to 20:00 every day (without it they come out only in the afternoon on day 2, from 15:00). The 18:00 last kick-off and Mama Nkechi's call at 18:20 still apply. The first-kick toast ("…in the afternoons") and the Menu's **Street football** card still give the usual hours; in playtest mode the children are out from 06:00 anyway, and Kemi's line after 6:00 pm says "Tomorrow morning!". The first kick also records playtest mode in the save, which keeps the Menu's **Football runs**.
   - **If the page is reloaded** (F5, or the browser restores the tab), playtest mode stays for that tab: the children keep the 06:00 hours and nothing is applied a second time. Choose **Continue** on the title screen.
   - **If the tab is closed**, or you move to a new tab or window, the hours go back to normal. Open `http://localhost:8000/?football=playtest` again in the new tab, then choose **Continue**.
3. On the title screen choose **Start a new household on this phone** and make Player 1 and Player 2 (any looks; use the players' first names if you know them, because the game uses the names on the screen, for example "Tolu: Release!").
4. Carry the sofa in yourself: walk both players to the sofa by the gate, take an end each, and carry it through the passage on the left into the flat.
5. End day 1: open **Tasks** and press **Explore freely for now**, then **Back to the compound**. Open **Tasks** again: the Today page now has **Sleep until tomorrow**. Press it, and on the night page press **Sleep until tomorrow** again (skip the rating faces). **Leave the day-2 morning page open.** The game clock does not move while any page is open, so it waits at 7:30 am for as long as you need (the top bar still says "Day 1, 3:00 pm" meanwhile; that is expected). You close it with **Back to the compound** when the timer starts.
6. Do not kick the ball and do not walk west along the street: the first kick and the first sight of the children belong to the players.
7. Put the keyboard between the two chairs: Player 1 on the left (WASD to move, E to act), Player 2 on the right (arrow keys to move, Enter to act). On a phone: hold it in landscape; each player's thumb drags on their own side of the bottom of the screen to move and presses their own **Act** button.
8. When the players are seated, press **Back to the compound** on the morning page, read "What to say" and start the timer.

## The clock

The game clock is in the top bar, at the top in the middle: the day's name and the part of the day in bold (for example "… morning"), with "Day 2, 9:31 am" under it. While the day-2 morning page is open the top bar is not updated: it still shows day 1's "Day 1, 3:00 pm" until you press **Back to the compound**, when it shows "Day 2, 7:30 am". Four rules decide the session:

- Outside play it runs **one game hour per real minute**. It stops while any page is open (the Menu, Tasks, the morning page).
- While the ball is in play it runs at **a third**: 20 game minutes per real minute. A match with three minutes of play takes about an hour of the game day.
- **No match starts after 6:00 pm.** Kemi then says "It's late…" and when they will play tomorrow.
- At **6:20 pm Mama Nkechi calls Emeka in**. A match still going becomes "Last goal wins", and the children go home for the day. A match also becomes "Last goal wins" after five minutes of play.

So after a morning spent finding the ball, a day holds two or three matches. When the third would start after 6:00 pm, it is played the next morning, after the facilitator's sleep step below. In playtest mode the children are already out then.

## What to say

Read this once, word for word:

"There's a football somewhere near your home, and some children who play. Have a game. Talk as much as you like."

If asked which keys: "Player 1, left side. Player 2, right side." Nothing more.

## What not to say

- No control hints: do not say "tap to pass", "hold to shoot" or "press Act to call for it". The game shows its own hint during the first two matches, worded for each player's key (E, Enter or Act).
- Do not say where the children are, or when they come out.
- No pointing at the screen, no nodding at the right moment, no "nearly".
- Do not answer "are we doing it right?". Say "Carry on as you think best."

## Interventions

If the players are stuck for more than 90 seconds (no progress and no new idea), say only: "Is there anything in the Menu?" Mark it on the sheet as an **intervention**, with the clock time. That is the only help you may give. The Menu's **Street football** card says where and when the children play and how the controls work; it also has **Ball stuck? Bring it back** (or **Stop the game** during a match).

The facilitator's sleep step (below) is **not** an intervention. Resets the players choose themselves (the Menu's **Ball stuck? Bring it back**) are in-game actions: record them; they do not fail the session.

## Timeline

The merger walked this timeline in the browser three times, on the real clock: two players on the keys, playtest mode, day 2 from 7:30 am. The walks between the compound and the pitch were timed (40–100 seconds), not steered. The three walks differed in pace:

- **brisk:** the ball found at 2½ minutes; matches of 1½–2 minutes of play; 20 seconds between matches;
- **steady:** the ball found at 3½ minutes; matches of 3–4 minutes of play; 50 seconds between matches;
- **slow:** the ball found at 4 minutes; matches of 3¼–3¾ minutes of play; 75 seconds between matches.

The game-clock column gives what each walk showed. Follow the real clock, and do the sleep step whenever its rule says so.

| Real time | Game clock (brisk · steady · slow) | Activity | Facilitator | Observe |
|---|---|---|---|---|
| 0:00 | 7:30 am | Press **Back to the compound** on the morning page, read the line, start the timer | | |
| 0–4 min | 7:30–11:30 am | Find the ball and the controls. The ball rests on the sand between the street and the water, in front of the compound. | Nothing | Time to the first kick, the first deliberate pass and the first shot. Is tap against hold found without help? Do they find the white goal frame at the square? |
| 4–6 min | 11:30 am–1:30 pm | Find the children at the west end of the street, where the keke turns (about 25 m from the compound gate) | Nothing; after 90 s stuck, the intervention line | Do they walk up to Kemi and press Act ("Play monkey post")? |
| 5–10 min | match 1: 12:37–1:15 pm · 1:36–2:39 pm · 1:42–2:46 pm | The first match | Nothing | Do they use "Call for it" (Act away from the ball, which puts "Release!" on the other player's half)? Who scores? Do the children win the ball back, and does it feel fair (a child stands in front of the ball for a moment, never in their first second with it)? A ball lost off-screen (note the time)? The keke: do they understand "Motor!" and step aside? Do they notice Mr. Bassey arriving to watch, and read his lines? Can they always see the play, and do they read the stone goals? |
| 7–15 min | match 2: 1:48–2:20 pm · 3:41–4:59 pm · 4:13–5:29 pm | The second match (on the summary strip, Act by Kemi gives "Another game?") | Nothing | Does "Kemi is serious now" or "They are showing off now" register? Does it stay friendly? |
| 9–21 min | match 3: 2:53–3:23 pm · pressed 5:57 pm, kick-off 6:03 pm, to 6:40 pm, with Mama Nkechi's call at 6:20 · after the sleep step, 8:36–9:42 am on day 3 | The third match | The sleep step, if its rule says so (the slow walk: at 15:00 at the latest; later than that, skip the third match) | If it is still going at 6:20 pm: is "Last goal wins" understood and enjoyed? Do they see Emeka run home? |
| 22–25 min | | Debrief | | Below |

The three walks finished their third match at 11:12, 17:02 and 20:27 on the real clock. The slow walk only just fits: the merge checker walked the same pace with the sleep step at 15:56 and finished the third match at 22:11, after the debrief should have started. So at the slow pace the sleep step has a deadline (below), and past it the third match is cut.

**The sleep rule.** When a match ends, look at the clock. Do the sleep step if all three of these hold:

- they have played fewer than three matches;
- it is 6:00 pm or later, Kemi has said "It's late…", or Mama Nkechi has called Emeka in;
- it is no later than **15:00 on the real clock**. The step, the walk back west, the set-out and a slow third match take about seven minutes, so a later start runs into the debrief.

If the first two hold but it is after 15:00 on the real clock, **cut the third match**: go straight to the debrief. Two matches meet the pass target.

In the slow walk the second match ended at 6:51 pm with 16:00 on the real clock: under this rule that is too late, and the third match is cut (the walk that did the step anyway finished at 20:27; the checker's at 22:11). In the steady walk, P1 pressed "Another game?" at 5:57 pm, just before the 6:00 pm last start, and the match kicked off at 6:03 pm after the set-out; it ran into the call, so no sleep step was needed. In the brisk walk the third match was over by 3:30 pm.

**The sleep step** takes about a minute.
1. Say only: "Let's go to the next morning."
2. Open **Tasks** and press **Sleep until tomorrow**. If it asks about the neighbours coming by, press **Sleep anyway**.
3. On the night page press **Sleep until tomorrow** again (skip the rating faces).
4. Press **Back to the compound** on the morning page. The next day starts at 7:30 am with the players at home.
5. They walk back west (about a minute), and the children are out from 6:00 am in playtest mode.

Record the time on the sheet. This is not an intervention.

**Match length.** The harness's bots play a median of about 50 seconds of ball-in-play time a match. The spec estimated two to four real minutes for two people. Note the real length on the sheet; the Menu's **Football runs** has it to the second.

**If the owner restores the normal clock** (`FOOTBALL37.OWNER.clockSlow = 1`), a match with three minutes of play takes three game hours. Then one match fits in a day: play one match a day and do the sleep step after each.

## Checks the Node harness cannot make (the facilitator, in the browser, before the session)

The Node world builds no palms, shrubs or pots, so check these by eye in the browser before the session:

- during a match the bougainvillea standing on the pitch's south edge and the potted plant beside it are faint ghosts in both halves, and any palm frond between a camera and the players or the ball fades too; all come back within a second of the match ending;
- the stone cairns read as two goals at each end (pale stones with a green or orange band, a scuffed line across the mouth, Emeka's slippers by the east pair);
- "GOAL!" shows at the top of both halves after a goal, clear of the goal and the people;
- on a phone in landscape the first-match hint is one short line near the top for 4 s ("Tap Act: pass · Hold Act: shoot") and the prompt sits low, above the Act button, saying Act.

## Debrief (read the questions; write the answers in their words)

1. Fun, 1 to 5, each player?
2. Did Kemi and Emeka feel like neighbours or like opponents?
3. Was the ball easy to follow on your half of the screen? Did the arrows at the edge help?
4. Would you play again tomorrow?
5. Anything that felt un-Nigerian or wrong (the words, the names, the way the children or Mr. Bassey speak)?

## Pass target

- two matches completed without an intervention;
- each player makes at least one deliberate pass and one shot;
- each player rates fun at least 4 out of 5;
- no "where's the ball?" stall over 10 seconds in any match.

## After the session

Open **Menu** and press **Football runs** (it appears in playtest mode only). Copy each line onto the sheet: the match length, the score, kicks and passes per player, calls, outs, and whether the keke came through or the street's call was used.

## Sheet

| | Clock time | Notes |
|---|---|---|
| First kick | | |
| First deliberate pass (P1 / P2) | | |
| First shot (P1 / P2) | | |
| Found the square's goal | | |
| Found the children | | |
| First "Call for it" | | |
| Match 1 score and length | | |
| Match 2 score and length | | |
| Match 3 score, "Last goal wins"? | | |
| Sleep step (real time, game clock before it) | | |
| Ball lost off-screen over 10 s (times) | | |
| Interventions (times) | | |
| Resets (times) | | |
| Fun P1 / P2 | | |
| Football runs (copied) | | |

## Variants

- **A player and the companion.** Make a household with **Play with a companion**. Player 1 plays on WASD + E; the companion plays alongside and answers "Release!" with a pass. Observe whether the companion feels like a teammate who shares the ball.
- **One phone, two thumbs.** Hold the phone in landscape. On a phone held upright, the first-match hint asks the players to turn it sideways; note whether they do.
