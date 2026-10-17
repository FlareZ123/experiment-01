'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withRootPolicyStoreGraphAudit}=
  require('./root-policy-store-graph-audit.cjs');

/**
 * Audit live root Store effects of actual Regidrago/Shadow Rider policy calls.
 * All cards and Prize positions arise from the seeded, published physical decks.
 * The observer never feeds hidden information into either bot's decisions.
 */
function main() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const champion=byRank.get(1),regidrago=byRank.get(10);
  assert.ok(champion?.playableUnderEngine&&regidrago?.playableUnderEngine);
  initializeCards();
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const request={
    deckA:regidrago.cardIds,deckB:champion.cardIds,
    seed:4246551499,maxActions:350,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,doubleDragonArchiveV3:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const control=runMatch(request);
  const observed=withRootPolicyStoreGraphAudit(Store,SimpleTacticsAi,
    ()=>runMatch(request));
  assert.deepEqual(observed.result,control,
    'Passive Store graph observer altered complete source match outcome');
  assert.ok(observed.rootPolicyCalls>0,'No actual root policy decision was audited');
  assert.ok(observed.graphContract,'Store graph fingerprint was unavailable');
  return {
    schema:'rank10-root-policy-store-graph-audit-v1',
    sourceRanks:[10,1],candidatePhysicalSeat:1,
    seed:request.seed,actions:control.actions,
    rootPolicyCalls:observed.rootPolicyCalls,
    speculativePolicyCalls:observed.otherPolicyCalls,
    fullGameSummaryUnchanged:true,
    graphContract:observed.graphContract,
    mutationCount:observed.changes.length,
    mutations:observed.changes,
    graphScope:'own-data-only, excluding closure environments and inherited method identity',
    sourceReplayMechanicsVerified:false,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={main};
