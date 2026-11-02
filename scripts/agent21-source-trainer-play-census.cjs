'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const SCHEMA = 'agent21-exact-source-trainer-native-play-census-v1';

/**
 * Census of genuine post-dispatch printed source cards played from hand.
 * This detects noncoverage without guessing what held resources were legal.
 * The roster supplies actual original printings; unknown card names remain
 * unclassified instead of being silently interpreted as Trainer negatives.
 * @param {object} archive Native all-attempt release JSON.
 * @param {object} roster Authentic original printed sixties.
 * @returns {object} Read-only native root disposition.
 */
function censusSourceTrainerRoots(archive, roster) {
  assert.ok(archive && Array.isArray(archive.attempts));
  assert.ok(roster && Array.isArray(roster.decks));
  const attempts = [];
  const totals = {
    nativeRoots: 0, sourcePassRoots: 0, sourcePlayRoots: 0,
    sourcePokemonPlays: 0, sourceTrainerPlays: 0,
    sourceEnergyPlays: 0, unknownSourcePlayRoots: 0,
    sourceAttackRoots: 0, rosterTrainerSlots: null
  };
  for (const attempt of archive.attempts) {
    const trial = attempt.trial;
    assert.ok(trial && Number.isInteger(trial.rank));
    assert.ok(trial.candidateSlot === 'A' || trial.candidateSlot === 'B');
    const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
    assert.equal(attempt.sourceSeat, sourceSeat,
      'Archived source playing seat differs from registered trial');
    const sourceDeck = roster.decks.find(deck => deck.rank === trial.rank);
    assert.ok(sourceDeck && Array.isArray(sourceDeck.cards),
      'Missing authenticated exact original source roster');
    assert.equal(sourceDeck.cards.reduce((n, c) => n + c.count, 0), 60);
    const names = new Map();
    for (const card of sourceDeck.cards) {
      assert.ok(['Pokémon', 'Trainer', 'Energy'].includes(card.category));
      if (names.has(card.name))
        assert.equal(names.get(card.name), card.category,
          'Same native name appears in different original categories');
      names.set(card.name, card.category);
    }
    const trainerSlots = sourceDeck.cards.filter(c =>
      c.category === 'Trainer').reduce((n, c) => n + c.count, 0);
    if (totals.rosterTrainerSlots === null) totals.rosterTrainerSlots = trainerSlots;
    else if (trial.rank === archive.attempts[0].trial.rank)
      assert.equal(totals.rosterTrainerSlots, trainerSlots);
    const row = attempt.rawNativeRow;
    assert.ok(row && Array.isArray(row.rootActionLedger),
      'A native attempt is missing its genuine root ledger');
    assert.equal(row.rootActionLedger.length, row.rootActionCount,
      'Native public root ledger is truncated');
    const played = row.rootActionLedger.filter(root =>
      root.playerSlot === sourceSeat && root.action === 'PlayCardAction');
    const pass = row.rootActionLedger.filter(root =>
      root.playerSlot === sourceSeat && root.action === 'PassTurnAction').length;
    const attacks = row.rootActionLedger.filter(root =>
      root.playerSlot === sourceSeat && root.action === 'AttackAction').length;
    const categoryCounts = {Pokémon: 0, Trainer: 0, Energy: 0, UNKNOWN: 0};
    const unknown = [];
    for (const root of played) {
      const category = names.get(root.card);
      if (category) categoryCounts[category]++;
      else {
        categoryCounts.UNKNOWN++;
        unknown.push({ordinal: root.actionOrdinal, card: root.card ?? null});
      }
    }
    totals.nativeRoots += row.rootActionLedger.length;
    totals.sourcePassRoots += pass;
    totals.sourcePlayRoots += played.length;
    totals.sourcePokemonPlays += categoryCounts.Pokémon;
    totals.sourceTrainerPlays += categoryCounts.Trainer;
    totals.sourceEnergyPlays += categoryCounts.Energy;
    totals.unknownSourcePlayRoots += categoryCounts.UNKNOWN;
    totals.sourceAttackRoots += attacks;
    attempts.push({
      id: trial.id, sourceSeat, candidateSlot: trial.candidateSlot,
      nativeRootCount: row.rootActionLedger.length,
      sourcePassRoots: pass, sourceAttackRoots: attacks,
      sourcePlayRoots: played.length, sourceCardCategoryCounts: categoryCounts,
      sourceUnclassifiedPrintedNames: unknown,
      nativeDisposition: attempt.status,
      competitiveGameQualified: false
    });
  }
  return {
    schema: SCHEMA, archiveSchema: archive.schema,
    attempts, totalAttempts: attempts.length, totals,
    allNativeSourcePlayRootsCategorized: totals.unknownSourcePlayRoots === 0,
    sourceTrainerOpportunityInHandVerified: false,
    sourceTrainerPlayObserved: totals.sourceTrainerPlays > 0,
    paperLegalPaymentVerified: false, policyCompetenceCertified: false,
    competitiveGames: 0,
    caveat: 'Zero played Trainers cannot prove Trainer opportunities existed in owner hand or that the available Trainer payment was legal'
  };
}

if (require.main === module) {
  const [archivePath, rosterPath] = process.argv.slice(2);
  assert.ok(archivePath && rosterPath,
    'Supply archived native JSON and authenticated source roster JSON');
  const result = censusSourceTrainerRoots(
    JSON.parse(fs.readFileSync(archivePath, 'utf8')),
    JSON.parse(fs.readFileSync(rosterPath, 'utf8')));
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = {SCHEMA, censusSourceTrainerRoots};
