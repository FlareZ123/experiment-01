'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent29-rank9-owner-ultra-ball-two-dead-vip-v9';
const ULTRA='Ultra Ball MEG';
const DEAD_VIP='Battle VIP Pass FST';
const EVOLUTION='Electrode-GX CES';
const MEGA='Mega Absol ex M1L';
const VOLTORB='Voltorb ROS';

/**
 * Narrow original rank9 first-owner-stage repair. An eligible original source
 * may only pay the two printed Ultra Ball discards with actual expired VIP
 * copies; all other cards, particularly live search connectors, are preserved.
 * The destination card is chosen ONLY inside a real owner-authorized deck
 * prompt. This is a developmental actor policy, never a game state patch.
 *
 * @template T
 * @param {()=>T} run Genuine native same-deal trial.
 * @param {0|1} sourceSeat Original source physical seat.
 * @param {object} [deps] Injectable native testing objects.
 * @returns {{result:T,audit:object}}
 */
function withOriginalRank9DeadVipUltraBall(run,sourceSeat,deps={}){
  assert.equal(typeof run,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const GamePhase=deps.GamePhase??load('game/store/state/state').GamePhase;
  const {PlayCardAction,PlayerType,SlotType}=deps.playActions??
    load('game/store/actions/play-card-action');
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');

  let liveStore=null;
  const actions=new WeakMap(),awaiting=new Map(),usedTurn=new Set();
  const audit={version:VERSION,sourceSeat,sourceOnly:true,
    originalPasses:0,eligibleDeadVipUltras:0,
    nativeAcceptedItems:0,nativeRejectedItems:0,
    ownerDiscardPayments:0,physicalDeadVipDiscarded:0,
    ownerDeckSearches:0,chosenElectrodePhysical:0,
    electrodeInHandConfirmed:0,unresolvedOwnerPrompts:0,
    qualifiedPaperCompetitiveGames:0,events:[]};

  function decode(state){
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN||
      state.activePlayer!==sourceSeat)
      return beforeDecode.value.call(this,state);
    const owner=state.players[sourceSeat];
    if(!owner||this.client?.id!==owner.id)
      return beforeDecode.value.call(this,state);
    const pending=state.prompts?.find(p=>p.result===undefined);
    const payment=awaiting.get(owner.id);
    if(pending&&payment?.turn===state.turn&&
      pending.playerId===owner.id&&
      pending.constructor?.name==='ChooseCardsPrompt'){
      if(payment.phase==='discard'&&
        pending.message==='CHOOSE_CARD_TO_DISCARD'){
        const dead=pending.cards.cards.filter(c=>c.fullName===DEAD_VIP);
        assert.ok(dead.length>=2,'Accepted original Ultra needs 2 expired VIP');
        const selected=dead.slice(0,2);
        assert.equal(pending.validate(selected),true,
          'Owner must actually pay the printed two-card Ultra Ball discard');
        const action=new ResolvePromptAction(pending.id,selected);
        actions.set(action,{kind:'discard',payment,selected});
        return action;
      }
      if(payment.phase==='search'&&
        pending.message==='CHOOSE_CARD_TO_HAND'&&
        pending.cards===owner.deck){
        const target=pending.cards.cards.find(c=>c.fullName===EVOLUTION&&
          pending.validate([c])===true);
        const selected=target?[target]:[];
        assert.equal(pending.validate(selected),true);
        const action=new ResolvePromptAction(pending.id,selected);
        actions.set(action,{kind:'search',payment,selected});
        return action;
      }
    }
    if(pending)return beforeDecode.value.call(this,state);
    const original=beforeDecode.value.call(this,state);
    if(original?.constructor?.name!=='PassTurnAction')return original;
    audit.originalPasses++;
    if(state.turn<=2||usedTurn.has(state.turn))return original;
    const hand=owner.hand.cards;
    const handIndex=hand.findIndex(c=>c.fullName===ULTRA);
    if(handIndex<0||hand.filter(c=>c.fullName===DEAD_VIP).length<2||
      owner.deck.cards.length===0||
      owner.bench.every(x=>x.getPokemonCard()?.fullName!==VOLTORB)||
      owner.bench.every(x=>x.getPokemonCard()?.fullName!==MEGA)||
      hand.some(c=>c.fullName===EVOLUTION)||
      [owner.active,...owner.bench].some(x=>
        x.getPokemonCard()?.fullName===EVOLUTION))return original;
    const action=new PlayCardAction(owner.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    const event={sourceSeat,turn:state.turn,sourceUltraPrinting:ULTRA,
      sourcePaidDeadVipCount:0,ownerSearchedEvolution:false,
      physicalEvolutionInHand:false};
    actions.set(action,{kind:'ultra',event});
    audit.eligibleDeadVipUltras++;audit.events.push(event);
    return action;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    const real=this===liveStore;
    const chosen=real?actions.get(action):null;
    const owner=this.state.players?.[sourceSeat];
    const oldDead=chosen&&owner?owner.discard.cards.filter(c=>
      c.fullName===DEAD_VIP).length:0;
    try{
      const result=beforeDispatch.value.call(this,action,...args);
      if(chosen&&owner){
        if(chosen.kind==='ultra'){
          audit.nativeAcceptedItems++;
          usedTurn.add(this.state.turn);
          awaiting.set(owner.id,{phase:'discard',turn:this.state.turn,
            event:chosen.event});
        }else if(chosen.kind==='discard'){
          const moved=owner.discard.cards.filter(c=>
            c.fullName===DEAD_VIP).length-oldDead;
          assert.equal(moved,2,'Owner must discard 2 original dead VIPs');
          chosen.payment.event.sourcePaidDeadVipCount=moved;
          audit.ownerDiscardPayments++;
          audit.physicalDeadVipDiscarded+=moved;
          chosen.payment.phase='search';
        }else if(chosen.kind==='search'){
          audit.ownerDeckSearches++;
          const selected=chosen.selected;
          const paid=selected.length===1&&
            owner.hand.cards.includes(selected[0]);
          audit.chosenElectrodePhysical+=Number(selected.length===1);
          audit.electrodeInHandConfirmed+=Number(paid);
          chosen.payment.event.ownerSearchedEvolution=selected.length===1;
          chosen.payment.event.physicalEvolutionInHand=paid;
          awaiting.delete(owner.id);
        }
      }
      return result;
    }catch(error){
      if(chosen?.kind==='ultra')audit.nativeRejectedItems++;
      if(error&&typeof error==='object')
        error.agent29DeadVipUltraAudit=audit;
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...beforeDispatch,value:dispatch});
  try{
    const result=run();
    audit.unresolvedOwnerPrompts=awaiting.size;
    return {result,audit};
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
  }
}

module.exports={VERSION,withOriginalRank9DeadVipUltraBall};
