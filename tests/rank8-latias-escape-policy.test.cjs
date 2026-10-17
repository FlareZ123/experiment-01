'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceEscapeOpportunity} =
  require('../simulation/twinleaf/rank8-latias-escape-policy.cjs');

/** @param {string} name @param {object} [extra] */
const card=(name,extra={})=>({name,fullName:name+' source',...extra});
/** @param {string} name @param {number} basicPsychic @param {object[]} tools */
const slot=(name,basicPsychic=0,tools=[])=>({
  getPokemonCard(){return card(name);},
  energies:{cards:Array.from({length:basicPsychic},()=>card('Psychic Energy'))},
  tools:{cards:tools}
});
function source() {
  const me={
    id:101,active:slot('Latias ex',2),
    bench:[slot('Trevenant & Dusknoir-GX',3)],
    hand:{cards:[card('Field Blower')]}
  };
  const foe={id:202,
    bench:[slot('Garbodor',0,[card('Float Stone')])]};
  Object.defineProperty(me,'deck',{get(){throw Error('Own hidden deck accessed')}});
  Object.defineProperty(foe,'deck',{get(){throw Error('Opponent hidden deck accessed')}});
  Object.defineProperty(foe,'hand',{get(){throw Error('Opponent hand accessed')}});
  const state={turn:21,phase:2,activePlayer:0,players:[me,foe],prompts:[]};
  return {state,me,foe};
}

test('tool route identifies the source conjunction using no hidden zones',()=>{
  const {state,me}=source();
  assert.deepEqual(sourceEscapeOpportunity(state,me,'tool'),{
    turn:21,benchIndex:0,garbodorIndex:0,blowerIndex:0,
    latiasEnergy:['Psychic Energy source','Psychic Energy source'],
    targetEnergy:Array.from({length:3},()=> 'Psychic Energy source')
  });
});
test('paid retreat remains possible without Field Blower in hand',()=>{
  const {state,me}=source();me.hand.cards=[];
  assert.equal(sourceEscapeOpportunity(state,me,'tool'),null);
  assert.equal(sourceEscapeOpportunity(state,me,'paid').benchIndex,0);
});
test('source access is gated by an own-turn Pass window and pending prompts',()=>{
  const {state,me}=source();
  state.turn=19;
  assert.equal(sourceEscapeOpportunity(state,me,'tool'),null);
  state.turn=23;state.activePlayer=1;
  assert.equal(sourceEscapeOpportunity(state,me,'tool'),null);
  state.activePlayer=0;state.prompts=[{result:undefined}];
  assert.equal(sourceEscapeOpportunity(state,me,'tool'),null);
});
test('candidate attack route requires an already powered Bench attacker',()=>{
  const {state,me}=source();
  me.bench=[slot('Trevenant & Dusknoir-GX',2)];
  assert.equal(sourceEscapeOpportunity(state,me,'tool'),null);
});
test('Tool mode requires active opposing Garbotoxin prerequisite',()=>{
  const {state,me,foe}=source();
  foe.bench[0].tools.cards=[];
  assert.equal(sourceEscapeOpportunity(state,me,'tool'),null);
  assert.equal(sourceEscapeOpportunity(state,me,'paid'),null);
});
