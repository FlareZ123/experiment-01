'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent41-paper-supporter-historical-paired-comparison-v1';

/** @param {object[]} a @param {object[]} b */
function firstRootDivergence(a,b){
  if(!Array.isArray(a)||!Array.isArray(b))return {
    status:'root-sequence-not-recorded',index:null,baseline:null,guarded:null
  };
  const end=Math.max(a.length,b.length);
  for(let i=0;i<end;i++){
    if(JSON.stringify(a[i]??null)!==JSON.stringify(b[i]??null)){
      return {status:'first-root-divergence',index:i,
        baseline:a[i]??null,guarded:b[i]??null};
    }
  }
  return {status:'same-visible-root-sequence',index:null,
    baseline:null,guarded:null};
}

/**
 * Strictly developmental four-arm registration; preserve all errors and caps.
 * No outcome is admitted to a competitive numerator or denominator.
 * @param {object} baseline
 * @param {object} guarded
 */
function compareHistoricalSupporterQuota(baseline,guarded){
  assert.equal(baseline.paperSupporterQuotaOptIn,false);
  assert.equal(guarded.paperSupporterQuotaOptIn,true);
  assert.equal(baseline.paperSupporterComparisonTraceOptIn,true);
  assert.equal(guarded.paperSupporterComparisonTraceOptIn,true);
  assert.equal(baseline.rows.length,4);
  assert.equal(guarded.rows.length,4);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(guarded.competitiveQualifiedGames,0);
  assert.equal(baseline.enginePin,guarded.enginePin);
  const pairs=baseline.rows.map((base,i)=>{
    const fixed=guarded.rows[i];
    assert.equal(base.trial.id,fixed.trial.id);
    assert.equal(base.trial.seed,fixed.trial.seed);
    assert.equal(base.trial.candidateId,fixed.trial.candidateId);
    assert.equal(base.trial.candidateSlot,fixed.trial.candidateSlot);
    const sourceDealEvidence=base.sourceDealFingerprint &&
      fixed.sourceDealFingerprint?
      base.sourceDealFingerprint===fixed.sourceDealFingerprint:
      'unverified';
    return {
      id:base.trial.id,seed:base.trial.seed,
      sourceDealIdentity:sourceDealEvidence,
      startIdentity:base.actualStarterSeat!==undefined &&
        fixed.actualStarterSeat!==undefined?
        base.actualStarterSeat===fixed.actualStarterSeat:'unverified',
      firstRootDivergence:firstRootDivergence(
        base.paperSupporterComparisonTrace,
        fixed.paperSupporterComparisonTrace),
      baseline:{
        status:base.status??'completed-or-censored',
        rootDigest:base.rootActionLedgerSha256??null,
        actions:base.actionCount??null,
        candidateAttacks:base.attackDeclarations?.candidate??null,
        endReason:base.endReason??null,
        error:base.error??null
      },
      guarded:{
        status:fixed.status??'completed-or-censored',
        rootDigest:fixed.rootActionLedgerSha256??null,
        actions:fixed.actionCount??null,
        candidateAttacks:fixed.attackDeclarations?.candidate??null,
        endReason:fixed.endReason??null,
        paperQuotaQualified:fixed.nativeSupporterQuotaQualified??'unverified',
        paperQuotaVetoes:fixed.paperSupporterDiscipline?.rootDispatchVetoes??[],
        suppressedProposals:fixed.paperSupporterDiscipline?.ownerProposalSuppressions??[],
        error:fixed.error??null
      }
    };
  });
  return {
    schema:VERSION,enginePin:baseline.enginePin,
    originalPolicy:baseline.candidatePolicy,
    guardedPolicy:guarded.candidatePolicy,
    attemptsBaseline:baseline.rows.length,
    attemptsGuarded:guarded.rows.length,
    pairedRows:pairs,
    nativeSupporterQuotaQualified:guarded.nativeSupporterQuotaQualified,
    competitiveQualifiedGames:0,
    caveat:'Historical same-seed development contrast only; not independent results, policy competence or paper-clock evidence'
  };
}

if(require.main===module){
  const [originalPath,guardedPath]=process.argv.slice(2);
  assert.ok(originalPath&&guardedPath,
    'Usage: node scripts/agent41-paper-supporter-paired-replay.cjs baseline.json guarded.json');
  const baseline=JSON.parse(fs.readFileSync(originalPath,'utf8'));
  const guarded=JSON.parse(fs.readFileSync(guardedPath,'utf8'));
  process.stdout.write(JSON.stringify(
    compareHistoricalSupporterQuota(baseline,guarded),null,2)+'\n');
}

module.exports={VERSION,firstRootDivergence,compareHistoricalSupporterQuota};
