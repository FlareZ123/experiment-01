'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');

/** Compare observable real-match outcomes without diagnostic-only fields. */
function signature(g) {
  return {
    deckHashes:g.deckHashes,first:g.firstTurnSlot,
    actions:g.actions,turns:g.turns,finished:g.finished,
    winner:g.winner,prizes:g.prizesRemaining,
    actionCounts:g.actionCounts,actionsBySeat:g.actionsBySeat,
    cardsPlayed:g.cardsPlayedBySeat,attacks:g.attackTrace,
    declarations:g.attackDeclarationTrace,abilities:g.abilityTrace,
    terminal:g.terminalTransition,finalState:g.finalState
  };
}
function run() {
  initializeCards();
  const enemy=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===11);
  assert.equal(enemy?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(enemy.cards.length,60);
  assert.equal(candidate.length,60);
  const request={deckA:enemy.cards,deckB:candidate,seed:1111464409,
    maxActions:350,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    leleEntryAbilityLockCorrection:true,entryDrawLockCorrection:true,
    isolatePolicyRandomness:true,pendingEndTurnSwitchCleanupCorrection:true,
    newMoonNativeOpeningPivotSeat:1,captureAttackPassProbes:true,
    captureCopycatTurnStartSeat:1};
  const bare=runMatch({...request,captureDecisionTrace:false});
  const traced=runMatch({...request,captureDecisionTrace:true});
  assert.deepEqual(signature(traced),signature(bare));
  assert.equal(traced.finished,true);
  assert.equal(traced.verifiedByDrawLog,true);
  const selected=traced.decisionTrace.filter(x=>x.attackChoice?.selection&&x.playerSlot===1);
  assert.ok(selected.length>0);
  const declared=traced.attackDeclarationTrace.filter(x=>x.playerSlot===1&&
    x.triggerAction==='ResolvePromptAction');
  assert.ok(declared.length>0);
  return {schema:'source-copy-choice-readonly-parity-v1',seed:1111464409,
    selected:selected.map(x=>({ordinal:x.actionOrdinal,choice:x.attackChoice.selection})),
    declared:declared.map(x=>({ordinal:x.actionOrdinal,attack:x.attackName})),
    publicTerminal:traced.terminalTransition,
    exactGameSignaturesEqual:true,competitiveQualified:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,signature};
