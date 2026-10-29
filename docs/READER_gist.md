# Evening gist and daily finds (v38): the Nigerian reader's sheet

Build **v38** (the Menu shows the exact build). This sheet is for the owner's Nigerian reader (gist/SPEC.md §13.6). It lists every word the evening gist and the daily finds put in front of a player, taken straight from the game's own copy tables: `GIST38.LINES` and `GIST38.UI` at the top of `dist/src/gist-v38.js`, and `FOUND38.SPEECH`, `FOUND38.UI` and `FOUND38.LOST` at the top of `dist/src/found-v38.js`. **Section 3 is generated from those files by `node tools/reader-v38.cjs`**, so it is exactly what the game says today, every string once (regenerate it after any copy change). Rows are named by their id (for example `gs38-lost-lenscap`); the owner changes a line in that one place.

Nothing here has been seen by a Nigerian reader yet. The rule (spec §13.6): copy the reader flags is replaced by the reader's wording or cut, never shipped as it is. The harness `check/verify-gist-v38.cjs` reads the lines from the same tables (check 5 holds them to the copy rules), so changing a line does not break it, as long as it keeps to the rules: no weekday names, British spelling, no digits or ₦ in speech (except Mr. Bassey's "1979"), curly apostrophes, at most 160 characters.

**How to use it.** Read section 1 first: one answer there can change many lines. Then go down the tables and mark each line **OK**, or write the wording to use instead, or **cut**. To see the gist in place, play to day 4 (the veranda evening on day 3) and be at home from a quarter past six; `?gist=now` in the address brings the gist any time from 07:30 once the veranda evening is past.

**How a gist goes.** Two neighbours come to the veranda rail every evening once the first veranda evening (day 3) has happened. Everyone stands; a pair sitting on Ada's bench stand up to greet them, and the household at home step up to the rail as the guests arrive. Five to seven lines: two greetings, a line about today when there is one, a tip about tomorrow (whose thing will go missing and where, whose thing is in your pocket, or shells at the water's edge) or plain gist, the owner's answer-back or a reaction, a second tip (the wash), and a goodbye. When Ada is one of the two, she may also name the fish she wants to carve tomorrow, just before the goodbye. Whoever a lost thing belongs to either tells it themselves or is standing there and answers back: nothing is told behind anyone's back. The caption's button reads **"Ehen?"** while a tip is on screen.

## 1. Questions to answer first (spec §13.6)

| # | Question | Where it shows | If it is wrong |
|---|---|---|---|
| 1 | **Staging**: the neighbours and the household all standing, talking over the veranda rail every evening. Is that ordinary compound gist? Would the household offer a seat (the stool is planned for the next build)? | Every gist; a pair on Ada's bench stand up as the guests reach the gate | The next build's stool for the eldest guest comes forward; or the household stays seated (owner decision 1 says stand). |
| 2 | **Predicting losses to the owner's face**: "By evening he will be looking for the cap of his camera", with Mr. Bassey there answering back. Warm teasing, or amebo? | `gs38-lost-lenscap`, `gs38-lost-chisel`, `gs38-lost-seeds` and their answer-backs | Owners tell their own (as Tunde, Mrs. Oyelaran and Ada already do), or the line becomes plain news. |
| 3 | **"Ehen?"** as the button the listener presses during a tip; or "Na true?"; or plain "Next". | The caption's button on tip lines | One string: `GIST38.UI.ehen`. |
| 4 | "Na wa", "Na true?", "Ehen", "sha", "o" where used; "gist" (never "amebo") for a family game. | Reactions, greetings, Ada's lines | The reader's word, or plain English. |
| 5 | "Greet your house", "God bless you, my dear" as natural thanks and goodbyes. | `gs38-by-nk1`; the glasses' thanks | The reader's phrase. |
| 6 | **The cowrie** at the water's edge, decorative only (never money, never spiritual); "the lagoon is coming up" and "high water tonight" for a Lagos-like waterfront. | The wash lines; the cowrie's toast "A cowrie, smooth as a tooth." | A "conch fragment" as the rare kind (spec §19, A9). |
| 7 | The keepsakes and the lost things: a hand fan, an owambe souvenir plate, a highlife record, a framed print, a wooden bird; reading glasses on a beaded chain (it was “a gold chain”; changed because the culture notes keep jewellery out of lost things), a chisel, an audio adapter, a lens cap, a blue wrapper, a folding rule, scent-leaf seed. | Pick-up toasts, thanks, the shelf | The reader's thing, in `FOUND38`. |
| 8 | "Thirty-one years" for Mr. Bassey's career, and "1979". | `gs38-back-lenscap`, his thanks, `gs38-wash-ba` | Drop the number. |
| 9 | Mama Nkechi's "Last time we only came to greet you. Tonight I have gist." | `gs38-nk-first`, her first gist | The reader's opener. |
| 10 | The memory "The first evening of gist at the rail." | The album | The reader's caption. |
| 11 | Mrs. Oyelaran telling her own wrapper ("If a blue wrapper goes over the wall, it is mine. You did not see it."): is a woman's wrapper on the line something she would joke about to young neighbours? | `gs38-lost-wrapper`, her answer-back, the toast "It smells of somebody's soap." | A plainer line, or a different thing of hers. |
| 12 | Ada's carvings (owner decision 2, a gift; the owner's words: "she names a fish, you catch it, she carves it for your shelf"): once a day Ada names a fish she has not carved, in one of three ways ("I have a piece of iroko waiting for a croaker. They only bite in the early afternoon."); you keep one for her from the catch card and she carves it overnight. Is iroko the wood a carver would reach for, and are carved wooden fish a natural keepsake? Is "they only bite in the early afternoon" a thing a Lagos-side carver would say about lagoon fish? Does "Red snapper. The iroko is already blushing." read as a joke? | `gs38-ask-*`, the catch card's "Keep it for Ada", her panel (`gs38-ada-*`) | The reader's wood, fish or wording. |
| 13 | **New lines no culture note or spec reviewed**: the second plain line of each neighbour (`gs38-pl-*2`), and two reworded after the culture review: Tunde's "Somebody has been watering my scent leaf at night. I have asked everybody. Nobody will confess. I am touched." (it was a "helpful ghost", close to the juju the notes keep out) and Mama Nkechi's "Somebody asked me when the café is opening. I said: when I finish frying." (it was a customer refused credit, a money joke). Do they sound like these neighbours? | Plain gist, `gs38-pl-*2` | Cut the line: each neighbour keeps the first draft's `gs38-pl-*1`. |
| 14 | **Passing on a neighbour's word**: Ada's thanks for her chisel ends "Tunde is doing the sound by the stage tomorrow. He says if anybody finds a small black plug after midday, it is his." It is Tunde's own message, passed on. Is that natural, or is it telling his business? | `gs38-ty-chisel-2` | Drop the second block (the adapter is then told only at the gist). |

