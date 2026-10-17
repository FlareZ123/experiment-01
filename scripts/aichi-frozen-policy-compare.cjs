'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');

/** @param {unknown} value @returns {string} */
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Compare fixed, source-locked diagnostic runs that differ by one declared
 * policy flag. This checks captured action equality rather than game skill.
 * @param {object} control
 * @param {object} experimental
 * @param {string} changedFlag
 * @returns {object}
 */
function compareFrozenPolicyArchives(control, experimental, changedFlag) {
  assert.ok(typeof changedFlag === 'string' && changedFlag.length > 0);
  for (const archive of [control, experimental]) {
    assert.equal(archive?.purpose, 'engine-and-policy-diagnostic-only');
    assert.equal(archive?.strengthClaimPermitted, false);
    assert.equal(archive?.engineAndPolicyQualified, false);
    assert.ok(Array.isArray(archive.records));
    assert.equal(archive.records.length, archive.totalScheduled);
  }
  const identities = [
    'planDigest', 'fieldDigest', 'campaignSchemaVersion', 'seedProtocol',
    'seedBase', 'expectedEngineRevision',
    'candidateRows', 'fieldCoverage', 'selectedPilotRanks', 'maxActions',
    'totalScheduled', 'researchPolicyProfile'
  ];
  for (const key of identities) {
    assert.equal(digest(control[key]), digest(experimental[key]),
      'Changed fixed campaign identity: ' + key);
  }
  assert.equal(control.policyFlags[changedFlag], false);
  assert.equal(experimental.policyFlags[changedFlag], true);
  const otherControlFlags = {...control.policyFlags};
  const otherExperimentalFlags = {...experimental.policyFlags};
  delete otherControlFlags[changedFlag];
  delete otherExperimentalFlags[changedFlag];
  assert.deepEqual(otherControlFlags, otherExperimentalFlags,
    'More than one research policy flag was changed.');

  // Matching printed decks and physical seeds do not isolate one policy flag
  // when the research code or engine changed between the two archives.
  const sameResearchRevision =
    typeof control.researchRevision === 'string' &&
    /^[0-9a-f]{40}$/.test(control.researchRevision) &&
    control.researchRevision === experimental.researchRevision;
  const samePinnedEngine =
    typeof control.expectedEngineRevision === 'string' &&
    /^twinleafgg\/[0-9a-f]{40}$/.test(control.expectedEngineRevision) &&
    control.expectedEngineRevision === experimental.expectedEngineRevision;

  /** @param {object} record */
  const verifiedStartingTurn = record => {
    const first = record.turnEvidence?.firstTurnSlot;
    if (record.turnEvidence?.verifiedByDrawLog !== true ||
        (first !== 0 && first !== 1)) return false;
    const candidateSlot = record.candidateEngineSlot === 'A' ? 0 : 1;
    return record.candidateActualTurn ===
      (first === candidateSlot ? 'first' : 'second');
  };

  const byTrial = new Map();
  for (const r of control.records) {
    assert.ok(r && typeof r.trialId === 'string' &&
      !byTrial.has(r.trialId), 'Duplicate baseline trial');
    byTrial.set(r.trialId, r);
  }
  const seen = new Set();
  const rows = [];
  for (const candidate of experimental.records) {
    const prior = byTrial.get(candidate.trialId);
    assert.ok(prior && !seen.has(candidate.trialId),
      'Missing or duplicate counterfactual trial');
    seen.add(candidate.trialId);
    for (const key of [
      'trialId', 'candidateId', 'candidateDigest', 'opponentDigest',
      'opponentRank', 'candidateEngineSlot', 'seed', 'planDigest'
    ]) assert.deepEqual(prior[key], candidate[key],
      'Fixed trial resource drift: ' + key);

    const a = prior.traceSummary?.chronologicalActionTrace;
    const b = candidate.traceSummary?.chronologicalActionTrace;
    assert.ok(Array.isArray(a) && Array.isArray(b),
      'Missing captured meaningful-action record');
    assert.equal(digest(a), prior.traceSummary.chronologicalActionTraceSha256,
      'Corrupted baseline trace');
    assert.equal(digest(b), candidate.traceSummary.chronologicalActionTraceSha256,
      'Corrupted counterfactual trace');

    const traceIdentical = digest(a) === digest(b);
    const turnOrderIdentical =
      verifiedStartingTurn(prior) && verifiedStartingTurn(candidate) &&
      prior.candidateActualTurn === candidate.candidateActualTurn &&
      digest(prior.turnEvidence) === digest(candidate.turnEvidence);
    const countIdentical =
      prior.candidateAttacks === candidate.candidateAttacks &&
      prior.opponentAttacks === candidate.opponentAttacks;
    const terminalControl = prior.traceSummary?.terminalTransition;
    const terminalExperimental = candidate.traceSummary?.terminalTransition;
    const terminalEvidenceAvailable =
      terminalControl !== undefined && terminalControl !== null &&
      terminalExperimental !== undefined && terminalExperimental !== null;
    const endStateIdentical = terminalEvidenceAvailable &&
      digest(terminalControl) === digest(terminalExperimental);
    const engineEchoVerified = samePinnedEngine &&
      prior.engineRevision === control.expectedEngineRevision &&
      candidate.engineRevision === experimental.expectedEngineRevision;
    rows.push({
      trialId: candidate.trialId,
      seed: candidate.seed,
      turnOrderIdentical,
      traceIdentical,
      engineEchoVerified,
      terminalEvidenceAvailable,
      capturedEventsBaseline: a.length,
      capturedEventsCounterfactual: b.length,
      attackCountsIdentical: countIdentical,
      terminalTransitionIdentical: endStateIdentical,
      fullReplayCaptured: prior.traceSummary.coversAllActionsAndPromptResolutions === true &&
        candidate.traceSummary.coversAllActionsAndPromptResolutions === true
    });
  }
  assert.equal(seen.size, byTrial.size);
  const provenanceGaps = [
    ...(!sameResearchRevision ? ['research-revision-unpinned-or-drifted'] : []),
    ...(!samePinnedEngine ? ['engine-revision-unpinned-or-drifted'] : []),
    ...(rows.some(r => !r.engineEchoVerified) ?
      ['trial-engine-revision-unverified'] : []),
    ...(rows.some(r => !r.turnOrderIdentical) ?
      ['starting-turn-unverified-or-drifted'] : []),
    ...(rows.some(r => !r.fullReplayCaptured) ?
      ['full-action-and-prompt-replay-not-captured'] : []),
    ...(rows.some(r => !r.terminalEvidenceAvailable) ?
      ['terminal-transition-unavailable'] : [])
  ];
  return {
    kind: 'frozen-policy-meaningful-action-comparison-v1',
    changedFlag,
    planDigest: control.planDigest,
    researchRevisionControl: control.researchRevision,
    researchRevisionExperimental: experimental.researchRevision,
    expectedEngineRevision: control.expectedEngineRevision ?? null,
    sameResearchRevision,
    samePinnedEngine,
    provenanceGaps,
    controlledRevisionDiagnostic: provenanceGaps.length === 0,
    comparedTrials: rows.length,
    identicalCapturedTraceTrials: rows.filter(r => r.traceIdentical).length,
    totalControlCapturedEvents: rows.reduce((n,r) => n+r.capturedEventsBaseline,0),
    allCapturedTracesIdentical: rows.every(r => r.traceIdentical),
    allActualTurnOrdersIdentical: rows.every(r => r.turnOrderIdentical),
    allTerminalTransitionsIdentical: rows.every(r => r.terminalTransitionIdentical),
    fullReplayCaptured: rows.every(r => r.fullReplayCaptured),
    gameStrengthClaimPermitted: false,
    caveat: 'Cross-revision comparisons do not isolate one policy flag. Even a version-pinned pair with a complete action trace cannot establish policy competence, paper fidelity, or independent competitive wins.',
    rows
  };
}

if (require.main === module) {
  const [baselineFile, experimentFile, flag] = process.argv.slice(2);
  if (!baselineFile || !experimentFile || !flag) {
    throw new Error('Provide two source-locked archive JSON files and one declared policy flag.');
  }
  const a = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  const b = JSON.parse(fs.readFileSync(experimentFile, 'utf8'));
  process.stdout.write(JSON.stringify(compareFrozenPolicyArchives(a,b,flag), null, 2)+'\n');
}
module.exports = { compareFrozenPolicyArchives };
