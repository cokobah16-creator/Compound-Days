# Playtest script: Evening gist and daily finds (v38)

One session, two players, one device, about 45 minutes of play plus a short debrief. The facilitator sets up, reads one scripted line, keeps a stopwatch and fills in the sheet. Everything else the players find in the game.

Build: **v38** (the Menu shows the exact build). Spec: `gist/SPEC.md` §17.2. **For a v39 build, use the v39 section near the end of this script; for a v40 build, the v40 section at the end** (it starts on day 8) (it changes the setup, the observation table, the debrief and the aims); the v38 parts it does not replace still apply.

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

# v40: Notices, children's things and fresh evenings

Build: **v40** (the Menu shows the exact build). Spec: `v40/SPEC.md` §17.2. The same session shape as v38 and v39 (two players, one device, about 45 minutes of play, a short debrief), with the changes below. This session starts on **day 8**, from the v39 session's day-8 household, so the days this build is for are reached at once.

What is being tested: is the late morning (10:30 to noon) worth crossing the courtyard for now, with a card on the noticeboard, a thing to find and Mallam's order? Do the cards read like neighbours or like quests? Does the day start to feel like a list of errands? Do Kemi's and Emeka's things feel like children's, and is taking Emeka's to Mama Nkechi a pleasure or a chore? Is fanning the coals play or a chore? Does Mallam feel like a neighbour with a trade, and part of the evening? Do the players notice an evening line they heard before?

The owner’s choices this build is made to (their own words): “LOST:” cards, “One a day”: “A reason to cross the courtyard every late morning, which is the gap this build is aimed at.”; a neighbour’s errand, “Add it”; Mallam’s day, “Morning order, evening coals”: “You order your suya at half past ten, help fan the coals from five, and he stays by his grill during the gist. He hands over your sticks afterwards.”; his name, “He says it once”: “He becomes a neighbour with a name, but the compound still calls him Mallam.” The owner’s v38 and v39 choices stand as approved.

## Setup changes

1. Serve the game as for v38. Load the day-8 save handed out with this guide (the v39 session's household on the morning of day 8: v38 and v39 discovered, the seventh lost thing back) through the Menu's **Continue**, and check the Menu shows the v40 build. Do not add any v40 flag: `?board=now`, `?mallam=now` and `?gist40=playtest` are for reading the lines, not for a session.
2. Leave the day-8 morning page open until the players are seated. Do not read the noticeboard in this household before the session: the first read is v40's discovery and belongs to the players.
3. Everything else as for v38: one keyboard between two chairs (or one phone in landscape), the stopwatch, this sheet.

## What to say

As before: “Play three days at your own pace. Talk as much as you like.” Nothing about the noticeboard, Mallam, the children's things or the errand.

## During the session (in place of the earlier tables)

| Real time | Game | Observe |
|---|---|---|
| 0–15 min | Day 8 (a morning-match day: the children are out from ten) | From half past ten Mrs. Oyelaran changes the notices: a new card pulses softly on the board, and passing within six metres she says “New notices. Kindly read them.” Do the players read the board without help? The first read shows the card in its owner's hand: do they find the thing in the place it names (a soft glint within five metres) and take it to its owner where they are? Today now has a line about the board. Mallam threads sticks under his shade until noon: do they order two sticks for tonight? From half past twelve Mrs. Oyelaran's notice asks them to carry something from one neighbour to another: do they? At two in the afternoon one of the children, still playing at the pitch, may call out that they have lost something (“My whistle! It was here. It was here!”): do they look on the sand south of the pitch, and give it back to the child? From five Mallam lays his charcoal: do they fan the coals together (repeated presses of Act; the glow shows in the prompt) and turn the sticks? (If only one of them presses, the one fanning is offered “Turn the sticks” after about two seconds.) On Aunty Bisi's evenings, do they still find the coals at the front of the stall? The first stick: when the beat ends the prompt becomes “Taste the first stick” (no panel opens by itself, and a press in the first moment does nothing): do they choose it? At the gist: a match line, a season line, a mention of the errand. After the gist, coming near the stall: Mallam says “Your two sticks are ready.” once, when he is on the screen of a player within 4 m (from the rail side at a desk that is about 1.4 m from the stand; on a phone about 3 m, in the near player's half of the screen): does it bring them over? At the stand “Collect your two sticks, ₦2,000” hands over his kept order with his line (“Two sticks, as I promised…”), even if they bought a round before the gist. |
| 15–30 min | Day 9 (the children out from three) | Yesterday's card crossed out in its owner's hand: do they notice? A new card at half past ten: do they go on their own? After the match, at the children's exit, a child may lose a thing: do they find it on the sand that evening, and take Emeka's to Mama Nkechi at her shop before six (her panel), or keep Kemi's for Kemi? This is the evening before harmattan: does a guest's “Harmattan tomorrow…” come true for them the next morning (the Menu, the haze)? |
| 30–42 min | Day 10 (harmattan; school day, the children from half past three) | The third card, unaided? Mallam's order and coals again: still play, or now a chore? (A household that skips the gist finds him still at his grill with their sticks from ten in the evening until half past ten, and Today says “Mallam is keeping two sticks for you tonight.” until then; after a gist that ends late he waits half an hour after it, and a reload during the gist counts as its end.) Does any evening line sound like one they heard on day 8 or 9 (write down which)? |
| 42–47 min | Debrief | Below |

