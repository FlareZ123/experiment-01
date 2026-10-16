'use strict';

const fs = require('node:fs');
const {createHash} = require('node:crypto');
const {deriveSlotSeeds} = require('./aichi-decorrelated-seeds.cjs');

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * A post-run evidence audit, never a game-strength evaluator.
 * Finished engine games remain unqualified until rules and both policies
 * have independent matchup-specific validation.
 *
 * @param {object} archive Output from aichi-campaign-execute.cjs.
 * @returns {object} Source-attributed blockers and rank-level coverage.
 */
function auditCampaignQuality(archive) {
  if (!archive || archive.purpose !== 'engine-and-policy-diagnostic-only' ||
      archive.engineAndPolicyQualified !== false ||
      archive.strengthClaimPermitted !== false ||
      typeof archive.planDigest !== 'string' ||
      !Array.isArray(archive.records) ||
      !Array.isArray(archive.candidateRows) ||
      !Array.isArray(archive.selectedPilotRanks) ||
      !Number.isInteger(archive.totalScheduled) ||
      archive.records.length !== archive.totalScheduled) {
    throw new Error('Expected a complete, explicitly unqualified campaign diagnostic.');
  }
  // New archives attest to one policy configuration per trial. Older archives
  // remain readable with an explicit legacy status and cannot impersonate a
  // versioned full-game policy counterfactual.
  const profile = Object.hasOwn(archive, 'researchPolicyProfile') ?
    archive.researchPolicyProfile : 'unversioned-legacy';
  if (!['fixed-core-v1', 'expanded-action-fidelity-probe-v1',
    'unversioned-legacy'].includes(profile)) {
    throw new Error('Invalid archive research policy profile.');
  }
  const experimentalClone = archive.policyFlags?.prototypeSafeSimulatorIsolation === true;
  const simulatorCloneProfile = experimentalClone ?
    'prototype-safe-experimental-v1' : 'pinned-source-card-alias-v0';
  // Neither the known leaky pinned clone nor the experimental correction
  // has been qualified for representative full-match inference.
  const simulatorSafetyStatus = experimentalClone ?
    'experimental-clone-not-qualified' : 'known-simulator-card-alias-risk';
  const candidates = new Map(archive.candidateRows.map(row => [row.id, row.deckDigest]));
  const ranks = new Set(archive.selectedPilotRanks);
  const ids = new Set();
  if (candidates.size !== archive.candidateRows.length || !candidates.size ||
      ranks.size !== archive.selectedPilotRanks.length || !ranks.size) {
    throw new Error('Duplicate or absent candidate/rank identities.');
  }
  // Reconstruct the full pilot Cartesian product. A record count alone can
  // conceal omitted opponents or duplicated candidate/slot observations.
  const divisor = ranks.size * candidates.size * 2;
  const repeats = archive.totalScheduled / divisor;
  if (!Number.isInteger(repeats) || repeats < 1 ||
      ![1, 2, 3].includes(archive.campaignSchemaVersion) ||
      (archive.campaignSchemaVersion === 2 &&
        archive.seedProtocol !== 'independent-slots-v2') ||
      (archive.campaignSchemaVersion === 3 &&
        archive.seedProtocol !== 'decorrelated-slots-v3')) {
    throw new Error('Incomplete or unsupported campaign schedule metadata.');
  }
  const v3 = archive.campaignSchemaVersion === 3;
  const hasSeedBase = Object.hasOwn(archive, 'seedBase');
  if (v3 && hasSeedBase &&
      (!Number.isSafeInteger(archive.seedBase) || archive.seedBase < 0 ||
       archive.seedBase > 0xffffffff)) {
    throw new Error('Invalid v3 archive seed base.');
  }
  const deriveV3Seeds = v3 && hasSeedBase;
  const expectedTrials = new Set();
  for (const rank of ranks) {
    for (const candidateId of candidates.keys()) {
      for (let repeat = 0; repeat < repeats; repeat += 1) {
        for (const slot of ['A', 'B']) {
          expectedTrials.add(['pilot', rank, repeat, candidateId, slot].join(':'));
        }
      }
    }
  }
  const slotSeeds = new Map();
  const opponentDigests = new Map();
  const rows = archive.records.map(record => {
    if (!record || ids.has(record.trialId) ||
        typeof record.trialId !== 'string' ||
        record.planDigest !== archive.planDigest ||
        !candidates.has(record.candidateId) ||
        record.candidateDigest !== candidates.get(record.candidateId) ||
        !ranks.has(record.opponentRank) ||
        !['A', 'B'].includes(record.candidateEngineSlot)) {
      throw new Error('Invalid, repeated or source-drifted trial identity.');
    }
    if ((profile === 'unversioned-legacy' &&
         Object.hasOwn(record, 'researchPolicyProfile')) ||
        (profile !== 'unversioned-legacy' &&
         record.researchPolicyProfile !== profile)) {
      throw new Error('Trial research policy profile differs from archive.');
    }
    const parts = record.trialId.split(':');
    const repeat = Number(parts[2]);
    if (!expectedTrials.delete(record.trialId) ||
        parts.length !== 5 ||
        record.trialId !== ['pilot', record.opponentRank, repeat,
          record.candidateId, record.candidateEngineSlot].join(':') ||
        record.phase !== 'pilot' ||
        !Number.isInteger(repeat) || repeat < 0 || repeat >= repeats ||
        !Number.isInteger(record.seed) || record.seed < 0 ||
        typeof record.opponentDigest !== 'string' ||
        record.opponentDigest.length === 0) {
      throw new Error('Missing, repeated or malformed scheduled trial identity.');
    }
    const seedKey = [record.opponentRank, repeat, record.candidateEngineSlot].join(':');
    if (slotSeeds.has(seedKey) && slotSeeds.get(seedKey) !== record.seed) {
      throw new Error('Candidate variants did not share the scheduled slot seed.');
    }
    slotSeeds.set(seedKey, record.seed);
    if (deriveV3Seeds && record.seed !==
        deriveSlotSeeds(archive.seedBase, 'pilot', record.opponentRank, repeat)
          [record.candidateEngineSlot]) {
      throw new Error('Decorrelated v3 seed differs from derived schedule.');
    }
    if (opponentDigests.has(record.opponentRank) &&
        opponentDigests.get(record.opponentRank) !== record.opponentDigest) {
      throw new Error('Opponent source digest drift within a rank.');
    }
    opponentDigests.set(record.opponentRank, record.opponentDigest);
    ids.add(record.trialId);
    const reasons = [simulatorSafetyStatus];
    if (record.status !== 'completed-engine-game') {
      reasons.push('engine-status:' + record.status);
    }
    const slot = record.candidateEngineSlot === 'A' ? 0 : 1;
    const firstSlot = record.turnEvidence?.firstTurnSlot;
    const actualTurn = firstSlot === slot ? 'first' :
      firstSlot === 1 - slot ? 'second' : 'unverified';
    if (record.turnEvidence?.verifiedByDrawLog !== true ||
        record.candidateActualTurn !== actualTurn ||
        actualTurn === 'unverified') {
      reasons.push('unverified-starting-turn');
    }
    if (!Number.isInteger(record.candidateAttacks) || record.candidateAttacks < 0 ||
        !Number.isInteger(record.opponentAttacks) || record.opponentAttacks < 0) {
      reasons.push('missing-attack-counts');
    } else {
      if (record.candidateAttacks === 0) reasons.push('zero-candidate-attacks');
      if (record.opponentAttacks === 0) reasons.push('zero-opponent-attacks');
    }
    const trace = record.traceSummary?.chronologicalActionTrace;
    const claimedDigest = record.traceSummary?.chronologicalActionTraceSha256;
    const traceIntegrity = !Array.isArray(trace) ? 'unavailable' :
      typeof claimedDigest === 'string' && claimedDigest === sha256(trace) ?
        'digest-valid' : 'digest-mismatch';
    if (traceIntegrity !== 'digest-valid') {
      reasons.push('trace-' + traceIntegrity);
    }
    if (record.traceSummary?.coversAllActionsAndPromptResolutions !== true) {
      reasons.push('not-a-complete-replay');
    }
    const terminalPlayers = record.traceSummary?.terminalTransition?.after?.players;
    const deckRemaining = Array.isArray(terminalPlayers) &&
      terminalPlayers.length === 2 &&
      terminalPlayers.every(player =>
        Number.isInteger(player.deckRemaining) && player.deckRemaining >= 0) ?
      terminalPlayers.map(player => player.deckRemaining) : null;
    if (deckRemaining === null) {
      reasons.push('terminal-board-unavailable');
    } else if (deckRemaining.includes(0)) {
      reasons.push('empty-deck-at-terminal');
    }
    const terminalPrizes = Array.isArray(terminalPlayers) &&
      terminalPlayers.length === 2 &&
      terminalPlayers.every(player =>
        Number.isInteger(player.prizesRemaining) && player.prizesRemaining >= 0) ?
      terminalPlayers.map(player => player.prizesRemaining) : null;
    return {
      trialId: record.trialId,
      rank: record.opponentRank,
      candidateId: record.candidateId,
      researchPolicyProfile: profile,
      simulatorCloneProfile,
      simulatorSafetyStatus,
      engineSlot: record.candidateEngineSlot,
      actualTurn,
      status: record.status,
      candidateAttacks: record.candidateAttacks ?? null,
      opponentAttacks: record.opponentAttacks ?? null,
      traceIntegrity,
      terminalDeckRemaining: deckRemaining,
      terminalPrizesRemaining: terminalPrizes,
      blockers: reasons,
      priority: reasons.includes('zero-candidate-attacks') ||
        reasons.includes('zero-opponent-attacks') ? 'attacker-policy-investigation' :
        reasons.includes('engine-status:' + record.status) ?
          'engine-or-resolver-investigation' :
          reasons.includes('empty-deck-at-terminal') ?
            'terminal-and-policy-investigation' : 'replay-and-policy-qualification'
    };
  });
  if (expectedTrials.size !== 0) {
    throw new Error('Pilot coverage omitted scheduled rank/candidate/slot trials.');
  }
  if (['independent-slots-v2', 'decorrelated-slots-v3'].includes(archive.seedProtocol)) {
    for (const rank of ranks) {
      for (let repeat = 0; repeat < repeats; repeat += 1) {
        if (slotSeeds.get([rank, repeat, 'A'].join(':')) ===
            slotSeeds.get([rank, repeat, 'B'].join(':'))) {
          throw new Error('Independent physical slots reused the same seed.');
        }
      }
    }
  }
  const coverage = [];
  for (const rank of archive.selectedPilotRanks) {
    for (const candidateId of candidates.keys()) {
      const subset = rows.filter(row => row.rank === rank &&
        row.candidateId === candidateId);
      coverage.push({
        rank, candidateId, trials: subset.length,
        observedFirst: subset.filter(row => row.actualTurn === 'first').length,
        observedSecond: subset.filter(row => row.actualTurn === 'second').length,
        completedEngineGames: subset.filter(row => row.status === 'completed-engine-game').length,
        zeroCandidateAttackTrials: subset.filter(row =>
          row.blockers.includes('zero-candidate-attacks')).length,
        zeroOpponentAttackTrials: subset.filter(row =>
          row.blockers.includes('zero-opponent-attacks')).length,
        emptyDeckAtTerminalTrials: subset.filter(row =>
          row.blockers.includes('empty-deck-at-terminal')).length,
        independentlyQualifiedGames: 0
      });
    }
  }
  return {
    kind: 'aichi-fixed-campaign-quality-screen-v1',
    planDigest: archive.planDigest,
    seedProtocol: archive.seedProtocol,
    seedBase: hasSeedBase ? archive.seedBase : null,
    seedDerivationStatus: v3 ?
      (deriveV3Seeds ? 'v3-derived-and-matched' : 'v3-base-missing-legacy') :
      'not-v3',
    researchPolicyProfile: profile,
    simulatorCloneProfile,
    simulatorSafetyStatus,
    simulatorSafetyQualified: false,
    selectedPilotRanks: archive.selectedPilotRanks,
    totalTrials: rows.length,
    repeatsVerified: repeats, fullPilotMatrixVerified: true,
    candidateRankingPermitted: false,
    winRateEvidence: false,
    terminalMarkerCaution: 'An empty deck at the terminal board does not establish the cause of game termination.',
    replayCaution: 'A valid action-trace hash establishes payload integrity, not complete replay or game-rule fidelity.',
    coverage, records: rows
  };
}

if (require.main === module) {
  const filename = process.argv[2];
  if (!filename) throw new Error('Provide an existing diagnostic JSON path.');
  const archive = JSON.parse(fs.readFileSync(filename, 'utf8'));
  process.stdout.write(JSON.stringify(auditCampaignQuality(archive), null, 2) + '\n');
}

module.exports = {auditCampaignQuality};
