# Testing v35: the phone check, five testers and the gates

This is how build v35 ("Three days in Palm Court") is tested before the town grows. It has three parts:

- **A.** The real-phone smoke test. The owner does this on their own phone, first (plan section 10, step 1).
- **B.** The guide for the five new testers (plan section 7).
- **C.** How to run the gates tool and read its report.

The game must be on the live link before any of this. The live link serves the build on the `master` branch, so v35 must be merged into `master` and deployed before anyone starts, the owner included. Check that the small print at the foot of the Menu names a v35 build. Test on the live link, not on a laptop.

---

## A. The real-phone smoke test (owner, own phone)

Use your own phone and its usual browser. Start a **new household** with a companion. Play the three days as a tester would. Tick each line, and write down anything that looks wrong, with a screenshot.

Note first: phone model, browser, and whether the phone is in low-power mode.

### The float and the shoreline
- [ ] At the rocks, Cast. The float lands in open water, not on the sand or the rocks.
- [ ] The float has a ring around it and bobs. You can see it without zooming.
- [ ] Just before the bite, the float twitches. At the bite it dips and the panel says “There! The float dipped.”
- [ ] Near the shore the water never shows sand through it, and the float always sits in water.
- [ ] Screenshot: the bite (call it d2-bite).

### The journal
- [ ] Open the journal from Tasks, and again from the Menu. All six tabs show (Today, Almanac, Garden, Finds, People, Home). On a narrow phone they wrap onto two rows.
- [ ] The morning card on Today is readable without zooming, and its button works.
- [ ] Scroll a long page (Finds), open a card, come back. The page keeps its place.
- [ ] Known issue: a toast covers the page heading for about two seconds (the evening reminder no longer does: it goes as the page opens). Note if it hides anything you needed.

### Decorating by touch
- [ ] On day 2, buy Ada’s armchair at Finds. Open Home. Tap the armchair in storage, then tap a free veranda cell.
- [ ] Turn it, undo, and place it again. Store something, then cancel a placement.
- [ ] The three kept cells (dashed) cannot take furniture. You can still walk to the pot and out of the door.
- [ ] Buy a paint and paint the front room. Undo it, then paint again.
- [ ] Reload the page and Continue. The armchair and the paint are still there.
- [ ] All of this takes under a minute with your thumb. Screenshot: the chair on the veranda (d2-chair).

### Frame rate during fishing (the Menu perf line)
- [ ] Stand at the rocks with the water in view for half a minute. Open the Menu. The small print says “Play frame rate about N fps”. Write down N. The target is 30.
- [ ] No message said “Render resolution stepped down” or “Lighter graphics”. If one did, the Menu small print says “Graphics stepped down this session”. Write that down.
- [ ] Fish four times. Watch the float and the bite for stutter by eye.
- [ ] Note: the perf line only measures play with no page open. The fishing panel is a page, so its time is not measured. Read the line straight after fishing, and trust your eyes for the bite itself.
- [ ] Do the same on day 3 during the veranda evening.

### The Act button
- [ ] At the rocks, open fishing. The on-screen Act button presses Cast, then Reel in, then Keep, then Cast again. One button does the whole loop.
- [ ] Away from fishing, Act does its usual job and never presses a page button.

### The evening framing (day 3)
- [ ] On day 3, before six, Today offers “Wait on the veranda until six”. Use it, or stand on the veranda at six.
- [ ] Tunde, Mama Nkechi and Ada walk in from the gate and stand in a row by the rail. All three, you and your companion fit on the screen in portrait.
- [ ] Nobody turns their back to the camera. The camera moves smoothly, with no jumps, from the gate to Goodnight.
- [ ] Nobody else walks through the group or in front of it while they talk.
- [ ] From the moment they arrive until they have gone, no street sign (such as Suya) sits over them, you or your companion. A sign that would fades out, and fades back in once they have gone. Nothing blinks off or on.
- [ ] After Goodnight they walk off along the street away from you (usually to the left), and nobody walks between the camera and you. Once they are off the screen they go back to their usual places.
- [ ] Each says one line. Ada’s mentions the armchair if it is placed.
- [ ] Screenshots: the harvest (d3-harvest) and the evening (d3-evening).

### Sound, muted and unmuted
- [ ] With the phone’s sound on, Menu shows “Sound: on”. You hear the cast, the nibble, the bite, the catch and the watering.
- [ ] Mute the phone (silent switch or volume to zero). Fish again. You can still tell what happened from the screen alone: the float lands, twitches and dips, the catch card shows, the soil darkens.
- [ ] Turn “Sound: off” in the Menu. Reload. It stays off.

