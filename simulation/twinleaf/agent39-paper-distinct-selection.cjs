'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent39-distinct-physical-card-negative-paper-prompt-v1';
const REASON='DUPLICATE_PHYSICAL_CARD_SELECTION';

/**
 * Return a negative paper-selection defect only when the submitted result
 * repeats the same exact physical Card object. Name-equal, distinct physical
 * cards remain legal. It does not independently certify other printed effect
 * conditions, prompt source/ownership, count, or native eligibility.
 *
 * @param {object|null} prompt Existing native prompt.
 * @param {unknown} answer Submitted real Store prompt result.
 * @returns {string|null} Null means unverified, never paper-qualified.
 */
function duplicatePhysicalChoiceReason(prompt,answer){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
    !Array.isArray(answer))return null;
  for(const card of answer){
    if(!card||typeof card!=='object')return null;
  }
  return new Set(answer).size<answer.length?REASON:null;
}

/**
 * Default-off common native Store dispatch preflight for a negative-only
 * paper selection rule. Clone Store prompts receive the same paper veto
 * but their attempts are never promoted to live-match observations.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned engine Store task.
 * @param {{Store?:Function}} [deps] Test seam.
 * @returns {{result:T,audit:object}}
 */
function withDistinctPhysicalCardSelectionVeto(execute,deps={}){
  assert.equal(typeof execute,'function');
  const out=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(out,'game/store/store')).Store;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  let live=null;
  const audit={schema:VERSION,nativeLiveStoreObserved:false,
    totalChooseCardAttempts:0,liveChooseCardAttempts:0,
    auxiliaryChooseCardAttempts:0,negativePaperVetoes:0,
    liveNegativePaperVetoes:0,otherPromptFamiliesUnverified:true,
    positivePaperQualification:false,competitiveQualifiedGames:0};
  function guarded(action,...args){
    if(live===null&&action?.constructor?.name==='AddPlayerAction'){
      live=this;
      audit.nativeLiveStoreObserved=true;
    }
    if(action?.constructor?.name==='ResolvePromptAction'){
      const pending=this.state.prompts?.find(p=>
        p.id===action.id&&p.result===undefined);
      if(pending?.constructor?.name==='ChooseCardsPrompt'){
        audit.totalChooseCardAttempts++;
        if(this===live)audit.liveChooseCardAttempts++;
        else audit.auxiliaryChooseCardAttempts++;
        const reason=duplicatePhysicalChoiceReason(pending,action.result);
        if(reason){
          audit.negativePaperVetoes++;
          if(this===live)audit.liveNegativePaperVetoes++;
          throw new Error('PAPER_PROMPT_INVALID:'+reason);
        }
      }
    }
    return before.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:guarded});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.duplicatePhysicalSelectionAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,guarded);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}

module.exports={VERSION,REASON,duplicatePhysicalChoiceReason,
  withDistinctPhysicalCardSelectionVeto};
