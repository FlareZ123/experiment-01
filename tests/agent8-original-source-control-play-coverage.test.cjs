'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalSourcePlayCoverage,SCHEMA,SUPPORTERS,PRIORITY_CARDS}=
  require('../simulation/evaluation/agent8-original-source-control-play-coverage.cjs');

function fixture(rank,sourceActuallyFirst,plays){
  const seat=rank===6?0:1;
  const firstTurn=sourceActuallyFirst?1:2;
  return {trial:{rank},sourceSeat:seat,
    sourceActuallyFirst,qualifiesForCompetitiveInference:false,
    finished:true,rootActionLedger:[
      {turnBefore:firstTurn,playerSlot:seat,pendingPrompt:null,
        action:'PassTurnAction'},
      ...plays.map(name=>({turnBefore:firstTurn+2,playerSlot:seat,
        pendingPrompt:null,action:'PlayCardAction',card:name}))
    ]};
}

test('source roster categories and tactic tags are source-inventory grounded',()=>{
  const x=originalSourcePlayCoverage([
    fixture(6,true,['Iron Thorns ex','Tag Call',
      'Guzma & Hala','Thunder Mountain Prism Star','Double Colorless Energy']),
    fixture(11,false,['Trubbish','Quick Ball','Carmine','Darkness Energy'])
  ]);
  assert.equal(x.schema,SCHEMA);
  const a=x.perRank.find(y=>y.rank===6);
  const b=x.perRank.find(y=>y.rank===11);
  assert.deepEqual(a.playedByPrintedCategory,{'Pokémon':1,Trainer:3,Energy:1});
  assert.equal(a.sourceSupporterPlays,1);
  assert.equal(a.sourcePriorityPlanCardPlays,0);
  assert.equal(a.sourceCardPlays['Thunder Mountain ♢'],1);
  assert.equal(a.firstOwnTurnsWithOnlyPass,1);
  assert.deepEqual(b.playedByPrintedCategory,{'Pokémon':1,Trainer:2,Energy:1});
  assert.equal(b.sourceSupporterPlays,1);
  assert.equal(b.sourcePriorityPlanCardPlays,2);
  assert.equal(x.qualifiedCompetitiveGames,0);
});

test('source first own turn accepted tactical card cannot be mistaken for Pass-only',()=>{
  const row=fixture(6,true,['Crushing Hammer']);
  row.rootActionLedger[1].turnBefore=1;
  const x=originalSourcePlayCoverage([row]).perRank[0];
  assert.equal(x.firstOwnTurnsWithOnlyPass,0);
  assert.equal(x.firstOwnTurnsWithAnyCardPlay,1);
  assert.equal(x.sourcePriorityPlanCardPlays,1);
});

test('unknown original-source card and false competitive flags fail closed',()=>{
  assert.throws(()=>originalSourcePlayCoverage([
    fixture(6,true,['Wrong invented printing'])
  ]),/unknown original-source/);
  const r=fixture(11,false,['Float Stone']);
  r.qualifiesForCompetitiveInference=true;
  assert.throws(()=>originalSourcePlayCoverage([r]));
});

test('only genuine owner accepted roots count, not opponent actions or prompts',()=>{
  const row=fixture(6,true,['Guzma & Hala']);
  row.rootActionLedger.push({
    turnBefore:3,playerSlot:1,pendingPrompt:null,
    action:'PlayCardAction',card:'Plumeria'
  });
  row.rootActionLedger.push({
    turnBefore:3,playerSlot:0,pendingPrompt:'ChooseCardsPrompt',
    action:'ResolvePromptAction',card:'Plumeria'
  });
  const x=originalSourcePlayCoverage([row]).perRank[0];
  assert.equal(x.sourceSupporterPlays,1);
  assert.equal(x.sourcePriorityPlanCardPlays,0);
});

test('source 60 priors list real Trainers and do not claim hidden-hand use',()=>{
  assert.ok(SUPPORTERS[6].includes('Plumeria'));
  assert.ok(SUPPORTERS[11].includes('Marnie'));
  assert.ok(PRIORITY_CARDS[6].includes('Crushing Hammer'));
  assert.ok(PRIORITY_CARDS[11].includes('Battle VIP Pass'));
});
