'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {PRINTING,PROMPT_MESSAGE,chooseVipAfterPass,chooseVipPromptCards}=
  require('./agent9-battle-vip-owner-after-pass.cjs');
const VERSION='agent10-actor-held-vip-before-first-attack-v1';

/**
 * Only the printed first-owner-turn Item as an additional legal action,
 * never another candidate's concealed cards. The native engine rules on
 * the Item and the subsequent owner-only deck-search prompt.
 * @param {object} ownView Authenticated actor-only current-root observation.
 * @param {string|null} proposedRoot Pinned bot's own root action class name.
 * @param {boolean} spentOnThisOwnTurn One successfully accepted Item already.
 * @returns {object|null} Owned held-VIP intent or no intervention.
 */
function chooseVipBeforeAttack(ownView,proposedRoot,spentOnThisOwnTurn){
  if(proposedRoot!=='AttackAction'||spentOnThisOwnTurn)return null;
  return chooseVipAfterPass(ownView);
}

/**
 * Install after the common actor-root handler so its genuine proposed
 * AttackAction can be inspected. One native Item may be inserted before
 * the attack on either physical seat. Search is delegated to Agent9's
 * tested native owner-deck selector. This deliberately is not a game bot.
 * @template T
 * @param {()=>T} execute Nested Store execution under existing common policy.
 * @param {object} [deps] Mock native dependency injection only for unit tests.
 * @returns {{result:T,audit:object}}
 */
function withActorVipBeforeAttack(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(base,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??engine('game/store/store').Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    engine('game/store/actions/play-card-action');
  const ResolvePromptAction=deps.ResolvePromptAction??
    engine('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const {Stage,SuperType}=deps.types??
    engine('game/store/card/card-types');
  const GamePhase=deps.GamePhase??engine('game/store/state/state').GamePhase;
  const observe=deps.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  const pendingActions=new WeakMap();
  const pendingSearches=new Map();
  const usedTurn=new Set();
  let liveStore=null;
  const audit={version:VERSION,allPhysicalSeats:true,
    candidateSpecificLogic:false,requiresOriginalAttack:true,
    originalAttacksSeen:0,ownerVipCoheldAttackOpportunities:0,
    acceptedItems:0,rejectedItems:0,acceptedSearches:0,
    rejectedSearches:0,physicallyConfirmedBenchSearches:0,
    zeroCardSearches:0,unconfirmedBenchSearches:0,
    unresolvedSearches:0,sourceOrCandidateRolesNotDistinguished:true,
    bySeat:{0:{items:0,searches:0},1:{items:0,searches:0}},
    events:[],liveStoreObserved:false,
    competitionQualified:false,paperPromptQualified:false,
    remainingPolicyUnknown:true};
  const log=x=>{if(audit.events.length<80)audit.events.push(x);};
  /** @param {object} state */
  function decode(state){
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN)
      return beforeDecode.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if(seat!==0&&seat!==1)return beforeDecode.value.call(this,state);
    const own=state.players[seat];
    const prompt=state.prompts?.find(p=>p.result===undefined);
    const pending=pendingSearches.get(own.id);
    if(prompt&&prompt.playerId===own.id&&
        pending?.turn===state.turn&&
        prompt.constructor?.name==='ChooseCardsPrompt'&&
        prompt.message===PROMPT_MESSAGE&&prompt.cards===own.deck){
      const selected=chooseVipPromptCards(prompt,observe(state,seat),{
        BASIC:Stage.BASIC,POKEMON:SuperType.POKEMON
      });
      const action=new ResolvePromptAction(prompt.id,selected);
      pendingActions.set(action,{kind:'vip-search',seat,turn:state.turn,
        selectedPhysical:[...selected],
        selectedPrintings:selected.map(card=>card.fullName),
        promptId:prompt.id});
      return action;
    }
    if(prompt||state.activePlayer!==seat)
      return beforeDecode.value.call(this,state);
    const original=beforeDecode.value.call(this,state);
    if(original?.constructor?.name!=='AttackAction')return original;
    audit.originalAttacksSeen++;
    const view=observe(state,seat);
    const turnKey=seat+':'+state.turn;
    const intent=chooseVipBeforeAttack(view,
      original.constructor.name,usedTurn.has(turnKey));
    if(!intent)return original;
    const item=own.hand.cards[intent.handIndex];
    assert.equal(item?.fullName,PRINTING);
    const action=new PlayCardAction(own.id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    pendingActions.set(action,{kind:'vip-item',seat,
      turn:state.turn,printing:PRINTING,originalAttack:original.name??null,
      handIndex:intent.handIndex});
    audit.ownerVipCoheldAttackOpportunities++;
    return action;
  }
  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      pendingSearches.clear();
      usedTurn.clear();
      audit.liveStoreObserved=true;
    }
    const event=this===liveStore?pendingActions.get(action):null;
    if(!event)return beforeDispatch.value.apply(this,[action,...rest]);
    const before=this.state.players[event.seat];
    const benchBefore=before.bench.filter(x=>x.cards.length>0).length;
    const deckBefore=before.deck.cards.length;
    try{
      const result=beforeDispatch.value.apply(this,[action,...rest]);
      if(event.kind==='vip-item'){
        audit.acceptedItems++;
        audit.bySeat[event.seat].items++;
        usedTurn.add(event.seat+':'+event.turn);
        pendingSearches.set(before.id,{turn:event.turn,seat:event.seat});
        log({kind:event.kind,seat:event.seat,turn:event.turn,
          originalAttack:event.originalAttack,accepted:true});
      }else{
        audit.acceptedSearches++;
        audit.bySeat[event.seat].searches++;
        pendingSearches.delete(before.id);
        const after=this.state.players[event.seat];
        const benchAfter=after.bench.filter(x=>x.cards.length>0).length;
        const deckAfter=after.deck.cards.length;
        const physicallyFound=after.bench.filter(slot=>
          event.selectedPhysical.some(card=>slot.cards.includes(card))).length;
        const confirmed=benchAfter-benchBefore===event.selectedPhysical.length&&
          deckBefore-deckAfter===event.selectedPhysical.length&&
          physicallyFound===event.selectedPhysical.length;
        if(confirmed&&event.selectedPhysical.length)
          audit.physicallyConfirmedBenchSearches++;
        else if(confirmed)audit.zeroCardSearches++;
        else audit.unconfirmedBenchSearches++;
        log({kind:event.kind,seat:event.seat,turn:event.turn,
          selectedPrintings:event.selectedPrintings,
          nativeAccepted:true,physicallyConfirmed:confirmed,
          benchBefore,benchAfter,deckBefore,deckAfter});
      }
      return result;
    }catch(error){
      if(event.kind==='vip-item')audit.rejectedItems++;
      else audit.rejectedSearches++;
      log({kind:event.kind,seat:event.seat,turn:event.turn,
        accepted:false,error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...beforeDispatch,value:dispatch});
  try{
    const result=execute();
    audit.unresolvedSearches=pendingSearches.size;
    return {result,audit};
  }catch(error){
    audit.unresolvedSearches=pendingSearches.size;
    error.agent10EarlyVipAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
  }
}
module.exports={VERSION,chooseVipBeforeAttack,withActorVipBeforeAttack};