**The stopwatch**, as before: between 10:30 am and 6:00 pm game time, time every stretch over 20 seconds with nothing to do, and write down the game time it started; **mark the late morning (10:30–12:00) separately**. After the session paste the day log through `node tools/quiet-v38.cjs tester-1.txt`; the gates tool (`node tools/gates-v35.cjs tester-1.txt`) reads v40's three new log kinds (`board`, `kid`, `mallam`) without warnings.

**Interventions**, as before: only after two real minutes stuck, “Have you looked at Today?”. Never point at the board, a glint, a child, Mallam or a neighbour.

## Debrief additions (after the earlier questions)

- “Did you go to the noticeboard on your own after the first time?”
- “Did the cards read like neighbours, or like quests?”
- **“Did the day feel like errands?”**
- “Did you notice an evening line you had heard before?”
- “Was taking Emeka's thing to Mama Nkechi a pleasure or a chore?”
- “Did fanning the coals feel like play or like a chore?”
- “Did Mallam feel like a neighbour with a trade, and part of the evening?”
- “Did you hear the chime when you picked something up? Did it fit?”

## Pass aims for v40 (not promises; the owner sees the sheet)

- On days 8 to 10, no “nothing to do” stretch longer than 2 real minutes between 10:30 and 18:00.
- The board read without help by the second card.
- One child's thing given back without help.
- Each player rates the late morning at least 4 out of 5.

## What changed in the fix round (what testers will see)

- **A card every day.** A household that leaves the day's noon thing out still gets a new card the next morning; Today says “New notices are up.” only when a new card went up that day.
- **Mallam's kept order comes after the gist.** A round bought before the gist gets his regular's or season's line and the order stays kept. After the gist he says “Your two sticks are ready.” once (since the repair round only when a player within 4 m can see him), and the kept line (“Two sticks, as I promised…”) comes when the sticks are collected (see the repair round below).
- **The coals at the front of the stall.** From five, “Fan the coals” is offered from the stall's front (within 1.6 m of the fan point) even on Aunty Bisi's evenings; her buy still comes first where it is nearer than the base round. Act at the fan point before the coals are lit never buys the round.
- **The beat** is about 13.6 s for one player and about 12.2 s for a pair. A press made during the fanning pose is kept. With two players, after the first turn only the player who is not fanning is offered “Turn the sticks”.
- **Mallam stands at the east end of his stall**, where the desk cameras see him; his seat at the gist is unchanged.
- **A child's thing nobody heard fall**: the child asks about it at the pitch on a later day, and Today then says it is still on the sand. A shout nobody heard is made when a player comes within 20 m of the child that day.
- **“Read the noticeboard”** wins over “Talk to Mrs. Oyelaran” beside the board while a new card is unread, once the household has read the board before (after v40 discovery). On the discovery read itself (the first time the board is read), “Talk to Mrs. Oyelaran” can still win at the natural approach point, as ruled; the players then step to the board's other side or read after talking.
- **On phones** v40's bubbles keep clear of the pantry chip and the prompt pill and are never smaller than 13 px; Mallam's order panel fits a phone on its side without scrolling. Aunty Bisi's bubbles are unchanged.
- **Copy**: Mallam's name line is “Sannu. My name is Sani. Everybody calls me Mallam.”; the again cards have a third wording for each area; Kemi's play line promises nothing (“Next game I am passing to you first. Maybe.”).
- **Mallam's kept line** (“Two sticks, as I promised. …”) shows whole in its bubble, on four lines.
- **The keke and the danfo** look like the owner's pictures: a golden-yellow keke with a cream roof, “KEKE” boards, teal curtains and a rounded nose, and a golden-yellow danfo with a brown roof and rails, teal windows, “DANFO” on the street side and a stepped nose with cream headlights. They drive, turn and park exactly as before. Ask testers whether both read as a keke and a danfo at a glance, at a desk and on a phone; the wheels do not turn, and there are no wheel arches or rounded window corners (not in this build).

