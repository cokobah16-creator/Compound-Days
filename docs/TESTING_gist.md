# Playtest script: Evening gist and daily finds (v38)

One session, two players, one device, about 45 minutes of play plus a short debrief. The facilitator sets up, reads one scripted line, keeps a stopwatch and fills in the sheet. Everything else the players find in the game.

Build: **v38** (the Menu shows the exact build). Spec: `gist/SPEC.md` §17.2. **For a v39 build, use the v39 section at the end of this script** (it changes the setup, the observation table, the debrief and the aims); the v38 parts it does not replace still apply.

What is being tested: is the middle of the day less empty now that something turns up there (a lost thing from midday, Ada's fish to catch in the early afternoon, shells at the water's edge every third afternoon)? Do the players come home in the evening for the neighbours' gist, and do they act on what they heard the next day without help? Does standing at the rail feel right, and does the "Ehen?" button help or get in the way?

## Before the players arrive (about 10 minutes)

You need: the machine (or one phone held in landscape), one keyboard, this sheet printed or open on a second screen, a stopwatch and a pen.

1. Serve the game: `python3 -m http.server 8000 --directory dist`. Open `http://localhost:8000/?gist=playtest` and check the Menu shows the v38 build. The address loses `?gist=playtest` on the first moment in the compound; that is expected. The flag is applied once and noted for this browser tab. In playtest mode the shelf's panel ("See your shelf" on Today, once the household has found something) has a footer line: "Days with gist · Lost things given back · Longest quiet stretch yesterday". Nothing else changes.
2. On the title screen choose **Start a new household on this phone** and make Player 1 and Player 2 (use the players' first names if you know them). For a solo tester, make a companion household instead.
3. Carry the sofa in yourself (an end each, through the passage on the left into the flat). Plant and water the seedling Tunde left in the pepper pot.
4. Sleep to day 3: open **Tasks**, press **Explore freely for now**, then **Back to the compound**. Open **Tasks** again: the Today page now has **Sleep until tomorrow**. Press it, and on the night page press **Sleep until tomorrow** again (skip the rating faces). Do the same on day 2. **Leave the day-3 morning page open**: the clock does not move while a page is open, so it waits at 7:30 am for as long as you need.
5. Do not walk to the waterfront in this household before the session: the first lost thing (a pair of reading glasses on a beaded chain) lies on the sand by the waterfront bench from midday on day 3, and finding it belongs to the players.
6. Put the keyboard between the two chairs: Player 1 on the left (WASD to move, E to act), Player 2 on the right (arrow keys, Enter). On a phone: landscape, each thumb on its own side, each player's own **Act** button.
7. When the players are seated, press **Back to the compound**, read "What to say" and start the session timer.

## What to say

"Play three days at your own pace. Talk as much as you like." Nothing about lost things, the shelf or the neighbours' visits.

## The clock

One game hour is one real minute while no page is open; any open page stops the clock. So 10:30 am to 6:00 pm is about seven and a half real minutes of open play. The neighbours' first veranda evening comes on day 3 between six and ten (as in v35); **from day 4 the gist comes every evening from a quarter past six** while someone is at home (the flat or the veranda), and waits for a football match to end and for Mama Nkechi to call the children in (6:20 pm) on a day they played.

## During the session

| Real time | Game | Observe |
|---|---|---|
| 0–12 min | Day 3 | Do they see the glasses' glint by the waterfront bench after midday? Do they work out whose they are and take them to Mama Nkechi at her shop? Her thanks sends them to Ada's chisel by the rocks: do they go? Ada's thanks for it passes on Tunde's word about tomorrow: do they remember it on day 4? Do they notice Today's new card ("What the compound is saying") and Ada's shelf offer (₦5,000 for the wood)? The veranda evening that night, as before. |
| 12–26 min | Day 4 | When they talk to Ada, she names a fish she wants to carve ("They only bite in the early afternoon"): do they go fishing for it after half past twelve without being told, see the quiet "Keep it for Ada" on its catch card, and take it to her at the Makers' Yard? Do they look for the day's thing after midday without being told? Do they come home in the evening? If they are on Ada's bench, does "Wait here until the neighbours come" make sense, and does standing up to greet the guests feel right? When the guests reach the rail, the players at home slide to the rail beside them: does that read as stepping up to greet, or as being moved? Does the first gist land? Do they understand that it points at tomorrow? Do they press "Ehen?"? |
| 26–40 min | Day 5 | Do they act on last night's tip without prompting (the named place after midday; the water's edge in the afternoon on a wash day)? Do they read Today's "Heard last night" row? Is yesterday's carving on the shelf's top plank, and do they notice it on the wall, standing in the flat? Do they notice the small star at the edge of their half when a lost thing is near but out of view? If Ada named a fish at the gist, do they fish for it in the afternoon? Did Ada's ask feel like a gift or a chore? |
| 40–45 min | Debrief | Below |

