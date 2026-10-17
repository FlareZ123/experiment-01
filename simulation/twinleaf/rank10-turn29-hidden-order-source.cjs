'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withTurn28CopycatShredFork}=require('./mimikyu-turn28-shred-fork.cjs');
const {withTurn29DeckOrderProbe}=require('./rank10-turn29-hidden-order-policy.cjs');
const {sourceZoneSnapshot,zoneSnapshotDigest}=require('./source-zone-checkpoint.cjs');

/** Single source decision counterfactual: alter only unseen deck order while scoring. */
function main(){
 const field=resolveManifestFile(path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json'),{
  allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 const byRank=new Map(field.decks.map(d=>[d.rank,d]));
 const first=byRank.get(1),tenth=byRank.get(10);
 assert.ok(first?.playableUnderEngine&&tenth?.playableUnderEngine);
 initializeCards();
 const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const {Store}=require(path.join(output,'game/store/store'));
 const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
 const {AttackAction}=require(path.join(output,'game/store/actions/game-actions'));
 const {ResolvePromptAction}=require(path.join(output,'game/store/actions/resolve-prompt-action'));
 const types={Store,Bot:SimpleTacticsAi,AttackAction,ResolvePromptAction};
 const request={deckA:tenth.cardIds,deckB:first.cardIds,
  seed:4246551499,maxActions:350,captureDecisionTrace:true,
  captureCopycatTurnStartSeat:1,strictPromptValidation:true,
  forestSealSearchCorrection:true,supporterDecisionCorrection:true,
  doubleDragonRecovery:true,isolatePolicyRandomness:true,
  postSuperAliasRepairIsolation:true,mimikyuApexCopycatCompatibility:true,
  mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:1,
  mimikyuTurn27SetupSeat:1,mimikyuDeclaredHistoryCorrection:true,
  regidragoDeclaredHistoryCorrection:true,passClearsLastAttackCorrection:true};
 const run=reverse=>withStoreDispatchTranscript(Store,()=>
  withTurn29DeckOrderProbe(Store,SimpleTacticsAi,()=>
   withTurn28CopycatShredFork(types,()=>runMatch(request),{
    forceShred:true,rootActionOrdinal:215,policyRngAlignDraws:20
   }),{reverse,digest:s=>zoneSnapshotDigest(sourceZoneSnapshot(s))}),
  {liveStoreOnly:true,sourceZoneEveryDispatch:true});
 const control=run(false),changed=run(true);
 const baseline=control.result.decisions[0],variant=changed.result.decisions[0];
 assert.ok(baseline&&variant,'Both arms must encounter one genuine source decision');
 assert.deepEqual(control.actionTrace.slice(0,231),
  changed.actionTrace.slice(0,231),'Physical action prefix differs before fork');
 assert.equal(control.actionTrace[231].action,'RetreatAction');
 assert.equal(baseline.sourceZoneBefore,
  'a512b03755dddc50ed62022fcb075ac54e7198e202150e1d4db8341405525b86');
 assert.equal(variant.sourceZoneBefore,baseline.sourceZoneBefore);
 assert.equal(baseline.sourceZoneUnchanged,true);
 assert.equal(variant.sourceZoneUnchanged,true);
 const originalGame=control.result.result.result;
 assert.equal(originalGame.finished,true);
 assert.equal(originalGame.winner,1);
 return {
  schema:'rank10-postshred-opponent-hidden-order-decision-sensitivity-v1',
  seed:request.seed,sourceRootDecisionOrdinal:231,
  baseline,unseenDeckOrderReversal:variant,
  selectedActionChanged:JSON.stringify([baseline.action,baseline.actionParameters])!==
   JSON.stringify([variant.action,variant.actionParameters]),
  policyRandomDrawsEqual:baseline.rngDraws===variant.rngDraws,
  sourcePrefixEqual:true,
  baselineGame:{winner:originalGame.winner,prizes:originalGame.prizesRemaining},
  variantGame:{winner:changed.result.result.result.winner,
   prizes:changed.result.result.result.prizesRemaining},
  sourceReplayMechanicsVerified:false,qualifiedForCompetitiveInference:false,
  limitation:'Reordered the acting players unseen own-deck cards only during a real bot proposal; physical card order restored before dispatch. A single decision audit does not prove policy fairness or strength.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
