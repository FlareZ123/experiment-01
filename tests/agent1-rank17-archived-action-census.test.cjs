'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {censusOriginalActionRoots}=
  require('../simulation/evaluation/agent1-rank17-archived-action-census.cjs');
const manifest={decks:[
  {rank:17,cards:[
    {category:'Pokémon',name:'Ditto ♢',count:1},
    {category:'Pokémon',name:'Pikachu',count:1},
    {category:'Trainer',name:'Battle Compressor',count:4},
    {category:'Energy',name:'Reversal Energy',count:4},
    {category:'Energy',name:'Counter Energy',count:4},
    {category:'Energy',name:'Unit Energy LPM',count:4},
    {category:'Pokémon',name:'Voltorb',count:42}
  ]},
  {rank:1,cards:[
    {category:'Pokémon',name:'Shadow Rider Calyrex V',count:4},
    {category:'Energy',name:'Psychic Energy',count:11},
    {category:'Trainer',name:'Mysterious Treasure',count:4},
    {category:'Trainer',name:'Field Blower',count:1},
    {category:'Pokémon',name:'Mimikyu',count:40}
  ]}
]};
const sourceRoot=(action,card)=>({action,turnBefore:1,
  playerSlot:0,...(card?{card}:{})});
const otherRoot=(action,card)=>({action,turnBefore:2,
  playerSlot:1,...(card?{card}:{})});
function archive(){
 const pairs=Array.from({length:19},(_,i)=>{
  const cohort=i<3?'known-positive':'fresh';
  const state={
    error:null,allNativeRootActions:[
      {action:'ResolvePromptAction',turnBefore:0,playerSlot:0},
      sourceRoot('PassTurnAction'),
      otherRoot('PlayCardAction','Psychic Energy'),
      otherRoot('AttackAction')
    ]
  };
  return {cohort,sourceSeat:0,
    control:structuredClone(state),treatment:structuredClone(state)};
 });
 return {attemptedNativeArms:38,pairs};
}
test('counts all original physical player roles across 38 arms and separates setup',()=>{
 const x=censusOriginalActionRoots(archive(),manifest);
 assert.equal(x.roles.source.total,76);
 assert.equal(x.roles.source.setupRootCount,38);
 assert.equal(x.roles.source.gameRootCount,38);
 assert.equal(x.roles.source.byAction.PassTurnAction,38);
 assert.equal(x.roles.source.attemptedAttacks,0);
 assert.equal(x.roles.source.manualEnergyAttachments,0);
 assert.equal(x.roles.reference.attemptedAttacks,38);
 assert.equal(x.roles.reference.manualEnergyAttachments,38);
 assert.equal(x.roles.reference.playedByPrintedCategory.Energy,38);
 assert.equal(x.cohorts.fresh.arms,32);
 assert.equal(x.competitivelyQualifiedGames,0);
});
test('counts actual printed source Energy when actor played an Energy root',()=>{
 const data=archive();
 data.pairs[0].treatment.allNativeRootActions.push(
  sourceRoot('PlayCardAction','Reversal Energy'));
 const x=censusOriginalActionRoots(data,manifest);
 assert.equal(x.roles.source.manualEnergyAttachments,1);
 assert.equal(x.cohorts['known-positive'].sourceEnergyRoots,1);
 assert.equal(x.roles.source.playedByPrintedCategory.Energy,1);
});
test('native alias maps to original printed source Pokémon without changing its physical identity',()=>{
 const data=archive();
 data.pairs[0].control.allNativeRootActions.push(
  sourceRoot('PlayCardAction','Ditto Prism Star'));
 const x=censusOriginalActionRoots(data,manifest);
 assert.equal(x.roles.source.playedByPrintedCategory['Pokémon'],1);
 assert.equal(x.roles.source.playedCards['Ditto Prism Star'],1);
});
test('unknown source card prints must not silently count as Energy or Pokémon',()=>{
 const data=archive();
 data.pairs[0].control.allNativeRootActions.push(
  sourceRoot('PlayCardAction','Invented Ancient Attack'));
 assert.throws(()=>censusOriginalActionRoots(data,manifest),
   /Unregistered source played card/);
});
test('foreign player Slot and unsupported original sixty fail closed',()=>{
 const data=archive();
 data.pairs[0].control.allNativeRootActions[1].playerSlot=3;
 assert.throws(()=>censusOriginalActionRoots(data,manifest));
 const altered=structuredClone(manifest);
 altered.decks[0].cards[0].count=2;
 assert.throws(()=>censusOriginalActionRoots(archive(),altered),
   /61 !== 60/);
});
