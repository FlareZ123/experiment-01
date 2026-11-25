#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DECK_SIZE = 60;
const DEFAULT_PRIZES = 6;

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i += 1) value = value * (n - k + i) / i;
  return value;
}

function cardCount(deck, name) {
  const entry = deck.cards.find(card => card.name === name);
  return entry ? entry.count : 0;
}

function sumCounts(deck, names, knownPublicCounts) {
  return names.reduce((sum, name) => {
    const remaining = cardCount(deck, name) - (knownPublicCounts[name] || 0);
    if (remaining < 0) throw new Error('Known public count exceeds deck count for ' + name);
    return sum + remaining;
  }, 0);
}

/*
 * Exact hypergeometric access prior for explicit ways to clear an attack effect
 * by switching the affected Active Pokemon to the Bench or returning it to hand/deck.
 *
 * knownPublicCount is the total number of cards whose identities are public and
 * outside the hidden hand/deck/unknown-Prize pool. knownPublicCounts records the
 * tracked subset of those cards. Other known public cards are assumed not to be
 * any tracked out.
 *
 * This estimates card access, not the opponent's decision to use an out or a game result.
 */
function estimateSwitchOutAccess(deck, state = {}) {
  const handSize = state.handSize ?? 7;
  const prizeCount = state.prizeCount ?? DEFAULT_PRIZES;
  const knownPublicCount = state.knownPublicCount ?? 0;
  const deckCount = state.deckCount ?? (DECK_SIZE - handSize - prizeCount - knownPublicCount);
  const unknownPoolSize = handSize + deckCount + prizeCount;
  const expectedKnownPublic = DECK_SIZE - unknownPoolSize;
  const knownPublicCounts = state.knownPublicCounts || {};
  const discardCounts = state.discardCounts || {};
  const targetIsBasic = state.targetIsBasic === true;
  const targetDamaged = state.targetDamaged === true;
  const actorBenchCount = state.actorBenchCount ?? 1;
  const opponentBenchCount = state.opponentBenchCount ?? 1;
  const itemPlayLocked = state.itemPlayLocked === true;
  const supporterAvailable = state.supporterAvailable !== false;
  const aceSpecAvailable = state.aceSpecAvailable !== false;

  if (![handSize, deckCount, prizeCount, knownPublicCount, actorBenchCount, opponentBenchCount]
    .every(Number.isInteger) ||
    handSize < 0 || deckCount < 0 || prizeCount < 0 || knownPublicCount < 0 ||
    actorBenchCount < 0 || opponentBenchCount < 0 || unknownPoolSize > DECK_SIZE) {
    throw new Error('Invalid public-state counts');
  }
  if (knownPublicCount !== expectedKnownPublic) {
    throw new Error('Public-state mismatch: expected ' + expectedKnownPublic +
      ' known cards, got ' + knownPublicCount);
  }
  for (const [name, count] of Object.entries(discardCounts)) {
    if (!Number.isInteger(count) || count < 0 || count > (knownPublicCounts[name] || 0)) {
      throw new Error('Discard count for ' + name + ' must be a subset of knownPublicCounts');
    }
  }

  const remaining = name => {
    const count = cardCount(deck, name) - (knownPublicCounts[name] || 0);
    if (count < 0) throw new Error('Known public count exceeds deck count for ' + name);
    return count;
  };

  const supportOutNames = [];
  if (supporterAvailable && actorBenchCount > 0 && opponentBenchCount > 0) supportOutNames.push('Guzma');
  if (supporterAvailable && opponentBenchCount > 0) supportOutNames.push('Cassius');
  if (supporterAvailable && opponentBenchCount > 0 && targetIsBasic) supportOutNames.push('Penny');
  if (supporterAvailable && opponentBenchCount > 0 && targetDamaged) supportOutNames.push('Acerola');

  const itemOutNames = [];
  if (!itemPlayLocked && actorBenchCount > 0 && opponentBenchCount > 0) itemOutNames.push('Escape Rope');
  if (!itemPlayLocked && opponentBenchCount > 0) itemOutNames.push('Switch');
  if (!itemPlayLocked && aceSpecAvailable && opponentBenchCount > 0) itemOutNames.push('Scoop Up Cyclone');

  const supportOutCopies = sumCounts(deck, supportOutNames, knownPublicCounts);
  const itemOutCopies = sumCounts(deck, itemOutNames, knownPublicCounts);
  const directOutCopies = supportOutCopies + itemOutCopies;
  if (directOutCopies > unknownPoolSize) throw new Error('Modeled direct outs exceed unknown pool');

  const totalHands = choose(unknownPoolSize, handSize);
  if (totalHands === 0) throw new Error('No possible hidden hands for supplied state');
  const noDirectHands = choose(unknownPoolSize - directOutCopies, handSize);
  const directOutProbability = 1 - noDirectHands / totalHands;

  const eligibleSupportInDiscard = supportOutNames.filter(name => (discardCounts[name] || 0) > 0);
  const itemAvailable = !itemPlayLocked;
  const vsSeekerRemaining = itemAvailable ? remaining('VS Seeker') : 0;
  const battleCompressorRemaining = itemAvailable ? remaining('Battle Compressor') : 0;
  let vsSeekerDiscardProbability = 0;
  let battleCompressorVsSeekerDeckProbability = 0;

  if (itemAvailable && supporterAvailable && eligibleSupportInDiscard.length > 0 && vsSeekerRemaining > 0) {
    const withVs = 1 - choose(unknownPoolSize - directOutCopies - vsSeekerRemaining, handSize) / totalHands;
    vsSeekerDiscardProbability = Math.max(0, withVs - directOutProbability);
  } else if (itemAvailable && supporterAvailable && eligibleSupportInDiscard.length === 0 &&
      supportOutCopies > 0 && vsSeekerRemaining > 0 && battleCompressorRemaining > 0 && noDirectHands > 0) {
    const noDirectPool = unknownPoolSize - directOutCopies;
    const pBothAccessItems = 1
      - choose(noDirectPool - vsSeekerRemaining, handSize) / noDirectHands
      - choose(noDirectPool - battleCompressorRemaining, handSize) / noDirectHands
      + choose(noDirectPool - vsSeekerRemaining - battleCompressorRemaining, handSize) / noDirectHands;
    const pEligibleSupportInDeck = 1
      - choose(prizeCount, supportOutCopies) / choose(unknownPoolSize - handSize, supportOutCopies);
    battleCompressorVsSeekerDeckProbability =
      (noDirectHands / totalHands) * pBothAccessItems * pEligibleSupportInDeck;
  }

  const totalAccessProbability = directOutProbability + vsSeekerDiscardProbability +
    battleCompressorVsSeekerDeckProbability;
  if (totalAccessProbability < -1e-12 || totalAccessProbability > 1 + 1e-12) {
    throw new Error('Invalid probability ' + totalAccessProbability);
  }

  return {
    handSize, deckCount, prizeCount, knownPublicCount, unknownPoolSize,
    targetIsBasic, targetDamaged, itemPlayLocked, supporterAvailable, aceSpecAvailable,
    actorBenchCount, opponentBenchCount, supportOutNames, itemOutNames,
    supportOutCopies, itemOutCopies, vsSeekerRemaining, battleCompressorRemaining,
    eligibleSupportInDiscard, directOutProbability, vsSeekerDiscardProbability,
    battleCompressorVsSeekerDeckProbability, totalAccessProbability
  };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarize(decks, state) {
  const rows = decks.map(deck => ({
    rank: deck.rank,
    archetype: deck.archetype,
    ...estimateSwitchOutAccess(deck, state)
  }));
  return { listCount: rows.length, meanAccessProbability: mean(rows.map(row => row.totalAccessProbability)), rows };
}

function run(source) {
  if (!Array.isArray(source.decks) || source.decks.length !== source.published_deck_count) {
    throw new Error('Source deck count does not match published_deck_count');
  }
  for (const deck of source.decks) {
    const total = deck.cards.reduce((sum, card) => sum + card.count, 0);
    if (total !== DECK_SIZE) throw new Error('Rank ' + deck.rank + ' has ' + total + ' cards, not 60');
  }

  const regidrago = source.decks.filter(deck => /regidrago/i.test(deck.archetype));
  const staticScenarios = [];
  for (const target of [
    { name: 'non-basic-undamaged', targetIsBasic: false, targetDamaged: false },
    { name: 'basic-undamaged', targetIsBasic: true, targetDamaged: false },
    { name: 'non-basic-damaged', targetIsBasic: false, targetDamaged: true },
    { name: 'basic-damaged', targetIsBasic: true, targetDamaged: true }
  ]) {
    for (const handSize of [6, 7]) {
      const state = { ...target, handSize, deckCount: DECK_SIZE - handSize - DEFAULT_PRIZES,
        prizeCount: DEFAULT_PRIZES, knownPublicCount: 0 };
      staticScenarios.push({
        target: target.name, handSize,
        field: summarize(source.decks, state),
        regidrago: summarize(regidrago, state)
      });
    }
  }

  const publicBase = {
    handSize: 7, deckCount: 30, prizeCount: 6, knownPublicCount: 17,
    actorBenchCount: 1, opponentBenchCount: 1, targetDamaged: false
  };
  const publicScenarios = [];
  for (const target of [
    { name: 'non-basic-undamaged', targetIsBasic: false },
    { name: 'basic-undamaged', targetIsBasic: true }
  ]) {
    for (const known of [
      { name: '17 known public non-outs', knownPublicCounts: {}, discardCounts: {} },
      { name: 'one Guzma in discard plus 16 known non-outs',
        knownPublicCounts: { Guzma: 1 }, discardCounts: { Guzma: 1 } }
    ]) {
      const state = { ...publicBase, ...target, ...known };
      publicScenarios.push({
        name: target.name + ': ' + known.name,
        field: summarize(source.decks, state),
        regidrago: summarize(regidrago, state),
        selectedRanks: [2, 3, 10].map(rank => {
          const deck = source.decks.find(row => row.rank === rank);
          return { rank, archetype: deck.archetype, ...estimateSwitchOutAccess(deck, state) };
        })
      });
    }
  }

  return {
    source: {
      publishedDeckCount: source.published_deck_count,
      totalPlacements: source.total_placements,
      missingFullLists: source.missing_full_lists
    },
    assumptions: {
      model: 'hypergeometric hidden-zone access prior; not an execution rate or game probability',
      explicitOuts: ['Guzma', 'Cassius', 'Penny (Basic targets only)', 'Acerola (damaged targets only)',
        'Escape Rope', 'Switch', 'Scoop Up Cyclone'],
      retrieval: 'VS Seeker + an eligible Supporter in discard, or Battle Compressor + VS Seeker + an eligible Supporter in deck',
      staticState: 'no public history, six unknown Prizes, legal benches, Item/Supporter access, ACE SPEC unused',
      publicStateExample: 'H=7, D=30, P=6, 17 known public cards; either all 17 are non-outs or one is a Guzma in discard',
      omissions: ['Guzma & Hala searching a Float Stone in rank 15', 'other unlisted return/switch effects',
        'draw/search beyond the modeled BC + VS line', 'actual opponent choice and game execution']
    },
    staticScenarios,
    publicScenarios
  };
}

if (require.main === module) {
  const sourcePath = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  process.stdout.write(JSON.stringify(run(source), null, 2) + '\\n');
}

module.exports = { choose, estimateSwitchOutAccess, run };
