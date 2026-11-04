/* v40 Notices, children's things and fresh evenings: the gist and the children (engineer B; v40/SPEC.md §7-§10, §13, §14 and column B of §18.1).
   Kemi's and Emeka's own small things: after a match the household played, about one match day in three (and on a morning-match day at two in
   the afternoon, in the children's own play), one child loses a small thing. The child calls out; the thing lies on the sand where it fell,
   findable at once, that evening or any later day. Emeka's goes back to Emeka at the pitch or to Mama Nkechi at her shop; Kemi's to Kemi at the
   pitch. Thanks and play, no keepsake, no money ("Returns stay thanks and friendship, never cash.").
   The evenings: the gist's words change, never its shape. After v40 discovery the plan wrapper (outside v39's) puts in the children's mention,
   a line about today's match, a card thing's return or the errand's mention, a season line, the evening before a season changes a tip that
   comes true, and a repeat guard: a greeting, goodbye, reaction, plain line or line about today heard on any of the last thirteen evenings
   gives way to an unheard line by the same speaker (another of their v38 lines first, then a season line, then an evergreen one). A replaced
   v38 line is still booked as said (swap40), so v38's own rotation keeps moving. Information lines are never replaced.
   Inert until a trigger (§1.3): with FOUND38, GIST38, GIST39 or BOARD40 absent it installs nothing; before v40 discovery every wrapper passes
   straight through. No TICK_HOOKS entry (the step rides EVENING35.tick by property, inside daily-v40.js's wrapper), no cue, no audio recipe, no LINES35, WHEN35,
   DAYS35.rows or FINDS34 change, no collider, no Math.random call (every three.js construction inside quiet40), no wall clock. v40's lines
   live in GIST40.LINES (ids gs40-), never in GIST38.LINES or GIST39.LINES; G.said is written only after v40 discovery and only to book a v38
   line the guard replaced. Warnings read 'gist40'. */
'use strict';

/* ======================================================================================================================================
   1. The object: the children's things, the gist's numbers, the lines (every line a draft for the Nigerian reader; docs/READER_gist.md)
   ====================================================================================================================================== */
