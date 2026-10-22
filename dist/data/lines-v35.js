/* v35 dialogue (LINES): talk lines for Tunde, Mama Nkechi and Ada keyed by day and game state, their veranda-evening lines,
   the short item names and the copy other v35 modules read through text35(). Selection is a pure function of the save
   (it never draws from the shared random seed), so both peers of an online household pick the same line. */

/* ---------- 5.1 The tables. Table order is priority: the first eligible line not yet heard today is said. ---------- */
const LINES35={
 tunde:[
  {id:'tu01',min:1,max:1,when:['first','seed-pending'],text:'Tunde. Sound for weddings, plants for my sanity. I have been looking at your veranda pot. It looks lonely.'},
  {id:'tu02',min:1,when:['first'],text:'Tunde. I do sound, and I look after every plant in this compound, whether it asks or not. Welcome to Palm Court.'},
  {id:'tu03',min:1,when:['ripe'],text:'Red peppers on your veranda. I walked past twice to be sure. Pick them before the birds hold a meeting about it.'},
  {id:'tu04',min:1,when:['harvested'],text:'You picked them. Good. Keep watering and the pot will fruit again. It is not a miracle, it is a habit.'},
  {id:'tu05',min:2,when:['grew','watered'],text:'Taller this morning, because somebody watered it. Water it again today and the peppers will turn. I am not guessing.'},
  {id:'tu06',min:1,when:['planted','watered'],text:'You watered the seedling. I saw the soil, dark the way it should be. That plant knows somebody cares.'},
  {id:'tu07',min:1,when:['req-ready','req-0'],text:'Somebody has been looking after that seedling. I can tell from here. Come, I have something for you.'},
  {id:'tu08',min:1,when:['seed-pending'],text:'The seedling is resting at my place tonight. Tomorrow morning it moves to your pot. Do not tell it, it gets nervous.'},
  {id:'tu09',min:1,when:['seed-ready'],text:'The seedling is by your pot. It will not plant itself. I asked it.'},
  {id:'tu10',min:2,max:2,when:['chair-veranda'],text:'An armchair out on the veranda with the pot. Now the plant has company. So do you.'},
  {id:'tu11',min:1,when:['fish-today'],text:'You smell faintly of the lagoon. Fishing? Wash your hands before you touch my seedlings. Joke. Half joke.'},
  {id:'tu12',min:1,when:['visit-today'],text:'Ada is on your veranda? Tell her the pot is mine in spirit. She will roll her eyes. That means she agrees.'},
  {id:'tu13',min:2,max:3,when:['planted'],text:'Morning water, evening patience. That is the whole secret of peppers. Mama Nkechi will say she taught me. She did not.'},
  {id:'tu14',min:4,max:6,when:['harvested-ever'],text:'Since your harvest I tell people your flat has green hands. Do not make me a liar. Keep the pot wet.'},
  {id:'tu15',min:3,max:6,when:['painted'],text:'New colour on your walls. Plants notice these things. Mine have started asking questions.'},
  {id:'tu16',min:4,max:6,when:['evening-done'],text:'Mama Nkechi is still talking about your veranda evening. She says you are good hosts. I said I trained you.'},
  {id:'tu17',min:2,when:['decorated'],text:'I saw the {item} through your door. Very nice. Is there room nearby for one more plant? I am only asking.'},
  {id:'tu18',min:4,when:['req-2'],text:'Give the spider plant a corner with light. It forgives everything else. Unlike me. Joke.'},
  {id:'tu19',min:4,when:['req-3'],text:'My plants ask about you. I told them you are reliable now. They believe nobody, so do not take it personally.'},
  {id:'tu20',min:1,max:1,when:['default'],text:'Moving day is hard on a sofa. Let it rest. Let yourselves rest too. The compound will still be here tomorrow.'},
  {id:'tu21',min:1,max:1,when:['default'],text:'If you hear a bass line at midnight, it is not me o. Usually. Sometimes I test equipment for an owambe.'},
  {id:'tu22',min:1,max:1,when:['default'],text:'Compound rule, which I invented: nobody borrows my extension box. Second rule: see the first rule.'},
  {id:'tu23',min:1,max:1,when:['default'],text:'Your veranda gets the morning light. I noticed before you moved in. That is why the pot is there.'},
  {id:'tu24',min:2,max:2,when:['default'],text:'I spent the morning untangling cables from a wedding. Plants are easier. They never ask for a louder song.'},
  {id:'tu25',min:2,max:2,when:['default'],text:'The rocks by the water are good for thinking. Also for fish, I am told. I mostly think.'},
  {id:'tu26',min:2,max:2,when:['default'],text:'If you see Mama Nkechi, tell her I paid. She will not believe you either, but tell her.'},
  {id:'tu27',min:2,max:2,when:['default'],text:'Morning light, a little water, no shouting. That is how I raise peppers. Also how I would raise children.'},
  {id:'tu28',min:3,max:3,when:['default'],text:'A good pepper plant is like a good speaker. Set it up properly once and it rewards you every day.'},
  {id:'tu29',min:3,max:3,when:['default'],text:'I tested a sound system by the lagoon this morning. The fish did not complain. Good fish.'},
  {id:'tu30',min:3,max:3,when:['default'],text:'Ada and I argued about wood again. I lost again. I am still preparing my comeback.'},
  {id:'tu31',min:3,max:3,when:['default'],text:'You already walk around like you live here. It took me a year. You are faster.'},
  {id:'tu32',min:4,max:4,when:['default'],text:'Market Road was loud this morning. I counted the speakers. Too many, all badly tuned. Nobody asked me.'},
  {id:'tu33',min:4,max:4,when:['default'],text:'Scent leaf would grow well beside your pepper. Just a thought. A strong thought.'},
  {id:'tu34',min:5,max:5,when:['default'],text:'I fixed a microphone for the church choir. They sang so well I nearly forgave them for the feedback.'},
  {id:'tu35',min:5,max:5,when:['default'],text:'Water early, before the sun gets serious. The plant drinks, you go about your day. Everybody wins.'},
  {id:'tu36',min:6,max:6,when:['default'],text:'A plant does not care how busy you are. That is what I like about plants. Not people. Plants.'},
  {id:'tu37',min:6,max:6,when:['default'],text:'Somebody left a radio playing in the courtyard all night. I fixed the tuning. You are welcome, compound.'},
  {id:'tu38',min:4,when:['default'],text:'The compound is quiet in a good way today. I can hear the water from my door.'},
  {id:'tu39',min:4,when:['default'],text:'Have you watered today? I always ask. It is a habit, like checking the cables before a show.'},
  {id:'tu40',min:4,when:['default'],text:'You know you are settled when the neighbours stop knocking and start calling up the stairs.'},
  {id:'tu41',min:7,when:['default'],text:'You are part of Palm Court now. Like the furniture. Good furniture. Ada approved it, so it must be true.'},
  {id:'tu42',min:7,when:['default'],text:'When I am old I will sit on your veranda and tell you how to water. Start getting used to it.'}
 ],
 nkechi:[
  {id:'nk01',min:1,when:['first'],text:'So you are the new people. I am Mama Nkechi, provisions, on Market Road. If you need it, I have it. If I do not, you do not need it.'},
  {id:'nk02',min:1,when:['req-done-today'],text:'Thank you again. Go and rest your legs. I have customers, and they have opinions.'},
  {id:'nk03',min:1,when:['fish-kept','req-0'],text:'You kept a fish for me? My dear, you have home training. Come, let me show you what one fish can do.'},
  {id:'nk04',min:1,when:['req-1','peppers'],text:'Two peppers? Bring them, my dear, before I start crying into my pot.'},
  {id:'nk05',min:1,when:['req-1','ripe'],text:'Tunde tells me your peppers are red. You know where my pot is. Two is all I ask.'},
  {id:'nk06',min:1,when:['req-1','grew'],text:'My pot is on the fire and my onions are chopped. When those peppers of yours turn red, you know where to find me.'},
  {id:'nk07',min:1,when:['req-0'],text:'The rocks are busy today, my dear. Everybody says the fish are fat. I am only reporting what I heard.'},
  {id:'nk08',min:1,when:['req-1'],text:'My stew is still waiting for its heat. Where the pepper comes from, I will not ask.'},
  {id:'nk09',min:1,when:['req-2'],text:'I smelt your kitchen from the road, my dear. One day you will let me taste. I am patient. Mostly.'},
  {id:'nk10',min:1,when:['req-3'],text:'Puff-puff by weight, small tables, and peppers from my neighbours. That is the café in my head. You heard it first.'},
  {id:'nk11',min:1,when:['fish-today'],text:'You were at the water today. I can see it on your face. Fish make people calm. Customers make people old.'},
  {id:'nk12',min:1,when:['peppers','harvested-ever'],text:'Ata rodo from your own veranda. I am proud of you, and I am also hungry. Mostly hungry.'},
  {id:'nk13',min:1,when:['visit-today'],text:'Ada is visiting you? Give her something to eat. She forgets to eat when she is working, that girl.'},
  {id:'nk14',min:2,max:2,when:['chair-placed'],text:'I hear you have Ada’s armchair. She sold it to Finds and then complained for a week. Now she can visit it.'},
  {id:'nk15',min:3,max:6,when:['harvested-ever'],text:'Since your peppers, I tell everybody your flat grows its own food. Do not let me down.'},
  {id:'nk16',min:3,max:6,when:['painted'],text:'New colour in your flat? You are becoming people with opinions. I like it.'},
  {id:'nk17',min:4,max:6,when:['evening-done'],text:'That evening at your veranda. Short and sweet, the way a proper greeting should be. Do it again soon, my dear.'},
  {id:'nk18',min:2,when:['decorated'],text:'Ada told me about the {item} in your flat. A home is a place you keep adding to. Slowly.'},
  {id:'nk19',min:1,max:1,when:['default'],text:'Moving day? Eat something first, my people. Nobody carries a sofa well on an empty stomach.'},
  {id:'nk20',min:1,max:1,when:['default'],text:'Tell your landlady the sugar price went up again. She will not believe you. She never believes me.'},
  {id:'nk21',min:1,max:1,when:['default'],text:'My shop opens early and closes when I am tired. Come before I am tired.'},
  {id:'nk22',min:1,max:1,when:['default'],text:'Jollof for your first evening? Good. Do not let anybody tell you how much pepper. It is your pot.'},
  {id:'nk23',min:2,max:2,when:['default'],text:'Ah, {player}, good morning. The flour came late, the sugar came early, and the price of onions is a scandal.'},
  {id:'nk24',min:2,max:2,when:['default'],text:'If you go fishing, keep one for the kitchen, abeg. A fresh fish and a little pepper, and you will not miss any restaurant.'},
  {id:'nk25',min:2,max:2,when:['default'],text:'I have known this compound a long time. The walls change colour. The gossip stays the same.'},
  {id:'nk26',min:2,max:2,when:['default'],text:'Tunde owes me money. He says he paid. I say show me. We have been saying it for years.'},
  {id:'nk27',min:3,max:3,when:['default'],text:'Today I am cooking for a naming ceremony. Tomorrow I will sleep. That is the plan, my dear.'},
  {id:'nk28',min:3,max:3,when:['default'],text:'A good pot of stew is a letter to your neighbours. Everybody reads it.'},
  {id:'nk29',min:3,max:3,when:['default'],text:'My knees say rain. Everybody else says sun. I believe my knees.'},
  {id:'nk30',min:3,max:3,when:['default'],text:'You young people walk so fast. Slow down. Market Road will still be there when you arrive.'},
  {id:'nk31',min:4,max:4,when:['default'],text:'Ah, the queue this morning. Everybody wanted rice at the same moment, like it was a competition.'},
  {id:'nk32',min:4,max:4,when:['default'],text:'If Tunde tells you he invented the compound rules, he is lying. I invented them. He only wrote them down.'},
  {id:'nk33',min:5,max:5,when:['default'],text:'Come by when I fry puff-puff. You will know. The whole road knows.'},
  {id:'nk34',min:5,max:5,when:['default'],text:'Half my customers today came to talk. The other half came to talk and buy palm oil.'},
  {id:'nk35',min:6,max:6,when:['default'],text:'When I have my café, your flat eats free on the opening day. Once. Then you pay like everybody.'},
  {id:'nk36',min:6,max:6,when:['default'],text:'A full pantry is a calm house, my child. Keep something in yours for when people drop by.'},
  {id:'nk37',min:4,when:['default'],text:'My dear, you look well. Palm Court is treating you kindly. Good. It does not treat everybody kindly.'},
  {id:'nk38',min:4,when:['default'],text:'The shop is quiet for once. I am enjoying it. Talk to me before somebody comes in.'},
  {id:'nk39',min:4,when:['default'],text:'Cook for your neighbours, my dear. That is how a compound becomes a family. One pot at a time.'},
  {id:'nk40',min:7,when:['default'],text:'You have been here long enough to have a usual, {player}. People come in and ask after you now.'},
  {id:'nk41',min:7,when:['default'],text:'Many people have lived in your flat. You are the first ones who come to my shop just to greet. I noticed.'}
 ],
 ada:[
  {id:'ad01',min:1,when:['first','chair-unsold'],text:'You are the sofa people. I built that frame, you know. I also sold an armchair to Palm Court Finds. If it turns up there, take it.'},
  {id:'ad02',min:1,when:['first'],text:'You are the sofa people. I am Ada. I make furniture, slowly, and I judge everybody’s chairs. Sit well.'},
  {id:'ad03',min:2,max:2,when:['chair-veranda'],text:'You put my armchair on the veranda. Good. A chair outside says you mean to stay a while.'},
  {id:'ad04',min:2,max:3,when:['chair-placed','chair-indoor'],text:'So the armchair found a home. I made it to be sat in, not admired. Sit in it.'},
  {id:'ad05',min:2,when:['chair-owned'],text:'You bought my armchair and left it in storage? Chairs sulk, you know. Give it a place.'},
  {id:'ad06',min:1,when:['req-ready','req-0'],text:'You moved something in the flat. I can tell from your face. Come, tell me about it.'},
  {id:'ad07',min:1,when:['shells','req-1'],text:'Shells! Smooth ones? Give them here. I am making a frame that remembers the water.'},
  {id:'ad08',min:3,max:6,when:['painted'],text:'You painted. Bold. Walls should have an opinion, and now yours do.'},
  {id:'ad09',min:1,when:['req-0'],text:'A flat tells you where things want to go. Most people do not listen. Listen to yours.'},
  {id:'ad10',min:1,when:['req-1'],text:'The frame is on my bench with two empty corners. You know what goes there. No rush.'},
  {id:'ad11',min:1,when:['req-2'],text:'A flat with enough pieces in it starts to talk back. Yours is clearing its throat.'},
  {id:'ad12',min:1,when:['visit-today'],text:'I like your veranda. I may sit here a long time and say nothing. That is high praise.'},
  {id:'ad13',min:1,when:['req-3'],text:'Your veranda is a good place to think. I will come again when I am stuck on a piece.'},
  {id:'ad14',min:2,when:['decorated'],text:'I heard where the {item} went. I would have argued about the angle, but it is your flat.'},
  {id:'ad15',min:4,max:6,when:['evening-done'],text:'That evening outside your veranda. Everybody talking at once, nobody in a hurry. A proper compound evening.'},
  {id:'ad16',min:3,max:6,when:['harvested-ever'],text:'Tunde has not stopped talking about your peppers. Please grow something else so he has a new topic.'},
  {id:'ad17',min:1,when:['fish-today'],text:'You went fishing? I go to the rocks to think about wood. The water sands things better than I do.'},
  {id:'ad18',min:2,max:3,when:['chair-unsold'],text:'If my armchair comes round at Finds, take it. I would rather it went to people who sit properly.'},
  {id:'ad19',min:1,max:1,when:['default'],text:'Moving in is the only time a flat is honest. Look at it empty. Then fill it slowly.'},
  {id:'ad20',min:1,max:1,when:['default'],text:'The restorer sanded the life out of my frame. Your sofa still has good bones. Be gentle with it.'},
  {id:'ad21',min:1,max:1,when:['default'],text:'I have been remaking the ninth piece for weeks. Do not ask. Actually, ask. I want to complain.'},
  {id:'ad22',min:1,max:1,when:['default'],text:'Welcome to Palm Court. The light here is generous. Use it when you arrange things.'},
  {id:'ad23',min:2,max:2,when:['default'],text:'I spent the morning on a chair leg. One leg. It is a good leg now.'},
  {id:'ad24',min:2,max:2,when:['default'],text:'Finds changes what it sells every day. Look often. The good pieces do not wait.'},
  {id:'ad25',min:2,max:2,when:['default'],text:'A room should have one thing you would take with you if you ever moved. Do you have yours yet?'},
  {id:'ad26',min:2,max:2,when:['default'],text:'Tunde asked me to make him a plant stand. I said yes. I will regret it. He will have notes.'},
  {id:'ad27',min:3,max:3,when:['default'],text:'Opening is coming. Nine pieces, if I stop remaking the ninth. I will not stop remaking the ninth.'},
  {id:'ad28',min:3,max:3,when:['default'],text:'Wood is honest. Cane is patient. People are neither. That is why I make chairs.'},
  {id:'ad29',min:3,max:3,when:['default'],text:'I walked the beach this morning looking for ideas. I found shells and one very rude crab.'},
  {id:'ad30',min:3,max:3,when:['default'],text:'Mama Nkechi fed me twice today. I only came in for flour. That is how it goes with her.'},
  {id:'ad31',min:4,max:4,when:['default'],text:'I tried a new joint this morning. It held. I did a small dance sha. Nobody saw. Tell nobody.'},
  {id:'ad32',min:4,max:4,when:['default'],text:'Your flat has changed since you arrived. I notice these things. It is my job and my curse.'},
  {id:'ad33',min:5,max:5,when:['default'],text:'My assistant asked why I sand by hand. I said the wood should know who made it. She laughed. She is wrong.'},
  {id:'ad34',min:5,max:5,when:['default'],text:'Put the heavy things down first and the small things last. A room is like a sentence.'},
  {id:'ad35',min:6,max:6,when:['default'],text:'A good chair is one you forget you are sitting in. A great chair is one you remember afterwards.'},
  {id:'ad36',min:6,max:6,when:['default'],text:'I am thinking about a bench for the courtyard. Long enough for everybody, short enough to argue on.'},
  {id:'ad37',min:4,when:['default'],text:'Some days the wood argues back. Today it agreed with me. I am suspicious.'},
  {id:'ad38',min:4,when:['default'],text:'You live like people who mean to stay. I can tell from the way you arrange things.'},
  {id:'ad39',min:4,when:['default'],text:'Sit well, neighbour. I mean it. Most people sit badly and blame the chair.'},
  {id:'ad40',min:7,when:['default'],text:'We have known each other a while now. You may call my chairs beautiful. I will pretend not to hear.'},
  {id:'ad41',min:7,when:['default'],text:'When the collection opens, I want a photograph from your veranda. It has the best light in Palm Court.'}
 ],
 // the veranda evening (EVENING asks with ctx.evening): the first line whose `when` holds; the last is the default
 evening:{
  tunde:[
   {id:'te01',when:['harvested-ever'],text:'Three peppers from one small pot. I have seen speakers do less with more power. Water it, it will go again.'},
   {id:'te02',when:['ripe'],text:'Your peppers are red. Pick them in the morning, before I come over and do it myself. Joke. Half joke.'},
   {id:'te03',when:['planted'],text:'The plant is coming on. Water in the morning, not at noon. I am not lecturing. I am describing.'},
   {id:'te04',when:['default'],text:'Good evening o, neighbours. A quiet night. The best kind of sound, and I should know.'}],
  nkechi:[
   {id:'ne01',when:['req-3'],text:'I told my customers about your cooking. Now they want some. You have created a problem for me.'},
   {id:'ne02',when:['req-2'],text:'Your peppers went into my stew at lunch. Two customers asked who my supplier is. I pointed at your flat, proudly.'},
   {id:'ne03',when:['req-1'],text:'Your fish went into a pot of beans and dodo, and a whole table ate well. You did that, my dear.'},
   {id:'ne04',when:['default'],text:'Do not bring chairs, my dear. We are not staying. We only came to greet you properly.'}],
  ada:[
   {id:'ae01',when:['chair-veranda'],text:'My armchair, on your veranda, looking out at the compound. That is exactly where I would have put it. Sit well.'},
   {id:'ae02',when:['chair-placed'],text:'So that is where my armchair went. I approve. Mostly. Sit in it often, that is what it is for.'},
   {id:'ae03',when:['decorated'],text:'From out here I can see the {item}. You have an eye, you know. Do not let it go to your head.'},
   {id:'ae04',when:['default'],text:'It looks like somebody lives here now. That is the whole point of a home. Goodnight, neighbours.'}]
 },
 // short game names for the fifteen Finds furnishings ({item}, the recap and the morning card)
 short:{lamp:'lamp',rug:'rug',chairs:'chairs',art:'wall art',plant:'potted plant',planter:'balcony planter',shelf:'bookshelf',coffee:'coffee table',armchair:'armchair',speaker:'speaker',bed:'bed frame',dining:'dining table',wardrobe:'wardrobe',kitchen:'new kitchen',tvconsole:'TV console'},
 // copy read by DAYS (morning card, recap), the party and the talk fallback (5.4). {a} and {b} come from the caller's vars.
 text:{
  'recap.evening-again':'Tomorrow evening, the neighbours want to come by your veranda.',
  'recap.seedling':'Tunde said he would leave something in your pot.',
  'recap.grew':'The seedling will be taller by morning.',
  'recap.waiting':'The seedling is waiting for water. Give it some in the morning.',
  'recap.unplanted':'Tunde’s seedling is still waiting by the pot.',
  'recap.ripe':'The peppers are ripe and waiting on the veranda.',
  'recap.finds-return':'The {a} and the {b} are back at Finds tomorrow.',
  'recap.ada-invite':'Ada wants to see the flat for herself.',
  'recap.ada-visit':'Ada is free to come by the veranda tomorrow.',
  'recap.evening-fish':'Tomorrow evening, try the rocks after six. Some fish only bite after dark.',
  'recap.shells':'Fresh shells will be on the beach in the morning.',
  'recap.quiet':'Tomorrow is yours. Nothing is waiting but the compound.',
  'recap.clause.chair':'Ada wants to hear where the chair went.',
  'recap.clause.pot-again':'Tunde says the pot will fruit again.',
  'recap.clause.evening-missed':'The neighbours still want to come by your veranda tomorrow evening.',
  'recap.clause.chair-heard':'Ada approves of where the armchair went.',
  'morning.evening-again.title':'The neighbours are coming by',
  'morning.evening-again.body':'Tunde, Mama Nkechi and Ada want to come by your veranda this evening, between six and ten. Be at home to see them.',
  'morning.seedling.title':'Tunde’s seedling is by the pot',
  'morning.seedling.body':'It came in a nursery bag, with Tunde’s note tucked beside it.',
  'morning.seedling.say':'Do not drown it. Do not starve it either. The rest is patience.',
  'morning.grew.title':'It grew overnight',
  'morning.grew.body':'It stood up taller in the night. One more watering today and there will be peppers to pick.',
  'morning.grew.say':'My dear, Tunde has been boasting about your plant all morning. I said, let me see the peppers first.',
  'morning.waiting.title':'The seedling is waiting',
  'morning.waiting.body':'It did not grow overnight. Give it water today and it will be taller by morning.',
  'morning.waiting.say':'A plant waits for water. It does not complain. I complain on its behalf.',
  'morning.unplanted.title':'The seedling is still in its bag',
  'morning.unplanted.body':'Tunde’s seedling is by the pot. Plant it and water it, and it will grow overnight.',
  'morning.unplanted.say':'The seedling is still in its bag. It is patient. I am less patient. Half joke.',
  'morning.ripe.title':'The peppers are ready',
  'morning.ripe.body':'Red peppers on the veranda, ready to pick.',
  'morning.ripe.say':'My dear, I hear there are red peppers on your veranda. Two of them would make my pot very happy.',
  'morning.finds-return.title':'Back at Finds today',
  'morning.finds-return.body':'The {a} and the {b} are back at Palm Court Finds today.',
  'morning.ada-invite.title':'Ada wants to see the flat',
  'morning.ada-invite.body':'Her last request is about a flat full enough to inspect. Her card is below.',
  'morning.ada-invite.say':'I keep hearing about your flat. Fill it a little more and I will come and judge it. Kindly.',
  'morning.ada-visit.title':'Ada can come by the veranda',
  'morning.ada-visit.body':'Invite her while you are at home. Her card is below.',
  'morning.ada-visit.say':'I have cleared my afternoon. If your veranda is free, I would like to sit on it.',
  'morning.evening-fish.title':'Something bites after dark',
  'morning.evening-fish.body':'After six in the evening, different fish come close to the rocks. A catfish is still missing from your almanac.',
  'morning.shells.title':'Fresh shells on the shore',
  'morning.shells.body':'Three new shells lie on the beach this morning, if you pass that way.',
  'morning.shells.say':'If you are on the beach, look for smooth shells. My frames are hungry.',
  'morning.quiet.title':'A quiet morning',
  'morning.quiet.body':'Nothing needs you today. The compound is yours.',
  // once the morning's job is done today, Today's morning card says so instead of pointing at the pot again
  'morning.done.planted.title':'Planted and watered',
  'morning.done.watered.title':'Watered for today',
  'morning.done.grow.body':'It will be taller by morning.',
  'morning.done.harvested.title':'Peppers picked',
  'morning.done.harvested.body':'Three red peppers are in the pantry.',
  'party.tunde.seedling':'Your veranda pot has been empty too long. Tomorrow morning, look beside it. I am saying nothing more.',
  'party.ada.armchair':'I sold an armchair to Palm Court Finds. Woven, cane back. If it turns up there, it would look right in this flat.',
  'fallback.tunde':'Still here. Still watching the plants. Go and do something interesting, then come and tell me.',
  'fallback.nkechi':'My dear, I have customers waiting. Come back later and we will talk properly.',
  'fallback.ada':'I am in the middle of a joint and it will not wait. Talk later?'
 }
};