## 2. What the copy avoids (spec §13.5)

No gossip that shames (money, marriage, illness, death, debts, rent, a child's schooling); no "village people", juju or "yahoo"; no poverty spectacle; no alcohol; no religion assumed ("God bless you" is ordinary thanks); no weekday names; no brands, real places or people; no ethnic jokes; Pidgin never the punchline; no narrator explaining Nigeria; and nothing told behind someone's back (owners tell their own losses, or hear them told to their face and answer back). Please flag anything that crosses one of these lines.

## 3. Every line, as the game ships it

Generated by `node tools/reader-v38.cjs` from the copy tables in `dist/src/gist-v38.js` and `dist/src/found-v38.js`. Every string in those tables is below, once.

### Greetings (lines 1 and 2; one of four, not repeated until all four are used)

| Id | Who | Line |
|---|---|---|
| gs38-tu-o1 | Tunde | Good evening o. I was passing, which is my way of saying I came on purpose. |
| gs38-tu-o2 | Tunde | Evening. I have brought nothing, but I have brought news, which is lighter. |
| gs38-tu-o3 | Tunde | I will lean on your rail, if the rail agrees. It is a serious rail. |
| gs38-tu-o4 | Tunde | Good evening. The compound is too quiet, so somebody has to bring small noise. |
| gs38-nk-o1 | Mama Nkechi | Good evening, my dear. The shop can mind itself for ten minutes. |
| gs38-nk-o2 | Mama Nkechi | Ehen, you are home. Good. I have gist, and gist does not keep. |
| gs38-nk-o3 | Mama Nkechi | My dear, I cannot stay long. That is what I always say. Then I stay. |
| gs38-nk-o4 | Mama Nkechi | Good evening o. You look tired in the good way. You have been working. |
| gs38-ad-o1 | Ada | Evening. My hands smell of sawdust and I have stopped apologising for it. |
| gs38-ad-o2 | Ada | I was going to work late. Then I thought, no. Gist first, wood after. |
| gs38-ad-o3 | Ada | Good evening. I will not keep you long. I say that every time. |
| gs38-ad-o4 | Ada | Evening. I came to see if the bench is still standing. It is. Of course it is. *(only with Ada’s bench placed)* |
| gs38-ba-o1 | Mr. Bassey | Good evening, my friend. The light is nearly gone, which is the best time for talking. |
| gs38-ba-o2 | Mr. Bassey | Good evening. I took no photographs today, so I have energy for conversation. |
| gs38-ba-o3 | Mr. Bassey | Evening, evening. I was told there was gist here. I came to check the facts. |
| gs38-ba-o4 | Mr. Bassey | Good evening. Your veranda faces the right way. I noticed that the first day. |
| gs38-oy-o1 | Mrs. Oyelaran | Good evening. I said ten minutes upstairs. Let us see what happens down here. |
| gs38-oy-o2 | Mrs. Oyelaran | Good evening. My radio is resting, so I came to hear people instead. |
| gs38-oy-o3 | Mrs. Oyelaran | Evening. Listen once, I will not repeat it: the noticeboard is not for selling cars. |
| gs38-oy-o4 | Mrs. Oyelaran | Good evening. Ten-thirty, I go up. Until then, gist. |

### One-time openers (each replaces that neighbour’s greeting once, ever)

| Id | Who | When | Line |
|---|---|---|---|
| gs38-nk-first | Mama Nkechi | her first gist (normally the household’s first) | Last time we only came to greet you. Tonight I have gist. |
| gs38-tu-soon | Tunde | his first gist | We said we would do it again soon. This is soon. |
| gs38-ad-shelf | Ada | her first gist after the shelf goes up | The shelf is level. I checked it twice. Then I checked it again, because it is me. |

### Fallback lines (shown only if a line cannot be found; the v35 evening’s own fallbacks cover the other three)

| Who | Line |
|---|---|
| Mr. Bassey | Good evening, my friend. I came for the conversation. |
| Mrs. Oyelaran | Good evening. I will not stay long. |

### Tips about tomorrow: lost things (told by the owner, or to the owner’s face)

| Id | Teller | Line | Owner’s answer-back |
|---|---|---|---|
| gs38-lost-chisel | Tunde | Ada is carving by the rocks tomorrow. Every time she works out there, a tool walks away. Look down after midday. | Tools do not walk. The rocks take them. It is different. (gs38-back-chisel) |
| gs38-lost-adapter | Tunde | I am doing the sound by the stage tomorrow. If a small black plug goes missing, it is mine. It is called an adapter. It has a family. | (the owner tells it) |
| gs38-lost-lenscap | Mama Nkechi | Mr. Bassey is photographing the water tomorrow afternoon. Watch. By evening he will be looking for the cap of his camera. | Thirty-one years and I have never lost a lens cap. I will be very careful. Probably. (gs38-back-lenscap) |
| gs38-lost-wrapper | Mrs. Oyelaran | I am washing tomorrow, and the wind is coming. If a blue wrapper goes over the wall, it is mine. You did not see it. | (the owner tells it) |
| gs38-lost-rule | Ada | I am measuring stalls on Market Road tomorrow. I will put my folding rule down somewhere. I always do. If you find it, it is mine. | (the owner tells it) |
| gs38-lost-seeds | Mama Nkechi | Tunde is taking his scent-leaf seed to the square garden tomorrow. He carries a packet like a man carrying a bird. It will fly. | It will not fly. I have a system. The system is my pocket. (gs38-back-seeds) |

### Reminders (a thing out now, told at most once before), with the owner’s answer-back

The reminder is one line, `gs38-lost-r`: “Nobody has found {owner}’s {thing} yet. {Area}, still.”. {Area} is the place as a neighbour says it (`FOUND38.LOST[].say`); Today and the night page keep the map words (`area`, below). As said, for each thing:

| Thing | Line as said |
|---|---|
| chisel | Nobody has found Ada’s chisel yet. Somewhere near the rocks, still. |
| adapter | Nobody has found Tunde’s adapter yet. Over by the stage in the square, still. |
| lenscap | Nobody has found Mr. Bassey’s lens cap yet. Somewhere past where Mr. Bassey takes his pictures, still. |
| wrapper | Nobody has found Mrs. Oyelaran’s wrapper yet. Out in the street by the gate, still. |
| rule | Nobody has found Ada’s folding rule yet. Somewhere on Market Road, still. |
| seeds | Nobody has found Tunde’s seeds yet. By the garden in the square, still. |

| Id | Line |
|---|---|
| gs38-lost-glasses | Mama Nkechi is reading prices from across the road again. Her glasses are somewhere on the waterfront sand. *(the glasses’ first reminder)* |

| Id | Owner answering back | Line |
|---|---|---|
| gs38-back-r-nkechi | Mama Nkechi | I can see perfectly well. From across the road. |
| gs38-back-r-ada | Ada | It is not lost. It is resting. |
| gs38-back-r-tunde | Tunde | It is fine. I am fine. Everything is fine. |
| gs38-back-r-bassey | Mr. Bassey | I know where it is. Approximately. |
| gs38-back-r-oyelaran | Mrs. Oyelaran | I said it was mine. I did not say I would go into the street for it. |

### The thing in your pocket (said by a guest who is not its owner)

One line, `gs38-pocket`: “That {thing} you picked up? {Owner}’s. {Where}.”, with {thing} and {Where} from these words:

| Thing | {thing} | Its owner | {Where} |
|---|---|---|---|
| glasses | pair of glasses | Mama Nkechi | She is at her shop all day |
| chisel | chisel | Ada | She is at the Makers’ Yard by day, and in the courtyard after six |
| adapter | adapter | Tunde | He is at the Yard in the morning and the courtyard after |
| lenscap | lens cap | Mr. Bassey | He is on the waterfront in the afternoons |
| wrapper | blue wrapper | Mrs. Oyelaran | She is in the courtyard in the mornings and evenings |
| rule | folding rule | Ada | She is at the Makers’ Yard by day, and in the courtyard after six |
| seeds | packet of seed | Tunde | He is at the Yard in the morning and the courtyard after |

Things by name in speech (“Nobody has found Ada’s chisel yet”), and on Today and the night page: glasses “glasses”, chisel “chisel”, adapter “adapter”, lenscap “lens cap”, wrapper “wrapper”, rule “folding rule”, seeds “seeds”.

### The wash (shells at the water’s edge tomorrow afternoon)

| Id | Who | Line |
|---|---|---|
| gs38-wash-tu | Tunde | The lagoon is coming up tonight. Tomorrow it leaves shells on the sand. Free things. My favourite price. |
| gs38-wash-nk | Mama Nkechi | Big water tonight. When it goes back after midday tomorrow, the edge will be full of shells. |
| gs38-wash-ad-cowrie | Ada (until the household has a cowrie) | High water tonight. Tomorrow after midday, look along the edge. People find cowries there. I have one. I am not giving it to you. |
| gs38-wash-ad | Ada | High water tonight. Tomorrow after midday, look along the edge. The lagoon always leaves something. |
| gs38-wash-ba | Mr. Bassey | The water comes up high tonight. Tomorrow afternoon it leaves shells along the edge. I photographed that in 1979. It has not changed. |
| gs38-wash-oy | Mrs. Oyelaran | High water tonight. Tomorrow afternoon, shells along the water’s edge. Mind your shoes. |

### About today (line 3): a return retold by a guest who is not the owner, or what the household did

| Id | When | Line |
|---|---|---|
| gs38-told-glasses | the glasses given back today | Mama Nkechi is telling every customer about her glasses. Some of them came only to hear it. |
| gs38-told-chisel | the chisel given back today | Ada told the whole Yard you found her chisel. I have heard it twice. |
| gs38-told-adapter | the adapter given back today | Tunde says you saved a wedding. I asked which one. He says all of them. |
| gs38-told-lenscap | the lens cap given back today | Mr. Bassey says you have a photographer’s eye for small things. From him, that is a medal. |
| gs38-told-wrapper | the wrapper given back today | Mrs. Oyelaran says she thanked you once and that is enough. Then she told me about it three times. |
| gs38-told-rule | the folding rule given back today | Ada says her rule came back because she measures twice. I say it came back because of you. |
| gs38-told-seeds | the seeds given back today | Tunde planted the scent leaf already. He talks to it. He says it is your fault. |
| gs38-today-catch | three catches today | I saw you two at the rocks half the afternoon. The fish must be tired. |
| gs38-today-shells | three shells today | You have been walking the beach, I hear. Bring me a small one. |
| gs38-today-harvest | a harvest today | Your pepper pot is doing better than mine. I will not say more. |

### Reactions (line 5 when nobody answers back)

| Id | Who | Line |
|---|---|---|
| gs38-re-tu1 | Tunde | Na wa. And nobody told me first? I live here. |
| gs38-re-tu2 | Tunde | I will pretend I knew that already. |
| gs38-re-nk1 | Mama Nkechi | Na true? Ehen. Now everybody knows. |
| gs38-re-nk2 | Mama Nkechi | You see? The compound tells you everything if you stand still long enough. |
| gs38-re-ad1 | Ada | Hm. That is useful, sha. |
| gs38-re-ad2 | Ada | I heard that too. Not from you. Go on. |
| gs38-re-ba1 | Mr. Bassey | Have you heard? Now I have heard. |
| gs38-re-ba2 | Mr. Bassey | I am making a note. A mental note. The camera is resting. |
| gs38-re-oy1 | Mrs. Oyelaran | I will put it on the noticeboard. In small letters. |
| gs38-re-oy2 | Mrs. Oyelaran | Listen to that. Once is enough. |

### Plain gist (when there is nothing to tell). The second line of each is new in this build, not in the spec (question 13).

| Id | Who | Line |
|---|---|---|
| gs38-pl-tu1 | Tunde | Mama Nkechi says I owe her for sugar. I paid. She says show me. Who keeps receipts for sugar? |
| gs38-pl-tu2 | Tunde | Somebody has been watering my scent leaf at night. I have asked everybody. Nobody will confess. I am touched. |
| gs38-pl-nk1 | Mama Nkechi | Tunde says he paid me. He paid me in compliments. I cannot buy oil with compliments. |
| gs38-pl-nk2 | Mama Nkechi | Somebody asked me when the café is opening. I said: when I finish frying. |
| gs38-pl-ad1 | Ada | I have made the same stool nine times. The tenth will be right. Or I will make an eleventh. |
| gs38-pl-ad2 | Ada | A man asked me for a table that folds into a chair. I said yes. Now I must think. |
| gs38-pl-ba1 | Mr. Bassey | I once photographed a wedding where the groom came late by boat. Nobody minded. It was a good boat. |
| gs38-pl-ba2 | Mr. Bassey | The keke man waved at me today. In my time we waved at the boats. |
| gs38-pl-oy1 | Mrs. Oyelaran | Somebody keeps leaving an extension box on the stairs. I will not say who. Tunde. |
| gs38-pl-oy2 | Mrs. Oyelaran | My radio says rain tomorrow. My knees say no rain. I trust my knees. |

### Goodbyes (the last line)

| Id | Who | Line |
|---|---|---|
| gs38-by-tu1 | Tunde | Right. I have said too much, which is the right amount. |
| gs38-by-tu2 | Tunde | New compound rule: gist ends when the mosquitoes vote. They have voted. |
| gs38-by-tu3 | Tunde | Let me be going. My plants worry when I am out late. |
| gs38-by-nk1 | Mama Nkechi | Let me be going, my dear. Sleep well. Greet your house. |
| gs38-by-nk2 | Mama Nkechi | I am going. I said that already. This time I mean it. |
| gs38-by-nk3 | Mama Nkechi | That is enough gist for one night. Leave some for tomorrow. |
| gs38-by-ad1 | Ada | Good night. I have a leg to finish. A chair leg. |
| gs38-by-ad2 | Ada | Good night, sha. Do not sit up too late. |
| gs38-by-ad3 | Ada | I am going before I start talking about wood. Too late. Good night. |
| gs38-by-ba1 | Mr. Bassey | Good night, my friend. Mind the light tomorrow. |
| gs38-by-ba2 | Mr. Bassey | Let me go before I start telling you about my old cameras. |
| gs38-by-ba3 | Mr. Bassey | Good night. That was a good evening. I would print it. |
| gs38-by-oy1 | Mrs. Oyelaran | Ten-thirty. I go up. Good night. |
| gs38-by-oy2 | Mrs. Oyelaran | My radio is waiting. Good night o. |
| gs38-by-oy3 | Mrs. Oyelaran | Good night. Keep your door shut against the mosquitoes. |

### Thank-yous in the return panel (`FOUND38.SPEECH.ty`; a second block tells you about the next thing)

| Id | Who | Line |
|---|---|---|
| gs38-ty-glasses-1 | Mama Nkechi (given back before half past three) | My glasses! I have been reading prices from across the road. God bless you, my dear. Take this fan. It is too hot to argue. |
| gs38-ty-glasses-2 | Mama Nkechi (given back before half past three) | And Ada has been turning the rocks over all morning for her chisel. Go and help her look. |
| gs38-ty-glasses-late-1 | Mama Nkechi (given back after half past three) | My glasses! I have been reading prices from across the road. God bless you, my dear. Take this fan. It is too hot to argue. |
| gs38-ty-glasses-late-2 | Mama Nkechi (given back after half past three) | Ada is carving by the rocks tomorrow, and her tools wander. Keep an eye out after midday. |
| gs38-ty-chisel-1 | Ada | You found it. Good. I bought another one today and I already hate it. Here. A bird I made from an offcut. It wants a shelf. |
| gs38-ty-chisel-2 | Ada | Tunde is doing the sound by the stage tomorrow. He says if anybody finds a small black plug after midday, it is his. |
| gs38-ty-adapter | Tunde | My adapter! I have been blaming the fish all day. You have saved a wedding. Small exaggeration. Take this plate. Somebody’s owambe. My sound. |
| gs38-ty-lenscap | Mr. Bassey | Thank you, my friend. I said I would be careful. I was careful for a whole morning. Take this print. The gate, in good light. |
| gs38-ty-wrapper | Mrs. Oyelaran | My wrapper. Thank you. I will not ask how it got to the street. I have a record I do not play. Take it. Play it quietly. |
| gs38-ty-rule | Ada | My rule. You see? Things come back to people who measure twice. Thank you, sha. |
| gs38-ty-seeds | Tunde | My seeds! New compound rule: whoever finds my things gets first look at my seedlings. I have just invented it. |

### Ada names a fish to carve (`FOUND38.SPEECH.ask`): in her talk, for today, or in the gist before the goodbye, for tomorrow; once a day at most

Three lines each for the five day fish, one a day by the day’s number; one each for the catfish. {thing}: tilapia “tilapia”, mullet “mullet”, bonga “bonga”, croaker “croaker”, snapper “red snapper”, catfish “catfish”; her order: croaker, snapper, bonga, mullet, tilapia, catfish.

| Id | Where | Line |
|---|---|---|
| gs38-ask-gist | the gist, for tomorrow | I have a piece of iroko waiting for a {thing}. They only bite in the early afternoon. Bring me one tomorrow, and I will carve it that night. |
| gs38-ask-gist2 | the gist, for tomorrow | Tomorrow my hands want to carve a {thing}. They bite in the early afternoon. Bring me one, if the lagoon agrees. |
| gs38-ask-gist3 | the gist, for tomorrow | If you fish tomorrow after midday, bring me a {thing}. I have the wood ready, and the wood is impatient. |
| gs38-ask-talk | her talk, for today | I have a piece of iroko waiting for a {thing}. They only bite in the early afternoon. Bring me one today, and I will carve it tonight. |
| gs38-ask-talk2 | her talk, for today | My hands want to carve a {thing} today. They bite in the early afternoon. Bring me one, if the lagoon agrees. |
| gs38-ask-talk3 | her talk, for today | If you fish after midday, bring me a {thing}. I have the wood ready, and the wood is impatient. |
| gs38-ask-cat-gist | the gist, the catfish | Catfish do not come out by day. Neither do I, some days. Tomorrow, fish after six and bring one to me in the courtyard. |
| gs38-ask-cat-talk | her talk, the catfish | Catfish do not come out by day. Neither do I, some days. Fish after six this evening, and bring one to me in the courtyard. |

### Ada’s carvings: her line when you give her the fish (`FOUND38.SPEECH.carve`)

| Id | Fish | Line |
|---|---|---|
| gs38-ada-tilapia | tilapia | A tilapia. Small, honest fish. It will look like it is about to say something. |
| gs38-ada-mullet | mullet | Mullet. Always in a hurry. I will carve it standing still, for once. |
| gs38-ada-bonga | bonga | Bonga. Everybody eats it, nobody carves it. Until now. |
| gs38-ada-croaker | croaker | A croaker. Good face on it. I will start on it tonight. |
| gs38-ada-snapper | red snapper | Red snapper. The iroko is already blushing. |
| gs38-ada-catfish | catfish | Catfish. Look at those whiskers. This one I will enjoy, sha. |

### The lost things (`FOUND38.LOST`): the prompt, the toast, the give label and the words for each

| Thing | Prompt | Pick-up toast | Toast once its owner is known | Give label |
|---|---|---|---|---|
| glasses | Pick up reading glasses | Reading glasses on a beaded chain. Mama Nkechi wears a chain like that. | (the same) | Give Mama Nkechi her glasses |
| chisel | Pick up a small chisel | A small chisel, worn smooth at the handle. Somebody will be missing this. | A small chisel, worn smooth at the handle. Ada’s, surely. | Give Ada her chisel |
| adapter | Pick up a small black plug | A small black plug with a long tail of wire. Tunde would know. | (the same) | Give Tunde his adapter |
| lenscap | Pick up a lens cap | A camera lens cap, half buried in the sand. | (the same) | Give Mr. Bassey his lens cap |
| wrapper | Pick up a blue wrapper | A blue wrapper, caught on a post. It smells of somebody’s soap. | (the same) | Give Mrs. Oyelaran her wrapper |
| rule | Pick up a folding rule | A folding rule with Ada’s mark scratched on it. | (the same) | Give Ada her folding rule |
| seeds | Pick up a packet of seed | A small packet of seed, rolled shut. Scent leaf, says the pencil. | (the same) | Give Tunde his seeds |

| Thing | Long name (Today’s pocket row) | Area (Today, the night page) | Spoken place (reminders) |
|---|---|---|---|
| glasses | reading glasses on a beaded chain | the waterfront sand by the bench | On the waterfront sand by the bench |
| chisel | a small chisel | near the rocks | Somewhere near the rocks |
| adapter | a small black audio adapter | by the square’s stage | Over by the stage in the square |
| lenscap | a camera lens cap | the waterfront, east of the photo spot | Somewhere past where Mr. Bassey takes his pictures |
| wrapper | a blue wrapper off the line | the street, west of the gate | Out in the street by the gate |
| rule | a folding rule | Market Road, between the stalls | Somewhere on Market Road |
| seeds | a packet of scent-leaf seed | by the square’s garden bed | By the garden in the square |

Where each owner is (Today’s pocket row once the owner is known): Mama Nkechi: “She is at her shop all day.” Ada: “She is at the Makers’ Yard by day, and in the courtyard after six.” Tunde: “He is at the Yard in the morning and the courtyard after.” Mr. Bassey: “He is in the Yard in the morning, on the waterfront in the afternoon and in the courtyard in the evening.” Mrs. Oyelaran: “She is in the courtyard in the mornings and evenings, and out in the afternoon.”

### Shell kinds (`FOUND38.SHELLS`)

| Kind | Name | On the shelf panel | Toast |
|---|---|---|---|
| cockle | a ridged cockle | ridged cockle | A ridged cockle. (plus “One for the shelf.” for a new kind) |
| olive | a glossy olive shell | olive shell | A glossy olive shell. (plus “One for the shelf.” for a new kind) |
| periwinkle | a periwinkle, spiralled tight | periwinkle | A periwinkle, spiralled tight. (plus “One for the shelf.” for a new kind) |
| murex | a spiny murex | spiny murex | A spiny murex. (plus “One for the shelf.” for a new kind) |
| cowrie | a cowrie | cowrie | A cowrie, smooth as a tooth. (plus “One for the shelf.” for a new kind) |

### The interface (plain English): every string in `GIST38.UI` and `FOUND38.UI`, by its key

{a}, {b}, {who}, {owner}: a neighbour’s name; {thing}, {long}, {area}, {where}, {hint}: the words above; {fish}: the fish’s name; {n}, {m}, {have}, {of}, {k}, {g}, {r}, {q}, {price}, {until}: counts, money and times filled in by the game.

| Key | Text |
|---|---|
| GIST38.UI.ehen | Ehen? |
| GIST38.UI.gate | {a} and {b} are at the gate. |
| GIST38.UI.gate2 | {b} is at the gate. |
| GIST38.UI.memory | The first evening of gist at the rail. |
| GIST38.UI.nudge | The neighbours are coming by your veranda for gist tonight. Be home before ten. |
| GIST38.UI.benchOffer | Wait here until the neighbours come |
| GIST38.UI.benchSub | Evening gist at the rail |
| GIST38.UI.kicker | WHAT THE COMPOUND IS SAYING |
| GIST38.UI.pocketUntold | In your pocket: {long}. {hint} |
| GIST38.UI.pocketKnown | In your pocket: {owner}’s {thing}. {where} |
| GIST38.UI.hint.nkechi | Somebody at the shops will know. |
| GIST38.UI.hint.ada | Somebody at the Makers’ Yard will know. |
| GIST38.UI.hint.tunde | Whoever keeps a garden will know. |
| GIST38.UI.hint.bassey | Somebody on the waterfront will know. |
| GIST38.UI.hint.oyelaran | Somebody in the courtyard will know. |
| GIST38.UI.heard | Heard last night:  |
| GIST38.UI.heardBefore | Heard the other night:  |
| GIST38.UI.heardLost.chisel | Ada is carving by the rocks today, and her tools have a way of walking off. |
| GIST38.UI.heardLost.adapter | Tunde is doing the sound by the square’s stage today. Look out for a small black plug. |
| GIST38.UI.heardLost.lenscap | Mr. Bassey is out on the waterfront this afternoon, and his lens cap never stays on long. |
| GIST38.UI.heardLost.wrapper | Mrs. Oyelaran is washing today. A blue wrapper may go over the wall into the street, west of the gate. |
| GIST38.UI.heardLost.rule | Ada is measuring stalls on Market Road today. Her folding rule may stay behind. |
| GIST38.UI.heardLost.seeds | Tunde is taking scent-leaf seed to the square’s garden bed today. Watch for a packet. |
| GIST38.UI.heardStill | Still lying out, as you heard: {owner}’s {thing}, {area}. |
| GIST38.UI.heardWash | shells at the water’s edge after midday. |
| GIST38.UI.saidYesterday | {who} said yesterday:  |
| GIST38.UI.saidBefore | {who} said the other day:  |
| GIST38.UI.evening | This evening: the neighbours come by from a quarter past six. |
| GIST38.UI.wait | Wait until then |
| GIST38.UI.shelfCount | Your shelf: {have} of {of}. |
| GIST38.UI.shelfCarve | Ada’s carvings: {have} of {of}. |
| GIST38.UI.shelfDone.keepsake | Keepsakes: Complete. |
| GIST38.UI.shelfDone.shells | Shells: Complete. |
| GIST38.UI.shelfDone.carve | Carvings: Complete. |
| GIST38.UI.shelfSee | See your shelf |
| GIST38.UI.shelfAsk | Ask Ada |
| GIST38.UI.recapKicker | TONIGHT’S GIST |
| GIST38.UI.nightGist | {a} and {b} stood at the rail with you until the mosquitoes won. |
| GIST38.UI.nightQuiet | The compound was quiet. |
| GIST38.UI.recapLost.chisel | Tunde says Ada will lose a tool by the rocks tomorrow. |
| GIST38.UI.recapLost.adapter | Tunde says his adapter may go missing by the square’s stage tomorrow. |
| GIST38.UI.recapLost.lenscap | Mama Nkechi says Mr. Bassey will lose his lens cap on the waterfront tomorrow. |
| GIST38.UI.recapLost.wrapper | Mrs. Oyelaran says a blue wrapper may blow into the street west of the gate tomorrow. |
| GIST38.UI.recapLost.rule | Ada says she will put her folding rule down somewhere on Market Road tomorrow. |
| GIST38.UI.recapLost.seeds | Mama Nkechi says Tunde will lose his scent-leaf seed by the square’s garden bed tomorrow. |
| GIST38.UI.recapRemind | Nobody has found {owner}’s {thing} yet. |
| GIST38.UI.recapPocket | The {thing} is {owner}’s, says {teller}. |
| GIST38.UI.recapWash | Shells at the water’s edge after midday tomorrow. |
| FOUND38.UI.keepsake.fan | Mama Nkechi pressed a hand fan into your hands. It will look well somewhere you can see it. |
| FOUND38.UI.keepsake.bird | Ada gave you a little wooden bird, made from an offcut. |
| FOUND38.UI.keepsake.plate | Tunde gave you a souvenir plate from somebody’s owambe. He did the sound. |
| FOUND38.UI.keepsake.print | Mr. Bassey gave you a print of the compound gate in the gold hour. |
| FOUND38.UI.keepsake.record | Mrs. Oyelaran gave you an old highlife record. ‘Play it quietly.’ |
| FOUND38.UI.shelfHint | Ada could put up a shelf for things like this. |
| FOUND38.UI.keepName.fan | a hand fan from Mama Nkechi |
| FOUND38.UI.keepName.bird | a wooden bird from Ada |
| FOUND38.UI.keepName.plate | a souvenir plate from Tunde |
| FOUND38.UI.keepName.print | a framed print from Mr. Bassey |
| FOUND38.UI.keepName.record | a highlife record from Mrs. Oyelaran |
| FOUND38.UI.washLabel | Pick up a shell from the wet sand |
| FOUND38.UI.newKind |  One for the shelf. |
| FOUND38.UI.returnKicker | Given back |
| FOUND38.UI.close | Close |
| FOUND38.UI.notEnough | Not enough in the purse |
| FOUND38.UI.shelfOrdered | Ada says the wood is ready. The shelf goes up tomorrow morning. |
| FOUND38.UI.shelfTitle | Your shelf |
| FOUND38.UI.shelfSub | Ada put it up. Everything on it came from somewhere. |
| FOUND38.UI.shelfNone | Ada will put up a shelf for the things you find: ₦5,000 for the wood. |
| FOUND38.UI.shelfSoon | Ada says the wood is ready. The shelf goes up tomorrow morning. |
| FOUND38.UI.setKeep | Keepsakes |
| FOUND38.UI.setShells | Shells |
| FOUND38.UI.setCarve | Ada’s carvings |
| FOUND38.UI.of | {n} of {m} |
| FOUND38.UI.complete | Complete |
| FOUND38.UI.keepMore | (more from the neighbours you help) |
| FOUND38.UI.shellMore | (one more kind, at the water’s edge after a wash) |
| FOUND38.UI.shellsMore | ({k} more kinds, on the beach and at the water’s edge) |
| FOUND38.UI.carveMore | ({k} more fish to bring her) |
| FOUND38.UI.carveMoreOne | (one more fish to bring her) |
| FOUND38.UI.nothingYet | nothing yet |
| FOUND38.UI.playtest | Days with gist: {g} · Lost things given back: {r} · Longest quiet stretch yesterday: {q} |
| FOUND38.UI.forAdaBtn | Keep it for Ada |
| FOUND38.UI.forAdaKicker | For Ada |
| FOUND38.UI.forAdaTitle | A {fish} for carving. |
| FOUND38.UI.forAdaText | Ada is at the Makers’ Yard until six, then in the courtyard. It will keep until tomorrow evening. |
| FOUND38.UI.castAgain | Cast again |
| FOUND38.UI.backShore | Back to the shore |
| FOUND38.UI.giveAda | Give Ada the {fish} |
| FOUND38.UI.carveNote | She will have it carved by tomorrow morning. |
| FOUND38.UI.carveShelf | It goes on your shelf. |
| FOUND38.UI.carveNoShelf | It will wait for a shelf. |
| FOUND38.UI.carvePaid | You paid Ada {price} for the wood. |
| FOUND38.UI.carveNoMoney | Not enough in the purse for the wood |
| FOUND38.UI.carveAsk | Ada asked for a {fish} to carve. They bite only in the early afternoon, from half past twelve to half past three. |
| FOUND38.UI.carveAskCat | Ada asked for a catfish to carve. Catfish bite only after six in the evening. |
| FOUND38.UI.carveKept | A {fish} kept for Ada. She is at the Makers’ Yard until six, then in the courtyard. It keeps until {until}. |
| FOUND38.UI.untilTomorrow | tomorrow evening |
| FOUND38.UI.untilToday | six this evening |
| FOUND38.UI.carveDoing | Ada is carving your {fish}. It goes on your shelf tomorrow morning. |
| FOUND38.UI.carveDoingNoShelf | Ada is carving your {fish}. It will be ready tomorrow morning, and it will wait for a shelf. |
| FOUND38.UI.memory.keepsake | Five keepsakes from five neighbours, on our shelf. |
| FOUND38.UI.memory.shells | Our shelf has all five shells from the beach. |
| FOUND38.UI.memory.carve | Ada’s six carved fish, all on our shelf. |

## 4. Not shipped in this build

Aunty Bisi the evening seller (her calls, "jara"), the Finds tip, the set thank-you gist beats and the stool for the eldest guest wait for the next build (spec §18.2); their draft copy is in `gist/architect/SPEC-draft1.md` §12 and is not in the game.

## 5. How the lines are chosen

- Each greeting, reaction, plain line and goodbye comes from its neighbour's list without repeating until the list is used up (the household's record keeps what was said).
- One-time openers replace a greeting once, ever. Football's evening line for Mama Nkechi ("Emeka told me the whole game before he even washed his feet. Every goal, twice.") comes at most once in a household, never on the first gist, as the line about today (line 3), after her greeting.
- A return retold is said once per thing, on the evening it was given back, by a guest who is not its owner. The catches, shells and harvest lines come at most once in any three gists.
- Ada's bench greeting ("I came to see if the bench is still standing") only when her bench is placed. Her wash line with the cowrie only until the household has one.
- Ada names one fish a day at most, one she has not carved yet, in her order (croaker, red snapper, bonga, mullet, tilapia, then the catfish), in one of three lines chosen by the day, so a fish she asks for again is asked for differently: in the gist before the goodbye when she is a guest (for tomorrow), otherwise in her first talk of the day while the fish's hours are still to come (for today). Nothing while a fish kept for her is waiting to be given, and nothing once all six are carved.