const GIST40={v:1,t:0,checkAt:0,
 on:typeof FOUND38!=='undefined'&&!!FOUND38&&typeof GIST38!=='undefined'&&!!GIST38&&typeof GIST39!=='undefined'&&!!GIST39&&typeof BOARD40!=='undefined'&&!!BOARD40&&!!BOARD40.on,
 // the children's things (§7): about one match day in three (hash38(day,44)%every), never within two days of the last; on a morning-match day at
 // 14:00; the spots on the sand south of the pitch at z 13.9 (outside the pitch plus 1 m and football's keep region, west of x -17)
 KIDS:{every:3,gap:2,satDrop:14.0,satTo:18.5,spots:[[-29.0,13.9],[-27.5,13.9],[-26.0,13.9],[-24.5,13.9],[-21.5,13.9],[-18.5,13.9]],
  pick:1.3,pickLead:0.25,reach:1.8,lead:0.5,shopLead:1.05,glint:5,heard:20,bubbleY:1.62,ms:3600,ground:0.012,
  fond:{emeka:'nkechi',kemi:'bassey'},order:{emeka:['marble','tops'],kemi:['band','whistle']}},
 GLINT:{far:5,near:3,period:1.2,lo:0.25,hi:0.9,size:0.7,camRef:7.4,y:0.25},
 HEARD_NIGHTS:13,                            // a line heard on any of the last thirteen evenings counts as a repeat
 MAX_INSERT:1,MAX_LINES:8,                   // v40 inserts at most one line, and only into a script of fewer than eight
 PRUNE:28,                                   // the heard record keeps 28 days
 MALLAM_EVERY:4,                             // a Mallam goodbye in place of a plain v38 one at most once in four evenings (fix round, S4)
 // who tells the change of season the evening before (culture §4.4): the first of these who is a guest
 TRANS_BY:{dry:['tunde','nkechi','ada','bassey','oyelaran'],harmattan:['nkechi','oyelaran','tunde','ada','bassey'],rains:['ada','bassey','tunde','nkechi','oyelaran']},
 // the line about today may replace these kinds of v39's and v38's (never a first-time retelling)
 REPEATABLE:['gs39-told-again','catch','shells','harvest'],
 NEVER:['gs38-pl-ad1'],                      // the tenth stool's line (gist-v39.js gistMorning39): never swapped
 KNEES:'gs38-pl-oy2',                        // "My radio says rain tomorrow…": outside the rains always swapped (culture §0, §8)
 LINES:{
  // §13.2 Kemi and Emeka: the things, the shouts, the thanks, the play, the asking, Mama Nkechi's panel, the fond mentions at the gist
  kid:{
   items:{marble:{child:'emeka',name:'best marble',pickLabel:'a glass marble',long:'his best marble, glass with a coloured twist inside'},
    tops:{child:'emeka',name:'tin of bottle tops',pickLabel:'a tin of bottle tops',long:'a small tin of flattened bottle tops'},
    band:{child:'kemi',name:'hair band',pickLabel:'a hair band with blue bobbles',long:'her hair band with two blue bobbles'},
    whistle:{child:'kemi',name:'whistle',pickLabel:'a plastic whistle',long:'her plastic whistle on a string'}},
   shout:{marble:['gs40-kid-sh-marble','My best marble! It was in my pocket a minute ago.'],
    tops:['gs40-kid-sh-tops','Eh! My bottle tops! The tin was right here.'],
    band:['gs40-kid-sh-band','My hair band! It was on my wrist. Who has seen it?'],
    whistle:['gs40-kid-sh-whistle','My whistle! It fell somewhere. I will find it tomorrow.']},
   shoutAft:{kemi:['gs40-kid-aft-kemi','My {thing}! It was here. It was here!'],
    emeka:['gs40-kid-aft-emeka','Where is my {thing}? I put it down for one minute!']},
   ty:{marble:['gs40-kid-ty-marble','My best one! You found it. Thank you o!'],
    tops:['gs40-kid-ty-tops','My bottle tops! All of them? Thank you very much!'],
    band:['gs40-kid-ty-band','My hair band! I looked everywhere except where it was. Thank you o!'],
    whistle:['gs40-kid-ty-whistle','My whistle! Now the game can be fair again. Thank you!']},
   play:{kemi:['gs40-kid-play-kemi','Next game I am passing to you first. Maybe.'],
    emeka:['gs40-kid-play-emeka','Next time we play, you can have first go with my best one.']},
   ask:{kemi:['gs40-kid-ask-kemi','Did anybody see my {thing}? If you see it, it is mine.'],
    emeka:['gs40-kid-ask-emeka','Have you seen my {thing}? I have looked everywhere twice.']},
   // (repair, VC-6) marble: once Emeka has gone home; marbleOut: while he is still out at the pitch (a morning-match day's afternoon play)
   nkechi:{marble:['gs40-kid-nk-marble','Chai! This boy. His feet came home and his marble stayed out to play. Thank you, my dear. I will hand it over with a speech.'],
    marbleOut:['gs40-kid-nk-marble-out','Chai! This boy. He is still out at the pitch and his marble is already at my shop. Thank you, my dear. He will hear about this at supper.'],
    tops:['gs40-kid-nk-tops','Eh! His bottle tops. He counts them every night, like me with my rice. Thank you, my dear. Tonight the count will be right.'],
    close:['gs40-kid-nk-close','That boy will lose his head one day if it is not tied on. Bless you, my dear, for bringing it back.'],
    again:['gs40-kid-nk-again','Again? This boy. His {thing} knows the way to my shop better than he does. Thank you, my dear.']},
   // at the gist the evening it is lost: the fond adult (Mama Nkechi for Emeka, Mr. Bassey for Kemi), while it is out (a tip) or once back
   mention:{marble:{out:['gs40-kid-mn-marble-out','Emeka came home with one marble fewer. He says it is resting on the sand by the pitch. I said: so am I, from you.'],
     back:['gs40-kid-mn-marble-back','His marble came home before he did. I have not decided if that is a lesson.']},
    tops:{out:['gs40-kid-mn-tops-out','Emeka left his tin of bottle tops on the sand by the pitch. He has counted his pockets three times since.'],
     back:['gs40-kid-mn-tops-back','Emeka’s bottle tops are home. He counted them at the door, then he counted me.']},
    band:{out:['gs40-kid-mn-band-out','Kemi lost her hair band by the pitch today. Blue bobbles. She went home looking at the sand.'],
     back:['gs40-kid-mn-band-back','Kemi got her hair band back before the light went. She tied it on like a captain’s armband.']},
    whistle:{out:['gs40-kid-mn-whistle-out','Kemi lost her whistle on the sand today. She says the next game cannot be fair without it.'],
     back:['gs40-kid-mn-whistle-back','Kemi has her whistle again. The first thing she did was blow it at me. Fair enough.']}}},
  // §13.3 the match: [id, facts (all must hold; '+' joins), text]. Facts: won, lost, unf, last (the last goal won or lost it), called (Emeka
  // called in), kemi / emeka (scored most), og (a household own goal), first (the first win today), rain (it rained today), dry, harm, any;
  // (repair 5) wet (the rain began before today's match ended: R5-1), aft (the match ended at noon or later: Tunde is in the courtyard from
  // noon), nopic (no photograph of a first win today: Mr. Bassey took one)
  fb:{bassey:[['gs40-fb-ba1','won','I have told your goal three times today. Each time the ball goes further and the stones get closer together.'],
    ['gs40-fb-ba2','won+nopic','You won, and I was there with no camera. History will have to take my word for it.'],
    ['gs40-fb-ba3','won','A fine win. Kemi shook your hand like a referee. She is already planning the return match.'],
    ['gs40-fb-ba4','lost','In my time we played with a ball of rags tied with string. It did not bounce. Neither did we. The small ones bounce.'],
    ['gs40-fb-ba5','lost','The children beat you fair and square. I clapped for both sides. Mostly for theirs.'],
    ['gs40-fb-ba6','unf+called','Unfinished. In my time we also stopped when the mothers called. The mothers always won.'],
    ['gs40-fb-ba7','last','Last goal wins. The whole street held its breath. So did I, and I am too old for it.'],
    ['gs40-fb-ba8','kemi','Kemi sees the gap before the gap knows it is there. She will play for the country one day.'],
    ['gs40-fb-ba9','emeka','Emeka scored and danced on the spot like a man who has won a prize. Barefoot, of course.'],
    ['gs40-fb-ba10','wet','Football in the wet. Mud to the knees and nobody minded. Mama Nkechi will mind.'],
    ['gs40-fb-ba11','any','I watched from the touchline today. My knees played every pass. They are tired now.'],
    ['gs40-fb-ba12','harm','You played in this haze? From the touchline I could see only legs and dust and joy.'],
    ['gs40-fb-ba13','lost','I have seen many matches lost. Yours was lost with style. I would have photographed it.'],
    ['gs40-fb-ba14','any','I stood at the touchline and gave advice. Nobody took it. That is football.']],
   tunde:[['gs40-fb-tu1','lost','Beaten by the children? Then it is official. You are in my club.'],
    ['gs40-fb-tu2','won','I am thinking of joining the children’s side. Not to win. To be on the winning side for once.'],
    ['gs40-fb-tu3','unf','Nobody won? Then everybody will be talking about it tomorrow. That is the best result.'],
    ['gs40-fb-tu4','dry','Football in this heat. The ball was hotter than the pitch, and the pitch was hot.'],
    ['gs40-fb-tu5','aft','I heard the shouting from the courtyard. I turned my music down to listen. That never happens.'],
    ['gs40-fb-tu6','kemi','Kemi scored the most, I hear. I am going to ask her to do my sound. She has the timing.'],
    ['gs40-fb-tu7','og','An own goal, I hear. Do not worry. The ball does not know whose side it is on.'],
    ['gs40-fb-tu8','any','Next time you play, call me. I will stand at the side and shout useful things.']],
   nkechi:[['gs40-fb-nk1','any','Emeka ate his food with one hand and played the match again with the other. The beans scored twice.'],
    ['gs40-fb-nk2','unf','Emeka says the game is not finished, so nobody lost. He says it like a lawyer.'],
    ['gs40-fb-nk3','lost','Emeka is still celebrating. He told the whole match to my pepper. The pepper was not impressed.'],
    ['gs40-fb-nk4','won','Emeka says you were lucky. He says it with his mouth full, so I cannot argue.'],
    ['gs40-fb-nk5','called','I called Emeka in at the best part, he says. There is always a best part when it is time to eat.'],
    ['gs40-fb-nk6','emeka','Emeka scored. I know because he told me before he said good evening.'],
    ['gs40-fb-nk7','wet','Mud from the knees down. Emeka played in the wet and came home a different colour.'],
    ['gs40-fb-nk8','any','Emeka washed his feet tonight without being told. The match must have been a good one.']],
   ada:[['gs40-fb-ad1','any','Kemi asked me for real goalposts. I said I would think about it. She has already measured the stones for them.'],
    ['gs40-fb-ad2','og','I heard there was an own goal. I will not ask whose. I will only look at you while I do not ask.'],
    ['gs40-fb-ad3','harm','You played in this dust? I could not see the far stones from the Yard. I could hear Kemi, though.'],
    ['gs40-fb-ad4','won','Mr. Bassey says you played well. He says it loudly, so it must be true.'],
    ['gs40-fb-ad5','lost','The children beat you. Good. It keeps the compound humble. Me most of all.'],
    ['gs40-fb-ad6','last','So it went to last goal wins. I would have made that goal myself, if I made goals. I make stools.'],
    ['gs40-fb-ad7','any','The children were still arguing about the match outside the Yard. Both sides won, it seems.']],
   oyelaran:[['gs40-fb-oy1','any','One day that ball will find my window. Once is a game. Twice is a compound meeting.'],
    ['gs40-fb-oy2','won','The street has told me already: you won. Well done. Next time, win quietly.'],
    ['gs40-fb-oy3','lost','So the children won. The whole street has been telling it. I let them enjoy it.'],
    ['gs40-fb-oy4','unf','I asked who won. Nobody, they said. That is how a good meeting ends too.'],
    ['gs40-fb-oy5','wet','A wet pitch today, they tell me. Wipe your feet before you come up my stairs.'],
    ['gs40-fb-oy6','first','Your first win. Half the compound queued up to tell me. Well done.'],
    ['gs40-fb-oy7','any','Football in the compound. Somebody always tells me all about it, whether I ask or not.']],
   g:[['gs40-fb-g1','won','So you won today. The children will not allow that twice.'],
    ['gs40-fb-g2','lost','The children beat you, I hear. They will be impossible tomorrow.'],
    ['gs40-fb-g3','unf','Nobody won today, they say. The stones are still arguing about it.'],
    ['gs40-fb-g4','any','I heard there was football. The whole street knew by the noise.'],
    ['gs40-fb-g5','any','The children talked about the match all the way home. Every goal grows on the way.'],
    ['gs40-fb-g6','last','Last goal wins, I am told. Those are the longest minutes in football.'],
    ['gs40-fb-g7','called+unf','Emeka was called in before the end. The end will have to wait for tomorrow.'],
    ['gs40-fb-g8','any','Football today, I hear. The sand by the pitch has more footprints than the market.']]},
  // §13.4 the seasons: [id, season, roles ('open', 'today', 'bye', 'any'; '+' joins), text, gate ('rain': it rained today; 'norain': a rains day
  // with no rain)]. A season's lines must cover two consecutive blocks of it (the 12-day year puts the next harmattan inside the 13-night
  // window of the last), sized by the day-2 run (v40/build/gist/NOTES.txt)
  se:{tunde:[['gs40-se-tu-r1','rains','open','Evening o. The sky has been gathering all day, like a crowd waiting for music.'],
    ['gs40-se-tu-r2','rains','today+any','The rain came through the courtyard today. My speakers are under three layers of nylon. They are drier than me.','rain'],
    ['gs40-se-tu-r3','rains','today+any','After rain like that my scent leaf stands up straight. It is showing off. I allow it.','rain'],
    ['gs40-se-tu-r4','rains','today+any','In this season I cover my speakers before I cover my head. That tells you about my life.'],
    ['gs40-se-tu-r5','rains','bye','Let me go and check my nylon covers. Good night o.'],
    ['gs40-se-tu-r6','rains','today+any','No rain today. My plants are disappointed. I told them, patience.','norain'],
    ['gs40-se-tu-r7','rains','open','Good evening. The gutters sang all through the rain this afternoon. I stopped my work to listen.','rain'],
    ['gs40-se-tu-r8','rains','today+any','The square has a small lake in one corner in this season. The children call it the sea.'],
    ['gs40-se-tu-d1','dry','today+any','This heat. I watered my peppers twice today and they still looked at me like I owe them.'],
    ['gs40-se-tu-d2','dry','open','Good evening. I came out for the breeze. The breeze did not come, so here I am.'],
    ['gs40-se-tu-d3','dry','bye','Good night. I am going to sleep under my fan like a king under a palm tree.'],
    ['gs40-se-tu-d4','dry','today+any','The courtyard was so hot today the music came out slow. Even the drums were tired.'],
    ['gs40-se-tu-d5','dry','open','Evening o. The sun has finally gone to bed. I waited for it before coming out.'],
    ['gs40-se-tu-h1','harmattan','today+any','Harmattan has put dust inside my speakers. Every song now sounds like it is coming from the market.'],
    ['gs40-se-tu-h2','harmattan','today+any','New compound rule: in harmattan, nobody touches the gate without warning. It shocked me twice today.'],
    ['gs40-se-tu-h3','harmattan','open','Evening. My lips are cracking, so tonight I will talk less. I am joking. Good evening.'],
    ['gs40-se-tu-h4','harmattan','bye','Good night. Cover your speakers, if you have speakers. Cover your face, if you do not.'],
    ['gs40-se-tu-h5','harmattan','open','Good evening. Everything in the courtyard is wearing a coat of dust. Even me.']],
   nkechi:[['gs40-se-nk-r1','rains','today+any','Pepper soup weather, my dear. When the rain comes like this, the whole road wants something hot.','rain'],
    ['gs40-se-nk-r2','rains','today+any','I shouted “Bring in your clothes!” from the shop and three compounds ran. I have a good voice for rain.','rain'],
    ['gs40-se-nk-r3','rains','today+any','No rain today. The rain is resting small. It will come back when my washing is out.','norain'],
    ['gs40-se-nk-r4','rains','open','Good evening, my dear. The road is all puddles. I came the long way, round the biggest one.'],
    ['gs40-se-nk-r5','rains','bye','Let me go before the mosquitoes find me. In this season they know my name. Good night.'],
    ['gs40-se-nk-r6','rains','today+any','In this season my customers come in wet and leave dry. My shop is a small hotel.'],
    ['gs40-se-nk-r7','rains','open','Ehen, good evening. The air is cool tonight. Gist keeps better in the cool.'],
    ['gs40-se-nk-r8','rains','today+any','My umbrella has a hole in it the size of a button. In this season it is more of a hat.'],
    ['gs40-se-nk-r9','rains','today+any','Everything in the shop is damp in this season. The sugar sticks together like old friends.'],
    ['gs40-se-nk-d1','dry','today+any','This sun. I sold more cold water today than rice. My rice is offended.'],
    ['gs40-se-nk-d2','dry','open','Good evening o. The shop is too hot to sit in, so I came to sit in your breeze.'],
    ['gs40-se-nk-d3','dry','bye','Good night, my dear. Drink water before you sleep. This season takes it from you.'],
    ['gs40-se-nk-d4','dry','today+any','The heat today! My customers stood in the doorway to talk, so I sold them the doorway.'],
    ['gs40-se-nk-d5','dry','open','Good evening, my dear. I fanned myself all the way here. My arm is tired. My mouth is not.'],
    ['gs40-se-nk-h1','harmattan','today+any','The cold this morning! I opened the shop in my wrapper and a cardigan. Customers laughed. They were wearing two.'],
    ['gs40-se-nk-h2','harmattan','today+any','Harmattan don come. My lips are cracking like old paint. Pass me that cream before I speak again.'],
    ['gs40-se-nk-h3','harmattan','open','Good evening, my dear. Dust on everything, even on my gist. Let me shake it out.'],
    ['gs40-se-nk-h4','harmattan','bye','Good night. Rub cream on your hands before you sleep. This dust is not playing.'],
    ['gs40-se-nk-h5','harmattan','open','Evening o. I put on my cardigan to come down the road. Do not laugh. The cold is catching me.']],
   ada:[['gs40-se-ad-r1','rains','today+any','The rain makes my wood swell. Every joint I cut these days is tight. Good for chairs, bad for my temper.'],
    ['gs40-se-ad-r2','rains','today+any','The rain caught me in the Yard today. I stood under the half-roof with three unfinished chairs. We waited together.','rain'],
    ['gs40-se-ad-r3','rains','open','Evening. Everything smells of wet wood. I like it. Nobody else does.'],
    ['gs40-se-ad-r4','rains','bye','Good night. I must cover the Yard before the damp gets into the timber.'],
    ['gs40-se-ad-r5','rains','today+any','No rain today, so the wood dried a little. I worked fast while it was in a good mood.','norain'],
    ['gs40-se-ad-r6','rains','open','Good evening. My sandals are full of the Yard’s mud. I left most of it at the gate.'],
    ['gs40-se-ad-r7','rains','today+any','In this season I sand a chair in the morning and it swells again by evening. Wood has moods.'],
    ['gs40-se-ad-r8','rains','today+any','I moved my bench under the half-roof. In this season the Yard is half workshop, half pond.'],
    ['gs40-se-ad-d1','dry','today+any','In this heat the glue sets before I have finished thinking. I must think faster. I will not.'],
    ['gs40-se-ad-d2','dry','open','Evening. The Yard was an oven today. I am here to cool down, and to listen.'],
    ['gs40-se-ad-d3','dry','bye','Good night. I start early tomorrow, before the sun gets serious.'],
    ['gs40-se-ad-d4','dry','today+any','Everything in the Yard is dry and quick in this season. The shavings blow away before I can sweep them.'],
    ['gs40-se-ad-d5','dry','open','Evening. I swept the Yard twice today. The dust came back once. I call that winning.'],
    ['gs40-se-ad-h1','harmattan','today+any','Harmattan cracks wood. I oil every piece in the Yard each evening like I am putting children to bed.'],
    ['gs40-se-ad-h2','harmattan','today+any','Dust on every chair in the Yard. I sanded one this morning and by noon it had a new layer.'],
    ['gs40-se-ad-h3','harmattan','open','Evening. My hands are full of dust and oil. I washed them twice. They are still full of dust and oil.'],
    ['gs40-se-ad-h4','harmattan','bye','Good night. The wood needs its oil, and so do my knuckles.'],
    ['gs40-se-ad-h5','harmattan','open','Evening. I oiled a table today and the dust came to visit before the oil was dry.']],
   bassey:[['gs40-se-ba-r1','rains','today+any','Rain light is soft light. Nobody believes me. The wedding couples always wanted sun. The photographs wanted rain.'],
    ['gs40-se-ba-r2','rains','today+any','I watched the rain come across the water today. Once I would have stood in it with a camera. Today I stood under a roof.','rain'],
    ['gs40-se-ba-r3','rains','open','Good evening, my friend. The air is washed. Everything looks the way it did in my old photographs.','rain'],
    ['gs40-se-ba-r4','rains','bye','Good night. Keep your feet dry. That is advice from a man with old shoes.'],
    ['gs40-se-ba-r5','rains','today+any','No rain today. The clouds came, looked at us, and went to visit somebody else.','norain'],
    ['gs40-se-ba-r6','rains','open','Good evening. The water is high and brown in this season. It has news from upstream.'],
    ['gs40-se-ba-r7','rains','today+any','The fishermen were out early, before the sky turned. They read this water better than any radio.','rain'],
    ['gs40-se-ba-r8','rains','today+any','In this season the lagoon goes the colour of strong tea. I have a photograph of it from long ago. Same tea.'],
    ['gs40-se-ba-d1','dry','today+any','The light in this season is hard. Everybody squints in photographs. I tell them, look at me, not the sun.'],
    ['gs40-se-ba-d2','dry','open','Good evening. The heat has gone down with the sun, as a good guest should.'],
    ['gs40-se-ba-d3','dry','bye','Good night, my friend. Sleep with the window open. In this season the night is the only kindness.'],
    ['gs40-se-ba-d4','dry','today+any','The water was flat as glass today. A good day for a photograph, if your hands are steady. Mine are steady enough.'],
    ['gs40-se-ba-d5','dry','open','Good evening, my friend. The breeze off the water has come at last. I followed it here.'],
    ['gs40-se-ba-h1','harmattan','today+any','Harmattan light. Flat as a plate. The sun looks like the moon. Photographers rest. I am resting.'],
    ['gs40-se-ba-h2','harmattan','open','Good evening. I wore my old jacket for the morning cold. By noon I was carrying it like a baby.'],
    ['gs40-se-ba-h3','harmattan','bye','Good night. Wrap up. This harmattan pretends to be gentle.'],
    ['gs40-se-ba-h4','harmattan','today+any','The dust is on my lenses, on my shelves and on my opinions. I have stopped cleaning the opinions.'],
    ['gs40-se-ba-h5','harmattan','open','Good evening. The sun went down tonight like a coin in milk. Harmattan sunsets are shy.']],
   oyelaran:[['gs40-se-oy-r1','rains','today+any','My wrapper has been on the line two days and it is still thinking about drying.'],
    ['gs40-se-oy-r2','rains','bye','Close your door tonight. The mosquitoes have been told about you. I did not tell them. Good night.'],
    ['gs40-se-oy-r3','rains','open','Good evening. Mind the puddle by the gate. It has been there so long it deserves a name.'],
    ['gs40-se-oy-r4','rains','today+any','So much rain today. When I came back this evening, my radio was complaining about the damp.','rain'],
    ['gs40-se-oy-r5','rains','today+any','No rain today. The gutters have nothing to say. I enjoyed the quiet.','norain'],
    ['gs40-se-oy-r6','rains','open','Good evening. At this time of year my stairs are never quite dry, so I hold the rail all the way down.'],
    ['gs40-se-oy-r7','rains','today+any','Coming home, I found my stairs still wet and swept them. The stairs were grateful. My broom was not.','rain'],
    ['gs40-se-oy-r8','rains','today+any','In this season I keep a cloth by the door for wet feet. Use it. I am watching.'],
    ['gs40-se-oy-d1','dry','today+any','Fill your buckets in the evening. In this season the tank empties before the morning has finished yawning.'],
    ['gs40-se-oy-d2','dry','open','Good evening. It is cooler down here than upstairs. That is the only reason I came. And the gist.'],
    ['gs40-se-oy-d3','dry','bye','Good night. Leave your window open and your door shut. Both. I have said it.'],
    ['gs40-se-oy-d4','dry','today+any','The courtyard was a frying pan today. I swept it at six in the morning, before it could fry me.'],
    ['gs40-se-oy-d5','dry','open','Good evening. Upstairs is an oven tonight. Down here is merely a pot.'],
    ['gs40-se-oy-h1','harmattan','today+any','Harmattan. I dusted the stairs at seven. By ten the dust had taken them back.'],
    ['gs40-se-oy-h2','harmattan','today+any','In my day the harmattan was so thick you could not see the gate from the stairs. This is a rehearsal.'],
    ['gs40-se-oy-h3','harmattan','open','Good evening. Mind the dust on the rail. I wiped it at six, when I came in. The harmattan did not agree.'],
    ['gs40-se-oy-h4','harmattan','bye','Good night. Shut your window tight against the dust. It has opinions.'],
    ['gs40-se-oy-h5','harmattan','open','Good evening. I wore a shawl down the stairs. It is not for the cold. It is for the dust. Mostly.']]},
  // the evergreen lines (no season): two greetings, two goodbyes and two remarks per neighbour, the repeat guard's floor (the remarks also for
  // the line about today, sized by the day-2 run); the second goodbye nods to Mallam at his grill and is used only on an evening he is seated there
  ev:{tunde:{open:[['gs40-ev-tu-o1','Evening, everyone. The day has finished with me, so I came here.'],['gs40-ev-tu-o2','Good evening o. I bring greetings from my plants. My plants say hello.']],
    bye:[['gs40-ev-tu-b1','Right, I am off before I start a new story.'],['gs40-ev-tu-b2','Mallam, keep one stick warm for me tomorrow. Good night, all.','mallam']],
    any:[['gs40-ev-tu-a1','Somebody in the square asked me to play something slow. I played it fast. Nobody complained.'],['gs40-ev-tu-a2','My plants have names now. Their names stay with me. They are shy.']]},
   nkechi:{open:[['gs40-ev-nk-o1','Good evening, my dear. I locked the shop and the shop let me go.'],['gs40-ev-nk-o2','Ehen, good evening. My legs said sit, my mouth said gist. My mouth won.']],
    bye:[['gs40-ev-nk-b1','Good night, my dear. Tomorrow the shop opens early, and so do I.'],['gs40-ev-nk-b2','Mallam, I can smell your fire from here. Save me a stick tomorrow. Good night.','mallam']],
    any:[['gs40-ev-nk-a1','A small boy came to the shop for one sweet and stayed to tell me his whole day. I gave him two.'],['gs40-ev-nk-a2','My radio and Mrs. Oyelaran’s radio play different stations. In the courtyard they meet and argue.']]},
   ada:{open:[['gs40-ev-ad-o1','Evening. I left a chair half-finished. It will wait. Chairs are patient.'],['gs40-ev-ad-o2','Good evening. Sawdust in my hair, gist in my mouth. I am ready.']],
    bye:[['gs40-ev-ad-b1','Good night. The chair will not finish itself, more is the pity.'],['gs40-ev-ad-b2','Mallam, the smoke says your fire is good tonight. Good night, everyone.','mallam']],
    any:[['gs40-ev-ad-a1','A man asked for a chair that would last for ever. I said yes. Then I added: if you sit gently.'],['gs40-ev-ad-a2','I found a nail in my pocket that I do not remember putting there. The Yard is generous like that.']]},
   bassey:{open:[['gs40-ev-ba-o1','Good evening, my friend. I came slowly, so I would arrive at the right time.'],['gs40-ev-ba-o2','Good evening. I have walked the waterfront twice and now my legs are ready for a rail.']],
    bye:[['gs40-ev-ba-b1','Good night, my friend. The evening was well spent.'],['gs40-ev-ba-b2','Good night. Mallam, I will come for my usual tomorrow. Do not give it away.','mallam']],
    any:[['gs40-ev-ba-a1','I cleaned my old camera today. It has no film, but it likes to be cleaned.'],['gs40-ev-ba-a2','A young man asked me how to take a good photograph. I said: wait. He did not like the answer.']]},
   oyelaran:{open:[['gs40-ev-oy-o1','Good evening. The stairs are long tonight, so the gist had better be good.'],['gs40-ev-oy-o2','Good evening. I have nothing to report, which is itself news.']],
    bye:[['gs40-ev-oy-b1','Good night. Lock your door, then check it. I check twice.'],['gs40-ev-oy-b2','Mallam, keep the pepper gentle on mine tomorrow. Good night, everyone.','mallam']],
    any:[['gs40-ev-oy-a1','The noticeboard has many handwritings and one opinion. Mine.'],['gs40-ev-oy-a2','I counted the steps on the stairs today. The same number as yesterday. Good.']]}},
  // §9.4 the transition tips, the evening before a season changes (a tip: it comes true in the Menu and the sky the next morning), and the same
  // as a greeting when the script has no room. "The rains come back tomorrow" is a season, allowed only here; nothing promises rain.
  tr:{dry:{tunde:[['gs40-tr-dry-tu','The rain is packing its bags. From tomorrow, dry. My plants will sulk.'],['gs40-tr-dry-tu-o','Evening. The rains are leaving us. From tomorrow, the dry season.']],
    nkechi:[['gs40-tr-dry-nk','From tomorrow the dry season, my dear. Fill your water before the sun takes it.'],['gs40-tr-dry-nk-o','Good evening, my dear. The dry season starts tomorrow. I can feel it already.']],
    ada:[['gs40-tr-dry-ad','The dry season starts tomorrow. My wood will be glad. My glue will not.'],['gs40-tr-dry-ad-o','Evening. Tomorrow the dry season. The Yard is already thirsty.']],
    bassey:[['gs40-tr-dry-ba','Tomorrow the dry season begins. Hard light again. I will squint for a few days.'],['gs40-tr-dry-ba-o','Good evening, my friend. The dry season comes tomorrow.']],
    oyelaran:[['gs40-tr-dry-oy','The rainy season ends tonight. Tomorrow, dry. Fetch your water early.'],['gs40-tr-dry-oy-o','Good evening. The dry season from tomorrow. I have told the tank.']]},
   harmattan:{nkechi:[['gs40-tr-har-nk','Harmattan is coming tomorrow. I can feel it in my lips already. Buy cream.'],['gs40-tr-har-nk-o','Good evening, my dear. Harmattan tomorrow. My lips know it already.']],
    oyelaran:[['gs40-tr-har-oy','Harmattan tomorrow. Cover what you love. Dust has no manners.'],['gs40-tr-har-oy-o','Good evening. Harmattan tomorrow. I have covered the stairs.']],
    tunde:[['gs40-tr-har-tu','Harmattan tomorrow. I am wrapping my speakers tonight like presents.'],['gs40-tr-har-tu-o','Evening o. Harmattan comes tomorrow. My speakers are already coughing.']],
    ada:[['gs40-tr-har-ad','Harmattan comes tomorrow. I will oil the wood tonight, before the dust gets to it.'],['gs40-tr-har-ad-o','Evening. Harmattan tomorrow. The wood is already nervous.']],
    bassey:[['gs40-tr-har-ba','The harmattan arrives tomorrow. Flat light and cold mornings. Bring out your jackets.'],['gs40-tr-har-ba-o','Good evening, my friend. Harmattan tomorrow. I have found my jacket.']]},
   rains:{ada:[['gs40-tr-rai-ad','The rains come back tomorrow. My wood knows it already. Listen, you can hear it drinking.'],['gs40-tr-rai-ad-o','Evening. The rains come back tomorrow. My wood is already thirsty for it.']],
    bassey:[['gs40-tr-rai-ba','The rainy season comes back tomorrow. Soft light again. I will dust off my patience.'],['gs40-tr-rai-ba-o','Good evening, my friend. The rainy season comes back tomorrow. Soft light again.']],
    tunde:[['gs40-tr-rai-tu','The rainy season is back tomorrow. My plants are already standing up straight.'],['gs40-tr-rai-tu-o','Evening o. The rains come back tomorrow. My nylon covers are ready.']],
    nkechi:[['gs40-tr-rai-nk','The rains come back tomorrow, my dear. Pepper soup weather. My pot is ready.'],['gs40-tr-rai-nk-o','Good evening, my dear. The rains come back tomorrow. Pepper soup weather.']],
    oyelaran:[['gs40-tr-rai-oy','The rainy season returns tomorrow. Clear your gutters. I will be checking.'],['gs40-tr-rai-oy-o','Good evening. The rainy season returns tomorrow. Mind the gutters.']]}},
  // §9.3 (3) a card thing given back today, said by its owner when a guest (three each, fix round S11, so the same words do not come back within
  // a fortnight: the first not heard in thirteen evenings, else the one heard longest ago)
  ret:{tunde:[['gs40-ret-tu1','You found my {thing}. I put a line through the card myself. With pleasure.'],['gs40-ret-tu2','My {thing} is back where it lives. I told the whole courtyard who found it.'],['gs40-ret-tu3','My {thing} came home. Thank you o. I will tell it off later.']],
   nkechi:[['gs40-ret-nk1','My {thing} is home, thanks to this house. I told every customer. Some of them clapped.'],['gs40-ret-nk2','You brought my {thing} back. I crossed it off the board with my best pen.'],['gs40-ret-nk3','My {thing} is back in the shop, my dear. I have told it to stay.']],
   ada:[['gs40-ret-ad1','My {thing} came back. I have put it where I can see it. That never works, but I try.'],['gs40-ret-ad2','Thank you again for my {thing}. I crossed the card out neatly. You would expect nothing less.'],['gs40-ret-ad3','My {thing} is back on my bench. This time I have measured where I put it.']],
   bassey:[['gs40-ret-ba1','My {thing} is safe in my bag again. I struck out the card in my best handwriting.'],['gs40-ret-ba2','You found my {thing}. In my time a thing that was lost stayed lost. Things are better now.'],['gs40-ret-ba3','My {thing} is home again, my friend. Some things find their way back. With help.']],
   oyelaran:[['gs40-ret-oy1','The {thing} has come back to me. I crossed out the card myself. It is the best notice on the board.'],['gs40-ret-oy2','Thank you for the {thing}. I have noted it.'],['gs40-ret-oy3','My {thing} is in its proper place again. The board is tidier for it.']]},
  // §13.6 (cut item 3, built) the season wordings for v39's pot ask ({n}: two or three, spoken) and one more "again" tip per owner, used only in
  // place of a v39 line heard within thirteen evenings
  pot:{nkechi:{rains:['gs40-pot-nk-r','The rainy season wants soup, my dear. Tomorrow my pot needs {n} fish, and only ones caught after two o’clock.'],
    dry:['gs40-pot-nk-d','In this heat fish does not wait. {n} for my pot tomorrow, caught after two o’clock, and bring them quickly.'],
    harmattan:['gs40-pot-nk-h','Cold mornings want hot soup. Tomorrow, {n} fish caught after two o’clock, my dear.']},
   bassey:{rains:['gs40-pot-ba-r','Tomorrow my sister arrives with an umbrella and complaints, as she does in this season. I need {n} fish after two.'],
    dry:['gs40-pot-ba-d','The heat makes my sister sharper, and she visits tomorrow. Bring me {n} fresh fish, caught after two, to soften her.'],
    harmattan:['gs40-pot-ba-h','Tomorrow my sister again, in her harmattan shawl. {n} fish after two, please. Hot stew wins every argument.']}},
  again:{tunde:['gs40-ag-tunde','I give my {thing} one more day before it goes missing again. I have stopped being surprised. Keep an eye out for me.'],
   nkechi:['gs40-ag-nkechi','My {thing} is planning to run away from me again, my dear, I can feel it. Bring it home if you see it.'],
   ada:['gs40-ag-ada','My {thing} is restless again. If I look away for one minute tomorrow, it will take the minute and leave.'],
   bassey:['gs40-ag-bassey','My {thing} will wander off again, I fear. At my age, things wander more than I do.'],
   oyelaran:['gs40-ag-oyelaran','My {thing} is due to go missing again. When it does, look, and say nothing.']},
  // (fix round, DOD-F4 and S11) more wordings for the information lines the long sweep heard most often past the third week, each used only in
  // place of the v38 or v39 line when that line was heard within thirteen evenings, and only while it was not heard itself; every other field of
  // the entry is kept (its booking reads those). The "again" tip by season, one per owner and season
  againSe:{tunde:{rains:['gs40-ag-tu-r','My {thing} is next to go, I am sure of it. In this season I blame the rain for everything, but that one will be my own fault.'],
    dry:['gs40-ag-tu-d','In this heat my {thing} will slip away from me again, and the sun is too strong for a proper search. If you see it, call me.'],
    harmattan:['gs40-ag-tu-h','My {thing} is ready to vanish again. With all this dust it could end up anywhere. Keep your eyes open for me.']},
   nkechi:{rains:['gs40-ag-nk-r','Between the damp and the customers I cannot keep anything, my dear. Next to go will be my {thing}.'],
    dry:['gs40-ag-nk-d','This heat makes me forget my own hands, my dear. Watch, my {thing} will go walking again. Bring it if you see it.'],
    harmattan:['gs40-ag-nk-h','In this dust I can hardly find my own shop, my dear. My {thing} will disappear on me again, I know it.']},
   ada:{rains:['gs40-ag-ad-r','Wet wood, wet hands. My {thing} will slide out of them again before long.'],
    dry:['gs40-ag-ad-d','In this heat my patience goes first, then my tools. Next it will be my {thing}, I can feel it.'],
    harmattan:['gs40-ag-ad-h','I suspect the dust has its eye on my {thing} again. The dust says nothing.']},
   bassey:{rains:['gs40-ag-ba-r','In my time I lost umbrellas, my friend. Now I lose everything, and tomorrow, I am sure, my {thing} will join the list.'],
    dry:['gs40-ag-ba-d','The heat will take my {thing} again, I think, along with my memory.'],
    harmattan:['gs40-ag-ba-h','Soon my {thing} will be somewhere under the dust again. My eyes are not what they were.']},
   oyelaran:{rains:['gs40-ag-oy-r','My {thing} has that look again, the look of a thing about to go missing. I have warned it.'],
    dry:['gs40-ag-oy-d','My {thing} is about to stray again. I mention it once, and I will not mention it again.'],
    harmattan:['gs40-ag-oy-h','If the dust takes my {thing} again, it will answer to me.']}},
  // Ada's standing ask by season ({thing} the fish): two for the day fish, one for the catfish, the same news as v38's (early afternoon, after six)
  ask:{day:{rains:[['gs40-ask-r1','In this season the wood is soft and willing. Tomorrow, a {thing}. They bite after midday. Bring me one and my knife does the rest.'],
     ['gs40-ask-r2','Tomorrow I want a {thing} to carve. Fish after midday, before the clouds make up their minds.']],
    dry:[['gs40-ask-d1','Dry wood, ready and waiting. A {thing} is what I want tomorrow, heat or no heat. Look for them in the early afternoon.'],
     ['gs40-ask-d2','My hands are restless in this heat. A {thing} would settle them, caught tomorrow after midday.']],
    harmattan:[['gs40-ask-h1','The harmattan has dried my wood just right for a {thing}. Tomorrow, try for one in the early afternoon, when they bite, and leave it with me.'],
     ['gs40-ask-h2','If the dust lets you see the water tomorrow after midday, catch me a {thing}. It goes under my knife the same night.']]},
   cat:{rains:['gs40-ask-cat-r','Catfish like the dark, and the rains make the evenings darker. Tomorrow after six, catch one and carry it to the courtyard for me.'],
    dry:['gs40-ask-cat-d','Catfish wait for the cool of the evening, like everybody in this season. Fish for one tomorrow after six. The courtyard is where I will be.'],
    harmattan:['gs40-ask-cat-h','A catfish for my next carving. They come out after six, when the dust settles. Catch one tomorrow; I will meet you in the courtyard.']}},
  // the wash tip by its teller: [id, seasons, line] (high water tonight, shells along the edge tomorrow afternoon, as v38's)
  wash:{tunde:[['gs40-wash-tu-r','rains','The lagoon is fat with all this rain, and it climbs again tonight. By tomorrow afternoon the sand will be covered in shells. Music for the eyes.'],
    ['gs40-wash-tu-d','dry+harmattan','The water climbs tonight. When it pulls back tomorrow afternoon, there are shells for everybody. I am going early.']],
   nkechi:[['gs40-wash-nk-r','rains','The water is coming up big tonight, my dear. Tomorrow after midday, shells all along the edge. Take a nylon.'],
    ['gs40-wash-nk-d','dry+harmattan','My dear, the lagoon will swell in the night. By tomorrow afternoon you will find shells right by the water. Bring me a pretty one for the shop.']],
   ada:[['gs40-wash-ad-r','rains','The lagoon is rising tonight. Tomorrow afternoon, go and see what it leaves on the sand. Some of the shells are better made than my chairs.'],
    ['gs40-wash-ad-d','dry+harmattan','Tonight the lagoon swells. After midday tomorrow, shells at the edge, flat ones and curly ones. I use the flat ones for inlay.']],
   bassey:[['gs40-wash-ba-r','rains','My friend, the lagoon will stand high tonight, and tomorrow afternoon its edge will be white with shells. A fine picture.'],
    ['gs40-wash-ba-d','dry+harmattan','The lagoon comes up in the night, my friend. Tomorrow after midday its edge will glitter with shells. In my day we threaded them into necklaces.']],
   oyelaran:[['gs40-wash-oy-r','rains','The rains have filled the lagoon, and it climbs higher tonight. I am told there will be shells tomorrow afternoon. Wipe your feet when you come back.'],
    ['gs40-wash-oy-d','dry+harmattan','The water will be high tonight. Shells after midday tomorrow, for those who go and look. Do not bring sand up my stairs.']]},
  // Aunty Bisi passes tomorrow, by any guest: [id, seasons, line]
  tom:[['gs40-tom-r','rains','Aunty Bisi comes round tomorrow evening. Rain or shine, she comes.'],['gs40-tom-d','dry+harmattan','Tomorrow evening Aunty Bisi passes this side. Hot puff-puff, they say.']],
  // the pot ask, a second wording in any season ({n}: two or three, spoken)
  pot2:{nkechi:['gs40-pot-nk-2','My pot is asking for fish again, my dear. {n} tomorrow, caught after two o’clock. Not one minute before.'],
   bassey:['gs40-pot-ba-2','My sister is back tomorrow. Bring {n} fish, caught after two, please. She cannot complain with her mouth full.']},
  // §6.1 the errand's mention at the gist, by the receiver when a guest (information, never swapped; two per pair)
  er:{plate:[['gs40-er-plate1','The plate came this afternoon, still warm. Mama Nkechi knows I forget lunch.'],['gs40-er-plate2','Mama Nkechi’s jollof came across today. I ate it standing at the bench, like a carpenter.']],
   frame:[['gs40-er-frame1','Ada mended my frame. It hangs straighter than I do.'],['gs40-er-frame2','My old frame is back on the wall. Ada fixed it, and you carried it. A whole compound’s work.']],
   tape:[['gs40-er-tape1','Mr. Bassey’s highlife tape came today. I have played it four times. The courtyard is learning to dance.'],['gs40-er-tape2','That cassette from Mr. Bassey is older than my speakers. It still sounds better.']],
   seedlings:[['gs40-er-seedlings1','Tunde’s seedlings are on my counter. If they grow, I will sell him the pepper.'],['gs40-er-seedlings2','Pepper seedlings from Tunde. Customers ask if they are for sale. I say: not yet.']],
   bread:[['gs40-er-bread1','Mama Nkechi sent bread today, still warm. I ate half before I remembered my manners.'],['gs40-er-bread2','Warm bread, carried all the way to the water. I have not been looked after like this in years.']],
   box:[['gs40-er-box1','Ada’s box fits my speaker like it was born there.'],['gs40-er-box2','My speaker has a house now. Ada made it, you brought it, and I take the credit.']],
   photo:[['gs40-er-photo1','Mr. Bassey sent a photograph of the Yard before my time. The bench in it is still there. I checked.'],['gs40-er-photo2','An old photograph of the Yard came today. Same trees, younger wood.']],
   lead:[['gs40-er-lead1','My extension lead came home today. Tunde sends his apologies, by you.'],['gs40-er-lead2','Tunde returned my extension lead. Through you. He is brave, but not that brave.']]}},
 // the interface (plain English)
 UI:{pick:'Pick up {label}',give:'Give {child} {pron} {name}',shop:'Give Mama Nkechi Emeka’s {name}',
  pickToast:{emeka:'Emeka’s {name}. He plays at the pitch in the afternoons, or Mama Nkechi will take it at her shop.',kemi:'Kemi’s {name}. She plays at the pitch in the afternoons.'},
  pickToastSat:{emeka:'Emeka’s {name}. He is at the pitch today, or Mama Nkechi will take it at her shop.',kemi:'Kemi’s {name}. She is at the pitch today.'},
  where:{emeka:'Emeka plays at the pitch in the afternoons, or Mama Nkechi at her shop',kemi:'Kemi plays at the pitch in the afternoons'},
  kicker:'Given back',close:'Close',
  todayHeard:'Heard at the pitch: {child} lost {pron} {name}. It is on the sand by the pitch.',
  todayStill:'{child}’s {name} is still on the sand by the pitch.',
  todayAft:'{child} is looking for {pron} {name} by the pitch.',
  handAlso:'Also with you: {list}.',handRow:'With you: {list}.',
  recap:{kid:'{child} has {pron} {name} back.',card:'{owner} has {pron} {name} back.',errand:'{receiver} has the {short}.'}},
 world:{thing:null,glint:null,key:''},mem:{exitOf:null,exitDay:0,aftDay:0,satMorning:0,lastSwap:null,shout:null},queue:[],
 flags:{playtest:false},cost:{steps:0,checks:0,builds:0}};
