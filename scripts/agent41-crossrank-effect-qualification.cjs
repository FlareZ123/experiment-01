'use strict';

const assert = require('node:assert/strict');

const EXPECTED_CANDIDATES = Object.freeze([
  'champion-reference', 'new-moon-lockbreaker-v1'
]);
const EXPECTED_RANKS = Object.freeze([6, 11]);

/**
 * Accept one archived agent41 experimental record and produce a strict,
 * source-owner action state with its actual verification limitations.
 * @param {object} row Authenticated record from the preregistered runner.
 * @returns {object}
 */
function classifyRow(row) {
  assert(row && typeof row === 'object' && Number.isInteger(row.rank));
  assert(EXPECTED_RANKS.includes(row.rank));
  assert(EXPECTED_CANDIDATES.includes(row.candidateId));
  assert(['engine-terminal', 'action-cap-or-incomplete', 'engine-error']
    .includes(row.status));
  assert.equal(row.qualifiedCompetitiveGame, false);
  const audit = row.sourcePolicyAudit;
  const rank6 = row.rank === 6;
  const activated = rank6 ? Boolean(audit?.turn2?.started || audit?.turn3?.started) :
    audit?.opportunityTurn !== null && audit?.opportunityTurn !== undefined;
  const declaredComplete = rank6 ? Boolean(audit?.turn2?.completed || audit?.turn3?.completed) :
    audit?.completed === true;
  const aborted = rank6 ? Boolean(audit?.turn2?.abortReason || audit?.turn3?.abortReason) :
    Boolean(audit?.aborted);
  // A selected source line does not prove a Store attack resolved, let alone
  // damage/KO. Rank11 lock additionally requires the observed Tool board.
  const publicLockWitness = rank6 ? null :
    audit?.nextTurnLockWitness?.equippedGarbodor === true;
  const traceAuthenticated = row.status !== 'engine-error' &&
    row.verifiedFirstTurn === true &&
    row.declaredAttackProtocol === 'real-store-attack-log-declarations-v1';
  const continued = traceAuthenticated &&
    row.sourceTriggerTurn !== null &&
    row.sourceTriggerTurn !== undefined &&
    Array.isArray(row.responseDecisions) &&
    row.responseDecisions.some(decision =>
      Number.isInteger(decision.turn) &&
      decision.turn > row.sourceTriggerTurn);
  return {
    id: row.id, rank: row.rank, repeat: row.repeat,
    candidateSlot: row.candidateSlot, candidateId: row.candidateId,
    status: row.status,
    sourceOpportunitySelected: activated,
    sourceLineSelectorCompleted: declaredComplete,
    sourcePolicyAborted: aborted,
    sourceLockWitness: publicLockWitness,
    evidenceHasAuthenticatedAttackDeclarations: traceAuthenticated,
    sourceActionFollowedByCandidateDecision: continued,
    candidateDeclarationCount: traceAuthenticated ? row.candidateAttackDeclarations : null,
    sourceDeclarationCount: traceAuthenticated ? row.sourceAttackDeclarations : null,
    sourceAppliedDamageObserved: false,
    sourceAppliedKOObserved: false,
    competitiveWinCertified: false
  };
}

/**
 * Audit exactly one fully preregistered three-repeat partition, preserving
 * every missing, blocked, capped and unmatched observation in the denominator.
 * @param {object} report Agent41 frozen archive object.
 * @returns {object}
 */
