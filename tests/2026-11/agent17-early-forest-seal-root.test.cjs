'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {STONE,pokemonV,chooseForestSealEarly}=
  require('../../simulation/twinleaf/2026-11/agent17-forest-seal-early-root.cjs');

const catalog={toolPrintings:new Set([STONE,'Stealthy Hood UNB'])};
const v=(tools=[])=>({name:'Shadow Rider Calyrex V',
  printing:'Shadow Rider Calyrex V CRE',tools});
function view({
  hand=[STONE,'Stealthy Hood UNB'],active=v(),
  bench=[null,null,null,null,null],deck=40,
  toolLock=false,vstarUsed=false
}={}){
  return {decisionKind:'owner-root',globalTurn:1,
    ownHand:hand,ownPublic:{
      active,bench,deckCount:deck,
      publicTurnRestrictions:{toolPlayLocked:toolLock,vstarUsed}
    },
    ownTurnResources:{toolPlayLocked:toolLock},
    opponentPublic:{handCount:7,deckCount:46}
  };
}
test('visible owner Stone attaches to first free Pokémon V holder',()=>{
  assert.equal(pokemonV(v()),true);
  assert.equal(pokemonV({name:'Pidgeot ex'}),false);
  assert.deepEqual(chooseForestSealEarly(view(),catalog),{
    kind:'attach-tool-candidate',printing:STONE,handIndex:0,
    slot:'active',index:0,
    source:'agent17-owner-held-forest-seal-early-v1',
    holder:'Shadow Rider Calyrex V CRE'
  });
});
test('placed Stone opens genuine named Star Alchemy native intent',()=>{
  assert.deepEqual(chooseForestSealEarly(view({
    hand:['Psychic Energy MEE'],active:v([STONE])
  }),catalog),{
    kind:'use-forest-star-alchemy',slot:'active',index:0,
    source:'agent17-owner-held-forest-seal-early-v1',
    holder:'Shadow Rider Calyrex V CRE'
  });
});
test('respects spent VSTAR or empty owner deck',()=>{
  assert.equal(chooseForestSealEarly(view({vstarUsed:true}),catalog),null);
  assert.equal(chooseForestSealEarly(view({deck:0}),catalog),null);
});
test('respects Tool play lock and occupied Tool slot',()=>{
  assert.equal(chooseForestSealEarly(view({toolLock:true}),catalog),null);
  assert.equal(chooseForestSealEarly(view({active:v(['Stealthy Hood UNB'])}),catalog),null);
});
test('works with a real Bench VMAX Tool slot after active becomes blocked',()=>{
  const result=chooseForestSealEarly(view({
    active:{name:'Pidgeot ex',printing:'Pidgeot ex OBF',tools:[]},
    bench:[{name:'Shadow Rider Calyrex VMAX',
      printing:'Shadow Rider Calyrex VMAX CRE',tools:[]},
      null,null,null,null]
  }),catalog);
  assert.equal(result.slot,'bench');
  assert.equal(result.index,0);
});
test('requires actual held exact Tool and public typed Tool printing',()=>{
  assert.equal(chooseForestSealEarly(view({hand:['Stealthy Hood UNB']}),catalog),null);
  assert.equal(chooseForestSealEarly(view(),{toolPrintings:new Set()}),null);
});
test('private opposing data does not change owner-only choice',()=>{
  const observation=view();
  const result=chooseForestSealEarly(observation,catalog);
  delete observation.opponentPublic;
  assert.deepEqual(chooseForestSealEarly(observation,catalog),result);
});