// the card copy is engineer A's (BOARD40.CARDS, ids bd40-); an id here would win over it (boardText40), so the reader's wording can land here
GIST40.CARDS={};

/* ======================================================================================================================================
   2. Small helpers (all guarded: in the subset copies and the copies without v38 or v39 these names are undeclared)
   ====================================================================================================================================== */
function gistOnline40(){return typeof NET!=='undefined'&&!!NET&&!!NET.on;}
function gistIsAI40(i){return typeof AI!=='undefined'&&!!AI&&!!AI.on&&i===AI.i;}
function gistLog40(k,a){try{if(typeof LOG35!=='undefined'&&LOG35&&typeof LOG35.add==='function')LOG35.add(k,a);}catch(e){}}
function gistToast40(m){try{if(typeof toast==='function'&&!(typeof silentMode==='function'&&silentMode()))toast(m);}catch(e){}}
function gistSaveNow40(){try{if(typeof save==='function')save();}catch(e){}}
function gistFill40(t,v){return String(t).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?v[k]:m);}
function gistNm40(k){return typeof CAST!=='undefined'&&CAST[k]?CAST[k].name:(k==='kemi'?'Kemi':k==='emeka'?'Emeka':k);}
function gistUp40(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function gistLow40(s){s=String(s||'');return s.charAt(0).toLowerCase()+s.slice(1);}
function gistH40(){return typeof hash38==='function'?hash38.apply(null,arguments):0;}
function gistLive40(){return typeof S!=='undefined'&&!!S&&!!S.p&&S.phase==='play'&&typeof players!=='undefined'&&players.length>0;}
function gistOverlay40(){try{return typeof overlayOpen==='function'&&overlayOpen();}catch(e){return false;}}
function gistInGist40(){return (typeof GIST38!=='undefined'&&!!GIST38&&!!GIST38.visit)||(typeof EVENING35!=='undefined'&&!!EVENING35&&EVENING35.state!=='idle');}
// v40's record, read only (the plan must stay pure): S.life.gist38.b40 or null
function gistB40(){if(!GIST40.on||typeof S==='undefined'||!S||!S.life||!S.life.gist38||typeof S.life.gist38!=='object')return null;const b=S.life.gist38.b40;return b&&typeof b==='object'?b:null;}
// the same, its lazy fields filled (board-v40.js gistSave40; never creates)
function gistRec40(){return typeof gistSave40==='function'?gistSave40(false):null;}
// football's saved record, and whether today's is a real match (a result and the scorers: every harness's synthetic record lacks them)
function gistFb40(){try{return typeof fbSave37==='function'?fbSave37():null;}catch(e){return null;}}
function gistReal40(day){const L=gistFb40(),l=L&&L.last;return !!(l&&l.day===day&&typeof l.result==='string'&&Array.isArray(l.scorers));}
function gistSeason40(day){return typeof season==='function'?season(day):'rains';}
// it rained today (the sky's own record, drawn each morning): only once the rain has started
function gistRained40(){const w=typeof S!=='undefined'&&S?S.weather:null;return !!(w&&w.day===S.day&&typeof w.rainAt==='number'&&S.time>=w.rainAt);}
// (repair 5, R5-1) the hour today's match ended, from v40's record (football's own end event, below), or null
function gistEnd40(){const b=gistB40(),e=b&&b.fbEnd;return e&&e.day===S.day&&typeof e.t==='number'?e.t:null;}
// the rain began before today's match ended (gistRained40 says only that it rained at some hour today; a morning match can end before it)
function gistWet40(){const t=gistEnd40();return gistRained40()&&t!==null&&S.weather.rainAt<t;}
function gistNoRain40(){const w=typeof S!=='undefined'&&S?S.weather:null;return gistSeason40(S.day)==='rains'&&!!w&&w.day===S.day&&typeof w.rainAt!=='number';}
function gistPron40(k){return k==='emeka'||k==='tunde'||k==='bassey'?'his':'her';}

/* ======================================================================================================================================
   3. Kemi's and Emeka's things (spec §7): the drop at the children's exit or at 14:00 on a morning-match day, the thing on the sand, the
   glint, the shouts, the pick, the give to the child and to Mama Nkechi; a separate track, never FOUND38.LOST, never G.keep.keepsake
   ====================================================================================================================================== */
function kidFb40(){return typeof FOOTBALL37!=='undefined'&&FOOTBALL37?FOOTBALL37:null;}
function kidSat40(day){try{return typeof fbWeekday37==='function'&&fbWeekday37(day)===0&&day>=2;}catch(e){return false;}}
function kidItem40(id){return GIST40.LINES.kid.items[id]||null;}
// a child's day, pure: after v40 discovery, football present, a real match today, nothing of the children's out or in the hand, none lost in
// the last two days, and about one match day in three by the day's hash (a morning-match day's afternoon drop is always a child's day)
function kidDay40(day,aft){const b=gistB40(),F=kidFb40();if(!b||!F||gistOnline40()||!gistReal40(day))return false;const K=GIST40.KIDS,k=b.kid;
 if(k&&(k.state==='lost'||k.state==='hand'))return false;const last=b.kids&&typeof b.kids.lastDay==='number'?b.kids.lastDay:0;
 if(last&&day-last<=K.gap)return false;if(GIST40.flags.playtest)return true;
 return !!aft||gistH40(day,44)%K.every===0;}
// where it falls: one of the six spots by the day's hash
function kidSpot40(day){const L=GIST40.KIDS.spots;return L[gistH40(day,45)%L.length].slice();}
// who and what: the children alternate (Emeka first), each through their two things
function kidNext40(b){const n=(b.kids&&b.kids.n)|0,who=n%2===0?'emeka':'kemi',two=GIST40.KIDS.order[who];return {who,id:two[Math.floor(n/2)%2]};}
function kidChild40(who){const F=kidFb40();const c=F&&F.kids?F.kids[who]:null;return c&&c.g&&!c.gone?c:null;}
function kidAway40(c){return !c||c.gone||c.mode==='leave'||c.mode==='fadeout'||!!(c.fade&&c.fade.dir<0);}
function kidHumansNear40(x,z,r){if(typeof players==='undefined')return false;for(const p of players){if(!p||!p.g||gistIsAI40(p.i))continue;if(Math.hypot(p.g.position.x-x,p.g.position.z-z)<=r)return true;}return false;}
// the drop: recorded lost with its spot, the child's call over the child, the log, one save
function kidDrop40(at){const b=gistRec40();if(!b)return false;const K=GIST40.KIDS,L=GIST40.LINES.kid,nx=kidNext40(b),it=kidItem40(nx.id),sp=kidSpot40(S.day);
 const c=kidChild40(nx.who),src=c?[c.g.position.x,c.g.position.z]:sp,heard=kidHumansNear40(src[0],src[1],K.heard);
 b.kid={day:S.day,who:nx.who,id:nx.id,state:'lost',spot:sp,heard,at,told:0,asked:0};
 if(!b.kids||typeof b.kids!=='object')b.kids={n:0,last:{emeka:0,kemi:0}};if(!b.kids.last||typeof b.kids.last!=='object')b.kids.last={emeka:0,kemi:0};
 b.kids.n=(b.kids.n|0)+1;b.kids.last[nx.who]=S.day;b.kids.lastDay=S.day;
 const text=at==='afternoon'?gistFill40(L.shoutAft[nx.who][1],{thing:it.name}):L.shout[nx.id][1];
 if(c&&heard&&typeof bubble40==='function')bubble40(text,K.ms,c.g,K.bubbleY);
 // nobody near (a fade exit): the call waits for the next time a player comes within 20 m of the child that day (fix round, S6)
 GIST40.mem.shout=c&&!heard?{day:S.day,who:nx.who,text}:null;
 gistLog40('kid','drop '+nx.id);if(!gistInGist40())gistSaveNow40();kidSync40();return true;}
function kidMat40(c){const m=new THREE.MeshLambertMaterial({color:c});m.userData.own40=true;return m;}
function kidMesh40(id){const g=new THREE.Group();g.name='gist40_kid_'+id;const add=(geo,c,x,y,z)=>{const m=new THREE.Mesh(geo,kidMat40(c));m.position.set(x,y,z);m.castShadow=false;g.add(m);return m;};
 if(id==='marble'){add(new THREE.SphereGeometry(0.03,12,8),'#7FB6D6',0,0.03,0);add(new THREE.SphereGeometry(0.012,8,6),'#E0543A',0.012,0.034,0.01);}
 else if(id==='tops'){add(new THREE.CylinderGeometry(0.06,0.06,0.04,14),'#B9B9B0',0,0.02,0);for(let n=0;n<3;n++)add(new THREE.CylinderGeometry(0.018,0.018,0.006,10),['#D2342A','#2F6DB5','#E9C23A'][n],0.08+n*0.03,0.003,0.02*n);}
 else if(id==='band'){const t=add(new THREE.TorusGeometry(0.04,0.008,6,16),'#2A2A2A',0,0.008,0);t.rotation.x=Math.PI/2;add(new THREE.SphereGeometry(0.018,10,8),'#3E7BD6',0.045,0.018,0);add(new THREE.SphereGeometry(0.018,10,8),'#3E7BD6',0.06,0.018,0.025);}
 else{add(new THREE.BoxGeometry(0.07,0.025,0.03),'#E04B8F',0,0.0125,0);const s=add(new THREE.TorusGeometry(0.05,0.004,4,14),'#F2C14E',-0.06,0.004,0);s.rotation.x=Math.PI/2;}
 g.scale.setScalar(1.6);return g;}
function kidDropMesh40(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material){const ms=Array.isArray(m.material)?m.material:[m.material];
 for(const x of ms){if(x.map&&!(typeof BOARD40!=='undefined'&&BOARD40&&BOARD40.world&&x.map===BOARD40.world.star))x.map.dispose();x.dispose();}}});}
