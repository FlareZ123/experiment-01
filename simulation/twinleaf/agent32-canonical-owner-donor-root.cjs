'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {shouldSeekPayload}=
  require('./new-moon-compressor-payload-policy.cjs');

const VERSION='agent32-canonical-owner-donor-root-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const pinned=name=>require(path.join(OUTPUT,name));

/**
 * Give an explicitly opted-in, owner-visible Battle Compressor setup line
 * priority at the genuine canonical decision boundary. It is deliberately
 * installed INSIDE the actor-only root adapter so this wrapper's decoder
 * runs first, then delegates unchanged to all existing canonical selectors.
 * Deck identities are only read by the native pending owner-deck resolver.
 *
 * @template T
 * @param {()=>T} execute Existing real pinned Store game runner.
 * @param {{seat:0|1,setup?:{allowBenchedMewtwo?:boolean,
 *   allowTrevenantOnly?:boolean,maxGlobalTurn?:number}}} options
 * @param {{SimpleTacticsAi?:Function,Store?:Function,GamePhase?:object,
 *   PlayCardAction?:Function,PlayerType?:object,SlotType?:object,
 *   liveStore?:object}} [deps] Test-only pinned class overrides.
 * @returns {{result:T,audit:object}}
 */
function withCanonicalOwnerDonorRoot(execute,options,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(options&&[0,1].includes(options.seat));
  const seat=options.seat;
  const {SimpleTacticsAi}=deps.SimpleTacticsAi?
    {SimpleTacticsAi:deps.SimpleTacticsAi}:
    pinned('simple-bot/simple-tactics-ai');
  const {Store}=deps.Store?{Store:deps.Store}:pinned('game/store/store');
  const {GamePhase}=deps.GamePhase?
    {GamePhase:deps.GamePhase}:pinned('game/store/state/state');
  const actions=deps.PlayCardAction?{
    PlayCardAction:deps.PlayCardAction,
    PlayerType:deps.PlayerType,SlotType:deps.SlotType
  }:pinned('game/store/actions/play-card-action');
  const {PlayCardAction,PlayerType,SlotType}=actions;
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  let liveStore=deps.liveStore??null;
  const chosen=new WeakMap();
  const audit={
    version:VERSION,seat,setup:{...options.setup},
    eligibleRoots:0,chosenRoots:0,dispatchAccepted:0,
    dispatchRejected:0,chosenTurns:[],
    sourceOrPromptDelegations:0,nonLiveDelegations:0,
    realOwnerDeckReadBeforePrompt:false,
    nativePromptSettlementQualified:false,
    competitiveQualified:false
  };
  function decide(state){
    if(state!==liveStore?.state){
      audit.nonLiveDelegations++;
      return original.value.call(this,state);
    }
    const owner=state.players?.[seat];
    if(!owner||this.client?.id!==owner.id||
        state.activePlayer!==seat||
        state.phase!==GamePhase.PLAYER_TURN||
        state.prompts?.some(p=>p.result===undefined)){
      audit.sourceOrPromptDelegations++;
      return original.value.call(this,state);
    }
    if(!shouldSeekPayload(state,owner,GamePhase.PLAYER_TURN,
        options.setup??{}))return original.value.call(this,state);
    audit.eligibleRoots++;
    const handIndex=owner.hand.cards.findIndex(c=>c.name==='Battle Compressor');
    assert.ok(handIndex>=0);
    const action=new PlayCardAction(owner.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    chosen.set(action,{seat,turn:state.turn,ownerId:owner.id,
      printing:owner.hand.cards[handIndex].fullName});
    audit.chosenRoots++;
    audit.chosenTurns.push(state.turn);
    return action;
  }
  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&liveStore===null)
      liveStore=this;
    const item=this===liveStore?chosen.get(action):null;
    try{
      const result=priorDispatch.value.call(this,action,...rest);
      if(item) audit.dispatchAccepted++;
      return result;
    }catch(error){
      if(item) audit.dispatchRejected++;
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...original,value:decide
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...priorDispatch,value:dispatch
  });
  try{return {result:execute(),audit};}
  finally{
    assert.equal(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,decide);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

module.exports={VERSION,withCanonicalOwnerDonorRoot};
