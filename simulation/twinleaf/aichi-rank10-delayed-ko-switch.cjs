'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withRank10SourceKoraidonFork}=require('./rank10-koraidon-source-attack-fork.cjs');
const {withRank10PaleMoonWindow}=require('./rank10-pale-moon-window.cjs');
const {withPendingEndTurnSwitchCleanup}=require('./pending-end-turn-switch-cleanup.cjs');
const engine=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

/**
 * One exact published rank-10 source game with the same Koraidon retreat
 * against two engine semantics. No deck alteration or staged game state.
 * Extra runner instrumentation is fully restored after each match.
 */
function main() {
  initializeCards();
  const {AttackAction,RetreatAction}=engine('game/store/actions/game-actions');
  const Store=engine('game/store/store').Store;
  const Bot=engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Player=engine('game/store/state/player').Player;
  const types={Store,Bot,AttackAction,RetreatAction};
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);
  const candidates=[
    {id:'champion-reference',value:1},
    {id:'hood-shield-v1',value:JSON.parse(fs.readFileSync(path.resolve(__dirname,
      '../../results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'))}
  ];
  const findings=[];
  for(const candidate of candidates) {
    const field=planAichi(candidate.value,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
    const opponent=field.opponents.find(d=>d.rank===10);
    assert.ok(field.candidate.cards?.length===60&&opponent?.cards?.length===60);
    const request={
      deckA:field.candidate.cards,deckB:opponent.cards,
      label:'pilot:10:0:'+candidate.id+':A',seed,maxActions:600,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      captureAttackPassProbes:true,prototypeSafeSimulatorIsolation:false,
      leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
      entryDrawLockCorrection:true
    };
    const run=corrected=>withRank10PaleMoonWindow(Store,()=>{
      const execute=()=>withRank10SourceKoraidonFork(types,
        ()=>runMatch(request),{forceRetreat:true});
      return corrected?withPendingEndTurnSwitchCleanup({Store,Player},execute):
        {result:execute(),removedFromRoot:0,removedFromSimulatedStores:0,rootEvents:[]};
    });
    const original=run(false);
    const repaired=run(true);
    const left=original.result.result,right=repaired.result.result;
    assert.equal(left.sourceDecisions.length,1);
    assert.equal(right.sourceDecisions.length,1);
    assert.equal(left.sourceDecisions[0].stateDigest,
      right.sourceDecisions[0].stateDigest,
      'Original and corrected source State differ before Koraidon retreat');
    assert.deepEqual(left.result.deckHashes,right.result.deckHashes);
    assert.equal(original.events.filter(e=>e.action==='RetreatAction').length,1);
    assert.equal(repaired.events.filter(e=>e.action==='RetreatAction').length,1);
    findings.push({
      candidate:candidate.id,
      predecisionSourceDigest:left.sourceDecisions[0].stateDigest,
      original:{winner:left.result.winner,prizes:left.result.prizesRemaining,
        window:original.events},
      corrected:{winner:right.result.winner,prizes:right.result.prizesRemaining,
        window:repaired.events,
        removedRootPending:repaired.result.removedFromRoot,
        removedSpeculativePending:repaired.result.removedFromSimulatedStores,
        rootEvents:repaired.result.rootEvents}
    });
  }
  return {
    schema:'rank10-pale-moon-switch-pending-source-v1',
    sourceRank:10,seed,engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    paperRuleReviewRequired:true,qualifiedForCompetitiveInference:false,findings
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
