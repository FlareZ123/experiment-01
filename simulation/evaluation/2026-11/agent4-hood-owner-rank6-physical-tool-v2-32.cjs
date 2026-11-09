'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run}=require('./agent4-hood-owner-rank6-prospective-32.cjs');
const {
  withProtectedHoodUnderworld,withHeldHoodToolPriority
}=require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');
const {writeAtomicLocked}=require('../agent20-frozen-rank6-canary-v1.cjs');
const registration=require('../../../results/aichi-2026/registrations/agent4-hood-rank6-physical-tool-setup-v2-20261109.json');
const VERSION='agent4-hood-physical-tool-preparation-plus-protected-door-rank6-v2-32';

/**
 * New preregistered groups, same fixed Hood Shield sixty in both arms,
 * original rank-6 source, same canonical baseline. Only treatment enables
 * a physically held owner Tool attachment and the protected source Ability.
 * @param {{run?:Function}} [deps]
 * @returns {object}
 */
function runV2(deps={}){
  const runner=deps.run??run;
  const result=runner({
    registration,
    schema:VERSION,
    guard:work=>withHeldHoodToolPriority(()=>
      withProtectedHoodUnderworld(work))
  });
  assert.equal(result.physicalDealGroups,16);
  assert.equal(result.nativeGameAttempts,32);
  const paidToolRootCount=result.pairs.reduce((total,pair)=>
    total+pair.protected.actualHoodToolNativeActionRoots,0);
  const controlToolRootCount=result.pairs.reduce((total,pair)=>
    total+pair.baseline.actualHoodToolNativeActionRoots,0);
  return {
    ...result,
    treatmentAddsPhysicalHeldHoodRoot:true,
    treatmentAddsProtectedUnderworldSource:true,
    protectedPolicyToolNativeActionRoots:paidToolRootCount,
    baselineToolNativeActionRoots:controlToolRootCount,
    ownerToolAndAbilityOptInRestoredAfterTreatment:
      process.env.AGENT4_HOOD_TOOL_ROOT_DEV!=='true'
  };
}

if(require.main===module){
  const output=process.env.AGENT4_HOOD_TOOL_V2_OUTPUT;
  assert.ok(output,'Specify locked atomic result filename');
  const result=runV2();
  const contents=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,contents);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(contents).digest('hex')+
    '  '+path.basename(output)+'\n');
  process.stdout.write('AGENT4_HOOD_TOOL_V2_NATIVE32 '+
    JSON.stringify({
      gates:result.gates,
      matchedFullStarts:result.pairs.filter(p=>p.sameFullPhysicalDeal).length,
      protectedPowerProposals:result.protectedUnderworldSelected,
      toolRootsControl:result.baselineToolNativeActionRoots,
      toolRootsTreated:result.protectedPolicyToolNativeActionRoots,
      normalTerminals:result.controlNativeTerminals,
      treatedTerminals:result.interventionNativeTerminals,
      controlErrors:result.controlNativeErrors,
      treatmentErrors:result.interventionNativeErrors,
      firstDifferences:result.pairs.filter(p=>p.firstAcceptedRootDivergence)
        .map(p=>({id:p.id,difference:p.firstAcceptedRootDivergence})),
      paperQualifiedGames:0
    })+'\n');
  if(!Object.values(result.gates).every(Boolean)||
     !result.ownerToolAndAbilityOptInRestoredAfterTreatment)process.exitCode=1;
}

module.exports={VERSION,runV2};
