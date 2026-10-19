'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {scheduledArms,assertManifest,executeArm}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');

const TRIAL='6:0:A:new-moon-lockbreaker-v1';
const SOURCE_SHA='9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913';

/** @param {unknown} value @returns {string} */
function sha(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * All candidate observations are captured post-choice. Only its own hand
 * and the public board are emitted; detached attack probes are diagnostics.
 * @param {object} game An unchanged pinned Store game with trace.
 * @param {number} candidateSeat
 * @returns {object}
 */
function summarizeCandidatePass(game,candidateSeat) {
  assert.ok([0,1].includes(candidateSeat));
  const own=game.decisionTrace.filter(x=>
    x.playerSlot===candidateSeat && x.turnBefore===3);
  const chosen=own.filter(x=>x.action==='PassTurnAction');
  assert.equal(chosen.length,1,'Expected exactly one first-response Pass');
  const row=chosen[0];
  const probe=row.attackPassProbe??null;
  return {
    firstResponseActions:own.map(x=>({
      ordinal:x.actionOrdinal,action:x.action,
      card:x.card??null,attack:x.attack??null,
      selectedPrintings:x.cardSelection?.selectedCards??null,
      ownerHand:x.decisionHandBefore?.ownHandPrintings??null,
      opponentHandCount:x.decisionHandBefore?.opponentHandSize??null
    })),
    passOrdinal:row.actionOrdinal,
    ownerHandAtPass:row.decisionHandBefore?.ownHandPrintings??null,
    opponentHandCount:row.decisionHandBefore?.opponentHandSize??null,
    publicBoardAtPass:row.publicBoardBeforePass??null,
    printedBasicEnergyAudit:row.printedBasicEnergyBeforePass??null,
    alreadyChosenPassAttackProbe:probe,
    probeLimit:'Only the printed/Tool attacks visible on Active were attempted after policy selected Pass. Copied attacks and complete possible moves are not certified.',
    gameEndingUnqualified:true
  };
}

/** @returns {object} A single retrospective Store reproduction, never a win-rate trial. */
function run() {
  assertManifest();
  const trial=scheduledArms().find(x=>x.id===TRIAL);
  assert.ok(trial);
  assert.equal(trial.seed,407516727);
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const candidate=loadNewMoonCandidate();
  const prepared=new Map([['new-moon-lockbreaker-v1',{plan:planAichi(
    {label:'new-moon-lockbreaker-v1',cards:candidate.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })}]]);
  assert.equal(prepared.get('new-moon-lockbreaker-v1').plan.opponents.find(x=>x.rank===6)?.cards.length,60);
  const headless=require('../twinleaf/headless.cjs');
  const realRun=headless.runMatch;
  let tracedGame=null;
  let farewellPassObservations=null;
  const {withRank6UnownFarewellPassProbe}=
    require('../twinleaf/newmoon-rank6-pass-farewell-observer.cjs');
  headless.runMatch=(request)=>{
    const wrapped=withRank6UnownFarewellPassProbe(
      ()=>realRun({...request,captureAttackPassProbes:true}),
      {seat:0,turn:3});
    tracedGame=wrapped.result;
    farewellPassObservations=wrapped.observations;
    return tracedGame;
  };
  let record;
  try {
    record=executeArm(trial,prepared);
  } finally {
    headless.runMatch=realRun;
  }
  assert.ok(tracedGame);
  assert.equal(record.id,TRIAL);
  assert.equal(record.engineFirstTurnSlot,0);
  assert.equal(record.sourcePolicyAudit.turn2.completed,true);
  assert.equal(record.sourceActuallyFirst,false);
  // Fail closed if detached attack probes change even one executed root action.
  const traceDigest=sha(tracedGame.rootActionLedger);
  assert.equal(traceDigest,SOURCE_SHA,'Probe was not source-game noninterfering');
  assert.equal(tracedGame.actions,240);
  assert.equal(farewellPassObservations?.length,1);
  return {
    schema:'agent25-retrospective-rank6-newmoon-first-pass-v1',
    originalCompiledRun:39193837824,
    originalArtifactId:12161805529,
    trialId:TRIAL,seed:trial.seed,sourceRank:6,
    candidateId:trial.candidateId,candidateSeat:record.candidateSeat,
    realSourceFirst:record.sourceActuallyFirst,
    sourceCompletedTurn2AttackPlan:record.sourcePolicyAudit.turn2.completed,
    sourcePolicyEvents:record.sourcePolicyAudit.turn2.events,
    sourceRootLedgerMatchesArchived:true,
    originalAndReplayedRootLedgerSha256:traceDigest,
    firstCandidateTurn3:summarizeCandidatePass(tracedGame,record.candidateSeat),
    legalFarewellCounterfactual:farewellPassObservations[0],
    sourceDeclarations:record.sourceAttackDeclarations,
    candidateDeclarations:record.candidateAttackDeclarations,
    actions:tracedGame.actions,turns:tracedGame.turns,
    ending:record.status,prizesRemaining:record.prizesRemaining,
    competitiveQualifiedGames:0,
    caveat:'One retrospectively selected frozen source deal; read-only attack announcement probe cannot establish competitive performance or full information-set safe policy.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,summarizeCandidatePass};