/* ---------- 5.3 The conditions a line may ask for, over lineCtx35(). The LINES harness rejects any other key. ---------- */
const WHEN35=Object.freeze({
 'first':c=>!!c.first,
 'seed-pending':c=>!!c.seedPending,
 'seed-ready':c=>!!c.seedReady&&c.crop===0,
 'planted':c=>c.crop>=1,
 'grew':c=>c.crop===2,
 'ripe':c=>c.crop===3,
 'watered':c=>!!(c.wateredToday||c.wateredYesterday),
 'harvested':c=>!!(c.harvestedToday||c.harvestedYesterday),
 'harvested-ever':c=>c.harvests>0,
 'fish-today':c=>c.caughtToday>0,
 'fish-kept':c=>c.fishInPantry>0,
 'peppers':c=>c.peppers>=2,
 'req-ready':c=>!!c.reqReady,
 'req-done-today':c=>!!c.reqDoneToday,
 'req-0':c=>c.req===0,'req-1':c=>c.req===1,'req-2':c=>c.req===2,'req-3':c=>c.req===3,
 'chair-unsold':c=>!c.chairOwned,
 'chair-owned':c=>!!c.chairOwned&&!c.chairPlaced,
 'chair-placed':c=>!!c.chairPlaced,
 'chair-indoor':c=>!!c.chairPlaced&&!c.chairVeranda,
 'chair-veranda':c=>!!c.chairVeranda,
 'decorated':c=>!!c.decorated,
 'painted':c=>!!c.painted,
 'shells':c=>c.shells>=2,
 'evening-done':c=>!!c.eveningDone,
 'visit-today':c=>!!c.visitToday,
 'morning-slot':c=>c.slot==='morning',
 'evening-slot':c=>c.slot==='evening',
 'default':()=>true
});

