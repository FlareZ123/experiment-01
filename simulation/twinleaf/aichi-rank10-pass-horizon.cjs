'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withKoraidonPassScore}=require('./koraidon-pass-score-horizon.cjs');
const {gameSummary}=require('./attack-pass-score-diagnostic.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=relative=>require(path.join(root,relative));
function main() {
  initializeCards();
  const types={
    Store:engine('game/store/store').Store,
    AttackTactic:engine('simple-bot/simple-tactics/attack-tactic').AttackTactic,
    PassTurnAction:engine('game/store/actions/game-actions').PassTurnAction
  };
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);
  const candidates=[
    {id:'champion-reference',value:1},
    {id:'hood-shield-v1',value:JSON.parse(fs.readFileSync(path.resolve(__dirname,
      '../../results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'))}
  ];
  const findings=[];
  for(const candidate of candidates) {
    const pair=planAichi(candidate.value,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
    const opponent=pair.opponents.find(d=>d.rank===10);
    assert.ok(opponent?.cards?.length===60&&pair.candidate.cards?.length===60);
    const request={
      deckA:pair.candidate.cards,deckB:opponent.cards,
      label:'Aichi comparative diagnostic pilot:10:0:'+candidate.id+':A',
      seed,maxActions:600,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      captureAttackPassProbes:true,prototypeSafeSimulatorIsolation:false,
      leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true
    };
    const control=runMatch(request);
    const probe=withKoraidonPassScore(types,()=>runMatch(request));
    findings.push({
      candidate:candidate.id,firstTurnSlot:control.firstTurnSlot,
      baseline:{winner:control.winner,turns:control.turns,finished:control.finished},
      probed:{winner:probe.result.winner,turns:probe.result.turns,finished:probe.result.finished},
      completeGameSummaryEqual:JSON.stringify(gameSummary(control))===
        JSON.stringify(gameSummary(probe.result)),
      observations:probe.observations
    });
  }
  return {schema:'source-rank10-endturn-pass-horizon-v1',sourceSeed:seed,
    sourceRank:10,physicalCandidateSeat:0,
    archivedAttackScoreReference:'results/twinleaf/attack-score-vs-declaration.md',
    qualifiedForCompetitiveInference:false,
    policyRngIntrusiveProbe:true,findings};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
