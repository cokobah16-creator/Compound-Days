/* First Evening: persistent, optional goals built around actual game actions. */
const EVENING33=[
 {id:'move',title:'Make room for your life',short:'Carry the sofa into Flat 3',hint:'At the gate, take one end each with Act (E / Enter). Walk together through the left passage. Turn the sofa lengthways for the doorway. Your companion takes the other end automatically.'},
 {id:'shop',title:'Something good in the pot',short:'Bring home the jollof ingredients',hint:'Market Road is east of the courtyard. Buy tomatoes and pepper at Iya Tomato, rice and oil opposite, then spices next door. Walk back into Flat 3 to unpack.'},
 {id:'cook',title:'Your first shared meal',short:'Cook a pot of jollof together',hint:'Bring both players into the flat and use Act by the stove. Choose Jollof, finish both stations, then Serve. Your companion handles their station. Keep a dish for the housewarming.'},
 {id:'host',title:'Now it feels like home',short:'Host the neighbours this evening',hint:'A dish, some music or conversation, and one guest are enough. Tunde and Mrs. Oyelaran already welcome an invitation. Choose your roles across four party moments.'},
 {id:'gift',title:'A little more yours',short:'Choose your housewarming gift',hint:'The neighbours have brought something for Flat 3. Pick a plant, a rug or a piece of art. If there is no space, it stays safe in Build storage.'},
 {id:'tomorrow',title:'One more day',short:'Choose tomorrow’s plan',hint:'Keep tonight’s memory, then decide who to visit tomorrow. The compound will still be here.'}
];
function evening33(){return S&&S.firstEvening;}
function guided33(){const e=evening33();return !!(e&&e.enabled&&!e.completed);}
function reconcile33(){
 const e=evening33();if(!e)return; e.done=e.done||{};
 if(S.sofa.state==='placed')e.done.move=true;
 if(RECIPES.jollof.needs.every(k=>haveCount(k)>0)||(S.cooked.jollof||0)>0)e.done.shop=true;
 if((S.cooked.jollof||0)>0)e.done.cook=true;
 if((S.flags.parties||0)>0)e.done.host=true;
 if(e.reward)e.done.gift=true;
 if(e.plan){e.done.tomorrow=true;e.completed=true;}
 const next=EVENING33.find(x=>!e.done[x.id]);e.stage=next?next.id:'complete';
}
function eveningMissing33(){return RECIPES.jollof.needs.filter(k=>!haveCount(k));}
function journal33(){
 reconcile33(); const e=evening33();
 if(!e){openPanel(`<h2>Your first evening</h2><p>A sofa through the doorway. Something on the stove. Neighbours under the bulbs. A small story, at your pace.</p><p class="small muted">Your existing household and progress stay with you.</p><div class="actions">${btn('Follow the first evening','eveningEnable',{},'primary block')}${btn('Back to free play','close',{},'quiet')}</div>`);return;}
 const step=EVENING33.find(x=>!e.done[x.id]);const count=EVENING33.filter(x=>e.done[x.id]).length;
 let action='';
 if(e.stage==='shop'||(e.stage==='cook'&&eveningMissing33().length)||(e.stage==='host'&&!S.dishes.length))action=`<div class="evening-shopping"><b>For one pot of jollof</b>${RECIPES.jollof.needs.map(k=>`<span>${haveCount(k)?'✓':'○'} ${esc(ING[k].name)}</span>`).join('')}</div>${!e.help&&eveningMissing33().length?btn('Ask for a welcome basket','eveningHelp',{},'quiet','One gift of missing ingredients, if you need a hand.'):''}`;
 if(e.stage==='cook')action+=btn('Open the kitchen','eveningCook',{},'primary block','Both of you need to be back in the flat.');
 if(e.stage==='host')action+=S.party&&!S.party.done?btn('Return to the gathering','eveningParty',{},'primary block'):S.dishes.length?btn('Get ready for the housewarming','eveningHost',{},'primary block','Wait until evening and choose food, music and guests.'): `<p class="hint">The first pot was eaten or sold. Cook another dish before inviting everyone.</p>${btn('Open the kitchen','eveningCook',{},'primary block')}`;
 if(e.stage==='gift')action=['plant','rug','art'].map(k=>btn({plant:'A plant for the window',rug:'A rug for the room',art:'Art for the wall'}[k],'eveningGift',{v:k},'block')).join('');
 if(e.stage==='tomorrow')action=Object.entries(PLANS33).map(([k,v])=>btn(v.title,'eveningPlan',{v:k},'block',v.detail)).join('');
 if(e.completed)action=`<div class="card"><b>Tomorrow: ${esc(PLANS33[e.plan].title)}</b><p class="small">${esc(PLANS33[e.plan].detail)}</p></div>${btn('Keep tonight in the album','albumbtn',{},'block')}${btn('Rest and see the next day','sleep',{},'primary block')}`;
 openPanel(`<div class="evening33"><p class="evening-kicker">PALM COURT · YOUR FIRST EVENING</p><h2>${step?step.title:'This place is becoming yours.'}</h2><p>${step?step.hint:'You moved in, cooked together and opened your door. There is more to do tomorrow.'}</p><div class="evening-progress" role="progressbar" aria-label="First evening milestones" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${count}"><i style="width:${count/6*100}%"></i></div><p class="tiny">${count} of 6 moments · ${e.enabled?'Take your time: the pre-party clock waits before shops close.':'Guidance paused. Your progress stays saved.'}</p>${action}<details><summary>The evening ahead</summary><ol>${EVENING33.map(s=>`<li class="${e.done[s.id]?'finished':''}">${e.done[s.id]?'✓ ':''}${s.short}</li>`).join('')}</ol></details><div class="actions">${btn('Back to the compound','close',{},'primary block')}${!e.completed?btn(e.enabled?'Explore freely for now':'Resume the evening','eveningToggle',{},'quiet'):''}</div></div>`);
}
const PLANS33={recipe:{title:'Cook with Mama Nkechi',detail:'Tomorrow morning, visit the community kitchen in the Makers’ Yard north of the compound. Bring ₦1,000 for a lesson and a new recipe.'},photo:{title:'Find the light with Mr. Bassey',detail:'Tomorrow morning, visit Mr. Bassey at the Makers’ Yard. His ₦1,000 lesson opens the door to photographing Ada’s work.'},garden:{title:'Grow something with Tunde',detail:'Tomorrow morning, find Tunde at the Makers’ Yard. A ₦1,000 lesson gets you started with seedlings for a balcony planter.'}};
const newState33=newState;newState=function(){const s=newState33();s.time=15;s.firstEvening={version:1,enabled:true,done:{},startedDay:1};return s;};
const save33=save;save=function(){reconcile33();return save33();};
const tasks33=tasks;tasks=function(){reconcile33();if(guided33()){const e=evening33(),step=EVENING33.find(x=>!e.done[x.id]);return [{txt:step.short,done:false},{txt:'Tap Tasks for your evening journal',done:false}];}return tasks33();};
const tasksHTML33=tasksHTML;tasksHTML=function(){return tasksHTML33()+btn('Open the first-evening journal','eveningJournal',{},'primary block');};
ACTIONS.eveningJournal=journal33;
ACTIONS.eveningEnable=()=>{if(evening33()){journal33();return;}S.firstEvening={version:1,enabled:true,done:{},startedDay:S.day};save();journal33();};
ACTIONS.eveningToggle=()=>{const e=evening33();if(!e)return;e.enabled=!e.enabled;save();journal33();};
ACTIONS.eveningHelp=()=>{const e=evening33();if(!e||e.help||!eveningMissing33().length)return;eveningMissing33().forEach(k=>addPantry(k,1));e.help=true;remember('Mrs. Oyelaran sent a welcome basket. Nobody starts alone.','moment');save();journal33();};
ACTIONS.eveningCook=()=>{both().forEach(i=>{if(players[i]&&inFlat(players[i].g.position.x,players[i].g.position.z))unpack(i);});openCookPick();};
ACTIONS.eveningHost=()=>{if(!S.dishes.length)return; if(S.party&&!S.party.done){ACTIONS.eveningParty();return;} if(S.party&&S.party.done){journal33();return;}if(S.time>=22){openPanel(`<h2>Tomorrow is fine, too.</h2><p>It is late. Keep the food for tomorrow; your first evening can take more than one day.</p>${btn('Rest','sleep',{},'primary block')}`);return;}S.time=Math.max(S.time,18.2);reroute();setLightsOn(true);ACTIONS.partysetup();save();};
ACTIONS.eveningParty=()=>{if(!S.party||S.party.done)return;if(S.roof&&S.roof.on){closePanel();toast('Finish bringing the rooftop things inside.');}else if(S.party.round>=1)renderParty();else nextRound();};
ACTIONS.eveningGift=d=>{reconcile33();const e=evening33();if(!e||!e.done.host||e.reward||!['plant','rug','art'].includes(d.v))return;e.reward=d.v;if(!placeAuto(d.v))S.home.storage.push(d.v);rebuildFurniture();remember('The neighbours brought '+({plant:'a plant',rug:'a rug',art:'a piece of art'}[d.v])+' for our first home.','moment');save();journal33();};
ACTIONS.eveningPlan=d=>{const e=evening33();if(!e||!e.reward||e.plan||!PLANS33[d.v])return;e.plan=d.v;e.finishedDay=S.day;remember('Tomorrow: '+PLANS33[d.v].title+'.','moment');save();journal33();};
// Persist action boundaries, including both cooking stations and each party choice.
const dispatch33=dispatch;dispatch=function(name,data){const result=dispatch33(name,data);if(S&&S.phase==='play')save();return result;};
const sofaSuccess33=sofaSuccess;sofaSuccess=function(){sofaSuccess33();save();panel.insertAdjacentHTML('beforeend',btn('What’s next?','eveningJournal',{},'primary block'));};
const finishCook33=finishCook;finishCook=function(){finishCook33();save();if(guided33())panel.insertAdjacentHTML('beforeend',btn('Plan the evening','eveningJournal',{},'primary block'));};
const finishParty33=finishParty;finishParty=function(){finishParty33();save();if(evening33()&&!evening33().completed)panel.insertAdjacentHTML('beforeend',btn('A gift from the neighbours','eveningJournal',{},'primary block'));};
const movein33=ACTIONS.movein;ACTIONS.movein=d=>{movein33(d);save();panel.insertAdjacentHTML('beforeend',btn('See your first-evening plan','eveningJournal',{},'quiet block'));};
const continue33=ACTIONS.continue;ACTIONS.continue=d=>{continue33(d);if(S&&S.ck&&(!S.party||S.party.done))renderCook();};
const nextday33=ACTIONS.nextday;ACTIONS.nextday=d=>{nextday33(d);const e=evening33();if(e&&e.completed&&!e.invitationSeen){e.invitationSeen=true;save();openPanel(`<h2>A new day in Palm Court</h2><p>${esc(PLANS33[e.plan].detail)}</p><p class="small muted">Your gift is in the flat or Build storage. Last night’s memories are in the album.</p>${btn('Let’s see what happens','close',{},'primary block')}`);}};
// A calm first gathering. Later housewarmings retain the existing rain sequence.
function firstParty33(){return guided33()&&!(S.flags.parties||0);}
const opts33=partyOpts;partyOpts=function(){const opts=opts33();if(firstParty33()&&S.party&&!S.party.f.photo){const photo={id:'photo',name:'Keep a photograph of your first evening'};return [photo,...opts.filter(o=>o.id!=='photo')].slice(0,4);}return opts;};

// Hold the guided pre-party clock before market closing; free play keeps normal time.
function advanceClock33(h){const target=S.time+h;S.time=guided33()&&!S.party&&S.time<=18.5?Math.min(target,18.5):target;}
passTime=advanceClock33;

ACTIONS.tasksbtn=journal33;
