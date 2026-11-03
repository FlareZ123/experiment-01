'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {movedDeckCards,ownerCompressorPrompt}=
  require('./agent3-compressor-discard-settlement.cjs');

/**
 * Observe original source Battle Compressor only when its own accepted card
 * play created the SAME unresolved prompt on the actual headless game Store.
 * Speculative bot Simulator clones must never count as match effects.
 *
 * This is a default-off, diagnostic observer. Matching a prompt is necessary
 * evidence, not independent paper-effect or whole-game qualification.
 *
 * @template T
 * @param {0|1} seat Source physical seat
 * @param {()=>T} execute Synchronous native game
 * @param {{StoreClass?:Function}} [dependencies] Pure-test seam
 * @returns {{result:T,audit:object}}
 */
function withSourceCompressorRootProvenance(seat,execute,dependencies={}) {
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const StoreClass=dependencies.StoreClass??
    require(path.resolve(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=StoreClass.prototype.dispatch;
  const ownerClient=seat===0?101:202;
  let root=null,pending=null;
  let ignoredSpeculativeDispatches=0,selectedSourcePlays=0;
  let acceptedSourcePlays=0,linkedPromptsIssued=0;
  const receipts=[];
  function observe(action,...args) {
    const actionName=action?.constructor?.name;
    if(root===null&&actionName==='AddPlayerAction'&&
       action.clientId===101) root=this;
    if(this!==root) {
      ignoredSpeculativeDispatches++;
      return original.call(this,action,...args);
    }
    const state=this.state;
    const owner=state?.players?.[seat];
    if(actionName==='PlayCardAction'&&
       action.id===ownerClient&&
       state?.activePlayer===seat&&owner) {
      const physical=owner.hand.cards[action.handIndex];
      const compressor=physical?.name==='Battle Compressor';
      if(compressor)selectedSourcePlays++;
      const result=original.call(this,action,...args);
      if(compressor) {
        acceptedSourcePlays++;
        const current=ownerCompressorPrompt(this.state,seat);
        if(current) {
          pending={prompt:current.prompt,sourceCard:physical,
            turn:this.state.turn,owner:current.owner};
          linkedPromptsIssued++;
        } else pending=null;
      }
      return result;
    }
    if(actionName==='ResolvePromptAction'&&pending&&
       this.state.turn===pending.turn&&
       action.id===pending.prompt.id&&
       this.state.prompts.includes(pending.prompt)&&
       pending.prompt.result===undefined) {
      const {owner:source,prompt}=pending;
      const beforeDeck=[...source.deck.cards];
      const beforeDiscard=[...source.discard.cards];
      const result=original.call(this,action,...args);
      const moved=movedDeckCards(beforeDeck,beforeDiscard,
        source.deck.cards,source.discard.cards);
      // XY Phantom Forces 92 prints "up to 3" for an Item: 1..3.
      // Native prompt bounds are diagnostics, never the paper-rule oracle.
      const printedMinimum=1,printedMaximum=3;
      const paperMinimumMet=moved.length>=printedMinimum&&
        moved.length<=printedMaximum;
      receipts.push({
        globalTurn:this.state.turn,sourceSeat:seat,
        exactLiveStore:true,sourcePlayPhysicallyTracked:true,
        sourceCard:{name:pending.sourceCard.name,
          id:pending.sourceCard.id,
          fullName:pending.sourceCard.fullName},
        sameIssuedPrompt:true,paperMinimumMet,
        printedMinimum,printedMaximum,
        nativePromptMinimum:prompt.options?.min??null,
        nativePromptMaximum:prompt.options?.max??null,
        physicallyMoved:moved.map(c=>({
          name:c.name,id:c.id,fullName:c.fullName
        }))
      });
      pending=null;
      return result;
    }
    return original.call(this,action,...args);
  }
  /**
   * Snapshot evidence even if the native runner throws before a normal return.
   * An accepted play can lack a resolved prompt when an attempt aborts.
   * @returns {object}
   */
  function audit(){
    return {
      schema:'agent3-live-root-compressor-provenance-v3',
      sourceSeat:seat,liveRootIdentified:root!==null,
      ignoredSpeculativeDispatches,selectedSourcePlays,
      acceptedSourcePlays,linkedPromptsIssued,
      unresolvedLinkedPrompt:pending!==null,
      positiveLinkedSettlements:receipts.filter(r=>r.paperMinimumMet).length,
      receipts:[...receipts],competitivelyQualified:false
    };
  }
  StoreClass.prototype.dispatch=observe;
  try {
    const result=execute();
    return {result,audit:audit()};
  } catch(error) {
    // Preserve abort-side custody without converting the attempt into a win
    // or masking the original exception. Outer runners must retain this field.
    if(error&&typeof error==='object'&&
       !Object.hasOwn(error,'nativeSourceCompressorRootAudit')){
      error.nativeSourceCompressorRootAudit={
        ...audit(),observationIsPartial:true,
        executionDisposition:'NATIVE_ABORT',
        nativeErrorName:error.constructor?.name??'Error'
      };
    }
    throw error;
  } finally {
    assert.strictEqual(StoreClass.prototype.dispatch,observe);
    StoreClass.prototype.dispatch=original;
  }
}
/**
 * Extract the first source-root custody witness through nested error causes.
 * @param {unknown} error
 * @returns {object|null}
 */
function sourceCompressorAbortAudit(error){
  const visited=new Set();
  for(let current=error,depth=0;current&&typeof current==='object'&&
    depth<12&&!visited.has(current);current=current.cause,depth++){
    visited.add(current);
    const audit=current.nativeSourceCompressorRootAudit;
    if(audit?.schema==='agent3-live-root-compressor-provenance-v3')
      return audit;
  }
  return null;
}
module.exports={withSourceCompressorRootProvenance,sourceCompressorAbortAudit};
