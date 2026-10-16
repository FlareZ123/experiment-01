'use strict';

const fs = require('node:fs');
const {createHash} = require('node:crypto');

/** @param {unknown} payload */
function digest(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/**
 * Analyze only source-locked, post-choice pass-attack checks. One pass
 * decision is not an independent match sample. Unprobed passes must remain
 * distinct from probed passes where the pinned engine rejected every attack.
 *
 * @param {object} archive Source-locked bounded diagnostic archive.
 * @returns {object} Per-trial attack omissions, partitioned by physical seat.
 */
function auditPassedAttackAnnouncements(archive) {
  if (!archive || archive.purpose !== 'engine-and-policy-diagnostic-only' ||
      archive.engineAndPolicyQualified !== false ||
      archive.strengthClaimPermitted !== false ||
      !Array.isArray(archive.records) ||
      !Number.isInteger(archive.totalScheduled) ||
      archive.records.length !== archive.totalScheduled ||
      typeof archive.planDigest !== 'string') {
    throw new Error('Require complete unqualified Aichi diagnostic archive');
  }
  const byTrial = [];
  const all = [];
  const identities = new Set();
  for (const record of archive.records) {
    if (typeof record?.trialId !== 'string' || identities.has(record.trialId) ||
        !['A', 'B'].includes(record.candidateEngineSlot)) {
      throw new Error('Missing/duplicate trial or invalid physical candidate seat');
    }
    identities.add(record.trialId);
    const trace = record.traceSummary?.chronologicalActionTrace;
    const claimed = record.traceSummary?.chronologicalActionTraceSha256;
    const candidateSeat = record.candidateEngineSlot === 'A' ? 0 : 1;
    const row = {
      trialId: record.trialId, candidateId: record.candidateId,
      rank: record.opponentRank, status: record.status,
      candidateEngineSlot: record.candidateEngineSlot,
      sourceDigest: record.opponentDigest,
      recordedPasses: 0, probedPasses: 0,
      skippedPasses: 0, acceptedAttackPasses: 0,
      acceptedPrintedAttackPasses: 0, acceptedToolAttackPasses: 0,
      auditErrors: 0
    };
    if (!Array.isArray(trace) || digest(trace) !== claimed) {
      row.traceIntegrity = 'unverified';
      byTrial.push(row);
      continue;
    }
    row.traceIntegrity = 'digest-valid';
    for (const action of trace) {
      if (action.action !== 'PassTurnAction') continue;
      if (![0, 1].includes(action.playerSlot)) throw new Error('Invalid pass seat');
      row.recordedPasses++;
      const side = action.playerSlot === candidateSeat ? 'candidate' : 'opponent';
      const probe = action.attackPassProbe;
      if (!probe) {
        row.skippedPasses++;
        continue;
      }
      if (probe.evidenceType !== 'post-choice-cloned-attack-announcements-v1') {
        throw new Error('Unknown pass audit schema');
      }
      if (probe.auditError) {
        row.auditErrors++;
        continue;
      }
      if (probe.playerId !== (action.playerSlot === 0 ? 101 : 202) ||
          !Array.isArray(probe.tested) || probe.tested.length > 8 ||
          typeof probe.truncated !== 'boolean') {
        throw new Error('Malformed cloned-attack pass evidence');
      }
      const attacks = new Set();
      for (const item of probe.tested) {
        if (typeof item.name !== 'string' || !item.name ||
            !['printed', 'attached-tool'].includes(item.source) ||
            typeof item.engineAcceptedAnnouncement !== 'boolean' ||
            attacks.has(item.name)) {
          throw new Error('Malformed or duplicate attack-announcement outcome');
        }
        attacks.add(item.name);
      }
      row.probedPasses++;
      const accepted = probe.tested.filter(item => item.engineAcceptedAnnouncement);
      if (accepted.length) row.acceptedAttackPasses++;
      if (accepted.some(item => item.source === 'printed')) {
        row.acceptedPrintedAttackPasses++;
      }
      if (accepted.some(item => item.source === 'attached-tool')) {
        row.acceptedToolAttackPasses++;
      }
      all.push({
        trialId: record.trialId, rank: record.opponentRank,
        candidateId: record.candidateId,
        candidateEngineSlot: record.candidateEngineSlot,
        side, actionOrdinal: action.actionOrdinal, turnBefore: action.turnBefore,
        activePokemon: probe.activePokemon,
        candidateAttacks: record.candidateAttacks,
        opponentAttacks: record.opponentAttacks,
        engineAccepted: accepted, truncated: probe.truncated,
        testedAttackCount: probe.tested.length,
        ...(accepted.length && Array.isArray(action.publicBoardBeforePass) ?
          {publicBoardBeforePass: action.publicBoardBeforePass} : {}),
        ...(accepted.some(item =>
            item.name === 'Evolution' && item.source === 'attached-tool') &&
          action.tmEvolutionBeforePass?.evidenceType ===
            'post-decision-tm-evolution-target-inventory-v1' &&
          Number.isInteger(action.tmEvolutionBeforePass.targetCount) ?
          {
            postDecisionHiddenTmEvolutionTargetCount:
              action.tmEvolutionBeforePass.targetCount,
            interpretation: 'Post-choice true-deck inventory; not available to K0 policy'
          } : {})
      });
    }
    byTrial.push(row);
  }
  return {
    kind: 'aichi-post-choice-cloned-pass-attack-diagnostic-v1',
    planDigest: archive.planDigest,
    researchPolicyProfile: archive.researchPolicyProfile || 'unversioned-legacy',
    totalTrials: archive.records.length,
    unqualifiedEnginePolicy: true,
    winRateEvidence: false, candidateRankingPermitted: false,
    scope: 'A pass was already selected. Accepted attacks were independently probed in cloned pinned Stores; these are neither paper legality certificates nor strategically optimal decisions.',
    coverage: {
      recordedPasses: byTrial.reduce((s, r) => s + r.recordedPasses, 0),
      probedPasses: byTrial.reduce((s, r) => s + r.probedPasses, 0),
      skippedPasses: byTrial.reduce((s, r) => s + r.skippedPasses, 0),
      auditErrors: byTrial.reduce((s, r) => s + r.auditErrors, 0),
      acceptedAttackPasses: byTrial.reduce((s, r) => s + r.acceptedAttackPasses, 0)
    },
    trials: byTrial, checkedPasses: all
  };
}
if (require.main === module) {
  const filename = process.argv[2];
  if (!filename) throw new Error('Provide existing Aichi diagnostic JSON path');
  const archive = JSON.parse(fs.readFileSync(filename, 'utf8'));
  process.stdout.write(JSON.stringify(auditPassedAttackAnnouncements(archive), null, 2) + '\n');
}
module.exports = {auditPassedAttackAnnouncements};