/* ---------- 5.3 The context: read from the save only, so both online peers see the same one ---------- */
function lineCtx35(who,i=0){
 const lv=life34(),l=lv||{},crop=l.crop||{stage:0,wateredDay:0,harvests:0},daily=l.daily||{},nb=(S.nb&&S.nb[who])||{};
 const hasReq=!!lv&&typeof REQUESTS34!=='undefined'&&!!REQUESTS34[who],r=hasReq?request34(who):{stage:0,lastDay:0},q=hasReq?REQUESTS34[who][r.stage]:null;
 const today=daily[String(S.day)]||{},yesterday=daily[String(S.day-1)]||{},items=(S.home&&S.home.items)||[];
 return {day:S.day,i,slot:slot(),aff:nb.aff||0,first:(nb.aff||0)===0,
  req:r.stage,reqReady:!!(q&&q.test()&&r.lastDay!==S.day),reqDoneToday:r.lastDay===S.day,
  seedPending:typeof TUNE35!=='undefined'&&!!TUNE35.seedlingPending(),seedReady:typeof TUNE35==='undefined'||!!TUNE35.seedlingReady(),
  crop:crop.stage||0,harvests:crop.harvests||0,
  // wateredDay is 0 until the first watering (and again after a harvest), so day 1 never reads as "watered yesterday"
  wateredToday:crop.wateredDay>0&&crop.wateredDay===S.day,wateredYesterday:crop.wateredDay>0&&crop.wateredDay===S.day-1,
  harvestedToday:!!today.harvested,harvestedYesterday:!!yesterday.harvested,
  caughtToday:today.caught||0,fishInPantry:haveCount('fish'),peppers:haveCount('pepper'),
  chairOwned:owned34('armchair'),chairPlaced:placed('armchair'),
  chairVeranda:items.some(x=>x.type==='armchair'&&x.y===FLAT.rows),
  lastDecor:l.lastDecor||null,decorated:((l.metrics&&l.metrics.decorated)||0)>0,
  painted:!!(S.home&&(S.home.wall||S.home.floor)),shells:l.shells||0,
  eveningDone:typeof EVENING35!=='undefined'&&!!EVENING35.done(),visitToday:!!(l.visit&&l.visit.day===S.day)};
}

