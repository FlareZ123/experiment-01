'use strict';

const assert = require('node:assert/strict');

/**
 * Fail-closed proof from a saved genuine Store root transcript.
 * Replays neither gameplay nor policy; sees deck contents only through a
 * logged owner-deck K1 search prompt.
 * @param {object} record The frozen original-source rank15 Poffin archive.
 * @returns {object} Audited summary, never a competitive result.
 */
function auditRank15PoffinChoice(record) {
  assert.equal(record.schema, 'rank15-retrospective-true-source-paid-tm-poffin-fork-v2');
  assert.equal(record.sourceRank, 15);
  assert.equal(record.sourceSeat, 1);
  assert.equal(record.seed, 3050400820);
  assert.equal(record.identicalOriginalPrepolicyPhysicalDeal, true);
  assert.equal(record.qualifications?.competitiveGamesQualified, 0);
  assert.equal(record.sourceInitialPrizeGate?.beforeTakingPrizesEligible, true);
  for (const key of ['oddishPrized', 'gloomPrized', 'aorPrized', 'busPrized']) {
    assert.equal(record.sourceInitialPrizeGate[key], 0);
  }
  assert.equal(record.original?.actualRootPoffinItemPlays, 0);
  assert.equal(record.poffinAlternative?.actualRootPoffinItemPlays, 1);
  assert.equal(record.original?.nativeEvolutionDeclarations, 0);
  assert.equal(record.poffinAlternative?.nativeEvolutionDeclarations, 1);
  assert.equal(record.policyAttempts?.length, 1);
  assert.equal(record.policyAttempts[0].valid, true);
  assert.equal(record.policyAttempts[0].freeBench, 3);
  assert.ok(record.policyAttempts[0].ownerHand.includes('Buddy-Buddy Poffin TEF'));
  const trace = record.originalRootChoiceWindow;
  assert.ok(Array.isArray(trace) && trace.length);
  for (let i = 1; i < trace.length; i++) {
    assert.ok(trace[i].rootOrdinal > trace[i - 1].rootOrdinal,
      'Genuine root ordinals must be increasing');
  }
  const first = predicate => trace.find(predicate);
  const played = first(x => x.action === 'PlayCardAction' &&
    x.sourceCard === 'Buddy-Buddy Poffin TEF');
  assert.ok(played, 'Missing genuine root Poffin play');
  const search = first(x => x.rootOrdinal > played.rootOrdinal &&
    x.previousPrompt === 'ChooseCardsPrompt' &&
    x.action === 'ResolvePromptAction' && x.promptWasOwnDeck === true);
  assert.ok(search, 'Missing authentic source-owned K1 Poffin search');
  assert.deepEqual(search.ownerSearchStageCounts,
    {oddish: 2, gloom: 2, aor: 2, bus: 1});
  assert.deepEqual(search.selectedPrintedCards, ['Budew ASC', 'Buneary M2']);
  assert.equal(search.before.bench.filter(x => x === null).length, 3);
  assert.ok(search.after.bench.includes('Buneary M2'));
  assert.ok(!search.after.bench.includes('Oddish UNB'));
  const attack = first(x => x.rootOrdinal > search.rootOrdinal &&
    x.action === 'AttackAction');
  assert.ok(attack, 'Missing genuine postsearch native attack');
  const target = first(x => x.rootOrdinal > attack.rootOrdinal &&
    x.previousPrompt === 'ChoosePokemonPrompt' &&
    x.action === 'ResolvePromptAction');
  assert.ok(target, 'Missing TM target choice');
  assert.deepEqual(target.selectedPrintedCards, ['Buneary M2']);
  const evolve = first(x => x.rootOrdinal > target.rootOrdinal &&
    x.previousPrompt === 'ChooseCardsPrompt' &&
    x.action === 'ResolvePromptAction' && x.promptWasOwnDeck === true);
  assert.ok(evolve, 'Missing native source-owned Stage1 choice');
  assert.deepEqual(evolve.selectedPrintedCards, ['Mega Lopunny ex M2']);
  assert.ok(evolve.after.bench.includes('Mega Lopunny ex M2'));
  assert.ok(!evolve.after.bench.includes('Oddish UNB'));
  return {
    schema: 'rank15-poffin-k1-verified-missed-target-v1',
    sourceRank: 15, seed: 3050400820,
    scope: 'one retrospectively selected native owner-visible search, not game strength',
    observerRootOrdinals: {
      poffinPlay: played.rootOrdinal, poffinSearch: search.rootOrdinal,
      evolutionAttack: attack.rootOrdinal,
      tmTargetChoice: target.rootOrdinal, stage1Search: evolve.rootOrdinal
    },
    sourceOwnDeckAvailable: {...search.ownerSearchStageCounts},
    poffinSelected: [...search.selectedPrintedCards],
    evolutionTarget: [...target.selectedPrintedCards],
    stage1Selected: [...evolve.selectedPrintedCards],
    physicallyAvailableOddishNotChosen:
      search.ownerSearchStageCounts.oddish === 2 &&
      !search.selectedPrintedCards.includes('Oddish UNB'),
    competitivePolicyQualified: false
  };
}

module.exports = {auditRank15PoffinChoice};
