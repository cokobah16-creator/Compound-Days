#!/usr/bin/env node
// Compound Days v66: the first genuinely visual Player 1 V61 clothing choice.
// Structural unit test; not a substitute for the browser WebGL screenshot.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../dist/src/shirt-v66.js'),'utf8');
new vm.Script(src,{filename:'shirt-v66.js'});
const CSS=fs.readFileSync(path.join(__dirname,'../dist/src/shirt-v66.css'),'utf8');
const INDEX=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
assert(INDEX.includes('src/shirt-v66.js'));
assert(INDEX.includes('src/shirt-v66.css'));
assert(INDEX.indexOf('src/shirt-v66.js')>INDEX.indexOf('src/hero-v61.js'));
assert(!/frustumCulled\s*=\s*false/.test(src));
assert(!/\.skin\(|\.weights\(|geometry\.attributes.*set/.test(src));
let buildCount=0;
const ctx={
 console, THREE:{Color:class{constructor(color){this.r=.25;this.g=.5;this.b=.75;this.from=color}}},
 HERO61:{enabled:true,state:'ready',note:'old'},
 S:{setup:{step:'p0'},p:[{skin:'#977358',hair:'braids',outfit:'tee',colors:{shoe:'white'}},{hair:'low'}]},
 ACTIONS:{},LOCAL_ONLY:new Set(),renderSetup(){buildCount++},
 hero61Dress(g){g.userData.hero61=true;return g;},
 document:undefined
};
vm.createContext(ctx);vm.runInContext(src,ctx);
assert(ctx.LOCAL_ONLY.has('shirt66set'));
assert(ctx.HERO61.note.includes('customizable under Clothes'));
const get=id=>vm.runInContext('shirt66Choice('+JSON.stringify(id)+')',ctx);
assert.equal(vm.runInContext("shirt66Choice({}).id",ctx),'sky');
assert.equal(vm.runInContext("shirt66Choice({colors:{shirt66:'garbage'}}).id",ctx),'sky');
assert.equal(vm.runInContext("SHIRT66.choices.length",ctx),6);
assert.equal(vm.runInContext("shirt66PickerHTML({}).match(/data-act=\"shirt66set\"/g).length",ctx),6);
const fakeMat=(name,map)=>({
 name,map,userData:{from:'V61'},color:{hex:'#abcdef',set(v){this.hex=v;}},
 clone(){return fakeMat(name,map);}
});
function figure(){
 const shirt={isMesh:true,userData:{hero61Slot:'top'},material:fakeMat('top',{})};
 const patch={isMesh:true,userData:{hero61Slot:'top'},material:fakeMat('top',null)};
 const skin={isMesh:true,userData:{hero61Slot:'skin'},material:fakeMat('skin',{})};
 const hair={isMesh:true,userData:{hero61Slot:'hair'},material:fakeMat('hair',{})};
 const g={userData:{},traverse(fn){[shirt,patch,skin,hair].forEach(fn)}};
 return {g,shirt,patch,skin,hair};
}
// The default color must not touch the source shirt material.
let a=figure(),original=a.shirt.material;
ctx.hero61Dress(a.g);
assert.equal(a.shirt.material,original,'default Sky must leave V61 shirt untouched');
assert.equal(a.g.userData.shirt66,'sky');
// Select coral; preserved alongside other saved design choices.
ctx.ACTIONS.shirt66set({v:'coral'});
assert.equal(ctx.S.p[0].colors.shirt66,'coral');assert.equal(ctx.S.p[0].colors.shoe,'white');
assert.equal(buildCount,1);
a=figure();const oldSkin=a.skin.material,oldHair=a.hair.material,oldShirt=a.shirt.material;
ctx.hero61Dress(a.g);
assert.notEqual(a.shirt.material,oldShirt);
assert.equal(a.skin.material,oldSkin);
assert.equal(a.hair.material,oldHair);
assert.equal(a.patch.material.color.hex,'#CB765D');
assert.equal(a.shirt.material.userData.cdShirt66,'coral');
const shader={fragmentShader:'void main() {\\n#include <map_fragment>\\n}'};
a.shirt.material.onBeforeCompile(shader,{});
assert(shader.fragmentShader.includes('shirt66Luma'));
assert(shader.fragmentShader.includes('vec3(0.2500000, 0.5000000, 0.7500000)'));
// Player 2 and classic fallback never get V61 shirt tints.
const b=figure();b.g.userData.hero61=false;
assert.equal(ctx.shirt66Dress(b.g,{pi:0,colors:{shirt66:'coral'}}),b.g);
assert.equal(b.shirt.material.userData.cdShirt66,undefined);
const c=figure();c.g.userData.hero61=true;
ctx.shirt66Dress(c.g,{pi:1,colors:{shirt66:'coral'}});
assert.equal(c.shirt.material.userData.cdShirt66,undefined);
ctx.ACTIONS.shirt66set({v:'unknown'});
assert.equal(ctx.S.p[0].colors.shirt66,'coral');
assert(CSS.includes(':focus-visible'));
console.log('PASS: six palette options; original material preserved by default; coral top shader+patch; skin/hair unaffected; local state persists; fallback safe.');