**The stopwatch.** Between 10:30 am and 6:00 pm game time, time any stretch over 20 seconds where the players stand still with nothing to do or say "what now?". Write each one down with the game time it started. A stretch ends when they start something.

**Interventions.** Only if the players are stuck for over two real minutes, and write each one down: "Have you looked at Today?" (the Tasks button). Never point at a lost thing, a glint or a neighbour.

## After the session

1. Open the Menu and press **Copy timeline and days**. Paste it into a file (for example `tester-1.txt`).
2. Run the quiet stretches tool: `node tools/quiet-v38.cjs tester-1.txt`. It prints, for each day, the three longest stretches with no logged event between 10:30 and 18:00 game time, in real seconds of played time. (The day log keeps played time, not the clock, so its 10:30–18:00 window is approximate: panels count in its time and reels and waits move the clock without play. Your stopwatch is the measure; the tool is the cross-check.)
3. Run the gates tool as for v35 (`node tools/gates-v35.cjs tester-1.txt`): the six new log kinds (`gist`, `find`, `return`, `keep`, `set`, and `carve` for a fish given to Ada) read without warnings.

## Debrief (5 minutes, both players)

- Fun, 1 to 5, each of you? The evening gist, 1 to 5, each of you?
- Did the evening visits feel like neighbours, or like a cutscene?
- **When the neighbours came, did standing at the rail feel right?**
- **Did you press "Ehen?", or did it get in the way?**
- Did you want to hear what they would say about tomorrow?
- Was anything confusing about finding things or giving them back?
- Did the shelf matter to you? Did you fish for Ada because she asked, or because you wanted the carving?
- Would you play the next day?
- Anything that felt un-Nigerian or wrong?

## Pass aims (not promises; the owner sees the sheet)

- On days 4 and 5, no "nothing to do" stretch longer than 2 real minutes between 10:30 and 18:00.
- At least one tip acted on the next day without help.
- Every lost thing found on its first day given back without help.
- Each player rates the gist at least 4 out of 5.
- Both say they would play the next day.

## Known limits to expect

- A rushing pair still has some empty time: see the measured table in the README's v38 section (an eager player, three samples a day; the longest quiet stretch between 10:30 and 18:00 and the idle time before the gist on days 4 to 6). Most of what is left is after the match (about 1.5 minutes until the gist) and the run-up to midday; a player who uses Today's "Wait until then" skips the first. The aims above are about players who look around.
- The shelf hangs on the back wall over the mattress (the household sign is over the sofa), a small unit from 1.89 to 2.37 m: shells, keepsakes and Ada's carvings. On the desk all three sets are below the top bar for a player standing in front of it at the mattress; from further back, and on phones, the carvings' plank goes under the bar. "See your shelf" on Today is always the readable view.
- Ada's carvings are her gift (₦0; `FOUND38.CARVE_PRICE` is the owner's number if that changes), as the owner put it: "she names a fish, you catch it, she carves it for your shelf". She names one fish a day at most, and that fish gets "Keep it for Ada"; it bites only from half past twelve to half past three (the catfish, her sixth, only after six). A fish kept for her keeps until six the next evening. The carvings sit on the shelf's top plank, at 2.27 m.
- When the guests reach the rail, the players at home glide to it (a slide, not a walk); a player out in the compound stays where they are.
- The seller, the Finds tip and the set thank-you beats are the next build's.

