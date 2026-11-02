'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent45-attach-energy-blockedto-store-guard-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A prompt can validate its card selections while overlooking a forbidden
 * destination. Evaluate only physical target coordinates already in the
 * genuine owner prompt's blockedTo list.
 * @param {object} prompt Native AttachEnergyPrompt.
 * @param {object} result Native CardAssign result.
 * @returns {boolean}
 */
function includesForbiddenDestination(prompt,result){
  if(!Array.isArray(result))return false;
  const blocked=prompt?.options?.blockedTo??[];
  if(!Array.isArray(blocked)||blocked.length===0)return false;
  return result.some(assign=>assign?.to&&blocked.some(forbidden=>
    forbidden.player===assign.to.player&&
    forbidden.slot===assign.to.slot&&
    forbidden.index===assign.to.index));
}

/**
 * Default-off, reversible pinned Store prompt guard. A paper-forbidden
 * blockedTo recipient is rejected before any callback moves attached Energy.
 * All other game actions and prompt types are delegated unchanged.
 *
 * @template T
 * @param {()=>T} execute Synchronous native Store workload.
 * @param {object} [deps] Pinned native dependency override for tests.
 * @returns {{result:T,audit:object}}
 */
function withAttachEnergyBlockedToGuard(execute,deps={}){
  assert.equal(typeof execute,'function');
  const native=name=>require(path.join(output,name));
  const Store=deps.Store??native('game/store/store').Store;
  const AttachEnergyPrompt=deps.AttachEnergyPrompt??
    native('game/store/prompts/attach-energy-prompt').AttachEnergyPrompt;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GameError=deps.GameError??native('game/game-error').GameError;
  const GameMessage=deps.GameMessage??native('game/game-message').GameMessage;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  const audit={version:VERSION,intercepted:0,blocked:0,
    allowed:0,bySeat:{0:0,1:0},competitiveQualifiedGames:0};
  function dispatch(action,...args){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(candidate=>
        candidate.id===action.id&&candidate.result===undefined);
      if(prompt instanceof AttachEnergyPrompt){
        audit.intercepted++;
        if(includesForbiddenDestination(prompt,action.result)){
          audit.blocked++;
          const seat=this.state.players.findIndex(
            player=>player.id===prompt.playerId);
          if(seat===0||seat===1)audit.bySeat[seat]++;
          throw new GameError(GameMessage.ILLEGAL_ACTION);
        }
        audit.allowed++;
      }
    }
    return prior.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}

module.exports={VERSION,includesForbiddenDestination,withAttachEnergyBlockedToGuard};
