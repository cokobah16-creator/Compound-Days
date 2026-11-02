# Evening gist and daily finds (v38): the Nigerian reader's sheet

**v39 adds its own section at the end of this sheet** (“v39: Aunty Bisi, thanks at the rail and fuller afternoons”): read that first, the owner’s four items before the rest. Sections 1 to 5 below are v38’s and unchanged.

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

---

# v39: Aunty Bisi, thanks at the rail and fuller afternoons

Build **v39** (the Menu shows the exact build). Spec: `v39/SPEC.md` §13. Everything new that v39 puts in front of a player is in section v39.3, generated from the game’s own tables by `node tools/reader-v39.cjs` (`BISI39.LINES` and `BISI39.UI` in `dist/src/seller-v39.js`, `GIST39.LINES` and `GIST39.UI` in `dist/src/gist-v39.js`), every string once, with its id. The rule is the same as for v38: any line the reader flags is replaced by the reader’s wording or cut, never shipped as it is. The harness `check/verify-gist-v39.cjs` (check 12) holds the same rules as v38’s: no weekday names, British spelling, no digits or ₦ in speech (Mr. Bassey’s “1979” excepted), curly apostrophes, at most 160 characters.

**What the owner chose, in their own words.**
1. Aunty Bisi: “About 4 evenings in 5”: “Never two missed in a row, and Today tells you each morning whether she's coming. She stays a small treat rather than a routine.”
2. A neighbour’s fish for the pot: “Add it”.
3. The stool: “Only the eldest sits”: “Ada's stool is handed over the rail to the eldest guest (Mr. Bassey, then Mrs. Oyelaran, then Mama Nkechi). Everyone else, including your household, stands.”
4. After the seven lost things: “Five new, then 'again'”: “Five new small things, one per neighbour. After that, the old things go missing 'again', one a day. Returns stay thanks and friendship, never cash.”

**How to see it.** Play to day 4 (the veranda evening on day 3) and be in the street or at the rail from five: Aunty Bisi strolls along the street calling; “Call Aunty Bisi” from the rail brings her over. `?bisi=now` in the address keeps her at her stop all day (for reading only); `?gist39=playtest` brings her every evening and the pot ask in the first talk after you have bought from her. The thank-yous need Ada’s shelf up and a set finished on it; the stool needs Ada’s stool (the housewarming one, or her tenth, which she leaves at your door the morning after she says “I have made the same stool nine times”) and an elder at the rail.

## v39.1 Questions to answer first (the owner’s four items first, then the extras)

The rows follow the owner’s order: Aunty Bisi, the Finds tip, the thank-yous and the stool first, then the extras from the last to be cut (the pot) to the first (the photograph), then the next build’s. All thirteen of the culture notes’ new questions (`v39/culture/NOTES.md` §11) are here (their two Phase 2 questions on lost things and the noticeboard share row 15); the rows marked “Ours” are the spec’s three (the pot, the again round, the tenth stool) and one for the Finds tip.

