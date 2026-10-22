'use strict';

const assert=require('node:assert/strict');
const nodePath=require('node:path');
const {
  beforeAcceptedTarget,afterAcceptedTarget,targetSidecar
}=require('./native-accepted-target-sidecar.cjs');

const VERSION='actual-store-physical-target-witness-v1';

/**
 * Post-decision, read-only native Store dispatch observer. It never feeds
 * identities or snapshots to the bot, and does not alter any action.
 * @template T
 * @param {()=>T} execute Synchronous real Store game.
 * @param {{Store?:Function}} [deps] Injection seam for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withAcceptedTargetWitness(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=nodePath.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(nodePath.join(output,'game/store/store')).Store;
  const proto=Store.prototype;
  const previous=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let live=null,dispatchOrdinal=0;
  const records=[];
  function audit(result=null){
    const roots=result?.rootActionLedger?.filter(row=>
      row.action==='PlayCardAction'||row.action==='RetreatAction')??null;
    const linked=roots!==null && roots.length===records.length &&
      roots.every((row,i)=>row.action===records[i].action &&
        row.playerSlot===records[i].playerSlot &&
        row.turnBefore===records[i].turnBefore);
    const events=records.map((record,i)=>({
      ...record,rootActionOrdinal:linked?roots[i].actionOrdinal:null
    }));
    return {...targetSidecar(events),version:VERSION,
      rootOrdinalLinked:linked,acceptedTargetDispatches:records.length,
      observedLiveStore:live!==null,
      legacyRootProtocolUnaffected:true,competitiveGameQualified:false};
  }
  function capture(action,...args){
    if(!live&&action?.constructor?.name==='AddPlayerAction')live=this;
    if(this!==live)return previous.value.call(this,action,...args);
    dispatchOrdinal++;
    const state=this.state;
    const type=action?.constructor?.name;
    const pending=state.prompts?.find(p=>p.result===undefined)??null;
    const actorId=pending?.playerId??action?.clientId??action?.id;
    const seat=state.players.findIndex(player=>player.id===actorId);
    const before=(type==='PlayCardAction'||type==='RetreatAction')?
      beforeAcceptedTarget(state,action,seat,dispatchOrdinal,state.turn):null;
    try{
      const result=previous.value.call(this,action,...args);
      if(before)records.push(afterAcceptedTarget(before,this.state));
      return result;
    }catch(error){
      if(error&&typeof error==='object')
        error.nativeAcceptedTargetEvidence=audit();
      throw error;
    }
  }
  Object.defineProperty(proto,'dispatch',{...previous,value:capture});
  try{
    const result=execute();
    return {result,audit:audit(result)};
  }catch(error){
    if(error&&typeof error==='object'&&
       !error.nativeAcceptedTargetEvidence)
      error.nativeAcceptedTargetEvidence=audit();
    throw error;
  }finally{
    assert.strictEqual(proto.dispatch,capture);
    Object.defineProperty(proto,'dispatch',previous);
  }
}
/**
 * The headless runner wraps a rejected Store action in an Error with a cause;
 * policy adapters may add another cause. Recover the nearest authentic
 * receipt without fabricating a successful result.
 * @param {unknown} error
 * @returns {object|null}
 */
function acceptedTargetAbortEvidence(error){
  const seen=new Set();
  for(let current=error,depth=0;current&&typeof current==='object'&&
      depth<12&&!seen.has(current);current=current.cause,depth++){
    seen.add(current);
    if(current.nativeAcceptedTargetEvidence?.schema===
        'actual-store-declared-target-sidecar-v1')
      return current.nativeAcceptedTargetEvidence;
  }
  return null;
}

module.exports={VERSION,withAcceptedTargetWitness,acceptedTargetAbortEvidence};
