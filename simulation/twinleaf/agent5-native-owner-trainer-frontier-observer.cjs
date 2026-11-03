'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {ownerTrainerOpportunity,trainerPrintCatalog,VERSION:FRONTIER_VERSION}=
  require('./agent5-generic-owner-trainer-opportunity.cjs');

const {certifyFirstTurnBattleVip}=require('./agent5-owner-firstturn-basic-search-k0.cjs');
const VERSION='agent5-owner-turn-trainer-native-readonly-v2-k0-vip';

/**
 * Observe a shared, genuinely live owner root before the existing bot decides.
 * Record the full hand-held Trainer opportunity competition; compare it to
 * upstream's "legal-ish" enumerated roots and the one action actually chosen,
 * then bind the chosen action to its real Store dispatch outcome.
 *
 * No decision is changed. No private opposing hand, deck order, Prize
 * identity or search cards are requested. The passed native enumerator's
 * upstream implementation uses owner hand, board and public Stadium only.
 * CanPlay is deliberately not called; native enums are not paper legality.
 *
 * @template T
 * @param {()=>T} work Synchronous one-game execution.
 * @param {{Store:Function,SimpleTacticsAi:Function,GamePhase:object,
 *    ActionEnumerator:Function,TrainerCard:Function,TrainerType:object,
 *    allCards:object[],PlayCardAction:Function,
 *    seats?:(0|1)[],maxRoots?:number}} deps Actual pinned classes.
 * @returns {{result:T,audit:object}}
 */
function withNativeOwnerTrainerFrontier(work,deps){
  assert.equal(typeof work,'function');
  const {Store,SimpleTacticsAi,GamePhase,ActionEnumerator,
    TrainerCard,TrainerType,allCards,PlayCardAction}=deps;
  const seats=deps.seats??[0,1],maxRoots=deps.maxRoots??72;
  assert.ok(seats.length>0&&seats.every(s=>s===0||s===1));
  assert.ok(Number.isInteger(maxRoots)&&maxRoots>0);
  const catalog=trainerPrintCatalog(allCards,{TrainerCard,TrainerType});
  const protoStore=Store.prototype,protoAi=SimpleTacticsAi.prototype;
  const priorStore=Object.getOwnPropertyDescriptor(protoStore,'dispatch');
  const priorAi=Object.getOwnPropertyDescriptor(protoAi,'decodeNextAction');
  assert.equal(typeof priorStore?.value,'function');
  assert.equal(typeof priorAi?.value,'function');
  const nativeEnumerator=new ActionEnumerator();
  assert.equal(typeof nativeEnumerator.enumerate,'function');
  const roots=[],dispatchByAction=new WeakMap();
  let live=null,matched=0,exceptions=0,truncated=0;
  const observedBySeat=[0,0];

  function trackedDispatch(action,...args){
    const event=this===live?dispatchByAction.get(action):null;
    try{
      const result=priorStore.value.call(this,action,...args);
      if(!live&&action?.constructor?.name==='AddPlayerAction'&&
        this.state.players?.length===1&&this.state.players[0].id===101)
        live=this;
      if(event){
        event.dispatch='native-accepted';
        matched++;
      }
      return result;
    }catch(error){
      if(event){
        event.dispatch='native-rejected';
        event.error=String(error?.message||error).slice(0,240);
        exceptions++;
      }
      throw error;
    }
  }
  function trackedDecode(state,...args){
    const seat=state?.activePlayer,owner=state?.players?.[seat];
    const eligible=live&&state===live.state&&
      seats.includes(seat)&&owner?.id===this.client?.id&&
      state.phase===GamePhase.PLAYER_TURN&&
      !state.prompts.some(p=>p.result===undefined);
    if(!eligible)return priorAi.value.call(this,state,...args);
    if(roots.length>=maxRoots){
      truncated++;
      return priorAi.value.call(this,state,...args);
    }

    const view=actorObservation(state,seat);
    const offered=new Set();
    const native=nativeEnumerator.enumerate(state,owner,owner.id);
    for(const choice of native){
      if(choice instanceof PlayCardAction &&
        Number.isInteger(choice.handIndex)&&
        catalog.has(view.ownHand[choice.handIndex]))
        offered.add(choice.handIndex);
    }
    const frontier=ownerTrainerOpportunity(view,catalog,offered);
    const root={
      ordinal:roots.length,seat,turn:view.globalTurn,
      observedOwnerHandTrainerCopies:frontier.handTrainerCopies,
      unresolvedGenericOpportunities:frontier.unblockedGenericTrainerCopies,
      competingChannels:frontier.channels,
      trainers:frontier.rows,
      nativeOfferedHandIndices:[...offered].sort((a,b)=>a-b),
      chosen:null,dispatch:'not-attempted',
      policyIsReadOnly:true,competitiveGameQualified:false
    };
    roots.push(root);
    observedBySeat[seat]++;
    const action=priorAi.value.call(this,state,...args);
    if(action){
      const handIndex=action instanceof PlayCardAction?action.handIndex:null;
      const trainer=frontier.rows.find(row=>row.handIndex===handIndex)??null;
      root.chosen={
        action:action.constructor?.name??null,
        handIndex,trainer:trainer?{
          printing:trainer.printing,type:trainer.type,
          paperEligibility:trainer.paperEligibility,
          nativeEnumeratorOffered:trainer.nativeEnumeratorOffered
        }:null
      };
      dispatchByAction.set(action,root);
    }
    return action;
  }
  Object.defineProperty(protoStore,'dispatch',{
    ...priorStore,value:trackedDispatch
  });
  Object.defineProperty(protoAi,'decodeNextAction',{
    ...priorAi,value:trackedDecode
  });
  try{
    const result=work();
    return {result,audit:{
      version:VERSION,frontierVersion:FRONTIER_VERSION,
      nativePrintedTrainerClasses:catalog.size,
      observedAuthenticStore:live!==null,
      attemptedRootObservations:roots.length,
      rootsOmittedDueToCap:truncated,
      chosenActionsNativeAccepted:matched,
      chosenActionsNativeRejected:exceptions,
      observedBySeat,
      nativeActionEnumeratorIsPaperLegal:false,
      cardSpecificPaymentOrEffectsProven:false,
      competitiveGameQualified:false,
      roots
    }};
  }finally{
    Object.defineProperty(protoAi,'decodeNextAction',priorAi);
    Object.defineProperty(protoStore,'dispatch',priorStore);
  }
}

module.exports={VERSION,withNativeOwnerTrainerFrontier};
