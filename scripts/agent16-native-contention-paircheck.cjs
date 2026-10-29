'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {VERSION}=require('../simulation/twinleaf/agent16-owner-priority-contention.cjs');

const PAIR_VERSION='agent16-owner-priority-native-noninterference-v1';

/**
 * Remove ONLY the known added observation data, keeping physical action
 * recipients, game evidence, failures, audit counters and policy state.
 * @param {object} report Complete original four-arm canonical development run.
 * @returns {object} Exact common-schema report for strict comparison.
 */
function commonReport(report){
  const copy=structuredClone(report);
  for(const row of copy.rows??[]){
    const actor=row.actorOnlyDecisionCoverage;
    if(!actor)continue;
    const root=actor.detailedComponentAudits?.root;
    if(root){
      root.version=root.version?.replace('+'+VERSION,'');
      delete root.ownerArbitrationCensusOptIn;
      delete root.ownerArbitration;
    }
    if(actor.componentVersions?.root)
      actor.componentVersions.root=
        actor.componentVersions.root.replace('+'+VERSION,'');
  }
  return copy;
}

/**
 * Check one completely frozen native Store ON/OFF four-arm comparison.
 * The comparator never converts native engine terminal status to performance.
 * @param {object} control Observer disabled, no changed gameplay.
 * @param {object} observed Observer enabled under exactly same policy.
 * @returns {object} Diagnostic census with proof of unmodified same-deal play.
 */
function compareOwnerArbitrationPair(control,observed){
  for(const report of [control,observed]){
    assert.equal(report.attempted,4);
    assert.equal(report.rows?.length,4);
    assert.equal(report.competitiveQualifiedGames,0);
    assert.equal(report.actorOnlyCompositionOptIn,true);
    assert.equal(report.actorOnlyCellsWithAudits,4);
  }
  assert.deepStrictEqual(commonReport(observed),commonReport(control),
    'Owner arbitration observation changed game, metadata, action or physical target');
  const counts={},bySeat={0:0,1:0},summary=[];
  let ownerRoots=0,contentionRoots=0;
  for(let index=0;index<4;index++){
    const a=control.rows[index],b=observed.rows[index];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
    assert.equal(a.actorOnlyDecisionCoverage.detailedComponentAudits.root
      .ownerArbitration,undefined);
    const root=b.actorOnlyDecisionCoverage.detailedComponentAudits.root;
    const census=root.ownerArbitration;
    assert.ok(census?.version===VERSION);
    assert.ok(census.ownerRoots>0,
      'No genuine owner-root decisions in native sample');
    assert.ok(census.contentionRoots>=0&&
      census.contentionRoots<=census.ownerRoots);
    ownerRoots+=census.ownerRoots;
    contentionRoots+=census.contentionRoots;
    for(const [label,n] of Object.entries(census.pairs))
      counts[label]=(counts[label]??0)+n;
    for(const sample of census.samples){
      assert.equal(sample.nativePlayability,'unverified');
      bySeat[sample.seat]++;
    }
    summary.push({id:b.trial.id,sourceDeal:b.sourceDealFingerprint,
      rootSha:b.rootActionLedgerSha256,
      ownerRoots:census.ownerRoots,contentionRoots:census.contentionRoots,
      nativeTerminal:b.finished??false,failedStatus:b.status??null});
  }
  return {version:PAIR_VERSION,sourcePairedArms:4,
    gameAndFullAuditsIdentical:true,ownerRoots,contentionRoots,pairs:counts,
    samplesBySeat:bySeat,arms:summary,competitiveQualifiedGames:0,
    caution:'The enumerated alternatives were not dispatched or native-certified'};
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Two JSON paths required: observer-off, observer-on');
  const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
  process.stdout.write('AGENT16_OWNER_ARBITRATION_PAIR '+
    JSON.stringify(compareOwnerArbitrationPair(
      read(process.argv[2]),read(process.argv[3])))+'\n');
}

module.exports={PAIR_VERSION,commonReport,compareOwnerArbitrationPair};
