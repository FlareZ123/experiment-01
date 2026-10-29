'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const corpus=require('../results/aichi-2026/full-decklists.json');
const {chooseActorRootIntent}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const rank10=corpus.decks.find(d=>d.rank===10);
const rank6=corpus.decks.find(d=>d.rank===6);
const count=(d,n,s)=>d.cards.filter(c=>c.name===n&&c.printing?.set===s)
  .reduce((v,c)=>v+c.count,0);
// The pinned CardManager spells the source Dedenne-GX UNB as Dedenne GX UNB.
const DEN='Dedenne GX UNB',ATTACKER='Regidrago V SIT';
const catalog={basics:new Set([DEN,ATTACKER]),abilityBasics:new Set([DEN]),
  basicEnergies:new Set(),basicEnergyTypes:{Lightning:4},
  colorlessEnergyType:9,specialConditions:{ASLEEP:1,PARALYZED:2}};
function owner(hand){
  return {decisionKind:'owner-root',globalTurn:2,ownHand:hand,
    ownPublic:{active:{name:'Budew',printing:'Budew ASC',attacks:[],
      energies:[],specialConditions:[],publicRestrictions:{}},
      bench:[{name:'Regidrago V'},{name:'Budew'},{name:'Latias ex'},
        {name:'Marshadow'},null],prizeCount:6,
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{active:{name:'Iron Thorns ex',
      printing:'Iron Thorns ex TWM'},bench:[null,null,null,null,null]},
    ownTurnResources:{pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
      energyPlayLocked:false,energyPlayedTurn:0}};
}
test('authentic rank10 and rank6 inventories contain the conflict printings',()=>{
  assert.equal(rank10.archetype,'Regidrago');
  assert.equal(rank6.archetype,'Iron Thorns');
  assert.equal(count(rank10,'Dedenne-GX','UNB'),1);
  assert.equal(count(rank10,'Regidrago V','SIT'),4);
  assert.equal(count(rank6,'Iron Thorns ex','TWM'),4);
  for(const d of [rank10,rank6])
    assert.equal(d.cards.reduce((n,c)=>n+c.count,0),60);
});
test('last Bench slot choice depends on owner hand order',()=>{
  assert.deepEqual(chooseActorRootIntent(owner([DEN,ATTACKER]),catalog),
    {kind:'bench-basic',handIndex:0,benchIndex:4,printing:DEN});
  assert.deepEqual(chooseActorRootIntent(owner([ATTACKER,DEN]),catalog),
    {kind:'bench-basic',handIndex:0,benchIndex:4,printing:ATTACKER});
});
test('hand-play prohibition differs from in-play Ability suppression',()=>{
  const v=owner([DEN,ATTACKER]);
  v.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.equal(chooseActorRootIntent(v,catalog).printing,ATTACKER);
  const unblocked=owner([DEN,ATTACKER]);
  assert.equal(unblocked.ownTurnResources.abilityPokemonPlayLocked,false);
  assert.equal(chooseActorRootIntent(unblocked,catalog).printing,DEN);
});
