'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {nativeRetreatAudit}=require('../simulation/evaluation/agent9-rank5-crobat-retreat-pair.cjs');

/** Synthetic role-labeled original-source Store settlement fixture. */
function fixture(){
  return {trial:{candidateSlot:'A'},summary:{nativeDisposition:'CENSORED'},
    rawNativeRow:{
      rootActionLedger:[
        {playerSlot:1,action:'RetreatAction',actionOrdinal:215,turnBefore:52},
        {playerSlot:1,action:'AttackAction',actionOrdinal:216,
          turnBefore:52,attack:'Cross Fusion Strike'},
        {playerSlot:0,action:'AttackAction',actionOrdinal:222,
          turnBefore:53,attack:'Night Watch'}
      ],
      // A candidate attack is an opposing-actor attack, never source evidence.
      candidateAttackSettlement:{attacks:[{
        actionOrdinal:222,attackerSeat:0,settledPromptChain:true
      }]},
      sourceAttackSettlement:{auditedActorRole:'source',candidateSeat:1,
        attacks:[{actionOrdinal:216,turnBefore:52,
          attackName:'Cross Fusion Strike',settledPromptChain:true,
          settlementCrossesClockReset:false,nextSourceSameEpochProven:true,
          nextSourceRoot:{ordinal:221,turn:53,action:'PassTurnAction'},
          prizesBefore:[6,6],prizesAfter:[6,4]}]}
    }
  };
}

test('original-source settled attack, Prize trace and actual opponent return',()=>{
  const result=nativeRetreatAudit(fixture());
  assert.equal(result.sourceAcceptedRetreat,1);
  assert.equal(result.candidateAcceptedRetreat,0);
  assert.equal(result.sourceAttackDeclared,1);
  assert.equal(result.sourceSettledAttackTransitions,1);
  assert.equal(result.sourceSameEpochOpponentContinuations,1);
  assert.deepEqual(result.sourceSettledAttackPrizeTrace,[{
    globalTurn:52,attackName:'Cross Fusion Strike',
    prizesBefore:[6,6],prizesAfter:[6,4],
    nextOpponentRoot:{ordinal:221,turn:53,action:'PassTurnAction'}
  }]);
  assert.equal(result.retreatFeePhysicalDiscardVerified,false);
});

test('do not treat candidate settlement as original-source evidence',()=>{
  const row=fixture();
  delete row.rawNativeRow.sourceAttackSettlement;
  assert.equal(nativeRetreatAudit(row).sourceSettledAttackTransitions,null);
  assert.equal(nativeRetreatAudit(row).sourceSameEpochOpponentContinuations,null);
});

test('wrong source seat, clock reset, or missing native root excludes settlement',()=>{
  const row=fixture();
  row.rawNativeRow.sourceAttackSettlement.candidateSeat=0;
  assert.equal(nativeRetreatAudit(row).sourceSettledAttackTransitions,null);
  row.rawNativeRow.sourceAttackSettlement.candidateSeat=1;
  row.rawNativeRow.sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;
  assert.equal(nativeRetreatAudit(row).sourceSettledAttackTransitions,0);
  row.rawNativeRow.sourceAttackSettlement.attacks[0].settlementCrossesClockReset=false;
  row.rawNativeRow.rootActionLedger=row.rawNativeRow.rootActionLedger.filter(x=>
    x.action!=='AttackAction'||x.playerSlot!==1);
  assert.equal(nativeRetreatAudit(row).sourceSettledAttackTransitions,0);
});

test('missing actual native row is unknown rather than a zero',()=>{
  const row=fixture();
  row.rawNativeRow=null;
  assert.equal(nativeRetreatAudit(row).sourceSettledAttackTransitions,undefined);
});
