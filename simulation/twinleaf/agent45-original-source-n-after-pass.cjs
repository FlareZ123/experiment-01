'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const VERSION='agent45-original-rank14-source-n-after-pass-v1';
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(ROOT,name));
const N='N FCO';

/**
 * Source-only original Aichi rank14 N when real bot would otherwise Pass.
 * The player must actually hold this exact printed N in its own hand,
 * have a nonconsumed Supporter, a nonempty deck and no visible Supporter lock.
 * Only applies to the fourth Store of an original four-row registered batch.
 * A genuine PlayCardAction remains subject to native Store validation.
 *
 * @template T
 * @param {()=>T} execute Unchanged four-registered original-match batch
 * @param {object} [deps] Pure-test injection seams
 */
function withSourceNInsteadOfPass(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Ai=deps.SimpleTacticsAi??native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    native('game/store/actions/play-card-action');
  const observe=deps.observe??actorObservation;
  const originalDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof originalDecode?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  const seen=new WeakSet(),proposals=new WeakMap();
  let actualStore=null,createdStores=0;
  const audit={schema:VERSION,sourceSeat:0,sourceGameOrdinal:4,
    originalStoresSeen:0,passDecisionsSeen:0,
    eligibleNDecisions:0,acceptedNRoots:0,rejectedNRoots:0,
    actualNativeAccepted:[],opponentHiddenStateUsed:false,
    sourceOpponentPolicyChangedOnlyOnEligiblePass:true,
    competitiveGamesQualified:0};
  function decode(state){
    const original=originalDecode.value.call(this,state);
    if(actualStore?.state!==state||
       original?.constructor?.name!=='PassTurnAction')return original;
    const seat=state.players.findIndex(p=>p.id===this.client.id);
    if(seat!==0||state.activePlayer!==0||
       state.prompts?.some(p=>p.result===undefined))return original;
    const view=observe(state,0);
    assert.equal(view.decisionKind,'owner-root');
    audit.passDecisionsSeen++;
    const turn=view.globalTurn,r=view.ownTurnResources;
    if(turn<13||view.ownHand.length<7||
       r.supporterPlayedTurn!==0||r.supporterPlayLocked!==false||
       view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
       !(view.ownPublic?.deckCount>0))return original;
    const handIndex=view.ownHand.indexOf(N);
    if(handIndex<0)return original;
    const actor=state.players[0];
    assert.equal(actor.hand.cards[handIndex]?.fullName,N);
    const action=new PlayCardAction(actor.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    proposals.set(action,{turn,seat,printing:N,handCount:view.ownHand.length,
      deckCount:view.ownPublic.deckCount});
    audit.eligibleNDecisions++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!seen.has(this)){
      seen.add(this);
      createdStores++;
      audit.originalStoresSeen=createdStores;
      if(createdStores===4)actualStore=this;
    }
    const proposal=this===actualStore?proposals.get(action):null;
    try{
      const result=originalDispatch.value.call(this,action,...args);
      if(proposal){
        const owner=this.state.players[0];
        audit.acceptedNRoots++;
        audit.actualNativeAccepted.push({...proposal,nativeAccepted:true,
          supporterTurnAfter:owner.supporterTurn,
          pendingNativePrompts:this.state.prompts
            .filter(p=>p.result===undefined).map(p=>p.constructor.name),
          remainingHeldN:owner.hand.cards.filter(c=>c.fullName===N).length});
      }
      return result;
    }catch(error){
      if(proposal){
        audit.rejectedNRoots++;
        audit.actualNativeAccepted.push({...proposal,nativeAccepted:false,
          reason:String(error?.message??error).slice(0,250)});
      }
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...originalDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent45SourceNOnAbort=audit;
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalDecode);
  }
}
module.exports={VERSION,N,withSourceNInsteadOfPass};
