'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {installNativeSupporterProposalValidationTrace,VERSION}=
  require('./native-supporter-proposal-validation-observer.cjs');

/**
 * Install the native bot decision, Supporter proposal and isValidAction trace
 * outside other canonical policy wrappers, then restore the exact methods.
 * The optional tape is the physical policy decision's random consumption;
 * it does not establish detached-world parity until separately replayed.
 *
 * @template T
 * @param {()=>T} execute Original synchronous headless runner.
 * @param {{SimpleTacticsAi?:Function,PlaySupporterTactic?:Function,
 *   maxDecisions?:number,tapeOrdinal?:number|null}} [options]
 * @returns {{result:T,audit:object}}
 */
function withNativeProposalValidationAudit(execute,options={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=options.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const PlaySupporterTactic=options.PlaySupporterTactic??
    require(path.join(base,
      'simple-bot/simple-tactics/play-supporter-tactic')).PlaySupporterTactic;
  const observer=installNativeSupporterProposalValidationTrace(
    SimpleTacticsAi,PlaySupporterTactic,{
      maxDecisions:options.maxDecisions??256,
      tapeOrdinal:options.tapeOrdinal??null
    });
  try{
    const result=execute();
    return {result,audit:{
      ...observer.report,canonicalIntegrationVersion:
        'agent41-canonical-native-proposal-validation-v1',
      informationSetCertified:false,competitiveGameQualified:false
    }};
  }finally{
    observer.restore();
  }
}
module.exports={VERSION,withNativeProposalValidationAudit};
