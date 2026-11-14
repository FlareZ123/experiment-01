'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  auditKnownActionEnumeratorCaps,
  assertKnownActionEnumeratorCapsClear,
  assertActionFrontierAdmissionClear,
  SCHEMA
} = require('../../simulation/evaluation/2026-11/agent3-action-enumerator-cap-audit.cjs');

class PokemonCard {
  constructor({name='P',stage='BASIC',evolvesFrom=null,powers=[]}={}) {
    this.name=name; this.stage=stage; this.evolvesFrom=evolvesFrom; this.powers=powers;
  }
}
class TrainerCard { constructor(trainerType){this.trainerType=trainerType;} }
class EnergyCard { constructor(fullName){this.fullName=fullName;} }
const native={
  PokemonCard,TrainerCard,EnergyCard,
  PlayerType:{BOTTOM_PLAYER:1},Stage:{BASIC:'BASIC'},
  TrainerType:{ITEM:'ITEM',TOOL:'TOOL',SUPPORTER:'SUPPORTER'}
};
function makeState({hand=[],benchCount=1,emptyBench=1,pokemon=[],discard=[],energyPlayedTurn=0,supporterPlayed=false,supporterTurn=0,turn=7}={}){
  const board=pokemon.map((entry,i)=>({
    cardList:{pokemonPlayedTurn:entry.pokemonPlayedTurn??0,tools:entry.tools??[]},
    card:entry.card??new PokemonCard({name:'Board'+i,powers:entry.powers??[]}),
    target:{index:i}
  }));
  const player={
    hand:{cards:hand},
    bench:Array.from({length:benchCount},(_,i)=>({cards:i<emptyBench?[]:[{}]})),
    discard:{cards:discard},
    supporter:{cards:supporterPlayed?[{}]:[]},
    energyPlayedTurn,supporterTurn,
    forEachPokemon(_which,callback){for(const p of board)callback(p.cardList,p.card,p.target);}
  };
  return {activePlayer:0,turn,players:[player,{hand:{cards:[]},bench:[],discard:{cards:[]}}]};
}

test('reports a clean known-cap frontier when every capped family has at most eight candidates',()=>{
  const state=makeState({
    hand:[new TrainerCard('ITEM'),new EnergyCard('Basic Psychic')],
    pokemon:[{card:new PokemonCard({name:'Board0',powers:[{useWhenInPlay:true}]})}]
  });
  const result=auditKnownActionEnumeratorCaps({state,actorSeat:0,native});
  assert.equal(result.schema,SCHEMA);
  assert.equal(result.knownUpstreamCapsClear,true);
  assert.deepEqual(result.cappedFamilies,[]);
  assert.equal(result.potentialCounts.playItems,1);
  assert.equal(result.potentialCounts.attachEnergy,1);
});

test('detects overflow independently for every known upstream cap family',()=>{
  const board=Array.from({length:3},(_,i)=>({
    card:new PokemonCard({name:'Base'+i,powers:[
      {useWhenInPlay:true},{useWhenInPlay:true},{useWhenInPlay:true}
    ]}),
    pokemonPlayedTurn:0,tools:[]
  }));
  const hand=[
    ...Array.from({length:9},(_,i)=>new PokemonCard({name:'Evolution'+i,stage:'STAGE_1',evolvesFrom:'Base0'})),
    ...Array.from({length:9},(_,i)=>new PokemonCard({name:'Basic'+i,stage:'BASIC'})),
    ...['E1','E2','E3'].map(x=>new EnergyCard(x)),
    ...Array.from({length:3},()=>new TrainerCard('TOOL')),
    ...Array.from({length:9},()=>new TrainerCard('ITEM')),
    ...Array.from({length:9},()=>new TrainerCard('SUPPORTER'))
  ];
  const discard=Array.from({length:9},(_,i)=>new PokemonCard({
    name:'Discard'+i,powers:[{useFromDiscard:true}]
  }));
  const state=makeState({hand,pokemon:board,discard,benchCount:1,emptyBench:1});
  const result=auditKnownActionEnumeratorCaps({state,actorSeat:0,native});
  const names=result.cappedFamilies.map(x=>x.family).sort();
  assert.deepEqual(names,[
    'attachEnergy','attachTool','discardAbilities','evolve','inPlayAbilities',
    'playBasic','playItems','playSupporters'
  ].sort());
  for(const family of result.cappedFamilies){
    assert.ok(family.potentialCount>8);
    assert.equal(family.minimumOmitted,family.potentialCount-8);
  }
  assert.equal(result.knownUpstreamCapsClear,false);
});