/* ---------- 5.2 Selection ---------- */
// {item} is the short name of the last thing placed or turned, {player} the talking player's name
const lines_fill35=(text,ctx)=>String(text).replace(/\{item\}/g,()=>itemShort35(ctx.lastDecor)).replace(/\{player\}/g,()=>{try{return pname(ctx.i||0);}catch(e){return '';}});
const lines_holds35=(line,ctx)=>(line.when||[]).every(k=>WHEN35[k]&&WHEN35[k](ctx))&&!(String(line.text).includes('{item}')&&!itemShort35(ctx.lastDecor));
// today's used ids for `who`, read only (an old save, or a new day, has none)
const lines_used35=who=>{const L=S&&S.life&&S.life.lines35;return L&&L.day===S.day&&L.used&&Array.isArray(L.used[who])?L.used[who]:[];};
// S.life.lines35 for today, created lazily; the used lists reset on a new day, the once-a-day hint days are kept
const lines_state35=()=>{const l=life34();if(!l)return null;let L=l.lines35;
 if(!L||typeof L!=='object')L=l.lines35={day:S.day,used:{tunde:[],nkechi:[],ada:[]},hint:{}};
 if(L.day!==S.day||!L.used||typeof L.used!=='object'){L.day=S.day;L.used={tunde:[],nkechi:[],ada:[]};}
 if(!L.hint||typeof L.hint!=='object')L.hint={};
 return L;};

