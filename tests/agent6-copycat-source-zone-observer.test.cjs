'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PRINTS,summarizeCopycatInitialPhysicalZones,createCopycatInitialPhysicalObserver}=
  require('../simulation/evaluation/agent6-copycat-source-zone-observer.cjs');

/** @param {string} fullName */
function card(fullName){return {fullName};}
/** @param {object[]} cards */
function zone(cards=[]){return {cards};}
function state(){
 const source={
  hand:zone([card(PRINTS.seal),card('Psychic Energy MEE')]),
  active:zone([card(PRINTS.shadowRiderV)]),
  bench:[zone([card(PRINTS.mimikyu)])],
  prizes:[zone([card(PRINTS.dialga)]),...Array.from({length:5},()=>zone([card('Other')]))],
  deck:zone([card(PRINTS.ball),card(PRINTS.shadowRiderV),card(PRINTS.shadowRiderV)]),
  discard:zone(),lostzone:zone(),stadium:zone(),supporter:zone()
 };
 return {phase:2,turn:1,prompts:[],players:[source,{hand:zone(),prizes:[],deck:zone()}]};
}
test('staged Active/Bench Basics are still counted in postsetup opening',()=>{
 const s=state();const r=summarizeCopycatInitialPhysicalZones(s,0,3);
 assert.equal(r.physicalLocations.mimikyu,'opening');
 assert.equal(r.physicalLocations.dialga,'prizes');
 assert.equal(r.physicalLocations.ball,'deck');
 assert.equal(r.physicalLocations.seal,'opening');
 assert.equal(r.shadowRiderV.opening,1);
 assert.equal(r.shadowRiderV.inPlay,1);
 assert.equal(r.heldSealWithInPlayV,true);
 assert.equal(r.initialSevenComparable,false);
});
test('observer captures only stable first pre-action root and freezes snapshot',()=>{
 const o=createCopycatInitialPhysicalObserver(0,3);
 const s=state();s.phase=1;o.observe(s);assert.equal(o.result(),null);
 s.phase=2;s.prompts=[{id:3}];o.observe(s);assert.equal(o.result(),null);
 s.prompts=[{id:3,result:true}];o.observe(s);
 assert.ok(o.result());
 s.players[0].deck.cards[0].fullName='Lost';o.observe(s);
 assert.equal(o.result().physicalLocations.ball,'deck');
 assert.ok(Object.isFrozen(o.result()));
});
test('different owner seat and no V in play do not invent a ready Tool path',()=>{
 const s=state();const source=s.players[0];s.players.reverse();
 source.active=zone([card('Other Basic')]);
 source.bench=[zone([card(PRINTS.mimikyu)])];
 source.hand.cards.push(card(PRINTS.shadowRiderV));
 const r=summarizeCopycatInitialPhysicalZones(s,1,3);
 assert.equal(r.shadowRiderV.inPlay,0);
 assert.equal(r.heldSealWithInPlayV,false);
});
test('source exact-print counts and pre-action root fail closed',()=>{
 const s=state();s.players[0].deck.cards.push(card(PRINTS.seal));
 assert.throws(()=>summarizeCopycatInitialPhysicalZones(s,0,3));
 s.players[0].deck.cards.pop();s.turn=2;
 assert.throws(()=>summarizeCopycatInitialPhysicalZones(s,0,3));
});
