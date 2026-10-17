'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withTurn28CopycatShredFork}=require('./mimikyu-turn28-shred-fork.cjs');
/** Observe the source opponent's own turn after the archived two-Prize KO. */
function auditPostShredOpponent(){
 const field=resolveManifestFile(path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json'),{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 const byRank=new Map(field.decks.map(d=>[d.rank,d]));
 const champion=byRank.get(1),regidrago=byRank.get(10);
 assert.ok(champion?.playableUnderEngine&&regidrago?.playableUnderEngine);
 initializeCards();
 const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const {Store}=require(path.join(root,'game/store/store'));
 const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
 const {AttackAction}=require(path.join(root,'game/store/actions/game-actions'));
 const {ResolvePromptAction}=require(path.join(root,'game/store/actions/resolve-prompt-action'));
 const types={Store,Bot:SimpleTacticsAi,AttackAction,ResolvePromptAction};
 const request={deckA:regidrago.cardIds,deckB:champion.cardIds,
  seed:4246551499,maxActions:350,captureDecisionTrace:true,
  strictPromptValidation:true,forestSealSearchCorrection:true,
  supporterDecisionCorrection:true,doubleDragonRecovery:true,
  isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
  mimikyuApexCopycatCompatibility:true,mimikyuApexTimelessPolicy:true,
  mimikyuApexTimelessPolicySeat:1,mimikyuTurn27SetupSeat:1,
  mimikyuDeclaredHistoryCorrection:true,
  regidragoDeclaredHistoryCorrection:true,passClearsLastAttackCorrection:true};
 const run=seat=>withTurn28CopycatShredFork(types,
  ()=>runMatch({...request,captureCopycatTurnStartSeat:seat}),
  {forceShred:true,rootActionOrdinal:215});
 const opponent=run(0),championView=run(1);
 assert.equal(opponent.shredSelections[0]?.attack,'Shred');
 const withoutPerspective=record=>{
  const {copycatTurnStartEvidence,...other}=record.result;
  return other;
 };
 assert.deepEqual(withoutPerspective(opponent),withoutPerspective(championView));
 const turn29=opponent.result.copycatTurnStartEvidence.find(x=>x.turn===29);
 assert.ok(turn29&&turn29.candidateSeat===0);
 assert.deepEqual(turn29.prizeCounts,[3,2]);
 return {schema:'rank10-source-post-shred-opponent-perspective-v1',
  seed:request.seed,sourceRanks:[10,1],
  sourceOutcomeInvariantUnderTelemetryPerspective:true,
  sourceSelectedShred:opponent.shredSelections[0],
  opponentOwnTurn29Snapshot:turn29,
  opposingTurn29Attacks:opponent.result.attackTrace.filter(x=>x.turn===29&&x.seat===0),
  winner:opponent.result.winner,prizesRemaining:opponent.result.prizesRemaining,
  qualifiedForCompetitiveInference:false};
}
if(require.main===module)console.log(JSON.stringify(auditPostShredOpponent(),null,2));
module.exports={auditPostShredOpponent};
