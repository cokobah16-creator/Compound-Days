import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
import {householdRequest} from '../lib/households.mjs';
const require=createRequire(import.meta.url);
const {Miniflare}=await import(require.resolve('miniflare',{paths:[path.dirname(require.resolve('wrangler/package.json'))]}));
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:['DB']});
const checks=[];const pass=name=>{checks.push(name);console.log('PASS',name);};
try{
 const db=await mf.getD1Database('DB');
 for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of fs.readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 const sa=webcrypto.randomUUID(),sb=webcrypto.randomUUID(),sc=webcrypto.randomUUID();
 async function req(user,body,session=sa){const r=await householdRequest(new Request('https://game.test/api/household',{method:body?'POST':'GET',headers:{...(user?{'oai-authenticated-user-id':user}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify({...body,session})}:{})}),db);return {status:r.status,...await r.json()};}
 const basic={phase:'lobby',p:[{name:'Chika'},{name:'Obi'}],ready:[false,false],dayVotes36:[0,0],money:10000,day:1,time:15,home:{items:[],storage:[]},pantry:{},life:{shells:0},household:'Our home'};
 assert.equal((await req(null)).status,401);
 const createId=webcrypto.randomUUID();const a=await req('a',{op:'create',state:basic,id:createId});assert.equal(a.status,201);const room=a.code;assert.equal((await req('a',{op:'create',state:basic,id:createId})).code,room);
 const b=await req('b',{op:'join',code:room},sb);assert.equal(b.slot,1);assert.equal((await req('c',{op:'join',code:room},sc)).status,409);
 assert.equal((await req('c',{op:'sync',code:room},sc)).status,403);assert.equal((await req('b')).households.length,1);pass('Authenticated membership, two-person capacity and per-account household discovery');
 const patch=(path,before,after)=>({path,beforeExists:true,before,afterExists:true,after});
 const id=webcrypto.randomUUID(),money={op:'commit',code:room,id,patches:[patch(['money'],10000,9000)]};
 const [m1,m2]=await Promise.all([req('a',money),req('a',money)]);assert.equal(m1.status,200);assert.equal(m2.status,200);assert.equal(m2.state.money,9000);assert.equal(m2.revision,1);pass('Concurrent duplicate requests charge once and replay after an ambiguous response');
 const [x,y]=await Promise.all([req('a',{op:'commit',code:room,id:webcrypto.randomUUID(),patches:[patch(['money'],9000,8000)]}),req('b',{op:'commit',code:room,id:webcrypto.randomUUID(),patches:[patch(['money'],9000,7500)]},sb)]);
 assert.deepEqual([x.status,y.status].sort(),[200,409]);assert.equal((x.status===409?x:y).code,'conflict');pass('Conflicting spending cannot overwrite a newer shared purse');
 const [d1,d2]=await Promise.all([req('a',{op:'commit',code:room,id:webcrypto.randomUUID(),patches:[patch(['ready','0'],false,true)]}),req('b',{op:'commit',code:room,id:webcrypto.randomUUID(),patches:[patch(['ready','1'],false,true)]},sb)]);assert.equal(d1.status,200);assert.equal(d2.status,200);assert.deepEqual((await req('a',{op:'sync',code:room})).state.ready,[true,true]);pass('Different player contributions merge without lost updates');
 assert.equal((await req('a',{op:'commit',code:room,id:webcrypto.randomUUID(),patches:[patch(['p','1','name'],'Obi','Changed')]})).status,403);
 assert.equal((await req('a',{op:'commit',code:room,id:webcrypto.randomUUID(),patches:[patch(['__proto__','polluted'],null,true)]})).status,400);pass('Partner character ownership and patch path validation are enforced server-side');
 await req('a',{op:'sync',code:room,presence:{x:4,z:7,y:0,ry:1,mv:1}});
 const seen=await req('b',{op:'sync',code:room},sb);assert.equal(seen.people[0].presence.x,4);assert(seen.people[0].online);
 const taken=await req('a',{op:'join',code:room},sc);assert.equal(taken.code,'in_use');assert.equal((await req('a',{op:'join',code:room,takeover:true},sc)).status,200);assert.equal((await req('a',{op:'sync',code:room})).code,'in_use');
 await req('a',{op:'leave',code:room},sc);assert.equal((await req('b',{op:'sync',code:room},sb)).people[0].online,false);pass('Independent presence, safe session takeover and partner departure');
 // Two separate shipped game runtimes, connected to the real D1-backed handler.
 async function client(user){
  delete require.cache[require.resolve('./runtime-harness.cjs')];const h=require('./runtime-harness.cjs');const v=await h.load();
  v.context.crypto=webcrypto;v.context.AbortController=AbortController;v.context.sessionStorage=v.context.localStorage;
  v.context.fetch=async(url,init={})=>householdRequest(new Request(new URL(url,'https://game.test'),{...init,headers:{...init.headers,'oai-authenticated-user-id':user}}),db);
  v.run('buildWorld();HOME36.available=true;');return v;
 }
 const A=await client('player-a'),B=await client('player-b');
 await A.run('ACTIONS.nethost({})');assert(A.run('NET.on'));const gameRoom=A.run('NET.code');
 B.context.testCode=gameRoom;await B.run('join36(testCode)');assert.equal(B.run('NET.myIndex'),1);
 A.run("S.p[0].name='Chika';ACTIONS.netready()");await A.run('flush36()');await B.run('poll36(true)');
 B.run("S.p[1].name='Obi';ACTIONS.netready()");await B.run('flush36()');await A.run('poll36(true)');
 assert.equal(A.run('S.ready.every(Boolean)'),true);await A.run("dispatch('netmovein',{})");await B.run('poll36(true)');
 assert.equal(A.run('S.phase'),'play');assert.equal(B.run('S.phase'),'play');assert.equal(A.run('players.length'),2);assert.equal(B.run('players.length'),2);assert.equal(A.run('singleIdx()'),0);assert.equal(B.run('singleIdx()'),1);pass('Real game runtimes create, join, choose separate characters and enter full-screen views');
 // Wait for async mesh loaders and any derived-state saves to settle.
 for(let k=0;k<8;k++)await new Promise(setImmediate);
 await A.run('flush36()');await B.run('poll36(true)');
 A.run('players[0].g.position.set(3.5,0,4.5);players[0].moving=true');await A.run('poll36(true)');await B.run('poll36(true)');B.run('netTick(.1,true)');assert.equal(B.run('NET.otherPres.x'),3.5);
 const oldTime=A.run('S.time');A.run('advanceClock33(1)');assert.equal(A.run('S.time'),oldTime);pass('Movement presence is separate from shared saves and the online day does not drift per phone');
 A.run('players[0].g.position.set(-6.2,0,4.4);players[1].g.position.set(4,0,8)');
 await A.run("dispatch('lifeSelect',{ix:0})");
 // A shipped home action places the starter lamp in an actually valid cell.
 A.run("LIFE34.selection=S.home.storage.indexOf('lamp')");let placed=false;
 for(let y=0;y<5&&!placed;y++)for(let x=0;x<6&&!placed;x++){if(A.run(`fitsEditor34('lamp',${x},${y},0)`)){await A.run(`dispatch('lifeCell',{x:${x},y:${y}})`);placed=A.run("S.home.items.some(i=>i.type==='lamp')");}}
 assert(placed,'starter lamp placed');await B.run('poll36(true)');assert.equal(B.run("S.home.items.some(i=>i.type==='lamp')"),true);pass('Shared home placement propagates actual furnishings and conserves storage');
 const amount=A.run('S.money'),fetchA=A.context.fetch;let drop=true;
 A.context.fetch=async(url,init)=>{const res=await fetchA(url,init);if(drop&&JSON.parse(init.body||'{}').op==='commit'){drop=false;throw new Error('Lost response after server commit');}return res;};
 A.run('S.money-=100');await A.run('flush36()');assert(A.run('!!HOME36.pending'));await A.run('flush36()');assert.equal(A.run('HOME36.pending'),null);assert.equal(A.run('S.money'),amount-100);await B.run('poll36(true)');assert.equal(B.run('S.money'),amount-100);pass('Client retains an unsent change and safely retries a lost commit response');
 A.run('NET.on=false');await A.run('join36(NET.code)');assert.equal(A.run("S.home.items.some(i=>i.type==='lamp')"),true);assert.equal(A.run('S.money'),amount-100);pass('Returning to a household restores shared furniture and money');

 // Independent panels remain local, and both players can answer their own stations.
 A.run("players.forEach((p,i)=>p.g.position.set(-6.2+i,0,4.4));closePanel()");
 B.run("players.forEach((p,i)=>p.g.position.set(-6.2+i,0,4.4));closePanel()");
 await A.run("dispatch('eveningHelp',{})");await B.run('poll36(true)');
 await A.run("dispatch('cook',{r:'jollof'})");await B.run('poll36(true)');
 assert.equal(A.run('overlayOpen()'),true);assert.equal(B.run('overlayOpen()'),false);
 B.run('openCookPick()');assert.equal(B.run('HOME36.mode'),'cook');
 const beforeWrong=A.run('S.ck.ans[1].length');await A.run("dispatch('cookans',{i:1,ix:0})");assert.equal(A.run('S.ck.ans[1].length'),beforeWrong);
 for(let k=0;k<2;k++){await Promise.all([A.run("dispatch('cookans',{i:0,ix:0})"),B.run("dispatch('cookans',{i:1,ix:0})")]);await A.run('poll36(true)');await B.run('poll36(true)');}
 assert.equal(A.run('S.ck.ans[0].length'),2);assert.equal(A.run('S.ck.ans[1].length'),2);
 await A.run("dispatch('serve',{})");await B.run('poll36(true)');assert.equal(B.run('S.ck'),null);assert.equal(B.run('S.dishes.length'),1);
 pass('Menus stay on their own phone; real cooking accepts concurrent contributions from both stations');
 const today=A.run('S.day');await A.run("dispatch('onlineDayVote36',{})");assert.equal(A.run('S.day'),today);await B.run('poll36(true)');await B.run("dispatch('onlineDayVote36',{})");await A.run('poll36(true)');assert.equal(A.run('S.day'),today+1);
 pass('Both present players confirm a new day, and the same day reaches both devices');
 const rendererCalls=[];A.context.renderCalls=rendererCalls;
 A.run('renderer={info:{autoReset:true,reset(){}},setScissorTest:v=>renderCalls.push(["scissor",v]),getSize:s=>s.set(390,844),setViewport:(...v)=>renderCalls.push(["view",...v]),render:(s,c)=>renderCalls.push(["camera",c===cams[0]]),shadowMap:{}};renderFrame()');
 assert(rendererCalls.some(c=>c[0]==='view'&&c[3]===390&&c[4]===844));assert(rendererCalls.some(c=>c[0]==='camera'&&c[1]===true));assert(!rendererCalls.some(c=>c[0]==='scissor'&&c[1]===true));
 pass('The actual renderer uses one full portrait viewport and the local character camera');
 fs.writeFileSync('check/results-v36.json',JSON.stringify({build:A.run('BUILD_ID'),passed:true,checks,method:'Two separate shipped game runtimes against the actual shared-household handler and local Cloudflare D1. No GPU or physical phone claim.'},null,2)+'\n');
}finally{await mf.dispose();}
