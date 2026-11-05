'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent35-owner-letter-search-after-native-item-v1';

/**
 * Choose two physical Darkness Basic Energy cards only inside the matching
 * owner deck-search prompt. No card in an unopened deck is inspected.
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {object} owner Genuine owner holding the pending prompt.
 * @param {object} types Pinned Store enums.
 * @returns {object[]|null} Native card instances or no certified choice.
 */
function chooseLetterDarkness(prompt,owner,types){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt' ||
     prompt.playerId!==owner?.id || prompt.result!==undefined ||
     prompt.cards!==owner.deck ||
     prompt.message!==types.GameMessage.CHOOSE_CARD_TO_HAND ||
     prompt.filter?.superType!==types.SuperType.ENERGY ||
     prompt.filter?.energyType!==types.EnergyType.BASIC ||
     prompt.options?.min!==0 || prompt.options?.max!==2 ||
     prompt.options?.allowCancel!==false)return null;
  const basics=owner.deck.cards.filter(card=>
    card.superType===types.SuperType.ENERGY &&
    card.energyType===types.EnergyType.BASIC &&
    card.provides?.includes(types.CardType.DARKNESS));
  if(basics.length<2)return null;
  // Both cards have identical printed Energy function; using physical deck
  // order only after the permitted search does not influence future draws.
  const selected=basics.slice(0,2);
  return prompt.validate(selected)===true?selected:null;
}

/**
 * For one already registered native source match, resolve only the actual
 * Professor's Letter owner-deck search that follows its accepted Item root.
 * Leave the raw-State native fallback quarantine intact for every other root.
 *
 * @template T
 * @param {()=>T} run Actual synchronous native match.
 * @param {{registration:object,SimpleTacticsAi?:Function,Store?:Function,
 * ResolvePromptAction?:Function,types?:object}} deps
 * @returns {{result:T,audit:object}}
 */
function withOwnerLetterSearch(run,deps){
  assert.equal(typeof run,'function');
  const reg=deps.registration;
  assert.ok(reg?.originalSourceSeat===0||reg?.originalSourceSeat===1);
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=p=>require(path.join(root,p));
  const Ai=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??{
    ...load('game/store/card/card-types'),
    GameMessage:load('game/game-message').GameMessage
  };
  const priorAi=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof priorAi?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  const audit={
    version:VERSION,sourceSeat:reg.originalSourceSeat,
    registeredTurn:reg.sourceTurn,
    letterRootAttempts:0,acceptedLetterRoots:0,
    nativeLetterOwnerSearchPrompts:0,promptMatchFailures:0,
    ownerOnlySearchChoices:0,promptDispatchFailures:0,
    physicallySettledSearches:0,physicalTransferFailures:0,
    chosenPrintings:[],nativeRawStateFallbackDisabled:false,
    opponentHiddenInformationInspected:false,
    competitiveGamesQualified:0
  };
  let live=null,registeredPrompt=null;
  const submitted=new WeakMap();

  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&live!==this){
      live=this;
      registeredPrompt=null;
    }
    const actual=this===live;
    const state=this.state;
    const owner=actual?state.players[reg.originalSourceSeat]:null;
    const card=actual&&kind==='PlayCardAction'&&
      action.id===owner?.id?owner.hand.cards[action.handIndex]:null;
    const isLetter=card?.fullName===reg.sourceCardToPlay &&
      state.turn===reg.sourceTurn;
    const priorPrompts=isLetter?new Set(state.prompts):null;
    if(isLetter)audit.letterRootAttempts++;
    const selected=actual?submitted.get(action):null;
    let result;
    try{
      result=priorStore.value.apply(this,[action,...args]);
    }catch(error){
      if(selected)audit.promptDispatchFailures++;
      throw error;
    }
    if(isLetter){
      const afterOwner=this.state.players[reg.originalSourceSeat];
      if(!afterOwner.hand.cards.includes(card)){
        audit.acceptedLetterRoots++;
        const newPrompts=this.state.prompts.filter(p=>
          !priorPrompts.has(p) && p.result===undefined &&
          p.playerId===afterOwner.id &&
          p.constructor?.name==='ChooseCardsPrompt' &&
          p.cards===afterOwner.deck);
        if(newPrompts.length===1){
          registeredPrompt={prompt:newPrompts[0],ownerId:afterOwner.id,
            store:this,turn:this.state.turn,seat:reg.originalSourceSeat};
          audit.nativeLetterOwnerSearchPrompts++;
        }else audit.promptMatchFailures++;
      }
    }
    if(selected){
      const after=this.state.players[selected.seat];
      const settled=selected.prompt.result===action.result;
      const transferred=selected.cards.every(card=>
        selected.wasInDeck.has(card) &&
        !after.deck.cards.includes(card) &&
        after.hand.cards.includes(card));
      if(!settled||!transferred){
        audit.physicalTransferFailures++;
        throw new Error('Owner Letter search did not settle two physical deck-to-hand Energy cards');
      }
      audit.physicallySettledSearches++;
      audit.chosenPrintings=selected.cards.map(card=>card.fullName);
      registeredPrompt=null;
    }
    return result;
  }

  function decode(state,...args){
    const owner=state?.players?.[reg.originalSourceSeat];
    const p=registeredPrompt?.prompt;
    if(state===live?.state && owner?.id===this.client?.id &&
       registeredPrompt?.store===live &&
       registeredPrompt?.turn===state.turn &&
       p?.result===undefined && state.prompts.includes(p)){
      const cards=chooseLetterDarkness(p,owner,types);
      if(cards){
        const action=new ResolvePromptAction(p.id,cards);
        submitted.set(action,{prompt:p,cards,seat:reg.originalSourceSeat,
          wasInDeck:new Set(owner.deck.cards)});
        audit.ownerOnlySearchChoices++;
        return action;
      }
      audit.promptMatchFailures++;
    }
    return priorAi.value.call(this,state,...args);
  }

  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...priorAi,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...priorStore,value:dispatch});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent35OwnerLetterSearchAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',priorAi);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',priorStore);
  }
}

module.exports={VERSION,chooseLetterDarkness,withOwnerLetterSearch};