function kidTeardown40(){const W=GIST40.world;kidDropMesh40(W.thing);kidDropMesh40(W.glint);W.thing=null;W.glint=null;W.key='';
 if(typeof scene!=='undefined'&&scene&&scene.children){for(const o of scene.children.slice())if(o.userData&&o.userData.gist40==='kid')kidDropMesh40(o);}}
// the world to match the record: the thing on the sand (with its glint) while it is lost; nothing otherwise
function kidSync40(){const W=GIST40.world,b=gistB40(),k=b&&b.kid;const key=k&&k.state==='lost'&&Array.isArray(k.spot)&&!gistOnline40()?k.id+':'+k.day+':'+k.spot.join(','):'';
 if(key===W.key&&(!W.thing||W.thing.parent===scene))return;kidDropMesh40(W.thing);kidDropMesh40(W.glint);W.thing=null;W.glint=null;W.key='';if(!key||typeof scene==='undefined'||!scene||typeof quiet40!=='function')return;
 const K=GIST40.KIDS,g=quiet40(()=>kidMesh40(k.id));g.position.set(k.spot[0],K.ground+0.002,k.spot[1]);g.rotation.y=(gistH40(k.day,47)%628)/100;g.userData.gist40='kid';scene.add(g);W.thing=g;
 const gl=quiet40(()=>typeof boardGlintMesh40==='function'?boardGlintMesh40():new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,opacity:0})));
 gl.position.set(k.spot[0],K.ground+GIST40.GLINT.y,k.spot[1]);gl.userData.gist40='kid';scene.add(gl);W.glint=gl;W.key=key;GIST40.cost.builds++;kidGlintFrame40();}
