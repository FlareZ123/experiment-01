'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,acceptedStrandChains,pairSummary,
  REGISTERED_BLOB}=
  require('../simulation/evaluation/agent14-prospective-zero-energy-strand-crossrank.cjs');

test('fresh exact source-seed design is committed before native runs',()=>{
  const p=preflight();
  assert.equal(p.registeredBlob,REGISTERED_BLOB);
  assert.equal(p.reg.preregisteredSeedGroups.length,16);
  assert.equal(new Set(p.reg.preregisteredSeedGroups.map(x=>x.seed)).size,16);
  assert.equal(p.reg.trials.length,32);
  assert.equal(p.reg.expectedNativeAttempts,64);
  assert.deepEqual(p.reg.originalSourceRanks,[1,5,11,30]);
  assert.equal(p.reg.noResultsExaminedAtRegistration,true);
});

const trial={id:'11:0:B:champion-reference',rank:11,
  repeat:0,candidateSlot:'B',candidateId:'champion-reference',
  seed:1609590989};
function row(actions){
  return {
    trial,finished:true,winner:0,endReason:'engine-game-end',
    actionCount:actions.length,rootActionLedger:actions,
    fullPhysicalDealFingerprint:'physical-same',
    sourceDeckFingerprint:'original-60-same',
    candidateDeckFingerprint:'candidate-60-same',
    sourceSeat:0,candidateSeat:1,
    candidateAttackSettlement:{attacks:[{
      actionOrdinal:178,attackName:'Max Geist',
      settledPromptChain:true,prizesBefore:[1,6],
      prizesAfter:[1,4],
      publicBoardBefore:[
        {active:{printing:'Oranguru V ASR'}},
        {active:{printing:'Shadow Rider Calyrex VMAX CRE'}}
      ],
      publicBoardAfter:[
        {active:{printing:'Garbodor BKP'}},
        {active:{printing:'Shadow Rider Calyrex VMAX CRE'}}
      ]
    }]},
    sourceAttackSettlement:{attacks:[]},
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{
        zeroEnergyStrandFloatStoneRootSelected:2,
        nativePhysicalConfirmedByIntent:{
          'attach-emergency-floatstone':1,
          'retreat-emergency-floatstone':1
        }
      }
    }}
  };
}
test('native receipt joins accepted same-owner Tool / retreat / attack and actual prizes',()=>{
  const actions=[
    {actionOrdinal:175,action:'PlayCardAction',
      card:'Float Stone',playerSlot:1,turnBefore:34},
    {actionOrdinal:176,action:'RetreatAction',
      playerSlot:1,turnBefore:34},
    {actionOrdinal:177,action:'ResolvePromptAction',
      playerSlot:0,turnBefore:34},
    {actionOrdinal:178,action:'AttackAction',
      attack:'Max Geist',playerSlot:1,turnBefore:34}
  ];
  const evidence=acceptedStrandChains(row(actions));
  assert.equal(evidence.length,1);
  const first=evidence[0];
  assert.equal(first.nativePrizeCardsTaken,2);
  assert.equal(first.enemyActiveBefore,'Oranguru V ASR');
  assert.equal(first.enemyActiveAfter,'Garbodor BKP');
  assert.equal(first.hasNativeSettledAttack,true);
});
test('wrong-seat / wrong-turn or missing retreat cannot fabricate an attack chain',()=>{
  const base=[
    {actionOrdinal:175,action:'PlayCardAction',card:'Float Stone',
      playerSlot:1,turnBefore:34},
    {actionOrdinal:176,action:'RetreatAction',playerSlot:1,turnBefore:34},
    {actionOrdinal:178,action:'AttackAction',attack:'Max Geist',
      playerSlot:1,turnBefore:34}
  ];
  for(const transform of [
    a=>{a[0].playerSlot=0;},
    a=>{a[1].turnBefore=35;},
    a=>{a.splice(1,1);},
    a=>{a[2].turnBefore=35;}
  ]){
    const actions=structuredClone(base);
    transform(actions);
    assert.deepEqual(acceptedStrandChains(row(actions)),[]);
  }
});
test('same-physical pair preserves exact differing native action ordinal',()=>{
  const control=row([
    {actionOrdinal:175,playerSlot:1,action:'PassTurnAction',turnBefore:34}
  ]);
  const treatment=row([
    {actionOrdinal:175,playerSlot:1,action:'PlayCardAction',
      card:'Float Stone',turnBefore:34}
  ]);
  const p=pairSummary(control,treatment);
  assert.equal(p.firstAcceptedRootDifference,0);
  assert.equal(p.sameOriginalFullPhysicalDeal,true);
  assert.equal(p.sameOriginalSourcePrintedSixty,true);
  assert.equal(p.sameCandidatePrintedSixty,true);
  assert.equal(p.control.selectedStrandIntents,2);
  assert.equal(p.treatment.confirmedToolAttach,1);
  assert.equal(p.controlNativeToolRetreatAttack.length,0);
});
