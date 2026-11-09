'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent3-native-playability-orphan-prompt-custody-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Repair an upstream playability-calculation side effect, when demonstrated:
 * CAN_PLAY_CARD can create a prompt as a speculative playability check,
 * while Store.calculatePlayability removes only the corresponding promptItem.
 * Such an orphan remains unresolved in state.prompts, so a later native bot
 * can attempt to answer it even though Store.reducePrompt has no callback.
 *
 * Prune only prompts that were introduced DURING this exact calculation, still
 * have an undefined result, and have no live matching native promptItem.
 * Preserve all pre-existing prompts and any new registered prompt. This does
 * not choose a card, provide a game action, or suppress an actual pending
 * prompt. Hook is opt-in; upstream Twinleaf files remain untouched.
 *
 * @template T
 * @param {()=>T} execute Synchronous native original-source game(s).
 * @param {{Store?:Function}} [deps] Native constructor seam for tests.
 * @returns {{result:T,audit:object}}
 */
function withPlayabilityOrphanPromptCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.join(OUTPUT,'game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(
    Store.prototype,'calculatePlayability');
  assert.equal(typeof original?.value,'function');
  const audit={version:VERSION,calculateCalls:0,created:0,
    removedOrphanedUnresolved:0,retainedRegistered:0,
    unregisteredAlreadyExisting:0,byKind:{},sample:[],
    paperQualifiedGames:0};
  function calculate(state,...args){
    const prior=new Set(state.prompts);
    audit.calculateCalls++;
    const result=original.value.apply(this,[state,...args]);
    const prompts=result?.prompts??state.prompts;
    const registered=new Set(
      (this.promptItems??[]).flatMap(item=>item.ids??[]));
    const introduced=prompts.filter(p=>!prior.has(p));
    audit.created+=introduced.length;
    const existingOrphaned=prompts.filter(p=>prior.has(p)&&
      p.result===undefined&&!registered.has(p.id));
    audit.unregisteredAlreadyExisting+=existingOrphaned.length;
    for(let i=prompts.length-1;i>=0;i--){
      const prompt=prompts[i];
      if(prior.has(prompt))continue;
      if(prompt.result!==undefined)continue;
      if(registered.has(prompt.id)){
        audit.retainedRegistered++;
        continue;
      }
      prompts.splice(i,1);
      audit.removedOrphanedUnresolved++;
      const kind=prompt.constructor?.name??'Unknown';
      audit.byKind[kind]=(audit.byKind[kind]??0)+1;
      if(audit.sample.length<40)
        audit.sample.push({kind,turn:state.turn,
          promptId:prompt.id,source:prompt.sourceCard?.name??null});
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'calculatePlayability',
    {...original,value:calculate});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.calculatePlayability,calculate,
      'A nested hook displaced the custody correction');
    Object.defineProperty(Store.prototype,'calculatePlayability',original);
  }
}
module.exports={VERSION,withPlayabilityOrphanPromptCustody};
