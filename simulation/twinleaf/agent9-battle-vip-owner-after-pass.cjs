'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent9-battle-vip-owner-after-pass-v1';
const PRINTING='Battle VIP Pass FST';
const PROMPT_MESSAGE='CHOOSE_CARD_TO_PUT_ONTO_BENCH';

/**
 * A narrow paper-printing-constrained first-turn Item opportunity. The input is
 * exclusively the detached acting owner's view. A real Store decides legality.
 * The preceding common actor planner has already exhausted its supported
 * root actions; this does not replace an attack, Bench action or attachment.
 *
 * @param {object} view Authenticated owner-root actorObservation.
 * @returns {{kind:string,printing:string,handIndex:number}|null}
 */
function chooseVipAfterPass(view){
  assert.equal(view?.decisionKind,'owner-root');
  const r=view.ownTurnResources,own=view.ownPublic;
  if(view.globalTurn!==1&&view.globalTurn!==2)return null;
  if(r.itemPlayLocked===true||
    own.publicTurnRestrictions?.itemPlayLocked===true||
    own.deckCount<1||
    !own.bench.some(slot=>slot===null))return null;
  const handIndex=view.ownHand.indexOf(PRINTING);
  return handIndex<0?null:{
    kind:'play-battle-vip-after-pass',printing:PRINTING,handIndex};
}

/**
 * Rank eligible physical Basics using only the contents of the owner's
 * AUTHORIZED deck-search prompt and its own public board. A modest
 * evolution-followup preference serves as a reproducible baseline and has
 * not been established to be optimal for any source archetype.
 *
 * @param {object} pending Live owner-authorized ChooseCardsPrompt.
 * @param {object} view Detached owner-prompt observation.
 * @param {{BASIC:number,POKEMON:number}} enums Pinned Stage/SuperType.
 * @returns {object[]} Native-valid physical cards, at most two.
 */
