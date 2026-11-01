'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Prevent a native PutDamagePrompt response from assigning positive counters
 * to an explicitly zero-cap target. Some pinned card reducers encode printed
 * target prohibitions in maxAllowedDamage, while pinned prompt.validate()
 * checks only total, slot and player, so otherwise accepts forbidden choices.
 *
 * This intentionally does not impose a generic positive target maximum:
 * some reducers set their maximum as an HP/UI hint rather than an attack
 * resolution bound. The 0-cap prohibition is the proven printed target rule
 * for Gengar UNB's Shadow Pain.
 *
 * @returns {()=>void} One-shot restore of the exact original prototype.
 */
function installPutDamageZeroCapPaperHook(){
  const {PutDamagePrompt}=require(path.join(
    output,'game/store/prompts/put-damage-prompt'));
  const original=PutDamagePrompt.prototype.validate;
  PutDamagePrompt.prototype.validate=function guardedValidate(answer,state){
    if(!original.call(this,answer,state))return false;
    if(!Array.isArray(answer))return true;
    for(const row of answer){
      if(!(row?.damage>0))continue;
      const target=row.target;
      const cap=this.maxAllowedDamage.find(entry=>
        entry.target.player===target.player &&
        entry.target.slot===target.slot &&
        entry.target.index===target.index);
      if(cap?.damage===0)return false;
    }
    return true;
  };
  return ()=>{
    PutDamagePrompt.prototype.validate=original;
  };
}

/**
 * Run a bounded native experiment under the reversible paper-zero-cap hook.
 * Like all other prototype-scoped research hooks, the caller must run
 * synchronously and isolate games: no overlapping concurrent engine use.
 *
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
  installPutDamageZeroCapPaperHook,withPutDamageZeroCapPaperHook
};
