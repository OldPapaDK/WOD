import {compile,position} from './engine.mjs';
import assert from 'node:assert/strict';
const b={type:'EMOM',work:60,transition:15,rest:10,rounds:4,sets:2,setRest:60,direction:'down'};
const p=compile([b]);assert.equal(p.reduce((n,s)=>n+s.duration,0),630);assert.equal(p.filter(s=>s.phase==='Skift').length,6);assert.equal(p.filter(s=>s.phase==='Sætpause').length,1);assert.equal(position(p,60).segment.phase,'Skift');assert.equal(position(p,75).segment.phase,'Arbejde');assert.equal(position(p,630),null);
const mix=compile([{...b,type:'AMRAP',work:600,rounds:1,sets:1},{...b,type:'TABATA',work:20,rounds:8,sets:1}]);assert.equal(mix.reduce((n,s)=>n+s.duration,0),830);assert.equal(position(mix,600).segment.type,'TABATA');assert.equal(position(mix,621).segment.phase,'Pause');assert.throws(()=>compile([{...b,work:0}]));assert.throws(()=>compile([{...b,rounds:1.5}]));assert.equal(compile([{...b,type:'For Time',direction:'up'}])[0].direction,'up');console.log('Timer tests passed: EMOM transitions, set rests, MIX, exact boundaries, For Time and validation.');

const withRest=compile([{...b,sets:1,rounds:1,blockRest:90},{...b,sets:1,rounds:1}]);assert.equal(withRest[1].phase,'Blokpause');assert.equal(withRest.reduce((n,s)=>n+s.duration,0),210);

// Regression: remaining seconds must be relative to each interval, not workout start.
for(let t=0;t<630;t+=0.25){const state=position(p,t);assert.ok(state.remaining>0);assert.ok(state.remaining<=state.segment.duration);assert.ok(Math.abs(state.remaining+state.elapsed-state.segment.duration)<1e-8);}
assert.equal(position(p,60).remaining,15);assert.equal(position(p,61).remaining,14);assert.equal(position(p,74).remaining,1);assert.equal(position(p,75).remaining,60);assert.equal(position(p,76).remaining,59);
const tabata=compile([{...b,type:'TABATA',work:20,rest:10,rounds:3,sets:1}]);assert.equal(position(tabata,20).remaining,10);assert.equal(position(tabata,25).remaining,5);assert.equal(position(tabata,30).remaining,20);assert.equal(position(tabata,31).remaining,19);
console.log('Regression passed: countdown stays correct throughout every work, rest and set interval.');
