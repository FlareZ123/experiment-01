"use strict";

const assert = require('node:assert/strict');
const rank11 = require('../results/aichi-2026/full-decklists.json').decks
  .find(deck => deck.rank === 11);
const sourceTrainerNames = new Set(rank11.cards
  .filter(card => card.category === 'Trainer').map(card => card.name));

/**
 * Audit genuine accepted Store roots on the rank-11 source's first turn.
 * Pair the two fixed source-deal fingerprints before collapsing candidate
 * arms to independent deal units. Hidden hands cannot be reconstructed from
 * the provided SHA fingerprints.
 *
 * @param {object} archive Parsed agent41-prospective-canonical-32.json.
 * @returns {object}
 */
function rank11FirstTurnCensus(archive) {
  assert.equal(archive.schema, 'agent41-preregistered-32-arm-canonical-scout-v1');
  assert.equal(archive.registrationBlob, '8c54d8497f9927b04d501237462f64a42173d33d');
  assert.equal(archive.developmentResult.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(archive.developmentResult.rows.length, 32);
  const rank11Arms = archive.developmentResult.rows.filter(row => row.trial.rank === 11);
  assert.equal(rank11Arms.length, 16);
  const grouped = new Map();
  for (const row of rank11Arms) {
    assert.equal(row.verifiedFirstTurn, true);
    assert.ok(row.sourceSeat === 0 || row.sourceSeat === 1);
    assert.equal(row.status, undefined);
    const key = [row.trial.rank, row.trial.repeat, row.trial.candidateSlot,
      row.trial.seed].join(':');
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  assert.equal(grouped.size, 8);
  const pairs = [];
  for (const [key, arms] of grouped) {
    assert.equal(arms.length, 2);
    assert.deepEqual(arms.map(row => row.trial.candidateId).sort(),
      ['champion-reference', 'new-moon-lockbreaker-v1']);
    const first = arms[0];
    const sourceTurn = first.sourceActuallyFirst ? 1 : 2;
    const sourceRoots = arms.map(row => {
      assert.equal(row.sourceActuallyFirst, first.sourceActuallyFirst);
      assert.equal(row.sourceSeat, first.sourceSeat);
      assert.equal(row.sourceDealFingerprint, first.sourceDealFingerprint);
      return row.rootActionLedger.filter(root =>
        root.playerSlot === row.sourceSeat &&
        root.turnBefore === sourceTurn && root.pendingPrompt === null)
        .map(root => ({action: root.action, card: root.card ?? null,
          attack: root.attack ?? null, ability: root.ability ?? null}));
    });
    assert.deepEqual(sourceRoots[0], sourceRoots[1],
      'Only a root-action-label identity, not whole-game physical equivalence');
    const complete = arms.map(row => row.sourceAudit.completed === true);
    assert.equal(complete[0], complete[1]);
    const passes = arms.map(row =>
      row.sourceOwnerPostPassMobility.observations.filter(obs =>
        obs.globalTurn === sourceTurn));
    const stripOrdinal = observations => observations.map(obs => ({
      globalTurn: obs.globalTurn, activeName: obs.activeName,
      benchNames: obs.benchNames, mobilityHeld: obs.mobilityHeld
    }));
    assert.deepEqual(stripOrdinal(passes[0]), stripOrdinal(passes[1]),
      'Owner-visible first source-pass observations agree without raw ordinals');
    pairs.push({
      registeredCell: key,
      sourceDealSha256: first.sourceDealFingerprint,
      sourceSeat: first.sourceSeat,
      sourceTurn,
      sourceActuallyFirst: first.sourceActuallyFirst,
      setupSourceBasicChoices: first.nativePromptChoices.events.filter(event =>
        event.turn === 0 && event.actorSeat === first.sourceSeat &&
        event.kind === 'ChooseCardsPrompt' && event.sourceZone === 'hand')
        .flatMap(event => event.selectedCards),
      firstSourceTurnRootActions: sourceRoots[0],
      firstSourceTurnItemOrSupporterPlayCount: sourceRoots[0].filter(root =>
        root.action === 'PlayCardAction' && sourceTrainerNames.has(root.card)).length,
      firstSourceTurnEndedByPass: sourceRoots[0].some(root =>
        root.action === 'PassTurnAction'),
      firstSourceTurnPassPublicObservations: passes[0].map(obs => ({
        activeName: obs.activeName,
        benchNames: obs.benchNames,
        floatStoneHeld: obs.mobilityHeld['Float Stone']
      })),
      directShakeCompletedInBothArms: complete[0],
      directShakeRoute: first.sourceAudit.route
    });
  }
  pairs.sort((a, b) => a.registeredCell.localeCompare(b.registeredCell));
  const sourceFirst = pairs.filter(pair => pair.sourceActuallyFirst);
  const sourceSecond = pairs.filter(pair => !pair.sourceActuallyFirst);
  return {
    schema: 'agent21-rank11-preregistered-first-own-turn-root-census-v1',
    evidence: 'Native original-Store accepted roots and read-only source-owner post-Pass observations',
    sourceRank: 11,
    originalGameArms: rank11Arms.length,
    distinctSourceDeals: pairs.length,
    pairedSourceDealsIdentical: pairs.length,
    pairedFirstSourceTurnRootLabelsIdentical: pairs.length,
    sourceFirstDistinctDeals: sourceFirst.length,
    sourceSecondDistinctDeals: sourceSecond.length,
    sourceFirstItemOrSupporterRootPlays: sourceFirst.reduce((n, pair) =>
      n + pair.firstSourceTurnItemOrSupporterPlayCount, 0),
    sourceFirstFirstTurnPasses: sourceFirst.filter(pair =>
      pair.firstSourceTurnEndedByPass).length,
    sourceFirstDirectShakeCompletions: sourceFirst.filter(pair =>
      pair.directShakeCompletedInBothArms).length,
    sourceSecondDirectShakeCompletions: sourceSecond.filter(pair =>
      pair.directShakeCompletedInBothArms).length,
    sourceFirstPassesWithFloatStoneHeld: sourceFirst.filter(pair =>
      pair.firstSourceTurnPassPublicObservations.some(obs =>
        obs.floatStoneHeld > 0)).length,
    sourceFirstPassesWithOranguruActive: sourceFirst.filter(pair =>
      pair.firstSourceTurnPassPublicObservations.some(obs =>
        obs.activeName === 'Oranguru V')).length,
    pairs,
    scope: 'The archive omits pre-choice full owner hands: no counterfactual legal-action inference, policy success rate, paper-clock qualification or competitive win rate.'
  };
}

if (require.main === module) {
  const fs = require('node:fs');
  const archive = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  process.stdout.write(JSON.stringify(rank11FirstTurnCensus(archive), null, 2) + '\n');
}
module.exports = {rank11FirstTurnCensus};
