'use strict';

const assert=require('node:assert/strict');
const VERSION='agent20-native-supporter-proposal-purity-bilateral-real-dispatch-v2';

/**
 * Remove exactly one malformed native bot *proposal* side effect.
 *
 * The pinned PlaySupporterTactic first scores a proposed Supporter, then
 * writes player.supporterTurn=state.turn before SimpleTacticsAi validates
 * it in a Simulator. A proposed card is not an accepted Store play.
 * The paper quota and Store effects therefore must not change yet.
 *
 * This opt-in research hook restores the owner quota to its preproposal
 * zero only when an actual real Store actor experiences that exact change.
 * The native Store still validates and resolves the returned proposal;
 * actual Store SupporterEffects remain untouched. No vendor file is edited.
 *
 * @template T
 * @param {()=>T} play
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withPureNativeSupporterProposal(play,deps){
  assert.equal(typeof play,'function');
  const {Store,PlaySupporterTactic,PlayCardAction,TrainerCard,
    TrainerType,GamePhase}=deps;
  const proto=PlaySupporterTactic.prototype;
  const storeProto=Store.prototype;
  const old=Object.getOwnPropertyDescriptor(proto,'useTactic');
  const oldDispatch=Object.getOwnPropertyDescriptor(storeProto,'dispatch');
  assert.equal(typeof old?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  const receipts=new WeakMap();
  let live=null;
  const audit={
    version:VERSION,
    attemptedNativeActorProposals:0,
    exactOwnTurnSideEffectsReversed:0,
    dispatchedPreviouslyRestoredActions:0,
    acceptedPreviouslyRestoredActions:0,
    rejectedPreviouslyRestoredActions:0,
    speculativeDispatchesOfRestoredActions:0,
    speculativeAcceptedRestoredActions:0,
    speculativeRejectedRestoredActions:0,
    previouslyRestoredProposals:[],
    attemptedDispatches:[],
    competitiveQualifiedGames:0,
    scope:'Reversible real-owner native Supporter proposal purity only; Store action and prompt legality remain engine-dependent'
  };
  function pureTactic(state,player,...args){
    const genuine=live&&live.state===state&&
      state?.phase===GamePhase.PLAYER_TURN&&
      state.players?.[state.activePlayer]===player&&
      !state.prompts?.some(p=>p.result===undefined);
    if(!genuine)return old.value.call(this,state,player,...args);
    audit.attemptedNativeActorProposals++;
    const before=player.supporterTurn;
    const action=old.value.call(this,state,player,...args);
    const after=player.supporterTurn;
    const candidate=action instanceof PlayCardAction &&
      Number.isSafeInteger(action.handIndex)&&
      action.handIndex>=0&&action.handIndex<player.hand.cards.length?
      player.hand.cards[action.handIndex]:null;
    const printedSupporter=candidate instanceof TrainerCard&&
      candidate.trainerType===TrainerType.SUPPORTER;
    if(before===0&&after===state.turn&&printedSupporter){
      player.supporterTurn=before;
      audit.exactOwnTurnSideEffectsReversed++;
      const receipt={
        seat:state.activePlayer,turn:state.turn,
        originalBefore:before,afterNativeProposal:after,
        restoredValue:player.supporterTurn,
        nativeSelectedProposalCard:candidate.fullName,
        handIndex:action.handIndex,dispatch:'not-dispatched'
      };
      if(audit.previouslyRestoredProposals.length<100)
        audit.previouslyRestoredProposals.push(receipt);
      receipts.set(action,receipt);
    }
    return action;
  }
  function trackedDispatch(action,...args){
    const receipt=receipts.get(action);
    // The native bot probes a proposal in a cloned Simulator Store before
    // submitting the same Action to the real game Store. Only the real
    // Store may count as an accepted physical action. This distinction is
    // essential: a previous v1 audit counted every successful probe twice.
    const real=live===this;
    if(receipt){
      if(real)audit.dispatchedPreviouslyRestoredActions++;
      else audit.speculativeDispatchesOfRestoredActions++;
    }
    let output;
    try{
      output=oldDispatch.value.call(this,action,...args);
    }catch(error){
      if(receipt&&real){
        receipt.dispatch='native-rejected';
        receipt.error=String(error?.message??error);
        audit.rejectedPreviouslyRestoredActions++;
      }else if(receipt){
        audit.speculativeRejectedRestoredActions++;
      }
      throw error;
    }
    if(!live&&action?.constructor?.name==='AddPlayerAction'&&
      this.state.players?.length===1&&
      this.state.players[0].id===101)live=this;
    if(receipt&&real){
      receipt.dispatch='real-native-Store-accepted';
      receipt.supporterTurnAfterNativeStore=
        this.state.players[receipt.seat]?.supporterTurn??null;
      receipt.newOwnerResolvingSupporter=
        this.state.players[receipt.seat]?.supporter.cards.map(c=>c.fullName)??[];
      audit.acceptedPreviouslyRestoredActions++;
    }else if(receipt){
      audit.speculativeAcceptedRestoredActions++;
    }
    return output;
  }
  Object.defineProperty(proto,'useTactic',{...old,value:pureTactic});
  Object.defineProperty(storeProto,'dispatch',{
    ...oldDispatch,value:trackedDispatch
  });
  try{
    return {result:play(),audit};
  }catch(error){
    error.agent20SupporterPurityAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(storeProto,'dispatch',oldDispatch);
    Object.defineProperty(proto,'useTactic',old);
  }
}

module.exports={VERSION,withPureNativeSupporterProposal};