function line35(who,ctx){
 if(!LINES35[who]||!Array.isArray(LINES35[who]))return null;
 ctx=ctx||lineCtx35(who);
 if(ctx.evening){const e=(LINES35.evening[who]||[]).find(x=>lines_holds35(x,ctx));return e?{id:e.id,text:lines_fill35(e.text,ctx)}:null;}
 const used=lines_used35(who),day=ctx.day;
 const t=LINES35[who].find(x=>x.min<=day&&day<=(x.max==null?99:x.max)&&!used.includes(x.id)&&lines_holds35(x,ctx));
 return t?{id:t.id,text:lines_fill35(t.text,ctx)}:null;
}
function useLine35(who,id){const L=lines_state35();if(!L)return;if(!Array.isArray(L.used[who]))L.used[who]=[];if(!L.used[who].includes(id))L.used[who].push(id);}

/* ---------- 5.8 Copy and short names ---------- */
function text35(key,vars){const t=LINES35.text[key];if(typeof t!=='string')return '';
 return t.replace(/\{(\w+)\}/g,(m,k)=>vars&&vars[k]!=null?String(vars[k]):'');}
function itemShort35(t){if(t&&Object.prototype.hasOwnProperty.call(LINES35.short,t))return LINES35.short[t];
 return t&&typeof ITEMS!=='undefined'&&ITEMS[t]&&ITEMS[t].name?String(ITEMS[t].name).toLowerCase():'';}

