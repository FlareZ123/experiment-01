'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {investigatePromotionGate,analyze}=
  require('../scripts/agent10-rank11-opponent-ko-promotion-gate.cjs');

function make({ko=true,sourceSeat=0,retreat=false}={}){
  const candidate=1-sourceSeat;
  const event={
    attackName:'Night Watch',turnBefore:36,actionOrdinal:45,
    settledPromptChain:true,
    publicBoardBefore:[
      {active:{name:'Squawkabilly ex',damage:150}},
      {active:{name:'Trevenant & Dusknoir-GX',damage:0}}
    ],
    publicBoardAfter:[
      {active:{name:ko?'Mega Absol ex':'Squawkabilly ex',damage:0}},
      {active:{name:'Trevenant & Dusknoir-GX',damage:0}}
    ],
    prizesBefore:[6,6],prizesAfter:[6,ko?4:6],
    nextSourceSameEpochProven:true
  };
  return {
    rootActionLedger:[
      ...(retreat?[{playerSlot:sourceSeat,action:'RetreatAction',
        turnBefore:35,actionOrdinal:44}]:[]),
      {playerSlot:sourceSeat,action:'AttackAction',
        attack:'Claw of Darkness',turnBefore:37,actionOrdinal:47}
    ],
    candidateAttackSettlement:{attacks:[event]},
    sourceAttackSettlement:{attacks:[]}
  };
}
test('original source first Claw follows actual opposing two-Prize Squawk KO',()=>{
  const a=investigatePromotionGate(make(),0);
  assert.equal(a.firstSourceClawGlobalTurn,37);
  assert.equal(a.sourceFirstClawImmediatelyAfterCandidateTwoPrizeKO,true);
  assert.equal(a.candidateKoPromotion.actualCandidateAttackName,'Night Watch');
  assert.equal(a.candidateKoPromotion.candidatePrizesAfter,4);
  assert.equal(a.candidateKoPromotion.sourceReceivedNoPrizesFromCandidateKO,true);
  assert.equal(a.actualSourceRetreatBeforeClaw.length,0);
});
test('neither non-KO damage nor voluntary Retreat is mistaken for unique direct promotion',()=>{
  const a=investigatePromotionGate(make({ko:false,retreat:true}),0);
  assert.equal(a.sourceFirstClawImmediatelyAfterCandidateTwoPrizeKO,false);
  assert.equal(a.actualSourceRetreatBeforeClaw.length,1);
});
test('report unchanged full denominator and two source pairs only',()=>{
  const a=make(),b=make();
  const archive={
    beforeAndAfterSamePhysicalDeal:true,totalNativeAttempts:40,
    researchHead:'abc',vendorPin:'def',
    comparisons:[{
      id:'11:0:B:champion-reference',rank:11,
      seed:4096421492,sourceSeat:0,candidateSeat:1,
      rootFirstDifference:72,fullPhysicalDealSame:true,
      treatment:{finished:true,winner:0,endReason:'winner'}
    },{
      id:'1:0:A:champion-reference',rank:1,
      rootFirstDifference:null
    },{
      id:'11:0:B:new-moon-lockbreaker-v1',rank:11,
      seed:4096421492,sourceSeat:0,candidateSeat:1,
      rootFirstDifference:63,fullPhysicalDealSame:true,
      treatment:{finished:true,winner:0,endReason:'winner'}
    }],
    rawTreatment:{rows:[
      {...a,trial:{id:'11:0:B:champion-reference'}},
      {trial:{id:'1:0:A:champion-reference'}},
      {...b,trial:{id:'11:0:B:new-moon-lockbreaker-v1'}}
    ]}
  };
  const out=analyze(archive);
  assert.equal(out.totalArchivedNativeAttempts,40);
  assert.equal(out.qualifyingChangedSourcePairs,2);
  assert.equal(out.firstClawAfterOpponentKOCount,2);
  assert.equal(out.competitiveQualifiedGames,0);
});
