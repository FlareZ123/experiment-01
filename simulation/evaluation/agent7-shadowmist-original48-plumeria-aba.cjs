'use strict';
const assert=require('node:assert/strict');
const {runStewardSelectedIssue25V4}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runOriginalShadowMistHammerAB,TARGET,ENV_NAME}=
  require('./agent7-shadowmist-original48-hammer-aba.cjs');

const VERSION='agent7-shadowmist-rank6-original48-plumeria-afterpass-aba-v1';

/**
 * Reuse the exact original eight-arm physical-deal and root-parity harness.
 * The Hammer flag is held OFF in both executions. Select only the existing
 * symmetric owner Plumeria-after-Pass policy in the treatment.
 * @param {{execute?:Function,compare?:Function}} [deps] Pure test seams.
 * @returns {object}
 */
function runOriginalShadowMistPlumeriaAB(deps={}){
  const execute=deps.execute??runStewardSelectedIssue25V4;
  const compare=deps.compare??runOriginalShadowMistHammerAB;
  const result=compare(mode=>{
    const had=Object.hasOwn(process.env,ENV_NAME);
    const before=process.env[ENV_NAME];
    try{
      process.env[ENV_NAME]='false';
      return execute({runner:options=>runDevelopment({
        ...options,actorPlumeriaAfterPass:mode==='treatment'
      })});
    }finally{
      if(had)process.env[ENV_NAME]=before;
      else delete process.env[ENV_NAME];
    }
  });
  assert.equal(result.historicalRegisteredTrialCount,8);
  assert.equal(result.targetTrial,TARGET);
  return {
    ...result,
    version:VERSION,
    controlPolicy:'unchanged-original-selected-v4',
    treatmentPolicy:'same-source-independent-policy-plus-owner-Plumeria-after-Pass',
    supportPaymentAndEnergyTargetNativePromptValidationRequired:true,
    nativePaperCompetitiveGames:0,
    firstChangedSourceAction:result.target.firstDivergence
  };
}
module.exports={VERSION,runOriginalShadowMistPlumeriaAB};
