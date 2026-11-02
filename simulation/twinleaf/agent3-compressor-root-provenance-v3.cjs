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
       action.clientId===ownerClient&&
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
       this.state.prompts.includes(pending.prompt)&&
       pending.prompt.result===undefined) {
      const {owner:source,prompt}=pending;
      const beforeDeck=[...source.deck.cards];
      const beforeDiscard=[...source.discard.cards];
      const result=original.call(this,action,...args);
      const moved=movedDeckCards(beforeDeck,beforeDiscard,
        source.deck.cards,source.discard.cards);
      const minimum=Math.max(1,prompt.options?.min??0);
      const maximum=prompt.options?.max??3;
      const paperMinimumMet=moved.length>=minimum&&
        moved.length<=maximum;
      receipts.push({
        globalTurn:this.state.turn,sourceSeat:seat,
        exactLiveStore:true,sourcePlayPhysicallyTracked:true,
        sourceCard:{name:pending.sourceCard.name,
          id:pending.sourceCard.id,
          fullName:pending.sourceCard.fullName},
        sameIssuedPrompt:true,paperMinimumMet,
        physicallyMoved:moved.map(c=>({
          name:c.name,id:c.id,fullName:c.fullName
        }))
      });
      pending=null;
      return result;
    }
    return original.call(this,action,...args);
  }
  StoreClass.prototype.dispatch=observe;
  try {
    const result=execute();
    return {result,audit:{
      schema:'agent3-live-root-compressor-provenance-v3',
      sourceSeat:seat,liveRootIdentified:root!==null,
      ignoredSpeculativeDispatches,selectedSourcePlays,
      acceptedSourcePlays,linkedPromptsIssued,
      positiveLinkedSettlements:receipts.filter(r=>r.paperMinimumMet).length,
      receipts,competitivelyQualified:false
    }};
  } finally {
    assert.strictEqual(StoreClass.prototype.dispatch,observe);
    StoreClass.prototype.dispatch=original;
  }
}
module.exports={withSourceCompressorRootProvenance};
