# Evening gist and daily finds (v38): the Nigerian reader's sheet

**v40 adds its own section at the end of this sheet** (“v40: Notices, children's things and fresh evenings”): read that first, the owner’s pieces before the errand. v39’s section (“v39: Aunty Bisi, thanks at the rail and fuller afternoons”) comes before it. Sections 1 to 5 below are v38’s and unchanged.

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

# v40: Notices, children's things and fresh evenings

Build **v40** (the Menu shows the exact build). Spec: `v40/SPEC.md` §13. Everything new that v40 puts in front of a player is in section v40.3, generated from the game’s own tables by `node tools/reader-v40.cjs` (`BOARD40.CARDS`, `BOARD40.UI`, `BOARD40.THINGS`, `BOARD40.AREAS`, `BOARD40.WHERE` and `BOARD40.INITIAL` in `dist/src/board-v40.js`, `MALLAM40.LINES` and `MALLAM40.UI` in `dist/src/mallam-v40.js`, `GIST40.LINES` and `GIST40.UI` in `dist/src/gist-v40.js`), every string once, with its id, the question below it belongs to, and what ships if you flag it. The rule is the same as for v38 and v39: any line the reader flags is replaced by the reader’s wording or cut, never shipped as it is. Lines nobody flags ship. The harness `check/verify-gist-v40.cjs` (check 12) holds the same rules: no weekday or month names, British spelling, no digits or ₦ in speech (Mr. Bassey’s “1979” excepted), curly apostrophes, at most 160 characters for speech; cards are written notices in standard English, at most 200 characters, “Flat 3” the only digit, signed.

**What the owner chose, in their own words.**
1. “LOST:” cards: “One a day”: “A reason to cross the courtyard every late morning, which is the gap this build is aimed at.”
2. A neighbour’s errand: “Add it”.
3. Mallam’s day: “Morning order, evening coals”: “You order your suya at half past ten, help fan the coals from five, and he stays by his grill during the gist. He hands over your sticks afterwards.”
4. His name: “He says it once”: “He becomes a neighbour with a name, but the compound still calls him Mallam.”

**How to see it.** Play past day 4 (or day 8 if you never buy from Aunty Bisi) and read the noticeboard after half past ten: the first read with a new card shows the rest of v40. `?board=now` in the address puts the next card up at once; `?mallam=now` keeps Mallam at his grill with the coals to fan; `?gist40=playtest` has a child lose a thing after every match the household plays.

**Where Mallam stands.** In the late morning he sits at the east end of his stall, threading sticks and facing the customer; from five he stands there by the grill (fix round: behind the stall, where he stood before, the desk camera cut him off at his own stall). **Mallam at the gist (question 18 below).** He sits by his grill, west of the stall, while the neighbours are at the rail. At 1280 × 800 and 844 × 390 he is out of the gist’s frame; at 390 × 844 he sits low on the left, below the caption, clear of the guests and the rail. Captures: `v40/build/board/browser/shots/Ad-mallam-27-gist-mallam-seated.png`, `Al-gist-31-gist-mallam-landscape.png`, `Ap-gist-31-gist-mallam-portrait.png`.

## v40.1 Questions to answer first (the owner’s pieces first, then the errand)

The questions that block v40’s copy most come first: Mallam’s name, how a child speaks to a grown-up whose gender the game does not know, and the earlier sheets’ questions on children’s lost things, the noticeboard and match gist (v39’s rows 15 and 16), which are this build now. Then the owner’s pieces in their order: the cards (culture question 1), the children (5, 6), the match gist (7), the seasons (4), Mallam (3), then the errand; then the two new questions (the picture of Mallam at the gist, and the hour of his fire).

| # | Item | Question | Where it shows | If it is wrong |
|---|---|---|---|---|
| 1 | Mallam | **His name** (owner decision 4, “He says it once”: “He becomes a neighbour with a name, but the compound still calls him Mallam.”). He says once: “Sannu. My name is Sani. Everybody calls me Mallam.” (his greeting, then the two sentences the owner approved; the game still calls him Mallam everywhere). Is Sani right, and is it natural that the compound still says Mallam? | `gs40-ma-name` | The reader’s name or wording; the line ships and is changed if you object. |
| 2 | The children | **Thanks without Aunty or Uncle.** The game does not know the player’s gender, so the children say “Thank you o!”, “Thank you very much!” and never “Aunty” or “Uncle”. Enough, or does it sound rude? | `gs40-kid-ty-*` | The reader’s gender-free form. |
| 3 | The cards and the children | **Carried from v39 (rows 15 and 16).** Children’s lost things; formal “LOST:” cards signed with an initial and crossed out when found; grown-ups teasing grown-ups for losing to children. Now in the game: see rows 4–11. | v40.3 sections 1–3 | As in those rows. |
| 4 | The cards | **The noticeboard.** Neighbours writing their own “LOST:” cards in their own hands (Mrs. Oyelaran’s blue capitals with her first word underlined, Tunde’s marker on a flyer, Ada’s pencil capitals with a small sketch on the card that says “See sketch”, Mama Nkechi’s big round hand on a receipt-pad page, Mr. Bassey’s joined-up “With thanks, Bassey”), crossed out with “Found. Thank you. — T.” or “FOUND. God bless Flat 3. — Mama N.”, the crossed card down two mornings later. True to a compound board? | `bd40-card-*`, `bd40-again-*`, `bd40-cross-*` | The reader’s wording or the hand’s style. |
| 5 | The cards | **Mrs. Oyelaran changes the notices at half past ten** and tells passers-by “New notices. Kindly read them.” (her catchphrase “Ten-thirty.” stays her housewarming’s; the game says “half past ten”). Natural for the board’s keeper? | `bd40-oy-bubble`; Today’s board line | Her bubble goes; Today alone says it. |
| 6 | The cards | **The ten things** (a radio’s volume knob, a watering can’s sprinkler head, a long wooden spoon, a receipt pad, a sanding block, a tin of wood oil, an old film canister, a wedding photograph in an envelope, a bag of clothes pegs, the compound meeting’s minutes book) and their thanks. Right for these neighbours? “Minutes book of the compound meeting” with “Somebody will say this was on purpose. It was not.”? | `bd40-card-*`, `bd40-ty-*` | The reader’s thing or line. |
| 7 | The children | **What they lose:** Emeka his best marble (glass with a coloured twist) and a tin of flattened bottle tops; Kemi her hair band with two blue bobbles and her plastic whistle on a string. (Left out: a slipper, which is footwear and which football draws by the goal every match; the school cardigan, which is uniform.) Right for ten- and eleven-year-olds? | `GIST40.LINES.kid.items` | The reader’s things. |
| 8 | The children | **Their calls and thanks:** “My best marble! It was in my pocket a minute ago.”, “My hair band! I looked everywhere except where it was. Thank you o!”, “Next game I am passing to you first. Maybe.”, “Next time we play, you can have first go with my best one.” Natural? | `gs40-kid-sh-*`, `gs40-kid-ty-*`, `gs40-kid-play-*`, `gs40-kid-ask-*` | The reader’s wording. |
| 9 | The children | **Mama Nkechi’s loving scold** when Emeka’s thing comes back to her shop: “Chai! This boy. His feet came home and his marble stayed out to play. Thank you, my dear. I will hand it over with a speech.” (once Emeka has gone home; while he is still out at the pitch: “Chai! This boy. He is still out at the pitch and his marble is already at my shop. Thank you, my dear. He will hear about this at supper.”) and “That boy will lose his head one day if it is not tied on. Bless you, my dear, for bringing it back.” Loving, or too sharp? (No “nna” in this build.) | `gs40-kid-nk-*` | The reader’s wording. |
| 10 | The children | **The fond mention at the gist** (Mama Nkechi of Emeka, Mr. Bassey of Kemi; the child is not at the gist): “Emeka came home with one marble fewer. He says it is resting on the sand by the pitch. I said: so am I, from you.” Warm, or telling tales? | `gs40-kid-mn-*` | The thing told only by the child and Today. |
| 11 | The match | **Match gist** (culture question 7): Mr. Bassey’s “ball of rags tied with string”, “She will play for the country one day.” (no real team or player), Mrs. Oyelaran’s “Once is a game. Twice is a compound meeting.” (she is out from twelve to six and a match can be decided as late as twenty past six, so her match news is what the street tells her, with no hour: “The street has told me already: you won.”), Mama Nkechi’s “He says it like a lawyer.”, the grown-ups teased for losing to children, never the children. Fond and true? | `gs40-fb-*` | Cut the line; another or none takes the evening. |
| 12 | The seasons | **The seasons** (culture question 4): “Bring in your clothes!”, pepper soup weather, cracked lips and cream in harmattan, a cardigan on a cold harmattan morning, Ada oiling wood against cracks, flat harmattan light, “the rain is resting” (never “the August break”, which would show the game’s short year). True for a Lagos-like waterside? | `gs40-se-*`, `gs40-ev-*` | The reader’s wording; a season line can be cut. |
| 13 | The seasons | **The evening before a season changes** a neighbour says so (“Harmattan tomorrow. Cover what you love. Dust has no manners.”, “The rains come back tomorrow. My wood knows it already.”), and it comes true in the sky. No line ever promises rain itself. Natural to talk about the season turning? | `gs40-tr-*` | Plainer news. |
| 14 | The seasons | **Other wordings for the information lines that came back most often**, used only so the same news does not come back night after night: the fish for the pot (“The rainy season wants soup, my dear. Tomorrow my pot needs two fish, and only ones caught after two o’clock.”), the “again” tips by season (said the evening before the thing goes missing again: “In this heat my patience goes first, then my tools. Next it will be my {thing}, I can feel it.”), Ada’s ask for a fish to carve by season, the wash tip and “Aunty Bisi passes tomorrow”. Each says the same news as v38’s or v39’s own line. | `gs40-pot-*`, `gs40-ag-*`, `gs40-ask-*`, `gs40-wash-*`, `gs40-tom-*` | v38’s or v39’s own lines stay. |
| 15 | Mallam | **His day** (owner decision 3, “Morning order, evening coals”: “You order your suya at half past ten, help fan the coals from five, and he stays by his grill during the gist. He hands over your sticks afterwards.”). Threading sticks under his shade in the late morning; the household fanning the coals with a raffia fan and turning the sticks: one player fans while the other turns them (a player alone does both); the first stick shared by those who helped (no money changes hands). Natural? | `gs40-ma-*` | The reader’s wording. |
| 16 | Mallam | **His voice and clothes.** “Sannu”, “Yauwa” (and “Na gode. Sai gobe.”, written but not used in this build), at most one Hausa word a line, no accent spelling, his father’s yaji, a dry humour; a plain kaftan and cap. Natural, or tokenistic? | `gs40-ma-*`, his figure | Plain English; the reader’s clothes. |
| 17 | Mallam | **The goodbyes that nod to him** at the gist (“Mallam, keep one stick warm for me tomorrow.”), only on an evening he sits by his grill. | `gs40-ev-*-b2` | Cut: the other goodbye stays. |
| 18 | Mallam (new) | **The picture of Mallam at the gist**: he sits by his grill, west of the stall, while the neighbours stand at the rail (captures above). Does that read as part of the compound’s evening, or set apart? | The gist, captures | He walks off for charcoal with “More charcoal. I am coming.” and walks back (built, not used). |
| 19 | Mallam (new) | **The hour of his fire**: a suya man laying and lighting his charcoal at about five in the afternoon (after the order he says “Come back this evening”, never “at dusk”, because in the game dusk is half past seven). Does five read right, or would he light later? | His arrival at five, the fan beat | The time is a design choice for the late afternoon; the reader’s answer goes to the owner. |
| 20 | The errand | **A neighbour’s errand** (owner decision 2, “Add it”): Mrs. Oyelaran’s notice (“NOTICE. Mama Nkechi has a covered plate of jollof for Ada. Kindly collect from the shop after half past twelve. — O.”), the household carrying it, the receiver’s thanks, and at the rail that night the receiver’s word (“The plate came this afternoon, still warm. Mama Nkechi knows I forget lunch.”). No money changes hands. Natural for neighbours, or a chore? | `bd40-er-*`, `gs40-er-*` | The reader’s wording. |

## v40.2 What the copy avoids (spec §13.7)

Poverty spectacle; religious caricature (no church card in this build); ethnic stereotypes (Mallam: no accent spelling, no costume, nothing made of his faith, never “aboki”, never the gateman); shaming notices (no named culprit, no “God is watching you”, no money reward); money disputes on the board; alcohol; brands and real people (no real team or player); weekday and month names; exotic framing; Pidgin as the punchline or on a card. Children: nothing about beatings, why Emeka lives with his aunt, Kemi being a girl, or comparisons between them; their things are small and cheap, and they give back play, never things of value. Seasons: no flooding as disaster, no illness, no water shortage, no power cuts as content, no festivals, no bush burning. Please flag anything that crosses one of these lines.

## v40.3 Every v40 line, as the game ships it

Generated by `node tools/reader-v40.cjs` from the copy tables in `dist/src/board-v40.js` (`BOARD40.CARDS`, `BOARD40.UI`, `BOARD40.THINGS`, `BOARD40.AREAS`, `BOARD40.WHERE`, `BOARD40.INITIAL`), `dist/src/mallam-v40.js` (`MALLAM40.LINES`, `MALLAM40.UI`) and `dist/src/gist-v40.js` (`GIST40.LINES`, `GIST40.UI`). Every string a player can see is below, once, with its id or key. **Q** is the question in v40.1 the row belongs to; **If it is wrong** is what ships if you flag it and give no wording. Rows follow the questions above: the owner’s pieces first (the cards, Kemi’s and Emeka’s things, the match gist, the seasons, Mallam), then the errand, then the interface. Cards are written notices (standard English, signed); everything a person says is speech.

### 1. The “LOST:” cards (owner decision 1, “One a day”): each in its owner’s hand, past tense, pinned at half past ten

| Id | Owner | The thing (first cycle’s area; again cycle’s area) | Card | Q | If it is wrong |
|---|---|---|---|---|---|
| bd40-card-knob | Tunde | the volume knob off his small radio (by the square’s stage; by the square’s garden bed) | LOST: the volume knob off my small radio. Black, round, very important. Somewhere by the stage. Now the radio only shouts. — T. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-rose | Tunde | the sprinkler head off his watering can (by the square’s garden bed; by the square’s stage) | LOST: the sprinkler head off my watering can. Green, full of small holes. By the garden bed in the square. My seedlings are drinking from a cup. — T. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-spoon | Mama Nkechi | her long wooden stirring spoon (on the waterfront sand by the bench; on Market Road, between the stalls) | LOST: my long wooden spoon. The good one. On the sand by the bench, I think. Bring it to the shop. I will know it is mine. — Mama N. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-pad | Mama Nkechi | her receipt pad (on Market Road, between the stalls; on the waterfront sand by the bench) | LOST: my receipt pad, the small yellow one. On Market Road, between the stalls. My sums are all in my head now, and my head is full. Return it to the shop. — Mama N. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-block | Ada | her sanding block (in the Makers’ Yard; near the rocks) | LOST: my sanding block. About the size of my hand. Somewhere in the Yard. See sketch. — A. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-oil | Ada | a small tin of wood oil (near the rocks; in the Makers’ Yard) | LOST: a small tin of wood oil, lid on, I hope. Near the rocks, where I was carving. The wood is thirsty. — A. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-film | Mr. Bassey | an old film canister (on the waterfront, east of the photo spot; on the waterfront, towards the square) | LOST: an old film canister, black, with a grey lid. On the waterfront past my corner. If found, kindly return. With thanks, Bassey. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-print | Mr. Bassey | a wedding photograph in a brown envelope (on the waterfront, towards the square; on the waterfront, east of the photo spot) | LOST: a wedding photograph in a brown envelope, an old one. On the waterfront, towards the square. If found, kindly return. With thanks, Bassey. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-pegs | Mrs. Oyelaran | a bag of clothes pegs (in the street, west of the gate; in the courtyard, by the noticeboard) | LOST: one bag of wooden clothes pegs, blue nylon. In the street, west of the gate. The washing is holding on by faith. Kindly return to the top flat. — O. | 4, 6 | The reader’s wording, or another thing for that owner. |
| bd40-card-minutes | Mrs. Oyelaran | the compound meeting’s minutes book (in the courtyard, by the noticeboard; in the street, west of the gate) | LOST: the minutes book of the compound meeting. Somebody will say this was on purpose. It was not. In the courtyard, by this board. — O. | 4, 6 | The reader’s wording, or another thing for that owner. |

After all ten have been back once, each card goes up “again”, in the owner’s own “again” words ({thing} is the thing, {area} its second place in the again form from the interface table below, such as “round the rocks” or “along Market Road, between the stalls”). The last column shows one as it reads on the board:

| Id | Owner | Card | As it reads | Q | If it is wrong |
|---|---|---|---|---|---|
| bd40-again-tunde | Tunde | LOST AGAIN: my {thing}. Not where it went last time, of course. Look {area}. — T. | LOST AGAIN: my radio knob. Not where it went last time, of course. Look by the garden bed in the square. — T. | 4 | The reader’s wording. |
| bd40-again-nkechi | Mama Nkechi | LOST AGAIN: my {thing}. I know. This time look {area}, and drop it at the shop. — Mama N. | LOST AGAIN: my wooden spoon. I know. This time look along Market Road, between the stalls, and drop it at the shop. — Mama N. | 4 | The reader’s wording. |
| bd40-again-ada | Ada | LOST AGAIN: my {thing}. I blame the Yard. Try looking {area}. — A. | LOST AGAIN: my sanding block. I blame the Yard. Try looking round the rocks. — A. | 4 | The reader’s wording. |
| bd40-again-bassey | Mr. Bassey | LOST AGAIN: my {thing}, I regret to say. This time {area}. With thanks, Bassey. | LOST AGAIN: my film canister, I regret to say. This time along the waterfront, towards the square. With thanks, Bassey. | 4 | The reader’s wording. |
| bd40-again-oyelaran | Mrs. Oyelaran | LOST AGAIN: the {thing}. No comment. Look {area}. — O. | LOST AGAIN: the bag of clothes pegs. No comment. Look round the courtyard, by this board. — O. | 4 | The reader’s wording. |

The card crossed out when the thing goes back (the owner’s note under it), and Mrs. Oyelaran’s bubble by the board:

| Id | Who | Text | Q | If it is wrong |
|---|---|---|---|---|
| bd40-cross-tunde | Tunde | Found. Thank you. — T. | 4 | The reader’s wording. |
| bd40-cross-nkechi | Mama Nkechi | FOUND. God bless Flat 3. — Mama N. | 4 | The reader’s wording. |
| bd40-cross-ada | Ada | Found. Measured twice. — A. | 4 | The reader’s wording. |
| bd40-cross-bassey | Mr. Bassey | Found and returned. With thanks, Bassey. | 4 | The reader’s wording. |
| bd40-cross-oyelaran | Mrs. Oyelaran | Found, and returned by Flat 3. Noted. — O. | 4 | The reader’s wording. |
| bd40-oy-bubble | Mrs. Oyelaran (spoken, a bubble) | New notices. Kindly read them. | 5 | Her bubble goes; Today alone says it. |

Thanks in the give panel (spoken; no money, no keepsake: “Returns stay thanks and friendship, never cash.”):

| Id | Who | Line | Q | If it is wrong |
|---|---|---|---|---|
| bd40-ty-knob | Tunde | My knob! The radio has been shouting at me since yesterday. Now it can whisper again. Thank you o. | 6 | The reader’s wording. |
| bd40-ty-rose | Tunde | My sprinkler head! Gardeners call it a rose, you know. My seedlings thank you, and they do not thank anybody. | 6 | The reader’s wording. |
| bd40-ty-spoon | Mama Nkechi | My spoon! This one has stirred more stew than you have eaten. God bless you. | 6 | The reader’s wording. |
| bd40-ty-pad | Mama Nkechi | My receipt pad! Now my sums will add up again. Bless you, my dear. | 6 | The reader’s wording. |
| bd40-ty-block | Ada | My block. I have been sanding with a stone all day, and the stone is winning. Thank you, sha. | 6 | The reader’s wording. |
| bd40-ty-oil | Ada | My oil. The iroko was starting to look at me. Thank you. | 6 | The reader’s wording. |
| bd40-ty-film | Mr. Bassey | My canister. Empty, yes, but it has been with me since my first camera. Thank you, my friend. | 6 | The reader’s wording. |
| bd40-ty-print | Mr. Bassey | The envelope. They were married in this compound, you know. Before your time. Thank you, my friend. | 6 | The reader’s wording. |
| bd40-ty-pegs | Mrs. Oyelaran | My pegs. Thank you. The washing can stop holding on by itself. | 6 | The reader’s wording. |
| bd40-ty-minutes | Mrs. Oyelaran | The minutes. Thank you. Everything this compound has ever agreed is in here. It is a short book. | 6 | The reader’s wording. |
| bd40-againty-tunde | Tunde | Again! My {thing} likes you more than it likes me. Thank you o. | 6 | The reader’s wording. |
| bd40-againty-nkechi | Mama Nkechi | Again, my dear? God bless you twice. | 6 | The reader’s wording. |
| bd40-againty-ada | Ada | Again. Next time I will nail it down. | 6 | The reader’s wording. |
| bd40-againty-bassey | Mr. Bassey | Again, my friend. A man of my age should not lose things twice. Thank you. | 6 | The reader’s wording. |
| bd40-againty-oyelaran | Mrs. Oyelaran | Thank you. We will not mention this at the meeting. | 6 | The reader’s wording. |

At the gist the evening a card thing went back, its owner may say (when a guest; one of three: the first not heard in the last thirteen evenings, else the one heard longest ago):

| Id | Who | Line | Q | If it is wrong |
|---|---|---|---|---|
| gs40-ret-tu1 | Tunde | You found my {thing}. I put a line through the card myself. With pleasure. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-tu2 | Tunde | My {thing} is back where it lives. I told the whole courtyard who found it. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-tu3 | Tunde | My {thing} came home. Thank you o. I will tell it off later. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-nk1 | Mama Nkechi | My {thing} is home, thanks to this house. I told every customer. Some of them clapped. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-nk2 | Mama Nkechi | You brought my {thing} back. I crossed it off the board with my best pen. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-nk3 | Mama Nkechi | My {thing} is back in the shop, my dear. I have told it to stay. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-ad1 | Ada | My {thing} came back. I have put it where I can see it. That never works, but I try. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-ad2 | Ada | Thank you again for my {thing}. I crossed the card out neatly. You would expect nothing less. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-ad3 | Ada | My {thing} is back on my bench. This time I have measured where I put it. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-ba1 | Mr. Bassey | My {thing} is safe in my bag again. I struck out the card in my best handwriting. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-ba2 | Mr. Bassey | You found my {thing}. In my time a thing that was lost stayed lost. Things are better now. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-ba3 | Mr. Bassey | My {thing} is home again, my friend. Some things find their way back. With help. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-oy1 | Mrs. Oyelaran | The {thing} has come back to me. I crossed out the card myself. It is the best notice on the board. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-oy2 | Mrs. Oyelaran | Thank you for the {thing}. I have noted it. | 4 | Cut: the evening keeps the line it had. |
| gs40-ret-oy3 | Mrs. Oyelaran | My {thing} is in its proper place again. The board is tidier for it. | 4 | Cut: the evening keeps the line it had. |

### 2. Kemi’s and Emeka’s things: what they lose, their calls, their thanks, Mama Nkechi’s panel, the fond mention at the gist

| Thing | Child | The thing (for the reader) | Its name in the game | The prompt | Q | If it is wrong |
|---|---|---|---|---|---|---|
| marble | Emeka | his best marble, glass with a coloured twist inside | best marble | Pick up a glass marble | 7 | The reader’s wording, or another thing for that owner. |
| tops | Emeka | a small tin of flattened bottle tops | tin of bottle tops | Pick up a tin of bottle tops | 7 | The reader’s wording, or another thing for that owner. |
| band | Kemi | her hair band with two blue bobbles | hair band | Pick up a hair band with blue bobbles | 7 | The reader’s wording, or another thing for that owner. |
| whistle | Kemi | her plastic whistle on a string | whistle | Pick up a plastic whistle | 7 | The reader’s wording, or another thing for that owner. |

| Id | Who and when | Line | Q | If it is wrong |
|---|---|---|---|---|
| gs40-kid-sh-marble | Emeka, at the children’s exit after a match the household played | My best marble! It was in my pocket a minute ago. | 8 | The reader’s wording. |
| gs40-kid-sh-tops | Emeka, at the children’s exit after a match the household played | Eh! My bottle tops! The tin was right here. | 8 | The reader’s wording. |
| gs40-kid-sh-band | Kemi, at the children’s exit after a match the household played | My hair band! It was on my wrist. Who has seen it? | 8 | The reader’s wording. |
| gs40-kid-sh-whistle | Kemi, at the children’s exit after a match the household played | My whistle! It fell somewhere. I will find it tomorrow. | 8 | The reader’s wording. |
| gs40-kid-aft-kemi | Kemi, at two in the afternoon on a morning-match day ({thing} is the thing) | My {thing}! It was here. It was here! | 8 | The reader’s wording. |
| gs40-kid-aft-emeka | Emeka, at two in the afternoon on a morning-match day ({thing} is the thing) | Where is my {thing}? I put it down for one minute! | 8 | The reader’s wording. |
| gs40-kid-ty-marble | Emeka, given it back at the pitch (a bubble) | My best one! You found it. Thank you o! | 2, 8 | The reader’s wording. |
| gs40-kid-ty-tops | Emeka, given it back at the pitch (a bubble) | My bottle tops! All of them? Thank you very much! | 2, 8 | The reader’s wording. |
| gs40-kid-ty-band | Kemi, given it back at the pitch (a bubble) | My hair band! I looked everywhere except where it was. Thank you o! | 2, 8 | The reader’s wording. |
| gs40-kid-ty-whistle | Kemi, given it back at the pitch (a bubble) | My whistle! Now the game can be fair again. Thank you! | 2, 8 | The reader’s wording. |
| gs40-kid-play-kemi | Kemi, straight after (a line only: football never changes) | Next game I am passing to you first. Maybe. | 8 | Cut: the thanks alone. |
| gs40-kid-play-emeka | Emeka, straight after (a line only: football never changes) | Next time we play, you can have first go with my best one. | 8 | Cut: the thanks alone. |
| gs40-kid-ask-kemi | Kemi, once at the pitch on a later day while it is still lost | Did anybody see my {thing}? If you see it, it is mine. | 8 | The reader’s wording. |
| gs40-kid-ask-emeka | Emeka, once at the pitch on a later day while it is still lost | Have you seen my {thing}? I have looked everywhere twice. | 8 | The reader’s wording. |

Mama Nkechi when Emeka’s thing comes back to her shop (her panel: the thing’s line, then her closing line; from the second time, her “again” line in place of the first):

| Id | When | Line | Q | If it is wrong |
|---|---|---|---|---|
| gs40-kid-nk-marble | Emeka’s best marble, the first time, once he has gone home | Chai! This boy. His feet came home and his marble stayed out to play. Thank you, my dear. I will hand it over with a speech. | 9 | The reader’s wording. |
| gs40-kid-nk-marble-out | Emeka’s best marble, the first time, while he is still out at the pitch | Chai! This boy. He is still out at the pitch and his marble is already at my shop. Thank you, my dear. He will hear about this at supper. | 9 | The reader’s wording. |
| gs40-kid-nk-tops | Emeka’s tin of bottle tops | Eh! His bottle tops. He counts them every night, like me with my rice. Thank you, my dear. Tonight the count will be right. | 9 | The reader’s wording. |
| gs40-kid-nk-close | her closing line, every time | That boy will lose his head one day if it is not tied on. Bless you, my dear, for bringing it back. | 9 | The reader’s wording. |
| gs40-kid-nk-again | the second time and after ({thing} is the thing) | Again? This boy. His {thing} knows the way to my shop better than he does. Thank you, my dear. | 9 | The reader’s wording. |

At the gist the evening a thing was lost, the adult who loves the child, when a guest (Mama Nkechi for Emeka, Mr. Bassey for Kemi): while it is still out (a tip: it is true, it lies on the sand), or once it is back:

| Id | Who | When | Line | Q | If it is wrong |
|---|---|---|---|---|---|
| gs40-kid-mn-marble-out | Mama Nkechi | still out | Emeka came home with one marble fewer. He says it is resting on the sand by the pitch. I said: so am I, from you. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-marble-back | Mama Nkechi | already back | His marble came home before he did. I have not decided if that is a lesson. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-tops-out | Mama Nkechi | still out | Emeka left his tin of bottle tops on the sand by the pitch. He has counted his pockets three times since. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-tops-back | Mama Nkechi | already back | Emeka’s bottle tops are home. He counted them at the door, then he counted me. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-band-out | Mr. Bassey | still out | Kemi lost her hair band by the pitch today. Blue bobbles. She went home looking at the sand. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-band-back | Mr. Bassey | already back | Kemi got her hair band back before the light went. She tied it on like a captain’s armband. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-whistle-out | Mr. Bassey | still out | Kemi lost her whistle on the sand today. She says the next game cannot be fair without it. | 10 | Cut: the thing is told only by the child and Today. |
| gs40-kid-mn-whistle-back | Mr. Bassey | already back | Kemi has her whistle again. The first thing she did was blow it at me. Fair enough. | 10 | Cut: the thing is told only by the child and Today. |

### 3. Gist about the match (the evening of a match the household played; Mr. Bassey first, he watches from the touchline)

| Id | Who | When | Line | Q | If it is wrong |
|---|---|---|---|---|---|
| gs40-fb-ba1 | Mr. Bassey | a win | I have told your goal three times today. Each time the ball goes further and the stones get closer together. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba2 | Mr. Bassey | a win, no photograph of a first win today | You won, and I was there with no camera. History will have to take my word for it. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba3 | Mr. Bassey | a win | A fine win. Kemi shook your hand like a referee. She is already planning the return match. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba4 | Mr. Bassey | a loss | In my time we played with a ball of rags tied with string. It did not bounce. Neither did we. The small ones bounce. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba5 | Mr. Bassey | a loss | The children beat you fair and square. I clapped for both sides. Mostly for theirs. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba6 | Mr. Bassey | unfinished, Emeka called in | Unfinished. In my time we also stopped when the mothers called. The mothers always won. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba7 | Mr. Bassey | last goal wins | Last goal wins. The whole street held its breath. So did I, and I am too old for it. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba8 | Mr. Bassey | Kemi scored most | Kemi sees the gap before the gap knows it is there. She will play for the country one day. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba9 | Mr. Bassey | Emeka scored most | Emeka scored and danced on the spot like a man who has won a prize. Barefoot, of course. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba10 | Mr. Bassey | the rain began before the match ended | Football in the wet. Mud to the knees and nobody minded. Mama Nkechi will mind. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba11 | Mr. Bassey | any match | I watched from the touchline today. My knees played every pass. They are tired now. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba12 | Mr. Bassey | harmattan | You played in this haze? From the touchline I could see only legs and dust and joy. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba13 | Mr. Bassey | a loss | I have seen many matches lost. Yours was lost with style. I would have photographed it. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ba14 | Mr. Bassey | any match | I stood at the touchline and gave advice. Nobody took it. That is football. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu1 | Tunde | a loss | Beaten by the children? Then it is official. You are in my club. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu2 | Tunde | a win | I am thinking of joining the children’s side. Not to win. To be on the winning side for once. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu3 | Tunde | unfinished | Nobody won? Then everybody will be talking about it tomorrow. That is the best result. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu4 | Tunde | dry season | Football in this heat. The ball was hotter than the pitch, and the pitch was hot. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu5 | Tunde | the match ended at noon or later | I heard the shouting from the courtyard. I turned my music down to listen. That never happens. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu6 | Tunde | Kemi scored most | Kemi scored the most, I hear. I am going to ask her to do my sound. She has the timing. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu7 | Tunde | an own goal by the household | An own goal, I hear. Do not worry. The ball does not know whose side it is on. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-tu8 | Tunde | any match | Next time you play, call me. I will stand at the side and shout useful things. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk1 | Mama Nkechi | any match | Emeka ate his food with one hand and played the match again with the other. The beans scored twice. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk2 | Mama Nkechi | unfinished | Emeka says the game is not finished, so nobody lost. He says it like a lawyer. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk3 | Mama Nkechi | a loss | Emeka is still celebrating. He told the whole match to my pepper. The pepper was not impressed. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk4 | Mama Nkechi | a win | Emeka says you were lucky. He says it with his mouth full, so I cannot argue. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk5 | Mama Nkechi | Emeka called in | I called Emeka in at the best part, he says. There is always a best part when it is time to eat. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk6 | Mama Nkechi | Emeka scored most | Emeka scored. I know because he told me before he said good evening. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk7 | Mama Nkechi | the rain began before the match ended | Mud from the knees down. Emeka played in the wet and came home a different colour. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-nk8 | Mama Nkechi | any match | Emeka washed his feet tonight without being told. The match must have been a good one. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad1 | Ada | any match | Kemi asked me for real goalposts. I said I would think about it. She has already measured the stones for them. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad2 | Ada | an own goal by the household | I heard there was an own goal. I will not ask whose. I will only look at you while I do not ask. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad3 | Ada | harmattan | You played in this dust? I could not see the far stones from the Yard. I could hear Kemi, though. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad4 | Ada | a win | Mr. Bassey says you played well. He says it loudly, so it must be true. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad5 | Ada | a loss | The children beat you. Good. It keeps the compound humble. Me most of all. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad6 | Ada | last goal wins | So it went to last goal wins. I would have made that goal myself, if I made goals. I make stools. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-ad7 | Ada | any match | The children were still arguing about the match outside the Yard. Both sides won, it seems. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy1 | Mrs. Oyelaran | any match | One day that ball will find my window. Once is a game. Twice is a compound meeting. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy2 | Mrs. Oyelaran | a win | The street has told me already: you won. Well done. Next time, win quietly. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy3 | Mrs. Oyelaran | a loss | So the children won. The whole street has been telling it. I let them enjoy it. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy4 | Mrs. Oyelaran | unfinished | I asked who won. Nobody, they said. That is how a good meeting ends too. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy5 | Mrs. Oyelaran | the rain began before the match ended | A wet pitch today, they tell me. Wipe your feet before you come up my stairs. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy6 | Mrs. Oyelaran | the first win | Your first win. Half the compound queued up to tell me. Well done. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-oy7 | Mrs. Oyelaran | any match | Football in the compound. Somebody always tells me all about it, whether I ask or not. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g1 | any guest (the second to arrive; never Mr. Bassey, who watched) | a win | So you won today. The children will not allow that twice. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g2 | any guest (the second to arrive; never Mr. Bassey, who watched) | a loss | The children beat you, I hear. They will be impossible tomorrow. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g3 | any guest (the second to arrive; never Mr. Bassey, who watched) | unfinished | Nobody won today, they say. The stones are still arguing about it. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g4 | any guest (the second to arrive; never Mr. Bassey, who watched) | any match | I heard there was football. The whole street knew by the noise. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g5 | any guest (the second to arrive; never Mr. Bassey, who watched) | any match | The children talked about the match all the way home. Every goal grows on the way. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g6 | any guest (the second to arrive; never Mr. Bassey, who watched) | last goal wins | Last goal wins, I am told. Those are the longest minutes in football. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g7 | any guest (the second to arrive; never Mr. Bassey, who watched) | Emeka called in, unfinished | Emeka was called in before the end. The end will have to wait for tomorrow. | 11 | Cut: another match line, or none, takes the evening. |
| gs40-fb-g8 | any guest (the second to arrive; never Mr. Bassey, who watched) | any match | Football today, I hear. The sand by the pitch has more footprints than the market. | 11 | Cut: another match line, or none, takes the evening. |

### 4. The seasons: season lines (by speaker and season; the role says where in the gist it may stand), the evening before a change, the evergreen lines

| Id | Who | Season | Where | Line | Q | If it is wrong |
|---|---|---|---|---|---|---|
| gs40-se-tu-r1 | Tunde | the rains | a greeting | Evening o. The sky has been gathering all day, like a crowd waiting for music. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r2 | Tunde | the rains, only after rain that day | about today or any remark | The rain came through the courtyard today. My speakers are under three layers of nylon. They are drier than me. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r3 | Tunde | the rains, only after rain that day | about today or any remark | After rain like that my scent leaf stands up straight. It is showing off. I allow it. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r4 | Tunde | the rains | about today or any remark | In this season I cover my speakers before I cover my head. That tells you about my life. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r5 | Tunde | the rains | a goodbye | Let me go and check my nylon covers. Good night o. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r6 | Tunde | the rains, only on a day without rain | about today or any remark | No rain today. My plants are disappointed. I told them, patience. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r7 | Tunde | the rains, only after rain that day | a greeting | Good evening. The gutters sang all through the rain this afternoon. I stopped my work to listen. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-r8 | Tunde | the rains | about today or any remark | The square has a small lake in one corner in this season. The children call it the sea. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-d1 | Tunde | the dry season | about today or any remark | This heat. I watered my peppers twice today and they still looked at me like I owe them. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-d2 | Tunde | the dry season | a greeting | Good evening. I came out for the breeze. The breeze did not come, so here I am. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-d3 | Tunde | the dry season | a goodbye | Good night. I am going to sleep under my fan like a king under a palm tree. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-d4 | Tunde | the dry season | about today or any remark | The courtyard was so hot today the music came out slow. Even the drums were tired. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-d5 | Tunde | the dry season | a greeting | Evening o. The sun has finally gone to bed. I waited for it before coming out. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-h1 | Tunde | harmattan | about today or any remark | Harmattan has put dust inside my speakers. Every song now sounds like it is coming from the market. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-h2 | Tunde | harmattan | about today or any remark | New compound rule: in harmattan, nobody touches the gate without warning. It shocked me twice today. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-h3 | Tunde | harmattan | a greeting | Evening. My lips are cracking, so tonight I will talk less. I am joking. Good evening. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-h4 | Tunde | harmattan | a goodbye | Good night. Cover your speakers, if you have speakers. Cover your face, if you do not. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-tu-h5 | Tunde | harmattan | a greeting | Good evening. Everything in the courtyard is wearing a coat of dust. Even me. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r1 | Mama Nkechi | the rains, only after rain that day | about today or any remark | Pepper soup weather, my dear. When the rain comes like this, the whole road wants something hot. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r2 | Mama Nkechi | the rains, only after rain that day | about today or any remark | I shouted “Bring in your clothes!” from the shop and three compounds ran. I have a good voice for rain. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r3 | Mama Nkechi | the rains, only on a day without rain | about today or any remark | No rain today. The rain is resting small. It will come back when my washing is out. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r4 | Mama Nkechi | the rains | a greeting | Good evening, my dear. The road is all puddles. I came the long way, round the biggest one. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r5 | Mama Nkechi | the rains | a goodbye | Let me go before the mosquitoes find me. In this season they know my name. Good night. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r6 | Mama Nkechi | the rains | about today or any remark | In this season my customers come in wet and leave dry. My shop is a small hotel. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r7 | Mama Nkechi | the rains | a greeting | Ehen, good evening. The air is cool tonight. Gist keeps better in the cool. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r8 | Mama Nkechi | the rains | about today or any remark | My umbrella has a hole in it the size of a button. In this season it is more of a hat. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-r9 | Mama Nkechi | the rains | about today or any remark | Everything in the shop is damp in this season. The sugar sticks together like old friends. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-d1 | Mama Nkechi | the dry season | about today or any remark | This sun. I sold more cold water today than rice. My rice is offended. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-d2 | Mama Nkechi | the dry season | a greeting | Good evening o. The shop is too hot to sit in, so I came to sit in your breeze. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-d3 | Mama Nkechi | the dry season | a goodbye | Good night, my dear. Drink water before you sleep. This season takes it from you. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-d4 | Mama Nkechi | the dry season | about today or any remark | The heat today! My customers stood in the doorway to talk, so I sold them the doorway. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-d5 | Mama Nkechi | the dry season | a greeting | Good evening, my dear. I fanned myself all the way here. My arm is tired. My mouth is not. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-h1 | Mama Nkechi | harmattan | about today or any remark | The cold this morning! I opened the shop in my wrapper and a cardigan. Customers laughed. They were wearing two. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-h2 | Mama Nkechi | harmattan | about today or any remark | Harmattan don come. My lips are cracking like old paint. Pass me that cream before I speak again. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-h3 | Mama Nkechi | harmattan | a greeting | Good evening, my dear. Dust on everything, even on my gist. Let me shake it out. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-h4 | Mama Nkechi | harmattan | a goodbye | Good night. Rub cream on your hands before you sleep. This dust is not playing. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-nk-h5 | Mama Nkechi | harmattan | a greeting | Evening o. I put on my cardigan to come down the road. Do not laugh. The cold is catching me. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r1 | Ada | the rains | about today or any remark | The rain makes my wood swell. Every joint I cut these days is tight. Good for chairs, bad for my temper. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r2 | Ada | the rains, only after rain that day | about today or any remark | The rain caught me in the Yard today. I stood under the half-roof with three unfinished chairs. We waited together. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r3 | Ada | the rains | a greeting | Evening. Everything smells of wet wood. I like it. Nobody else does. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r4 | Ada | the rains | a goodbye | Good night. I must cover the Yard before the damp gets into the timber. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r5 | Ada | the rains, only on a day without rain | about today or any remark | No rain today, so the wood dried a little. I worked fast while it was in a good mood. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r6 | Ada | the rains | a greeting | Good evening. My sandals are full of the Yard’s mud. I left most of it at the gate. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r7 | Ada | the rains | about today or any remark | In this season I sand a chair in the morning and it swells again by evening. Wood has moods. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-r8 | Ada | the rains | about today or any remark | I moved my bench under the half-roof. In this season the Yard is half workshop, half pond. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-d1 | Ada | the dry season | about today or any remark | In this heat the glue sets before I have finished thinking. I must think faster. I will not. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-d2 | Ada | the dry season | a greeting | Evening. The Yard was an oven today. I am here to cool down, and to listen. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-d3 | Ada | the dry season | a goodbye | Good night. I start early tomorrow, before the sun gets serious. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-d4 | Ada | the dry season | about today or any remark | Everything in the Yard is dry and quick in this season. The shavings blow away before I can sweep them. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-d5 | Ada | the dry season | a greeting | Evening. I swept the Yard twice today. The dust came back once. I call that winning. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-h1 | Ada | harmattan | about today or any remark | Harmattan cracks wood. I oil every piece in the Yard each evening like I am putting children to bed. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-h2 | Ada | harmattan | about today or any remark | Dust on every chair in the Yard. I sanded one this morning and by noon it had a new layer. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-h3 | Ada | harmattan | a greeting | Evening. My hands are full of dust and oil. I washed them twice. They are still full of dust and oil. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-h4 | Ada | harmattan | a goodbye | Good night. The wood needs its oil, and so do my knuckles. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ad-h5 | Ada | harmattan | a greeting | Evening. I oiled a table today and the dust came to visit before the oil was dry. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r1 | Mr. Bassey | the rains | about today or any remark | Rain light is soft light. Nobody believes me. The wedding couples always wanted sun. The photographs wanted rain. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r2 | Mr. Bassey | the rains, only after rain that day | about today or any remark | I watched the rain come across the water today. Once I would have stood in it with a camera. Today I stood under a roof. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r3 | Mr. Bassey | the rains, only after rain that day | a greeting | Good evening, my friend. The air is washed. Everything looks the way it did in my old photographs. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r4 | Mr. Bassey | the rains | a goodbye | Good night. Keep your feet dry. That is advice from a man with old shoes. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r5 | Mr. Bassey | the rains, only on a day without rain | about today or any remark | No rain today. The clouds came, looked at us, and went to visit somebody else. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r6 | Mr. Bassey | the rains | a greeting | Good evening. The water is high and brown in this season. It has news from upstream. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r7 | Mr. Bassey | the rains, only after rain that day | about today or any remark | The fishermen were out early, before the sky turned. They read this water better than any radio. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-r8 | Mr. Bassey | the rains | about today or any remark | In this season the lagoon goes the colour of strong tea. I have a photograph of it from long ago. Same tea. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-d1 | Mr. Bassey | the dry season | about today or any remark | The light in this season is hard. Everybody squints in photographs. I tell them, look at me, not the sun. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-d2 | Mr. Bassey | the dry season | a greeting | Good evening. The heat has gone down with the sun, as a good guest should. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-d3 | Mr. Bassey | the dry season | a goodbye | Good night, my friend. Sleep with the window open. In this season the night is the only kindness. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-d4 | Mr. Bassey | the dry season | about today or any remark | The water was flat as glass today. A good day for a photograph, if your hands are steady. Mine are steady enough. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-d5 | Mr. Bassey | the dry season | a greeting | Good evening, my friend. The breeze off the water has come at last. I followed it here. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-h1 | Mr. Bassey | harmattan | about today or any remark | Harmattan light. Flat as a plate. The sun looks like the moon. Photographers rest. I am resting. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-h2 | Mr. Bassey | harmattan | a greeting | Good evening. I wore my old jacket for the morning cold. By noon I was carrying it like a baby. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-h3 | Mr. Bassey | harmattan | a goodbye | Good night. Wrap up. This harmattan pretends to be gentle. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-h4 | Mr. Bassey | harmattan | about today or any remark | The dust is on my lenses, on my shelves and on my opinions. I have stopped cleaning the opinions. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-ba-h5 | Mr. Bassey | harmattan | a greeting | Good evening. The sun went down tonight like a coin in milk. Harmattan sunsets are shy. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r1 | Mrs. Oyelaran | the rains | about today or any remark | My wrapper has been on the line two days and it is still thinking about drying. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r2 | Mrs. Oyelaran | the rains | a goodbye | Close your door tonight. The mosquitoes have been told about you. I did not tell them. Good night. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r3 | Mrs. Oyelaran | the rains | a greeting | Good evening. Mind the puddle by the gate. It has been there so long it deserves a name. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r4 | Mrs. Oyelaran | the rains, only after rain that day | about today or any remark | So much rain today. When I came back this evening, my radio was complaining about the damp. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r5 | Mrs. Oyelaran | the rains, only on a day without rain | about today or any remark | No rain today. The gutters have nothing to say. I enjoyed the quiet. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r6 | Mrs. Oyelaran | the rains | a greeting | Good evening. At this time of year my stairs are never quite dry, so I hold the rail all the way down. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r7 | Mrs. Oyelaran | the rains, only after rain that day | about today or any remark | Coming home, I found my stairs still wet and swept them. The stairs were grateful. My broom was not. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-r8 | Mrs. Oyelaran | the rains | about today or any remark | In this season I keep a cloth by the door for wet feet. Use it. I am watching. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-d1 | Mrs. Oyelaran | the dry season | about today or any remark | Fill your buckets in the evening. In this season the tank empties before the morning has finished yawning. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-d2 | Mrs. Oyelaran | the dry season | a greeting | Good evening. It is cooler down here than upstairs. That is the only reason I came. And the gist. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-d3 | Mrs. Oyelaran | the dry season | a goodbye | Good night. Leave your window open and your door shut. Both. I have said it. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-d4 | Mrs. Oyelaran | the dry season | about today or any remark | The courtyard was a frying pan today. I swept it at six in the morning, before it could fry me. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-d5 | Mrs. Oyelaran | the dry season | a greeting | Good evening. Upstairs is an oven tonight. Down here is merely a pot. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-h1 | Mrs. Oyelaran | harmattan | about today or any remark | Harmattan. I dusted the stairs at seven. By ten the dust had taken them back. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-h2 | Mrs. Oyelaran | harmattan | about today or any remark | In my day the harmattan was so thick you could not see the gate from the stairs. This is a rehearsal. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-h3 | Mrs. Oyelaran | harmattan | a greeting | Good evening. Mind the dust on the rail. I wiped it at six, when I came in. The harmattan did not agree. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-h4 | Mrs. Oyelaran | harmattan | a goodbye | Good night. Shut your window tight against the dust. It has opinions. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-se-oy-h5 | Mrs. Oyelaran | harmattan | a greeting | Good evening. I wore a shawl down the stairs. It is not for the cold. It is for the dust. Mostly. | 12 | Cut: another season line or an evergreen line takes its place. |

The evening before a season changes (a tip that comes true in the Menu and the sky the next morning; the second of each pair is the same news as a greeting, when the evening has no room):

| Id | Who | Tomorrow | Line | Q | If it is wrong |
|---|---|---|---|---|---|
| gs40-tr-dry-tu | Tunde | the dry season | The rain is packing its bags. From tomorrow, dry. My plants will sulk. | 13 | Plainer news. |
| gs40-tr-dry-tu-o | Tunde | the dry season | Evening. The rains are leaving us. From tomorrow, the dry season. | 13 | Plainer news. |
| gs40-tr-dry-nk | Mama Nkechi | the dry season | From tomorrow the dry season, my dear. Fill your water before the sun takes it. | 13 | Plainer news. |
| gs40-tr-dry-nk-o | Mama Nkechi | the dry season | Good evening, my dear. The dry season starts tomorrow. I can feel it already. | 13 | Plainer news. |
| gs40-tr-dry-ad | Ada | the dry season | The dry season starts tomorrow. My wood will be glad. My glue will not. | 13 | Plainer news. |
| gs40-tr-dry-ad-o | Ada | the dry season | Evening. Tomorrow the dry season. The Yard is already thirsty. | 13 | Plainer news. |
| gs40-tr-dry-ba | Mr. Bassey | the dry season | Tomorrow the dry season begins. Hard light again. I will squint for a few days. | 13 | Plainer news. |
| gs40-tr-dry-ba-o | Mr. Bassey | the dry season | Good evening, my friend. The dry season comes tomorrow. | 13 | Plainer news. |
| gs40-tr-dry-oy | Mrs. Oyelaran | the dry season | The rainy season ends tonight. Tomorrow, dry. Fetch your water early. | 13 | Plainer news. |
| gs40-tr-dry-oy-o | Mrs. Oyelaran | the dry season | Good evening. The dry season from tomorrow. I have told the tank. | 13 | Plainer news. |
| gs40-tr-har-nk | Mama Nkechi | harmattan | Harmattan is coming tomorrow. I can feel it in my lips already. Buy cream. | 13 | Plainer news. |
| gs40-tr-har-nk-o | Mama Nkechi | harmattan | Good evening, my dear. Harmattan tomorrow. My lips know it already. | 13 | Plainer news. |
| gs40-tr-har-oy | Mrs. Oyelaran | harmattan | Harmattan tomorrow. Cover what you love. Dust has no manners. | 13 | Plainer news. |
| gs40-tr-har-oy-o | Mrs. Oyelaran | harmattan | Good evening. Harmattan tomorrow. I have covered the stairs. | 13 | Plainer news. |
| gs40-tr-har-tu | Tunde | harmattan | Harmattan tomorrow. I am wrapping my speakers tonight like presents. | 13 | Plainer news. |
| gs40-tr-har-tu-o | Tunde | harmattan | Evening o. Harmattan comes tomorrow. My speakers are already coughing. | 13 | Plainer news. |
| gs40-tr-har-ad | Ada | harmattan | Harmattan comes tomorrow. I will oil the wood tonight, before the dust gets to it. | 13 | Plainer news. |
| gs40-tr-har-ad-o | Ada | harmattan | Evening. Harmattan tomorrow. The wood is already nervous. | 13 | Plainer news. |
| gs40-tr-har-ba | Mr. Bassey | harmattan | The harmattan arrives tomorrow. Flat light and cold mornings. Bring out your jackets. | 13 | Plainer news. |
| gs40-tr-har-ba-o | Mr. Bassey | harmattan | Good evening, my friend. Harmattan tomorrow. I have found my jacket. | 13 | Plainer news. |
| gs40-tr-rai-ad | Ada | the rains | The rains come back tomorrow. My wood knows it already. Listen, you can hear it drinking. | 13 | Plainer news. |
| gs40-tr-rai-ad-o | Ada | the rains | Evening. The rains come back tomorrow. My wood is already thirsty for it. | 13 | Plainer news. |
| gs40-tr-rai-ba | Mr. Bassey | the rains | The rainy season comes back tomorrow. Soft light again. I will dust off my patience. | 13 | Plainer news. |
| gs40-tr-rai-ba-o | Mr. Bassey | the rains | Good evening, my friend. The rainy season comes back tomorrow. Soft light again. | 13 | Plainer news. |
| gs40-tr-rai-tu | Tunde | the rains | The rainy season is back tomorrow. My plants are already standing up straight. | 13 | Plainer news. |
| gs40-tr-rai-tu-o | Tunde | the rains | Evening o. The rains come back tomorrow. My nylon covers are ready. | 13 | Plainer news. |
| gs40-tr-rai-nk | Mama Nkechi | the rains | The rains come back tomorrow, my dear. Pepper soup weather. My pot is ready. | 13 | Plainer news. |
| gs40-tr-rai-nk-o | Mama Nkechi | the rains | Good evening, my dear. The rains come back tomorrow. Pepper soup weather. | 13 | Plainer news. |
| gs40-tr-rai-oy | Mrs. Oyelaran | the rains | The rainy season returns tomorrow. Clear your gutters. I will be checking. | 13 | Plainer news. |
| gs40-tr-rai-oy-o | Mrs. Oyelaran | the rains | Good evening. The rainy season returns tomorrow. Mind the gutters. | 13 | Plainer news. |

Evergreen lines (no season), the floor under the season lines; the second goodbye nods to Mallam, only on an evening he sits by his grill:

| Id | Who | Where | Line | Q | If it is wrong |
|---|---|---|---|---|---|
| gs40-ev-tu-o1 | Tunde | a greeting | Evening, everyone. The day has finished with me, so I came here. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-tu-o2 | Tunde | a greeting | Good evening o. I bring greetings from my plants. My plants say hello. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-tu-b1 | Tunde | a goodbye | Right, I am off before I start a new story. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-tu-b2 | Tunde | a goodbye | Mallam, keep one stick warm for me tomorrow. Good night, all. | 17 | Cut: the other goodbye stays. |
| gs40-ev-tu-a1 | Tunde | any remark | Somebody in the square asked me to play something slow. I played it fast. Nobody complained. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-tu-a2 | Tunde | any remark | My plants have names now. Their names stay with me. They are shy. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-nk-o1 | Mama Nkechi | a greeting | Good evening, my dear. I locked the shop and the shop let me go. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-nk-o2 | Mama Nkechi | a greeting | Ehen, good evening. My legs said sit, my mouth said gist. My mouth won. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-nk-b1 | Mama Nkechi | a goodbye | Good night, my dear. Tomorrow the shop opens early, and so do I. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-nk-b2 | Mama Nkechi | a goodbye | Mallam, I can smell your fire from here. Save me a stick tomorrow. Good night. | 17 | Cut: the other goodbye stays. |
| gs40-ev-nk-a1 | Mama Nkechi | any remark | A small boy came to the shop for one sweet and stayed to tell me his whole day. I gave him two. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-nk-a2 | Mama Nkechi | any remark | My radio and Mrs. Oyelaran’s radio play different stations. In the courtyard they meet and argue. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ad-o1 | Ada | a greeting | Evening. I left a chair half-finished. It will wait. Chairs are patient. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ad-o2 | Ada | a greeting | Good evening. Sawdust in my hair, gist in my mouth. I am ready. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ad-b1 | Ada | a goodbye | Good night. The chair will not finish itself, more is the pity. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ad-b2 | Ada | a goodbye | Mallam, the smoke says your fire is good tonight. Good night, everyone. | 17 | Cut: the other goodbye stays. |
| gs40-ev-ad-a1 | Ada | any remark | A man asked for a chair that would last for ever. I said yes. Then I added: if you sit gently. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ad-a2 | Ada | any remark | I found a nail in my pocket that I do not remember putting there. The Yard is generous like that. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ba-o1 | Mr. Bassey | a greeting | Good evening, my friend. I came slowly, so I would arrive at the right time. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ba-o2 | Mr. Bassey | a greeting | Good evening. I have walked the waterfront twice and now my legs are ready for a rail. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ba-b1 | Mr. Bassey | a goodbye | Good night, my friend. The evening was well spent. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ba-b2 | Mr. Bassey | a goodbye | Good night. Mallam, I will come for my usual tomorrow. Do not give it away. | 17 | Cut: the other goodbye stays. |
| gs40-ev-ba-a1 | Mr. Bassey | any remark | I cleaned my old camera today. It has no film, but it likes to be cleaned. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-ba-a2 | Mr. Bassey | any remark | A young man asked me how to take a good photograph. I said: wait. He did not like the answer. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-oy-o1 | Mrs. Oyelaran | a greeting | Good evening. The stairs are long tonight, so the gist had better be good. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-oy-o2 | Mrs. Oyelaran | a greeting | Good evening. I have nothing to report, which is itself news. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-oy-b1 | Mrs. Oyelaran | a goodbye | Good night. Lock your door, then check it. I check twice. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-oy-b2 | Mrs. Oyelaran | a goodbye | Mallam, keep the pepper gentle on mine tomorrow. Good night, everyone. | 17 | Cut: the other goodbye stays. |
| gs40-ev-oy-a1 | Mrs. Oyelaran | any remark | The noticeboard has many handwritings and one opinion. Mine. | 12 | Cut: another season line or an evergreen line takes its place. |
| gs40-ev-oy-a2 | Mrs. Oyelaran | any remark | I counted the steps on the stairs today. The same number as yesterday. Good. | 12 | Cut: another season line or an evergreen line takes its place. |

Other wordings for the information lines that came back most often in the long run of evenings, each used only in place of v38’s or v39’s own line when that line was heard in the last thirteen evenings (and only while it was not heard itself): v39’s pot ask ({n} is said “two” or “three”), v39’s “again” tip ({thing} as one item), v38’s Ada’s ask ({thing} is the fish: tilapia, mullet, bonga, croaker, red snapper, catfish), v38’s wash tip and v39’s “Aunty Bisi passes tomorrow”. The pot ask, the again tip and Ada’s ask speak of tomorrow, so their season wordings are used only when tomorrow is in the same season; on the evening before a season changes, the any-season wording (or the line’s own):

| Id | Who | When | Line | Q | If it is wrong |
|---|---|---|---|---|---|
| gs40-pot-nk-r | Mama Nkechi | the pot ask, the rains, when tomorrow is too | The rainy season wants soup, my dear. Tomorrow my pot needs {n} fish, and only ones caught after two o’clock. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-nk-d | Mama Nkechi | the pot ask, the dry season, when tomorrow is too | In this heat fish does not wait. {n} for my pot tomorrow, caught after two o’clock, and bring them quickly. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-nk-h | Mama Nkechi | the pot ask, harmattan, when tomorrow is too | Cold mornings want hot soup. Tomorrow, {n} fish caught after two o’clock, my dear. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-ba-r | Mr. Bassey | the pot ask, the rains, when tomorrow is too | Tomorrow my sister arrives with an umbrella and complaints, as she does in this season. I need {n} fish after two. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-ba-d | Mr. Bassey | the pot ask, the dry season, when tomorrow is too | The heat makes my sister sharper, and she visits tomorrow. Bring me {n} fresh fish, caught after two, to soften her. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-ba-h | Mr. Bassey | the pot ask, harmattan, when tomorrow is too | Tomorrow my sister again, in her harmattan shawl. {n} fish after two, please. Hot stew wins every argument. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-nk-2 | Mama Nkechi | the pot ask, any season | My pot is asking for fish again, my dear. {n} tomorrow, caught after two o’clock. Not one minute before. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-pot-ba-2 | Mr. Bassey | the pot ask, any season | My sister is back tomorrow. Bring {n} fish, caught after two, please. She cannot complain with her mouth full. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-tunde | Tunde | the again tip, the evening before the thing goes missing again, any season | I give my {thing} one more day before it goes missing again. I have stopped being surprised. Keep an eye out for me. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-nkechi | Mama Nkechi | the again tip, the evening before the thing goes missing again, any season | My {thing} is planning to run away from me again, my dear, I can feel it. Bring it home if you see it. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ada | Ada | the again tip, the evening before the thing goes missing again, any season | My {thing} is restless again. If I look away for one minute tomorrow, it will take the minute and leave. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-bassey | Mr. Bassey | the again tip, the evening before the thing goes missing again, any season | My {thing} will wander off again, I fear. At my age, things wander more than I do. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-oyelaran | Mrs. Oyelaran | the again tip, the evening before the thing goes missing again, any season | My {thing} is due to go missing again. When it does, look, and say nothing. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-tu-r | Tunde | the again tip, the evening before the thing goes missing again, the rains, when tomorrow is too | My {thing} is next to go, I am sure of it. In this season I blame the rain for everything, but that one will be my own fault. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-tu-d | Tunde | the again tip, the evening before the thing goes missing again, the dry season, when tomorrow is too | In this heat my {thing} will slip away from me again, and the sun is too strong for a proper search. If you see it, call me. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-tu-h | Tunde | the again tip, the evening before the thing goes missing again, harmattan, when tomorrow is too | My {thing} is ready to vanish again. With all this dust it could end up anywhere. Keep your eyes open for me. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-nk-r | Mama Nkechi | the again tip, the evening before the thing goes missing again, the rains, when tomorrow is too | Between the damp and the customers I cannot keep anything, my dear. Next to go will be my {thing}. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-nk-d | Mama Nkechi | the again tip, the evening before the thing goes missing again, the dry season, when tomorrow is too | This heat makes me forget my own hands, my dear. Watch, my {thing} will go walking again. Bring it if you see it. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-nk-h | Mama Nkechi | the again tip, the evening before the thing goes missing again, harmattan, when tomorrow is too | In this dust I can hardly find my own shop, my dear. My {thing} will disappear on me again, I know it. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ad-r | Ada | the again tip, the evening before the thing goes missing again, the rains, when tomorrow is too | Wet wood, wet hands. My {thing} will slide out of them again before long. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ad-d | Ada | the again tip, the evening before the thing goes missing again, the dry season, when tomorrow is too | In this heat my patience goes first, then my tools. Next it will be my {thing}, I can feel it. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ad-h | Ada | the again tip, the evening before the thing goes missing again, harmattan, when tomorrow is too | I suspect the dust has its eye on my {thing} again. The dust says nothing. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ba-r | Mr. Bassey | the again tip, the evening before the thing goes missing again, the rains, when tomorrow is too | In my time I lost umbrellas, my friend. Now I lose everything, and tomorrow, I am sure, my {thing} will join the list. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ba-d | Mr. Bassey | the again tip, the evening before the thing goes missing again, the dry season, when tomorrow is too | The heat will take my {thing} again, I think, along with my memory. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-ba-h | Mr. Bassey | the again tip, the evening before the thing goes missing again, harmattan, when tomorrow is too | Soon my {thing} will be somewhere under the dust again. My eyes are not what they were. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-oy-r | Mrs. Oyelaran | the again tip, the evening before the thing goes missing again, the rains, when tomorrow is too | My {thing} has that look again, the look of a thing about to go missing. I have warned it. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-oy-d | Mrs. Oyelaran | the again tip, the evening before the thing goes missing again, the dry season, when tomorrow is too | My {thing} is about to stray again. I mention it once, and I will not mention it again. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ag-oy-h | Mrs. Oyelaran | the again tip, the evening before the thing goes missing again, harmattan, when tomorrow is too | If the dust takes my {thing} again, it will answer to me. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-r1 | Ada | her ask for a day fish, the rains, when tomorrow is too | In this season the wood is soft and willing. Tomorrow, a {thing}. They bite after midday. Bring me one and my knife does the rest. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-r2 | Ada | her ask for a day fish, the rains, when tomorrow is too | Tomorrow I want a {thing} to carve. Fish after midday, before the clouds make up their minds. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-d1 | Ada | her ask for a day fish, the dry season, when tomorrow is too | Dry wood, ready and waiting. A {thing} is what I want tomorrow, heat or no heat. Look for them in the early afternoon. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-d2 | Ada | her ask for a day fish, the dry season, when tomorrow is too | My hands are restless in this heat. A {thing} would settle them, caught tomorrow after midday. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-h1 | Ada | her ask for a day fish, harmattan, when tomorrow is too | The harmattan has dried my wood just right for a {thing}. Tomorrow, try for one in the early afternoon, when they bite, and leave it with me. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-h2 | Ada | her ask for a day fish, harmattan, when tomorrow is too | If the dust lets you see the water tomorrow after midday, catch me a {thing}. It goes under my knife the same night. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-cat-r | Ada | her ask for a catfish, the rains, when tomorrow is too | Catfish like the dark, and the rains make the evenings darker. Tomorrow after six, catch one and carry it to the courtyard for me. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-cat-d | Ada | her ask for a catfish, the dry season, when tomorrow is too | Catfish wait for the cool of the evening, like everybody in this season. Fish for one tomorrow after six. The courtyard is where I will be. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-ask-cat-h | Ada | her ask for a catfish, harmattan, when tomorrow is too | A catfish for my next carving. They come out after six, when the dust settles. Catch one tomorrow; I will meet you in the courtyard. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-tu-r | Tunde | the wash tip, the rains | The lagoon is fat with all this rain, and it climbs again tonight. By tomorrow afternoon the sand will be covered in shells. Music for the eyes. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-tu-d | Tunde | the wash tip, the dry season or harmattan | The water climbs tonight. When it pulls back tomorrow afternoon, there are shells for everybody. I am going early. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-nk-r | Mama Nkechi | the wash tip, the rains | The water is coming up big tonight, my dear. Tomorrow after midday, shells all along the edge. Take a nylon. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-nk-d | Mama Nkechi | the wash tip, the dry season or harmattan | My dear, the lagoon will swell in the night. By tomorrow afternoon you will find shells right by the water. Bring me a pretty one for the shop. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-ad-r | Ada | the wash tip, the rains | The lagoon is rising tonight. Tomorrow afternoon, go and see what it leaves on the sand. Some of the shells are better made than my chairs. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-ad-d | Ada | the wash tip, the dry season or harmattan | Tonight the lagoon swells. After midday tomorrow, shells at the edge, flat ones and curly ones. I use the flat ones for inlay. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-ba-r | Mr. Bassey | the wash tip, the rains | My friend, the lagoon will stand high tonight, and tomorrow afternoon its edge will be white with shells. A fine picture. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-ba-d | Mr. Bassey | the wash tip, the dry season or harmattan | The lagoon comes up in the night, my friend. Tomorrow after midday its edge will glitter with shells. In my day we threaded them into necklaces. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-oy-r | Mrs. Oyelaran | the wash tip, the rains | The rains have filled the lagoon, and it climbs higher tonight. I am told there will be shells tomorrow afternoon. Wipe your feet when you come back. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-wash-oy-d | Mrs. Oyelaran | the wash tip, the dry season or harmattan | The water will be high tonight. Shells after midday tomorrow, for those who go and look. Do not bring sand up my stairs. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-tom-r | any guest (the second to arrive) | Aunty Bisi passes tomorrow, the rains | Aunty Bisi comes round tomorrow evening. Rain or shine, she comes. | 14 | Cut: v38’s or v39’s own line stays. |
| gs40-tom-d | any guest (the second to arrive) | Aunty Bisi passes tomorrow, the dry season or harmattan | Tomorrow evening Aunty Bisi passes this side. Hot puff-puff, they say. | 14 | Cut: v38’s or v39’s own line stays. |

### 5. Mallam (owner decisions 3, “Morning order, evening coals”, and 4, “He says it once”)

| Id | When | Line | Q | If it is wrong |
|---|---|---|---|---|
| gs40-ma-name | his name, said once to the household | Sannu. My name is Sani. Everybody calls me Mallam. | 1 | The reader’s name or wording; the line ships and is changed if you object. |
| gs40-ma-yaji | the late-morning order panel | This yaji is my father’s own. Groundnut, pepper, ginger, and one more thing I will not tell you. | 15, 16 | The reader’s wording. |
| gs40-ma-ordered | after the order ({choice}: pepper or onion) | More {choice}. Come back this evening. I will remember. | 15, 19 | The reader’s wording. |
| gs40-ma-tomorrow | the morning after an order lapsed | Tomorrow, then. | 15 | The reader’s wording. |
| gs40-ma-charcoal | at five, laying the charcoal | Sannu da zuwa. The charcoal is laid. Fan it small for me? | 16, 19 | The reader’s wording. |
| gs40-ma-shy | the fan beat, the glow past a third | Gently. The fire is shy at first. | 15 | The reader’s wording. |
| gs40-ma-yauwa | the fan beat, the glow past three fifths | Yauwa. | 16 | The reader’s wording. |
| gs40-ma-going | when the fan beat ends and the coals are lit (his bubble); also the prompt at the stand that does nothing, from the beat’s end and for two seconds after the taste panel closes, where the taste is not offered | The coals are going. | 15 | The reader’s wording. |
| gs40-ma-stick | the first stick (a panel) | The first stick is for whoever fanned. Taste. Then tell me the truth. | 15 | The reader’s wording. |
| gs40-ma-self | at half past five when nobody fanned | The fire came on its own in the end. It usually does. | 15 | The reader’s wording. |
| gs40-ma-kept | the collection after the gist (“Collect your two sticks, ₦2,000”), or his bubble on a base round bought after the gist, while an order waits (the order is handed over only after the gist) | Two sticks, as I promised. More {choice} on yours, as you said. I told you I would remember. | 15 | The reader’s wording. |
| gs40-ma-ready | after the gist, once, to a player within 4 m when Mallam is on that player’s screen, while an order waits | Your two sticks are ready. | 15 | The reader’s wording. |
| gs40-ma-regular | his bubble on the base round, a regular | You again. Good. Same as before? I have already started. | 15 | The reader’s wording. |
| gs40-ma-rains | his bubble on the base round, the rains | In the rains the charcoal sulks. Give it time. Everybody sulks a little in the rains. | 15 | The reader’s wording. |
| gs40-ma-dry | his bubble on the base round, the dry season | Dry season. The fire is quick and the onions are sweet. | 15 | The reader’s wording. |
| gs40-ma-harmattan | his bubble on the base round, harmattan | Harmattan is good for suya. The fire burns clean and people want something hot. | 15 | The reader’s wording. |
| gs40-ma-away | if he ever walks off for charcoal at a gist (not used in this build: he sits by his grill) | More charcoal. I am coming. | 18 | Not used in this build. |
| gs40-ma-bye | his goodbye (not used in this build) | Na gode. Sai gobe. | 16 | Not used in this build. |

His panels and prompts (plain English, `MALLAM40.UI`):

| Key | Text | Q | If it is wrong |
|---|---|---|---|
| MALLAM40.UI.name | Mallam | 15 | Plain wording from the reader. |
| MALLAM40.UI.kicker | MALLAM | 15 | Plain wording from the reader. |
| MALLAM40.UI.order | Order two sticks for tonight | 15 | Plain wording from the reader. |
| MALLAM40.UI.orderText | Two sticks for tonight. Which do you want more of, pepper or onion? You pay when you collect them. | 15 | Plain wording from the reader. |
| MALLAM40.UI.pepper | Extra pepper | 15 | Plain wording from the reader. |
| MALLAM40.UI.onion | Extra onion | 15 | Plain wording from the reader. |
| MALLAM40.UI.notToday | Not today | 15 | Plain wording from the reader. |
| MALLAM40.UI.fan | Fan the coals | 15 | Plain wording from the reader. |
| MALLAM40.UI.turn | Turn the sticks | 15 | Plain wording from the reader. |
| MALLAM40.UI.taste | Taste the first stick | 15 | Plain wording from the reader. |
| MALLAM40.UI.tasteBtn | Taste | 15 | Plain wording from the reader. |
| MALLAM40.UI.collect | Collect your two sticks, ₦2,000 | 15 | Plain wording from the reader. |
| MALLAM40.UI.tasteText | One stick to share. He will not take money for it. | 15 | Plain wording from the reader. |
| MALLAM40.UI.tasteToast | A taste of the first stick. | 15 | Plain wording from the reader. |
| MALLAM40.UI.close | Close | 15 | Plain wording from the reader. |
| MALLAM40.UI.tonight | Mallam is keeping two sticks for you tonight. | 15 | Plain wording from the reader. |
| MALLAM40.UI.choice.pepper | pepper | 15 | Plain wording from the reader. |
| MALLAM40.UI.choice.onion | onion | 15 | Plain wording from the reader. |

### 6. A neighbour’s errand (owner decision 2, “Add it”): Mrs. Oyelaran’s notice, the sender’s word, the receiver’s thanks and mention

| Pair | Sender → receiver | Item | Collect from | Q | If it is wrong |
|---|---|---|---|---|---|
| plate | Mama Nkechi → Ada | a covered plate of jollof | the shop | 20 | The reader’s wording. |
| frame | Ada → Mr. Bassey | a mended picture frame | the Makers’ Yard | 20 | The reader’s wording. |
| tape | Mr. Bassey → Tunde | an old highlife cassette | the waterfront | 20 | The reader’s wording. |
| seedlings | Tunde → Mama Nkechi | a tray of pepper seedlings | the courtyard | 20 | The reader’s wording. |
| bread | Mama Nkechi → Mr. Bassey | a warm loaf of bread | the shop | 20 | The reader’s wording. |
| box | Ada → Tunde | a small wooden box | the Makers’ Yard | 20 | The reader’s wording. |
| photo | Mr. Bassey → Ada | an old photograph of the Yard | the waterfront | 20 | The reader’s wording. |
| lead | Tunde → Ada | an extension lead | the courtyard | 20 | The reader’s wording. |

| Id | Who | Text | Q | If it is wrong |
|---|---|---|---|---|
| bd40-er-notice | Mrs. Oyelaran’s notice (a card; {sender}, {item}, {receiver}, {place}) | NOTICE. {sender} has {item} for {receiver}. Kindly collect from {place} after half past twelve. — O. | 20 | The reader’s wording. |
| bd40-er-take-nkechi | Mama Nkechi, handing it over (a bubble) | Take it carefully, my dear. And do not open it on the way. | 20 | The reader’s wording. |
| bd40-er-take-ada | Ada, handing it over (a bubble) | Mind it. I have only just made it right. | 20 | The reader’s wording. |
| bd40-er-take-bassey | Mr. Bassey, handing it over (a bubble) | Carefully, my friend. That one is older than you. | 20 | The reader’s wording. |
| bd40-er-take-tunde | Tunde, handing it over (a bubble) | Thank you o. Tell them it is from me, with respect. | 20 | The reader’s wording. |
| bd40-er-ty-plate | the receiver, given it (the panel) | Jollof from Mama Nkechi. She knows I forget lunch. Thank you for carrying it. | 20 | The reader’s wording. |
| bd40-er-ty-frame | the receiver, given it (the panel) | My frame. Ada has made it straighter than it ever was. Thank you, my friend. | 20 | The reader’s wording. |
| bd40-er-ty-tape | the receiver, given it (the panel) | Highlife from Mr. Bassey’s own box! I will copy it and give it back before he misses it. | 20 | The reader’s wording. |
| bd40-er-ty-seedlings | the receiver, given it (the panel) | Pepper seedlings from Tunde. By the rains I will have my own pepper. Thank you, my dear. | 20 | The reader’s wording. |
| bd40-er-ty-bread | the receiver, given it (the panel) | Still warm. Mama Nkechi takes care of all of us. Thank you, my friend. | 20 | The reader’s wording. |
| bd40-er-ty-box | the receiver, given it (the panel) | A box for my speaker! Ada measured it with her eyes and it fits. Thank you o. | 20 | The reader’s wording. |
| bd40-er-ty-photo | the receiver, given it (the panel) | The Yard, before me. Look at that bench. Thank you for bringing it. | 20 | The reader’s wording. |
| bd40-er-ty-lead | the receiver, given it (the panel) | My extension lead. Tunde borrowed it for one evening, a long time ago. Thank you. | 20 | The reader’s wording. |

At that night’s gist, the receiver, when a guest (information; one of two):

| Id | Who | Line | Q | If it is wrong |
|---|---|---|---|---|
| gs40-er-plate1 | Ada | The plate came this afternoon, still warm. Mama Nkechi knows I forget lunch. | 20 | The reader’s wording. |
| gs40-er-plate2 | Ada | Mama Nkechi’s jollof came across today. I ate it standing at the bench, like a carpenter. | 20 | The reader’s wording. |
| gs40-er-frame1 | Mr. Bassey | Ada mended my frame. It hangs straighter than I do. | 20 | The reader’s wording. |
| gs40-er-frame2 | Mr. Bassey | My old frame is back on the wall. Ada fixed it, and you carried it. A whole compound’s work. | 20 | The reader’s wording. |
| gs40-er-tape1 | Tunde | Mr. Bassey’s highlife tape came today. I have played it four times. The courtyard is learning to dance. | 20 | The reader’s wording. |
| gs40-er-tape2 | Tunde | That cassette from Mr. Bassey is older than my speakers. It still sounds better. | 20 | The reader’s wording. |
| gs40-er-seedlings1 | Mama Nkechi | Tunde’s seedlings are on my counter. If they grow, I will sell him the pepper. | 20 | The reader’s wording. |
| gs40-er-seedlings2 | Mama Nkechi | Pepper seedlings from Tunde. Customers ask if they are for sale. I say: not yet. | 20 | The reader’s wording. |
| gs40-er-bread1 | Mr. Bassey | Mama Nkechi sent bread today, still warm. I ate half before I remembered my manners. | 20 | The reader’s wording. |
| gs40-er-bread2 | Mr. Bassey | Warm bread, carried all the way to the water. I have not been looked after like this in years. | 20 | The reader’s wording. |
| gs40-er-box1 | Tunde | Ada’s box fits my speaker like it was born there. | 20 | The reader’s wording. |
| gs40-er-box2 | Tunde | My speaker has a house now. Ada made it, you brought it, and I take the credit. | 20 | The reader’s wording. |
| gs40-er-photo1 | Ada | Mr. Bassey sent a photograph of the Yard before my time. The bench in it is still there. I checked. | 20 | The reader’s wording. |
| gs40-er-photo2 | Ada | An old photograph of the Yard came today. Same trees, younger wood. | 20 | The reader’s wording. |
| gs40-er-lead1 | Ada | My extension lead came home today. Tunde sends his apologies, by you. | 20 | The reader’s wording. |
| gs40-er-lead2 | Ada | Tunde returned my extension lead. Through you. He is brave, but not that brave. | 20 | The reader’s wording. |

### The interface (plain English): every string in `BOARD40.UI` and `GIST40.UI`, by its key

| Key | Text | Q | If it is wrong |
|---|---|---|---|
| BOARD40.UI.kicker | ON THE NOTICEBOARD | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.still | Still lost. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.close | Close | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.givenBack | Given back | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.pick | Pick up {label} | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.pickToast | {owner}’s {name}. {where} | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.take | Take the {short} for {receiver} | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.giveErr | Give {receiver} the {short} | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.takeToast | The {short}, for {receiver}. Give it by six. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.errKicker | An errand | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.lapse | {sender} took it over {self} in the end. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.todayBefore | The noticeboard: Mrs. Oyelaran changes the notices at half past ten. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.todayNew | New notices are up. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.todayRead | On the noticeboard: {owner} lost {pron} {name} {area}. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.todayHand | {owner}’s {name} is with you. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.todayBack | {owner}’s {name} is back. {sub} crossed it off {self}. | 4, 5 | Plain wording from the reader. |
| BOARD40.UI.playtest | Lines heard in the last fortnight: {n}. | 4, 5 | Plain wording from the reader. |
| GIST40.UI.pick | Pick up {label} | 7, 8 | Plain wording from the reader. |
| GIST40.UI.give | Give {child} {pron} {name} | 7, 8 | Plain wording from the reader. |
| GIST40.UI.shop | Give Mama Nkechi Emeka’s {name} | 7, 8 | Plain wording from the reader. |
| GIST40.UI.pickToast.emeka | Emeka’s {name}. He plays at the pitch in the afternoons, or Mama Nkechi will take it at her shop. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.pickToast.kemi | Kemi’s {name}. She plays at the pitch in the afternoons. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.pickToastSat.emeka | Emeka’s {name}. He is at the pitch today, or Mama Nkechi will take it at her shop. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.pickToastSat.kemi | Kemi’s {name}. She is at the pitch today. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.where.emeka | Emeka plays at the pitch in the afternoons, or Mama Nkechi at her shop | 7, 8 | Plain wording from the reader. |
| GIST40.UI.where.kemi | Kemi plays at the pitch in the afternoons | 7, 8 | Plain wording from the reader. |
| GIST40.UI.kicker | Given back | 7, 8 | Plain wording from the reader. |
| GIST40.UI.close | Close | 7, 8 | Plain wording from the reader. |
| GIST40.UI.todayHeard | Heard at the pitch: {child} lost {pron} {name}. It is on the sand by the pitch. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.todayStill | {child}’s {name} is still on the sand by the pitch. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.todayAft | {child} is looking for {pron} {name} by the pitch. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.handAlso | Also with you: {list}. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.handRow | With you: {list}. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.recap.kid | {child} has {pron} {name} back. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.recap.card | {owner} has {pron} {name} back. | 7, 8 | Plain wording from the reader. |
| GIST40.UI.recap.errand | {receiver} has the {short}. | 7, 8 | Plain wording from the reader. |

The card things as the game names them (culture C6): the name (in the pickup toast, Today and the again card), the prompt to pick one up, the prompt to give it back:

| Thing | Owner | Name | Pick-up prompt | Give prompt | Q | If it is wrong |
|---|---|---|---|---|---|---|
| knob | Tunde | radio knob | Pick up a radio knob | Give Tunde his radio knob | 6 | The reader’s wording, or another thing for that owner. |
| rose | Tunde | sprinkler head | Pick up a sprinkler head | Give Tunde his sprinkler head | 6 | The reader’s wording, or another thing for that owner. |
| spoon | Mama Nkechi | wooden spoon | Pick up a long wooden spoon | Give Mama Nkechi her spoon | 6 | The reader’s wording, or another thing for that owner. |
| pad | Mama Nkechi | receipt pad | Pick up a receipt pad | Give Mama Nkechi her receipt pad | 6 | The reader’s wording, or another thing for that owner. |
| block | Ada | sanding block | Pick up a sanding block | Give Ada her sanding block | 6 | The reader’s wording, or another thing for that owner. |
| oil | Ada | tin of wood oil | Pick up a small tin of wood oil | Give Ada her wood oil | 6 | The reader’s wording, or another thing for that owner. |
| film | Mr. Bassey | film canister | Pick up a film canister | Give Mr. Bassey his film canister | 6 | The reader’s wording, or another thing for that owner. |
| print | Mr. Bassey | old wedding print | Pick up a brown envelope | Give Mr. Bassey his photograph | 6 | The reader’s wording, or another thing for that owner. |
| pegs | Mrs. Oyelaran | bag of clothes pegs | Pick up a bag of clothes pegs | Give Mrs. Oyelaran her pegs | 6 | The reader’s wording, or another thing for that owner. |
| minutes | Mrs. Oyelaran | minutes book | Pick up a minutes book | Give Mrs. Oyelaran her minutes book | 6 | The reader’s wording, or another thing for that owner. |

The places (`BOARD40.AREAS`): **say** finishes Today’s line (“Tunde lost his radio knob by the square’s stage.”) and the pickup toast; **look** finishes the again cards (“Look by the stage in the square.”, “Try looking round the rocks.”); **where** is the same place as a heading (not shown in this build):

| Area | Say | Look (again cards) | Where | Q | If it is wrong |
|---|---|---|---|---|---|
| stage | by the square’s stage | by the stage in the square | By the square’s stage | 4, 6 | Plain wording from the reader. |
| garden | by the square’s garden bed | by the garden bed in the square | By the square’s garden bed | 4, 6 | Plain wording from the reader. |
| bench | on the waterfront sand by the bench | on the sand by the waterfront bench | On the waterfront sand by the bench | 4, 6 | Plain wording from the reader. |
| market | on Market Road, between the stalls | along Market Road, between the stalls | On Market Road, between the stalls | 4, 6 | Plain wording from the reader. |
| yard | in the Makers’ Yard | round the Makers’ Yard | In the Makers’ Yard | 4, 6 | Plain wording from the reader. |
| rocks | near the rocks | round the rocks | Near the rocks | 4, 6 | Plain wording from the reader. |
| photo | on the waterfront, east of the photo spot | along the waterfront, east of the photo spot | On the waterfront, east of the photo spot | 4, 6 | Plain wording from the reader. |
| waterW | on the waterfront, towards the square | along the waterfront, towards the square | On the waterfront, towards the square | 4, 6 | Plain wording from the reader. |
| street | in the street, west of the gate | along the street, west of the gate | In the street, west of the gate | 4, 6 | Plain wording from the reader. |
| court | in the courtyard, by the noticeboard | round the courtyard, by this board | In the courtyard, by the noticeboard | 4, 6 | Plain wording from the reader. |

Where each owner is, in the pickup toast and Today’s hand row (`BOARD40.WHERE`; by the hour), and the signature drawn on each owner’s card in the world (`BOARD40.INITIAL`):

| Key | Text | Q | If it is wrong |
|---|---|---|---|
| BOARD40.WHERE.tunde[0] | He is at the garden corner until noon, then in the courtyard. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.tunde[1] | He is in the courtyard. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.nkechi[0] | She is at her shop. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.nkechi[1] | She is at her shop. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.ada[0] | She is at the Makers’ Yard until six. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.ada[1] | She is in the courtyard after six. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.bassey[0] | He is at the photo corner this morning. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.bassey[1] | He is on the waterfront this afternoon. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.bassey[2] | He is in the courtyard this evening. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.oyelaran[0] | She is in the courtyard this morning. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.oyelaran[1] | She is out until six, then in the courtyard. | 4, 6 | Plain wording from the reader. |
| BOARD40.WHERE.oyelaran[2] | She is in the courtyard. | 4, 6 | Plain wording from the reader. |
| BOARD40.INITIAL.tunde | — T. | 4 | Plain wording from the reader. |
| BOARD40.INITIAL.nkechi | — Mama N. | 4 | Plain wording from the reader. |
| BOARD40.INITIAL.ada | — A. | 4 | Plain wording from the reader. |
| BOARD40.INITIAL.bassey | Bassey | 4 | Plain wording from the reader. |
| BOARD40.INITIAL.oyelaran | — O. | 4 | Plain wording from the reader. |

## v40.4 How the v40 lines are chosen

- A card goes up at half past ten when the last card’s thing is back; it is crossed out in its owner’s hand the moment the thing goes back and comes down at the second change after. After all ten, each card comes back in its owner’s “again” words, the thing in a second place.
- A child loses a thing after about one match in three that the household plays (never within two days of the last), and on a morning-match day at two in the afternoon. Emeka and Kemi take turns, each through their two things. The child calls out once; the thing lies on the sand by the pitch until somebody picks it up. A child asks about it once on a later day if it is still lost.
- At the gist, nothing changes the guests, the tips or the timing. In order each evening: the transition tip the evening before a season changes, first of all (a promise the game keeps the next morning, so it comes before the news: on such an evening the match line or the children’s mention may go unsaid); the children’s mention (the evening of the loss, by the fond adult when a guest; it takes the line about today, the night’s one added line or a free reaction; otherwise it is not said that night); the line about today (a match line, a card thing’s return by its owner, the errand by its receiver; the match line has the first claim on the night’s one added line, and a return or the errand’s mention takes a free reaction; otherwise it is not said that night); then the repeat guard. A greeting, goodbye, reaction, plain line or line about today heard on any of the last thirteen evenings gives way to another of that neighbour’s own lines not heard in that time: first another of their v38 lines of the same kind, then a season line, then an evergreen line. Tips, asks and first-time retellings are never replaced, except that v39’s pot ask and “again” tip, v38’s Ada’s ask and wash tip, and v39’s “Aunty Bisi passes tomorrow” take another wording (the same news) when their own line was heard in the last thirteen evenings. The pot ask, the again tip and Ada’s ask speak of tomorrow, so their season wordings are used only when tomorrow is in the same season; on the evening before a change, the any-season wording.
- A match line’s facts are only what football saved (the result, last goal wins, Emeka called in, who scored, the first win and its photograph), the hour the match ended (read from football’s own end of the match and kept in v40’s record), and the season. A line about a wet match needs the rain to have begun before the match ended (a Saturday-morning match before the afternoon rain is not one); Tunde hears the shouting from the courtyard only for a match that ended at noon or later; Mrs. Oyelaran, out from twelve to six, has her match news from others and names no hour. Mr. Bassey speaks first when he is a guest and has a line not heard in the last thirteen evenings; then the other guest; then a general line by the second guest, never by Mr. Bassey, who watched from the touchline.
- “It rained today” lines come only after rain that day, “the rain is resting” only on a rainy-season day without it. Nothing promises tomorrow’s rain; the season turning (“the rains come back tomorrow”) is said only the evening before it does.
- Mallam’s lines are his own: the name once, the order in the late morning, two bubbles as the fire catches, the first stick, and his line on the round. A kept order is handed over only after the gist: “Your two sticks are ready.” once to a player near the stand whose screen shows him, and the kept order’s line when the household collects them (“Collect your two sticks, ₦2,000”), even after a round bought before the gist; a household that skips the gist collects them from ten. With an order waiting he stays at his grill until half past ten, or until half an hour after the gist ends if that is later, however late; a reload in the middle of a gist counts as the gist’s end, and the half hour runs from then. He stays seated through any gist, however late; with no order waiting he stays at his grill until ten, or, after a gist that runs past ten, goes when it ends, after a moment at his grill. The first stick is offered as “Taste the first stick”, never as a panel that opens by itself.
