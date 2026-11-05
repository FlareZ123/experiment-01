'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseVipPromptCards,PRINTING,PROMPT_MESSAGE}=
  require('./agent9-battle-vip-owner-after-pass.cjs');

const VERSION='agent45-native-selected-vip-owner-search-v1';

/**
 * Continue only a genuine native-selected Battle VIP Pass owner search.
 * The live Store must first accept the actual hand-held printed Item and
 * create a new, owner-specific two-Basic deck prompt. No hidden deck cards
 * are accessed before that authorized search.
 *
 * @template T
 * @param {()=>T} next Synchronous native experiment or test.
 * @param {object} [deps] Injectable pinned engine definitions.
 * @returns {{result:T,audit:object}}
 */
function withNativeSelectedVipOwnerSearch(next,deps={}){
  assert.equal(typeof next,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=name=>require(path.join(output,name));
  const Ai=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const Stage=deps.Stage??native('game/store/card/card-types').Stage;
  const SuperType=deps.SuperType??native('game/store/card/card-types').SuperType;
  const observe=deps.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  assert.equal(typeof observe,'function');

  let live=null,stores=0;
  const pendingByOwner=new Map();
  const selectedActions=new WeakMap();
  const audit={
    schema:VERSION,physicalStores:0,observedPrintedVipRoots:0,
    nativeVipRootDispatchFailures:0,sourceStampedOwnerPrompts:0,
    unmatchedVipRoots:0,ownerSearchProposals:0,
    acceptedOwnerSearches:0,rejectedOwnerSearches:0,
    nativeSettledOwnerPrompts:0,physicalDeckToBenchSettlements:0,
    acceptedEmptySelections:0,unsettledNativeReturns:0,
    bySeat:{0:{roots:0,settled:0},1:{roots:0,settled:0}},
    boundedPublicEvents:[],hiddenCardsPublished:false,
    paperEntireGameCertified:false,competitiveGamesQualified:0
  };
  const record=event=>{
    if(audit.boundedPublicEvents.length<24)
      audit.boundedPublicEvents.push(event);
  };
  const countBench=owner=>
    owner.bench.filter(slot=>slot.cards.length>0).length;

  function dispatch(action,...args){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&this!==live){
      live=this;
      stores++;
      pendingByOwner.clear();
      audit.physicalStores=stores;
    }
    const genuine=this===live;
    const state=this.state;
    const seat=genuine&&type==='PlayCardAction'?
      state.players.findIndex(p=>p.id===action.id):-1;
    const owner=seat>=0?state.players[seat]:null;
    const played=owner?.hand?.cards?.[action.handIndex]??null;
    const vip=played?.fullName===PRINTING;
    const knownPrompts=vip?
      new Set((state.prompts??[]).map(p=>p.id)):null;

    const proposed=genuine?selectedActions.get(action):null;
    const originalOwner=proposed?state.players[proposed.seat]:null;
    const originalPrompt=proposed?(state.prompts??[]).find(p=>
      p.id===proposed.promptId&&
      p.playerId===originalOwner?.id&&
      p.result===undefined&&p.cards===originalOwner?.deck):null;
    const deckBefore=proposed?originalOwner.deck.cards.length:null;
    const benchBefore=proposed?countBench(originalOwner):null;
    const originallyInDeck=proposed?
      proposed.cards.every(card=>originalOwner.deck.cards.includes(card)):false;
    let response;
    try{
      response=beforeDispatch.value.call(this,action,...args);
    }catch(error){
      if(vip)audit.nativeVipRootDispatchFailures++;
      if(proposed)audit.rejectedOwnerSearches++;
      throw error;
    }
    if(vip){
      audit.observedPrintedVipRoots++;
      audit.bySeat[seat].roots++;
      const after=this.state.players[seat];
      const created=(this.state.prompts??[]).find(p=>
        !knownPrompts.has(p.id)&&p.result===undefined&&
        p.playerId===after.id&&p.cards===after.deck&&
        p.constructor?.name==='ChooseCardsPrompt'&&
        p.message===PROMPT_MESSAGE&&
        p.options?.min===0&&p.options?.max===2);
      if(created){
        pendingByOwner.set(after.id,{
          seat,turn:this.state.turn,promptId:created.id,
          storeOrdinal:stores
        });
        audit.sourceStampedOwnerPrompts++;
      }else audit.unmatchedVipRoots++;
      record({kind:'printed-vip-root',seat,turn:this.state.turn,
        nativeOwnerDeckPromptCreated:Boolean(created)});
    }
    if(proposed){
      const settled=!!originalPrompt&&
        action.result!==undefined&&originalPrompt.result===action.result;
      if(!settled){
        audit.unsettledNativeReturns++;
        throw new Error(
          'Native-selected VIP owner search returned without settling its original prompt'
        );
      }
      const after=this.state.players[proposed.seat];
      const count=proposed.cards.length;
      const moved=originallyInDeck&&
        deckBefore-after.deck.cards.length===count&&
        countBench(after)-benchBefore===count&&
        proposed.cards.every(card=>
          !after.deck.cards.includes(card)&&
          after.bench.some(slot=>slot.cards.includes(card)));
      audit.acceptedOwnerSearches++;
      audit.nativeSettledOwnerPrompts++;
      audit.bySeat[proposed.seat].settled++;
      if(count===0)audit.acceptedEmptySelections++;
      if(count>0&&moved)audit.physicalDeckToBenchSettlements++;
      record({kind:'owner-vip-search',seat:proposed.seat,
        turn:proposed.turn,selectedCount:count,
        actualNativePromptSettled:true,
        physicalDeckToBenchVerified:count>0&&moved,
        emptySelection:count===0});
      pendingByOwner.delete(proposed.ownerId);
    }
    return response;
  }

  function decode(state){
    if(state!==live?.state)
      return beforeDecode.value.call(this,state);
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat<0)return beforeDecode.value.call(this,state);
    const owner=state.players[seat];
    const seen=pendingByOwner.get(owner.id);
    const prompt=state.prompts?.find(p=>p.id===seen?.promptId&&
      p.result===undefined);
    if(!seen||seen.seat!==seat||seen.turn!==state.turn||
       prompt?.playerId!==owner.id||prompt.cards!==owner.deck||
       prompt.message!==PROMPT_MESSAGE||
       prompt.options?.min!==0||prompt.options?.max!==2)
      return beforeDecode.value.call(this,state);
    const view=observe(state,seat);
    assert.equal(view.decisionKind,'owner-prompt');
    assert.equal(view.pendingOwnerDeckSearch,true);
    const cards=chooseVipPromptCards(prompt,view,{
      BASIC:Stage.BASIC,POKEMON:SuperType.POKEMON
    });
    assert.ok(cards.length<=2&&
      cards.every(card=>owner.deck.cards.includes(card)&&
        card.stage===Stage.BASIC&&card.superType===SuperType.POKEMON));
    assert.equal(prompt.validate(cards,state),true);
    const action=new ResolvePromptAction(prompt.id,cards);
    selectedActions.set(action,{
      seat,turn:state.turn,ownerId:owner.id,
      promptId:prompt.id,cards:[...cards]
    });
    audit.ownerSearchProposals++;
    return action;
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeDispatch,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...beforeDecode,value:decode
  });
  try{return {result:next(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent45NativeSelectedVipAudit={...audit,
        boundedPublicEvents:[...audit.boundedPublicEvents]};
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',beforeDecode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  }
}

module.exports={VERSION,withNativeSelectedVipOwnerSearch};
