'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {campingGearPaperVerdict}=
  require('./agent12-campinggear-prompt-paper-hook.cjs');

const VERSION='agent12-paper-prompt-disposition-observer-v2a-defined-native-settlement';

/**
 * Report strictly covered printed paper contracts separately from native
 * prompt validator results and native acceptance. Other prompt families have
 * no independently established paper coverage under this observer.
 *
 * @param {object} state Authentic original Store pre-dispatch state.
 * @param {object} action Actual pending reply.
 * @returns {object} Detached public-count-only paper classification.
 */
function classifyPendingPaperPrompt(state,action){
  if(action?.constructor?.name!=='ResolvePromptAction')
    return null;
  const prompt=state.prompts?.find(x=>x.id===action.id&&
    x.result===undefined);
  if(!prompt)
    return {status:'PROMPT_PAPER_UNVERIFIED',family:'no-live-matching-prompt',
      printing:null,submittedCount:null,coverage:'missing-prompt-context'};
  const family=prompt.constructor?.name??'unknown-prompt';
  const printing=prompt.sourceCard?.fullName??null;
  const count=Array.isArray(action.result)?action.result.length:null;
  const verdict=campingGearPaperVerdict(state,action);
  if(verdict.applicable){
    return {
      status:verdict.paperValid?'PROMPT_PAPER_VERIFIED':'PROMPT_PAPER_INVALID',
      family,printing,submittedCount:verdict.cardCount,
      sourceContract:'Camping Gear BST: mandatory exactly one own-deck card',
      independentPaperCount:verdict.one,
      independentPaperZone:verdict.ownDeck,
      independentPaperPhysicalDeckMembership:verdict.physicalCardInDeck,
      nativeValidateVerdict:verdict.nativeValid
    };
  }
  return {status:'PROMPT_PAPER_UNVERIFIED',family,printing,
    submittedCount:count,coverage:'no-independent-paper-family-contract'};
}

/**
 * Reversible, strictly passive Store audit: collect native accepted/rejected
 * resolutions and conservative print-aware verdicts with true denominators.
 * No prompt data, private zones or verdicts are supplied to a player policy.
 *
 * @template T
 * @param {()=>T} run Existing native game.
 * @param {{Store?:Function,exampleLimit?:number}} [options]
 * @returns {{result:T,audit:object}}
 */
function withPaperPromptDispositionObserver(run,options={}){
  assert.equal(typeof run,'function');
  const Store=options.Store??require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const maxExamples=options.exampleLimit??12;
  assert.ok(Number.isInteger(maxExamples)&&maxExamples>=0&&maxExamples<=100);
  const audit={version:VERSION,coverage:'Camping Gear BST only',
    resolvedPromptAttempts:0,nativeAccepted:0,nativeSettled:0,
    nativeReturnedNoThrow:0,nativeReturnOnlyNoOp:0,
    nativeSettlementUnverified:0,nativeRejected:0,
    statusCounts:{PROMPT_PAPER_VERIFIED:0,PROMPT_PAPER_INVALID:0,
      PROMPT_PAPER_UNVERIFIED:0},
    firstByStatus:{},examples:[],examplesTruncated:false,
    paperQualifiedWholeGame:false};
  function dispatch(action,...args){
    const classification=classifyPendingPaperPrompt(this.state,action);
    if(!classification)return original.value.apply(this,[action,...args]);
    const index=audit.resolvedPromptAttempts++;
    audit.statusCounts[classification.status]++;
    const receipt={ordinal:index,actorTurn:this.state.turn??null,
      ...classification,nativeAccepted:null,nativeSettlement:null,
      nativeReturnedNoThrow:false,physicalEffectVerified:false};
    if(!audit.firstByStatus[classification.status])
      audit.firstByStatus[classification.status]=receipt;
    if(audit.examples.length<maxExamples)audit.examples.push(receipt);
    else audit.examplesTruncated=true;
    // A nonthrowing Store return can be a silent no-op for stale prompt IDs.
    // Capture the actual live object before dispatch, then check its result.
    // Matching a result proves only native prompt settlement, never card
    // custody, printed effect completion, or a competitive paper-valid action.
    const pending=this.state.prompts?.find(p=>
      p.id===action.id&&p.result===undefined);
    try{
      const result=original.value.apply(this,[action,...args]);
      receipt.nativeReturnedNoThrow=true;
      audit.nativeReturnedNoThrow++;
      if(pending&&pending.result!==undefined&&
         Object.is(pending.result,action.result)){
        receipt.nativeSettlement='PROMPT_RESULT_SETTLED';
        receipt.nativeAccepted=true;
        audit.nativeAccepted++;
        audit.nativeSettled++;
      }else if(pending&&pending.result===undefined&&
               this.state.prompts?.includes(pending)){
        receipt.nativeSettlement='NATIVE_RETURN_ONLY_NO_OP';
        receipt.nativeAccepted=false;
        audit.nativeReturnOnlyNoOp++;
      }else{
        receipt.nativeSettlement='PROMPT_SETTLEMENT_UNVERIFIED';
        receipt.nativeAccepted=false;
        audit.nativeSettlementUnverified++;
      }
      return result;
    }catch(error){
      receipt.nativeAccepted=false;
      audit.nativeRejected++;
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent12PaperPromptDispositionAudit=audit;
    throw error;
  }finally{
    assert.equal(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,classifyPendingPaperPrompt,
  withPaperPromptDispositionObserver};
