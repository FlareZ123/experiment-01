'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareOwnerTrainerReadOnly,VERSION}=
  require('../simulation/evaluation/agent20-issue25-v15-8row-owner-trainer-observer.cjs');
const schema='agent20-issue25-v14-verified-native-owner-prize-zone-counts';

function fixture(changed=false){
  const ids=['6:100:A:champion-reference',
    '6:100:A:new-moon-lockbreaker-v1',
    '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1',
    '11:102:A:champion-reference','11:102:A:new-moon-lockbreaker-v1',
    '11:103:B:champion-reference','11:103:B:new-moon-lockbreaker-v1'];
  const rows=ids.map(id=>({
    id,originalSourceSeat:id.includes(':B:')?0:1,
    sourceDealFingerprint:'source-'+id,
    fullPhysicalDealFingerprint:'full-'+id,
    status:'returned-unqualified',
    nativeRootActionCount:48
  }));
  const counts={observedRoots:3,rootsHoldingTrainers:3,
    rootsWithUnblockedTrainer:3,acceptedPassWithUnblockedTrainer:2,
    nativeOfferedCopies:5,genericUnblockedCopies:5,
    selectedTrainerRootsAccepted:0};
  const raw=ids.map((id,i)=>({
    trial:{id},
    rootActionLedger:[{action:i===2&&changed?'AttackAction':'PassTurnAction',
      playerSlot:0}],
    actorOnlyDecisionCoverage:{ownerTrainerFrontierAudit:{
      summary:{readOnly:true,
        bySeat:{0:counts,1:counts}}}}
  }));
  return {out:{schema,allEightAttemptDispositions:rows},raw};
}

test('same-physical A/A 8 original rows expose trainer owners and no private names',()=>{
  const a=fixture(),b=fixture();
  const r=compareOwnerTrainerReadOnly(a.out,b.out,a.raw,b.raw);
  assert.equal(r.schema,VERSION+'-comparison-v1');
  assert.equal(r.exactFullPhysicalDealBothArms,true);
  assert.equal(r.exactSourceDealBothArms,true);
  assert.equal(r.exactAllEightRootLedgers,true);
  assert.equal(r.ownerTrainerAuditsCount,8);
  assert.equal(r.sourceOwnerTotals.passWithGenericUnblockedTrainer,16);
  assert.equal(r.rows[0].rawPrivateTrainerIdentitiesReleased,false);
  assert.equal(r.qualifiedGames,0);
});

test('same physical openings cannot hide even one changed native accepted root',()=>{
  const a=fixture(),b=fixture(true);
  const r=compareOwnerTrainerReadOnly(a.out,b.out,a.raw,b.raw);
  assert.equal(r.exactSourceDealBothArms,true);
  assert.equal(r.exactAllEightRootLedgers,false);
  assert.equal(r.rows.filter(row=>!row.exactNativeRootLedgerMatched).length,1);
});