---

# v39: Aunty Bisi, thanks at the rail and fuller afternoons

Build: **v39** (the Menu shows the exact build). Spec: `v39/SPEC.md` §17.2. The same session shape as v38 (two players, one device, about 45 minutes of play from day 3, a short debrief), with the changes below.

What is being tested: does Aunty Bisi feel like part of the street, or like a shop? Is the early afternoon fuller now that a neighbour asks for fish for the pot? Do the players notice a neighbour coming to the rail for the thing they still have, and the thank-you when a set on Ada’s shelf is finished? Does handing the stool over the rail to the eldest guest feel right, the first time and the times after?

The owner’s choices this build is made to (their own words): Aunty Bisi “About 4 evenings in 5”: “Never two missed in a row, and Today tells you each morning whether she's coming. She stays a small treat rather than a routine.”; the fish for the pot, “Add it”; the stool, “Only the eldest sits”: “Ada's stool is handed over the rail to the eldest guest (Mr. Bassey, then Mrs. Oyelaran, then Mama Nkechi). Everyone else, including your household, stands.”; after the seven lost things, “Five new, then 'again'”: “Five new small things, one per neighbour. After that, the old things go missing 'again', one a day. Returns stay thanks and friendship, never cash.”

## Setup changes

1. Serve the game as for v38, but open `http://localhost:8000/?gist39=playtest&bisi=off` (you may add `&gist=playtest` for v38’s shelf footer). With the v39 flag Aunty Bisi passes every evening (normally about four evenings in five, with one evening off in her first week) except the one evening `bisi=off` keeps her away: the evening after her first, which is day 5 in this session. That evening off is there so the players can see the owner’s “Today tells you each morning whether she's coming” work on a morning when she is not: on day 5 Today says “Aunty Bisi is not passing”, and at that night’s gist one of the guests says she passes tomorrow evening. Today carries her sentence only once the household has met her (bought from her or had a taste), so make sure the players meet her on day 4. If you forget `bisi=off`, she passes on day 5 too; note it on the sheet and skip the day-5 Bisi observation. The first time a player talks to Mama Nkechi or Mr. Bassey after buying from Aunty Bisi, the fish for the pot is asked for, whatever the hour (without the flag, before half past one). Nothing else changes. The flag is applied once and noted for the tab.
2. Everything else as for v38: a new household, the sofa, the seedling, sleep to day 3 and leave the day-3 morning page open. Do not walk out to the street between five and six before the session (Aunty Bisi belongs to the players).

## What to say

As for v38: “Play three days at your own pace. Talk as much as you like.” Nothing about Aunty Bisi, the pot, the shelf or the stool.

## During the session (in place of v38’s table)

| Real time | Game | Observe |
|---|---|---|
| 0–12 min | Day 3 | As for v38 (the glasses, the chisel, the veranda evening). No Aunty Bisi on the veranda evening’s day. |
| 12–26 min | Day 4 | From five (about 9.5 real minutes into the day) Aunty Bisi walks in by the gate and strolls along the street calling “Puff-puff! Hot puff-puff!” (a player whose view does not show her sees “Aunty Bisi: Puff-puff! Hot puff-puff!” at the foot of their half, with an arrow): do the players notice her? Do they call her from the rail (“Call Aunty Bisi”, anywhere on the rail in front of the walkway) or walk out to her? Do they buy without help, and press “Help her lift the tray” (her tray comes down to her chest while she serves and goes back up as they help)? If they are short of money, does the taste read as kind, not as charity? If Kemi and Emeka were out after a match (even if they have since gone in because everybody walked home), do they buy the children a bag and take it back to the pitch, where the children come out again? She is gone by ten past six: did they miss her? At the gist, a guest may mention the puff-puff (the treat line). |
| 26–40 min | Day 5 | **Her evening off.** Today’s morning card says “Aunty Bisi is not passing” (with `bisi=off`): do the players read it? Note whether either says so out loud, and whether either still goes out to the street or the rail between five and six looking for her (write down the game time). There is no “Wait for Aunty Bisi” on her evening off. At the gist, does the guest’s line that she passes tomorrow evening land? (If the players did not buy or taste on day 4, Today has no Bisi sentence yet: note it and skip this observation.) If Mama Nkechi or Mr. Bassey asks for two or three fish caught after two: do they go fishing after two without being told, press the quiet “Keep it for {name}’s pot” on the catch card, and take the fish over by half past five? Does the bowl at six land? Two fish errands may fall in one afternoon (Ada’s and the pot): fine, or too much? If the thing in their pocket was still there at last night’s gist, its owner comes to the rail tonight and asks for it: do they understand “Give it back”? If a set on Ada’s shelf finished, its neighbour opens the gist with a thank-you: do they notice? If an elder comes and the household has Ada’s stool, the button reads “Bring the stool for {name}”: does handing it over feel right, and does it feel right that only the elder sits? |
| 40–45 min | Debrief | Below |

