'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const VERSION='agent33-actual-native-beach-draw-and-end-turn-witness-v1';

function observation(state,action){
  const seat=state.players.findIndex(p=>p.id===action.clientId);
  const player=seat>=0?state.players[seat]:null;
  const stadium=state.players.flatMap(p=>p.stadium?.cards??[])
    .map(c=>c?.name??null).filter(Boolean);
  return {
    playerSlot:seat,turn:state.turn,phase:state.phase,
    activePlayer:state.activePlayer,stadiumNames:stadium,
    handCount:player?.hand?.cards?.length??null,
    deckCount:player?.deck?.cards?.length??null,
    usedTurn:player?.stadiumUsedTurn??null
  };
}

/** Public-count-only proof of a native Beach draw-to-seven and turn end. */
function effectSettled(before,after){
  const expected=7-before.handCount;
  return before.stadiumNames.includes('Tropical Beach')&&
    Number.isSafeInteger(before.handCount)&&
    Number.isSafeInteger(before.deckCount)&&
    expected>0&&before.deckCount>=expected&&
    after.handCount===7&&
    after.deckCount===before.deckCount-expected&&
    after.usedTurn===before.turn&&
    (after.turn!==before.turn||
      after.phase!==before.phase||
      after.activePlayer!==before.activePlayer);
}

/**
 * A read-only, reversible Store dispatch wrapper. Observes accepted
 * UseStadiumAction against the genuine live Store after AddPlayerAction;
 * never sends any observation back into player decision hooks.
 * @template T
 * @param {()=>T} execute Synchronous native match.
 * @param {{Store?:Function}} [dependencies] Mock seam for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withBeachStoreEffectWitness(execute,dependencies={}){
  assert.equal(typeof execute,'function');
  const Store=dependencies.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const proto=Store.prototype;
  const descriptor=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const original=descriptor.value;
  let live=null,ordinal=0;
  const events=[];
  function audit(){
    return {
      schema:VERSION,observedLiveStore:live!==null,
      acceptedStadiumUses:events.filter(e=>
        e.status==='native-dispatch-accepted').length,
      beachUsesObserved:events.filter(e=>
        e.stadiumNames?.includes('Tropical Beach')).length,
      beachDrawAndEndTurnSettled:events.filter(e=>
        e.beachDrawAndEndTurnSettled===true).length,
      unsettledBeachUses:events.filter(e=>
        e.stadiumNames?.includes('Tropical Beach')&&
        e.beachDrawAndEndTurnSettled!==true).length,
      events,
      sha256:createHash('sha256')
        .update(JSON.stringify(events)).digest('hex'),
      independentPaperValidation:false,
      competitiveGameQualified:false
    };
  }
  function dispatch(action,...args){
    const type=action?.constructor?.name;
    if(!live&&type==='AddPlayerAction')live=this;
    if(this!==live)return original.call(this,action,...args);
    if(type!=='UseStadiumAction')return original.call(this,action,...args);
    ordinal++;
    const before=observation(this.state,action);
    try{
      const result=original.call(this,action,...args);
      const after=observation(this.state,action);
      events.push({dispatchOrdinal:ordinal,
        status:'native-dispatch-accepted',
        playerSlot:before.playerSlot,turnBefore:before.turn,
        stadiumNames:before.stadiumNames,
        handBefore:before.handCount,handAfter:after.handCount,
        deckBefore:before.deckCount,deckAfter:after.deckCount,
        usedTurnAfter:after.usedTurn,
        endTurnTransition:after.turn!==before.turn||
          after.phase!==before.phase||
          after.activePlayer!==before.activePlayer,
        beachDrawAndEndTurnSettled:effectSettled(before,after)});
      return result;
    }catch(error){
      events.push({dispatchOrdinal:ordinal,
        status:'native-dispatch-threw',playerSlot:before.playerSlot,
        turnBefore:before.turn,stadiumNames:before.stadiumNames,
        beachDrawAndEndTurnSettled:false});
      if(error&&typeof error==='object')
        error.nativeBeachStoreEvidence=audit();
      throw error;
    }
  }
  Object.defineProperty(proto,'dispatch',{...descriptor,value:dispatch});
  try{return {result:execute(),audit:audit()};}
  catch(error){
    if(error&&typeof error==='object'&&!error.nativeBeachStoreEvidence)
      error.nativeBeachStoreEvidence=audit();
    throw error;
  }finally{
    assert.strictEqual(proto.dispatch,dispatch);
    Object.defineProperty(proto,'dispatch',descriptor);
  }
}

function beachStoreAbortEvidence(error){
  const visited=new Set();
  for(let e=error,d=0;e&&typeof e==='object'&&
    d<12&&!visited.has(e);e=e.cause,d++){
    visited.add(e);
    if(e.nativeBeachStoreEvidence?.schema===VERSION)
      return e.nativeBeachStoreEvidence;
  }
  return null;
}
module.exports={VERSION,observation,effectSettled,
  withBeachStoreEffectWitness,beachStoreAbortEvidence};
