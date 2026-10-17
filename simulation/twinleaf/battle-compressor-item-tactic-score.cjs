'use strict';
const assert=require('node:assert/strict');

/**
 * Observe evaluated scores for Battle Compressor within the actual
 * PlayTrainerTactic. Records only source-presentation information known to
 * the acting player; the observer never substitutes a policy action.
 *
 * @template T
 * @param {Function} PlayTrainerTactic Compiled pinned engine class.
 * @param {()=>T} work Run one deterministic source game.
 * @returns {{result:T,probes:object[]}}
 */
function withBattleCompressorItemScores(PlayTrainerTactic,work) {
  const own=Object.getOwnPropertyDescriptor(PlayTrainerTactic.prototype,'evaluateAction');
  const original=PlayTrainerTactic.prototype.evaluateAction;
  assert.equal(typeof original,'function');
  const probes=[];
  Object.defineProperty(PlayTrainerTactic.prototype,'evaluateAction',{
    configurable:true,writable:true,
    value:function observeScore(state,playerId,action,...other) {
      const player=state.players.find(p=>p.id===playerId);
      const card=player?.hand.cards[action?.handIndex];
      if(card?.name!=='Battle Compressor') {
        return original.call(this,state,playerId,action,...other);
      }
      const before=this.getStateScore(state,playerId);
      const evaluated=original.call(this,state,playerId,action,...other);
      probes.push({
        turn:state.turn,playerId,
        sourceActive:player.active.getPokemonCard()?.name??null,
        sourceDeckSize:player.deck.cards.length,
        sourceHandSize:player.hand.cards.length,
        scoreBefore:before,
        evaluatedScore:evaluated??null,
        scoreDelta:evaluated===undefined?null:evaluated-before
      });
      return evaluated;
    }
  });
  try {
    return {result:work(),probes};
  } finally {
    if(own)Object.defineProperty(PlayTrainerTactic.prototype,'evaluateAction',own);
    else delete PlayTrainerTactic.prototype.evaluateAction;
  }
}
module.exports={withBattleCompressorItemScores};
