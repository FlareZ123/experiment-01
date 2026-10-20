'use strict';

const assert=require('node:assert/strict');

/**
 * Replace exactly one owner-observable native Basic Psychic attachment choice
 * while leaving deck, hand, Prize, opponent policy and source Store unchanged.
 * This is a retrospective selected-seed tactical probe, not a general bot.
 *
 * @template T
 * @param {{Store:Function,SimpleTacticsAi:Function,PlayCardAction:Function,
 * SlotType:object,SuperType:object,EnergyType:object}} deps Pinned constructors.
 * @param {{candidateSeat:0|1,selectedTurns:number[]}} plan Frozen time points.
 * @param {()=>T} execute Exact source-dealt game.
 * @returns {{result:T,audit:object}} Interventions at genuine bot roots only.
 */
function withRank6BenchPsychicRedirect(deps,plan,execute){
  const {Store,SimpleTacticsAi,PlayCardAction,
    SlotType,SuperType,EnergyType}=deps;
  assert.ok(plan.candidateSeat===0||plan.candidateSeat===1);
  assert.equal(typeof execute,'function');
  const selected=new Set(plan.selectedTurns);
  assert.ok([...selected].every(n=>Number.isSafeInteger(n)&&n>0));
  const storeDescriptor=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  assert.equal(typeof storeDescriptor?.value,'function');
  assert.equal(typeof originalDecode,'function');
  let realStore=null,checks=0;
  const proposed=[];
  const missed=[];

  /** @param {object} action @returns {unknown} */
  function observeDispatch(action){
    if(!realStore && action?.constructor?.name==='AddPlayerAction'){
      realStore=this;
    }
    return storeDescriptor.value.call(this,action);
  }

  /** @param {object} state @returns {object} */
  function redirectOwnerDecision(state){
    const nativeAction=originalDecode.call(this,state);
    if(!realStore||state!==realStore.state ||
        state.activePlayer!==plan.candidateSeat ||
        !selected.has(state.turn))return nativeAction;
    const owner=state.players[plan.candidateSeat];
    if(owner?.id!==this.client?.id)return nativeAction;
    checks++;
    if(nativeAction?.constructor?.name!=='PlayCardAction' ||
        nativeAction.id!==owner.id ||
        nativeAction.target?.slot!==SlotType.ACTIVE)return nativeAction;
    const card=owner.hand.cards[nativeAction.handIndex];
    if(!card||card.superType!==SuperType.ENERGY ||
        card.energyType!==EnergyType.BASIC ||
        card.name!=='Psychic Energy')return nativeAction;
    const index=owner.bench.findIndex(slot=>
      slot.getPokemonCard()?.name==='Gengar & Mimikyu-GX');
    if(index<0){
      missed.push({turn:state.turn,reason:'no-visible-Gengar-bench'});
      return nativeAction;
    }
    if(proposed.some(x=>x.turn===state.turn))return nativeAction;
    const target={...nativeAction.target,slot:SlotType.BENCH,index};
    const replacement=new PlayCardAction(owner.id,
      nativeAction.handIndex,target);
    proposed.push({
      turn:state.turn,
      originalAction:nativeAction.constructor.name,
      printedEnergy:card.fullName,
      sourceActive:owner.active.getPokemonCard()?.fullName??null,
      recipient:owner.bench[index].getPokemonCard().fullName,
      originalTarget:nativeAction.target,
      substitutedTarget:target,
      sourceHandOnly:true,
      opponentHiddenInformationRead:false,
      engineAcceptedRoot:'unverified-until-game-result'
    });
    return replacement;
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...storeDescriptor,value:observeDispatch});
  SimpleTacticsAi.prototype.decodeNextAction=redirectOwnerDecision;
  try{
    return {
      result:execute(),
      audit:{
        schema:'agent30-selected-rank6-owner-bench-energy-redirect-v1',
        candidateSeat:plan.candidateSeat,
        selectedTurns:[...selected].sort((a,b)=>a-b),
        realOwnerDecisionChecks:checks,
        actualBotActionReplacements:proposed,
        unmatchedVisibleTargets:missed,
        ownHandAndPublicBoardOnly:true,
        readsOpponentPrivateState:false,
        changesStoreReducers:false,
        mechanicallyQualifiedOnly:false,
        qualifiesForCompetitiveInference:false
      }
    };
  }finally{
    assert.equal(Store.prototype.dispatch,observeDispatch,
      'Another Store hook did not restore itself');
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,
      redirectOwnerDecision,'Another bot hook did not restore itself');
    SimpleTacticsAi.prototype.decodeNextAction=originalDecode;
    Object.defineProperty(Store.prototype,'dispatch',storeDescriptor);
  }
}

module.exports={withRank6BenchPsychicRedirect};
