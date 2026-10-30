'use strict';
const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {actorSingleSearchInput,withActorOwnerSingleSearch}=
  require('./agent41-actor-owner-single-search.cjs');
const {firstNativeValidBundle,VERSION:SOLVER_VERSION}=
  require('./agent22-sparse-owner-bundles.cjs');

const VERSION='agent22-owner-sparse-search-adapter-v1';
const SEARCH_MESSAGES=new Set([
  'CHOOSE_CARD_TO_HAND','CHOOSE_CARD_FROM_DECK',
  'CHOOSE_CARD_FROM_DISCARD','SEARCH_DECK_FOR_CARD'
]);

/**
 * Strict opt-in fallback for a large, genuine owner deck/discard search.
 * Use the canonical owner search unmodified whenever it succeeds.
 * Only the native validator is allowed to inspect physical card instances.
 *
 * @param {object} state Live native Store.state.
 * @param {0|1} seat Authenticated answering player seat.
 * @param {(state:object,seat:number)=>object} [observeActor]
 * @returns {object|null} Detached print-only prompt observation.
 */
function sparseObservedOwnerSearch(state,seat,observeActor=actorObservation,scoreBundle=null){
  const standard=actorSingleSearchInput(state,seat,observeActor);
  // The canonical complete-menu projection can return an empty bundle menu:
  // it tested no individually-valid singletons, although a multi-card
  // native-valid choice may still exist. Search the sparse path in that case.
  if(standard&&(!Array.isArray(standard.prompt?.bundles)||
     standard.prompt.bundles.length>0)){
    if(scoreBundle===null||!Array.isArray(standard.prompt.bundles))
      return standard;
    assert.equal(typeof scoreBundle,'function');
    const ranked=standard.prompt.bundles.map(bundle=>{
      const score=scoreBundle(bundle.printings);
      assert.ok(Number.isFinite(score),'Bundle score must be finite');
      return {bundle,score};
    }).sort((a,b)=>b.score-a.score||
      b.bundle.printings.length-a.bundle.printings.length||
      (JSON.stringify(a.bundle.printings)<JSON.stringify(b.bundle.printings)?
        -1:JSON.stringify(a.bundle.printings)>JSON.stringify(b.bundle.printings)?
          1:0));
    return Object.freeze({...standard,prompt:Object.freeze({
      ...standard.prompt,bundles:Object.freeze([ranked[0].bundle])
    })});
  }
  assert.ok(seat===0||seat===1);
  const owner=state.players?.[seat];
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(pending?.constructor?.name!=='ChooseCardsPrompt'||
     pending.playerId!==owner?.id||
     !SEARCH_MESSAGES.has(pending.message))return null;
  const source=pending.cards===owner.deck?'own-deck':
    pending.cards===owner.discard?'own-discard':null;
  if(source===null||pending.message!=='CHOOSE_CARD_TO_HAND')
    return null;
  const options=pending.options??{};
  if(options.min>1||!Number.isInteger(options.max)||
     options.max<2||options.max>3)return null;
  const bundles=firstNativeValidBundle(pending,options.max,scoreBundle);
  if(!bundles)return null;
  const offered=pending.cards.cards.map(card=>({
    printing:card.fullName,
    selectableAlone:pending.validate([card])===true
  })).sort((a,b)=>a.printing<b.printing?-1:
    a.printing>b.printing?1:
      Number(b.selectableAlone)-Number(a.selectableAlone))
    .map((entry,index)=>Object.freeze({index,...entry}));
  const actor=observeActor(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      id:pending.id,message:pending.message,source,
      offered:Object.freeze(offered),bundles,
      canSkip:pending.validate([])===true,
      canCancel:pending.validate(null)===true
    })
  });
}

/**
 * Drop-in ownerSearch adapter for the canonical actor composition.
 * This optional wrapper preserves Agent41 native action mapping, actual
 * Store acceptance checks and non-live/simulated prompt exclusion.
 *
 * @template T
 * @param {()=>T} execute
 * @param {object} [deps] Existing Agent41 injectable seam.
 * @returns {{result:T,audit:object}}
 */
function withSparseActorOwnerSearch(execute,deps={}){
  const observe=deps.observe??(deps.scoreBundle===undefined?
    sparseObservedOwnerSearch:(state,seat)=>
      sparseObservedOwnerSearch(state,seat,actorObservation,deps.scoreBundle));
  const original=withActorOwnerSingleSearch(execute,{...deps,observe});
  return {...original,audit:{
    ...original.audit,version:VERSION,underlyingVersion:original.audit.version,
    sparseBundleSolver:SOLVER_VERSION,
    scoredBundleOptIn:typeof deps.scoreBundle==='function',
    competitiveGameQualified:false
  }};
}

module.exports={VERSION,sparseObservedOwnerSearch,withSparseActorOwnerSearch};
