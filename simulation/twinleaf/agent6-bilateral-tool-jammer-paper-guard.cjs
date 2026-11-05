'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent6-bilateral-active-tool-jammer-paper-guard-v2-physical-owner';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Opt-in, both-physical-seat research hook for the pinned native Store.
 * The pinned Tool Jammer has an inactive ToolEffect reducer. Native
 * IS_TOOL_BLOCKED already treats a thrown ToolEffect as "Tool blocked".
 * Reuse that native contract for an opponent's Active Tool Jammer, while
 * leaving Tool Jammer itself and Benched Tools to their native semantics.
 * Ownership comes from the physically attached Tool: pinned Handheld Fan
 * passes its ATTACKING player in ToolEffect even when the defending Active
 * owns that Tool. Trusting effect.player would miss that paper suppression.
 *
 * This only corrects the ToolEffect query path, not Tools that bypass it.
 * It is unsuitable as a general paper-legality certificate.
 *
 * @template T
 * @param {()=>T} execute Synchronous native match or staged fixture.
 * @param {{Store?:Function,isToolBlocked?:Function,exampleLimit?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withBilateralActiveToolJammerPaperGuard(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const isToolBlocked=deps.isToolBlocked??require(path.join(output,
    'game/store/prefabs/prefabs')).IS_TOOL_BLOCKED;
  assert.equal(typeof isToolBlocked,'function');
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.writable,true);
  const limit=deps.exampleLimit??24;
  assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=100);

  const audit={
    version:VERSION,enginePin:PIN,
    scope:'ToolEffect queries for both physical Active Pokemon only',
    selectedInSharedBenchmark:false,
    inspectedToolEffectQueries:0,blockedQueries:0,
    blockedByOwnerSeat:{'0':0,'1':0},
    blockedForeignEffectPlayerQueries:0,
    blockedExamples:[],examplesTruncated:false,
    competitivelyQualifiedGames:0
  };
  function patched(state,effect){
    if(effect?.constructor?.name==='ToolEffect'){
      audit.inspectedToolEffectQueries++;
      const players=state?.players;
      const owner=Array.isArray(players)?players.find(player=>
        player.active?.tools?.includes(effect.card)):null;
      if(players?.length===2&&owner&&
         effect.card?.fullName!=='Tool Jammer BST'){
        const opponent=players.find(player=>player!==owner);
        const jammer=opponent?.active?.tools?.find(tool=>
          tool?.fullName==='Tool Jammer BST');
        if(jammer&&!isToolBlocked(this,state,opponent,jammer)){
          const seat=players.indexOf(owner);
          audit.blockedQueries++;
          audit.blockedByOwnerSeat[String(seat)]++;
          if(effect.player!==owner)audit.blockedForeignEffectPlayerQueries++;
          if(audit.blockedExamples.length<limit){
            audit.blockedExamples.push({
              ownerSeat:seat,
              effectPlayerSeat:players.indexOf(effect.player),
              ownerActive:owner.active.getPokemonCard()?.fullName??null,
              opponentActive:opponent.active.getPokemonCard()?.fullName??null,
              suppressedTool:effect.card.fullName,
              blocker:jammer.fullName
            });
          }else audit.examplesTruncated=true;
          throw new Error('AGENT6_PAPER_ACTIVE_TOOL_JAMMER_BLOCK');
        }
      }
    }
    return previous.value.call(this,state,effect);
  }

  Object.defineProperty(Store.prototype,'reduceEffect',
    {...previous,value:patched});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.reduceEffect,patched);
    Object.defineProperty(Store.prototype,'reduceEffect',previous);
  }
}

module.exports={VERSION,PIN,withBilateralActiveToolJammerPaperGuard};