test('respects native per-turn gates and empty-Bench constraints',()=>{
  const state=makeState({
    hand:[new EnergyCard('E1'),new TrainerCard('SUPPORTER'),new PokemonCard({name:'Evo',evolvesFrom:'Base',stage:'STAGE_1'})],
    pokemon:[{card:new PokemonCard({name:'Base'}),pokemonPlayedTurn:7}],
    benchCount:1,emptyBench:0,energyPlayedTurn:7,supporterPlayed:true,turn:7
  });
  const result=auditKnownActionEnumeratorCaps({state,actorSeat:0,native});
  assert.equal(result.potentialCounts.evolve,0);
  assert.equal(result.potentialCounts.playBasic,0);
  assert.equal(result.potentialCounts.attachEnergy,0);
  assert.equal(result.potentialCounts.playSupporters,0);
  assert.equal(result.knownUpstreamCapsClear,true);
});

test('fail-closed assertion rejects a frontier that hit a known upstream cap',()=>{
  const state=makeState({hand:Array.from({length:9},()=>new TrainerCard('ITEM'))});
  const audit=auditKnownActionEnumeratorCaps({state,actorSeat:0,native});
  assert.throws(()=>assertKnownActionEnumeratorCapsClear(audit),error=>
    error.code==='NATIVE_ACTION_ENUMERATOR_UPSTREAM_CAP'&&
    error.cappedFamilies.some(x=>x.family==='playItems'&&x.minimumOmitted===1));
});


test('exactly eight Item candidates do not imply upstream truncation',()=>{
  const state=makeState({hand:Array.from({length:8},()=>new TrainerCard('ITEM'))});
  const audit=auditKnownActionEnumeratorCaps({state,actorSeat:0,native});
  assert.equal(audit.potentialCounts.playItems,8);
  assert.equal(audit.knownUpstreamCapsClear,true);
  assert.doesNotThrow(()=>assertKnownActionEnumeratorCapsClear(audit));
});

test('Energy candidate count follows the upstream fullName deduplication',()=>{
  const hand=Array.from({length:9},()=>new EnergyCard('Basic Psychic'));
  const pokemon=Array.from({length:8},(_,i)=>({
    card:new PokemonCard({name:'Board'+i}),tools:[]
  }));
  const state=makeState({hand,pokemon});
  const audit=auditKnownActionEnumeratorCaps({state,actorSeat:0,native});
  assert.equal(audit.potentialCounts.attachEnergy,8);
  assert.equal(audit.knownUpstreamCapsClear,true);
});


test('combined admission gate requires a clear upstream audit and local frontier diagnostics',()=>{
  const state=makeState({hand:[new TrainerCard('ITEM')]});
  const result=assertActionFrontierAdmissionClear({
    state,actorSeat:0,native,
    frontierDiagnostics:{truncated:false,omittedCount:0,unsupportedCount:0,enumeratedCount:4,validatedCount:4}
  });
  assert.equal(result.capAudit.knownUpstreamCapsClear,true);
  assert.equal(result.frontierDiagnostics.omittedCount,0);
  assert.throws(()=>assertActionFrontierAdmissionClear({
    state,actorSeat:0,native,
    frontierDiagnostics:{truncated:true,omittedCount:1,unsupportedCount:0}
  }),error=>error.code==='NATIVE_ACTION_FRONTIER_LOCAL_CAP');
  assert.throws(()=>assertActionFrontierAdmissionClear({
    state,actorSeat:0,native
  }),/adapter frontier diagnostics are required/);
  assert.throws(()=>assertActionFrontierAdmissionClear({
    state,actorSeat:0,native,
    frontierDiagnostics:{truncated:false,omittedCount:0,unsupportedCount:1}
  }),error=>error.code==='NATIVE_ACTION_FRONTIER_UNSUPPORTED_ACTIONS');
});
