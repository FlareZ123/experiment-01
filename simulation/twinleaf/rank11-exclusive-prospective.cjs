'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {withRank11ExclusiveOpeners}=require('./rank11-exclusive-openers.cjs');
const {exclusiveSeedFrame,seedFrameDigest}=
  require('./rank11-exclusive-prospective-seeds.cjs');
const {classifyTrial}=require('./rank11-exclusive-trial-classification.cjs');
const {withSameTargetAttachEnergySelection}=
  require('./same-target-attach-energy-hook.cjs');
const registration=require('../../results/aichi-2026/registrations/rank11-exclusive-openers-v1-20261019.json');
const candidateManifest=require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

const ACTION_CAP=48;

/** @returns {object} All prespecified source deals; errors remain in denominator. */
function run({sameTargetCorrection=false}={}) {
  assert.equal(typeof sameTargetCorrection,'boolean');
  const frame=exclusiveSeedFrame();
  assert.equal(frame.length,registration.experiment.attempts);
  assert.equal(seedFrameDigest(frame),registration.randomness.seedFrameSha256);
  assert.equal(registration.experiment.maxRootActions,ACTION_CAP);
  assert.equal(candidateManifest.canonical_id_count_sha256,
    registration.candidate.canonicalIdCountSha256);
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.engineRevision,registration.engine);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const rows=[];
  for(const {sourceSeat,repeat,seed} of frame) {
    try {
      const play=()=>withRank11ExclusiveOpeners(sourceSeat,()=>runArm(
        candidate,source.cards,1-sourceSeat,seed,ACTION_CAP,false
      ));
      const patch=sameTargetCorrection?
        withSameTargetAttachEnergySelection(play):null;
      const observed=patch?patch.result:play();
      const game=observed.result;
      const audit=observed.policyAudit;
      const classification=classifyTrial(audit,game,sourceSeat,ACTION_CAP);
      rows.push({sourceSeat,repeat,seed,
        sourceVerifiedByDrawLog:game.verifiedByDrawLog,
        actualFirstSeat:game.firstTurnSlot,
        ...classification,
        selectedRoute:audit.selected?.route??null,
        selectedTool:audit.selected?.tool??null,
        directActions:audit.direct.actions,
        heldActions:audit.held.selectedActions,
        directNextTurnLockWitness:audit.direct.nextTurnLockWitness,
        heldNextTurnLockWitness:audit.held.nextTurnLockWitness,
        competing:audit.competing,
        botSameTargetRepairCount:patch?.audit.repairedPromptCount??0,
        botSameTargetRepairEvents:patch?.audit.events??[],
        gameActionCount:game.actions,
        gameTurnCount:game.turns,engineFinished:game.finished,
        diagnosticOnlyEngineWinner:game.winner,
        diagnosticOnlyPrizesRemaining:game.prizesRemaining,
        qualifiedCompetitiveGame:false});
    } catch(error) {
      rows.push({sourceSeat,repeat,seed,
        resultClass:'engine-exception',
        errorMessage:error instanceof Error?error.message:String(error),
        qualifiedCompetitiveGame:false});
    }
  }
  const group=(prop,values)=>Object.fromEntries(values.map(value=>[
    String(value),rows.filter(r=>r[prop]===value).length
  ]));
  const sourceFirst=rows.filter(r=>r.sourceActuallyFirst===true).length;
  const sourceSecond=rows.filter(r=>r.sourceActuallyFirst===false).length;
  const verified=rows.filter(r=>r.sourceVerifiedByDrawLog===true).length;
  const exceptions=rows.filter(r=>r.resultClass==='engine-exception').length;
  const result={
    schema:registration.schema,registrationPath:
      'results/aichi-2026/registrations/rank11-exclusive-openers-v1-20261019.json',
    preregisteredSeedFrameSha256:registration.randomness.seedFrameSha256,
    sourceRank:11,sourcePrintedIdentitySha256:
      registration.opponent.sourcePrintedIdentitySha256,
    candidateIdCountSha256:registration.candidate.canonicalIdCountSha256,
    candidateStatus:registration.candidate.status,
    pinnedTwinleaf:registration.engine,
    actualSourceFrame:frame.length,
    sameTargetCorrectionApplied:sameTargetCorrection,
    sameTargetCorrectionStatus:sameTargetCorrection?
      'post-registered engine-bot-failure repair; exploratory rerun of all original seeds' :
      'originally preregistered unchanged baseline; abort on any engine exception',
    actualAttempted:rows.length,sourceFirst,sourceSecond,
    sourceStartVerified:verified,exceptions,
    resultClassCounts:group('resultClass',
      ['no-route','direct-completed','direct-aborted','direct-unresolved',
        'held-seal-completed','held-seal-aborted','held-seal-unresolved',
        'engine-exception']),
    byPhysicalSeat:group('sourceSeat',[0,1]),
    ownerLineCompleted:rows.filter(row=>row.completed===true).length,
    botSameTargetRepairs:rows.reduce(
      (total,row)=>total+(row.botSameTargetRepairCount??0),0),
    competingClaimAttempts:rows.reduce(
      (total,row)=>total+(row.competingClaimAttempts??0),0),
    cappedWithoutTerminal:rows.filter(row=>row.actionCapped===true).length,
    competitiveQualifiedGames:0,
    caveat:'Authenticated opening-policy screen at 48 actions; incomplete card/rules and both-player policy quality. All engine terminal results excluded from win rates.',
    rows
  };
  assert.equal(rows.length,registration.experiment.attempts);
  assert.equal(result.sourceFirst+result.sourceSecond+
    rows.filter(r=>r.resultClass==='engine-exception').length,rows.length);
  return result;
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(run({
    sameTargetCorrection:process.env.SAME_TARGET_ENERGY_CORRECTION==='true'
  }),null,2)+'\n');
}
module.exports={run};
