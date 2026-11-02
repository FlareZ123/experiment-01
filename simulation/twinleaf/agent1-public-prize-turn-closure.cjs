'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-native-public-turn-prize-closure-v1';

/**
 * @param {object|null|undefined} state Real pinned Twinleaf Store state.
 * @returns {[number,number]|null} Public remaining Prize counts.
 */
function publicPrizes(state){
  if(!Array.isArray(state?.players)||state.players.length!==2)return null;
  const prizes=state.players.map(player=>
    Array.isArray(player?.prizes)?
      player.prizes.filter(prize=>Array.isArray(prize?.cards)&&
        prize.cards.length>0).length:null);
  return prizes.every(x=>Number.isSafeInteger(x)&&x>=0&&x<=6)?
    prizes:null;
}

/**
 * Passive, reversible, actual-Store postdispatch turn-closure witness. Read
 * ONLY public turn number, action class and remaining Prize counts; do not
 * pass observations to any player policy. This is not a stopwatch and cannot
 * produce a timed tournament result.
 *
 * @template T
 * @param {()=>T} execute Original native match with unchanged policies.
 * @param {{Store?:Function}} [options] Pure-test injection only.
 * @returns {{result:T,audit:object}}
 */
function withPublicPrizeTurnClosures(execute,options={}){
  assert.equal(typeof execute,'function');
  const Store=options.Store??require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const closures=new Map();
  let transitionCount=0;
  function patchedDispatch(action,...args){
    const beforeTurn=this.state?.turn;
    const beforePrizes=publicPrizes(this.state);
    const result=previous.value.apply(this,[action,...args]);
    const afterTurn=this.state?.turn;
    if(Number.isSafeInteger(beforeTurn)&&beforeTurn>=1&&
       Number.isSafeInteger(afterTurn)&&afterTurn===beforeTurn+1){
      const afterPrizes=publicPrizes(this.state);
      if(beforePrizes&&afterPrizes){
        transitionCount++;
        closures.set(beforeTurn,{
          turnClosed:beforeTurn,nextTurn:afterTurn,
          actionType:action?.constructor?.name??'unknown',
          beforePrizes,afterPrizes,
          afterSecondStarterTurn:beforeTurn%2===0,
          paperTimeCallObserved:false,
          postFinalCheckupExcluded:false
        });
      }
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...previous,value:patchedDispatch
  });
  try{
    const result=execute();
    return {
      result,
      audit:{
        version:VERSION,
        observation:'actual-postdispatch-Store-public-Prize-count-only',
        transitionCount,
        observedClosureCount:closures.size,
        closures:[...closures.values()].sort((a,b)=>a.turnClosed-b.turnClosed),
        paperClockCertified:false,
        unsupported:'No physical time call, end-of-turn checkup exemption or paper move durations'
      }
    };
  }finally{
    assert.equal(Store.prototype.dispatch,patchedDispatch,
      'Native Store prototype was unexpectedly overwritten');
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,publicPrizes,withPublicPrizeTurnClosures};
