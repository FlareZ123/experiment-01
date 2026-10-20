'use strict';

const { createHash } = require('node:crypto');
const { verifyCampaign, turnProof } = require('./aichi-campaign-runner.cjs');
const {expandPrintings,alignToReference,auditAlignment} =
  require('../../scripts/aichi-position-coupling.cjs');

const STATUSES = new Set([
  'completed', 'blocked-resolution', 'engine-deck-mismatch',
  'unverified-first-turn', 'unfinished', 'engine-exception',
  'engine-seed-mismatch', 'engine-revision-mismatch',
  'engine-protocol-mismatch', 'policy-profile-mismatch',
  'simulator-profile-mismatch', 'match-policy-echo-mismatch'
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
  const orderProtocol = archive.inputOrderProtocol || 'source-row-order-v1';
  if (!['source-row-order-v1','reference-aligned-v1'].includes(orderProtocol)) {
    throw new Error('Unknown candidate input-order protocol.');
  }
  const sourceOrderClaims=new Map();
  if (archive.inputOrderProtocol !== undefined) {
    const referenceCandidates=inputs.candidates.filter(c=>c.referenceOnly===true);
    if (referenceCandidates.length!==1) {
      throw new Error('Versioned input-order protocol needs exactly one source reference.');
    }
    const referencePrintings=expandPrintings(referenceCandidates[0].cards);
    for(const candidate of inputs.candidates){
      const sourcePrintings=expandPrintings(candidate.cards);
      const executedPrintings=orderProtocol==='reference-aligned-v1' ?
        alignToReference(referencePrintings,sourcePrintings) : [...sourcePrintings];
      const before=auditAlignment(referencePrintings,sourcePrintings);
      const after=auditAlignment(referencePrintings,executedPrintings);
      sourceOrderClaims.set(candidate.id,{
        sourcePrintingOrderHash:digest(sourcePrintings),
        executedPrintingOrderHash:digest(executedPrintings),
        referencePrintingOrderHash:digest(referencePrintings),
        sharedCopies:after.sharedCopies,
        matchingPositionsBefore:before.matchingPositions,
        matchingPositionsAfter:after.matchingPositions
      });
    }
  }
  const observedInputHashesByCandidate=new Map();
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
    if (archive.inputOrderProtocol !== undefined &&
        row.inputOrderProtocol !== orderProtocol) {
      throw new Error('Candidate input-order protocol differs from archive: ' + row.trialId);
    }
    if (archive.inputOrderProtocol !== undefined && row.status === 'completed') {
      const order = row.candidateInputOrder;
      const expectedSourceOrder=sourceOrderClaims.get(row.candidateId);
      if (!order || order.protocol !== orderProtocol ||
          !expectedSourceOrder ||
          Object.entries(expectedSourceOrder).some(([key,value])=>order[key]!==value) ||
          order.executedInputHash !== row.expectedEngineDeckHashes?.[candidateSeat] ||
          !/^[a-f0-9]{64}$/.test(order.sourceInputHash) ||
          !/^[a-f0-9]{64}$/.test(order.sourcePrintingOrderHash) ||
          !/^[a-f0-9]{64}$/.test(order.executedPrintingOrderHash) ||
          !/^[a-f0-9]{64}$/.test(order.referencePrintingOrderHash) ||
          !Number.isInteger(order.sharedCopies) ||
          !Number.isInteger(order.matchingPositionsBefore) ||
          !Number.isInteger(order.matchingPositionsAfter) ||
          order.sharedCopies < 0 || order.sharedCopies > 60 ||
          order.matchingPositionsBefore < 0 ||
          order.matchingPositionsBefore > order.sharedCopies ||
          order.matchingPositionsAfter < order.matchingPositionsBefore ||
          order.matchingPositionsAfter > order.sharedCopies ||
          (orderProtocol === 'reference-aligned-v1' &&
           order.matchingPositionsAfter !== order.sharedCopies) ||
          (orderProtocol === 'source-row-order-v1' &&
           (order.sourceInputHash !== order.executedInputHash ||
            order.sourcePrintingOrderHash !== order.executedPrintingOrderHash))) {
        throw new Error('Candidate input-order evidence mismatch: ' + row.trialId);
      }
      const previous=observedInputHashesByCandidate.get(row.candidateId);
      const current=[order.sourceInputHash,order.executedInputHash];
      if (previous && JSON.stringify(previous)!==JSON.stringify(current)) {
        throw new Error('Candidate input-order engine hash drift across trials: ' +
          row.trialId);
      }
      observedInputHashesByCandidate.set(row.candidateId,current);
    }
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
      if (!proof || row.observedFinished !== true ||
          row.observedSeed !== scheduled.seed ||
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
    if (row.observedEngine !== 'twinleafgg/' + provenance.engineRevision ||
        row.resolvedEngineRevision !== provenance.engineRevision ||
        row.observedRngProtocol !== provenance.rngProtocol ||
        row.observedPolicy !== provenance.candidatePolicyRevision ||
        row.observedPolicy !== provenance.opponentPolicyRevision ||
        !row.effectiveMatchOptions ||
        typeof row.effectiveMatchOptions !== 'object' ||
        Array.isArray(row.effectiveMatchOptions) ||
        digest(row.effectiveMatchOptions) !==
          digest(provenance.effectiveMatchOptions)) {
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
    (left.archive.inputOrderProtocol || 'source-row-order-v1') ===
      (right.archive.inputOrderProtocol || 'source-row-order-v1') &&
    keys.every(k => digest(left.provenance[k]) === digest(right.provenance[k]));
}

/**
 * Require a true one-to-one paired set of *completed* source-dealt cells.
 * Research-condition equality alone says nothing about which scheduled
 * seeds, opponents, or actual first-turn strata were compared.
 *
 * Candidate inventories may differ (that is the treatment), but opponent
 * printing digest, physical slot, seed, repeat, and observed starting order
 * must match. This is a pairing prerequisite, never a game-strength audit.
 *
 * @param {object} left Validated evidence envelope.
 * @param {object} right Validated evidence envelope.
 * @returns {boolean}
 */
function hasPairedTrialSchedule(left, right) {
  if (!hasMatchingResearchConditions(left, right)) return false;

  /** @param {object} envelope */
  function cells(envelope) {
    const records = envelope?.archive?.records;
    if (!Array.isArray(records) || records.length === 0) return null;
    const seen = new Map();
    for (const row of records) {
      if (row?.status !== 'completed' ||
          !['A', 'B'].includes(row.candidateEngineSlot) ||
          row.observedSeed !== row.seed ||
          typeof row.opponentDigest !== 'string') return null;
      const proof = row.firstTurn && turnProof(row.firstTurn);
      if (!proof) return null;
      const candidateSlot = row.candidateEngineSlot === 'A' ? 0 : 1;
      const actualTurn = proof.firstTurnSlot === candidateSlot ?
        'first' : 'second';
      if (row.candidateTrueTurn !== actualTurn) return null;
      // The opponent must resolve to the same actual engine deck in both arms.
      // Equal published-source digests do not prove equal resolved printings.
      const opponentSlot = 1 - candidateSlot;
      const expected = row.expectedEngineDeckHashes;
      const observed = row.observedEngineDeckHashes;
      if (!Array.isArray(expected) || !Array.isArray(observed) ||
          expected.length !== 2 || observed.length !== 2 ||
          !/^[a-f0-9]{64}$/.test(expected[opponentSlot]) ||
          observed[opponentSlot] !== expected[opponentSlot]) return null;
      const key = JSON.stringify([
        row.phase, row.rank, row.repeat, row.seed,
        row.candidateEngineSlot, row.opponentDigest, actualTurn
      ]);
      if (seen.has(key)) return null;
      seen.set(key, expected[opponentSlot]);
    }
    return seen;
  }

  const a = cells(left);
  const b = cells(right);
  return a !== null && b !== null && a.size === b.size &&
    [...a].every(([key, opponentHash]) => b.get(key) === opponentHash);
}

module.exports = {
  auditArchive, createEvidenceEnvelope, hasMatchingResearchConditions,
  hasPairedTrialSchedule
};