**The stopwatch**, as for v38: between 10:30 am and 6:00 pm game time, time every stretch over 20 seconds with nothing to do, and write down the game time it started. After the session paste the day log through `node tools/quiet-v38.cjs tester-1.txt` as before; the gates tool (`node tools/gates-v35.cjs`) also reads v39’s three new log kinds (`bisi`, `pot`, `thanks`) once the integrator has added them.

**Interventions**, as for v38: only after two real minutes stuck, “Have you looked at Today?”. Never point at Aunty Bisi, a fish or a neighbour.

## Debrief additions (after v38’s questions)

- “Did Aunty Bisi feel like part of the street, or like a shop?”
- “Did you notice the neighbour coming for their thing at the gist?”
- “Bringing the stool: did it feel right that only the elder sat?”
- “The stool each time that elder came: a courtesy, or a chore?”
- “Did the fish for the pot feel like a favour or a chore?”
- “On the morning of her evening off (day 5), did Today tell you whether Aunty Bisi was coming that evening? What did it say, and did you believe it?” (Write down whether they remember that she was not coming.)

## Pass aims for v39 (not promises; the owner sees the sheet)

- On days 4 and 5, no “nothing to do” stretch longer than 2 real minutes between 10:30 and 18:00.
- Aunty Bisi bought from without help on her first evening.
- The pot given at least once without help.
- Each player rates the evening at least 4 out of 5.

## Known limits to expect (v39)

- Buying from Aunty Bisi stops the clock (every panel does): she is there for the street and for character, and adds only seconds of play an evening. The measured idle table is in the README’s v39 section; after the fix round both households are under 4.5 minutes on days 4 to 6 in the simulation (4.14 and 4.31 buying in the street, 4.21 and 4.28 at the rail), and days 8 to 14 stay over 4.5 for both (about 5.0 to 5.5).
- Her bubbles and the children’s are kept inside each half of the screen, under the top bar; on a narrow phone half they are drawn a little smaller. A speaker shows one bubble at a time (her “I dey come!” replaces her call), and a half whose view does not show the speaker draws no bubble: while she calls, that player sees her call on the chip at the foot of their half instead.
- The bag for Kemi and Emeka is offered while the children’s hours last (until about half past six), even after they have gone in because everybody left the pitch: walking back with it brings them out again.
- The pot wants fish caught after two o’clock (the owner’s wording), so a household that has finished its morning early may wait for two; the wash at half past one is on the way. Watch for a wait here and note it: it is a possible question for the owner.
- On an evening with a give-back or an elder’s first stool line, the pot ask moves to the next evening, so a gist stays within two new lines.
- The pot can be asked for most days from day 5 by a household that talks to Mama Nkechi and Mr. Bassey every morning (both now ask in their morning talk, or at the gist for tomorrow).
- Days 8 to 14: five new lost things after the seventh (from two days after it goes back), then the old things go missing “again”, one a day.
