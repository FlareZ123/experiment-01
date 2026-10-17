'use strict';

const assert=require('node:assert/strict');
const {withRootCardHistoryRepair}=require('./root-bot-history-repair.cjs');
const {firstDifference}=require('./rank10-source-branch-transcript.cjs');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withSourceContinuity,withRootPolicyMutationAudit}=require('./source-state-continuity.cjs');

/** Two official-source physical lists and one fixed game seed. */
function main() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const champion=byRank.get(1),regidrago=byRank.get(10);
  assert.ok(champion.playableUnderEngine && regidrago.playableUnderEngine);
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const {SimpleTacticsAi}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai'));
  const {Card}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/card/card'));
  const common={
    deckA:regidrago.cardIds,deckB:champion.cardIds,
    seed:4246551499,maxActions:350,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const findings=[];
  for (const mode of ['pinned','post-super-reconciled']) {
    const request={...common,...(mode==='post-super-reconciled'
      ? {postSuperAliasRepairIsolation:true}:{})};
    const baseline=runMatch(request);
    const observed=withSourceContinuity(Store,()=>
      withRootPolicyMutationAudit(Store,SimpleTacticsAi,()=>runMatch(request)));
    assert.deepEqual(observed.result.result,baseline,
      'Read-only source-State observer changed game in '+mode);
    assert.equal(observed.liveDispatches,observed.result.result.actions+2,
      'Live dispatch count did not match actual root actions in '+mode);
    findings.push({
      mode,seed:request.seed,sourceRanks:[10,1],
      engine:baseline.engine,actions:baseline.actions,
      liveDispatches:observed.liveDispatches,
      ignoredOtherStoreDispatches:observed.otherDispatches,
      stateChangesBetweenActions:observed.discontinuities.length,
      policyMutations:observed.result.rootPolicyStateMutations,
      firstChanges:observed.discontinuities.slice(0,12),
      engineWinner:baseline.winner,
      qualification:'partial-State diagnostic only; no competitive win-rate evidence'
    });
    if (mode === 'post-super-reconciled') {
      for (const gap of observed.discontinuities) {
        process.stderr.write('[rank10-continuity-gap] '+JSON.stringify({
          afterActionOrdinal:gap.afterActionOrdinal,
          previousAction:gap.previousAction,
          beforeActionOrdinal:gap.beforeActionOrdinal,
          nextAction:gap.nextAction,
          firstMismatch:gap.firstMismatch,
          cardHistoryMismatch:gap.cardHistoryMismatch
        })+'\n');
      }
    }
  }
  return {schema:'agent1-rank10-continuity-v1',
    sourceListsUnchanged:true,observationNoninterfering:true,
    qualifiedForCompetitiveInference:false,findings};
}
if (require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
