'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {compareOpeningReceipts,writeContrastReceipt}=
  require('../simulation/evaluation/agent1-issue25-mirrored-opening-contrast.cjs');

test('actual source-deal fingerprint custody on eight baseline vs protected opening arms',()=>{
  const root=process.env.ISSUE25_CONTRAST_ARTIFACT_ROOT??'artifacts';
  const aPath=path.join(root,'issue25-mirrored-v6',
    'issue25-mirrored-v6.json');
  const bPath=path.join(root,'issue25-protected-opening-v7',
    'issue25-protected-opening-v7.json');
  const a=JSON.parse(fs.readFileSync(aPath,'utf8'));
  const b=JSON.parse(fs.readFileSync(bPath,'utf8'));
  const report=compareOpeningReceipts(a,b);
  const output=writeContrastReceipt(report,
    path.join(root,'issue25-mirrored-opening-contrast'));
  console.log('AGENT1_ISSUE25_MIRRORED_OPENING_CONTRAST',JSON.stringify({
    baselineRepoCommit:report.actualRepositoryCommits.baseline,
    variantRepoCommit:report.actualRepositoryCommits.variant,
    gate:report.gates,
    openingNative:report.descriptiveOnly,
    rows:report.matchedRows.map(row=>({
      id:row.id,sourceMatch:row.sourceDealMatch,
      fullDealMatch:row.fullPhysicalDealMatch,
      seatMatch:row.actualSourceSeatMatch,
      baselineStatus:row.baselineStatus,
      protectedStatus:row.protectedStatus,
      baselineRoots:row.baselineNativeRoots,
      protectedRoots:row.protectedNativeRoots,
      observedSetupEvents:row.nativeStoreOpeningEvents
    })),output
  }));
  assert.equal(report.matchedRows.length,8);
  assert.equal(report.gates.sameRegisteredEightTrialIDs,true);
  assert.equal(report.gates.allEightPhysicalDealingMatched,true,
    'Physical source and full initial deals must match exactly for causal interpretation');
  assert.equal(report.gates.sameActualSourceSeat.matches,8);
  assert.equal(report.descriptiveOnly.openingMissingPhysicalPlacements,0);
  assert.equal(report.gates.gameOutcomesCompetitivelyQualified,false);
  assert.equal(report.gates.releaseQualified,false);
});