## What changed in the repair round (what testers will see)

- **Mallam's sticks after the gist.** “Your two sticks are ready.” is said once, only when Mallam is on the screen of the player who came within 4 m (before, at a desk it was often spent off screen from the rail side). At the stand, **“Collect your two sticks, ₦2,000”** hands over the kept order: ₦2,000, a cheer and energy for both and the clock on 18 minutes, as the base round, and his kept line. It works even when a round was bought between six and the gist (the base allows one round a sitting). An empty purse gets “Not enough in the purse” and the order stays kept. A household that skips the gist collects from ten in the evening; while their order waits he stays at his grill until half past ten, and Today says he is keeping two sticks until then. After a gist that ends late (a slow one from half past nine runs past half past ten), he stays seated through it and at his grill for half an hour after it ends, with the collection and Today's line (repair round 3). The next morning an uncollected order brings “Tomorrow, then.”
- **The first stick is a prompt.** When the beat ends nothing opens by itself: the prompt becomes “Taste the first stick”, and a press in the first 0.8 s after the beat (a fanning tap still coming) does nothing. The panel opens when a player chooses it. On a phone it takes a tap only once Act has been quiet for a second since it opened (repair round 4: its buttons show dimmed while that second runs, and brighten when it ends), and every press while it is open starts that second again (repair round 3: with the old 0.6 s a thumb tapping four times a second pressed Taste unseen and then bought the base round), so a thumb still tapping presses nothing. His name line (the first time) counts as said only once the panel carrying it has been open for that second with no tap. From the end of the beat, and for about two seconds after the taste panel closes, Act at the stand never buys the base round: the taste prompt, or “The coals are going.” doing nothing, is on top there. The same one-second hold applies to every v40 panel opened by a touch Act (the card's and the errand's thanks, Mama Nkechi's).
- **One player fanning in a pair.** If the other player at the stand has not turned the sticks within about two seconds of a turn being ready, the one fanning is offered “Turn the sticks”; the beat ends in about 13 s.
- **One order panel** for two same-frame presses on “Order two sticks for tonight”.
- **The card's pulse after an early read.** Reading yesterday's card before half past ten no longer stops today's new card from pulsing or from winning over Mrs. Oyelaran's talk.
- **An errand still in hand at Sleep** lapses then, and the sender's toast (“… took it over herself in the end.”) shows the next morning.
- **“Start a new household?” answered “No, keep it”** changes nothing: the card, Mallam and a beat in progress stay as they were.
- **A round bought in the afternoon** while Mallam is away brings no line when he arrives at five.
- **A child's thing lost while the gist is on** (one player still at the pitch) still drops after the gist.
- **A card thing is never placed within 2.2 m of a thing lying out** (the noon thing or a child's thing), and there is still a card every day. (v38's own noon thing can still land near a card thing already out; see the known limits.)
- **The transition tip comes first** on the evening before a season changes, ahead of the children's mention. If there is then no room for the mention, it is not said that night (it is never kept for another night); Today carries the child's thing when the drop was heard.
- **Copy**: the five wash wordings that opened “High water tonight.” now open differently, and none is close to v38's; Mr. Bassey's says “In my day we threaded them into necklaces.” (no child seller); Mrs. Oyelaran, out all afternoon, now says she wiped the rail at six, and that her radio was complaining about the damp when she came back; Mama Nkechi's marble line “His feet came home…” only once Emeka has gone home, and “He is still out at the pitch and his marble is already at my shop.” while he is still playing.
## What changed in repair round 4 (what testers will see)

- **The waiting second shows.** On a phone, while a v40 panel opened by Act is still holding its taps (Act quiet for a second), its buttons are dimmed; they brighten when the second is up. Note whether the players wait for them, or keep tapping.
- **Mallam stays through any gist.** However late the gist runs, he sits by his grill until it ends. With no order waiting, after a gist that ran past ten he gets up, stands at his grill for a few seconds and goes.
- **A reload during the gist keeps your sticks.** If the game is reloaded while the gist talks, the gist counts as ended at the reload: Mallam is at his grill with “Collect your two sticks, ₦2,000” until half past ten, or for half an hour from then if that is later, and Today still says “Mallam is keeping two sticks for you tonight.”.
- **“Your two sticks are ready.” only when its bubble will show** on the near player's screen. On a phone on its side, a player standing with Mallam just below their half hears nothing until they move a little closer.
- **Copy**: the again tips now look ahead to tomorrow (“Next it will be my {thing}, I can feel it.”); Mrs. Oyelaran's pegs are a “bag of clothes pegs”; her match lines are news others told her or her own opinion, with no hour (“The street has told me already: you won.”), since she is out all afternoon and a match can be decided after six (repair round 5).

## What changed in repair round 5 (what testers will see)

- **A wet match only when it was wet.** “Football in the wet. Mud to the knees…”, “Emeka played in the wet…” and Mrs. Oyelaran’s “A wet pitch today, they tell me.” are said only when the day’s rain began before the match ended. A Saturday-morning match with rain only in the afternoon gets none of them (v40 now keeps the hour the match ended, read from football’s own end of the match).
- **Mrs. Oyelaran names no hour and claims nothing she saw.** She is out from twelve to six and a match can be decided as late as twenty past six, so her match lines are what others told her or her opinion: “The street has told me already: you won.”, “So the children won. The whole street has been telling it.”, “Your first win. Half the compound queued up to tell me.”, “One day that ball will find my window.”.
- **Tunde is in the courtyard in the afternoon.** “I heard the shouting from the courtyard.” only after a match that ended at noon or later; his greeting, his mention of Mr. Bassey’s cassette (the errand: “The courtyard is learning to dance.”), a return line and two season lines no longer put him in the square.
- **Mr. Bassey watched the match**, so he never gives the general hearsay lines (“I heard there was football.”); “with no camera” is not said on the day he photographed the first win, and “we also stopped when the mothers called” only when Mama Nkechi called.
- **Small truths**: Emeka “danced on the spot” (he does not run to the water); “Kemi scored the most, I hear.”; “Football today, I hear.” (not “again”); the keke man is gone from the last-goal line; “Emeka was called in before the end.” only when the match was left unfinished.
- **The pegs card** reads “LOST: one bag of wooden clothes pegs, blue nylon.”.
- **The evening before a season changes**, the again tip, the pot ask and Ada’s ask use their season-free wording (they speak of tomorrow, which is in the next season).

## The harness for this build (for the person running the checks)

`node check/verify-gist-v40.cjs` (with `GIST40_JOBS=2` on a shared four-core machine; about fifty minutes) prints 114 PASS lines and ends “12/12 checks, 97/97 mutants red” (the fifth repair round's run took 34 minutes, the two runs on repair round 5's build, v40-991f5d9e, 31 and 32 minutes, and the two runs on the final build, v40-5f9ef4d7, 26 and 28 minutes; the fourth repair round's run, with 108 PASS lines and 91 broken copies then, took 34 minutes, and the two runs on v40-e8b20ce1 31 and 28 minutes; the run on v40-a8aade40, with 92 PASS lines and 75 broken copies then, took 29 minutes; the third repair round's run took 34 minutes, and the two runs on v40-6bcc652c, with 100 PASS lines and 83 broken copies then, 41 and 25 minutes). The fix round added these assertions, each failing on the integrated build where it is testable:
- check 2: “Read the noticeboard” over Mrs. Oyelaran's talk at (0.15, −4.31) while a card is unread, her talk back once read (S9);
- check 3: a household that leaves the noon thing out gets a card on all thirty days, a dead-end record still gets one, Today is not “new” for yesterday's unread card (DOD-F1); the spot probe drops spots within 2.2 m of a neighbour's place and lists them (S10); the again cards' third area form (DOD-F9);
- check 5: a drop nobody heard, then the child's ask the next day marks it heard and Today shows it (S6, I2);
- check 6 (d): the match line takes the night's insert before a card thing's return (S5);
- (fix round 2) check 6 (e): the browser play's day 9, the evening before harmattan (Tunde and Mama Nkechi, a match lost 1–3, her greeting carrying v39's stool button, no free reaction) carries the transition tip, in the night's one insert; check 7: every change evening of each sweep's household with a teller among the guests carries exactly one transition tip, shown, and no other evening has one; check 6 (b)'s quiet day is no longer a change evening (there the tip takes the insert first);
- check 7: the sweep runs to night 40, at most one line in five heard twice over nights 29–40 as well (DOD-F4, S11); Mallam's goodbye at most once in four evenings, booked (S4);
- check 8: a round before the gist keeps the order; the reminder not at 5.2 m, once (at 3.2 m until the repair round: see below); a round at 21:45 still gets the kept line (DOD-F5, S13); “Fan the coals” at (−3.3, 10.3), (−2.85, 10.86) and (−3.0, 10.6) on Aunty Bisi's evening, her buy at her stop, Act there spending nothing (S1); at most 15 s for one human pressing four times a second, and for one and two players under the bot (S2); no “Turn the sticks” for the fanner after the first turn (DOD-F7); Mallam's head on screen in both desk cameras, morning and five (S3); bubbles off the HUD chips and at least 13 px high (S7, S8); the exact name line (C4);
- check 12: every filled card for each thing and cycle, the notice for each pair, Mallam's filled lines, the board's strings, Ada's sketch mark and the underline (C16); every bubble drawn whole, with no line cut off (the finisher, for the kept line).

