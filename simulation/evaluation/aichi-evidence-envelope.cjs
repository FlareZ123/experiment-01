'use strict';

const { createHash } = require('node:crypto');
const { verifyCampaign, turnProof } = require('./aichi-campaign-runner.cjs');

const STATUSES = new Set([
  'completed', 'blocked-resolution', 'engine-deck-mismatch',
  'unverified-first-turn', 'unfinished', 'engine-exception',
  'engine-seed-mismatch', 'engine-revision-mismatch',
  'engine-protocol-mismatch', 'policy-profile-mismatch'
]);

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Check that a partial runner archive has not silently changed scheduling,
 * starting-turn attribution or terminal outcomes. The runner itself is not an
 * independent source of evidence about its own playing-policy competence.
 * @param {object} inputs Original campaign field, source and candidate inventory.
 * @param {object} archive Raw output of executeCampaign.
 * @returns {{completed:number,failures:number,verifiedFirst:number,verifiedSecond:number}}
 */
function auditArchive(inputs, archive) {
  const campaign = verifyCampaign(inputs);
  if (archive.schemaVersion !== campaign.schemaVersion ||
      (archive.seedProtocol || 'paired-slots-v1') !==
        (campaign.seedProtocol || 'paired-slots-v1') ||
      archive.planDigest !== campaign.planDigest ||
      !['pilot', 'published-field'].includes(archive.phase) ||
      !Array.isArray(archive.records) || !Array.isArray(archive.selectedTrialIds) ||
      archive.records.length !== archive.recordedTrials ||
      archive.records.length !== archive.selectedTrialIds.length ||
      new Set(archive.selectedTrialIds).size !== archive.selectedTrialIds.length ||
      archive.competitiveWinRateCertified !== false ||
      archive.rulesAndBotCompetenceCertified !== false) {
    throw new Error('Invalid, incomplete, or falsely certified campaign archive.');
  }
  const plan = new Map(campaign.trials.map(trial => [trial.trialId, trial]));
  let completed = 0;
  let verifiedFirst = 0;
  let verifiedSecond = 0;
  const mirrorAliases = new Map();
  for (let i = 0; i < archive.records.length; i += 1) {
    const row = archive.records[i];
    const scheduled = plan.get(archive.selectedTrialIds[i]);
    if (!scheduled || row.trialId !== scheduled.trialId ||
        row.phase !== archive.phase || row.phase !== scheduled.phase ||
        row.rank !== scheduled.rank || row.candidateId !== scheduled.candidateId ||
        row.candidateDigest !== scheduled.candidateDigest ||
        row.opponentDigest !== scheduled.opponentDigest ||
        row.seed !== scheduled.seed || row.repeat !== scheduled.repeat ||
        row.candidateEngineSlot !== scheduled.candidateEngineSlot ||
        !STATUSES.has(row.status)) {
      throw new Error('Scheduled trial or status mismatch: ' + (row?.trialId || i));
    }
    const exactSourceMirror = scheduled.candidateDigest === scheduled.opponentDigest;
    if (row.exactSourceMirror !== undefined &&
        row.exactSourceMirror !== exactSourceMirror) {
      throw new Error('Incorrect source mirror flag: ' + row.trialId);
    }
    const aliasKey = exactSourceMirror ? digest({
      phase: scheduled.phase, rank: scheduled.rank, seed: scheduled.seed,
      candidateDigest: scheduled.candidateDigest,
      opponentDigest: scheduled.opponentDigest
    }) : null;
    if (row.potentialReplayAliasKey !== undefined &&
        row.potentialReplayAliasKey !== aliasKey) {
      throw new Error('Incorrect mirror replay alias key: ' + row.trialId);
    }
    const proof = row.firstTurn && turnProof(row.firstTurn);
    if (row.firstTurn && !proof) {
      throw new Error('Unverifiable first-turn claim: ' + row.trialId);
    }
    const candidateSeat = row.candidateEngineSlot === 'A' ? 0 : 1;
    const actualTurn = proof ?
      (proof.firstTurnSlot === candidateSeat ? 'first' : 'second') : 'unverified';
    if (row.candidateTrueTurn !== undefined && row.candidateTrueTurn !== actualTurn) {
      throw new Error('False candidate turn attribution: ' + row.trialId);
    }
    if (row.status === 'completed') {
      const candidateSlot = scheduled.candidateEngineSlot === 'A' ? 0 : 1;
      const rawWinner = row.observedWinnerIndex;
      const boundOutcome = rawWinner === 3 ? 'draw' :
        rawWinner === candidateSlot ? 'candidate' : 'opponent';
      if (!proof || (row.observedSeed !== undefined && row.observedSeed !== scheduled.seed) ||
          ![0, 1, 3].includes(rawWinner) || row.winner !== boundOutcome ||
          !Array.isArray(row.expectedEngineDeckHashes) ||
          !Array.isArray(row.observedEngineDeckHashes) ||
          row.expectedEngineDeckHashes.length !== 2 ||
          !row.expectedEngineDeckHashes.every(x => /^[a-f0-9]{64}$/.test(x)) ||
          JSON.stringify(row.expectedEngineDeckHashes) !==
          JSON.stringify(row.observedEngineDeckHashes)) {
        throw new Error('Completed game lacks verified turn/deck/outcome: ' + row.trialId);
      }
      completed += 1;
      if (aliasKey !== null) {
        mirrorAliases.set(aliasKey, (mirrorAliases.get(aliasKey) || 0) + 1);
      }
      if (actualTurn === 'first') verifiedFirst += 1;
      else verifiedSecond += 1;
    } else if (row.winner !== null) {
      throw new Error('Noncompleted game was assigned an outcome: ' + row.trialId);
    }
  }
  const potentialDuplicateMirrorGames = [...mirrorAliases.values()]
    .reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  return {
    completed, failures: archive.records.length - completed,
    verifiedFirst, verifiedSecond, potentialDuplicateMirrorGames,
    maximumDistinctCompletedTrajectories: completed - potentialDuplicateMirrorGames
  };
}

