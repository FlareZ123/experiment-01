'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
const STONE='Float Stone BKT';
const replacement='Oranguru V ASR';
const fullName=printing=>({fullName:printing});
function slot(name,tools=[]){
  return {getPokemonCard:()=>name?fullName(name):null,
    getPokemons:()=>name?[fullName(name)]:[],
    energies:{cards:[]},tools:tools.map(fullName)};
}
function position(){
  return {turn:7,phase:2,players:[{
    hand:{cards:[fullName(STONE)]},
    active:slot('Garbodor BKP'),
    bench:[slot(null),slot(replacement),slot(null)],
    stadium:{cards:[]},discard:{cards:[]},supporter:{cards:[]},
    retreatedTurn:0
  }]};
}
const attach={kind:'attach-emergency-floatstone',
  handIndex:0,printing:replacement,benchIndex:1};
const retreat={kind:'retreat-emergency-floatstone',
  benchIndex:1,printing:replacement};
function witness(intent,before,after){
  return rootPhysicalWitness(intent,before,after,{FINISHED:7});
}
test('true Float Stone attaches on Active and is witnessed despite intent printing being replacement name',()=>{
  const state=position();
  const before=rootPhysicalSnapshot(state,0,attach);
  state.players[0].active.tools.push(fullName(STONE));
  state.players[0].hand.cards.shift();
  const after=rootPhysicalSnapshot(state,0,attach);
  assert.deepEqual(after.activeToolPrintings,[STONE]);
  assert.equal(witness(attach,before,after),'confirmed-public-effect');
});
test('Tool on wrong zone or still in hand does not witness owner mobility attachment',()=>{
  const state=position(),before=rootPhysicalSnapshot(state,0,attach);
  state.players[0].bench[1].tools.push(fullName(STONE));
  state.players[0].hand.cards.shift();
  assert.equal(witness(attach,before,rootPhysicalSnapshot(state,0,attach)),
    'no-confirmed-public-effect');
  state.players[0].active.tools.push(fullName(STONE));
  state.players[0].hand.cards.push(fullName(STONE));
  assert.equal(witness(attach,before,rootPhysicalSnapshot(state,0,attach)),
    'no-confirmed-public-effect');
});
test('physical zero-Energy retreat promotes intended Bench and records quota',()=>{
  const state=position(),before=rootPhysicalSnapshot(state,0,retreat);
  const owner=state.players[0];
  [owner.active,owner.bench[1]]=[owner.bench[1],owner.active];
  owner.retreatedTurn=state.turn;
  const after=rootPhysicalSnapshot(state,0,retreat);
  assert.equal(after.activePokemonPrinting,replacement);
  assert.equal(after.targetPokemonPrinting,'Garbodor BKP');
  assert.equal(witness(retreat,before,after),'confirmed-public-effect');
});
test('wrong Bench promotion and missing native retreat quota are both rejected',()=>{
  const state=position(),before=rootPhysicalSnapshot(state,0,retreat);
  const owner=state.players[0];
  [owner.active,owner.bench[2]]=[owner.bench[2],owner.active];
  owner.retreatedTurn=state.turn;
  assert.equal(witness(retreat,before,rootPhysicalSnapshot(state,0,retreat)),
    'no-confirmed-public-effect');
  const other=position(),beforeOther=rootPhysicalSnapshot(other,0,retreat);
  [other.players[0].active,other.players[0].bench[1]]=[
    other.players[0].bench[1],other.players[0].active
  ];
  assert.equal(witness(retreat,beforeOther,rootPhysicalSnapshot(other,0,retreat)),
    'no-confirmed-public-effect');
});
test('no change of either type cannot confirm a native physical mobility effect',()=>{
  const state=position();
  for(const intent of [attach,retreat]){
    const before=rootPhysicalSnapshot(state,0,intent);
    assert.equal(witness(intent,before,before),'no-confirmed-public-effect');
  }
});
