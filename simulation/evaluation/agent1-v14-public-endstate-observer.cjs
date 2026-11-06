'use strict';

const assert=require('node:assert/strict');

const VERSION='agent1-v14-public-terminal-endstate-native-observer-v1';
const PREFIX='agent41-bilateral-v2-common-policy-development-';

/**
 * Capture only public counts and revealed board names after a real native
 * runMatch returns, or an opaque error status when it throws.
 *
 * This lives outside Twinleaf and never alters its action decisions,
 * random streams, registered decks, root horizon, or prompt responses.
 *
 * @param {{headless?:object}} [deps] Mutable research headless module.
 * @returns {{run:Function,observations:object[]}}
 */
function createPublicEndstateObserver(deps={}){
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const observations=[];

  /** @template T @param {()=>T} execute @returns {T} */
  function run(execute){
    assert.equal(typeof execute,'function');
    const original=Object.getOwnPropertyDescriptor(headless,'runMatch');
    assert.equal(typeof original?.value,'function');
    assert.equal(original.configurable,true);
    function observe(request,...args){
      const label=request?.label;
      const id=typeof label==='string'&&label.startsWith(PREFIX)?
        label.slice(PREFIX.length):null;
      let game;
      try{
        game=original.value.apply(this,[request,...args]);
      }catch(error){
        if(id!==null)observations.push({id,nativeReturned:false,
          publicNativeStateAvailable:false,opaqueAbort:true});
        throw error;
      }
      if(id!==null){
        const players=game?.finalState;
        const validPublic=Array.isArray(players)&&players.length===2&&
          players.every(p=>Number.isSafeInteger(p?.deckRemaining)&&
            Number.isSafeInteger(p?.handSize)&&
            typeof p?.activePokemon==='string'&&
            Array.isArray(p?.benchedPokemon));
        observations.push({id,nativeReturned:true,
          publicNativeStateAvailable:validPublic,
          opaqueAbort:false,
          nativeFinished:game?.finished===true,
          nativeEndReason:game?.endReason??null,
          nativeWinner:game?.winner??null,
          nativePrizesBySeat:game?.prizesRemaining??null,
          ...(validPublic?{
            publicDeckCountsBySeat:players.map(p=>p.deckRemaining),
            publicHandCountsBySeat:players.map(p=>p.handSize),
            publicActiveNamesBySeat:players.map(p=>p.activePokemon),
            publicBenchNamesBySeat:players.map(p=>[...p.benchedPokemon])
          }:{})
        });
      }
      return game;
    }
    Object.defineProperty(headless,'runMatch',{...original,value:observe});
    try{return execute();}
    finally{
      assert.strictEqual(headless.runMatch,observe);
      Object.defineProperty(headless,'runMatch',original);
    }
  }
  return {run,observations};
}
module.exports={VERSION,PREFIX,createPublicEndstateObserver};
