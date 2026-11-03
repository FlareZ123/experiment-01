'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent19-paper-attach-energy-blocked-to-v1';

/** @param {object} left @param {object} right */
function sameTarget(left,right){
  return left?.player===right?.player&&left?.slot===right?.slot&&
    left?.index===right?.index;
}

/**
 * Reversible opt-in paper target guard around actual native Store.dispatch.
 * Current pinned AttachEnergyPrompt.validate() ignores options.blockedTo.
 * The guard rejects explicitly forbidden destination targets before the
 * native prompt callback can move physical Energy. No vendor files change.
 *
 * @template T
 * @param {()=>T} execute Synchronous headless Store workload.
 * @param {{Store?:Function}} [dependencies] Mock seam for independent tests.
 * @returns {{result:T,audit:object}}
 */
function withPaperAttachEnergyBlockedTo(execute,dependencies={}){
  assert.equal(typeof execute,'function');
  const compiled=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=dependencies.Store??
    require(path.join(compiled,'game/store/store')).Store;
  const prototype=Store.prototype;
  const original=Object.getOwnPropertyDescriptor(prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const audit={version:VERSION,inspected:0,rejected:0,
    nativeAccepted:0,correctedNativeGameQualified:false};
  function dispatch(action,...args){
    if(action?.constructor?.name==='ResolvePromptAction'){
      const prompt=this.state?.prompts?.find(item=>item.id===action.id&&
        item.result===undefined);
      if(prompt?.constructor?.name==='AttachEnergyPrompt'){
        audit.inspected++;
        const blocked=prompt.options?.blockedTo??[];
        const transfers=action.result;
        if(Array.isArray(transfers)&&transfers.some(t=>
          blocked.some(b=>sameTarget(t.to,b)))){
          audit.rejected++;
          const error=new Error('PAPER_ATTACH_ENERGY_BLOCKED_TO');
          error.code='PAPER_ATTACH_ENERGY_BLOCKED_TO';
          error.paperAttachBlockedToAudit={...audit};
          throw error;
        }
      }
    }
    const result=original.value.apply(this,[action,...args]);
    if(action?.constructor?.name==='ResolvePromptAction')
      audit.nativeAccepted++;
    return result;
  }
  Object.defineProperty(prototype,'dispatch',{...original,value:dispatch});
  try{return {result:execute(),audit:{...audit}};}
  finally{
    assert.equal(Object.getOwnPropertyDescriptor(prototype,'dispatch').value,
      dispatch);
    Object.defineProperty(prototype,'dispatch',original);
  }
}
module.exports={VERSION,sameTarget,withPaperAttachEnergyBlockedTo};