// the glint every frame: shown within 5 m of a human, full within 3 m, pulsing; its size follows the camera (v38's and the board's)
function kidGlintFrame40(){const Gs=GIST40,g=Gs.world.glint;if(!g)return;const G=Gs.GLINT;let d=1e9;
 for(const p of players){if(!p||!p.g||gistIsAI40(p.i)||(p.y||0)>1)continue;const q=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z);if(q<d)d=q;}
 if(!(d<G.far)){if(g.visible){g.visible=false;g.material.opacity=0;}return;}
 const pulse=G.lo+(G.hi-G.lo)*(0.5+0.5*Math.sin(Gs.t*2*Math.PI/G.period)),k=d<=G.near?1:0.7+0.3*(G.far-d)/(G.far-G.near);g.material.opacity=pulse*k;g.visible=true;
 const cam=typeof v21Dist!=='undefined'&&v21Dist?Math.max(1,v21Dist[0]/G.camRef):1,s=G.size*cam;g.scale.set(s,s,1);}
// the children's bubbles that follow one another (the thanks, then the play line), timed on GIST40.t
function kidQueue40(){const Q=GIST40.queue;for(let j=0;j<Q.length;j++){const q=Q[j];if(GIST40.t<q.at)continue;Q.splice(j,1);j--;const c=kidChild40(q.who);if(c&&!kidAway40(c)&&typeof bubble40==='function')bubble40(q.text,GIST40.KIDS.ms,c.g,GIST40.KIDS.bubbleY);}}
// the state, four times a second: the exit, the afternoon drop, the asking, the world
function kidCheck40(){const Gs=GIST40;Gs.cost.checks++;if(!gistLive40())return;const b=gistB40();
 if(!b||gistOnline40()){if(Gs.world.thing||Gs.world.glint)kidTeardown40();return;}
 const F=kidFb40();if(!F){if(Gs.world.thing)kidTeardown40();return;}const K=Gs.KIDS;
 // the exit after a match the household played: the first check that finds a child leaving or fading (each spawn of the children once), recorded
 // whatever the gist or a panel is doing (repair, H2: one player home and the other at the pitch, the children leave during the gist); the thing
 // drops at the first check after the gist and with no panel open
 if(F.kids&&Gs.mem.exitOf!==F.kids&&['kemi','emeka'].some(k=>F.kids[k]&&(F.kids[k].mode==='leave'||F.kids[k].mode==='fadeout'))){Gs.mem.exitOf=F.kids;
  if(!(kidSat40(S.day)&&S.time<K.satDrop))Gs.mem.exitDay=S.day;}
 if(!gistOverlay40()&&!gistInGist40()){
  if(Gs.mem.exitDay){const d=Gs.mem.exitDay;Gs.mem.exitDay=0;if(d===S.day&&kidDay40(S.day,false))kidDrop40('exit');}
  // a morning-match day: a match played before 14:00 (seen by a check before then), and at 14:00 a child loses a thing in the children's own
  // afternoon play (they are out until 18:30)
  if(kidSat40(S.day)&&S.time<K.satDrop&&gistReal40(S.day))Gs.mem.satMorning=S.day;
  if(kidSat40(S.day)&&S.time>=K.satDrop&&S.time<K.satTo&&Gs.mem.aftDay!==S.day){Gs.mem.aftDay=S.day;if(Gs.mem.satMorning===S.day&&kidDay40(S.day,true))kidDrop40('afternoon');}
  // a thing lost on an earlier day and not yet back: the child asks once at the pitch, when the children are out
  const k=b.kid,sh=Gs.mem.shout;
  // the call nobody heard at the drop: made when a player comes within 20 m of the child that day; the household has heard it then
  if(sh){if(sh.day!==S.day||!k||k.state!=='lost'||k.day!==sh.day||k.heard)Gs.mem.shout=null;
   else{const c=kidChild40(sh.who);if(c&&kidHumansNear40(c.g.position.x,c.g.position.z,K.heard)){Gs.mem.shout=null;k.heard=true;if(typeof bubble40==='function')bubble40(sh.text,K.ms,c.g,K.bubbleY);gistSaveNow40();}}}
  // the child's ask, heard: Today tells the household where the thing is (fix round, S6)
  if(k&&(k.state==='lost'||k.state==='hand')&&k.day<S.day&&!k.asked&&F.kids&&(F.state==='idle'||F.state==='ended')){const c=kidChild40(k.who);
   if(c&&!kidAway40(c)&&kidHumansNear40(c.g.position.x,c.g.position.z,K.heard)){k.asked=S.day;k.heard=true;const it=kidItem40(k.id);if(typeof bubble40==='function')bubble40(gistFill40(Gs.LINES.kid.ask[k.who][1],{thing:it.name}),K.ms,c.g,K.bubbleY);gistSaveNow40();}}}
 kidSync40();}
