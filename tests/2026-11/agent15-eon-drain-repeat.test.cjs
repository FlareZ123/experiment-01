'use strict';
const assert=require('node:assert/strict');
const {branch}=require('../../scripts/2026-11/agent15-eon-drain-repeat.cjs');
for (const k of ['covert','phantom','trifrost','ryuno','rolling','timelessPhantom']){
  const v=branch({secondReply:k});
  assert.equal(v.win,true,JSON.stringify({k,why:v.why}));
  assert.equal(v.own,6);
  if(k==='timelessPhantom')assert.equal(v.source,3);
  else assert.equal(v.source,0);
}
for (const v of [
  {valley:false},{fairy:false},{skyliner:false},
  {heldPsychic:1},{door:false},{manual:false},
  {ranger:false,secondReply:'rolling'},
  {priorSourcePrizes:3,secondReply:'timelessPhantom'},
  {secondReply:'phantom',initialClefairyDamage:140},
  {secondReply:'trifrost',initialClefairyDamage:120}
])assert.equal(branch(v).win,false,JSON.stringify(v));
assert.equal(branch({ranger:false,secondReply:'covert'}).win,true);
assert.equal(branch({ranger:false,secondReply:'phantom'}).win,true);
assert.equal(branch({ranger:false,secondReply:'ryuno'}).win,true);
assert.equal(branch({ranger:false,secondReply:'timelessPhantom'}).win,true);
const repeat=branch({secondReply:'covert'});
assert.equal(repeat.trace.at(-1).label,'A3 repeated Max Drain final VSTAR KO');
assert.equal(repeat.trace.at(-1).deoxysEnergy,2);
console.log('Eon Drain repeat exact conditional suite passed');
