'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {installSpecialRedCardEmptyHandHook,installSpecialRedCardPaperHook}=
  require('./agent44-special-red-card-empty-hand-hook.cjs');
const {screenOwnerTrainerPaperNecessitiesV3,VERSION:SCREEN_VERSION}=
  require('../evaluation/agent44-m4-public-prerequisite.cjs');

/**
 * Wrap exactly one owner-root policy choice using only the owner's detached
 * paper-visible information. If Special Red Card is currently paper-vetoed,
 * hide its native canPlay offer during speculation, then restore the pinned
 * method even if the bot decoder throws.
 *
 * Failing the paper screen never certifies that another action is legal.
 * A selector ignoring native canPlay and choosing the forbidden card causes
 * an explicit fail-closed error rather than an unqualified physical Store play.
 * Native prompt choices are intentionally outside this wrapper.
 *
 * @param {object} state Real root state; no pending prompt.
 * @param {0|1} seat Current owner physical seat.
 * @param {()=>any} choose The existing unmodified seat policy callback.
 * @param {(audit:object)=>void} [onAudit] Optional provenance sink.
 * @param {()=>number} [policyShuffleRandom] Explicit per-seat policy RNG for
 *   hand permutation inside speculative clones only. Never pass physical RNG.
 * @returns {any} The original selected action, unchanged when paper-allowed.
 */
function withM4PaperOwnerRoot(state,seat,choose,onAudit,policyShuffleRandom) {
  assert.equal(typeof choose,'function');
  if(onAudit!==undefined)assert.equal(typeof onAudit,'function');
  if(policyShuffleRandom!==undefined)
    assert.equal(typeof policyShuffleRandom,'function');
  const view=actorObservation(state,seat);
  assert.equal(view.decisionKind,'owner-root');
  const held=view.ownHand.flatMap((printing,handIndex)=>
    ['Special Red Card M4','Special Red Card CRI'].includes(printing)?
      [{printing,handIndex,type:'Item'}]:[]);
  if(held.length===0)return choose();
  const paper=screenOwnerTrainerPaperNecessitiesV3(view,held);
  const needsHandVeto=paper.rows.some(r=>
    r.blockedReasons?.includes('public-opponent-hand-empty'));
  const restore=policyShuffleRandom!==undefined?
    installSpecialRedCardPaperHook(policyShuffleRandom):
    needsHandVeto?installSpecialRedCardEmptyHandHook():null;
  let action;
  try{
    action=choose();
  } finally {
    if(restore)restore();
  }
  const selected=action?.constructor?.name==='PlayCardAction'&&
    state.players[seat]?.id===action.id?
      paper.rows.find(r=>r.handIndex===action.handIndex):null;
  const audit={
    version:policyShuffleRandom!==undefined?
      'agent44-m4-owner-root-preselection-v2-policy-rng-clone-shuffle':
      'agent44-m4-owner-root-preselection-v1',
    paperScreenVersion:SCREEN_VERSION,
    actorSeat:seat,globalTurn:view.globalTurn,
    observedOpponentHandCount:view.opponentPublic.handCount,
    observedOpponentPrizeCount:view.opponentPublic.prizeCount,
    physicalHeldM4Copies:held.length,
    provenPaperBlockedCopies:paper.provenPaperBlockedCopies,
    nativeCanPlayHandVetoInstalled:needsHandVeto||policyShuffleRandom!==undefined,
    speculativeShuffleHookInstalled:policyShuffleRandom!==undefined,
    selectedM4Printing:selected?.printing??null,
    attemptedPaperInvalidM4:Boolean(selected?.blocked),
    paperPlayableCertified:false,
    competitiveGameQualified:false
  };
  if(onAudit)onAudit(Object.freeze(audit));
  if(selected?.blocked){
    const failure=new Error('Paper-invalid Special Red Card selected at owner root');
    failure.paperM4Prerequisite=audit;
    throw failure;
  }
  return action;
}

module.exports={withM4PaperOwnerRoot};
