'use strict';

const assert = require('node:assert/strict');
const {loadCampaignInputs, executeCampaign} = require('./aichi-campaign-runner.cjs');
const {RANK11_AUTONOMOUS_PROFILE, runWithResearchProfile} =
  require('../twinleaf/policy-profiles.cjs');

const CANDIDATES = Object.freeze(['champion-reference', 'new-moon-lockbreaker-v1']);
const RANK = 11;

/**
 * Source-locked fixed-inventory comparison in both physical engine slots.
 * One v3 repetition is an initial integration/negative-exposure diagnostic.
 * A result is not evidence of competitive strength.
 * @returns {object}
 */
function run() {
  const inputs = loadCampaignInputs();
  const original = inputs.campaign;
  assert.equal(original.seedProtocol, 'decorrelated-slots-v3',
    'Source-opponent comparison requires independently derived slot seeds');
  for (const candidateId of CANDIDATES) {
    assert(inputs.campaign.candidateRows.some(candidate => candidate.id === candidateId),
      'Candidate missing from common campaign: ' + candidateId);
  }
  assert(original.pilotRanks.includes(RANK), 'Rank11 must be in shared pilot');
  const ids = CANDIDATES.flatMap(candidateId =>
    ['A', 'B'].map(slot => 'pilot:' + RANK + ':0:' + candidateId + ':' + slot));
  const archive = executeCampaign(inputs, {
    phase: 'pilot', trialIds: ids, maxTrials: ids.length, maxActions: 450,
    captureDecisionTrace: true, expectedPolicyProfile: RANK11_AUTONOMOUS_PROFILE,
    runMatch(request) {
      assert([0, 1].includes(request.rank11SourceSeat),
        'Common runner must explicitly supply the source opponent physical seat');
      return runWithResearchProfile(request, RANK11_AUTONOMOUS_PROFILE);
    }
  });
  assert.deepEqual(archive.selectedTrialIds, ids);
  assert.equal(archive.records.length, 4);
  for (const record of archive.records) {
    assert.equal(record.rank, RANK);
    assert.equal(record.candidateDigest.length, 64);
    assert.equal(record.opponentDigest.length, 64);
    assert.equal(record.observedResearchPolicyProfile, RANK11_AUTONOMOUS_PROFILE);
    assert.equal(record.rank11AutonomousPolicy?.sourceSeat,
      record.candidateEngineSlot === 'A' ? 1 : 0);
  }
  const outcomes = archive.records.map(record => ({
    trialId:record.trialId, candidateId:record.candidateId,
    candidateDigest:record.candidateDigest, opponentDigest:record.opponentDigest,
    seed:record.seed, candidateEngineSlot:record.candidateEngineSlot,
    actualStartingOrder:record.candidateTrueTurn, firstTurnProof:record.firstTurn,
    status:record.status, sourcePolicyAudit:record.rank11AutonomousPolicy,
    winnerObservedByEngine:record.observedWinnerIndex,
    observedFinished:record.observedFinished,
    actions:record.actionCount, turns:record.turns, endReason:record.endReason,
    // Historical native-only dispatch count retained for compatibility.
    candidateAttacks:record.attackTrace.filter(action =>
      action.seat === (record.candidateEngineSlot === 'A' ? 0 : 1)),
    opponentAttacks:record.attackTrace.filter(action =>
      action.seat === (record.candidateEngineSlot === 'A' ? 1 : 0)),
    // Null denotes missing telemetry; [] denotes a witnessed zero.
    attackDeclarationTraceProtocol:record.attackDeclarationTraceProtocol,
    candidateAttackDeclarations:record.attackDeclarationTrace?.filter(action =>
      action.playerSlot === (record.candidateEngineSlot === 'A' ? 0 : 1)) ?? null,
    opponentAttackDeclarations:record.attackDeclarationTrace?.filter(action =>
      action.playerSlot === (record.candidateEngineSlot === 'A' ? 1 : 0)) ?? null,
    opposingFirstTurnDecisions:(record.decisionTrace || []).filter(action =>
      action.playerSlot === (record.candidateEngineSlot === 'A' ? 1 : 0) &&
      action.turnBefore === 1).slice(0, 25),
    candidateResponseDecisions:(record.decisionTrace || []).filter(action =>
      action.playerSlot === (record.candidateEngineSlot === 'A' ? 0 : 1) &&
      action.turnBefore === 2).slice(0, 25)
  }));
  return {
    study:'shared-campaign rank11 autonomous opponent against frozen reference and provisional New Moon',
    version:'rank11-automatic-source-comparison-v2-declaration-observation',
    experimental:true,
    campaignPlanDigest:original.planDigest,
    sourceOpponentRank:RANK, sourceOpponentDigest:outcomes[0].opponentDigest,
    candidates:original.candidateRows.filter(c => CANDIDATES.includes(c.id)),
    pilotSeeds:outcomes.map(x => x.seed),
    opponentPolicyProfile:RANK11_AUTONOMOUS_PROFILE,
    opponentOpportunitiesDetected:outcomes.filter(x =>
      x.sourcePolicyAudit?.opportunityDetected === true).length,
    completedAutomaticLines:outcomes.filter(x =>
      x.sourcePolicyAudit?.completeAtDecisionBoundary === true).length,
    independentlyQualifiedCompetitiveGames:0,
    simulatorPaperRuleFidelityVerified:false,
    replayComplete:false,
    candidatePrintingCertified:false,
    competitiveWinRateCertified:false,
    warning:'Selected source openings with weak unqualified candidate reply policies. Engine outcomes are diagnostics, not game-win estimates.',
    outcomes
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {run, CANDIDATES, RANK};