/* ---------- 5.7 Party lines (v35 households only, so old saves see the party exactly as before) ---------- */
function partyLines35(){
 if(!S||!S.born35||!S.party||!Array.isArray(S.party.guests))return '';
 const g=S.party.guests;let h='';
 if(g.includes('tunde')&&typeof TUNE35!=='undefined'&&TUNE35.seedlingPending())h+=say('tunde',esc(text35('party.tunde.seedling')));
 if(g.includes('ada')&&S.day===1&&!owned34('armchair'))h+=say('ada',esc(text35('party.ada.armchair')));
 return h;
}

{
 const WHO=['tunde','nkechi','ada'];
 // the base output's footprint: flags (minus the per-slot talk keys t<digit>…), recipes, storage and memories
 const sig=()=>{const f={};for(const k in S.flags)if(!/^t\d/.test(k))f[k]=S.flags[k];return JSON.stringify([f,S.recipes.length,S.home.storage.length,S.memories.length]);};
 // a base line that still points somewhere is kept once a day after the table line (Tunde's planter, Nkechi's recipes, Ada's photographs)
 const hintDue=(who,ctx)=>{const L=S.life&&S.life.lines35,seen=L&&L.hint&&L.hint[who];if(seen===S.day)return false;
  if(who==='tunde')return ctx.aff>=1&&ctx.aff<3&&!S.flags.seedlings&&!S.flags.tundePlant;
  if(who==='nkechi')return ctx.aff>=1&&!S.recipes.includes('puffpuff');
  if(who==='ada')return ctx.aff>=1&&ctx.aff<3&&!S.flags.adaPhotos;return false;};
 const hintSeen=who=>{const L=lines_state35();if(L)L.hint[who]=S.day;};
 const warn=(m,e)=>{if(typeof console!=='undefined')console.warn('lines35',m,e);};
 // a new household has had its housewarming by day 2: the base gift lines stop promising one (copy only; the flags are untouched)
 const AFTER_PARTY=[
  ['And if you host, I do the sound. No speaker? I bring my small one.','Next time you have people round, I do the sound.'],
  ['Tunde will handle the music at the housewarming.','Tunde will bring the music next time you host.'],
  ['I will bring a stool to your housewarming. A good one. Do not let Tunde sit on it with wet trousers.','Next time you have people round, I want to see who sits where. Keep Tunde off my chairs in wet trousers.']];
 const afterParty=out=>{if(typeof out!=='string'||!(S&&S.born35&&(S.day>=2||(S.party&&S.party.done))))return out;for(const [a,b] of AFTER_PARTY)if(out.indexOf(a)>=0)out=out.split(a).join(b);return out;};

 // wrap: Tunde, Mama Nkechi and Ada say today's table line instead of their base greeting; base narrative is kept when the
 // base talk changed something (a gift, a recipe, a flag) or once a day as a hint; a used-up table gives the fallback line.
 // Runs the same in silent replays (no rng), so both peers keep the same S.life.lines35.
 const lines_talk35=talk;talk=function(i,who,first){
  if(!WHO.includes(who))return lines_talk35.apply(this,arguments);
  let ctx,hint,s0;
  try{ctx=lineCtx35(who,i);hint=hintDue(who,ctx);s0=sig();}catch(e){warn('ctx',e);return lines_talk35.apply(this,arguments);}
  const out=afterParty(lines_talk35.apply(this,arguments));
  try{const keep=sig()!==s0||hint;if(hint)hintSeen(who);
   const l=line35(who,ctx);
   if(l){useLine35(who,l.id);return say(who,esc(l.text))+(keep?out:'');}
   return keep?out:say(who,esc(text35('fallback.'+who)));
  }catch(e){warn('talk',e);return out;}
 };

 // wrap: the page after Ada's shell request thanks her for the shells, not for the last thing placed
 const lines_callback35=callback34;callback34=function(k){if(k==='ada'){const r=request34('ada');if(r.stage===2&&r.lastDay===S.day)return 'Two smooth shells. The frame remembers the water now.';}return lines_callback35.apply(this,arguments);};

 // wrap: on a new household's first day Ada may be invited to the housewarming without a talk first (she brings the armchair story to it)
 const lines_guest35=guestOK;guestOK=function(k){if(k==='ada'&&S&&S.born35&&S.day===1)return {ok:true};return lines_guest35.apply(this,arguments);};

 // wrap: the housewarming panel carries Tunde's seedling promise and Ada's armchair, above its buttons (v35 households only)
 const lines_party35=finishParty;finishParty=function(){const r=lines_party35.apply(this,arguments);
  if(!silentMode()){try{const h=partyLines35();if(h){const a=panel.querySelector&&panel.querySelector('.actions');if(a&&a.insertAdjacentHTML)a.insertAdjacentHTML('beforebegin',h);else panel.insertAdjacentHTML('beforeend',h);}}catch(e){warn('party',e);}}
  return r;};
}
