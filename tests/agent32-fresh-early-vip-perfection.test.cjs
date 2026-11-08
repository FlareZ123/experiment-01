'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {trials,setupEvidence}=
  require('../simulation/evaluation/agent32-fresh-early-vip-perfection.cjs');

test('second fresh native cohort has sixteen new physically registered seeds with both seats',()=>{
  const rows=trials();
  assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(x=>x.seed)).size,16);
  assert.equal(rows.filter(x=>x.candidateSlot==='A').length,8);
  assert.equal(rows.filter(x=>x.candidateSlot==='B').length,8);
  assert.deepEqual([...new Set(rows.map(x=>x.rank))].sort((a,b)=>a-b),
    [1,3,5,6,9,11,13,26]);
});

test('real actor-only owner VIP native receipts are differentiated from mere proposals',()=>{
  const original={
    trial:trials()[0],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      ownerVipAfterPass:{
        proposedItems:3,acceptedItems:1,
        acceptedSearches:1,nativeBenchConfirmed:1,
        preferredMewtwoDonorSearches:1,
        unresolvedOwnerSearches:0
      },
      root:{typedIntentCounts:{perfection:2},
        ownerRootIntents:[{
          intent:{kind:'attach-basic-energy',
            donorAttack:'Horror House-GX'}
        }]},
      chooseAttack:{selections:[{attack:'Poltergeist'}]}
    }}
  };
  const outcome=setupEvidence(original);
  assert.equal(outcome.nativeVipItemAccepted,1);
  assert.equal(outcome.preferredMewtwoDonorPairSearches,1);
  assert.equal(outcome.nativePhysicalVipBenchConfirmed,1);
  assert.equal(outcome.firstTurnVipProposed,3);
  assert.equal(outcome.earlyEnergyIntentCount,1);
  assert.equal(outcome.paidPerfectionIntents,2);
  assert.equal(outcome.copiedAttacks[0].attack,'Poltergeist');
});

test('missing native opportunities remain zero rather than projected wins or searches',()=>{
  const event=setupEvidence({trial:trials()[1]});
  assert.equal(event.nativeVipItemAccepted,0);
  assert.equal(event.ownerDeckVipSearchAccepted,0);
  assert.equal(event.nativePhysicalVipBenchConfirmed,0);
  assert.equal(event.preferredMewtwoDonorPairSearches,0);
  assert.equal(event.paidPerfectionIntents,0);
  assert.deepEqual(event.copiedAttacks,[]);
});
