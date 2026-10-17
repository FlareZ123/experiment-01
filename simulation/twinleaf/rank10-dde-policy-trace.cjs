'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');

/**
 * Source-only control trace for a policy-version perturbation. Both 60-card
 * lists, match flags, RNG protocol, seat and cap match the archived rank10
 * champion-B control. This does not stage a late-game state or certify bot play.
 */
function main() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const candidate=byRank.get(1),opponent=byRank.get(10);
  assert.ok(candidate?.playableUnderEngine&&opponent?.playableUnderEngine);
  const request={
    deckA:opponent.cardIds,deckB:candidate.cardIds,
    seed:4246551499,maxActions:350,label:'rank10-champion-B-DDE-policy-audit',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const recorded=withStoreDispatchTranscript(Store,
    ()=>runMatch(request),{liveStoreOnly:true,
    typedActionValues:true,promptReferenceActionValues:true});
  const result=recorded.result;
  assert.equal(recorded.dispatched,result.actions+2);
  return {
    schema:'rank10-source-dde-policy-trace-v1',
    sourceRanks:[10,1],
    trialSeed:request.seed,
    sourceCardIds:[request.deckA,request.deckB],
    deckHashes:result.deckHashes,
    policy:result.policy,
    firstTurnSlot:result.firstTurnSlot,
    match:{actions:result.actions,turns:result.turns,winner:result.winner,
      prizesRemaining:result.prizesRemaining,endReason:result.endReason,
      finished:result.finished,actionCounts:result.actionCounts},
    decisionTrace:result.decisionTrace,
    copycatTurnStartEvidence:result.copycatTurnStartEvidence||[],
    liveRootActions:recorded.actionTrace.map(event=>({
      step:event.step,action:event.action,before:event.before,after:event.after,
      ...(event.typedAction?{typedAction:event.typedAction}:{}),
      ...(event.pendingPrompt?{pendingPrompt:event.pendingPrompt}:{}),
      ...(event.promptReplayAction?{promptReplayAction:event.promptReplayAction}:{}),
      ...(event.parameters?{parameters:event.parameters}:{})
    })),
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
