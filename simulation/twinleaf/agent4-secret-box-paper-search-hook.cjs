'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent4-secret-box-twm-printed-one-per-trainer-category-search-v1';

/**
 * Independent original Secret Box TWM paper restriction:
 * choose zero or one *distinct physical owner-deck card* per Trainer category.
 * Source printing and stage eligibility are checked by the caller.
 * @param {object} prompt Genuine source-stamped search prompt.
 * @param {unknown} choice Real native physical selected-card array.
 * @param {object} owner Genuine owner of the prompted deck.
 * @param {{TrainerCard:Function,TrainerType:object}} types Native classes.
 * @returns {string|null} Paper-invalid reason; null on supported valid reply.
 */
function secretBoxSearchCategoryNegative(prompt,choice,owner,types){
  if(!Array.isArray(choice)||choice.length>4)
    return 'SECRET_BOX_SEARCH_AT_MOST_FOUR_TRAINERS';
  if(new Set(choice).size!==choice.length)
    return 'SECRET_BOX_SEARCH_DUPLICATE_PHYSICAL_CARD';
  if(prompt?.cards!==owner?.deck||
     !Array.isArray(owner?.deck?.cards)||
     choice.some(card=>!owner.deck.cards.includes(card)))
    return 'SECRET_BOX_SEARCH_NOT_IN_OWNER_DECK';
  const categories=Object.values(types.TrainerType).filter(Number.isSafeInteger);
  const seen=new Set();
  for(const card of choice){
    if(!(card instanceof types.TrainerCard)||
       !categories.includes(card.trainerType))
      return 'SECRET_BOX_SEARCH_NOT_ELIGIBLE_TRAINER';
    if(seen.has(card.trainerType))
      return 'SECRET_BOX_SEARCH_MORE_THAN_ONE_PER_CATEGORY';
    seen.add(card.trainerType);
  }
  return null;
}

/**
 * Reversible default-off native Store dispatch guard. It never modifies vendor
 * code and checks only a live Secret Box TWM's owner-deck search, not payment
 * or unrelated Trainer prompts.
 * @template T
 * @param {()=>T} run Synchronous native Store experiment.
 * @param {{Store?:Function,TrainerCard?:Function,TrainerType?:object,
 *  requireLiveStore?:boolean,currentTrialId?:()=>string|null}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperSecretBoxSearchCategory(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(output,p));
  const Store=deps.Store??native('game/store/store').Store;
  const types={
    TrainerCard:deps.TrainerCard??native('game/store/card/trainer-card').TrainerCard,
    TrainerType:deps.TrainerType??native('game/store/card/card-types').TrainerType
  };
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const liveOnly=deps.requireLiveStore===true;
  const key=()=>deps.currentTrialId?.()??'__single__';
  const live=new Map();
  const audit={version:VERSION,liveStoreRequired:liveOnly,liveStores:0,
    ignoredAuxiliary:0,sourceSearchPrompts:0,acceptedSearches:0,
    vetoedSearches:0,vetoReasons:{},competitiveQualifiedGames:0};
  function dispatch(action,...rest){
    const type=action?.constructor?.name;
    if(liveOnly&&type==='AddPlayerAction'&&!live.has(key())){
      live.set(key(),this);audit.liveStores++;
    }
    if(liveOnly&&live.get(key())!==this){
      audit.ignoredAuxiliary++;
      return before.value.call(this,action,...rest);
    }
    let paperValidSourceSearch=false;
    if(type==='ResolvePromptAction'){
      const prompt=this.state?.prompts?.find(p=>
        p.id===action.id&&p.result===undefined);
      if(prompt?.constructor?.name==='ChooseCardsPrompt'&&
         prompt?.sourceCard?.fullName==='Secret Box TWM'&&
         prompt?.message==='CHOOSE_CARD_TO_HAND'){
        audit.sourceSearchPrompts++;
        const owner=this.state.players?.find(p=>p.id===prompt.playerId);
        const negative=secretBoxSearchCategoryNegative(
          prompt,action.result,owner,types);
        if(negative){
          audit.vetoedSearches++;
          audit.vetoReasons[negative]=(audit.vetoReasons[negative]??0)+1;
          throw Error('PAPER_SECRET_BOX_SEARCH_INVALID:'+negative);
        }
        paperValidSourceSearch=true;
      }
    }
    const result=before.value.call(this,action,...rest);
    if(paperValidSourceSearch)audit.acceptedSearches++;
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}
module.exports={VERSION,secretBoxSearchCategoryNegative,
  withPaperSecretBoxSearchCategory};
