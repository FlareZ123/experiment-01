'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Check the printed target restrictions and damage packet units of a native
 * PutDamagePrompt answer. The pinned Store does NOT call prompt.validate()
 * when it resolves a ResolvePromptAction; the guard must run at dispatch.
 *
 * A zero entry in maxAllowedDamage excludes that target. A positive
 * damageMultiple requires each positive assignment to use whole packets.
 * Other maxAllowedDamage values may be UI/HP hints, so this bounded guard
 * does not impose a generic positive maximum without card-specific proof.
 *
 * @param {object} prompt Genuine native PutDamagePrompt
 * @param {unknown} answer Submitted ResolvePromptAction result
 * @param {object} state Genuine Store State, never sent to the bot scorer
 * @returns {string|null} Error code, or null if covered checks pass
 */
function paperPutDamageRejectReason(prompt,answer,state){
  if(!prompt.validate(answer,state))return 'NATIVE_PROMPT_VALIDATE_FALSE';
  if(!Array.isArray(answer))return null;
  const multiple=prompt.options.damageMultiple;
  for(const row of answer){
    if(!Number.isSafeInteger(row?.damage)||row.damage<0){
      return 'INVALID_DAMAGE_AMOUNT';
    }
    if(row.damage===0)continue;
    if(Number.isSafeInteger(multiple)&&multiple>0&&
       row.damage%multiple!==0){
      return 'INVALID_PRINTED_DAMAGE_PACKET';
    }
    const target=row.target;
    const cap=prompt.maxAllowedDamage.find(entry=>
      entry.target.player===target.player&&
      entry.target.slot===target.slot&&
      entry.target.index===target.index);
    if(cap?.damage===0)return 'PRINTED_TARGET_ZERO_CAP';
  }
  return null;
}

/**
 * Scope the real Store's ResolvePromptAction boundary to paper-target and
 * packet checks, preserving the pinned code and all other dispatches.
 *
 * @returns {()=>void} Restore original Store.dispatch exactly.
 */
function installPutDamageZeroCapPaperHook(){
  const {Store}=require(path.join(output,'game/store/store'));
  const {PutDamagePrompt}=require(path.join(
    output,'game/store/prompts/put-damage-prompt'));
  const {ResolvePromptAction}=require(path.join(
    output,'game/store/actions/resolve-prompt-action'));
  const original=Store.prototype.dispatch;
  Store.prototype.dispatch=function guardedDispatch(action,clientRoleId){
    if(action instanceof ResolvePromptAction){
      const pending=this.state.prompts.find(p=>
        p.id===action.id&&p.result===undefined);
      if(pending instanceof PutDamagePrompt){
        const reason=paperPutDamageRejectReason(
          pending,action.result,this.state);
        if(reason!==null){
          throw new Error('PAPER_PUT_DAMAGE_REJECTED:'+reason);
        }
      }
    }
    return original.call(this,action,clientRoleId);
  };
  return ()=>{Store.prototype.dispatch=original;};
}

/**
 * Run synchronously with the reversible guard; parallel uses of the global
 * pinned Store prototype are unsupported in this research runtime.
 * @template T
 * @param {()=>T} execute
 * @returns {T}
 */
function withPutDamageZeroCapPaperHook(execute){
  const restore=installPutDamageZeroCapPaperHook();
  try{return execute();}
  finally{restore();}
}
module.exports={
  paperPutDamageRejectReason,
  installPutDamageZeroCapPaperHook,
  withPutDamageZeroCapPaperHook
};
