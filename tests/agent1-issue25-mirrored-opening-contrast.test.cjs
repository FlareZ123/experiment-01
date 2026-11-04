'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {compareOpeningReceipts,VERSION}=
  require('../simulation/evaluation/agent1-issue25-mirrored-opening-contrast.cjs');

const ids=[6,6,6,6,11,11,11,11].map((rank,i)=>
  rank+':'+(100+i)+':'+(i%4<2?'A':'B')+':'+
  (i%2===0?'champion-reference':'new-moon-lockbreaker-v1'));

function sample(entry,adjust){
  return {
    actuallyExecutingManifest:{
      policyEntryPoint:entry,developmentTrialCount:8,
      observedRepositoryGitCommit:'test-commit'
    },
    registration:{expectedIds:[...ids]},
    observedSelectedOpening:entry.includes('protected-opening-v7')?{
      stores:8,initialAccepted:16,allEligibleProtectedSupportsRetained:16,
      missingPhysicalPlacements:0,
      events:ids.map((id,i)=>({
        nativeStoreOrdinal:i+1,seat:0,
        kind:'initial-active-and-ordinary-bench',
        preservedEntryPrintings:i===0?['Tapu Lele-GX GRI'] :[],
        nativeValidSelections:['Regidrago V SIT'],physicalPlacement:'accepted-native-Store'
      }))
    }:null,
    attempts:ids.map((id,i)=>({
      id,sourceDealFingerprint:'source-'+i,
      fullPhysicalDealFingerprint:'full-'+i,
      originalSourceSeat:Math.floor(i%4/2)===0?1:0,
      actualFirstPlayer:i%2,
      status:'action-capped',nativeRootActionCount:48,
      ...(adjust&&i===7?adjust:{})
    }))
  };
}

test('eight exact preregistered source deals and both physical seats compare by ID',()=>{
  const a=sample('simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
  const b=sample('simulation/evaluation/agent1-issue25-protected-opening-v7.cjs');
  b.attempts.reverse();
  const report=compareOpeningReceipts(a,b);
  assert.equal(report.schema,VERSION);
  assert.equal(report.matchedRows.length,8);
  assert.equal(report.gates.sameRegisteredEightTrialIDs,true);
  assert.equal(report.gates.allEightPhysicalDealingMatched,true);
  assert.equal(report.gates.sameOriginalSourceFingerprints.matches,8);
  assert.equal(report.gates.sameFullPhysicalInitialDeals.matches,8);
  assert.equal(report.gates.sameActualSourceSeat.matches,8);
  assert.equal(report.gates.sameFirstPlayer.matches,8);
  assert.deepEqual(report.matchedRows[0].nativeStoreOpeningEvents[0]
    .preservedEntryPrintings,['Tapu Lele-GX GRI']);
  assert.equal(report.gates.gameOutcomesCompetitivelyQualified,false);
  assert.equal(report.gates.overall,'FAIL-comparative-development-only');
});

test('one altered source physical deal is visible, not silently paired',()=>{
  const a=sample('simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
  const b=sample('simulation/evaluation/agent1-issue25-protected-opening-v7.cjs',{
    sourceDealFingerprint:'changed-public-deal'
  });
  const report=compareOpeningReceipts(a,b);
  assert.equal(report.gates.sameOriginalSourceFingerprints.matches,7);
  assert.equal(report.gates.sameOriginalSourceFingerprints.mismatches,1);
  assert.equal(report.gates.allEightPhysicalDealingMatched,false);
  assert.equal(report.gates.gameOutcomesCompetitivelyQualified,false);
});

test('changed IDs and duplicate source attempts are rejected',()=>{
  const a=sample('simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
  const b=sample('simulation/evaluation/agent1-issue25-protected-opening-v7.cjs');
  b.registration.expectedIds[7]='other-not-preregistered';
  assert.throws(()=>compareOpeningReceipts(a,b),/identical preregistered seeds and IDs/);
  b.registration.expectedIds[7]=ids[7];
  b.attempts[7].id=b.attempts[6].id;
  assert.throws(()=>compareOpeningReceipts(a,b),/duplicate attempted native ID/);
});
