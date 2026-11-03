'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent39-live-unknown-power-action-witness-v1';

/** @param {object|null} target Native publicly selected board position. */
function slotIdentity(target){
  if(target===null||typeof target!=='object')return null;
  return {
    player:typeof target.player==='number'?target.player:null,
    slot:typeof target.slot==='number'?target.slot:null,
    index:Number.isInteger(target.index)?target.index:null
  };
}

/**
 * Preserve only a typed owner-initiated public-Ability action and its
 * Store outcome. All dispatches are delegated unchanged, and rejected actions
 * are observed before the pinned reducer can mutate State.
 *
 * @template T
 * @param {()=>T} work A synchronous genuine Store match.
 * @param {{Store?:Function}} [deps] Injected Store only for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withLiveUnknownPowerActionWitness(work,deps={}){
  assert.equal(typeof work,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const proto=Store.prototype;
  const descriptor=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let liveStore=null;
  let liveGameCount=0;
  let gameDispatchOrdinal=0;
  const abilityActions=[];
  let liveDispatchCount=0;
  let auxiliaryAbilityDispatchCount=0;
  function tracedDispatch(action,...args){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      liveGameCount++;
      gameDispatchOrdinal=0;
    }
    const live=this===liveStore;
    if(live){
      liveDispatchCount++;
      gameDispatchOrdinal++;
    }
    if(type==='UseAbilityAction'&&!live)auxiliaryAbilityDispatchCount++;
    const observed=live&&type==='UseAbilityAction'?{
      ordinal:gameDispatchOrdinal,
      liveGameIndex:liveGameCount-1,
      actionClass:type,
      preDispatchTurn:this.state.turn,
      preDispatchPhase:this.state.phase,
      actorId:typeof action.id==='number'?action.id:null,
      abilityName:typeof action.abilityName==='string'?
        action.abilityName:null,
      powerName:typeof action.powerName==='string'?action.powerName:null,
      name:typeof action.name==='string'?action.name:null,
      target:slotIdentity(action.target??action.slot??null),
      actionOwnPropertyNames:Object.keys(action).sort(),
      outcome:'unresolved'
    }:null;
    if(observed)abilityActions.push(observed);
    try{
      const result=descriptor.value.call(this,action,...args);
      if(observed)observed.outcome='store-accepted';
      return result;
    }catch(error){
      if(observed){
        observed.outcome='store-rejected';
        observed.rejection=String(error?.message).includes('UNKNOWN_POWER')?
          'UNKNOWN_POWER':'OTHER_STORE_ERROR';
      }
      throw error;
    }
  }
  Object.defineProperty(proto,'dispatch',{...descriptor,value:tracedDispatch});
  try{
    const result=work();
    return {result,audit:{
      schema:VERSION,observedLiveStore:liveStore!==null,
      liveGameCount,liveDispatchCount,auxiliaryAbilityDispatchCount,
      abilityActions,
      dispatchBehaviorModified:false,
      paperLegalOrStrategicMoveCertified:false,
      competitiveQualifiedGames:0
    }};
  }finally{
    Object.defineProperty(proto,'dispatch',descriptor);
  }
}
module.exports={VERSION,slotIdentity,withLiveUnknownPowerActionWitness};
