'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runAgent7BilateralLillieV9}=
  require('./agent7-v9-bilateral-lillie-pass-retro.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeJsonAtomic}=
  require('./agent36-issue25-common-v9-bilateral-competence.cjs');
const {VERSION:POLICY_VERSION,withOwnerPowerglassAfterSupporter}=
  require('../twinleaf/agent35-v9-owner-powerglass-after-lillie.cjs');
const VERSION='agent35-v9-both-seat-powerglass-after-lillie-exposed-deal-v1';
const ROOT=path.resolve(__dirname,'../..');
const ARTIFACT=path.join(ROOT,
  'artifacts/agent35-v9-powerglass-development/issue25-powerglass-after-lillie.json');
const DEBUG=path.join(ROOT,
  'artifacts/agent35-v9-powerglass-development/native-row-pre-lillie-assertion.json');

/**
 * One reversible patch to the dynamically looked-up canonical Lillie seam.
 * Keep Lillie at root93; then let the Powerglass adapter observe a later
 * genuine owner Pass inside the same physical game. Restoration is mandatory.
 * @param {()=>object} run Native historical v9 runner.
 * @param {object} [deps] Test seams.
 */
function withPowerglassNestedInsideLillie(run,deps={}){
  assert.equal(typeof run,'function');
  const module=deps.lillieModule??
    require('../twinleaf/agent12-actor-only-lillie-after-pass.cjs');
  const before=Object.getOwnPropertyDescriptor(module,'withActorOnlyLillieAfterPass');
  const layer=deps.powerglassLayer??withOwnerPowerglassAfterSupporter;
  assert.equal(typeof before?.value,'function');
  assert.equal(typeof layer,'function');
  let compositions=0;
  const layerAudits=[];
  function wrapped(underlying,...args){
    compositions++;
    return before.value.call(module,()=>{
      try{
        const observed=layer(underlying);
        layerAudits.push(observed.audit);
        return observed.result;
      }catch(error){
        const audit=error?.agent35PowerglassAudit??null;
        layerAudits.push(audit);
        writeJsonAtomic(path.join(ROOT,
          'artifacts/agent35-v9-powerglass-development/native-policy-abort-audit.json'),{
          schema:'agent35-powerglass-abort-owner-public-v1',
          exceptionMessageSha256:createHash('sha256')
            .update(String(error?.message??error)).digest('hex'),
          powerglassAudit:audit,
          competitiveGamesQualified:0
        });
        throw error;
      }
    },...args);
  }
  Object.defineProperty(module,'withActorOnlyLillieAfterPass',{
    ...before,value:wrapped
  });
  try{return {result:run(),audit:{schema:VERSION,compositions,
    powerglass:layerAudits,qualifiedCompetitiveGames:0}};}
  finally{
    assert.strictEqual(module.withActorOnlyLillieAfterPass,wrapped);
    Object.defineProperty(module,'withActorOnlyLillieAfterPass',before);
  }
}

function runAgent35NativeFork(deps={}){
  const baseline=deps.base??(()=>runAgent7BilateralLillieV9({
    runner:options=>{
      const result=runDevelopment(options);
      writeJsonAtomic(DEBUG,{
        schema:'agent35-pre-agent7-lillie-assertion-v1',
        actorBilateralLillieAfterPass:options.actorBilateralLillieAfterPass,
        rowCount:result?.rows?.length??null,
        rows:(result?.rows??[]).map(row=>({
          id:row.id,status:row.status,nativeOutcome:row.nativeOutcome,
          error:row.error,nativeRootActionCount:row.nativeRootActionCount,
          rootActionCount:row.rootActionCount,
          rowKeys:Object.keys(row).sort(),
          publicAcceptedRootTail:(row.rootActionLedger??[]).slice(-24),
          nativeAbortEvidence:row.nativeAbortEvidence??null,
          actorNativeTrainerFallbackAbortAudit:
            row.actorNativeTrainerFallbackAbortAudit??null,
          ownerBilateralLillieAfterPassAudit:
            row.ownerBilateralLillieAfterPassAudit??null
        }))
      });
      return result;
    }
  }));
  const observed=withPowerglassNestedInsideLillie(baseline,deps);
  const report=observed.result;
  assert.equal(observed.audit.compositions,1);
  const powerglass=observed.audit.powerglass[0];
  assert.ok(powerglass,'Real Powerglass adapter audit missing');
  assert.equal(powerglass.liveStoreDetected,true);
  assert.ok(powerglass.rootAccepted>0,'No genuine Powerglass Tool accepted');
  assert.ok(powerglass.promptAccepted>0,'No genuine Powerglass owner-discard prompt accepted');
  assert.ok(powerglass.attachedFromDiscard>0,'No physical Basic Energy attachment');
  assert.equal(powerglass.rootRejected,0);
  assert.equal(report.manifest.confirmatoryTrial,false);
  assert.equal(report.manifest.competitiveGamesQualified,0);
  const policy=fs.readFileSync(path.join(ROOT,
    'simulation/twinleaf/agent35-v9-owner-powerglass-after-lillie.cjs'));
  const wrapper=fs.readFileSync(__filename);
  report.manifest.agent35PowerglassVariant={
    schema:VERSION,policySchema:POLICY_VERSION,
    sourceIndependent:true,bothSeats:true,registeredOriginalSourceRank:11,
    historicalDeal:true,postExposureDevelopment:true,
    originalAndCandidateSixtiesChanged:false,
    comparedToExistingAgent7LillieTreatment:true,
    ownerOnlyRootEligibility:true,ownerDiscardPromptUsesPublicZone:true,
    originalBaselinePolicyHashExcludesAdditionalOwnerPowerglassWrapper:true,
    qualifiedCompetitiveGames:0,
    policySha256:createHash('sha256').update(policy).digest('hex'),
    wrapperSha256:createHash('sha256').update(wrapper).digest('hex')
  };
  report.nativeAdapterAudit.agent35Powerglass=powerglass;
  report.qualification.competitiveAdmission=false;
  report.qualification.bilateralMaterialEpisodeQualified=false;
  report.qualification.reason=
    'Historical v9 rank11 native reproduction with extra after-Lillie owner-visible Powerglass and physical owner-discard prompt. Exposed deal; opponent policy, paper, hidden-zone and event clock remain unqualified.';
  return report;
}

function main(){
  const report=runAgent35NativeFork();
  writeJsonAtomic(ARTIFACT,report);
  process.stdout.write(JSON.stringify({
    schema:VERSION,rootActionCount:report.nativeAttempt.rootActionCount,
    status:report.nativeAttempt.status,finished:report.nativeAttempt.finished,
    winner:report.nativeAttempt.winner,finalPrizes:report.nativeAttempt.finalPrizes,
    powerglass:report.nativeAdapterAudit.agent35Powerglass,
    qualifiedCompetitiveGames:0,artifact:ARTIFACT
  },null,2)+'\n');
}
if(require.main===module)main();
module.exports={VERSION,ARTIFACT,withPowerglassNestedInsideLillie,
  runAgent35NativeFork};