/**
 * Explicitly self-reported provenance, not an independent policy audit.
 * The current runner does not persist every engine action or signed version
 * attestation; those limitations remain visible in the envelope.
 * @param {object} inputs
 * @param {object} archive
 * @param {{researchRevision:string,engineRevision:string,rulesetRevision:string,
 *   candidatePolicyRevision:string,opponentPolicyRevision:string,
 *   rngProtocol:string,effectiveMatchOptions:object}} provenance
 * @returns {object}
 */
function createEvidenceEnvelope(inputs, archive, provenance) {
  const required = ['researchRevision', 'engineRevision', 'rulesetRevision',
    'candidatePolicyRevision', 'opponentPolicyRevision', 'rngProtocol'];
  if (!provenance || required.some(k =>
    typeof provenance[k] !== 'string' || !provenance[k].trim()) ||
      !provenance.effectiveMatchOptions ||
      typeof provenance.effectiveMatchOptions !== 'object' ||
      Array.isArray(provenance.effectiveMatchOptions)) {
    throw new Error('Explicit engine, policy, ruleset and research provenance required.');
  }
  const audit = auditArchive(inputs, archive);
  if (archive.researchRevision && archive.researchRevision !== provenance.researchRevision) {
    throw new Error('Archive/research commit revision mismatch.');
  }
  for (const row of archive.records.filter(r => r.status === 'completed')) {
    if ((row.observedEngine && row.observedEngine !== 'twinleafgg/' + provenance.engineRevision) ||
        (row.resolvedEngineRevision && row.resolvedEngineRevision !== provenance.engineRevision) ||
        (row.observedRngProtocol && row.observedRngProtocol !== provenance.rngProtocol) ||
        (row.observedPolicy && (row.observedPolicy !== provenance.candidatePolicyRevision ||
          row.observedPolicy !== provenance.opponentPolicyRevision)) ||
        (row.effectiveMatchOptions && digest(row.effectiveMatchOptions) !==
          digest(provenance.effectiveMatchOptions))) {
      throw new Error('Engine-reported provenance conflicts with evidence envelope: ' + row.trialId);
    }
  }
  const snapshot = JSON.parse(JSON.stringify({
    archive, provenance, audit,
    interpretation: 'Engine feasibility only; actual policy choices, full action logs and game semantics require independent validation.',
    independentPolicyAttestation: false,
    fullActionReplayAvailable: false,
    competitiveWinRateCertified: false
  }));
  return { envelopeSchemaVersion: 1, ...snapshot, fingerprint: digest(snapshot) };
}

/**
 * Equality of experimental settings is necessary but insufficient for a
 * causal or competitive comparison. Distinct candidate inventories are valid.
 * @param {object} left
 * @param {object} right
 * @returns {boolean}
 */
function hasMatchingResearchConditions(left, right) {
  const keys = ['researchRevision', 'engineRevision', 'rulesetRevision',
    'candidatePolicyRevision', 'opponentPolicyRevision', 'rngProtocol',
    'effectiveMatchOptions'];
  return left.archive.planDigest === right.archive.planDigest &&
    left.archive.phase === right.archive.phase &&
    left.archive.seedProtocol === right.archive.seedProtocol &&
    keys.every(k => digest(left.provenance[k]) === digest(right.provenance[k]));
}

module.exports = {
  auditArchive, createEvidenceEnvelope, hasMatchingResearchConditions
};
