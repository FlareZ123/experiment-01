'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('./headless.cjs');
const {observeAttackScores,gameSummary}=require('./attack-pass-score-diagnostic.cjs');

/** Revisit the exact Aichi rank10 v3 physical-A seed and fixed candidate inventories. */
function runRank10() {
  const flags={allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true};
  const candidates=[
    {id:'champion-reference',value:1},
    {id:'hood-shield-v1',value:JSON.parse(fs.readFileSync(
      path.resolve(__dirname,'../../results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'))}
  ];
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);
  const output=[];
  for(const candidate of candidates) {
    const resolved=planAichi(candidate.value,flags);
    const opponent=resolved.opponents.find(o=>o.rank===10);
    assert.ok(resolved.candidate.cards?.length===60);
    assert.ok(opponent?.cards?.length===60);
    const request={
      deckA:resolved.candidate.cards,deckB:opponent.cards,
      label:'Aichi comparative diagnostic pilot:10:0:'+candidate.id+':A',
      seed,maxActions:600,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      captureAttackPassProbes:true,prototypeSafeSimulatorIsolation:false,
      leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true
    };
    const baseline=runMatch(request);
    const observed=observeAttackScores(()=>runMatch(request));
    assert.deepEqual(gameSummary(observed.game),gameSummary(baseline),
      'Score instrumentation changed the source-deck engine result');
    const acceptedPasses=observed.passes.filter(x=>
      x.energy.some(e=>e.includes('Double Dragon Energy')));
    output.push({
      candidate:candidate.id,seed,sourceEngine:baseline.engine,
      opponentRank:10,physicalCandidateSeat:0,
      firstTurnSlot:baseline.firstTurnSlot,
      finished:baseline.finished,winner:baseline.winner,
      attacksBySeat:baseline.attackTrace.reduce((count,event)=>{
        count[event.seat]=(count[event.seat]||0)+1;
        return count;
      },[0,0]),
      prizesRemaining:baseline.prizesRemaining,
      koraidonPassCount:observed.passes.length,
      withDoubleDragon:acceptedPasses,
      allKoraidonPasses:observed.passes
    });
  }
  return {analysis:'v3 rank10 Koraidon passive AttackTactic score capture',
    sourceRevision:'see manual CI head',qualifiedCompetitiveGames:0,output};
}
if(require.main===module)console.log(JSON.stringify(runRank10(),null,2));
module.exports={runRank10};
