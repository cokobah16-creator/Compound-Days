# Playtest script: Evening gist and daily finds (v38)

One session, two players, one device, about 45 minutes of play plus a short debrief. The facilitator sets up, reads one scripted line, keeps a stopwatch and fills in the sheet. Everything else the players find in the game.

Build: **v38** (the Menu shows the exact build). Spec: `gist/SPEC.md` §17.2.

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
