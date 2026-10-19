'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withRank8AutonomousBoostShake} =
  require('./rank8-boostshake-autonomous-policy.cjs');
const {withHoodGarbotoxinRecoveryAutonomy} =
  require('./hood-garbotoxin-recovery-autonomy.cjs');

const BASE=20261019, RANK=8, REPEATS=8, ACTION_CAP=200;

/**
 * The exact 16-deal source frame publicly registered by Agent 15 before
 * any results in rank8-hood-pressure-prospective-registration.md.
 * Both policies are tried against the same deal; arms are correlated.
 * @returns {Array<{repeat:number,seed:number,candidateSeat:0|1,sourceSeat:0|1}>}
 */
function fixedFrame() {
  const entries=[];
  for(let repeat=0;repeat<REPEATS;repeat++) {
    const pair=deriveSlotSeeds(BASE,'pilot',RANK,repeat);
    entries.push({repeat,seed:pair.A,candidateSeat:0,sourceSeat:1});
    entries.push({repeat,seed:pair.B,candidateSeat:1,sourceSeat:0});
  }
  return entries;
}

/** @param {unknown} obj */
function sha(obj) {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

/**
 * Preserve the exact source game's reported terminal outcome separately
 * from the meaningful-decision hash (which is not a full Store replay).
 * @param {object} game
 */
function summarizeGame(game) {
  assert.equal(game.verifiedByDrawLog,true,'Real first-player proof missing');
  assert.ok([0,1].includes(game.firstTurnSlot));
  return {
    actualFirstTurnSlot:game.firstTurnSlot,
    engineFinished:game.finished===true,
    engineWinnerDiagnosticOnly:game.finished?game.winner:null,
    enginePrizesDiagnosticOnly:game.prizesRemaining,
    rootActions:game.actions,
    meaningfulDecisionCount:(game.decisionTrace||[]).length,
    meaningfulDecisionTraceSha256:sha(game.decisionTrace||[]),
    qualifiedCompetitiveGame:false
  };
}

/**
 * Enforce shared source deal and no-intervention control equivalence.
 * This is a local mechanical check, never a competitive evaluation.
 * @param {object} a Original game.
 * @param {object} b Counterfactual.
 * @param {object} sourceAudit Conditional source policy audit.
 * @param {object} candidateAudit Conditional challenger policy audit.
 */
function auditPair(a,b,sourceAudit,candidateAudit) {
  const sameProvenStart=a.verifiedByDrawLog===true &&
    b.verifiedByDrawLog===true &&
    a.firstTurnSlot===b.firstTurnSlot;
  const sameResolved60=JSON.stringify(a.deckHashes)===
    JSON.stringify(b.deckHashes);
  const sourceTriggered=sourceAudit.attempted===true;
  const candidateTriggered=candidateAudit.triggered===true;
  const noPolicyTriggered=!sourceTriggered&&!candidateTriggered;
  const noOpMeaningfulDecisionsEqual=JSON.stringify(a.decisionTrace||[])===
    JSON.stringify(b.decisionTrace||[]);
  return {sameProvenStart,sameResolved60,sourceTriggered,
    candidateTriggered,noPolicyTriggered,noOpMeaningfulDecisionsEqual,
    noOpParityViolation:noPolicyTriggered&&!noOpMeaningfulDecisionsEqual};
}

/** Complete registered panel, retaining both arms, exceptions and no-ops. */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {runMatch,initializeCards}=require('./headless.cjs');
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(row=>row.rank===RANK);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  initializeCards();
  const rows=[];
  for(const item of fixedFrame()) {
    const request={
      deckA:item.sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:item.sourceSeat===1?source.cards:plan.candidate.cards,
      seed:item.seed,maxActions:ACTION_CAP,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true,
      captureDecisionTrace:true,
      label:'rank8-hood-frozen-prospective:'+item.repeat+':'+item.candidateSeat
    };
    try {
      const baseline=runMatch(request);
      const conditional=withRank8AutonomousBoostShake(item.sourceSeat,()=>
        withHoodGarbotoxinRecoveryAutonomy(item.candidateSeat,()=>
          runMatch(request)));
      const game=conditional.result.result;
      const sourceAudit=conditional.policyAudit;
      const candidateAudit=conditional.result.policyAudit;
      assert.equal(baseline.seed,item.seed);
      assert.equal(game.seed,item.seed);
      assert.deepEqual(baseline.deckHashes,game.deckHashes);
      const pair=auditPair(baseline,game,sourceAudit,candidateAudit);
      rows.push({
        ...item,status:'engine-observed',baseline:summarizeGame(baseline),
        conditional:summarizeGame(game),pair,
        sourceAttempted:sourceAudit.attempted,
        sourceCompleted:sourceAudit.completed,
        sourceAbort:sourceAudit.aborted,
        sourceVerifiedEquippedGarbodor:sourceAudit.verifiedEquippedGarbodor,
        sourcePolicyEvents:sourceAudit.events,
        candidateTriggered:candidateAudit.triggered,
        candidateVerifiedEffect:candidateAudit.successfulEffect,
        candidatePhaseAtEnd:candidateAudit.phaseAtEnd,
        candidatePolicyEvents:candidateAudit.events,
        qualifiedCompetitiveGame:false
      });
    } catch(error) {
      rows.push({...item,status:'engine-exception',
        error:String(error?.stack||error),qualifiedCompetitiveGame:false});
    }
  }
  return {
    schema:'rank8-hood-pressure-registered-v1',registeredBy:'Agent15',
    registration:'results/aichi-2026/rank8-hood-pressure-prospective-registration.md',
    seedBase:BASE,seedProtocol:'aichi-decorrelated-slots-v3',
    repeats:REPEATS,actionCap:ACTION_CAP,sourceRank:RANK,
    engine:'twinleafgg/'+plan.engineRevision,
    sourceResolved60Sha256:sha(source.cards),
    candidateResolved60Sha256:sha(plan.candidate.cards),
    frame:fixedFrame(),attempted:rows.length,
    observed:rows.filter(r=>r.status==='engine-observed').length,
    exceptions:rows.filter(r=>r.status==='engine-exception').length,
    trueSourceFirst:rows.filter(r=>r.status==='engine-observed'&&
      r.conditional.actualFirstTurnSlot===r.sourceSeat).length,
    sourcePolicyAttempts:rows.filter(r=>r.sourceAttempted).length,
    sourcePolicyCompletions:rows.filter(r=>r.sourceCompleted).length,
    sourceEquippedGarbodor:rows.filter(r=>r.sourceVerifiedEquippedGarbodor).length,
    candidateReplyAttempts:rows.filter(r=>r.candidateTriggered).length,
    candidateVerifiedEffects:rows.filter(r=>r.candidateVerifiedEffect).length,
    noOpParityViolations:rows.filter(r=>r.pair?.noOpParityViolation).length,
    startOrDeckViolations:rows.filter(r=>r.status==='engine-observed'&&
      (!r.pair.sameProvenStart||!r.pair.sameResolved60)).length,
    qualifiedCompetitiveGames:0,rows,
    limitations:'Two correlated arms per true physical deal, limited weak bot policies and 200-root-action cap; print, rule, clock and replay qualification outstanding.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={BASE,RANK,REPEATS,ACTION_CAP,fixedFrame,sha,
  summarizeGame,auditPair,run};
