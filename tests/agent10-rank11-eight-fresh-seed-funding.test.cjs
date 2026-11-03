'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {extractSourceLine,nativeDisposition}=
  require('../simulation/evaluation/agent10-rank11-eight-fresh-seed-funding.cjs');
const reg=require('../results/aichi-2026/registrations/agent10-rank11-funding-fresh-eight-seed-20261103.json');

test('registration preserves independent eight seed groups and 16 distinct trial ids',()=>{
  assert.equal(reg.seedGroups.length,8);
  assert.equal(new Set(reg.seedGroups.map(g=>g.seed)).size,8);
  assert.equal(reg.trialIds.length,16);
  assert.equal(new Set(reg.trialIds).size,16);
  assert.equal(reg.seedGroups.filter(g=>g.candidateSlot==='A').length,4);
  assert.equal(reg.seedGroups.filter(g=>g.candidateSlot==='B').length,4);
  assert.equal(reg.seedGroups.every(g=>g.rank===11),true);
});
test('extract source-only accepted physical Mega funding and settled attacks',()=>{
  const row={
    rootActionLedger:[
      {playerSlot:1,turnBefore:11,action:'PlayCardAction',card:'Darkness Energy'},
      {playerSlot:1,turnBefore:19,action:'AttackAction',attack:'Claw of Darkness'},
      {playerSlot:0,turnBefore:20,action:'AttackAction',attack:'Motivate'}
    ],
    nativeAcceptedTargetSidecar:{events:[
      {playerSlot:1,turnBefore:11,action:'PlayCardAction',storeAccepted:true,
        declared:{ownerHandPrinting:'Darkness Energy MEE',target:{slot:2,index:0}},
        rootActionOrdinal:28,
        publicBoardChanges:[{seat:1,after:{pokemon:'Mega Absol ex M1L',
          energies:['Darkness Energy MEE']},before:{pokemon:'Mega Absol ex M1L',energies:[]}}]}
    ]},
    sourceAttackSettlement:{attacks:[{
      attackName:'Claw of Darkness',turnBefore:19,settledPromptChain:true,
      prizesBefore:[6,6],prizesAfter:[6,3],nextSourceSameEpochProven:true
    }]},
    finalPrizes:[6,3]
  };
  const r=extractSourceLine(row,1);
  assert.equal(r.sourceSeat,1);
  assert.equal(r.nativeClawCount,1);
  assert.equal(r.firstClawTurn,19);
  assert.equal(r.nativeMotivateCount,0);
  assert.equal(r.acceptedOwnerMegaEnergyEvents.length,1);
  assert.equal(r.acceptedOwnerMegaEnergyEvents[0].turn,11);
  assert.deepEqual(r.settledClawPrizes[0].after,[6,3]);
});
test('record exceptional native rows as unavailable, not a false confirmed deal',()=>{
  const bad={trial:{id:'x'},error:'Store rejects printing'};
  const result=extractSourceLine(bad,0);
  assert.equal(result.status,'no-native-root-ledger');
  assert.equal(result.reason,bad.error);
  assert.equal(nativeDisposition(bad).winnerSeat,null);
  assert.equal(nativeDisposition(bad).qualifiedForCompetitiveInference,false);
});