// the prompts (a HOTSPOT_HOOKS entry, after v39's): pick at 1.3 m (lead 0.25); give to the child at 1.8 m (lead 0.5: v39's bag first, Play
// after); Emeka's to Mama Nkechi at 1.8 m (lead 1.05: v38's give, the pot and the card thing win a tie). Nothing for the AI player.
function kidHot40(i,list,d){if(!list||!GIST40.on)return null;const p=typeof players!=='undefined'?players[i]:null;if(!p||gistIsAI40(i)||(p.y||0)>1||p.g.sitting)return null;
 const b=gistB40();if(!b||!b.kid||gistOnline40())return null;const k=b.kid,K=GIST40.KIDS,U=GIST40.UI,it=kidItem40(k.id);if(!it)return null;
 if(k.state==='lost'&&GIST40.world.thing){const dd=d(k.spot[0],k.spot[1]);if(dd<K.pick)list.push({id:'kid40pick',label:gistFill40(U.pick,{label:it.pickLabel}),dist:dd-K.pickLead});}
 if(k.state==='hand'){const F=kidFb40();
  if(F&&F.kids&&(F.state==='idle'||F.state==='ended')){const c=kidChild40(k.who);if(c&&!kidAway40(c)){const dd=d(c.g.position.x,c.g.position.z);if(dd<K.reach)list.push({id:'kid40give',label:gistFill40(U.give,{child:gistNm40(k.who),pron:gistPron40(k.who),name:it.name}),dist:dd-K.lead});}}
  if(k.who==='emeka'){const n=typeof found38Npc==='function'?found38Npc('nkechi'):null;if(n){const dd=d(n.g.position.x,n.g.position.z);if(dd<K.reach)list.push({id:'kid40shop',label:gistFill40(U.shop,{name:it.name}),dist:dd-K.shopLead});}}}
 return null;}
function kidPick40(i){const Gs=GIST40,b=gistRec40(),k=b&&b.kid;if(!k||k.state!=='lost'||!Gs.world.thing)return;const it=kidItem40(k.id);
 k.state='hand';k.by=i;kidSync40();const T=kidSat40(S.day)&&typeof S.time==='number'&&S.time<Gs.KIDS.satTo?Gs.UI.pickToastSat:Gs.UI.pickToast;gistToast40(gistFill40(T[k.who],{name:it.name}));
 try{if(typeof playPick==='function'&&players[i])playPick(players[i].g);}catch(e){}
 try{if(typeof chime40==='function')chime40('kid');}catch(e){}
 gistLog40('kid','pick '+k.id);gistSaveNow40();}
// to the child: their thanks as a bubble, then the play line (a line only: football's kick-off is never changed); no friendship, no money
function kidGive40(i){const Gs=GIST40,b=gistRec40(),k=b&&b.kid;if(!k||k.state!=='hand')return;const c=kidChild40(k.who);if(!c||kidAway40(c))return;const L=Gs.LINES.kid;
 k.state='back';k.backDay=S.day;k.to=k.who;if(typeof bubble40==='function')bubble40(L.ty[k.id][1],Gs.KIDS.ms,c.g,Gs.KIDS.bubbleY);Gs.queue.push({at:Gs.t+Gs.KIDS.ms/1000,who:k.who,text:L.play[k.who][1]});
 gistLog40('kid','back '+k.id);gistSaveNow40();}
// Emeka's to Mama Nkechi at her shop: her loving scold and thanks (her "again" line from the second time), friendship +1
// (repair, VC-6) Mama Nkechi's first line for Emeka's thing: the marble's "His feet came home…" only once he has gone home; while he is still out
// at the pitch, the line that fits that (pure)
function kidNkFirst40(id){const L=GIST40.LINES.kid.nkechi;if(id==='marble'){const c=kidChild40('emeka');if(c&&!kidAway40(c))return L.marbleOut;}return L[id];}
function kidShop40(i){const Gs=GIST40,b=gistRec40(),k=b&&b.kid;if(!k||k.state!=='hand'||k.who!=='emeka')return;if(!(typeof found38Npc==='function'&&found38Npc('nkechi')))return;
 const L=Gs.LINES.kid.nkechi,it=kidItem40(k.id),again=(b.kids.nk|0)>0;k.state='back';k.backDay=S.day;k.to='nkechi';b.kids.nk=(b.kids.nk|0)+1;
 try{aff('nkechi',1);}catch(e){}gistLog40('kid','back '+k.id);gistSaveNow40();
 const first=again?gistFill40(L.again[1],{thing:it.name}):kidNkFirst40(k.id)[1];
 try{openPanel(`<section class="gist40-panel gist40-nkechi"><p class="gist40-kicker">${esc(Gs.UI.kicker)}</p><h2>${esc(gistNm40('nkechi'))}</h2><div class="gist40-thanks">${say('nkechi',esc(first))}${say('nkechi',esc(L.close[1]))}</div><div class="actions">${btn(esc(Gs.UI.close),'kid40Close',{},'primary block')}</div></section>`);}catch(e){}}
function kidAct40(i,kind){if(kind!=='kid40pick'&&kind!=='kid40give'&&kind!=='kid40shop')return false;if(gistOnline40()||gistIsAI40(i))return true;
 if(kind==='kid40shop'&&typeof foundGuard38==='function')foundGuard38();
 if(kind==='kid40pick')kidPick40(i);else if(kind==='kid40give')kidGive40(i);else kidShop40(i);return true;}
// Today's children's line, for the integrator's v40 block outside the gist card (spec §14.1): {html} or null
function kid40Today(){try{const b=gistB40();if(!b||!b.kid||gistOnline40()||!gistLive40())return null;const k=b.kid,U=GIST40.UI,it=kidItem40(k.id);if(!it||k.state!=='lost')return null;
 const v={child:gistNm40(k.who),pron:gistPron40(k.who),name:it.name};
 if(k.at==='afternoon'&&k.day===S.day&&S.time>=GIST40.KIDS.satDrop)return {html:esc(gistFill40(U.todayAft,v))};
 if(!(k.heard||k.told))return null;return {html:esc(gistFill40(k.day===S.day?U.todayHeard:U.todayStill,v))};}catch(e){return null;}}
// the child's thing in the hand, for the gist card's hand row: {who, text, where} or null
GIST40.kidHand=function(){const b=gistB40();const k=b&&b.kid;if(!k||k.state!=='hand')return null;const it=kidItem40(k.id);if(!it)return null;
 return {who:k.who,text:gistNm40(k.who)+'’s '+it.name,where:GIST40.UI.where[k.who],kind:'kid'};};

/* ======================================================================================================================================
   4. The plan wrapper, pure (spec §8, §9): the children's mention, the line about today (the match, a card thing's return, the errand's
   mention, a season line), the transition tip, the repeat guard. Works on copies of the script v39's wrapper returns; writes nothing.
   Every v40 entry carries v40k and id equal to it, k, never cat, today or v39; a tip carries tip:1 (a transition tip trans:1), information
   info:1; an entry in place of a v38 entry carries swap40:{cat,id}, the replaced entry's.
   ====================================================================================================================================== */
// a line heard within the last thirteen evenings (before today)
function gistHeard40(b,id){const h=b&&b.heard?b.heard[id]:undefined;return typeof h==='number'&&h<S.day&&S.day-h<=GIST40.HEARD_NIGHTS;}
// the facts of today's match, from the saved record only (never F.stats, never the keke count)
function matchFacts40(){const L=gistFb40(),l=L&&L.last;if(!l||l.day!==S.day||typeof l.result!=='string'||!Array.isArray(l.scorers))return null;
 const n={};let og=false;for(const s of l.scorers){const x=String(s);if(/:og$/.test(x)){if(/^(p0|p1|ai)/.test(x))og=true;continue;}n[x]=(n[x]|0)+1;}
 const top=k=>(n[k]|0)>0&&Object.keys(n).every(o=>o===k||(n[o]|0)<(n[k]|0));const se=gistSeason40(S.day);
 return {won:l.result==='won',lost:l.result==='lost',unf:l.result!=='won'&&l.result!=='lost',last:!!l.last&&l.result!=='unfinished',called:!!l.called,
  kemi:top('kemi'),emeka:top('emeka'),og,first:!!(L.firsts&&L.firsts.win===S.day),rain:gistRained40(),dry:se==='dry',harm:se==='harmattan',any:true,
  wet:gistWet40(),aft:gistEnd40()!==null&&gistEnd40()>=12,nopic:!(L.firsts&&(L.firsts.win===S.day||L.firsts.last===S.day))};}
function matchOK40(f,facts){return String(facts).split('+').every(k=>!!f[k]);}
// the match line (§9.3): Mr. Bassey if a guest with an eligible line; else the other guest with one (never a guest v39 thanked tonight); else a
// general line by guests[1] (never Mr. Bassey, who watched from the touchline: repair 5); else none. Eligible: its facts hold, not heard within thirteen evenings, not already in tonight's script.
function matchLine40(b,p,sc,used){const f=matchFacts40();if(!f)return null;const L=GIST40.LINES.fb,day=S.day;
 const thanked=k=>sc.some(s=>s.k===k&&s.open&&s.once&&/^thank39:/.test(String(s.once)));
 const pick=(list,salt)=>{const ok=(list||[]).filter(e=>matchOK40(f,e[1])&&!gistHeard40(b,e[0])&&!used.has(e[0]));if(!ok.length)return null;return ok[gistH40(day,48,salt)%ok.length];};
 const order=p.guests.includes('bassey')?['bassey'].concat(p.guests.filter(k=>k!=='bassey')):p.guests.slice();
 for(const k of order){if(thanked(k))continue;const e=pick(L[k],k.length);if(e)return {k,id:e[0],v40k:e[0],text:e[2],info:1};}
 const e=p.guests[1]!=='bassey'?pick(L.g,9):null;if(e)return {k:p.guests[1],id:e[0],v40k:e[0],text:e[2],info:1};return null;}
// the lines of one speaker for one thing: the first not heard within thirteen evenings, else the one heard longest ago
function twoOf40(b,two){if(!two)return null;for(const e of two)if(!gistHeard40(b,e[0]))return e;let o=two[0];for(const e of two)if(((b.heard||{})[e[0]]|0)<((b.heard||{})[o[0]]|0))o=e;return o;}
// the children's mention (§9.2): the evening the thing was lost, by the fond adult when a guest; a tip while it is out, thanks once it is back
function kidMention40(b,p){const k=b.kid;if(!k||k.day!==S.day)return null;const who=GIST40.KIDS.fond[k.who];if(!p.guests.includes(who))return null;const M=GIST40.LINES.kid.mention[k.id];if(!M)return null;
 if(k.state==='lost')return {k:who,id:M.out[0],v40k:M.out[0],text:M.out[1],tip:1,kid40:'out'};
 if(k.state==='back'&&k.backDay===S.day)return {k:who,id:M.back[0],v40k:M.back[0],text:M.back[1],info:1,kid40:'back'};return null;}
// a card thing given back today by its owner, when a guest (§9.3 (3))
function cardLine40(b,p){if(typeof board40Returned!=='function')return null;let r=[];try{r=board40Returned(S.day)||[];}catch(e){return null;}
 for(const x of r){if(!p.guests.includes(x.owner))continue;const e=twoOf40(b,GIST40.LINES.ret[x.owner]);if(!e)continue;let thing=x.id;
  try{const th=typeof cardThing40==='function'?cardThing40(x.id,0):null;if(th&&th.name)thing=th.name;}catch(er){}
  return {k:x.owner,id:e[0],v40k:e[0],text:gistFill40(e[1],{thing}),info:1};}return null;}
// the errand's mention (§6.1): today's errand given, its receiver a guest (information, never swapped)
function errandLine40(b,p){if(typeof board40Errand!=='function')return null;let er=null;try{er=board40Errand(S.day);}catch(e){return null;}
 if(!er||er.state!=='given'||!p.guests.includes(er.receiver))return null;const e=twoOf40(b,GIST40.LINES.er[er.pair]);if(!e)return null;
 return {k:er.receiver,id:e[0],v40k:e[0],text:e[1],info:1,errand40:er.pair};}
// the season lines a speaker may say tonight in a role ('open', 'bye', 'today', 'any'): this season's, gated on today's rain
function seasonPool40(k,role){const se=gistSeason40(S.day),rain=gistRained40(),dry=gistNoRain40();
 return (GIST40.LINES.se[k]||[]).filter(e=>e[1]===se&&(String(e[2]).split('+').includes(role)||(role!=='open'&&role!=='bye'&&String(e[2]).split('+').includes('any')))&&(!e[4]||(e[4]==='rain'?rain:e[4]==='norain'?dry:false)));}
// one line of a speaker's season pool for a role (§9.5 step 2), unheard and unused, by the day's hash
function seasonLine40(b,k,role,used){const ok=seasonPool40(k,role).filter(e=>!gistHeard40(b,e[0])&&!used.has(e[0]));if(!ok.length)return null;return ok[gistH40(S.day,46,k.length+role.length)%ok.length];}
function mallamSeated40(){try{return typeof MALLAM40!=='undefined'&&!!MALLAM40&&!!MALLAM40.SEAT_AT_GIST&&typeof mallamTonight40==='function'&&!!mallamTonight40().on;}catch(e){return false;}}
// tonight he sits by his grill and the household fanned his coals or tasted the first stick (pure)
function mallamNight40(){try{if(!mallamSeated40())return false;const t=mallamTonight40();return !!(t.fanned||t.tasted);}catch(e){return false;}}
const MALLAMBYE40=/^gs40-ev-..-b2$/;
// a Mallam goodbye heard within the last three evenings (they come at most once in four)
function mallamByeRecent40(b){return Object.keys((b&&b.heard)||{}).some(id=>MALLAMBYE40.test(id)&&b.heard[id]<S.day&&S.day-b.heard[id]<GIST40.MALLAM_EVERY);}
function evergreen40(b,k,role,used){const E=GIST40.LINES.ev[k];if(!E)return null;const list=(role==='open'?E.open:role==='bye'?E.bye:(E.any||[])).filter(e=>e[2]!=='mallam'||(mallamSeated40()&&!mallamByeRecent40(b)));
 const ok=list.filter(e=>!gistHeard40(b,e[0])&&!used.has(e[0]));if(!ok.length)return null;return ok[gistH40(S.day,49,k.length)%ok.length];}