### A reload mid-day
- [ ] Partway through a day, close the browser tab. Open the link again and press Continue.
- [ ] You are in the same day, with the same purse, crop and furniture. A catch card you left open comes back and pays once.
- [ ] Menu shows “Days in Palm Court” with today’s minutes still counting from where they were.

When you are done, use Part B’s copy steps on your own game and run the gates tool on it (Part C). Your own run is not one of the five testers.

---

## B. The five-tester session guide

### Who
- Five people who have **not** played or seen Compound Days, and have not been told how it works.
- Adults, on their **own phones**. A mix of people who play games and people who rarely do.
- Not the owner, not anyone who helped build it.

### Consent (say this before they start)
- “This is a test of a game, not a test of you. You can stop at any time.”
- “The game keeps a small log on your phone. It notes when each day starts and ends, how many minutes you play, the faces you choose, the two short answers you may type on the third day, and actions such as casting or planting.”
- “It does not record your name, your contacts or where you are.”
- “The log stays on your phone. I only see it if you copy it and send it to me. You can say no.”
- “May I watch and take notes while you play?”
- Use their first name only in your own file names. Delete the pastes when the study is over.

### Setup
- Send them the live link. They open it in their usual browser.
- They start a **new household** and choose to play with a companion (playing alone is fine too). **Not online play**: online households keep no log.
- If the title screen offers Continue from an earlier try, use a fresh browser profile or clear the site’s data, so the log starts clean.
- Phone sound as they normally have it. Write down the phone model.

### What to say
Say this, then stay quiet:

> “It’s a cosy game about a new home in a Nigerian compound. Play however you like, for as long as you like today. Please think aloud if you can. I can’t help you with how to play, because that is what we’re testing. When you stop, I’ll show you how to copy a note for me.”

### What not to say (no coaching)
- Do not explain fishing, money, Finds, the armchair, the pot, decorating, the evening or the Sleep button.
- Do not point at the screen or touch their phone.
- If they ask “What do I do?”, say “What would you try?” or “Whatever you think.”
- If they are stuck, wait. If they want to give up, you may help. Then write `Coached: yes` in their file and a `Note:` saying what you said.
- **Coaching:** telling them what to do or where to go, showing a button, explaining a rule.
- **Not coaching:** help with the phone itself (volume, the browser), reloading a page that froze, and reminding them how to copy the log.

### What to watch for and note
Write the time from your own watch next to each note.
- Where they hesitate or look lost, and for how long.
- Whether they find the float and know when to reel in.
- Whether they read Today and the morning card.
- Whether they notice the purse is short, and what they do about it.
- Whether they buy the armchair, where they put it, and if placing it is fiddly.
- What they say about Tunde, Mama Nkechi and Ada.
- Whether they see the veranda evening on day 3, and how they react.
- Text they cannot read, buttons they miss, stutter, a hot phone.
- Whether they want to keep playing when they stop.

### Sittings
- A sitting can stop anywhere. Days 2 and 3 can be later sittings.
- Tell them to play again whenever they feel like it. Do not name a day or a deadline.
- Note for the owner: gate 2 measures whether testers come back on their own. Naming a deadline, such as “within two days”, would bias it.

### After each sitting: the copy button
Ask the tester to:
1. If the day is over, press **Sleep until tomorrow**, choose a face, then press **Sleep until tomorrow** again. The second press ends the day: without it the log does not record that they slept.
2. Close any open page (for example **Back to the compound**).
3. Open the **Menu** (top right) and tap **Copy timeline and days**. A message says “Timeline copied.”
   If a page with the text opens instead, press and hold on the text, select all of it, and copy.
4. Paste it into a message to you (text message, WhatsApp or e-mail). Paste **all** of it: the last line starts `CD35/1 end`.
5. Close the browser tab. Next time, they open the link again and press **Continue**.

You (the reviewer):
- Save each paste as a plain text file named for the tester and the sitting: `amaka-1.txt`, `amaka-2.txt`, and so on.
- Add your lines at the top of the file, one per line:
  - `Tester: Amaka`
  - `Coached: no` (or `Coached: yes`)
  - `Note: asked where the rocks were` (as many as you like)
  - `Done: yes` once that tester has finished all their sittings.

