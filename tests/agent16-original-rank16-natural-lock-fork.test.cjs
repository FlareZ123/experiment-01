'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {scheduledArms,preflight,originalOpeningReceipt,summarize}=
  require('../simulation/evaluation/agent16-original-rank16-natural-lock-fork.cjs');

test('original rank16 exact 60, policy blob and printed lock counts preflight',()=>{
  const read=preflight();
  assert.equal(read.originalRank,16);
  assert.equal(read.originalSourcePrinted60,true);
  assert.equal(read.plannedNativeAttempts,16);
  assert.equal(read.competitivelyQualifiedGames,0);
});

test('all eight precommitted seed groups, both candidate fixed sixties and seats',()=>{
  const arms=scheduledArms();
  assert.equal(arms.length,16);
  assert.deepEqual(arms.map(x=>x.seed).filter((_,i)=>i%2===0),[
    726622150,3440240299,1076041593,148624283,
    1832484461,3678493713,1562045160,139426191]);
  assert.deepEqual(arms.map(x=>x.id).slice(0,4),[
    '16:0:A:champion-reference','16:0:A:new-moon-lockbreaker-v1',
    '16:1:B:champion-reference','16:1:B:new-moon-lockbreaker-v1'
  ]);
  for(let i=0;i<arms.length;i+=2){
    assert.equal(arms[i].seed,arms[i+1].seed);
    assert.equal(arms[i].candidateSlot,arms[i+1].candidateSlot);
    assert.notEqual(arms[i].candidateId,arms[i+1].candidateId);
  }
});

test('native source owner-turn receipt retains real accepted roots and next turn',()=>{
  const row={
    sourceSeat:0,candidateSeat:1,sourceActuallyFirst:false,
    sourceFirstOwnedAffordances:{
      status:'observed',terminalKind:'native-nonpass-turn-end',
      firstOwnHand:{resources:{'Budew':1,'Boost Shake':1}}
    },
    rootActionLedger:[
      {playerSlot:0,turnBefore:2,action:'PlayCardAction',
        card:'Float Stone',pendingPrompt:null,actionOrdinal:5},
      {playerSlot:0,turnBefore:2,action:'PlayCardAction',
        card:'Boost Shake',pendingPrompt:null,actionOrdinal:6},
      {playerSlot:0,turnBefore:2,action:'ResolvePromptAction',
        pendingPrompt:'ChooseCardsPrompt',actionOrdinal:7},
      {playerSlot:1,turnBefore:3,action:'PlayCardAction',
        card:'Field Blower',pendingPrompt:null,actionOrdinal:8}
    ]
  };
  const receipt=originalOpeningReceipt(row);
  assert.equal(receipt.sourceStartedFirst,false);
  assert.equal(receipt.turn,2);
  assert.equal(receipt.shakeRootChosen,true);
  assert.equal(receipt.budewAttackChosen,false);
  assert.equal(receipt.firstSubsequentOpponentRoot.action,'PlayCardAction');
  assert.equal(receipt.completeTurnAndReplyWitness,true);
  assert.equal(receipt.actualSourceTurnRootCount,2);
  assert.equal(receipt.competitiveQualified,false);
});

test('read-only receipt refuses to infer actions from held pieces',()=>{
  const row={
    sourceSeat:1,candidateSeat:0,sourceActuallyFirst:true,
    sourceFirstOwnedAffordances:{
      status:'incomplete',firstOwnHand:{resources:{'Budew':2,'Boost Shake':2}}
    },
    rootActionLedger:[{playerSlot:1,turnBefore:1,
      action:'PassTurnAction',pendingPrompt:null,actionOrdinal:1}]
  };
  const receipt=originalOpeningReceipt(row);
  assert.equal(receipt.budewAttackChosen,false);
  assert.equal(receipt.shakeRootChosen,false);
  assert.equal(receipt.completeTurnAndReplyWitness,false);
  assert.equal(receipt.turn,1);
});

test('native errors and action caps remain in attempted denominator',()=>{
  const rows=[
    {trial:{id:'16:0:A:champion-reference'},status:'engine-error',
      error:'Invalid native prompt'},
    {trial:{id:'16:0:A:new-moon-lockbreaker-v1'},status:'action-cap',
      sourceSeat:1,candidateSeat:0,sourceActuallyFirst:false,
      rootActionLedger:[],finished:false},
    {trial:{id:'16:1:B:champion-reference'},status:'engine-terminal',
      sourceSeat:0,candidateSeat:1,sourceActuallyFirst:true,
      rootActionLedger:[{playerSlot:0,turnBefore:1,
        action:'AttackAction',attack:'Itchy Pollen',
        pendingPrompt:null,actionOrdinal:1}],finished:true}
  ];
  const receipt=summarize(rows);
  assert.equal(receipt.observations.length,3);
  assert.deepEqual(receipt.dispositions,{
    'engine-error':1,'action-cap':1,'engine-terminal':1});
  assert.deepEqual(receipt.firstTurnRoots,{
    budewAttack:1,boostShakeRoot:0,neither:1,unknown:1});
  assert.equal(receipt.originalFirstTurnNativeCompetenceQualified,false);
});

test('registration input exists, is nonselective, and cannot claim field strength',()=>{
  const input=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/registrations/agent16-rank16-bothseat-natural-opening-v1-20261102.json')));
  assert.equal(input.preregisteredNonselective,true);
  assert.equal(input.selectionAfterInspectingOutcomes,false);
  assert.equal(input.competitiveGameQualified,false);
  assert.equal(input.winRateCertified,false);
  assert.equal(input.sourceGroups,8);
  assert.equal(input.seeds.length,8);
});
