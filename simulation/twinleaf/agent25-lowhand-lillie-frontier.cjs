'use strict';

const assert=require('node:assert/strict');
const {LILLIE,chooseLillieAfterPass}=
  require('./agent12-actor-only-lillie-after-pass.cjs');

const VERSION='agent25-actor-only-lowhand-lillie-before-attack-v1';

/**
 * A deliberately conservative pre-attack shuffle/draw opportunity for the
 * unchanged champion and New Moon candidate. Both print Lillie's Determination.
 *
 * Compared with Agent 12's after-Pass branch, this tests Supporter contention
 * while an attack might already be payable. The experimental policy only
 * proposes the card. Actual target acceptance, Supporter quota, prompt
 * resolution and resulting board/play benefit require native Store evidence.
 * Opponent concealed information never enters the decision.
 *
 * @param {object} view Frozen detached actorObservation for the acting owner.
 * @returns {{kind:'play-lowhand-lillie',handIndex:number,printing:string}|null}
 */
function chooseLowHandLillieBeforeAttack(view){
  assert.equal(view?.decisionKind,'owner-root');
  const candidate=chooseLillieAfterPass(view);
  if(!candidate || candidate.printing!==LILLIE)return null;
  if(view.ownTurnResources.supporterPlayedTurn!==0)return null;
  // Drawing six (or eight at six Prizes) is a reliable *resource* opportunity
  // from a very small hand, without consuming a singleton discard cost.
  // This conservative floor avoids proposing a late-game deck-out and is not
  // a claim that the proposed play maximizes game-winning probability.
  if(view.ownHand.length>3 || view.ownPublic.deckCount<8)return null;
  return {kind:'play-lowhand-lillie',handIndex:candidate.handIndex,
    printing:LILLIE};
}

module.exports={VERSION,chooseLowHandLillieBeforeAttack};