Copying on the morning page counts as starting the next day in the log. That is fine: the tool takes the real return from the next Continue, or, if the tab was left open, from the first tap after ten minutes or more away.

### The day-3 prompts
- After they choose a face for day 3, two optional boxes appear on the night page: “One thing you want for your flat” and “One thing you know about a neighbour”. They save as they are typed.
- Do not mention them beforehand, and do not suggest answers. If asked, say “They’re optional. Up to you.”
- If day 3 ended with the “Past midnight” page, the faces and the boxes appear on the next morning’s Today page instead.

---

## C. The gates tool

`tools/gates-v35.cjs` reads the pastes and reports the seven gates. It needs only Node, with nothing to install.

```sh
node tools/gates-v35.cjs pastes/*.txt               # report so far
node tools/gates-v35.cjs --final pastes/*.txt       # once every sitting is in
node tools/gates-v35.cjs --json pastes/*.txt        # the same as JSON
pbpaste | node tools/gates-v35.cjs                   # one paste from the clipboard (start it with a Tester: line)
```

Options:
- `--final`: every sitting is in, so anything not yet done counts as not done.
- `--testers N`: how many testers to expect (default 5). “Four of five” becomes four fifths of N, rounded up.
- `--now 2026-11-04T18:00:00Z`: today’s date and time, so a tester who has not come back for day 3 after 48 hours counts as not back. Without it the tool uses the time of their latest paste. The tool never reads the clock itself.

Several sittings from one tester merge by day. The tester’s name comes from a `Tester:` line, or from the file name without its sitting number (`amaka-2.txt` is Amaka). One file can also hold several testers, each starting with its own `Tester:` line.

### Reading the report
The table has one row per tester:
- **Days**: the last day they started.
- **Real min d1/d2/d3**: minutes of play plus pages for each day. A `+` means that day has not been slept yet.
- **Ratings**: the faces for days 1 to 3 (1 not much, 2 nice, 3 lovely).
- **Prompts**: how many of the two day-3 answers look specific.
- **First catch**: play time from first reaching the rocks to the first catch.
- **Evening**: the day they saw the veranda evening.

Each gate then shows **PASS**, **FAIL** or **NOT YET**, with its numbers:
1. **Four of five finish day 2 without coaching.** The log shows who slept on day 2. Coaching is your call, so a tester only counts once their file says `Coached: no`. Until then the gate says NOT YET and names who is missing a note.
2. **Day 3 within 48 hours of day 2’s Sleep.** Day 3 starts at the first return logged after day 2’s Sleep: a Continue, or the first tap after ten minutes or more away (or the page shown again after ten minutes hidden). The report marks it “(by its return)”. If a tester copied on the day-3 morning page, the return is the first one after that copy, however long they spent on the morning pages. Without a return, it is day 3’s first tap.
3. **Day 3’s mean rating is at least day 1’s, and three of five give day 3 the top face.**
4. **Both day-3 prompts answered specifically.** The tool counts an answer with two words, or one word of four letters or more, unless it is a non-answer such as “nothing” or “idk”. The report quotes every answer. Read them yourself.
5. **The median real day is 20 to 35 minutes.** It uses days 1 to 3 that were slept. If it stays under 20, the plan slows the clock outside the guided evening.
6. **Four of five see the veranda evening on day 3.** An evening first seen on day 4 does not count.
7. **First catch within two minutes of first reaching the rocks.** Measured in play time, across a night if needed.

The **Notes** at the end list problems with the pastes:
- “no day log”: an online household, or the paste was only the first-evening timeline. Ask for a new paste from a companion or single-player game.
- “the data block … cut” or “does not match its check value”: the paste was cut short or edited. The tool reads the readable lines instead (minutes to 0.1). Ask for the paste again if anything is missing.
- “sittings disagree on when day N started”: two households or two phones. Ask the tester.

### What the paste holds
The paste has three parts: the first-evening timeline, the readable days (`Day 1 · started … · slept … · play … min · panels … min · rating 2/3`, then the events), and a data block for the tool. The block is the same days in JSON, cut into short lines that each start `CD35/1`, and it ends with `CD35/1 end <length> <check>`. It carries no name, only the log and the two typed answers.

### Checking the tool
`node check/verify-gates-v35.cjs` plays a household through three days in Node, copies the real paste, and checks the tool against it. It also checks five-tester sets at each gate’s boundary, and broken pastes. It writes `check/results-gates-v35.json`.
