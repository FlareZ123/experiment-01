'use strict';

const fs = require('node:fs');
const {createHash} = require('node:crypto');

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
      ![1, 2].includes(archive.campaignSchemaVersion) ||
      (archive.campaignSchemaVersion === 2 &&
        archive.seedProtocol !== 'independent-slots-v2')) {
    throw new Error('Incomplete or unsupported campaign schedule metadata.');
  }
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
    if (opponentDigests.has(record.opponentRank) &&
        opponentDigests.get(record.opponentRank) !== record.opponentDigest) {
      throw new Error('Opponent source digest drift within a rank.');
    }
    opponentDigests.set(record.opponentRank, record.opponentDigest);
    ids.add(record.trialId);
    const reasons = [];
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
  if (archive.seedProtocol === 'independent-slots-v2') {
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
