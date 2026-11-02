'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {isPaperStevenSearch}=
  require('./agent22-sparse-owner-search-adapter.cjs');

const VERSION='agent22-source-steven-physical-card-lineage-v1';

/**
 * Observe actual physical card objects selected by a native source Steven
 * deck-search prompt, then recognize a later source PlayCardAction on that
 * exact instance. The audit is post-decision only and cannot alter choices.
 * The Store's own action validity and settlement remain authoritative.
 *
 * A print-name match from a different physical copy is not a tracked play.
 * Neither the trace nor its callbacks are supplied to the game AI.
 *
 * @template T
 * @param {0|1} sourceSeat Genuine original-source physical player seat.
 * @param {()=>T} execute Synchronous native Store match.
 * @param {{Store?:Function}} [deps] Optional unit-test class injection.
 * @returns {{result:T,audit:object}} Genuine run result and source-only trace.
 */
function withSourceStevenPhysicalLineage(sourceSeat,execute,deps={}) {
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');

  const byCard=new WeakMap();
  const searches=[],laterPlays=[];
  let dispatchOrdinal=0;
  let tokenOrdinal=0;

  /** @param {object} action @returns {unknown} */
  function observedDispatch(action,...args) {
    const ordinal=++dispatchOrdinal;
    const state=this.state;
    const turnBefore=state.turn;
    const owner=state.players?.[sourceSeat];
    const pending=state.prompts?.find(prompt=>prompt.result===undefined);
    const chosen=owner&&pending?.id===action?.id&&
      action.constructor?.name==='ResolvePromptAction'&&
      isPaperStevenSearch(state,sourceSeat)&&
      Array.isArray(action.result)?[...action.result]:null;
    const played=owner&&action?.constructor?.name==='PlayCardAction'&&
      action.id===owner.id&&Number.isInteger(action.handIndex)?
        owner.hand.cards[action.handIndex]:null;
    const tagged=played?byCard.get(played):null;

    // Store acceptance remains a real dispatch, with no substituted result.
    const result=original.value.call(this,action,...args);

    if(chosen!==null){
      const tokens=[];
      for(const card of chosen){
        const entersHand=owner.hand.cards.includes(card);
        if(!entersHand)continue;
        const token=++tokenOrdinal;
        byCard.set(card,{token,printing:card.fullName});
        tokens.push({token,printing:card.fullName});
      }
      searches.push({
        dispatchOrdinal:ordinal,globalTurn:turnBefore,
        nativeSubmittedCards:chosen.length,
        nativeSettledPhysicalCards:tokens.length,
        cards:tokens
      });
    }
    if(tagged){
      const leftHand=!owner.hand.cards.includes(played);
      laterPlays.push({
        dispatchOrdinal:ordinal,globalTurn:turnBefore,
        token:tagged.token,printing:tagged.printing,
        physicallyRemovedFromSourceHand:leftHand,
        nativeDispatchReturned:true
      });
    }
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...original,value:observedDispatch
  });
  try {
    const result=execute();
    const selectedCards=searches.flatMap(search=>search.cards);
    const selectedTokens=new Set(selectedCards.map(card=>card.token));
    const acceptedPlayedTokens=new Set(laterPlays.filter(play=>
      play.physicallyRemovedFromSourceHand).map(play=>play.token));
    return {result,audit:{
      version:VERSION,sourceSeat,
      nativeSearchPromptResolutions:searches.length,
      nativeSettledSelectedPhysicalCards:selectedCards.length,
      physicalTokensLaterPlayed:[...acceptedPlayedTokens].filter(token=>
        selectedTokens.has(token)).length,
      nativeSourcePlayRootsOnTrackedCards:laterPlays.filter(play=>
        play.physicallyRemovedFromSourceHand).length,
      searches,laterPlays,
      sourceOwnHandOnly:true,postDecisionOnly:true,
      deliberatelyReadOnly:true,
      gameOutcomeQualified:false,competitiveGameQualified:false
    }};
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,withSourceStevenPhysicalLineage};
