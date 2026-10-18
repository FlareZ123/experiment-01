'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {seedFrame}=require('./rank11-source-seeds.cjs');
const {withRank11HeldSeal}=require('./rank11-held-seal-policy.cjs');
const candidateManifest=require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

/**
 * Fixed seed source deals with all no-opportunities retained. The 110-action
 * diagnostic cap is too short to infer full-game strength.
 * @param {number} trialCount Number of distinct seeds.
 * @param {0|1} sourceSeat Published rank11 physical seat.
 * @returns {object}
 */
function run(trialCount=32,sourceSeat=0) {
  assert.ok(Number.isInteger(trialCount)&&trialCount>=1&&trialCount<=128);
  assert.ok(sourceSeat===0||sourceSeat===1);
  const opponent=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const seeds=seedFrame(trialCount,'decorrelated-v2');
  const rows=[];
  for (let i=0;i<seeds.length;i++) {
    const seed=seeds[i];
    const args=[candidate,opponent.cards,1-sourceSeat,seed,110,true,
      false,false,false];
    const observed=withRank11HeldSeal(sourceSeat,()=>runArm(...args));
    const game=observed.result;
    assert.equal(game.verifiedByDrawLog,true,'Must be actual source deal');
    assert.ok(game.firstTurnSlot===0||game.firstTurnSlot===1);
    const policy=observed.policyAudit;
    const actions=policy.opportunityTurn===null?[]:
      game.rootActionLedger.filter(row=>row.playerSlot===sourceSeat&&
        row.turnBefore===policy.opportunityTurn);
    rows.push({
      trial:i,seed,sourcePhysicalSeat:sourceSeat,actualFirstSeat:game.firstTurnSlot,
      sourceStartedFirst:game.firstTurnSlot===sourceSeat,
      frozenCandidateHash:candidateManifest.canonical_id_count_sha256,
      actions:game.actions,turns:game.turns,gameFinished:game.finished,
      engineWinner:game.winner,prizesRemaining:game.prizesRemaining,
      opportunityDetected:policy.opportunityTurn!==null,
      policy,
      sourceRootActionsForOpportunity:actions.map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        action:row.action,card:row.card??null,ability:row.ability??null,
        pendingPrompt:row.pendingPrompt??null
      })),
      competitiveQualified:false
    });
  }
  return {
    schema:'rank11-held-seal-actual-source-policy-frame-v1',
    scope:'bounded real source-dealt mechanical policy trials, not competitive games',
    sourceRank:11,sourcePhysicalSeat:sourceSeat,trialCount,
    sourceCardList:'published Aichi 2026 rank11 printed 60',
    candidateList:'frozen New Moon Lockbreaker English proxy 60',
    frozenCandidateHash:candidateManifest.canonical_id_count_sha256,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seedFrame:'aichi-decorrelated-slots-v3 date 20261018 rank11 A seeds',
    gameActionCap:110,
    sourceFirst:rows.filter(row=>row.sourceStartedFirst).length,
    sourceSecond:rows.filter(row=>!row.sourceStartedFirst).length,
    opportunities:rows.filter(row=>row.opportunityDetected).length,
    completed:rows.filter(row=>row.policy.completed).length,
    aborted:rows.filter(row=>row.policy.aborted).length,
    qualifiedCompetitiveGames:0,rows
  };
}

if(require.main===module) {
  const trials=Number(process.env.TRIALS||'32');
  const seat=Number(process.env.RANK11_SOURCE_SEAT||'0');
  process.stdout.write(JSON.stringify(run(trials,seat),null,2)+'\n');
}
module.exports={run};
