'use strict';

const assert = require('node:assert/strict');
const {stagedChampionPowerBeamAfterRealApex} =
  require('./agent46-real-apex-champion-two-ko-native.cjs');

/**
 * Re-run the authentic prior Regidrago Apex -> Mimikyu Copycat
 * Timeless-GX -> extra turn -> Copycat Power Beam native two-KO
 * with all 60 physical source-card objects from rank1 and rank10
 * allocated exactly once to their owner's public/hidden game zones.
 *
 * Physical resource occupancy and prize identities are checked at four
 * event boundaries. Setup is constructed and was NOT played or drawn.
 * This is no full-game win-rate or board-reachability admission.
 *
 * @returns {object} Source-inventory hashes, physical-zone ledger, native payoffs.
 */
function run(){
  const out=stagedChampionPowerBeamAfterRealApex({useOriginal60:true});
  assert.equal(out.exactOriginal60PhysicalObjectsStaged,true);
  assert.equal(out.originalRank1AndRank10StagedNamedCardCountsVerified,true);
  assert.equal(out.original60ZoneChecks.length,8);
  assert.deepEqual(out.original60ZoneChecks.map(row=>row.stage).filter(
    (_,i)=>i%2===0),[
    'after-staged-original60-zones',
    'after-native-opponent-apex-overclock',
    'after-first-native-knockout',
    'after-second-native-knockout'
  ]);
  for(const row of out.original60ZoneChecks){
    assert.equal(row.totalPhysicalCards,60);
    assert.equal(row.uniquePhysicalCards,60);
    assert.ok([1,10].includes(row.rank));
  }
  assert.equal(out.priorAttackMetadataInjected,false);
  assert.equal(out.originalSourceAttack.declared,'Apex Dragon');
  assert.equal(out.originalSourceAttack.copiedDragonPayload,'Overclock');
  assert.equal(out.first.chosen,'Timeless-GX');
  assert.equal(out.second.chosen,'Power Beam');
  assert.equal(out.firstUnderlyingVDiscarded,true);
  assert.equal(out.secondUnderlyingVDiscarded,true);
  assert.equal(out.firstKnockedOutSpecialEnergiesInOwnerDiscard,true);
  assert.equal(out.distinctOriginalPrizeObjectsInHandAtFirstKO,2);
  assert.equal(out.distinctOriginalPrizeObjectsInHandAtSecondKO,4);
  assert.equal(out.physicalOriginalPrizeObjectCustodyValidated,true);
  assert.equal(out.prizesTaken,4);
  assert.equal(out.usedGX,true);
  assert.equal(out.declaredLastAttack,'Copycat');
  assert.equal(out.qualifiedForCompetitiveInference,false);
  const report={...out,
    schema:'agent46-original-rank1-rank10-full60-physical-apex-two-ko-v1',
    originalRank1And10Physical64BoundaryEvents:true,
    original60CardsByOwner:60,
    naturallyReachedState:false,
    competitiveQualifiedGames:0};
  console.log('AGENT46_ORIGINAL60_APEX_TWO_KO '+JSON.stringify(report));
  return report;
}
if(require.main===module)run();
module.exports={run};