| # | Item | Question | Where it shows | If it is wrong |
|---|---|---|---|---|
| 1 | Aunty Bisi | **At the rail.** A puff-puff seller walking the street, called over to the veranda rail, lowering her tray and serving across it, between five and six. Natural? Would she ever come into the compound? | Her stroll, “Call Aunty Bisi”, the panel | She serves only in the street (the household walks out to her). |
| 2 | Aunty Bisi | **Her voice.** Pidgin mixed with English: “my customer”, “You don come? The usual?”, “Taste am first. Next time you go buy.”, “Help me small. Ehen.” Natural for a Lagos-side hawker, and respectful? (The game does not use “Baba”.) | `gs39-bi-*` | The reader’s wording, line by line. |
| 3 | Aunty Bisi | **Calls, wares and her look.** “Puff-puff! Hot puff-puff!”, “Puff-puff dey o!”, “Groundnut! Fresh groundnut!”; puff-puff in a covered bowl on an enamel tray on her head, sold five in a nylon; groundnut in a small bottle. Right? (No corn and no chin-chin in this build.) Her clothes: an ankara two-piece (shirt and trousers) in her own plum and gold print, a headwrap and sandals. The character rig has no wrapper yet, so this is the closest it can do to “a wrap and an ankara outfit”: does it read as a market woman of about forty at work? | Her calls, her panel, her figure | The reader’s calls and wares; her cloth (`BISI39.LOOK`, `BISI39.CLOTH`). |
| 4 | Aunty Bisi | **Prices.** ₦500 for five puff-puff, ₦500 for a small bottle of groundnut, ₦500 for a bag for the children, next to Mallam’s two suyas for ₦2,000. Right order of magnitude? | Her panel | `BISI39.PRICE`. |
| 5 | Aunty Bisi | **The rivalry.** Mama Nkechi fries puff-puff too. Her treat line “You bought from Bisi? I will take two and say I am not hungry.”, Ada’s “Do not tell Mama Nkechi. I will tell her myself.”, and Bisi’s “You fry too? Then you know say this thing na work.” Warm, or awkward? | `gs39-tr-nk`, `gs39-tr-ad`, `gs39-bi-nk` | Cut the line; the treat line falls back to the guest’s reaction. |
| 6 | Aunty Bisi | **“Jara”.** One extra puff-puff (“Five, and one jara. Na so we dey do am for our people.”, in her own voice at the top of her panel; the screen’s note says plainly “Six puff-puff in the nylon: five, and one extra.”) for a regular, from the third evening bought, when she also starts stopping at your rail by herself. Natural across a mixed southern compound? Said by the seller, or asked for by the buyer? | `gs39-bi-jara`, `gs39-bi-reg` | The reader’s phrase. |
| 7 | The Finds tip | (Ours, under the owner’s item.) Aunty Bisi passing on market news: “I passed Finds on my way. They are bringing out the armchair tomorrow. If you want it, go early.” and, the next time, “You bought the armchair? I told you.” Natural for a hawker who passes the market? | `gs39-bi-fin`, `gs39-bi-finok` | Plainer news, or the tip moves to Today only. |
| 8 | The thank-yous | **The set thank-yous.** Ada for the shells (“Lend me one for a frame? I will give it back. Probably.”), Mr. Bassey for Ada’s carvings with Ada beside him (“Ada, see your work. Six fish on one shelf, and not one of them moving.”) and her reply, Tunde for the keepsakes (“Now your shelf has been to more parties than you have.”). Natural? | `gs39-th-*` | The reader’s wording; a plain greeting otherwise. |
| 9 | The stool | **The stool.** The owner chose the order Mr. Bassey, then Mrs. Oyelaran, then Mama Nkechi (“Only the eldest sits”: “Ada's stool is handed over the rail to the eldest guest (Mr. Bassey, then Mrs. Oyelaran, then Mama Nkechi). Everyone else, including your household, stands.”). Does it read right to you? If not, tell us and we will take it back to the owner. A chair-height wooden stool (0.45 m), handed over the rail by the household, the elder seated in the street while everyone else stands: right? Mama Nkechi’s “Am I an old woman now? Well, since it is here. … See home training.”: a joke she would make? | `gs39-st-*`, the button “Bring the stool for {name}” | The height or the lines; the order goes back to the owner. |
| 10 | The stool | (Ours.) Ada leaving her tenth stool at the door “for the eldest at your rail” (or, when she promised one in her talk, leaving it the next morning: “For your housewarming. Use it before then.”), and the stool handed over the rail each time that elder comes (after the first time, with no line): right? | `GIST39.UI.tenth`, `GIST39.UI.promised`; later gists | The stool only on the first evening; or no tenth stool. |
| 11 | The pot | (Ours.) Asking a neighbour for two or three fresh fish for the pot, caught after two, and sending a bowl across at six (no money changes hands): natural? Mama Nkechi’s “Fish that sits in the sun is not pepper soup fish.” and Mr. Bassey’s sister who “says my cooking is a rumour”? | `gs39-pot-*`, the bowl toast | The reader’s wording; the ask without the joke. |
| 12 | The again round | (Ours.) The same lost thing going missing again (“Again!”, “I measure twice and lose things once a week.”): a fond running joke, or does it make the neighbour look careless? | `gs39-again-*`, `gs39-againty-*` | Plainer lines; or the round stops at the twelve. |
| 13 | Kemi and Emeka | **Children.** The household buying a bag of puff-puff for Kemi and Emeka after a match; “Thank you o! Half half, Emeka. Fair is fair.” and “Auntie’s own is sweeter. But this one is hot.” Warm? Is “half half” what children say when sharing? If the children have gone in: “You shared the puff-puff yourselves instead.” | `gs39-kid-*`, `BISI39.UI.kidsGone` | The reader’s wording. |
| 14 | The photograph | **Mr. Bassey’s photograph.** He comes the morning after the carvings’ thank-you and photographs the shelf with the household beside it; the album caption “Mr. Bassey photographed our shelf, and us beside it, standing very straight.”; the framed print the morning after. Warm? (“May I come in?” is not in the game: he comes in the morning, off screen.) | `GIST39.UI.photoToast`, `photoCaption`, `printToast` | The reader’s caption. |
| 15 | Phase 2 | **Children’s lost things** (a hair band with plastic bobbles, a suwe stone, a marble, bottle tops, one slipper, a school cardigan): right for ten- and eleven-year-olds? Is “suwe” the word? **Noticeboard**: formal “LOST:” and “FOUND:” cards, signed with an initial, crossed out when found: true to compound boards? | Not in this build | For the next build. |
| 16 | Phase 2 | **Match gist.** Grown-ups teasing grown-ups for losing to children (“Na small pikin beat una?”). Fond, or too sharp? | Not in this build | For the next build. |

## v39.2 What the copy avoids (spec §13.7)

Poverty spectacle (Aunty Bisi has no hardship story; no child begs; no coins counted in front of her; food is never refused: an empty purse gets a taste, never credit); child sellers; street-trading enforcement; haggling at her tray; hygiene jokes; food clichés; any man flirting with or commenting on her; gossip that shames; flogging jokes; ethnic stereotypes; religion beyond Mama Nkechi’s “God bless you”; alcohol; brands and real people; weekday names (“some evenings”, “tomorrow evening”, never a day); kneeling; Pidgin as the punchline; adults keeping children’s food. Please flag anything that crosses one of these lines.

## v39.3 Every v39 line, as the game ships it

Generated by `node tools/reader-v39.cjs` from the copy tables in `dist/src/seller-v39.js` (`BISI39`) and `dist/src/gist-v39.js` (`GIST39`). Every string in those tables is below, once. Rows are in the order of the questions above: the owner’s four items first, then the extras.

### Aunty Bisi (owner decision 1): her calls, her panel and her toasts (`BISI39.LINES`)

| Id | When | Line |
|---|---|---|
| gs39-bi-call1 | her calls in the street, in turn, every twelve seconds while she strolls | Puff-puff! Hot puff-puff! |
| gs39-bi-call2 | her calls in the street, in turn, every twelve seconds while she strolls | Puff-puff dey o! |
| gs39-bi-call3 | her calls in the street, in turn, every twelve seconds while she strolls | Groundnut! Fresh groundnut! |
| gs39-bi-come | answering “Call Aunty Bisi” from the rail | I dey come! |
| gs39-bi-hi | her panel’s greeting, the first evenings | Good evening o. Puff-puff, five in a nylon, still hot. Groundnut, roasted this morning. Which one? |
| gs39-bi-reg | her greeting once you are a regular (from the third evening bought) | Ah, my customer! You don come? The usual? |
| gs39-bi-jara | her heading after puff-puff, for a regular (“jara”) | Five, and one jara. Na so we dey do am for our people. |
| gs39-bi-pp | her heading after puff-puff | Still warm. |
| gs39-bi-gn | her heading after groundnut | A small bottle, roasted this morning, salted just right. |
| gs39-bi-more | added to her heading after a sale while something is left on the tray | Enjoy. Anything else? |
| gs39-bi-taste | an empty purse: a taste, never credit | Taste am first. Next time you go buy. |
| gs39-bi-lift | “Help her lift the tray”, her bubble | Help me small. Ehen. Thank you, my customer. |
| gs39-bi-fin | the Finds tip, in her panel after the first purchase of the evening ({piece} is a piece at Finds tomorrow) | I passed Finds on my way. They are bringing out the {piece} tomorrow. If you want it, go early. |
| gs39-bi-finok | her greeting the next time, when you bought the piece she named | You bought the {piece}? I told you. |
| gs39-bi-nk | her greeting once, when the household knows how to fry puff-puff | You fry too? Then you know say this thing na work. |
| gs39-kid-k | Kemi, given the bag of puff-puff after the match | Thank you o! Half half, Emeka. Fair is fair. |
| gs39-kid-e | Emeka, the same moment | Auntie’s own is sweeter. But this one is hot. |

Her panel and prompts (plain English, `BISI39.UI`):

| Key | Text |
|---|---|
| BISI39.UI.name | Aunty Bisi |
| BISI39.UI.kicker | AUNTY BISI |
| BISI39.UI.call | Call Aunty Bisi |
| BISI39.UI.buy | Buy from Aunty Bisi |
| BISI39.UI.wares | Puff-puff in a covered bowl, and groundnut in small bottles. |
| BISI39.UI.puffpuff | Puff-puff, a nylon of five |
| BISI39.UI.groundnut | Groundnut, a small bottle |
| BISI39.UI.kids | A bag for Kemi and Emeka |
| BISI39.UI.bought | Bought |
| BISI39.UI.lift | Help her lift the tray |
| BISI39.UI.notTonight | Not tonight |
| BISI39.UI.close | Close |
| BISI39.UI.ppToast | Puff-puff, five in a nylon. |
| BISI39.UI.jaraToast | Six puff-puff in the nylon: five, and one extra. |
| BISI39.UI.gnToast | A small bottle of groundnut. |
| BISI39.UI.kidsBought | A bag of puff-puff for Kemi and Emeka. They are at the football pitch. |
| BISI39.UI.give | Give Kemi and Emeka the puff-puff |
| BISI39.UI.kidsGone | Kemi and Emeka had already gone in. You shared the puff-puff yourselves instead. |
| BISI39.UI.finsPaid |  Aunty Bisi was right about the {piece}. |
| BISI39.UI.rowOn | Aunty Bisi passes this evening from five, with puff-puff. |
| BISI39.UI.rowOff | Aunty Bisi is not passing this evening. |
| BISI39.UI.rowBeen | Aunty Bisi has been this evening. |
| BISI39.UI.rowGone | Aunty Bisi has gone on her way for this evening. |
| BISI39.UI.eveOn | This evening: Aunty Bisi from five, the neighbours from a quarter past six. |
| BISI39.UI.eveOff | This evening: Aunty Bisi is not passing; the neighbours come by from a quarter past six. |
| BISI39.UI.eveBeen | This evening: Aunty Bisi has been; the neighbours come by from a quarter past six. |
| BISI39.UI.eveGone | This evening: Aunty Bisi has gone on her way; the neighbours come by from a quarter past six. |
| BISI39.UI.callChip | Aunty Bisi: |
| BISI39.UI.rowFinds | Aunty Bisi says the {piece} is at Finds today. |
| BISI39.UI.wait | Wait for Aunty Bisi |
| BISI39.UI.benchWait | Wait here for Aunty Bisi |
| BISI39.UI.benchSub | She passes with puff-puff from five |

### The Finds tip (owner’s item): told by Aunty Bisi; the lines are `gs39-bi-fin` and `gs39-bi-finok` above, the toast and Today’s row are `BISI39.UI.finsPaid` and `BISI39.UI.rowFinds`.

### Treat lines at the gist (the evening the household bought from Aunty Bisi; each guest at most once in seven days; it replaces that guest’s reaction)

| Id | Who | Line |
|---|---|---|
| gs39-tr-nk | Mama Nkechi | You bought from Bisi? I will take two and say I am not hungry. |
| gs39-tr-tu | Tunde | Puff-puff! New compound rule: whoever buys puff-puff shares it. |
| gs39-tr-ad | Ada | Puff-puff from Aunty Bisi. Do not tell Mama Nkechi. I will tell her myself. |
| gs39-tr-ba | Mr. Bassey | Puff-puff in the evening. In my time this would have been a party. |
| gs39-tr-oy | Mrs. Oyelaran | Puff-puff. One. I said one. |

### Aunty Bisi passes tomorrow (said at the gist only on an evening she did not pass; she is never away two evenings running)

| Id | Who says it | Line |
|---|---|---|
| gs39-bi-tom1 | any guest (Tunde and Ada always this one) | Aunty Bisi passes tomorrow evening. I have already told my stomach. |
| gs39-bi-tom2 | Mama Nkechi, Mr. Bassey or Mrs. Oyelaran (her near-peers; by the day) | Bisi’s round comes this side tomorrow. Keep small change by the door. |

### The set thank-you (owner’s item): it replaces the patron’s greeting at the next gist after a set on the shelf is complete

| Id | Who and when | Line |
|---|---|---|
| gs39-th-shells | Ada, for the five kinds of shell | Five kinds of shell. The beach has been talking to you. Lend me one for a frame? I will give it back. Probably. |
| gs39-th-carve | Mr. Bassey, for Ada’s six carved fish, with Ada beside him | Ada, see your work. Six fish on one shelf, and not one of them moving. I will come with my camera in the morning. |
| gs39-th-carve0 | Mr. Bassey, if Ada is somehow not there (a fallback) | Ada’s six fish on one shelf, and not one of them moving. I have photographed weddings with less patience. |
| gs39-th-adaR | Ada’s greeting on the carvings night: her reply | Six. I said I would carve them and I carved them. Thank you for the fish, sha. My hands were bored. |
| gs39-th-keep | Tunde, for the five keepsakes | Now your shelf has been to more parties than you have. |

Mr. Bassey’s photograph, the morning after: the toast “Mr. Bassey came by with his camera and made you both stand very straight.” and the album caption “Mr. Bassey photographed our shelf, and us beside it, standing very straight.”; the morning after that: “Mr. Bassey brought the print, framed.”

### The stool for the eldest guest (owner decision 3, “Only the eldest sits”)

The caption’s button on the elder’s greeting, the first time: “Bring the stool for {name}”. Ada’s tenth stool, the morning after her “nine times” line at a gist: “Ada left a stool at your door. ‘The tenth one. It is right. For the eldest at your rail.’” The stool she promised in her talk, delivered the next morning: “Ada left the stool she promised at your door. ‘For your housewarming. Use it before then.’”

| Id | Who | Line |
|---|---|---|
| gs39-st-bassey | Mr. Bassey, seated, the first time | Thank you, my friend. My knees were going to ask, but they are too proud. |
| gs39-st-oyelaran | Mrs. Oyelaran, seated, the first time | Thank you. I will sit. Ten minutes. |
| gs39-st-nkechi | Mama Nkechi, seated, the first time | Am I an old woman now? Well, since it is here. My legs have been in the shop since morning. See home training. |
| gs39-st-tunde | Tunde, the other guest, standing (that night only) | When I am old I will sit too. For now I am practising standing. |
| gs39-st-ada | Ada, the other guest, when the elder is Mr. Bassey (that night only) | Sit well, sir. It is my work. It will hold. |

### A neighbour’s fish for the pot (owner decision 2, “Add it”): asks and two thanks for each asker ({n} is said “two” or “three”)

| Id | Who | When | Line |
|---|---|---|---|
| gs39-pot-nk-t | Mama Nkechi | in their talk, for today | I am making pepper soup today. Anybody fishing after two, bring me {n}. Not before two. Fish that sits in the sun is not pepper soup fish. |
| gs39-pot-nk-g | Mama Nkechi | at the gist, for tomorrow (first, by the day) | Tomorrow, pepper soup. {n} fish, caught after two o’clock. My pot can tell. |
| gs39-pot-nk-g2 | Mama Nkechi | at the gist, for tomorrow (second, by the day) | Pepper soup tomorrow, my dear. {n} fish, caught after two o’clock. Fresh fish or nothing. |
| gs39-pot-nk-ty1 | Mama Nkechi | given the fish (first) | Still shining. These were swimming an hour ago. I will send a bowl across this evening, my dear. |
| gs39-pot-nk-ty2 | Mama Nkechi | given the fish (second) | Fresh, fresh. You have good hands. Watch for the bowl at six. |
| gs39-pot-ba-t | Mr. Bassey | in their talk, for today | My sister visits and she says my cooking is a rumour. {n} fresh fish after two, and I will prove her wrong. |
| gs39-pot-ba-g0 | Mr. Bassey | at the gist, for tomorrow: his first ask there (it carries the setup) | My sister visits tomorrow, and she says my cooking is a rumour. {n} fresh fish after two, and I will prove her wrong. |
| gs39-pot-ba-g | Mr. Bassey | at the gist, for tomorrow (first, by the day) | Tomorrow I cook for my sister again. {n} fish after two, please. The last ones were the only thing she praised. |
| gs39-pot-ba-g2 | Mr. Bassey | at the gist, for tomorrow (second, by the day) | My sister comes again tomorrow. {n} fish after two, please, and not a word to her about where they came from. |
| gs39-pot-ba-ty1 | Mr. Bassey | given the fish (first) | Fine fish. My sister will have to find something else to complain about. |
| gs39-pot-ba-ty2 | Mr. Bassey | given the fish (second) | Thank you. Something from the pot will come across. Do not tell her I had help. |

### The again round (owner decision 4, “Five new, then ‘again’”): one tip and one thank-you per owner; {thing} is the thing as one item (“pair of glasses”, “packet of seed”, “tin of drawing pins”)

| Id | Who | Line |
|---|---|---|
| gs39-again-nkechi | Mama Nkechi | My {thing} has gone walking again. If you see it, you know whose it is. |
| gs39-again-tunde | Tunde | My {thing} has gone on tour again. Without me. |
| gs39-again-ada | Ada | My {thing} again. I measure twice and lose things once a week. |
| gs39-again-bassey | Mr. Bassey | My {thing}. Again. Mind the light, and mind your things, I always say. |
| gs39-again-oyelaran | Mrs. Oyelaran | My {thing} is out there again. I will not discuss it. |
| gs39-againty-nkechi | Mama Nkechi (thanks) | Again! You are the compound’s lost-and-found now. God bless you. |
| gs39-againty-tunde | Tunde (thanks) | You again. Me again. We should stop meeting like this. |
| gs39-againty-ada | Ada (thanks) | Again. I am going to tie it to my wrist. |
| gs39-againty-bassey | Mr. Bassey (thanks) | In 1979 I lost nothing. Now look at me. |
| gs39-againty-oyelaran | Mrs. Oyelaran (thanks) | Thank you. Do not tell anybody it happened again. |

Retold by another guest: “{owner}’s {thing} went walking again, and came home again. The compound has a new habit.” (`gs39-told-again`). An answer-back kept for completeness (the owner always tells their own): “Again, yes. You may stop counting.” (`gs39-back-again`). The pick-up toast: “{thing}, again. {owner}’s, of course.”.

### Giving a thing back at the gist: the owner’s line when they see it in your hand ({thing} as one item, as above; their thanks after it are v38’s own)

| Id | Who | Line |
|---|---|---|
| gs39-gb-ada | Ada | Is that my {thing} in your hand? Bring it here before Tunde borrows it. |
| gs39-gb-nkechi | Mama Nkechi | Eh! My {thing}! You were carrying it all this time? Come, give me. |
| gs39-gb-tunde | Tunde | Is that my {thing}? I have been looking for it since yesterday. Quietly. |
| gs39-gb-bassey | Mr. Bassey | My {thing}. I would know it in any light. |
| gs39-gb-oyelaran | Mrs. Oyelaran | That is mine. Hand it over the rail, please. Gently. |

### Round two: five new small things, one per neighbour (each owner tells their own the evening before)

| Id | Who | When | Line |
|---|---|---|---|
| gs39-lost-pencil | Ada | the tip, the evening before | Tomorrow I am at the Yard all afternoon, and my pencil lives behind my ear until it does not. |
| gs39-told-pencil | another guest | the day it went back | Ada says her pencil came back to her ear. She measured twice to be sure. |
| gs39-back-pencil | Ada | answer-back (kept for completeness) | It is not lost. It is behind somebody else’s ear. |
| gs39-ty-pencil | Ada | thanks, given back | My pencil! I have been measuring with my thumb all afternoon. Thank you, sha. |
| gs39-lost-tape | Tunde | the tip, the evening before | Tomorrow I am wiring the stage in the square. If a roll of black tape rolls away, it is mine. It always rolls away. |
| gs39-told-tape | another guest | the day it went back | Tunde says your tape saved the sound in the square. He says it every five minutes. |
| gs39-back-tape | Tunde | answer-back (kept for completeness) | Tape does not walk. It rolls. That is a different thing. |
| gs39-ty-tape | Tunde | thanks, given back | My tape! The sound was holding on by a thread. You have saved the next wedding too. |
| gs39-lost-pin | Mama Nkechi | the tip, the evening before | Tomorrow I go down Market Road for pepper. My headtie pin has been loose all week. If it falls, it is mine. |
| gs39-told-pin | another guest | the day it went back | Mama Nkechi says her headtie is standing up properly again. She thanks you with her whole head. |
| gs39-back-pin | Mama Nkechi | answer-back (kept for completeness) | My pin is loose, not lost. There is a difference. |
| gs39-ty-pin | Mama Nkechi | thanks, given back | My pin! My headtie has been leaning all day like a tired man. God bless you, my dear. |
| gs39-lost-cloth | Mr. Bassey | the tip, the evening before | Tomorrow afternoon I photograph the water again. My lens cloth likes the breeze more than I do. Mind it for me. |
| gs39-told-cloth | another guest | the day it went back | Mr. Bassey cleaned every lens he owns with that cloth today. Twice. |
| gs39-back-cloth | Mr. Bassey | answer-back (kept for completeness) | I will hold it with both hands. Firmly. |
| gs39-ty-cloth | Mr. Bassey | thanks, given back | My lens cloth. Thank you, my friend. The water was beautiful and my lens was not. |
| gs39-lost-pins | Mrs. Oyelaran | the tip, the evening before | Tomorrow I change the notices. If a tin of drawing pins goes walking, it is mine, and the noticeboard is waiting. |
| gs39-told-pins | another guest | the day it went back | Mrs. Oyelaran put up three new notices already. She says it is because of you. She did not smile. |
| gs39-back-pins | Mrs. Oyelaran | answer-back (kept for completeness) | The noticeboard will manage for one afternoon. I will not. |
| gs39-ty-pins | Mrs. Oyelaran | thanks, given back | My drawing pins. Thank you. The notices were sliding off the board one by one. |

| Thing | Owner | Words | Pick-up toast | Give label | Today (heard) | Night page |
|---|---|---|---|---|---|---|
| pencil | Ada | a pencil stub · pencil stub · the Makers’ Yard · “Somewhere in the Makers’ Yard” | A pencil stub, sharpened with a knife. Ada keeps one behind her ear. | Give Ada her pencil | Ada is at the Makers’ Yard all afternoon today. Her pencil stub may go missing there. | Ada says her pencil stub may go missing in the Makers’ Yard tomorrow. |
| tape | Tunde | a roll of insulating tape · insulating tape · by the square’s stage · “Over by the stage in the square” | A roll of black insulating tape, half used. Tunde’s, from the sound. | Give Tunde his tape | Tunde is wiring the square’s stage today. Look out for a roll of tape. | Tunde says a roll of his tape may roll away by the square’s stage tomorrow. |
| pin | Mama Nkechi | a headtie pin with a glass bead · headtie pin · Market Road, between the stalls · “Somewhere on Market Road” | A headtie pin with a small glass bead. Mama Nkechi wears one like it. | Give Mama Nkechi her pin | Mama Nkechi is buying pepper on Market Road today. Her headtie pin may fall. | Mama Nkechi says her headtie pin may fall on Market Road tomorrow. |
| cloth | Mr. Bassey | a cloth for a camera lens · lens cloth · the waterfront · “On the waterfront” | A soft cloth for a camera lens, folded small. Mr. Bassey’s, surely. | Give Mr. Bassey his lens cloth | Mr. Bassey is photographing the water this afternoon. Watch for his lens cloth. | Mr. Bassey says his lens cloth may blow away on the waterfront tomorrow. |
| pins | Mrs. Oyelaran | a tin of drawing pins · drawing pins · the courtyard, by the noticeboard · “In the courtyard by the noticeboard” | A small tin of drawing pins. Somebody keeps a noticeboard. | Give Mrs. Oyelaran her drawing pins | Mrs. Oyelaran is changing the notices today. A tin of drawing pins may go walking in the courtyard. | Mrs. Oyelaran says her tin of drawing pins may go walking in the courtyard tomorrow. |

### The interface (plain English): every string in `GIST39.UI`, by its key

| Key | Text |
|---|---|
| GIST39.UI.give | Give it back |
| GIST39.UI.stool | Bring the stool for {name} |
| GIST39.UI.potKeep | Keep it for {name}’s pot |
| GIST39.UI.potKicker | FOR THE POT |
| GIST39.UI.potTitle | One for {name}’s pot. |
| GIST39.UI.potLeft[0] | That is all of them. Give them by half past five. |
| GIST39.UI.potLeft[1] | One more to go. |
| GIST39.UI.potLeft[2] | Two more to go. |
| GIST39.UI.potLeft[3] | Three more to go. |
| GIST39.UI.potGive | Give {name} the fish |
| GIST39.UI.potClose | Close |
| GIST39.UI.castAgain | Cast again |
| GIST39.UI.backShore | Back to the shore |
| GIST39.UI.potRowAsk | {owner}’s pot: {n} fish caught after two o’clock, by half past five. |
| GIST39.UI.potRowSome.1/2 | One fish kept for {owner}’s pot. One more, then give them by half past five. |
| GIST39.UI.potRowSome.1/3 | One fish kept for {owner}’s pot. Two more, then give them by half past five. |
| GIST39.UI.potRowSome.2/3 | Two fish kept for {owner}’s pot. One more, then give them by half past five. |
| GIST39.UI.potRowAll | The fish for {owner}’s pot are kept. Give them by half past five. |
| GIST39.UI.potRowGiven | {owner} has the fish. A bowl comes across at six. |
| GIST39.UI.potBowl | A bowl of {dish} came across from {owner}. |
| GIST39.UI.dish.nkechi | pepper soup |
| GIST39.UI.dish.bassey | fish stew |
| GIST39.UI.num[0] | none |
| GIST39.UI.num[1] | one |
| GIST39.UI.num[2] | two |
| GIST39.UI.num[3] | three |
| GIST39.UI.tenth | Ada left a stool at your door. ‘The tenth one. It is right. For the eldest at your rail.’ |
| GIST39.UI.promised | Ada left the stool she promised at your door. ‘For your housewarming. Use it before then.’ |
| GIST39.UI.photoToast | Mr. Bassey came by with his camera and made you both stand very straight. |
| GIST39.UI.photoCaption | Mr. Bassey photographed our shelf, and us beside it, standing very straight. |
| GIST39.UI.printToast | Mr. Bassey brought the print, framed. |
| GIST39.UI.returned | Things given back: {n}. |
| GIST39.UI.againPick | {thing}, again. {owner}’s, of course. |
| GIST39.UI.againHeard | {owner}’s {thing} has gone walking again today: {area}. |
| GIST39.UI.againRecap | {owner}’s {thing} may go missing again tomorrow: {area}. |
| GIST39.UI.recapPot | {owner} wants {n} fish for the pot tomorrow, caught after two o’clock. |
| GIST39.UI.memoryNoShelf.keepsake | Five keepsakes from five neighbours, waiting for a shelf. |
| GIST39.UI.memoryNoShelf.shells | All five shells from the beach, waiting for a shelf. |
| GIST39.UI.memoryNoShelf.carve | Ada’s six carved fish, waiting for a shelf. |

## v39.4 How the v39 lines are chosen

- Aunty Bisi calls in turn while she strolls, and stops calling once she is called or bought from. Her first-evening greeting gives way to her regular’s line from the third evening bought; “jara” comes with it.
- A treat line comes at most once in seven days for each guest, on an evening the household bought puff-puff from her (not groundnut alone), in place of that guest’s reaction; Ada’s (“Do not tell Mama Nkechi”) never when Mama Nkechi is the other guest. “Aunty Bisi passes tomorrow evening” is said only on an evening she did not pass; the plain “Bisi’s round comes this side tomorrow” only by Mama Nkechi, Mr. Bassey or Mrs. Oyelaran (Tunde and Ada always say “Aunty Bisi”).
- A set thank-you comes once per set, at the first gist after it is complete with the shelf up, in place of the patron’s greeting (two sets on one day: one a night). On the carvings night Ada’s greeting is her reply.
- The owner of a thing in your pocket comes for it only once it has been held through an earlier gist; their thanks after “Give it back” are v38’s own.
- Each elder’s stool line is said once, ever; later the stool is handed over as they arrive, with no line. Tunde’s and Ada’s lines ride on that first night only (Ada’s only to Mr. Bassey: it says “sir”).
- Each pot asker asks at most every second day: Mama Nkechi in her morning talk or at the gist, Mr. Bassey in his morning talk (his talk is the game’s own, so his ask is added to it) or at the gist. His first ask at a gist carries the setup about his sister; after that each asker’s gist ask and thanks are one of two, by the day. On a night with a give-back or an elder’s first stool line the gist ask waits for the next night.
- The again round and the give-back say the thing as one item (“pair of glasses”, “packet of seed”, “tin of drawing pins”), so the sentences agree whatever the thing; the again thanks never count how often it happened.
- Round two’s things are told by their owners the evening before they go missing; in the again round each owner has one tip and one thank-you, whatever the thing.
- A gist carries at most two of these new lines (a thank-you, a treat line that replaces a reaction, and Tunde’s or Ada’s stool line take none): first the give-back, then an elder’s first stool line, the pot ask, the treat line, Aunty Bisi tomorrow.
