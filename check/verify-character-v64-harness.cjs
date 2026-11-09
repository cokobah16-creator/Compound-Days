#!/usr/bin/env node
// V64 static test: validates syntax, safety defaults, and shipped Three imports.
// DOES NOT claim the Chromium render benchmark has passed.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'dist/character-v64-bench.html'),'utf8');
const scripts=[...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert(scripts.length>0,'Missing bench inline JS');
new vm.Script(scripts.at(-1)[1],{filename:'character-v64-bench.html'});
assert(src.includes('assets/vendor/three-r128.min.js'),'Not using shipped Three.js r128');
assert(src.includes('src/character-audition-loader-r128.js'),'Not using shipped GLTFLoader');
assert(src.includes('assets/characters/efe.gltf.json'),'Not comparing shipped hero');
assert(src.includes('input id="candidateInput"'),'Missing local candidate upload');
assert(src.includes('frustumCulled'),'Frustum safety statement missing');
assert(!/\.frustumCulled\s*=\s*false/.test(src),'Unsafe frustum-culling bypass present');
assert(!/root\.scale\.multiplyScalar/.test(src),'Candidate scale normalization could hide the regression');
for(const v of ['390,844','844,390','1024,768'])assert(src.includes(v),'Missing viewport '+v);
for(const c of ['Idle','Walk','Carry','Pick','Wave'])assert(src.includes("'"+c+"'"),'Missing clip '+c);
assert(src.includes('renderer.info.render.triangles'),'Real WebGL render counter missing');
assert(src.includes('gl.readPixels'),'Framebuffer coverage verification missing');
assert(!/window\.location\s*=|fetch\('https?:/.test(src),'Unexpected external data dependency');
const runner=fs.readFileSync(path.join(root,'check/bench-character-v64.cjs'),'utf8').replace(/^#![^\n]*\n/,'');
new vm.Script(runner,{filename:'bench-character-v64.cjs'});
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
assert(vercel.rewrites.some(r=>r.source==='/character-v64-bench.html'&&r.destination==='/dist/character-v64-bench.html'),
 'Bench route not configured');
console.log('PASS V64 static checks: Three.js r128, candidate upload, safe raw transform, 3 screen sizes, 5 clips, viewport stats and syntax.');
console.log('NOTE: Must still run the separate Chromium benchmark with the actual V63 GLB before art/game approval.');