The new broken copies (M33–M54, M34 and M54 with their second halves M34b and M54b): M33 (the old 2.4 m radius round her stop), M34 and M34b (`cardFor40` without its last passes), M35 (the kept line before the gist), M36 (no watch at ten), M37 (no reminder), M38 (a press in the pose dropped), M39 (the turn offered to the fanner), M40 (the match line never inserts), M41 (the child's ask leaves the thing unheard), M42 (the board's read loses to her talk), M43 (card spots beside a neighbour), M44 (Mallam's goodbye every evening), M45 (Mallam back at (−3, 13.2)), M46 (no minimum text height), M47 (a bubble not moved off the chips), M48 (the again card in the first area form), M49 (the information wordings off), M50 (a sentence the owner did not see in his name line), M51 (a straight apostrophe in an area's again form), M52 (the sketch mark on every card in Ada's hand), M53 (the bubble cut to three lines again, so the kept line loses its end), M54 with its second half M54b (fix round 2: the transition tip placed after the line about today again); M32 now offers the fan where her buy comes first. The order panel's fit on a short screen cannot be measured in Node; it is checked in the browser captures.

The repair round added these, each failing on v40-77de7eb9 where it is testable:
- check 2: a read of yesterday's crossed card at 09:30, then at 10:30 today's card pulses and “Read the noticeboard” keeps its lead (H4, M64);
- check 3: every chain thing left out from day 5 or 9 to day 60, no card thing within 2.2 m of it; the bench spot under the glasses gives no spot; the proof that a card always exists (264 noon spots × the six children's spots or none) (VN-1, M63);
- check 4: an errand in hand at Sleep at 15:00 lapses, with the toast the next morning (H7, M67);
- check 5: one player home and one at the pitch, the children leave during the gist, the thing drops after it (H2, M70); Mama Nkechi's marble line “His feet came home…” only once Emeka has gone home, the other while he is still out (VC-6, M58);
- check 6 (f): a real change evening with a child's thing lost: with no free reaction the tip takes the insert and the mention is not said, with one the tip takes the reaction and the mention the insert; check 6 (b) lets a mention go unsaid on a change evening (VP-1b, M71 and M71b);
- check 8: a walk from the rail side at 1280 × 800 and at 390 × 844 (upper half), “Your two sticks are ready.” never said while Mallam is outside that player's camera and always before the fan point (VP-2, M55); no panel by itself at the beat's end, “Taste the first stick” as the prompt, three taps in the first 0.8 s open nothing, the player's Act opens it (H3, M56, M57); a pair where only one presses finishes within 15 s (VP-3, M62); the collection after a round at 18:05 and the gist, a purse that cannot pay, the gist skipped (collected from ten, gone at half past ten, “Tomorrow, then.”) (H1, M60, M61, M72); two same-frame order presses open one panel, with the name line (H5, M65); a reload mid-beat keeps who fanned (H6, M66); an afternoon round brings no line at five (H9, M69);
- check 11: the question, then “No, keep it”: the scene, the board's memory and a beat in progress unchanged (H8, M68);
- check 12: every top-level name ends in 40 apart from the spec's API names (VN-2, M73); no child seller in any line or card (VC-1, M59); Mrs. Oyelaran never at home “this afternoon” (VC-4, M74); no v40 wash wording opening “High water tonight. Tomorrow” or sharing five words in a row with a v38 one (VC-3, M75).

Harness changes forced by the rulings: check 8's ten-to-ten round tests the collection, check 11's “No, keep it” asserts nothing changes, check 8's fan-beat loops end when the beat ends and press the taste as the prompt, the reminder at 3.2 m became the walks, and the finds of M34, M34b, M37, M39 and M54 follow the new code.

The third repair round (RULINGS-3) added these, each failing on v40-a8aade40:
- check 8 (R3-1): home at half past nine, a slow gist (every line on its own timer) ending after half past ten: Mallam seated through it past half past ten, at his grill after it with Today's line, the collection works; the next night, home at 21:42 and uncollected, still there at the end plus 0.45 h and gone at the end plus half an hour (M76: no margin after the gist's end; M77: none during it);
- check 8 (R3-2): at 390 × 844 and at 844 × 390, a thumb after the fan beat, twelve taps in three seconds (each a pointer down, the touch Act, a pointer up and a click on the first button of any v40 panel open under it): nothing pressed, nothing spent, no base round, not tasted, the taste panel open with the name line on it and the name line unused until the panel has been open a second with no tap; then a deliberate tap tastes, and six taps straight after it buy nothing (“The coals are going.” on top); then the base round again. At 844 × 390 also an order panel opened by a tap and closed under the thumb: no order, the name line unused. After the keyed taste in the single-player beat, “The coals are going.” is on top and an Act buys nothing (M78: the hold not restarted by each press; M79: no hush; M80: the name line spent at once);
- check 12 (R3-3, R3-4, R3-6): no line of `GIST40.LINES`, `MALLAM40.LINES` or the cards shares a run of more than four words with a shipped v38 or v39 line (every quoted string of the four v38 and v39 modules) or another v40 line, with the place phrases and the listed fixed facts and forms masked (M81: Ada's old catfish wording); a line about today's rain only after rain that day (M82: “Rain like this wants soup” again; M83: Tunde's “The rain came through the courtyard today.” without its rain gate).
Harness changes forced by these rulings: check 8 waits about two seconds after a taste before it buys the base round, and M57's find follows the new `TASTE` entry.

The fourth repair round (RULINGS-4) added these, each failing on v40-6bcc652c:
- check 8 (R4-2): no order waiting, a slow gist from half past nine running past ten: Mallam seated by his grill throughout past ten, up at his grill when it ends, gone a few seconds later (M86: the ten o'clock hide again; M87: no beat at his grill);
- check 8 (R4-1): two stores the game itself saved while a gist talked, one between 22:15 and half past ten and one after half past ten, each carrying the mark of a gist begun with the order waiting, each booted in a fresh world (a child process, `--boot40`): at his grill with Today's line, the reload counted as the gist's end, still there 0.45 h later with the collection offered, collected (₦2,000, the kept line, Today silent) (M84: the mark not read; M85: no mark made);
- check 8 (R4-6, in the first boot): at 844 × 390, P1 standing still for 5 s at (−4, 8.5), where Mallam's bubble point is inside `boardSeen40`'s 0.1 margin but outside the camera: “Your two sticks are ready.” not said; walking up to the fan point it is said once the point and the bubble's height are inside the camera with no margin and the bubble clamp draws it (M88: the old margin);
- check 8 (R4-7): at 390 × 844 and 844 × 390, the panel's buttons dimmed (the `gist40-held` class) while the hold runs, and undimmed once it has run out with the panel still open (M89: never dimmed);
- check 12 (R4-5, R4-3): none of Mrs. Oyelaran's seven match lines says she watched or heard the match from home (M90); none of the twenty again tips says “today”, “a second time” or that the thing has already gone (M91).
The fifth repair round (RULINGS-5) added these, each failing on v40-e8b20ce1:
- check 12 (R5-1, R5-2): no match line rides the bare “it rained today” fact, and every match line about rain, wet or mud needs the rain to have begun before the match ended; none of Mrs. Oyelaran’s seven match lines claims an hour or a first-hand sight; in the world, with the match-end hour in v40’s record, a Saturday-morning match ended at 10:40 before rain at 14:00 and a match ended at 15:50 before rain at 16:00 make no wet line eligible, rain from 15:30 during a match or from 13:00 before one does, Tunde’s courtyard line only from noon (M92: the wet fact read from the day’s rain alone again; M94: “at six” again; M95: “touched my window” again); no general match line by Mr. Bassey (M96); on the evening before a change the again tip in its season-free wording (M97).
- check 6 (R5-1): after each real match end, v40’s record holds the day and hour football’s own end event gave (M93: the end event not read); its independent fact table reads the same hour from the harness’s own listener.
Repair round 5 changed two existing entries and no other: M90’s find now matches gs40-fb-oy7’s new words (the old words no longer exist; the broken copy still turns check 12 red), and check 6’s independent fact table gained the three new facts (wet, aft, nopic), read from the harness’s own record of football’s end event, so “its facts hold” still covers the new lines.

## Known limits to expect (v40)

- Every panel stops the clock, as before: the card, Mallam's order and Mama Nkechi's panel fill the late morning with walking and searching, not with panels.
- The repeat guard's memory starts the day the board is first read: a line last heard before then can come back once.
- A match that ended before v40 was discovered, or before an older save gained the record of when it ended, has no wet or afternoon facts that evening: those match lines are simply not said.
- On the evening before a season changes, the again tip, the pot ask and Ada’s ask fall back to their season-free wording or their own v38/v39 line, so they repeat a little more on those evenings.
- A child's thing lies on the sand until somebody picks it up; Kemi's goes back only to Kemi (at the pitch in the afternoons, or all afternoon on a morning-match day); Emeka's to Emeka or to Mama Nkechi at her shop. A thing in the hand never lapses; the child asks about it once.
- “Your two sticks are ready.” waits until Mallam is on a near player's screen (with no margin, repair round 4), so from the rail side at a desk it comes about 1.4 m from the stand, and on a phone about 3 m, in the near player's half; it does not look at the purse (an empty purse hears it, then gets “Not enough in the purse” at the collection).
- A card read on a later day whose place has since been taken by a new noon thing waits: its thing comes out once there is room.
- v38 places its own noon thing as before, so it can still land near a card thing already lying out (v38's code is unchanged); v40 never places a card thing within 2.2 m of a thing lying out.
- Aunty Bisi's bubbles are drawn as in v39: on a phone on its side one can sit under the pantry chip, and in the lower half of a tall phone her text is small.
- Days 15 onwards: the cards begin their “again” cycle (each owner's “again” words, each thing in a second place). Idle on the settled days stays over the aim (the README's v40 table): money has little left to buy.
