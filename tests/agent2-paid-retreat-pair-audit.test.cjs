'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {comparePackets}=require('../scripts/agent2-paid-retreat-pair-audit.cjs');

function fixture(enabled){
  return {
    enginePin:'pinned-twinleaf-revision',
    attempted:4,competitiveQualifiedGames:0,
    rows:Array.from({length:4},(_,n)=>({
      trial:{id:`11:2:B:deck-${n}`,rank:11,seed:623585882,
        candidateId:`deck-${n}`},
      candidateSeat:1,sourceDealFingerprint:'frozen-physical-source',
      verifiedFirstTurn:true,actualStarterSeat:1,
      sourceAudit:{completed:false},finished:true,winner:enabled?1:0,
      finalPrizes:enabled?[6,0]:[0,6],rootActionCount:enabled?94:260,
      rootActionLedgerSha256:'same-source-sha-is-not-required-after-treatment',
      actorOnlyDecisionCoverage:{
        paidRetreatRootOptIn:enabled,
        typedIntentCounts:enabled?{'paid-retreat':1}:{},
        nativeRootAcceptances:enabled?[{
          kind:'paid-retreat',accepted:true,
          nativePhysicalEffect:'confirmed-public-effect'
        }]:[]
      },
      candidateAttackSettlement:{attacks:enabled?[{
        actionOrdinal:54,turnBefore:13,attackName:'Full Moon Rondo',
        settledPromptChain:true,prizesBefore:[6,6],prizesAfter:[6,3],
        nextSourceSameEpochProven:true
      }]:[]}
    }))
  };
}

test('same-draw receipts expose a genuinely settled paid pivot and Prize change',()=>{
  const output=comparePackets(fixture(false),fixture(true));
  assert.equal(output.fullyMatchedPhysicalPairs,4);
  assert.equal(output.observedCompetitiveQualifiedGames,0);
  assert.equal(output.globalFieldWinRateInferred,false);
  const row=output.pairs[0];
  assert.equal(row.treatment.paidRetreatPhysicalConfirmed,1);
  assert.equal(row.treatment.candidateAttacksSettled,1);
  assert.deepEqual(row.treatment.candidateAttackNames,{'Full Moon Rondo':1});
  assert.equal(row.treatment.candidatePrizeTransitions.length,1);
});

test('altered physical deals remain visible as a separate failed match',()=>{
  const baseline=fixture(false),treatment=fixture(true);
  treatment.rows[3].sourceDealFingerprint='different-deal';
  const output=comparePackets(baseline,treatment);
  assert.equal(output.fullyMatchedPhysicalPairs,3);
  assert.equal(output.pairs[3].exactSourcePhysical,false);
});

test('missing an actor switch or changing the experimental source fails closed',()=>{
  const baseline=fixture(false),treatment=fixture(true);
  treatment.rows[2].actorOnlyDecisionCoverage.paidRetreatRootOptIn=false;
  assert.throws(()=>comparePackets(baseline,treatment));
  treatment.rows[2].actorOnlyDecisionCoverage.paidRetreatRootOptIn=true;
  treatment.enginePin='other-engine';
  assert.throws(()=>comparePackets(baseline,treatment));
});
