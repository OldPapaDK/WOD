import {compile,position} from './engine.mjs';
import assert from 'node:assert/strict';
const b={type:'EMOM',work:60,transition:15,rest:10,rounds:4,sets:2,setRest:60,direction:'down'};
const p=compile([b]);assert.equal(p.reduce((n,s)=>n+s.duration,0),630);assert.equal(p.filter(s=>s.phase==='Skift').length,6);assert.equal(p.filter(s=>s.phase==='Sætpause').length,1);assert.equal(position(p,60).segment.phase,'Skift');assert.equal(position(p,75).segment.phase,'Arbejde');assert.equal(position(p,630),null);
const mix=compile([{...b,type:'AMRAP',work:600,rounds:1,sets:1},{...b,type:'TABATA',work:20,rounds:8,sets:1}]);assert.equal(mix.reduce((n,s)=>n+s.duration,0),830);assert.equal(position(mix,600).segment.type,'TABATA');assert.equal(position(mix,621).segment.phase,'Pause');assert.throws(()=>compile([{...b,work:0}]));assert.throws(()=>compile([{...b,rounds:1.5}]));assert.equal(compile([{...b,type:'For Time',direction:'up'}])[0].direction,'up');console.log('Timer tests passed: EMOM transitions, set rests, MIX, exact boundaries, For Time and validation.');

const withRest=compile([{...b,sets:1,rounds:1,blockRest:90},{...b,sets:1,rounds:1}]);assert.equal(withRest[1].phase,'Blokpause');assert.equal(withRest.reduce((n,s)=>n+s.duration,0),210);