function chooseVipPromptCards(pending,view,enums){
  assert.equal(view?.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  const all=pending.cards.cards;
  const present=new Set([view.ownPublic.active,...view.ownPublic.bench]
    .filter(Boolean).map(slot=>slot.name));
  const followup=new Set(all.filter(card=>
    card?.evolvesFrom&&card.stage!==enums.BASIC)
    .map(card=>card.evolvesFrom));
  const viable=all.filter(card=>card.superType===enums.POKEMON&&
      card.stage===enums.BASIC&&pending.validate([card])===true)
    .sort((a,b)=>
      Number(followup.has(b.name))-Number(followup.has(a.name))||
      Number(present.has(a.name))-Number(present.has(b.name))||
      a.fullName.localeCompare(b.fullName));
  const chosen=[];
  for(const card of viable){
    if(chosen.length===2)break;
    if(chosen.some(other=>other.name===card.name)&&
       viable.some(other=>other.name!==card.name&&
         !chosen.includes(other)&&
         pending.validate([...chosen,other])===true))continue;
    if(pending.validate([...chosen,card])===true)chosen.push(card);
  }
  assert.ok(pending.validate(chosen),
    'VIP prompt selector must obey original pinned native validator');
  return chosen;
}

/**
 * Reversible real-Store owner-only Battle VIP Pass root + search-to-Bench
 * policy for both physical seats. Root is offered only after the earlier
 * actor planner proposed Pass. Search inventory is never inspected until
 * the original owner-deck prompt authorizes its owner to inspect it.
 *
 * @template T
 * @param {()=>T} execute Existing synchronous common-policy workload.
 * @param {object} [deps] Injectable native objects for pure unit fixtures.
 * @returns {{result:T,audit:object}}
 */
function withActorBattleVipAfterPass(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const {Stage,SuperType}=deps.types??
    require(path.join(base,'game/store/card/card-types'));
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const observe=deps.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');

  const proposed=new WeakMap(),awaiting=new Map();
  let liveStore=null;
  const audit={
    version:VERSION,bothPhysicalSeats:true,originalPassRoots:0,
    originalPassBySeat:{0:0,1:0},passOpportunities:[],
    eligiblePassRoots:0,proposedItems:0,acceptedItems:0,rejectedItems:0,
    proposedSearches:0,acceptedSearches:0,rejectedSearches:0,
    nativeBenchConfirmed:0,nativeBenchUnconfirmed:0,
    unresolvedOwnerSearches:0,
    selectedBasics:0,selectedEmpty:0,
    bySeat:{0:{items:0,searches:0,benchConfirmed:0},
      1:{items:0,searches:0,benchConfirmed:0}},
    examples:[],nativeStoreSeen:false,
    qualification:{
      fullyOwnerInformationSafeForAddedActions:true,
      wholeGameActorOnly:false,strategicSelectionOptimal:false,
      paperClockQualified:false,competitiveGameQualified:false
    }
  };
  const limited=event=>{
    if(audit.examples.length<40)audit.examples.push(event);
  };
  function decode(state){
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN)
      return beforeDecode.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if(seat!==0&&seat!==1)return beforeDecode.value.call(this,state);
    const owner=state.players[seat];
    const pending=state.prompts?.find(p=>p.result===undefined);
    const waiting=awaiting.get(owner.id);
    if(pending&&pending.playerId===owner.id&&
       waiting?.turn===state.turn&&
       pending.constructor?.name==='ChooseCardsPrompt'&&
       pending.message===PROMPT_MESSAGE&&pending.cards===owner.deck){
      const view=observe(state,seat);
      const selected=chooseVipPromptCards(pending,view,{
        BASIC:Stage.BASIC,POKEMON:SuperType.POKEMON});
      const action=new ResolvePromptAction(pending.id,selected);
      proposed.set(action,{
        kind:'vip-search',seat,turn:state.turn,
        promptId:pending.id,
        printings:selected.map(card=>card.fullName),
        chosenPhysicalCards:[...selected]
      });
      audit.proposedSearches++;
      return action;
    }
    if(pending||state.activePlayer!==seat)
      return beforeDecode.value.call(this,state);
    const original=beforeDecode.value.call(this,state);
    if(original?.constructor?.name!=='PassTurnAction')return original;
    audit.originalPassRoots++;
    audit.originalPassBySeat[seat]++;
    const view=observe(state,seat);
    const intent=chooseVipAfterPass(view);
    if(audit.passOpportunities.length<60)audit.passOpportunities.push({
      seat,turn:state.turn,heldVip:view.ownHand.includes(PRINTING),
      deckCount:view.ownPublic.deckCount,
      openBench:view.ownPublic.bench.filter(slot=>slot===null).length,
      itemLocked:view.ownTurnResources.itemPlayLocked===true||
        view.ownPublic.publicTurnRestrictions?.itemPlayLocked===true,
      selected:Boolean(intent)
    });
    if(!intent)return original;
    const card=owner.hand.cards[intent.handIndex];
    assert.equal(card.fullName,intent.printing);
    const action=new PlayCardAction(owner.id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    proposed.set(action,{
      kind:'vip-item',seat,turn:state.turn,printing:intent.printing,
      handIndex:intent.handIndex
    });
    audit.eligiblePassRoots++;
    audit.proposedItems++;
    return action;
  }
  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      awaiting.clear();
      audit.nativeStoreSeen=true;
    }
    const event=this===liveStore?proposed.get(action):null;
    if(!event)return beforeDispatch.value.apply(this,[action,...rest]);
    const owner=this.state.players[event.seat];
    const benchBefore=owner.bench.filter(slot=>slot.cards.length>0).length;
    const deckBefore=owner.deck.cards.length;
    try{
      const result=beforeDispatch.value.apply(this,[action,...rest]);
      if(event.kind==='vip-item'){
        audit.acceptedItems++;
        audit.bySeat[event.seat].items++;
        awaiting.set(owner.id,{seat:event.seat,turn:event.turn});
        limited({kind:event.kind,seat:event.seat,turn:event.turn,
          printing:event.printing,accepted:true});
      }else{
        audit.acceptedSearches++;
        audit.bySeat[event.seat].searches++;
        audit.selectedBasics+=event.printings.length;
        if(event.printings.length===0)audit.selectedEmpty++;
        awaiting.delete(owner.id);
        const after=this.state.players[event.seat];
        const benchAfter=after.bench.filter(slot=>slot.cards.length>0).length;
        const deckAfter=after.deck.cards.length;
        const newlyBenched=after.bench.filter(slot=>
          event.chosenPhysicalCards.some(card=>slot.cards.includes(card)));
        const physicallyConfirmed=benchAfter-benchBefore===
          event.printings.length&&
          deckBefore-deckAfter===event.printings.length&&
          newlyBenched.length===event.printings.length;
        if(physicallyConfirmed){
          audit.nativeBenchConfirmed++;
          audit.bySeat[event.seat].benchConfirmed++;
        }else audit.nativeBenchUnconfirmed++;
        limited({kind:event.kind,seat:event.seat,turn:event.turn,
          printings:event.printings,accepted:true,
          nativeBenchConfirmed:physicallyConfirmed,
          benchBefore,benchAfter,deckBefore,deckAfter});
      }
      return result;
    }catch(error){
      if(event.kind==='vip-item')audit.rejectedItems++;
      else audit.rejectedSearches++;
      limited({kind:event.kind,seat:event.seat,turn:event.turn,
        accepted:false,error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{...beforeDispatch,value:dispatch});
  try{
    const result=execute();
    audit.unresolvedOwnerSearches=awaiting.size;
    return {result,audit};
  }catch(error){
    audit.unresolvedOwnerSearches=awaiting.size;
    error.agent9VipAudit=audit;
    throw error;
  }
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
  }
}

module.exports={VERSION,PRINTING,PROMPT_MESSAGE,chooseVipAfterPass,
  chooseVipPromptCards,withActorBattleVipAfterPass};
