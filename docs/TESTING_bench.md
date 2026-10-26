# Playtest script: Ada's bench (v36)

One session, two players, one device, 25 minutes. This is the owner's script for the first real two-person delivery. The facilitator sets up, reads two scripted lines, presses three things in the game and fills in the sheet. Everything else the players find in the game.

What is being tested: can two people carry Ada's bench from the street gate to the veranda by talking to each other, agree where it goes, and sit on it together, without anyone explaining the controls?

## Before the players arrive (about 10 minutes)

You need: the machine, one keyboard (or two pads), this sheet printed or open on a second screen, a timer, and a pen.

1. Serve the game: `python3 -m http.server 8000 --directory dist`.
2. Open `http://localhost:8000/?bench=playtest`. The address loses `?bench=playtest` straight away. That is expected: a flag is used once, so pressing F5 later never restarts anything. Playtest mode is now remembered in the save.
3. On the title screen choose **Start a new household on this phone** and make Player 1 and Player 2 (any looks; use the players' first names if you know them, because the game uses the names in its toasts).
4. Carry the sofa in yourself: walk both players to the sofa by the gate, take an end each, and carry it through the passage on the left into the flat.
5. End day 1: open **Tasks** and press **Explore freely for now** (this pauses the first-evening guide; its progress stays saved), then **Back to the compound**. Open **Tasks** again: the Today page now has **Sleep until tomorrow**. Press it, and on the night page press **Sleep until tomorrow** again (skip the rating faces). Close the day-2 morning page with **Back to the compound**. Do this as late as you can before the players sit down: the game clock runs one in-game hour per real minute while no panel is open, and day 2 starts at 7:30 in the morning.
6. Open **Menu** and press **We'll fetch it**. Read Ada's note and press **Off we go**. The toast says "Grab an end each."
7. Walk one player out to the street gate and confirm that the bench is lying across the street and that its two pale rings show on the ground when you come within a few steps. Walk that player back into the flat and stand both players inside, near the door.
8. Put the keyboard between the two chairs: Player 1 on the left (WASD to move, E to act), Player 2 on the right (arrow keys to move, Enter to act). With pads: stick to move, A to act.
9. Start the timer when you finish reading "What to say".

## What to say

Read this once, word for word:

"Ada has made you a bench. It is at the gate. Bring it home together and decide where it goes. Think aloud and talk to each other as much as you like. I can't help, but I'm watching the game, not you."

If asked which keys: "Player 1, left side of the keyboard. Player 2, right side." Nothing more.

## What not to say

- No role explanations. Do not say "one of you pushes, the other steers", "front" or "back", or what the yellow and teal labels mean.
- No key hints beyond "left side" and "right side".
- No pointing at the screen, no nodding at the right moment, no "nearly".
- Do not answer "are we doing it right?". Say "Carry on as you think best."

## Interventions

If the players are stuck for more than 90 seconds (no progress and no new idea), say only: "Is there anything in the Menu?" Mark it on the sheet as an **intervention**, with the clock time. That is the only help you may give.

The scripted lines and presses in the timeline below are **not** interventions. Resets the players choose themselves (the **Reset the bench** prompt or the Menu's **Bench stuck? Put it back**) are in-game actions: record them; they do not fail the session.

## The 25 minutes

| Clock | What happens | You do | Watch for |
|---|---|---|---|
| 0–3 | The players walk out, find the rings, take an end each and lift. | Nothing. | Can each of them say or show their role (Move or Turn) without coaching? Note the time to the lift, to the first slide along the bench, and to the first swing. |
| 3–10 | First delivery: gate, courtyard, the narrow passage on the left (corner 1), the flat door (corner 2), the room, the veranda doorway. In the doorway a strip opens in each half of the screen with three arrangements; both agree; the bench glides out to its spot. | Nothing. | Callouts, verbatim. Where they bump (corner 1, the passage, corner 2, the doorway). Set-downs and swaps. Idle stretches over 8 seconds. Moments of confusion. Write down the toast after the agreement: "Delivery 1 · m:ss · n bumps · n resets". |
| 10–17 | **Scripted.** Open **Menu**, press **Carry Ada's bench again**, and say: "Now bring it again, and swap jobs." The bench is back at the gate and the roles start already swapped. | The press and the line. | Does the second carry need less help? Do they call out more, or less? Compare the second toast with the first. |
| 17–22 | In the second chooser they try the arrangements, agree, and sit. Then **scripted**: press **F5**, then **Continue**. | The F5 and Continue. | Does the chosen arrangement survive the reload? Does each player use their own agree key? Does **Sit on the bench together** work again after the reload? |
| 22–25 | Debrief. | Open **Menu** first, so the game clock stops. Ask the questions below. | Their own words. |

If the second carry has not reached the doorway by minute 20, let it run to minute 22 and skip the F5 step; note it on the sheet.

**Past midnight.** About 16 to 17 minutes of play after day 2 starts, the in-game day ends and a "Past midnight" card appears. If it appears, press **Start day 3** yourself, close the morning page with **Back to the compound**, and say "New day, carry on." It is scripted, not an intervention. A bench they were carrying stays in their hands, a bench on the ground stays where it is, and they carry on from where they stood. Note the clock time.

## Observation sheet

Fill one row per notable moment. Times are from your timer. Use P1 and P2, or the players' names.

| Clock | Who | What happened | Callout, verbatim | Useful? | Confusion, collision, idle or coaching note |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |

**What happened**: one of grab, lift, slide, swing, bump at (corner 1 / passage / corner 2 / doorway / gate), set-down, swap, let go, stuck, reset, deliver, choose, agree, glide, sit, stand.

**Callouts** are what the players say to coordinate. Write them exactly, in their words and language, including Pidgin and half-sentences. Examples of the kind of thing to expect:

- "Small-small, turn your side… okay, come."
- "Wait, wait. Your end is on the wall."
- "Go back a bit. Now push."
- "I'm Move, you're Turn. Swing it left."
- "Stop! Corner."
- "Put it down, let's swap."
- "Which one? The gate one? Okay, I've agreed."

**Useful?** Mark ✓ when the callout named a direction, a role or a timing ("left", "your end", "now", "stop") **and** the partner acted on it within about 5 seconds. Mark ✗ when it was ignored, misunderstood, or the partner did the opposite.

**Also mark, in the last column:**

- **Confusion**: a player says or shows they don't know what to do ("what does Turn mean?", pressing keys at random, both pushing the same way, asking you).
- **Collision**: where the bench hit (the knock sound, the puff of dust) and whether they recovered on their own.
- **Idle stretch**: both players doing nothing useful for more than 8 seconds. Note what they were waiting for.
- **Coaching needed**: any moment where you wanted to help. Write what you would have said, even though you did not say it.
- **Frustration**: sighs, laughter at failure, "this is impossible", one player taking over the other's keys.

## Debrief questions (minutes 22–25)

Ask each player in turn, and write the answers down.

1. Did you each feel useful? Rate your own part from 1 to 5. (Write each player's number.)
2. Which turn felt satisfying?
3. Where did the controls feel frustrating?
4. Did you know who was steering?
5. Is the bench where you wanted it? Why that arrangement?

## The delivery log the build keeps

Playtest mode keeps a short log of each delivery in the save. Read it after the debrief:

- **The toast after each agreement**: "Ada's bench is home. Delivery 2 · 1:47 · 6 bumps · 0 resets". The time is how long the bench was in their hands (lifted), added up frame by frame. It does not count time with the bench on the ground or with a panel open, so it is shorter than your stopwatch.
- **Menu → Bench runs** lists every delivery so far (the last ten), one line each: "Delivery 1: 2:41, 6 bumps, 2 set-downs, 1 swap, 0 resets". Copy each line onto the sheet.

How to read it:

- **Time**: the first delivery usually takes one to three minutes. The second should be quicker if they learned from the first. Over five minutes for a first delivery means the controls need tuning before the next session.
- **Bumps**: every knock against a wall or a piece of furniture (at most one every 0.4 seconds while pushing into the same wall). A handful is normal at the two corners and the doorway. Dozens mean they were pushing blind; check your sheet for where.
- **Set-downs**: how often a holder put it down on purpose. Letting go by walking off and the automatic set-down in the doorway are not counted. Many set-downs with no swaps can mean they were resting or regrouping; compare with your callouts.
- **Swaps**: role swaps they chose while the bench was on the ground. The pre-swap at "Carry Ada's bench again" is not counted.
- **Resets**: times the bench was put back at a checkpoint. Record them; they do not fail the session.

The day log (Menu → **Copy timeline and days**) also shows a `place bench:veranda` event at each agreement, with the time into that day's play.

## Pass target (all three required)

1. Both deliveries completed with **no intervention**. Scripted lines and presses do not count, and resets are recorded, not failed.
2. At least **three useful coordination callouts** (marked ✓) on the sheet across the session.
3. **Each** player rates their own part at least **4 out of 5**.

If any one is missed, the session does not pass. Note which one, and the moment on the sheet that best explains it.

## After the session

- Keep the sheet with the "Bench runs" lines and the two delivery toasts.
- To run another pair on the same machine, start again from step 2 with a new household, or use **Menu → Carry Ada's bench again** for a quick repeat (it keeps the placed bench until the new pair agrees on an arrangement).
