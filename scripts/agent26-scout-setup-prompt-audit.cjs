'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent26-frozen32-readonly-setup-divergence-v1';
const EXPECTED_SCOUT = 'agent41-preregistered-32-arm-canonical-scout-v1';

/**
 * Read only the original, native-observed starting Active-and-Bench Basic selections.
 * These are postgame evidence; no player-policy component may consume them.
 *
 * @param {object} row An original frozen Store arm from the immutable archive.
 * @returns {{cards:string[],promptOrdinal:number|null,sourceSeat:number}}
 */
function sourceSetupBasicSelection(row) {
  assert.ok(row && (row.sourceSeat === 0 || row.sourceSeat === 1));
  const events = row.nativePromptChoices?.events;
  assert.ok(Array.isArray(events), 'Native prompt evidence is required');
  const eligible = events.filter(event =>
    event.turn === 0 && event.actorSeat === row.sourceSeat &&
    event.kind === 'ChooseCardsPrompt' &&
    event.sourceZone === 'hand');
  assert.equal(eligible.length, 1,
    'Expected one observed source starting Active-and-Bench choice prompt');
  const event = eligible[0];
  assert.ok(Array.isArray(event.selectedCards));
  assert.ok(event.selectedCards.every(card => typeof card === 'string'));
  assert.equal(event.sourceZoneCardCountBefore, 7,
    'Observed setup selection must originate from initial seven-card hand');
  return {cards: [...event.selectedCards],
    promptOrdinal: event.ordinal, sourceSeat: row.sourceSeat};
}

/**
 * Audit original raw native evidence without rerunning, selecting or editing
 * game outcomes. Fingerprint mismatches are NOT per se corruption: candidate
 * mulligans and optional opponent draws are legitimate posttreatment causes.
 *
 * @param {object} archive The original 32-arm preregistered JSON archive.
 * @returns {object} All-pair, failure-visible public setup census.
 */
function auditFrozenScoutSetup(archive) {
  assert.equal(archive?.schema, EXPECTED_SCOUT);
  const result = archive.developmentResult;
  assert.ok(Array.isArray(result?.rows));
  assert.ok(Array.isArray(result?.sourcePairs));
  assert.equal(result.rows.length, 32);
  assert.equal(result.sourcePairs.length, 16);
  const rows = new Map(result.rows.map(row => [row.trial.id, row]));
  assert.equal(rows.size, 32);
  const outcomes = [];
  for (const sourcePair of result.sourcePairs) {
    const prefix = sourcePair.pairId;
    const c = rows.get(prefix + ':champion-reference');
    const n = rows.get(prefix + ':new-moon-lockbreaker-v1');
    assert.ok(c && n, 'Frozen pair is missing an arm');
    assert.equal(c.trial.seed, n.trial.seed);
    assert.equal(c.trial.rank, n.trial.rank);
    assert.equal(c.trial.candidateSlot, n.trial.candidateSlot);
    assert.equal(c.sourceSeat, n.sourceSeat);
    assert.equal(c.sourceDeckFingerprint, n.sourceDeckFingerprint);
    assert.equal(c.verifiedFirstTurn, true);
    assert.equal(n.verifiedFirstTurn, true);
    assert.equal(c.actualStarterSeat, n.actualStarterSeat);
    assert.equal(sourcePair.sameSourcePhysicalDeal,
      c.sourceDealFingerprint === n.sourceDealFingerprint);
    const champion = sourceSetupBasicSelection(c);
    const newMoon = sourceSetupBasicSelection(n);
    const sameSourceSetupBasicSelection = JSON.stringify(champion.cards) ===
      JSON.stringify(newMoon.cards);
    const sameSourcePhysicalDeal = sourcePair.sameSourcePhysicalDeal;
    outcomes.push({
      pairId: prefix,rank: c.trial.rank,repeat: c.trial.repeat,
      seed:c.trial.seed,physicalCandidateSlot:c.trial.candidateSlot,
      sourceSeat:c.sourceSeat,actualStarterSeat:c.actualStarterSeat,
      sameSourcePhysicalDeal,sameSourceSetupBasicSelection,
      championSelectedSetupBasics:champion.cards,
      newMoonSelectedSetupBasics:newMoon.cards,
      championSetupPromptOrdinal:champion.promptOrdinal,
      newMoonSetupPromptOrdinal:newMoon.promptOrdinal,
      bothNativeFinished:c.finished === true && n.finished === true,
      // These are unqualified game records and must not count as wins.
      competitiveQualified:false
    });
  }
  assert.equal(outcomes.length, 16);
  const setupDifferent = outcomes.filter(p => !p.sameSourceSetupBasicSelection);
  const dealDifferent = outcomes.filter(p => !p.sameSourcePhysicalDeal);
  return {
    schema:VERSION,sourceArchive:archive.registrationPath,
    totalPairs:outcomes.length,matchingSourcePhysicalDeals:
      outcomes.length-dealDifferent.length,
    divergentSourcePhysicalDeals:dealDifferent.length,
    matchingObservedSourceSetupBasicChoices:
      outcomes.length-setupDifferent.length,
    divergentObservedSourceSetupBasicChoices:setupDifferent.length,
    mismatchPairIds:dealDifferent.map(p => p.pairId),
    divergentSetupPairIds:setupDifferent.map(p => p.pairId),
    rows:outcomes,competitiveQualifiedGames:0,
    caveat:'Setup prompt selections demonstrate physical source starting Active/Bench roster-choice differences, not why the source initial hands diverged. Original draw/mulligan causes are not independently identified. This is a postgame readonly audit, not policy input.'
  };
}

if (require.main === module) {
  const fs = require('node:fs');
  const source = process.argv[2];
  assert.ok(source, 'Supply the unchanged original 32-arm JSON archive');
  const result = auditFrozenScoutSetup(JSON.parse(fs.readFileSync(source, 'utf8')));
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = {VERSION,sourceSetupBasicSelection,auditFrozenScoutSetup};
