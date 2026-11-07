'use strict';
const assert=require('node:assert/strict');
const {runStewardBroaderV8,trials}=require('./agent36-issue25-common-v8.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent39-v8-original-eight-volt-paper-portfolio-ab-v1';

/**
 * A and B share the immutable prospective v8 eight-arm registration, source
 * printings, candidate deck identities, physical seeds and 128-root horizon.
 * Only the already-built optional native Volt paper prompt guard differs.
 *
 * These are replayed/development outcomes, not unseen prospective results,
 * complete games or win-rate estimates. No winner can be inferred from them.
 * @param {boolean} guard
 * @returns {object}
 */
function execute(guard){
  return runStewardBroaderV8({
    runner:options=>runDevelopment({...options,paperPromptPortfolio:guard})
  });
}

/** @param {object} row @returns {object} */
function summarize(row){
  const trial=row.trial??{};
  const audit=row.paperPromptPortfolioAudit??
    row.paperPromptPortfolioAbortEvidence??null;
  const sourceReconciliation=row.paperPromptOriginalSourceRootReconciliation??null;
  return {id:trial.id??row.id??null,
    originalRank:trial.rank??null,
    sourceSeat:row.sourceSeat??null,
    paperGuardObserved:row.paperPromptPortfolioOptIn===true,
    guardStatus:audit?.schema??null,
    marked:audit?.sourceMarkedPromptCount??0,
    markedPhysicalVerified:audit?.livePaperVerifiedPhysicalEffect??0,
    markedPaperInvalidVetoed:audit?.paperInvalidVetoed??0,
    markedUnverified:audit?.paperUnverified??0,
    liveNativeSilentNoop:audit?.liveNativeSilentNoop??0,
    nativePromptResolutionCount:audit?.liveResolutionCount??0,
    sourceReconciliation};
}

/**
 * Run exactly the eight registered, fixed source/candidate/seed combinations
 * twice, preserving every abort and capped outcome.
 * @returns {object}
 */
function run(){
  const registered=trials();
  assert.equal(registered.length,8);
  assert.deepEqual(registered.map(r=>r.rank),[6,6,11,11,1,1,3,3]);
  const baseline=execute(false);
  const treatment=execute(true);
  const a=baseline.diagnostic.actualAttemptRows;
  const b=treatment.diagnostic.actualAttemptRows;
  assert.equal(a.length,8);
  assert.equal(b.length,8);
  const am=new Map(a.map(r=>[r.id,r]));
  const bm=new Map(b.map(r=>[r.id,r]));
  assert.deepEqual([...am.keys()],[...bm.keys()]);
  const comparisons=registered.map(trial=>{
    const left=am.get(trial.id),right=bm.get(trial.id);
    assert.ok(left&&right);
    assert.equal(left.sourceDealFingerprint,right.sourceDealFingerprint,
      'A/B must preserve the same exact physical original source deal');
    assert.equal(left.fullPhysicalDealFingerprint,right.fullPhysicalDealFingerprint,
      'A/B must preserve the same full initial physical deal');
    return {id:trial.id,originalRank:trial.rank,
      sourceDealFingerprint:right.sourceDealFingerprint,
      fullPhysicalDealFingerprint:right.fullPhysicalDealFingerprint,
      baselineStatus:left.status,treatmentStatus:right.status,
      baselineNativeOutcome:left.nativeOutcome,
      treatmentNativeOutcome:right.nativeOutcome,
      baselineAcceptedRoots:left.acceptedNativeRootCount,
      treatmentAcceptedRoots:right.acceptedNativeRootCount,
      baselineDeclaredSourceAttacks:left.actualDeclaredSourceAttacks,
      treatmentDeclaredSourceAttacks:right.actualDeclaredSourceAttacks,
      baselineSettledSourceAttacks:left.completedSettledSourceAttacks,
      treatmentSettledSourceAttacks:right.completedSettledSourceAttacks};
  });
  const rows=treatment.rawDevelopment?.rows??[];
  const auditRows=rows.map(summarize);
  assert.ok(auditRows.length<=8);
  const nativeGuardRows=auditRows.filter(r=>r.paperGuardObserved);
  return {schema:VERSION,
    profile:'retrospective original-v8 same-eight native opt-in Volt paper prompt guard',
    pin:treatment.manifest.observedGitVendorPinExpected,
    registration:treatment.manifest.originalSourceRegistration,
    boundedRootsPerArm:treatment.manifest.nativeRootActionLimit,
    originalRegisteredTrials:8,sourcePrintsPreserved:true,
    sameInitialPhysicalDeals:true,
    reportedGuardAudits:nativeGuardRows.length,
    comparisons,audits:auditRows,
    v8BaselineVerdict:baseline.diagnostic.verdict,
    v8TreatmentVerdict:treatment.diagnostic.verdict,
    fullPaperGameCertified:false,competitiveGamesQualified:0,
    estimatedWinRate:null};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\\n');
module.exports={VERSION,execute,summarize,run};
