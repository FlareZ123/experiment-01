'use strict';

const assert=require('node:assert/strict');
const {LILLIE,lillieExclusionReason}=
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
function lowHandLillieExclusionReason(view){
  const baseline=lillieExclusionReason(view);
  if(baseline!==null)return baseline;
  if(view.ownTurnResources.supporterPlayedTurn!==0)
    return 'supporter-quota-unconfirmed';
  if(!view.ownPublic.active)return 'no-active';
  if(view.ownHand.length>3)return 'hand-too-large';
  if(view.ownPublic.deckCount<8)return 'deck-below-eight';
  return null;
}
/** @param {object} view @returns {object|null} Owner-only low-hand intent. */
function chooseLowHandLillieBeforeAttack(view){
  assert.equal(view?.decisionKind,'owner-root');
  if(lowHandLillieExclusionReason(view)!==null)return null;
  return {kind:'play-lowhand-lillie',
    handIndex:view.ownHand.indexOf(LILLIE),printing:LILLIE};
}

module.exports={VERSION,lowHandLillieExclusionReason,
  chooseLowHandLillieBeforeAttack};
