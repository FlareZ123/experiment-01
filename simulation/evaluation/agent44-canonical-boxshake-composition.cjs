'use strict';

const assert=require('node:assert/strict');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withSharedFirstTurnBoxShake,FLEX_VERSION,VERSION}=
  require('../twinleaf/agent44-owner-boxshake-native-policy.cjs');

/**
 * Add default-off owner-visible Box/Shake as the innermost action provider
 * to the established BOTH-SEAT canonical actor chain. Because this function
 * runs only after the canonical hook was installed, Box's own state machine
 * gets first opportunity to supply a typed native root/prompt; every other
 * decision delegates to the unchanged shared actor chain.
 *
 * @template T
 * @param {()=>T} execute Synchronous native headless game.
 * @param {{enableBoxShake?:boolean,flexible?:boolean,preBoxScout?:boolean,auditOwnerK1Sources?:boolean,canonical?:Function,box?:Function}} [options]
 * @returns {{result:T,audit:object}}
 */
function withCanonicalAndBoxShake(execute,options={}){
  assert.equal(typeof execute,'function');
  const canonical=options.canonical??withCanonicalActorOnlyPolicy;
  const box=options.box??withSharedFirstTurnBoxShake;
  const enabled=options.enableBoxShake===true;
  const flexible=options.flexible===true;
  const auditOwnerK1Sources=options.auditOwnerK1Sources===true;
  const preBoxScout=options.preBoxScout===true;
  let boxAudit=null;
  const canonicalRun=canonical(()=>{
    if(!enabled)return execute();
    const wrapped=box(execute,{flexible,auditOwnerK1Sources,preBoxScout});
    assert.ok(wrapped.audit&&typeof wrapped.audit==='object');
    boxAudit=wrapped.audit;
    return wrapped.result;
  });
  assert.ok(canonicalRun.audit&&typeof canonicalRun.audit==='object');
  if(enabled)assert.ok(boxAudit,
    'Selected Box option did not install inside canonical actor');
  return {
    result:canonicalRun.result,
    audit:{
      schema:'agent44-canonical-owner-boxshake-composition-v1',
      sameCanonicalActorForBothSeats:true,
      boxOptIn:enabled,flexibleBoxOptIn:enabled&&flexible,
      ownerAuthorizedK1SourcesAudited:enabled&&auditOwnerK1Sources,
      ownerPreBoxK1ScoutOptIn:enabled&&preBoxScout,
      boxVersion:enabled?(flexible?FLEX_VERSION:VERSION):null,
      actorVersion:canonicalRun.audit.version??null,
      box:boxAudit,
      actorQualification:canonicalRun.audit.qualification??null,
      actorNativeDecisionCounts:canonicalRun.audit.nativeDecisionCounts??null,
      competitiveGames:0
    }
  };
}

module.exports={withCanonicalAndBoxShake};