// v38's list for a category (the done wrapper's booking reads the same)
function v38List40(cat,k){const L=GIST38.LINES;return cat.startsWith('o:')?L.o[k]:cat.startsWith('pl:')?L.plain[k]:cat.startsWith('re:')?L.react[k]:L.bye[k];}
function benchOn40(){try{return typeof gistBenchPlaced38==='function'&&gistBenchPlaced38();}catch(e){return false;}}
// the repeat guard's replacement for a v38 entry s (§9.5): another v38 line of the speaker and category, unheard (an unsaid one first); a
// season line of the role; an evergreen line of the role; else null (the original stays)
function guardFor40(b,G,s,used,force){const cat=s.cat,k=s.k,role=cat.startsWith('o:')?'open':cat.startsWith('by:')?'bye':'any';
 const said=G&&G.said&&Array.isArray(G.said[cat])?G.said[cat]:[];
 const list=(v38List40(cat,k)||[]).filter(e=>e[0]!==s.id&&!GIST40.NEVER.includes(e[0])&&e[0]!==GIST40.KNEES&&(e[2]!=='bench'||benchOn40())&&!gistHeard40(b,e[0])&&!used.has(e[0]));
 const tier1=list.filter(e=>!said.includes(e[0])).length?list.filter(e=>!said.includes(e[0])):list;
 const base={k,swap40:{cat,id:s.id}};if(s.open)base.open=1;
 if(tier1.length){const e=tier1[gistH40(S.day,46,k.length,cat.length)%tier1.length];return Object.assign(base,{id:e[0],text:e[1],cat,g40:1,g40t:'v38'});}
 const se=seasonLine40(b,k,role,used);if(se)return Object.assign(base,{id:se[0],v40k:se[0],text:se[3],g40t:'season'});
 const ev=evergreen40(b,k,role,used);if(ev)return Object.assign(base,{id:ev[0],v40k:ev[0],text:ev[1],g40t:'evergreen'});
 if(force){const any=(v38List40(cat,k)||[]).filter(e=>e[0]!==s.id&&!GIST40.NEVER.includes(e[0])&&e[0]!==GIST40.KNEES&&!used.has(e[0]));
  if(any.length)return Object.assign(base,{id:any[0][0],text:any[0][1],cat,g40:1,g40t:'v38'});}
 return null;}
// the night v38's once-only football line is due (G.once.fb37 unset, Mama Nkechi a guest, a match today or yesterday, its evening line not
// yet said today, not the first gist): v40 leaves the whole night alone, or there would be two match lines (spec §9.1 step 2)
function fbDueNight40(G,p){if(p.first||!G||(G.once&&G.once.fb37)||!p.guests.includes('nkechi'))return false;const L=gistFb40();if(!L||!L.last)return false;
 if(!(L.last.day===S.day||L.last.day===S.day-1))return false;return L.eveDay!==S.day;}
function gistPlan40(p){if(!GIST40.on||!p||!Array.isArray(p.script)||!Array.isArray(p.guests)||p.guests.length<2||gistOnline40())return null;
 const b=gistB40();if(!b)return null;const G=typeof gistSaveG38==='function'&&S.life&&S.life.gist38?S.life.gist38:null;if(!G)return null;
 if(fbDueNight40(G,p))return null;
 const sc=p.script.map(s=>Object.assign({},s));sc.g39=p.script.g39;const meta={swaps:[],kept:[],inserted:null,moved:null,today:null,trans:null,len0:p.script.length};
 const used=new Set(sc.map(s=>s.id));let inserts=0;const len0=sc.length;
 const gb=()=>{let j=-1;for(let q=sc.length-1;q>=0;q--)if(sc[q].cat&&String(sc[q].cat).startsWith('by:')){j=q;break;}return j>=0?j:sc.length;};
 const insert=e=>{if(inserts>=GIST40.MAX_INSERT||len0>=GIST40.MAX_LINES)return false;sc.splice(gb(),0,e);inserts++;used.add(e.id);meta.inserted=e.id;return true;};
 // a free reaction: a re: entry v39's treat line did not take (v39 replaces the treat's reaction with an entry without cat)
 const freeRe=()=>sc.findIndex((s,q)=>q>=2&&s.cat&&String(s.cat).startsWith('re:')&&!s.g40&&!s.v40k);
 let moves=0;const toRe=e=>{if(moves>0)return false;const r=freeRe();if(r<0)return false;const old=sc[r];sc[r]=Object.assign(e,{swap40:{cat:old.cat,id:old.id}});used.add(e.id);moves++;meta.moved=e.id;return true;};
 // the slot of the line about today: replaceable when its kind is repeatable (never a first-time retelling)
 const ti=sc.findIndex(s=>s.today);const slot=ti>=0&&(GIST40.REPEATABLE.includes(sc[ti].id)||GIST40.REPEATABLE.includes(String(sc[ti].today)))&&!sc[ti].v39k?ti:-1;
 let slotFree=slot>=0;const toSlot=e=>{if(!slotFree)return false;sc[slot]=e;used.add(e.id);slotFree=false;meta.today=e.id;return true;};
 // 1. the transition tip, the evening before a season changes (§9.4), placed before the line about today (fix round 2: a promise that comes true
 // in the Menu and the sky the next morning is never crowded out by information): a free reaction, a season line, else the night's insert,
 // else a teller's greeting (the first teller in TRANS_BY order whose greeting is not once-only, v39's or the stool button's)
 const transTip40=()=>{const se1=gistSeason40(S.day+1);
 if(se1!==gistSeason40(S.day)&&GIST40.LINES.tr[se1]){const T=GIST40.LINES.tr[se1],tl=GIST40.TRANS_BY[se1].filter(k=>p.guests.includes(k)&&T[k]),who=tl.find(k=>!gistHeard40(b,T[k][0][0])&&!gistHeard40(b,T[k][1][0]))||tl[0];
  if(who){const e={k:who,id:T[who][0][0],v40k:T[who][0][0],text:T[who][0][1],tip:1,trans:1};let put=null;
   const r=freeRe();if(r>=0){const old=sc[r];sc[r]=Object.assign(e,{swap40:{cat:old.cat,id:old.id}});put=e;}
   if(!put){const q=sc.findIndex((s,j)=>j>=2&&s.v40k&&!s.info&&!s.tip&&!s.trans&&/^gs40-se-/.test(s.v40k));if(q>=0){sc[q]=e;put=e;}}
   if(!put&&insert(e))put=e;
   if(!put)for(const k of [who].concat(tl.filter(x=>x!==who))){const j=sc.findIndex(s=>s.k===k&&s.open&&!s.once&&!s.v39k&&!s.stoolBtn);if(j<0)continue;
    const old=sc[j],g={k,id:T[k][1][0],v40k:T[k][1][0],text:T[k][1][1],open:1,tip:1,trans:1};if(old.cat)g.swap40={cat:old.cat,id:old.id};sc[j]=g;put=g;break;}
   if(put){used.add(e.id);used.add(put.id);meta.trans=put.id;}}}};
 transTip40();
 // 2. the children's mention (§9.2), after the tip (repair, VP-1b: the tip is a promise the next morning keeps; the mention is information the
 // Today page carries when the drop was heard): the slot, else the night's insert, else a free reaction; otherwise not said that night
 const km=kidMention40(b,p);if(km&&!toSlot(km))insert(km)||toRe(km);
 // 3. the line about today: the match, a card thing's return, the errand's mention, in the spec's order (§9.3), in the room the tip left. Each
 // that loses the slot takes a free reaction (at most one move a night), else the night's one insert if it is still free: the match line has the
 // first claim on it (fix round, S5); a line that finds no room is not said that night (on a change evening the match line may go unsaid)
 for(const [fn,mayInsert] of [[()=>matchLine40(b,p,sc,used),true],[()=>cardLine40(b,p),true],[()=>errandLine40(b,p),true]]){const e=fn();if(!e||used.has(e.id))continue;if(toSlot(e))continue;if(toRe(e))continue;if(mayInsert)insert(e);}
 // 3 (5). a season "today" line, only when the slot's line was heard within thirteen evenings
 if(slotFree&&gistHeard40(b,sc[slot].id)){const k=sc[slot].k,e=seasonLine40(b,k,'today',used);if(e)toSlot({k,id:e[0],v40k:e[0],text:e[3]});else{const v=evergreen40(b,k,'today',used);if(v)toSlot({k,id:v[0],v40k:v[0],text:v[1]});}}
 // 3b. (fix round, S4) Mallam by his grill tonight and the household fanned or tasted: the last plain v38 goodbye of a guest who has a Mallam
 // goodbye gives way to it (owner decision 3, "he stays by his grill during the gist"), at most once in four evenings, each never twice within
 // fourteen; booked through swap40, so v38's rotation still moves
 if(mallamNight40()&&!mallamByeRecent40(b)){
  for(let j=sc.length-1;j>=0;j--){const s=sc[j];if(!s||!s.cat||!String(s.cat).startsWith('by:')||s.g40||s.v40k||s.once||s.v39k||s.tip||s.info||s.stoolBtn)continue;
   const E=GIST40.LINES.ev[s.k],e=E&&E.bye.find(x=>x[2]==='mallam');if(!e||gistHeard40(b,e[0])||used.has(e[0]))continue;
   sc[j]={k:s.k,id:e[0],v40k:e[0],text:e[1],swap40:{cat:s.cat,id:s.id},g40t:'mallam'};used.add(e[0]);meta.swaps.push([String(s.cat),s.id,e[0],'mallam']);meta.mallam=e[0];break;}}
 // 4. the repeat guard: greetings, goodbyes, reactions and plain lines heard within thirteen evenings; the knees line outside the rains always
 for(let j=0;j<sc.length;j++){const s=sc[j];if(!s||!s.cat||s.g40||s.v40k||s.once||s.v39k||s.tip||s.info||s.stoolBtn||GIST40.NEVER.includes(s.id))continue;
  const c=String(s.cat);if(!/^(o:|by:|re:|pl:)/.test(c))continue;const knees=s.id===GIST40.KNEES&&gistSeason40(S.day)!=='rains';
  if(!knees&&!gistHeard40(b,s.id))continue;const r=guardFor40(b,G,s,used,knees);
  if(r){sc[j]=r;used.add(r.id);meta.swaps.push([c,s.id,r.id,r.g40t]);}else meta.kept.push([c,s.id]);}
 // 5. (cut item 3, built) the season wordings for v39's pot ask and the again tip: only the text and the id change, every other field is kept
 // (v39's done wrapper books the pot from the entry's fields; v38 books the tip from the plan's tips), and only when the v39 line was heard
 // within thirteen evenings
 // (fix round, DOD-F4 and S11) the same for v38's Ada's ask, v38's wash tip and v39's "Aunty Bisi passes tomorrow", and a second pot wording: the
 // first wording not heard within thirteen evenings (this season's first), every other field kept
 // (repair 5) the again tip, the pot ask and Ada's ask speak of tomorrow: their season wordings only when tomorrow's season (season(S.day+1)) is
 // today's, so none says "this heat" on a rainy evening or "wet wood" in harmattan; on the evening before a change, the season-free wording
 const se0=gistSeason40(S.day),seT=gistSeason40(S.day+1)===se0?se0:null,L5=GIST40.LINES,fresh=e=>!!e&&!gistHeard40(b,e[0])&&!used.has(e[0]),inSe=x=>String(x).split('+').includes(se0);
 const alt=(j,s,e,text,kind,extra)=>{sc[j]=Object.assign({},s,{id:e[0],text},extra);used.add(e[0]);meta.swaps.push([kind,s.id,e[0],'season']);};
 for(let j=0;j<sc.length;j++){const s=sc[j];if(!s||s.v40k||s.g40pot||s.g40info||!gistHeard40(b,s.id))continue;const sid=String(s.id);
  if(s.v39k==='potask'&&s.pot){const c=[seT&&L5.pot[s.k]&&L5.pot[s.k][seT],L5.pot2[s.k]].filter(fresh);
   if(c.length&&typeof potSay39==='function')alt(j,s,c[0],potSay39(c[0][1],s.pot.n),'pot',{g40pot:1});}
  else if(s.tip&&/^gs39-again-/.test(sid)){const t=(p.tips||[]).find(x=>x.kind==='lost'&&x.owner===s.k),c=[seT&&L5.againSe[s.k]&&L5.againSe[s.k][seT],L5.again[s.k]].filter(fresh);
   if(t&&c.length){const A=c[0];let thing=t.arg;try{if(typeof againNoun39==='function')thing=againNoun39(t.arg);}catch(e){}
    sc[j]={k:s.k,id:A[0],v40k:A[0],text:gistFill40(A[1],{thing}),tip:1};used.add(A[0]);meta.swaps.push(['again',sid,A[0],'season']);}}
  else if(s.carve&&s.k==='ada'&&/^gs38-ask-/.test(sid)){const c=(!seT?[]:s.carve==='catfish'?[L5.ask.cat[seT]]:(L5.ask.day[seT]||[])).filter(fresh);
   let fish=s.carve;try{fish=FOUND38.SPEECH.fishSay[s.carve]||s.carve;}catch(e){}if(c.length)alt(j,s,c[0],gistFill40(c[0][1],{thing:fish}),'ask',{g40info:1});}
  else if(s.tip&&/^gs38-wash-/.test(sid)){const c=(L5.wash[s.k]||[]).filter(e=>inSe(e[1])&&fresh(e));if(c.length)alt(j,s,c[0],c[0][2],'wash',{g40info:1});}
  else if(s.v39k==='bisitom'){const c=L5.tom.filter(e=>inSe(e[1])&&fresh(e));if(c.length)alt(j,s,c[0],c[0][2],'tom',{g40info:1});}}
 sc.g40=meta;
 return Object.assign({},p,{guests:p.guests.slice(),script:sc});}
