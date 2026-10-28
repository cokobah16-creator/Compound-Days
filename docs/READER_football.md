# Monkey post (v37): the Nigerian reader's sheet

Build **v37-683ed1f2** (check the game's Menu). This sheet is for the owner's Nigerian reader (spec §11.5). It lists every word street football puts in front of a player, taken straight from the game's own copy table (`FOOTBALL37.LINES` at the top of `dist/src/football-v37.js`), so **Ships now** is exactly what the game says today. Rows are named by their key in that table (for example `bassey.goalA a5`); the owner changes a line in that one place.

Nothing here has been seen by a Nigerian reader yet. The rule (spec §11.5): copy the reader flags is replaced by the reader's wording or cut, never shipped as it is. The harness `check/verify-football-v37.cjs` reads most of these strings from the same table, so changing a line in `LINES` does not break it.

**How to use it.** Read section 1 first: one answer there can change many lines. Then go down the tables and mark each line **OK**, or write the wording to use instead, or **cut**. To see the lines in place, play the game with `?football=now` in the address (the children are out from 6:00 am every day) and play a match or two; Mr. Bassey's lines show under the score.

**Where the strings are not in the table.** The playtest-only Menu panel "Football runs" writes its own few words (for example "No matches yet.", "kicks", "passes", "calls", "outs", "motor", "street call"), and the prompt while a shot is held reads "Shoot ▮▮▯▯". Both are facilitator-facing.

## 1. Words and customs to confirm first

| Term or custom | Where it appears | Ask the reader | If it is wrong |
|---|---|---|---|
| **"monkey post"** | "Play monkey post", the Menu card (which explains it once: from "mocking post"), the morning line, Today, the album, the role line "Monkey post · Green" | Is "monkey post" what children call small-goal street football? Does the one-line explanation stop anyone misreading "monkey" next to Black children? | Keep the name and the explanation, or use the reader's word everywhere. |
| **"Last goal wins"** | The banner, Kemi's shout, Mr. Bassey, the summary, Today, Tunde, Mama Nkechi, the album | Would Nigerian children say "last goal wins", "next goal wins", "golden goal" or something else? | The reader's phrase, in every row that has it. |
| **"Motor!"** | A child's shout and the prompt when the keke comes through | Is "Motor!" (or "Car!") what children shout when a vehicle comes through the game? | The reader's word. |
| **"Release!"** | The calling player's bubble and the other player's chip "{name}: Release!" | Does "Release!" mean "pass it to me" on a Nigerian street? | "Pass am!" in the bubble; the chip "{name} wants the ball". |
| **"Ojoro"** | Mr. Bassey: "Ojoro? No. I saw it. It went in." | Right for "that's cheating", from an elder confirming a goal? | "No, no. I saw it. It went in." |
| **"guiding"** | Mr. Bassey: "See guiding!" | The word for shielding the ball? Natural as a shout? | "Clean dribble!" |
| **"We don tire"** | Kemi at the tiredness cap | Natural for an eleven-year-old? | "We are tired. Last goal wins!" |
| **"Oya"** | Kemi at set-out and every kick-off, "Oya, come back!", "Oya, take am!" | Used naturally, or too often? | Keep at kick-off only. |
| **"Auntie"** | Emeka when called: "Auntie is calling me!"; Mama Nkechi quoting him: "Last goal, Auntie, last goal!" | Is "Auntie" what a nephew living with her calls her? | The reader's word. |
| **Mr. Bassey in Pidgin** | A retired wedding photographer who speaks careful English elsewhere; at the pitch: "Na so! Clean, clean.", "Ah ah! Una no fit stop am?", "Make una shift for motor!", "Next time una go learn.", "We go finish am tomorrow, abi?" | Does a man like him switch into Pidgin to tease children at a street game? Does "Next time una go learn" tease or belittle? | Plain English versions of those lines. |
| **The street's call** | Toast: "Off the stone! The street says it went in." | Do the people watching decide a ball that hits the stone, and give it to the visitors? | Turn it off: `OWNER.streetCall=false`. |
| **Stone cairns for posts, Emeka's slippers beside them** | Set-out; Mr. Bassey's line "Emeka, where are your slippers? Oh. By the goal." | Familiar? Right that the slippers lie beside the stones, not used as posts? | The sandcrete-block goal is in the spec but not built. |
| **The hours** | The Menu card: "after school from 3:30 pm to 6:30 pm, and at the weekend from 10:00 am, or from 3:00 pm after church"; Kemi's late lines | Right for a southern street? Is it all right to assume church on Sunday, or say "in the afternoon"? | `HOURS.weekday`, `HOURS.sat`, `OWNER.sundayFrom`; late line "Tomorrow afternoon." |
| **Asisat Oshoala by name** | Only behind `OWNER.realName` (false); the fallback "That girl was born with a ball at her feet." ships | May Mr. Bassey say "That girl plays like Oshoala"? | The fallback ships already. |

## 2. People and how they are named

| Item | Ships now | Ask the reader |
|---|---|---|
| **Kemi**, about eleven, the best dribbler around | A Yoruba name; yellow T-shirt, braids, jeans, trainers | Fine for a southern compound? Nothing in the game comments on her being a girl. |
| **Emeka**, about ten, Mama Nkechi's nephew, plays barefoot | An Igbo name; white T-shirt, jeans rolled at the ankle, bare feet | Is a nephew living with his aunt natural? One child in trainers and one barefoot, beside the visitors' good ball: ordinary street football, or a rich child and a poor child? |
| **How the children look** (new in build v37-683ed1f2) | A tester read them as short teenagers, so they are now built as children: Kemi 1.45 m and Emeka 1.39 m (their heads at an adult's chest), with a larger, rounder head, shorter legs, narrower shoulders, a slighter build and slightly bigger eyes than the adults. The owner was asked "Make them look younger?" and said yes. To see them, play with `?football=now` and stand beside them | Do they look about ten and eleven: children, not teenagers, and not toddlers or cartoons? Does anything about how they are drawn feel wrong for Nigerian children of that age? |
| **Mr. Bassey** | Spelt as the rest of the game spells him | Is an elder at the touchline taking the photo a natural thing? |
| **"the small ones"** | Mr. Bassey and Tunde | Natural Nigerian English? |
| **"Us" and "Kemi & Emeka"** | The score chip and the summary | Fine? |

## 3. Every line, as the game ships it

### Toasts

A toast at the top of the screen. Plain English.

| Key | Ships now | When | Reader: OK? | Reader: change to |
|---|---|---|---|---|
| `toasts.firstKick` | Good touch. Kemi and Emeka play monkey post at the end of the street in the afternoons. | After the first kick, once | | |
| `toasts.firstKickAlone` | Good touch. | The same, with OWNER.children false | | |
| `toasts.fetch` | Emeka ran to get your ball. | Set-out, when the ball is far away | | |
| `toasts.measure` | Kemi measures the goals heel to toe. | Set-out | | |
| `toasts.street` | Off the stone! The street says it went in. | A shot off the stone that the street counts (once a match) | | |
| `toasts.ownGoal` | Own goal! | An own goal | | |
| `toasts.square` | Goal at the square! Goals at the square: {n}. | A shot through the white goal frame at the square | | |
| `toasts.finishGame` | Finish the game first. | A bench button pressed during a match | | |
| `toasts.bench` | Finish carrying Ada’s bench first. | Asking for a match while the bench is carried | | |
| `toasts.sofa` | Put the sofa down first. | Asking for a match while the sofa is carried | | |
| `toasts.seated` | Stand up first. | Asking for a match while seated | | |
| `toasts.photoLast` | {bassey} took a picture: last goal wins, and it was ours. | Mr. Bassey's photo (album caption) | | |
| `toasts.photoWin` | {bassey} took a picture: our first win at monkey post, Us {a}, Kemi and Emeka {b}. | Mr. Bassey's photo (album caption) | | |
| `toasts.remember` | Monkey post at the end of the street: Us {a}, Kemi and Emeka {b}. | The album memory after a match | | |

### The children's shouts

A speech bubble over Kemi or Emeka (and, when that child is off-screen in a half, the commentary line under the score: "Kemi: …"). Pidgin is allowed here.

| Key | Ships now | When | Reader: OK? | Reader: change to |
|---|---|---|---|---|
| `shouts.setout` | You two against us two. Oya! | Kemi, at set-out | | |
| `shouts.oya` | Oya! | Kemi, at kick-off and after the keke | | |
| `shouts.goal` | Gooool! | The scoring child | | |
| `shouts.ourBall` | Our ball! | A child winning the ball | | |
| `shouts.motor` | Motor! | The child nearest the keke | | |
| `shouts.cap` | We don tire. Last goal wins! | Kemi, at the five-minute tiredness cap | | |
| `shouts.called` | Auntie is calling me! | Emeka, when Mama Nkechi calls at 6:20 pm | | |
| `shouts.ownGoal.kemi` | Kemi! | Emeka, when Kemi scores an own goal | | |
| `shouts.ownGoal.emeka` | Emeka! | Kemi, when Emeka scores an own goal | | |
| `shouts.last` | Last goal wins! | Kemi, when "Last goal wins" starts | | |
| `shouts.unfinished` | We go finish am tomorrow. | Kemi, an unfinished match | | |
| `shouts.away` | Oya, come back! | Kemi, when the players walk away from a match | | |
| `shouts.passBack[0]` | Your ball! | A child passing your ball back | | |
| `shouts.passBack[1]` | Oya, take am! | A child passing your ball back | | |
| `shouts.bye` | Tomorrow again! | Kemi, going home | | |
| `shouts.late.school` | It’s late. Tomorrow after school. | Kemi, asked to play after 6:00 pm (tomorrow a school day) | | |
| `shouts.late.sat` | It’s late. Tomorrow morning! | Kemi, the same (tomorrow Saturday, or playtest hours) | | |
| `shouts.late.sun` | It’s late. Tomorrow after church. | Kemi, the same (tomorrow Sunday) | | |

### Mr. Bassey's commentary

His speech bubble and the commentary line under the score ("Mr. Bassey: …"), during a match. No line repeats in a day until the others in its group have been used. Pidgin is allowed in speech.

| Key | Ships now | When | Reader: OK? | Reader: change to |
|---|---|---|---|---|
| `bassey.goalA[0] a1` | Ehen! See leg work! |  | | |
| `bassey.goalA[1] a2` | Goal! Even my knees felt that one. |  | | |
| `bassey.goalA[2] a3` | Na so! Clean, clean. |  | | |
| `bassey.goalA[3] a4` | That one would be in the net, if there was a net. |  | | |
| `bassey.goalA[4] a5` | My camera is not fast enough for that one. |  | | |
| `bassey.goalA[5] a6` | Who taught you that? Not me. |  | | |
| `bassey.goalA[6] a7` | That ball had eyes. |  | | |
| `bassey.goalA[7] a8` | Sharp, sharp! Between the stones. |  | | |
| `bassey.goalB[0] b1` | That girl was born with a ball at her feet. | only when kemi scored | | |
| `bassey.goalB[1] b2` | Emeka, where are your slippers? Oh. By the goal. | only when emeka scored | | |
| `bassey.goalB[2] b3` | The small ones are teaching you today. |  | | |
| `bassey.goalB[3] b4` | Ah ah! Una no fit stop am? |  | | |
| `bassey.goalB[4] b5` | The children have spoken. |  | | |
| `bassey.goalB[5] b6` | Defend, my people, defend! |  | | |
| `bassey.goalB[6] b7` | Small legs, big goal. |  | | |
| `bassey.goalB[7] b8` | They practise every afternoon. It shows. |  | | |
| `bassey.own[0] o1` | Ah, wrong goal! It happens to everybody. Even me, in 1979. |  | | |
| `bassey.post[0] p1` | Stone! Who put that stone there? |  | | |
| `bassey.post[1] p2` | Off the stone. Unlucky. |  | | |
| `bassey.street[0] s1` | Ojoro? No. I saw it. It went in. |  | | |
| `bassey.street[1] s2` | From where I am standing, that one entered. |  | | |
| `bassey.dribbleUs[0] d1` | See guiding! |  | | |
| `bassey.dribbleKemi[0] d2` | Leave am, leave am, she don pass you. |  | | |
| `bassey.showOff[0] l1` | They are showing off now. |  | | |
| `bassey.serious[0] l2` | Ehen. Kemi is serious now. |  | | |
| `bassey.motor[0] m1` | Make una shift for motor! |  | | |
| `bassey.cap[0] c1` | Everybody is tired. Last goal wins. |  | | |
| `bassey.call[0] c2` | Last goal wins! Mama Nkechi is calling. |  | | |
| `bassey.won[0] e1` | Well played. Go and drink water. |  | | |
| `bassey.won[1] e4` | A proper game. Well done, all of you. |  | | |
| `bassey.won[2] e5` | Victory! Now go and rest your legs. |  | | |
| `bassey.lost[0] e2` | Tomorrow you will beat them. Maybe. |  | | |
| `bassey.lost[1] e6` | The children were sharper today. It happens. |  | | |
| `bassey.lost[2] e7` | No shame in it. They play here every day. |  | | |
| `bassey.unfinished[0] e3` | We go finish am tomorrow, abi? |  | | |
| `bassey.photo[0] f1` | Stand still, stand still. Yes! That one is the keeper. |  | | |

### The neighbours after a match

One line each when you talk to them, on the day of a match or the day after (Mr. Bassey's when you talk to him). Mama Nkechi's evening line is said once, on the veranda evening after a match.

| Key | Ships now | When | Reader: OK? | Reader: change to |
|---|---|---|---|---|
| `neighbours.tunde.won` | I heard you beat the small ones at the end of the street. Don’t let it go to your head. Kemi will want revenge. |  | | |
| `neighbours.tunde.lost` | Kemi beat you? Join the club. She did me last week. |  | | |
| `neighbours.tunde.other` | Last goal wins, and nobody scored? That is a true street game. |  | | |
| `neighbours.nkechi.won` | Emeka came home talking about you. He wants a rematch after his food. |  | | |
| `neighbours.nkechi.lost` | Emeka came in grinning from ear to ear. So you were the ones he beat? |  | | |
| `neighbours.nkechi.other` | I called him in and he said, ‘Last goal, Auntie, last goal!’ |  | | |
| `neighbours.nkechi.otherUncalled` | Emeka says nobody won. He says it like it is a trophy. |  | | |
| `neighbours.ada.won` | Mr. Bassey told the whole Yard about your goal. I have heard it four times. |  | | |
| `neighbours.ada.lost` | Lose today, win tomorrow. That is how the street works. |  | | |
| `neighbours.ada.other` | A draw? Then everybody gets to talk. |  | | |
| `neighbours.bassey.won` | I am still talking about that goal. |  | | |
| `neighbours.bassey.lost` | Ah, these small ones! Next time una go learn. |  | | |
| `neighbours.bassey.other` | Unfinished business. The best kind. |  | | |
| `neighbours.nkechiEvening` | Emeka told me the whole game before he even washed his feet. Every goal, twice. | Mama Nkechi on the veranda evening, after a match (new in this build) | | |

### The interface

Prompts, the score chip, the summary strip, hints, the Menu card, the Today page and the morning card. Plain English, no Pidgin.

| Key | Ships now | When | Reader: OK? | Reader: change to |
|---|---|---|---|---|
| `ui.us` | Us |  | | |
| `ui.them` | Kemi & Emeka |  | | |
| `ui.firstTo` | first to 3 |  | | |
| `ui.lastGoal` | Last goal wins |  | | |
| `ui.role` | Monkey post · Green | The role line on the player card in a match | | |
| `ui.hint` | Tap {k}: pass · hold {k}: shoot · {k} away from the ball: call for it | The first-match hint on a large half | | |
| `ui.hintShort` | Tap {k}: pass · Hold {k}: shoot | The first-match hint on a phone half, for 4 s | | |
| `ui.landscape` | Turn the phone sideways: both of you get more room. | An upright phone with two players, for 4 s after the first kick-off | | |
| `ui.keyName[0]` | E |  | | |
| `ui.keyName[1]` | Enter |  | | |
| `ui.touchName` | Act |  | | |
| `ui.padName` | A |  | | |
| `ui.releaseChip` | {name}: Release! | The other player's half, when one calls for the ball | | |
| `ui.goalArrow` | Goal |  | | |
| `ui.goalSprite` | GOAL! |  | | |
| `ui.fullTime` | Full time · Us {a} – {b} Kemi & Emeka |  | | |
| `ui.lastUs` | Last goal wins · Us! ({a} – {b} before it) |  | | |
| `ui.lastThem` | Last goal wins · Kemi & Emeka! ({a} – {b} before it) |  | | |
| `ui.unfinished` | Unfinished · {a} – {b} · to finish tomorrow |  | | |
| `ui.goals` | Goals: {list} |  | | |
| `ui.og` | (o.g.) |  | | |
| `ui.morning` | Kemi and Emeka play monkey post at the end of the street today from {h}. | The morning card on the Today page (reworded in this build: "today from") | | |
| `ui.morningFlag` | Kemi and Emeka play monkey post at the end of the street. |  | | |
| `ui.waypoint` | The end of the street |  | | |
| `ui.waypointToast` | Kemi and Emeka are playing at the end of the street. |  | | |
| `ui.benchWait` | Sit until {h} | A button on Ada's bench page (new in this build) | | |
| `ui.benchWaitSub` | Then Kemi and Emeka are out at the end of the street | Under that button (new in this build) | | |
| `ui.kick` | Kick · hold to shoot |  | | |
| `ui.call` | Call for it |  | | |
| `ui.motor` | Motor! |  | | |
| `ui.road` | Wait for the road to clear |  | | |
| `ui.play` | Play monkey post |  | | |
| `ui.again` | Another game? |  | | |
| `ui.wait` | Wait for {name} |  | | |
| `ui.menuTitle` | Street football. |  | | |
| `ui.menuWhat` | Monkey post (from “mocking post”, a joke on real goalposts) is small-goal street football: no keeper, no referee. |  | | |
| `ui.menuWhen` | Kemi and Emeka play at the end of the street after school from {wd0} to {wd1}, and at the weekend from {sat}, or from {sun} after church. |  | | |
| `ui.menuHow` | Walk into the ball to dribble. Tap action near it to pass, hold to shoot. Action away from the ball calls for it. |  | | |
| `ui.menuRecord` | Played {played} · won {won} · goals at the square {square}. |  | | |
| `ui.menuOnline` | Monkey post needs you both on one device. |  | | |
| `ui.menuHome` | Ball stuck? Bring it back |  | | |
| `ui.menuStop` | Stop the game |  | | |
| `ui.menuRuns` | Football runs |  | | |
| `ui.controls` | dribble the ball by walking into it; tap action near it to pass, hold to shoot | The Menu's controls line, after the first kick | | |
| `ui.release` | Release! |  | | |
| `ui.today.won` | Monkey post {when}: won {a}–{b}. |  | | |
| `ui.today.wonLast` | Monkey post {when}: last goal wins, and it was ours. |  | | |
| `ui.today.lost` | Monkey post {when}: Kemi and Emeka won {b}–{a}. |  | | |
| `ui.today.lostLast` | Monkey post {when}: last goal wins, and it was theirs. |  | | |
| `ui.today.unfinished` | Monkey post {when}: unfinished at {a}–{b}. |  | | |
| `ui.today.today` | today |  | | |
| `ui.today.yesterday` | yesterday |  | | |

### Not shipped

Behind `OWNER.realName` (false). Only with the owner's and the reader's approval.

| Key | Ships now | When | Reader: OK? | Reader: change to |
|---|---|---|---|---|
| `realName` | Kemi again! That girl plays like Oshoala. |  | | |


## 4. Also new in this build, outside football's table (the bench's copy)

| Where | Ships now | Reader: OK? | Reader: change to |
|---|---|---|---|
| Act while seated on Ada's bench: the prompt | Sit a while | | |
| The bench's page | Ada’s bench / Long enough for everybody, short enough to argue on. | | |
| The bench's page, buttons | Wait here until six (under it: "The neighbours come by this evening") · Sit for a minute · Stand up | | |
| Ada on the veranda evening, after the bench is home (once) | Look at you two, on my bench, on your own veranda. I told you it was long enough for everybody. | | |

## 5. What changed since the earlier draft of this sheet (build v37-8905514d)

These earlier recommendations are already in the game, so the tables above show them: Emeka's call is "Auntie is calling me!"; the unfinished summary says "to finish tomorrow" (Pidgin stays in shouts); the first-kick toast says "in the afternoons"; the own-goal toast is just "Own goal!"; the kick-back shout is "Your ball!" / "Oya, take am!"; times read "3:30 pm" as the top bar does; "Mr. Bassey" is spelt as the cast spells him; Mama Nkechi's "I called him in" line is used only when she did call (otherwise "Emeka says nobody won…"); the morning line gives no hour under a URL flag. Since then: Mr. Bassey has eight lines per goal category (a5–a8, b5–b8) and three per result (e4–e7); the first-match hint is worded per key; the morning line says "today from 3:30 pm" in a card of its own; Mama Nkechi has an evening line after a match; Ada's bench page offers "Sit until 3:30 pm" when the children come out later that day. In build v37-683ed1f2 the children are drawn younger (section 2, "How the children look"); no line of copy changed.
