'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');

const root=path.resolve(__dirname,'../..');
const registration=require('../../results/aichi-2026/registrations/agent29-fresh-hammer-8arm-20261030.json');

/**
 * Git blob hash, identical to GitHub's content SHA. Prevents a moving
 * shared-branch adapter from silently changing a pre-registered game policy.
 * @param {string} rel Repo-relative path.
 * @returns {string}
 */
function gitBlob(rel){
  const file=fs.readFileSync(path.join(root,rel));
  return crypto.createHash('sha1')
    .update('blob '+file.length+'\0')
    .update(file).digest('hex');
}

/** Strict provenance gate, before the first trial of either condition. */
function checkFrozenPolicy(){
  assert.equal(registration.status,'pre-execution');
  assert.equal(registration.engineGitlink,
    execFileSync('git',['rev-parse','HEAD'],{
      cwd:path.join(root,'vendor/twinleaf'),encoding:'utf8'
    }).trim());
  assert.equal(gitBlob('results/aichi-2026/full-decklists.json'),
    registration.sourceRosterBlob);
  for(const [source,sha] of Object.entries(registration.frozenSourceBlobs)){
    assert.equal(gitBlob(source),sha,'Frozen source changed: '+source);
  }
  assert.equal(registration.attemptsPerTreatment,8);
  assert.equal(registration.totalGames,16);
  assert.equal(registration.trials.length,8);
  assert.deepEqual(registration.policyTreatments,[
    'AGENT29_HAMMER_AFTER_PASS_DEV=false',
    'AGENT29_HAMMER_AFTER_PASS_DEV=true'
  ]);
}

/**
 * Execute exact original-source 60s against the same two fixed candidate
 * 60s. No source-first seed screening, no post-result selection, no
 * inferred winners from incomplete or capped games.
 *
 * @param {boolean} enabled Hammer after-Pass treatment.
 * @returns {object} Complete development runner result.
 */
function runCondition(enabled){
  process.env.AGENT29_HAMMER_AFTER_PASS_DEV=enabled?'true':'false';
  return runDevelopment({
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    sourceFirstRetrospective:false,
    actorOnlyComposition:true,
    actorOnlySingleSearch:true,
    actorHandDiscard:true,
    actorChoosePokemon:true,
    mandatoryOptionFallback:true,
    paperSupporterQuota:true
  });
}

/** @param {object} row Native row, including failures. */
function retainedRow(row){
  return {
    trial:row.trial,
    status:row.status??'settled',
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    finished:row.finished??null,
    capped:row.capped??null,
    sourceFirstTurn:row.sourceFirstTurn??null,
    actionCount:row.actionCount??null,
    // Engine labels are archival only, explicitly not competitive wins.
    engineWinnerLabelUnqualified:row.winner??null,
    error:row.error??null,
    nativeAbortEvidence:row.nativeAbortEvidence??null,
    hammerAudit:row.actorOnlyDecisionCoverage?.ownerHammerAfterPassAudit??null
  };
}

/** Record the two policy branches and all failed/capped observations. */
function run(){
  checkFrozenPolicy();
  const original=process.env.AGENT29_HAMMER_AFTER_PASS_DEV;
  let baseline,treated;
  try{
    baseline=runCondition(false);
    treated=runCondition(true);
  }finally{
    if(original===undefined)delete process.env.AGENT29_HAMMER_AFTER_PASS_DEV;
    else process.env.AGENT29_HAMMER_AFTER_PASS_DEV=original;
  }
  assert.equal(baseline.attempted,8);
  assert.equal(treated.attempted,8);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(treated.competitiveQualifiedGames,0);
  const comparisons=[];
  for(let i=0;i<registration.trials.length;i++){
    const plan=registration.trials[i],base=baseline.rows[i],
      changed=treated.rows[i];
    assert.equal(base.trial.id,plan.id);
    assert.equal(changed.trial.id,plan.id);
    const sourceSeat=plan.candidateSlot==='A'?1:0;
    const a=changed.actorOnlyDecisionCoverage?.ownerHammerAfterPassAudit??null;
    if(a){
      assert.equal(a.competitiveQualified,false);
      assert.equal(a.policyStrategicallyValidated,false);
      assert.equal(a.proposedHammerRoots,
        a.acceptedHammerRoots+a.rejectedHammerRoots);
    }
    comparisons.push({
      id:plan.id,seed:plan.seed,sourceSeat,
      candidateSeat:1-sourceSeat,
      sourceDealMatch:Boolean(base.sourceDealFingerprint &&
        changed.sourceDealFingerprint &&
        base.sourceDealFingerprint===changed.sourceDealFingerprint),
      actualStarterMatch:base.actualStarterSeat!==undefined &&
        changed.actualStarterSeat!==undefined &&
        base.actualStarterSeat===changed.actualStarterSeat,
      baseline:retainedRow(base),
      treatment:retainedRow(changed),
      sourceOwnHammerAccepted:a?.bySeat?.[sourceSeat]?.roots??null,
      sourceOwnEnergyDiscards:a?.bySeat?.[sourceSeat]?.discards??null,
      candidateOwnHammerAccepted:a?.bySeat?.[1-sourceSeat]?.roots??null,
      candidateOwnEnergyDiscards:a?.bySeat?.[1-sourceSeat]?.discards??null
    });
  }
  const statuses=comparisons.flatMap(row=>[
    row.baseline.status,row.treatment.status]);
  const accepted=comparisons.reduce(
    (n,row)=>n+(row.sourceOwnHammerAccepted??0),0);
  const discarded=comparisons.reduce(
    (n,row)=>n+(row.sourceOwnEnergyDiscards??0),0);
  const sourceFirst=comparisons.filter(row=>
    row.treatment.actualStarterSeat===row.sourceSeat).length;
  const sourceSecond=comparisons.filter(row=>
    row.treatment.actualStarterSeat===row.candidateSeat).length;
  const summary={
    schema:registration.schema,
    trialCount:8,gameCount:16,
    sourceRank:6,
    sourceActuallyFirst:sourceFirst,
    sourceActuallySecond:sourceSecond,
    sourceFirstUnknown:8-sourceFirst-sourceSecond,
    sameSourceDealPairs:comparisons.filter(row=>row.sourceDealMatch).length,
    sameStarterPairs:comparisons.filter(row=>row.actualStarterMatch).length,
    sourceHammerAccepted:accepted,
    sourcePhysicalEnergyDiscards:discarded,
    sourceHammerRejected:comparisons.reduce((n,row)=>
      n+(row.treatment.hammerAudit?.rejectedHammerRoots??0),0),
    nativeAbortOrCapCases:statuses.filter(x=>x!=='settled').length,
    attemptedGames:16,qualifiedCompetitiveGames:0,
    gameStrengthEstimated:false
  };
  return {registration,summary,comparisons};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={gitBlob,checkFrozenPolicy,run};
