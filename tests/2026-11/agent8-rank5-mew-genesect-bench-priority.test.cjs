'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,actorSpecialEnergyEnabled}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {chooseMewGenesectBenchIndex}=
  require('../../simulation/twinleaf/2026-11/agent8-mew-genesect-bench-priority.cjs');
const M='Mew V FST',G='Genesect V FST',D='Dedenne-GX UNB';
const C='Lillie\'s Clefairy ex JTG';
const basic=printing=>({printing,energies:[],attacks:[]});
const view=(hand,active=D,bench=[null,null,null,null,null])=>({
  decisionKind:'owner-root',actorSeat:1,globalTurn:3,
  ownHand:hand,
  ownTurnResources:{
    pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
    energyPlayLocked:false,energyPlayedTurn:2
  },
  ownPublic:{active:basic(active),bench,stadium:[]},
  opponentPublic:{stadium:[]}
});
const catalog={
  basics:new Set([M,G,D,C]),
  abilityBasics:new Set([G,D]),
  specialEnergies:new Set(),
  basicEnergies:new Set(),
  basicEnergyTypes:{},colorlessEnergyType:0
};
const choose=(v,opt=true)=>chooseActorRootIntent(v,catalog,{
  mewGenesectBenchFirst:opt
});

test('first Mew attacker precedes off-axis held Dedenne and Clefairy',()=>{
  const v=view([C,D,M,G]);
  const r=choose(v);
  assert.equal(r.kind,'bench-basic');
  assert.equal(r.printing,M);
  assert.equal(r.handIndex,2);
});
test('Genesect first before off-axis Basic once an attacker exists',()=>{
  const v=view([C,D,G],M);
  const r=choose(v);
  assert.equal(r.printing,G);
  assert.equal(r.handIndex,2);
});
test('missing Mew remains first when hand holds both role cards',()=>{
  const v=view([G,M],D);
  assert.equal(choose(v).printing,M);
});
test('one in-play Genesect does not block missing Mew priority',()=>{
  const v=view([C,M],D,[basic(G),null,null,null,null]);
  assert.equal(choose(v).printing,M);
});
test('existing attacker and engine restore generic ordering',()=>{
  const v=view([C,D,M,G],M,[basic(G),null,null,null,null]);
  assert.equal(choose(v).printing,C);
});
test('policy disabled is byte-for-byte generic first held Basic ordering',()=>{
  const v=view([C,M,G]);
  const r=choose(v,false);
  assert.equal(r.printing,C);
  assert.equal(r.handIndex,0);
});
test('owner Ability-play lock excludes Genesect even when engine missing',()=>{
  const v=view([G,C],M);
  v.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.equal(choose(v).printing,C);
});
test('public missing role without held card does not fabricate Bench action',()=>{
  const v=view([C,D],M);
  assert.equal(chooseMewGenesectBenchIndex(v,[0,1]),null);
});
test('owner source seat scoping remains exact for both placements',()=>{
  for(const source of [0,1]){
    assert.equal(actorSpecialEnergyEnabled(true,source,source),true);
    assert.equal(actorSpecialEnergyEnabled(true,source,1-source),false);
  }
});