if(GIST40.on&&typeof gistPlan38==='function'){const prevPlan40=gistPlan38;
 gistPlan38=function(){                                                          // v40: the evening's words on top of v39's plan (pure)
  const p=prevPlan40.apply(this,arguments);try{const q=gistPlan40(p);return q||p;}catch(e){if(typeof console!=='undefined')console.warn('gist40 plan',e);return p;}};}

/* ======================================================================================================================================
   5. After the gist (gistDone38, outermost): the swap40 booking into v38's said lists, the heard record, v40's said list, the children's
   mention told; one save (the earlier wrappers' saves are held and made once, after these). Nothing for a gist aborted before Goodnight.
   ====================================================================================================================================== */
// v38's own booking rule for one id in a category (gist-v38.js gistDone38): a list that already covers the category starts again; no duplicate
function swapBook40(G,cat,k,id){const list=v38List40(cat,k);if(!list)return;let a=Array.isArray(G.said[cat])?G.said[cat]:[];
 if(a.length>=list.length||list.every(e=>a.includes(e[0])||e[0]===id))a=[];if(!a.includes(id))a.push(id);G.said[cat]=a;}
if(GIST40.on&&typeof gistDone38==='function'){const prevDone40=gistDone38;gistDone38=function(v){
 const b=gistB40();if(!b||!v||!Array.isArray(v.script))return prevDone40.apply(this,arguments);
 const sv=save;let saved=0;save=function(){saved++;};let r;try{r=prevDone40.apply(this,arguments);}finally{save=sv;}
 try{const E=typeof EVENING35!=='undefined'?EVENING35:null,shown=(E&&Array.isArray(E.lines)?E.lines:[]).map(l=>l.id||null),G=S.life.gist38;
  if(G&&G.said&&typeof G.said==='object'){
   v.script.forEach((s,k)=>{if(!s||shown[k]!==s.id)return;
    if(s.swap40&&s.swap40.cat&&s.swap40.id)swapBook40(G,String(s.swap40.cat),s.k,s.swap40.id);
    if(s.v40k)b.said[s.v40k]=S.day;
    if(s.kid40&&b.kid&&b.kid.day===S.day){b.kid.told=S.day;b.kid.heard=true;}
    if(s.trans)b.once['trans:'+S.day]=s.v40k;
    if(s.errand40)b.once['errand:'+S.day]=s.errand40;});
   const ids=G.last&&G.last.day===S.day&&Array.isArray(G.last.ids)?G.last.ids:shown;
   for(const id of ids)if(id)b.heard[id]=S.day;
   for(const id in b.heard)if(!(S.day-b.heard[id]<GIST40.PRUNE))delete b.heard[id];
   for(const id in b.said)if(!(S.day-b.said[id]<GIST40.PRUNE))delete b.said[id];
   for(const k in b.once)if(/^(trans|errand):/.test(k)&&!(S.day-(+k.split(':')[1])<GIST40.PRUNE))delete b.once[k];
   if(v.script.g40&&v.script.g40.swaps.length)GIST40.mem.lastSwap=v.script.g40.swaps[v.script.g40.swaps.length-1].slice();
   saved++;}}
 catch(e){if(typeof console!=='undefined')console.warn('gist40 done',e);}
 if(saved)gistSaveNow40();return r;};}

/* ======================================================================================================================================
   6. Today (spec §14.1): the gist card's rows, outermost. The hand (the card thing, the parcel, the child's thing) folded into v38's pocket row;
   with no pocket row, its own row, with v40 redoing the cap and Aunty Bisi's fold. Never dropped: pocket, lost, wash, pot, bisi, hand.
   ====================================================================================================================================== */
function handItems40(){const out=[];try{if(typeof board40Hand==='function')for(const h of board40Hand()||[])out.push(h);}catch(e){}const k=GIST40.kidHand();if(k)out.push(k);return out;}
function handText40(items){return items.map(h=>{let w=String(h.where||'').replace(/\.$/,'');if(/^(He|She) /.test(w))w=gistLow40(w);return h.text+(w?' ('+w+')':'');}).join('; ');}
function todayRows40(rows){if(!Array.isArray(rows))return rows;const items=handItems40();if(!items.length)return rows;const U=GIST40.UI,list=handText40(items);rows=rows.slice();
 const pi=rows.findIndex(r=>r.k==='pocket');
 if(pi>=0){rows[pi]=Object.assign({},rows[pi],{html:rows[pi].html+' '+esc(gistFill40(U.handAlso,{list}))});return rows;}
 const lost=rows.findIndex(r=>r.k==='lost');rows.splice(lost>=0?lost+1:0,0,{k:'hand',html:esc(gistFill40(U.handRow,{list}))});
 const cap=(typeof innerWidth==='number'&&innerWidth<=480)?4:5;
 for(const k of ['wait','shelf','carve'])while(rows.length>cap){const i=rows.findIndex(r=>r.k===k);if(i<0)break;rows.splice(i,1);}
 if(rows.length>cap){const bi=rows.findIndex(r=>r.k==='bisi');let br=null;try{br=typeof bisiRow39==='function'?bisiRow39():null;}catch(e){}
  if(bi>0&&br){rows.splice(bi,1);const h=rows[bi-1];rows[bi-1]=Object.assign({},h,{html:h.html+' '+br.html,btn:(h.btn||'')+(br.btn||'')});}}
 return rows;}
if(GIST40.on&&typeof gistTodayRows38==='function'){const prevRows40=gistTodayRows38;gistTodayRows38=function(G){const rows=prevRows40.apply(this,arguments);
 try{if(!gistB40()||gistOnline40())return rows;return todayRows40(rows);}catch(e){if(typeof console!=='undefined')console.warn('gist40 today',e);return rows;}};}
// the recap after a gist (§14.2): one clause for a thing given back today (a child's, a card thing, the errand), after v40 discovery only
if(GIST40.on&&typeof gistRecapHTML38==='function'){const prevRecap40=gistRecapHTML38;gistRecapHTML38=function(){const h=prevRecap40.apply(this,arguments);
 try{const b=gistB40();if(!b||gistOnline40())return h;const U=GIST40.UI.recap,out=[];const k=b.kid;
  if(k&&k.state==='back'&&k.backDay===S.day){const it=kidItem40(k.id);if(it)out.push(gistFill40(U.kid,{child:gistNm40(k.who),pron:gistPron40(k.who),name:it.name}));}
  const G=S.life.gist38,b9=G&&G.b39,pt=b9&&b9.pot;
  if(pt&&pt.via==='gist'&&pt.said===S.day&&G.last&&G.last.day===S.day&&(G.last.ids||[]).some(id=>/^gs40-pot-/.test(id))&&typeof GIST39!=='undefined')out.push(gistFill40(GIST39.UI.recapPot,{owner:gistNm40(pt.who),n:['two','three'][pt.n-2]||'two'}));
  if(!out.length)return h;return h.replace(/<\/p><\/div>$/,' '+esc(out.join(' '))+'</p></div>');}catch(e){return h;}};}

/* ======================================================================================================================================
   7. The log kinds, the actions, the hooks, the per-frame step, the day, the world, a new household, the playtest flag
   ====================================================================================================================================== */
if(GIST40.on&&typeof LOG35!=='undefined'&&LOG35&&Array.isArray(LOG35.kinds))for(const k of ['board','kid','mallam'])if(!LOG35.kinds.includes(k))LOG35.kinds.push(k);
if(GIST40.on&&typeof ACTIONS!=='undefined'){ACTIONS.kid40Close=function(){try{closePanel();}catch(e){}gistSaveNow40();};
 if(typeof LOCAL_ONLY!=='undefined')LOCAL_ONLY.add('kid40Close');}
if(GIST40.on&&typeof HOTSPOT_HOOKS!=='undefined')HOTSPOT_HOOKS.push(kidHot40);
if(GIST40.on&&typeof ACT_HOOKS!=='undefined')ACT_HOOKS.push(function(i,kind,arg){return kidAct40(i,kind,arg);});
// the per-frame step: between checks only the glint and the queued bubbles move, and only while no panel is open; an inert frame (no G.b40)
// reads a few fields and returns
GIST40.step=function(dt,open){const Gs=GIST40;dt=Math.max(0,+dt||0);Gs.t+=dt;Gs.cost.steps++;
 if(open!==false&&!gistOverlay40()){if(Gs.world.glint)kidGlintFrame40();if(Gs.queue.length)kidQueue40();}
 if(Gs.t<Gs.checkAt)return;Gs.checkAt=Gs.t+0.25;kidCheck40();};
// (repair 5, R5-1) the hour today's match ended, read from football's own end event (football37On: a listener only; football's behaviour and
// results do not change), kept in v40's record after v40 discovery: b40.fbEnd={day,t}
if(GIST40.on&&typeof football37On==='function')football37On('end',function(){try{const b=gistB40();if(b&&!gistOnline40())b.fbEnd={day:S.day,t:S.time};}catch(e){}});
// the children's things run last (after the board 40a and Mallam 40m)
if(typeof EVENING35!=='undefined'&&EVENING35&&typeof EVENING35.tick==='function'&&typeof BOARD40!=='undefined'&&typeof GIST38!=='undefined'&&GIST40.on){
 const prevEveTick40b=EVENING35.tick;EVENING35.tick=function(dt){const r=prevEveTick40b.apply(this,arguments);
  try{GIST40.step(dt,arguments[1]);}catch(e){if(typeof console!=='undefined')console.warn('gist40',e);}return r;};}
// the morning: the queued bubbles go; the exit and afternoon marks are per day
if(GIST40.on&&typeof ACTIONS!=='undefined'&&typeof ACTIONS.nextday==='function'){const prevNextday40b=ACTIONS.nextday;ACTIONS.nextday=function(){
 try{GIST40.queue.length=0;GIST40.mem.exitOf=null;GIST40.mem.exitDay=0;GIST40.mem.shout=null;}catch(e){}const r=prevNextday40b.apply(this,arguments);try{GIST40.checkAt=0;}catch(e){}return r;};}
function gistFlags40(){const F=GIST40.flags;if(F.parsed)return F;F.parsed=true;let q='';try{q=typeof location!=='undefined'&&location?String(location.search||''):'';}catch(e){}
 const m=/[?&]gist40=([a-z]+)/.exec(q);let mem=false;try{mem=typeof sessionStorage!=='undefined'&&sessionStorage&&sessionStorage.getItem('gist40.flag.playtest')==='1';}catch(e){}
 if((m&&m[1]==='playtest')||mem){F.playtest=true;try{if(typeof sessionStorage!=='undefined'&&sessionStorage)sessionStorage.setItem('gist40.flag.playtest','1');}catch(e){}}return F;}
if(GIST40.on&&typeof enterWorld==='function'){const prevEnter40b=enterWorld;enterWorld=function(){try{gistFlags40();kidTeardown40();GIST40.queue.length=0;GIST40.mem.exitOf=null;GIST40.mem.exitDay=0;GIST40.mem.aftDay=0;GIST40.mem.shout=null;}catch(e){}
 const r=prevEnter40b.apply(this,arguments);try{GIST40.checkAt=0;}catch(e){}return r;};}
// (repair, H8) only the confirmed new household: the question itself ("No, keep it") changes nothing
if(GIST40.on&&typeof ACTIONS!=='undefined'){for(const n of ['newgame']){const prev=ACTIONS[n];if(typeof prev!=='function')continue;
 ACTIONS[n]=function(){try{kidTeardown40();GIST40.queue.length=0;GIST40.mem.exitOf=null;GIST40.mem.exitDay=0;GIST40.mem.aftDay=0;GIST40.mem.lastSwap=null;GIST40.mem.shout=null;}catch(e){}return prev.apply(this,arguments);};}}
