'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent6-pinned-active-tool-jammer-tool-effect-guard-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Per-Store, reversible paper-research correction. Twinleaf's pinned Tool
 * Jammer has a TrainerEffect-only no-op, so IS_TOOL_BLOCKED does not see
 * opposing Active Tool Jammer. Intercept precisely the ToolEffect stub from
 * an opponent Active's attached Tool; its caller can then use the existing
 * IS_TOOL_BLOCKED exception contract. This has NOT certified every Tool.
 *
 * @template T
 * @param {object} store Genuine pinned Store
 * @param {object} owner Acting player's native Player
 * @param {object} opponent Other native Player
 * @param {()=>T} execute Synchronous Store sequence
 * @param {{isJammerBlocked?:(store:object,state:object,
 *   player:object,jammer:object)=>boolean}} [options]
 * @returns {{result:T,patches:object[]}}
 */
function withActiveToolJammerToolEffectGuard(
  store,owner,opponent,execute,options={}
){
  assert.equal(typeof execute,'function');
  const original=store.reduceEffect;
  assert.equal(typeof original,'function');
  const nativeToolBlocked=options.isJammerBlocked??require(path.resolve(
    __dirname,'../../vendor/twinleaf/ptcg-server/output/game/store/prefabs/prefabs'
  )).IS_TOOL_BLOCKED;
  const patches=[];
  function guarded(state,effect){
    if(effect?.constructor?.name==='ToolEffect'&&
       effect.player===owner&&effect.card?.fullName!=='Tool Jammer BST'&&
       owner.active.tools.includes(effect.card)){
      const jammer=opponent.active.tools.find(
        tool=>tool.fullName==='Tool Jammer BST');
      if(jammer&&!nativeToolBlocked(this,state,opponent,jammer)){
        patches.push({
          ownerId:owner.id,
          active:owner.active.getPokemonCard()?.fullName??null,
          tool:effect.card.fullName,
          opponentActive:opponent.active.getPokemonCard()?.fullName??null,
          opponentJammer:jammer.fullName,
          effect:'ToolEffect',
          outcome:'PAPER_TOOL_EFFECT_BLOCKED'
        });
        // IS_TOOL_BLOCKED's documented current contract interprets a thrown
        // ToolEffect reduction as blocked (as Jamming Tower already does).
        throw new Error('AGENT6_PAPER_TOOL_JAMMER_ACTIVE_BLOCK');
      }
    }
    return original.call(this,state,effect);
  }
  store.reduceEffect=guarded;
  try{return {result:execute(),patches};}
  finally{store.reduceEffect=original;}
}

module.exports={VERSION,PIN,withActiveToolJammerToolEffectGuard};
