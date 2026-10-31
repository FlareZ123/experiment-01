'use strict';

const assert=require('node:assert/strict');

/**
 * Pure, printing-free numeric census around a policy's *existing* speculative
 * actions. This observer never dispatches a new action, changes RNG, reads a
 * card identity, or replaces a physical source State. By observing identical
 * native source/replay decisions we can distinguish option mismatches from
 * diverging simulated zone lengths. All logging remains optional/default-off.
 *
 * @param {object} state Actual input or speculative resulting native State.
 * @returns {object|null} Numeric zones only, no hidden card identities.
 */
function zoneLengths(state){
  if(!Array.isArray(state?.players))return null;
  return {
    turn:state.turn??null,
    phase:state.phase??null,
    activePlayer:state.activePlayer??null,
    players:state.players.map(player=>({
      id:player.id??null,
      hand:player.hand?.cards?.length??null,
      deck:player.deck?.cards?.length??null,
      discard:player.discard?.cards?.length??null,
      prizes:player.prizes?.cards?.length??null,
      bench:player.bench?.length??null
    }))
  };
}

/**
 * Wrap only methods already called by the native decision; collect a bounded
 * trace, then restore every method descriptor even if the policy throws.
 *
 * @template T
 * @param {{tactics:object[]}} bot Fresh replay or actual native Bot.
 * @param {()=>T} work The exact existing decision, run once.
 * @param {{simulations?:object[],simulationCalls?:number}} observation Sink.
 * @param {{limit?:number}} [options] Log cap, never a simulator action cap.
 * @returns {T} Exact original work result.
 */
function observeNativeSpeculativeZoneTrace(bot,work,observation,{limit=64}={}){
  assert.ok(bot&&Array.isArray(bot.tactics));
  assert.equal(typeof work,'function');
  assert.ok(observation&&typeof observation==='object');
  assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=256);
  observation.simulations??=[];
  assert.ok(Array.isArray(observation.simulations));
  observation.simulationCalls??=0;
  const restorations=[];
  try{
    for(const tactic of new Set(bot.tactics)){
      if(typeof tactic.simulateAction!=='function')continue;
      const own=Object.getOwnPropertyDescriptor(tactic,'simulateAction');
      const original=tactic.simulateAction;
      Object.defineProperty(tactic,'simulateAction',{
        configurable:true,enumerable:own?.enumerable??false,writable:true,
        value:function (...args){
          const shouldRecord=observation.simulations.length<limit;
          const before=shouldRecord?zoneLengths(args[0]):null;
          const action=args[1];
          let returned,threw=false;
          try{
            returned=original.apply(this,args);
            return returned;
          }catch(error){
            threw=true;
            throw error;
          }finally{
            observation.simulationCalls++;
            if(shouldRecord)observation.simulations.push({
              tactic:this.constructor?.name??'unknown',
              actionType:action?.constructor?.name??null,
              handIndex:Number.isSafeInteger(action?.handIndex)?
                action.handIndex:null,
              input:before,result:zoneLengths(returned),threw,
              returnedState:returned!==undefined&&returned!==null
            });
          }
        }
      });
      restorations.push(()=>{
        if(own)Object.defineProperty(tactic,'simulateAction',own);
        else delete tactic.simulateAction;
      });
    }
    return work();
  }finally{
    for(const restore of restorations.reverse())restore();
  }
}

module.exports={zoneLengths,observeNativeSpeculativeZoneTrace};