function auditPartition(report) {
  assert.equal(report?.schema,
    'agent41-crossrank-bilateral-exploratory-observations-v1');
  assert([0, 1].includes(report.partition));
  assert.equal(report.registeredTotal, 48);
  assert.equal(report.partitionScheduled, 24);
  assert.equal(report.seedProtocol, 'aichi-decorrelated-slots-v3');
  assert.equal(report.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(report.preregistration,
    'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json');
  assert.equal(report.competitiveQualifiedGames, 0);
  assert.equal(report.competitiveWinRateCertified, false);
  assert(Array.isArray(report.rows));
  assert.equal(report.rows.length, 24);
  const identities = new Set();
  for (const row of report.rows) {
    assert.equal(typeof row.id, 'string');
    assert(!identities.has(row.id), 'Repeated registered arm: ' + row.id);
    identities.add(row.id);
    assert.equal(row.id,
      [row.rank, row.repeat, row.candidateSlot, row.candidateId].join(':'));
    assert(['A','B'].includes(row.candidateSlot));
    assert(Number.isInteger(row.seed) && row.seed >= 0 &&
      row.seed <= 0xffffffff);
  }
  const rows = report.rows.map(classifyRow);
  const armById = new Map(report.rows.map(row => [row.id, row]));
  const groups = new Map();
  for (const row of rows) {
    const key = [row.rank, row.repeat, row.candidateSlot].join(':');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  assert.equal(groups.size, 12);
  const requiredRepeats = report.partition === 0 ? [0,1,2] : [3,4,5];
  const expectedGroups = EXPECTED_RANKS.flatMap(rank =>
    requiredRepeats.flatMap(repeat => ['A','B'].map(slot =>
      [rank,repeat,slot].join(':'))));
  assert.deepEqual([...groups.keys()].sort(),expectedGroups.sort(),
    'Missing/extra preregistered rank/repeat/seat pair group');
  const paired = [];
  for (const [key, members] of groups) {
    assert.equal(members.length, 2);
    assert.deepEqual(members.map(x => x.candidateId).sort(),
      [...EXPECTED_CANDIDATES].sort());
    const original = members.map(row => armById.get(row.id));
    assert.equal(original[0].seed, original[1].seed);
    const pairComparable = original.every(row => row.status !== 'engine-error' &&
      row.verifiedFirstTurn === true &&
      row.sourceFirstRecordedOwnHandSha256) &&
      original[0].sourceActuallyFirst === original[1].sourceActuallyFirst &&
      original[0].sourceFirstRecordedOwnHandSha256 ===
        original[1].sourceFirstRecordedOwnHandSha256;
    paired.push({
      key, rank: members[0].rank, repeat: members[0].repeat,
      candidateSlot: members[0].candidateSlot,
      comparableOnInitialSourceHandAndRealStarter: Boolean(pairComparable),
      sourceOpportunityInBoth: members.every(x => x.sourceOpportunitySelected),
      sourceOpportunityInOne: members.filter(x => x.sourceOpportunitySelected).length === 1,
      bothSelectorLinesCompleted: members.every(x => x.sourceLineSelectorCompleted),
      bothEngineTerminal: members.every(x => x.status === 'engine-terminal'),
      containsDispatchError: members.some(x => x.status === 'engine-error'),
      causalWinInferencePermitted: false
    });
  }
  const tally = predicate => rows.filter(predicate).length;
  const byRank = Object.fromEntries(EXPECTED_RANKS.map(rank => {
    const local = rows.filter(x => x.rank === rank);
    return [rank, {
      arms: local.length,
      opportunities: local.filter(x => x.sourceOpportunitySelected).length,
      selectorCompletions: local.filter(x => x.sourceLineSelectorCompleted).length,
      sourceAborts: local.filter(x => x.sourcePolicyAborted).length,
      candidateNextDecisions: local.filter(x =>
        x.sourceActionFollowedByCandidateDecision).length,
      trueSourceAttackResolutionVerified: 0
    }];
  }));
  assert.equal(tally(x => x.status === 'engine-terminal'),
    report.statusCounts['engine-terminal']);
  assert.equal(tally(x => x.status === 'action-cap-or-incomplete'),
    report.statusCounts['action-cap-or-incomplete']);
  assert.equal(tally(x => x.status === 'engine-error'),
    report.statusCounts['engine-error']);
  assert.equal(byRank[6].opportunities, report.sourceOpportunityCounts.rank6);
  assert.equal(byRank[11].opportunities, report.sourceOpportunityCounts.rank11);
  assert.equal(paired.filter(x => x.comparableOnInitialSourceHandAndRealStarter).length,
    report.pairedSourceHandAgreement);
  return {
    schema: 'agent41-source-consequence-qualification-gate-v1',
    sourceArchivePartition: report.partition,
    sourceArchiveResearchRevision: report.researchRevision,
    observedArms: rows.length,
    errors: tally(x => x.status === 'engine-error'),
    incomplete: tally(x => x.status === 'action-cap-or-incomplete'),
    terminalOnlyInEngine: tally(x => x.status === 'engine-terminal'),
    sourceSelectedOpportunities: tally(x => x.sourceOpportunitySelected),
    sourceSelectorCompletions: tally(x => x.sourceLineSelectorCompleted),
    sourceAppliedDamageVerified: 0,
    sourceAppliedKOVerified: 0,
    byRank, pairs: paired, rows,
    qualificationVerdict: 'NO-COMPETITIVE-WIN-RATE-EVIDENCE',
    reasons: [
      'Two-armed source policy is limited and generic follow-up actions are not verified as competent',
      'Attack declarations and source policy completion do not establish applied damage, Prize knockouts, or legal follow-up choices',
      'Initial source hand matching does not prove identical Prize/deck states or shared post-opening decision pathways',
      'Incomplete and blocked engine games have no qualified competitive outcomes'
    ]
  };
}

module.exports = {classifyRow, auditPartition};

if (require.main === module) {
  const fs = require('node:fs');
  const filename = process.argv[2];
  assert.equal(typeof filename, 'string',
    'Pass the archived agent41-crossrank-observed.json file path');
  const report = JSON.parse(fs.readFileSync(filename, 'utf8'));
  process.stdout.write(JSON.stringify(auditPartition(report), null, 2) + '
');
}
