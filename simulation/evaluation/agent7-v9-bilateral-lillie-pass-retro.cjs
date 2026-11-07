'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {runStewardBilateralProbeV9,writeJsonAtomic}=
  require('./agent36-issue25-common-v9-bilateral-competence.cjs');
const {withActorOnlyLillieAfterPass}=require(
  '../twinleaf/agent12-actor-only-lillie-after-pass.cjs');

const VERSION='agent7-v9-bilateral-owner-lillie-after-pass-retro-v1';
const ROOT=path.resolve(__dirname,'../..');
const ARTIFACT=path.join(ROOT,
  'artifacts/agent36-bilateral-competence-v9/issue25-common-v9.json');

/** @param {string} pathName */
function sha256File(pathName){
  return createHash('sha256').update(fs.readFileSync(pathName)).digest('hex');
}

/**
 * Reuse an existing tested owner-only both-seat Lillie-after-Pass adapter.
 * Its native Store effect must still resolve. All current v9 selection,
 * source/candidate printed 60s, registration, and RNG options are preserved.
 *
 * @param {Function} runner Current unchanged shared real-game runner.
 * @param {Function} [withLillie] Test seam for the published adapter.
 * @returns {{run:Function,audit:Function}}
 */
function createBilateralLillieRunner(runner,withLillie=withActorOnlyLillieAfterPass){
  assert.equal(typeof runner,'function');
  assert.equal(typeof withLillie,'function');
  let lastAudit=null;
  return {
    run(options){
      assert.equal(options.actorOnlyComposition,true);
      assert.equal(options.sourceIndependentCommonPolicy,true);
      assert.equal(options.bilateralKnownDeadAttackRoot,true,
        'Keep the selected common v9 known-dead correction in both seats');
      assert.equal(options.allowAdditionalOriginalSourceRanks,false);
      const observed=withLillie(()=>runner(options));
      assert.ok(observed&&'result' in observed&&observed.audit);
      lastAudit=observed.audit;
      return observed.result;
    },
    audit(){return lastAudit;}
  };
}

/** @param {{runProbe?:Function,runner?:Function,withLillie?:Function}} [deps] */
function runAgent7BilateralLillieV9(deps={}){
  const composition=createBilateralLillieRunner(
    deps.runner??runDevelopment,deps.withLillie??withActorOnlyLillieAfterPass);
  const result=(deps.runProbe??runStewardBilateralProbeV9)({
    runner:options=>composition.run(options)
  });
  assert.equal(result?.manifest?.samePolicyBothSeats,true);
  assert.equal(result.manifest.sourceIndependentCommonPolicy,true);
  assert.equal(result.manifest.actorOnlyComposition,true);
  assert.deepEqual(result.manifest.originalSourceRanks,[11]);
  assert.equal(result.manifest.candidateSlot,'B');
  assert.equal(result.manifest.registeredTrialCount,1);
  assert.equal(result.manifest.competitiveGamesQualified,0);
  const audit=composition.audit();
  assert.ok(audit,'Missing symmetric live owner Lillie audit');
  const wrapperSha=sha256File(__filename);
  const priorHookSha=sha256File(require.resolve(
    '../twinleaf/agent12-actor-only-lillie-after-pass.cjs'));
  const hash=createHash('sha256').update(
    JSON.stringify({
      basePolicyHash:result.manifest.policyHash,
      actor12OwnerLillieHookSha256:priorHookSha,
      wrapperSha256:wrapperSha
    })
  ).digest('hex');
  result.manifest.agent7RetrospectiveVariant={
    schema:VERSION,afterSourceSeedExposure:true,
    originalSourceRank:11,sourceSeat:0,candidateSeat:1,
    bothPhysicalSeats:true,sourceIndependent:true,
    printedSixtiesChanged:false,retrospective:true,prospective:false,
    baselinePolicyHashExcludesAdditiveWrapper:true,
    composedPolicySha256:hash,
    sourceOwnerHookSha256:priorHookSha,
    wrapperSha256:wrapperSha,
    nativeHookAuthor:'agent12',
    policy:'hold Lillie only if eligible and base actor otherwise Passes',
    knownDeadAttackSelectionRemainsEnabled:true
  };
  result.nativeAdapterAudit.agent7LillieAfterPass=audit;
  result.manifest.historicalOnly=true;
  result.manifest.prospective=false;
  result.manifest.confirmatoryTrial=false;
  result.qualification.competitiveAdmission=false;
  result.qualification.bilateralMaterialEpisodeQualified=false;
  result.qualification.reason=
    'Retrospective owner-visible both-seat Lillie Pass override on a previously '+
    'exposed rank11/New Moon physical deal. Native outcomes remain development; '+
    'independent paper cards, opposing policy, hidden-zone and tournament clock audits absent.';
  return result;
}

function main(){
  const result=runAgent7BilateralLillieV9();
  writeJsonAtomic(ARTIFACT,result);
  process.stdout.write(JSON.stringify({
    schema:VERSION,rootActionCount:result.nativeAttempt.rootActionCount,
    status:result.nativeAttempt.status,finished:result.nativeAttempt.finished,
    winner:result.nativeAttempt.winner,finalPrizes:result.nativeAttempt.finalPrizes,
    ownerLillieAudit:result.nativeAdapterAudit.agent7LillieAfterPass,
    qualifiedGames:0,artifact:ARTIFACT
  },null,2)+'\n');
}
if(require.main===module)main();

module.exports={VERSION,ARTIFACT,createBilateralLillieRunner,
  runAgent7BilateralLillieV9};
