'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent24-native-postreducer-ko-dispatch-ledger-v1';

/**
 * Observe native post-reducer KnockOutEffect entitlements without changing
 * decisions or game state. An action dispatch is not guaranteed to contain
 * exactly one complete checkState resolution; a collected same-dispatch
 * group must NEVER be promoted to an authenticated simultaneous batch by
 * this utility alone. Genuine winner qualification requires a stronger join.
 *
 * @template T
 * @param {()=>T} execute Existing synchronous native Store run.
 * @param {{Store?:Function}} [dependencies] Genuine or injected Store class.
 * @returns {{result:T,evidence:object}} Read-only observed KO root events.
 */
function withNativeKODispatchLedger(execute,dependencies={}){
  assert.equal(typeof execute,'function');
  const Store=dependencies.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const priorDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  const priorReduce=Object.getOwnPropertyDescriptor(
    Store.prototype,'reduceEffect');
  assert.equal(typeof priorDispatch?.value,'function');
  assert.equal(typeof priorReduce?.value,'function');
  const events=[];
  const evidence={
    schema:VERSION,events,
    sameResolutionBatchAuthenticated:false,
    sourcePrintingAuthenticated:false,
    paperGameOutcomeQualified:false
  };
  let root=null,depth=0,frame=null,rootOrdinal=0;

  function dispatchObserved(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this!==root)return priorDispatch.value.call(this,action,...args);
    const outer=depth===0;
    if(outer){
      rootOrdinal++;
      frame={
        ordinal:rootOrdinal,action:action?.constructor?.name??null,
        koEntitlements:[],preFirstKOPrizes:null,suddenDeathAtFirstKO:null
      };
    }
    depth++;
    try{
      const result=priorDispatch.value.call(this,action,...args);
      if(outer&&frame.koEntitlements.length>0){
        events.push({
          ordinal:frame.ordinal,action:frame.action,
          ...frame,
          finalNativeWinnerSeat:this.state?.winner===0||
            this.state?.winner===1?this.state.winner:null,
          nativeFinished:this.state?.phase===7,
          finalPhysicalPrizes:this.state?.players?.map(player=>
            player.getPrizeLeft())??null,
          batchProof:'same-dispatch-only',
          paperGameOutcomeQualified:false
        });
      }
      return result;
    }finally{
      depth--;
      if(outer)frame=null;
    }
  }

  function reduceObserved(state,effect){
    const result=priorReduce.value.call(this,state,effect);
    if(this!==root||frame===null||
       effect?.constructor?.name!=='KnockOutEffect')
      return result;
    const victimSeat=state.players.indexOf(effect.player);
    assert.ok(victimSeat===0||victimSeat===1,
      'Native KO victim must be on one of two actual seats');
    if(frame.preFirstKOPrizes===null){
      frame.preFirstKOPrizes=state.players.map(player=>
        player.getPrizeLeft());
      frame.suddenDeathAtFirstKO=state.isSuddenDeath===true;
    }
    frame.koEntitlements.push({
      victimSeat,claimantSeat:1-victimSeat,
      prizeCount:effect.prizeCount,
      preventDefault:effect.preventDefault===true,
      alternatePrizeDestination:effect.prizeDestination!==undefined
    });
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...priorDispatch,value:dispatchObserved
  });
  Object.defineProperty(Store.prototype,'reduceEffect',{
    ...priorReduce,value:reduceObserved
  });
  try{
    return {result:execute(),evidence};
  }catch(error){
    if(error&&typeof error==='object')
      error.nativeKODispatchEvidence=evidence;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatchObserved);
    assert.strictEqual(Store.prototype.reduceEffect,reduceObserved);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
    Object.defineProperty(Store.prototype,'reduceEffect',priorReduce);
  }
}

module.exports={VERSION,withNativeKODispatchLedger};
