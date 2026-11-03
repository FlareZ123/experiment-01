'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {auditMode,digest}=require('./agent3-observed-policy-closure.cjs');
const VERSION='agent31-paired-observed-actor-closure-v1';
const OPTION='actorFundedShadowRiderFloatStoneRootOptIn';
const flags=arm=>Object.fromEntries(Object.entries(arm).filter(([k,v])=>
  k.endsWith('OptIn')&&typeof v==='boolean'));
const selected=arm=>arm.rows.reduce((n,row)=>n+
  (row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root?.
    fundedVmaxFloatStoneRootSelected??0),0);
/**
 * Evidence-only attestation. Counts *executed* actor-root receipts and
 * entire printed source/candidate deck identities alongside the top-level
 * options. Does not certify hidden environment variables or paper play.
 * @param {object} archive Saved paired original physical-source native rows.
 */
function attestPairedArchive(archive){
  const control=archive.control;
  const treatment=archive.treatment??archive.rescue;
  assert.ok(control&&treatment,'Both native arms must exist');
  const provenance={manifestBlob:archive.registrationBlob,
    enginePin:archive.pinnedEngine??archive.pinnedTwinleaf};
  assert.ok(provenance.manifestBlob&&provenance.enginePin);
  const a=auditMode({id:'control',native:control},provenance);
  const b=auditMode({id:'rescue',native:treatment},provenance);
  const af=flags(control),bf=flags(treatment);
  assert.equal(af[OPTION],false,'Control cannot select rescue');
  assert.equal(bf[OPTION],true,'Treatment rescue must actually be enabled');
  const diffs=[...new Set([...Object.keys(af),...Object.keys(bf)])]
    .filter(k=>af[k]!==bf[k]).sort();
  assert.deepEqual(diffs,[OPTION],
    'Unregistered top-level choice changed between arms');
  assert.ok(a.admittedWholeMode&&b.admittedWholeMode,
    'All original game rows need consistent actor runtime coverage');
  assert.equal(control.rows.length,treatment.rows.length);
  const source=new Set(),candidate=new Map();
  for(let i=0;i<control.rows.length;i++){
    const x=control.rows[i],y=treatment.rows[i];
    assert.equal(x.trial.id,y.trial.id);
    assert.equal(x.sourceDeckFingerprint,y.sourceDeckFingerprint);
    assert.equal(x.candidateDeckFingerprint,y.candidateDeckFingerprint);
    assert.equal(x.fullPhysicalDealFingerprint,
      y.fullPhysicalDealFingerprint,
      'Compare identical source and candidate physical openings');
    for(const [row,on] of [[x,false],[y,true]]){
      assert.equal(row.actorOnlyDecisionCoverage?.
        detailedComponentAudits?.root?.fundedVmaxFloatStoneRootOptIn,on);
    }
    source.add(x.sourceDeckFingerprint);
    const key=x.trial.candidateId,prior=candidate.get(key);
    if(prior!==undefined)assert.equal(prior,x.candidateDeckFingerprint);
    candidate.set(key,x.candidateDeckFingerprint);
  }
  return {schema:VERSION,modePairStatus:
      'OBSERVED_POLICY_CLOSURES_WITH_UNATTESTED_GLOBAL_ENV',
    registrationBlob:provenance.manifestBlob,enginePin:provenance.enginePin,
    originalPairedRows:control.rows.length,
    originalPrintedSourceDeckFingerprints:[...source].sort(),
    originalCandidatePrintedDeckFingerprints:Object.fromEntries(candidate),
    observedTopLevelOptionDelta:diffs,
    topLevelControlDigest:digest(af),
    topLevelRescueDigest:digest(bf),
    observedActorRuntimeControlDigest:a.observedRuntimeDigest,
    observedActorRuntimeRescueDigest:b.observedRuntimeDigest,
    observedModeControlDigest:a.observedModeClosureDigest,
    observedModeRescueDigest:b.observedModeClosureDigest,
    originalSourceSelectedRescuesControl:selected(control),
    originalSourceSelectedRescuesTreatment:selected(treatment),
    allSeatOwnerRescueSelectionsTreatment:selected(treatment),
    actualActorHandlerPrecedence:
      control.rows[0].actorOnlyDecisionCoverage.selectedHandlerPriority,
    componentVersions:
      control.rows[0].actorOnlyDecisionCoverage.componentVersions,
    environmentVariableMapFromRunDefinition:'AGENT2_HELD_GUZMA_MOBILITY_DEV=true',
    environmentNotFullyObserved:true,
    paperCompetitiveGamesQualified:0};
}
if(require.main===module){
  assert.equal(process.argv.length,3,'Pass the archived native JSON file path');
  const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(attestPairedArchive(input),null,2)+'\n');
}
module.exports={VERSION,attestPairedArchive};
