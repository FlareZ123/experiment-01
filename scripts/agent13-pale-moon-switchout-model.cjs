#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DECK_SIZE = 60;
const DEFAULT_PRIZES = 6;
const STADIUM_NAMES = new Set([
  'Path to the Peak', 'Silent Lab', 'Temple of Sinnoh', 'Sky Field', 'Parallel City',
  'Dimension Valley', 'Shrine of Punishment', 'Thunder Mountain', 'Wondrous Labyrinth',
  'Galar Mine', 'Skyarrow Bridge', 'Viridian Forest', 'Collapsed Stadium', 'Stadium Nav',
  'Altar of the Moone', 'Fairy Garden', 'Dark City', "Champion's Room", "Team Aqua's Secret Base",
  "Team Magma's Secret Base", "Team Galactic's Wager", 'Tower of Waters', 'Beach Court',
  'Calamitous Wasteland', 'Mount Lanakila', 'Paradise Resort'
]);
const SPECIAL_ENERGY_NAMES = new Set([
  'Jet Energy', 'Capture Energy', 'Powerful Colorless Energy', 'Double Colorless Energy',
  'Double Dragon Energy', 'Rainbow Energy', 'Aurora Energy', 'Unit Energy {GFW}',
  'Unit Energy {LPM}', 'Unit Energy {GRW}', 'Strong Energy', 'Mystery Energy', 'Prism Energy',
  'Flash Energy', 'Splash Energy', 'Herbal Energy', 'Wonder Energy', 'Shield Energy',
  'Counter Energy', 'Recycle Energy', 'Triple Acceleration Energy', 'Twin Energy',
  'Rapid Strike Energy', 'Single Strike Energy', 'Fusion Strike Energy', 'Luminous Energy',
  'Legacy Energy', 'Double Turbo Energy', 'Beast Energy Prism Star'
]);

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i += 1) value = value * (n - k + i) / i;
  return value;
}

function factorial(n) {
  let value = 1n;
  for (let i = 2; i <= n; i += 1) value *= BigInt(i);
  return value;
}

function multinomial(n, h, d, p) {
  return factorial(n) / (factorial(h) * factorial(d) * factorial(p));
}

function distributions(count) {
  const out = [];
  for (let hand = 0; hand <= count; hand += 1) {
    for (let deck = 0; deck <= count - hand; deck += 1) {
      const prizes = count - hand - deck;
      out.push({ hand, deck, prizes, ways: multinomial(count, hand, deck, prizes) });
    }
  }
  return out;
}

function cardCount(deck, name) {
  const entry = deck.cards.find(card => card.name === name);
  return entry ? entry.count : 0;
}

function remainingCount(deck, name, knownPublicCounts) {
  const count = cardCount(deck, name) - (knownPublicCounts[name] || 0);
  if (count < 0) throw new Error('Known public count exceeds deck count for ' + name);
  return count;
}

/*
 * Exact hypergeometric access prior for direct effect resets, switches and returns
 * that can clear Pale Moon-GX's delayed attack effect.
 * actorBenchCount is the affected player's Bench; opponentBenchCount is the other player's Bench.
 * knownPublicCount is the total number of cards outside the hidden hand/deck/unknown-Prize pool.
 */
function estimatePaleMoonEscapeAccess(deck, state = {}) {
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

  const supportOutNames = [];
  if (supporterAvailable && actorBenchCount > 0 && opponentBenchCount > 0 && cardCount(deck, 'Guzma') > 0) {
    supportOutNames.push('Guzma');
  }
  if (supporterAvailable && actorBenchCount > 0 && cardCount(deck, 'Cassius') > 0) supportOutNames.push('Cassius');
  if (supporterAvailable && cardCount(deck, 'Pokémon Ranger') > 0) supportOutNames.push('Pokémon Ranger');
  if (supporterAvailable && actorBenchCount > 0 && targetIsBasic && cardCount(deck, 'Penny') > 0) {
    supportOutNames.push('Penny');
  }
  if (supporterAvailable && actorBenchCount > 0 && targetDamaged && cardCount(deck, 'Acerola') > 0) {
    supportOutNames.push('Acerola');
  }

  const itemOutNames = [];
  if (!itemPlayLocked && actorBenchCount > 0) {
    if (cardCount(deck, 'Escape Rope') > 0) itemOutNames.push('Escape Rope');
    if (cardCount(deck, 'Switch') > 0) itemOutNames.push('Switch');
  }
  if (!itemPlayLocked && aceSpecAvailable && actorBenchCount > 0 && cardCount(deck, 'Scoop Up Cyclone') > 0) {
    itemOutNames.push('Scoop Up Cyclone');
  }
  if (!itemPlayLocked && aceSpecAvailable && actorBenchCount > 0 && opponentBenchCount > 0 &&
      cardCount(deck, 'Prime Catcher') > 0) {
    itemOutNames.push('Prime Catcher');
  }

  const supportOutCopies = supportOutNames.reduce((sum, name) =>
    sum + remainingCount(deck, name, knownPublicCounts), 0);
  const itemOutCopies = itemOutNames.reduce((sum, name) =>
    sum + remainingCount(deck, name, knownPublicCounts), 0);
  const directOutCopies = supportOutCopies + itemOutCopies;
  if (directOutCopies > unknownPoolSize) throw new Error('Modeled direct outs exceed unknown pool');

  const totalHands = choose(unknownPoolSize, handSize);
  if (totalHands === 0) throw new Error('No possible hidden hands for supplied state');
  const noDirectHands = choose(unknownPoolSize - directOutCopies, handSize);
  const directOutProbability = 1 - noDirectHands / totalHands;

  const eligibleSupportInDiscard = supportOutNames.filter(name => (discardCounts[name] || 0) > 0);
  const itemAvailable = !itemPlayLocked;
  const vsSeekerRemaining = itemAvailable ? remainingCount(deck, 'VS Seeker', knownPublicCounts) : 0;
  const battleCompressorRemaining = itemAvailable ? remainingCount(deck, 'Battle Compressor', knownPublicCounts) : 0;
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

function estimateFloatStoneSearchAccess(deck, state = {}) {
  const handSize = state.handSize ?? 7;
  const prizeCount = state.prizeCount ?? DEFAULT_PRIZES;
  const knownPublicCount = state.knownPublicCount ?? 0;
  const deckCount = state.deckCount ?? (DECK_SIZE - handSize - prizeCount - knownPublicCount);
  const unknownPoolSize = handSize + deckCount + prizeCount;
  const expectedKnownPublic = DECK_SIZE - unknownPoolSize;
  const knownPublicCounts = state.knownPublicCounts || {};
  const targetToolSlotOpen = state.targetToolSlotOpen === true;
  const toolEffectsActive = state.toolEffectsActive !== false;
  const retreatPermitted = state.retreatPermitted !== false;
  const supporterAvailable = state.supporterAvailable !== false;

  if (![handSize, deckCount, prizeCount, knownPublicCount].every(Number.isInteger) ||
      handSize < 0 || deckCount < 0 || prizeCount < 0 || knownPublicCount < 0 || unknownPoolSize > DECK_SIZE) {
    throw new Error('Invalid Float Stone public-state counts');
  }
  if (knownPublicCount !== expectedKnownPublic) {
    throw new Error('Float Stone public-state mismatch: expected ' + expectedKnownPublic +
      ' known cards, got ' + knownPublicCount);
  }

  const floatStone = remainingCount(deck, 'Float Stone', knownPublicCounts);
  const arven = supporterAvailable && state.arvenSearchLegal !== false
    ? remainingCount(deck, 'Arven', knownPublicCounts) : 0;
  const guzmaHala = supporterAvailable && state.guzmaHalaSearchLegal !== false && handSize >= 3
    ? remainingCount(deck, 'Guzma & Hala', knownPublicCounts) : 0;
  const stadiumCount = deck.cards.filter(card => STADIUM_NAMES.has(card.name)).reduce((sum, card) =>
    sum + Math.max(0, card.count - (knownPublicCounts[card.name] || 0)), 0);
  const specialEnergyCount = deck.cards.filter(card => SPECIAL_ENERGY_NAMES.has(card.name)).reduce((sum, card) =>
    sum + Math.max(0, card.count - (knownPublicCounts[card.name] || 0)), 0);
  const usableGuzmaHala = stadiumCount > 0 && specialEnergyCount > 0 ? guzmaHala : 0;
  const live = targetToolSlotOpen && toolEffectsActive && retreatPermitted;

  if (!live || floatStone === 0) {
    return {
      handSize, deckCount, prizeCount, knownPublicCount, targetToolSlotOpen, toolEffectsActive,
      retreatPermitted, floatStoneCopies: floatStone, arvenSearchers: arven,
      guzmaHalaSearchers: usableGuzmaHala, stadiumCopies: stadiumCount, specialEnergyCopies: specialEnergyCount,
      pFloatStoneInHand: 0, pArvenSearch: 0, pGuzmaHalaSearch: 0, totalAccessProbability: 0
    };
  }

  const other = unknownPoolSize - floatStone - arven - usableGuzmaHala - stadiumCount - specialEnergyCount;
  if (other < 0) throw new Error('Tracked Float Stone search cards exceed unknown pool');
  const floatDistributions = distributions(floatStone);
  const arvenDistributions = distributions(arven);
  const guzmaHalaDistributions = distributions(usableGuzmaHala);
  const stadiumDistributions = distributions(stadiumCount);
  const specialEnergyDistributions = distributions(specialEnergyCount);
  const denominator = multinomial(unknownPoolSize, handSize, deckCount, prizeCount);
  let floatHandWays = 0n;
  let arvenSearchWays = 0n;
  let guzmaHalaSearchWays = 0n;

  for (const f of floatDistributions) {
    for (const a of arvenDistributions) {
      for (const g of guzmaHalaDistributions) {
        for (const s of stadiumDistributions) {
          for (const e of specialEnergyDistributions) {
          const otherHand = handSize - f.hand - a.hand - g.hand - s.hand - e.hand;
          const otherDeck = deckCount - f.deck - a.deck - g.deck - s.deck - e.deck;
          const otherPrizes = prizeCount - f.prizes - a.prizes - g.prizes - s.prizes - e.prizes;
          if (otherHand < 0 || otherDeck < 0 || otherPrizes < 0 ||
              otherHand + otherDeck + otherPrizes !== other) continue;
          const ways = f.ways * a.ways * g.ways * s.ways * e.ways *
            multinomial(other, otherHand, otherDeck, otherPrizes);
          if (f.hand > 0) floatHandWays += ways;
          else if (f.deck > 0 && a.hand > 0) arvenSearchWays += ways;
          else if (f.deck > 0 && g.hand > 0 && s.deck > 0 && e.deck > 0) guzmaHalaSearchWays += ways;
          }
        }
      }
    }
  }

  const denominatorNumber = Number(denominator);
  const pFloatStoneInHand = Number(floatHandWays) / denominatorNumber;
  const pArvenSearch = Number(arvenSearchWays) / denominatorNumber;
  const pGuzmaHalaSearch = Number(guzmaHalaSearchWays) / denominatorNumber;
  return {
    handSize, deckCount, prizeCount, knownPublicCount, targetToolSlotOpen, toolEffectsActive,
    retreatPermitted, floatStoneCopies: floatStone, arvenSearchers: arven,
    guzmaHalaSearchers: usableGuzmaHala, stadiumCopies: stadiumCount, specialEnergyCopies: specialEnergyCount,
    pFloatStoneInHand, pArvenSearch, pGuzmaHalaSearch,
    totalAccessProbability: pFloatStoneInHand + pArvenSearch + pGuzmaHalaSearch
  };
}

function estimateUTurnBoardAccess(deck, state = {}) {
  const handSize = state.handSize ?? 7;
  const prizeCount = state.prizeCount ?? DEFAULT_PRIZES;
  const knownPublicCount = state.knownPublicCount ?? 0;
  const deckCount = state.deckCount ?? (DECK_SIZE - handSize - prizeCount - knownPublicCount);
  const unknownPoolSize = handSize + deckCount + prizeCount;
  const knownPublicCounts = state.knownPublicCounts || {};
  if (knownPublicCount !== DECK_SIZE - unknownPoolSize) throw new Error('U-Turn Board public-state mismatch');
  const live = state.targetToolSlotOpen === true && state.toolEffectsActive !== false &&
    state.retreatPermitted !== false && state.effectiveRetreatCost === 1;
  const copies = remainingCount(deck, 'U-Turn Board', knownPublicCounts);
  const probability = live ? 1 - choose(unknownPoolSize - copies, handSize) / choose(unknownPoolSize, handSize) : 0;
  return { handSize, copies, targetToolSlotOpen: state.targetToolSlotOpen === true,
    effectiveRetreatCost: state.effectiveRetreatCost ?? null, accessProbability: probability };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarize(decks, state) {
  const rows = decks.map(deck => ({ rank: deck.rank, archetype: deck.archetype,
    ...estimatePaleMoonEscapeAccess(deck, state) }));
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
      staticScenarios.push({ target: target.name, handSize,
        field: summarize(source.decks, state), regidrago: summarize(regidrago, state) });
    }
  }

  const publicBase = { handSize: 7, deckCount: 30, prizeCount: 6, knownPublicCount: 17,
    actorBenchCount: 1, opponentBenchCount: 1, targetDamaged: false };
  const publicScenarios = [];
  for (const target of [
    { name: 'non-basic-undamaged', targetIsBasic: false },
    { name: 'basic-undamaged', targetIsBasic: true }
  ]) {
    for (const known of [
      { name: '17 known public non-outs', knownPublicCounts: {}, discardCounts: {} },
      { name: 'one Guzma in discard plus 16 known non-outs',
        knownPublicCounts: { Guzma: 1 }, discardCounts: { Guzma: 1 } },
      { name: 'one Pokémon Ranger in discard plus 16 known non-outs',
        knownPublicCounts: { 'Pokémon Ranger': 1 }, discardCounts: { 'Pokémon Ranger': 1 } }
    ]) {
      const state = { ...publicBase, ...target, ...known };
      publicScenarios.push({ name: target.name + ': ' + known.name,
        field: summarize(source.decks, state), regidrago: summarize(regidrago, state),
        selectedRanks: [2, 3, 10, 18, 32].map(rank => {
          const deck = source.decks.find(row => row.rank === rank);
          return { rank, archetype: deck.archetype, ...estimatePaleMoonEscapeAccess(deck, state) };
        }) });
    }
  }

  const floatStoneSearchScenarios = [];
  const uTurnBoardScenarios = [];
  for (const deck of source.decks) {
    if (cardCount(deck, 'Float Stone') > 0) {
      for (const handSize of [6, 7]) {
        floatStoneSearchScenarios.push({ rank: deck.rank, archetype: deck.archetype, handSize,
          ...estimateFloatStoneSearchAccess(deck, { handSize, deckCount: DECK_SIZE - handSize - DEFAULT_PRIZES,
            prizeCount: DEFAULT_PRIZES, knownPublicCount: 0, targetToolSlotOpen: true,
            toolEffectsActive: true, retreatPermitted: true, supporterAvailable: true }) });
      }
    }
    if (cardCount(deck, 'U-Turn Board') > 0) {
      for (const handSize of [6, 7]) {
        uTurnBoardScenarios.push({ rank: deck.rank, archetype: deck.archetype,
          ...estimateUTurnBoardAccess(deck, { handSize, deckCount: DECK_SIZE - handSize - DEFAULT_PRIZES,
            prizeCount: DEFAULT_PRIZES, knownPublicCount: 0, targetToolSlotOpen: true,
            toolEffectsActive: true, retreatPermitted: true, effectiveRetreatCost: 1 }) });
      }
    }
  }

  return {
    source: { publishedDeckCount: source.published_deck_count, totalPlacements: source.total_placements,
      missingFullLists: source.missing_full_lists },
    assumptions: {
      model: 'hypergeometric hidden-zone access prior; not an execution rate or game probability',
      effectClearAndSwitchOuts: ['Guzma', 'Cassius', 'Pokémon Ranger', 'Penny (Basic targets only)',
        'Acerola (damaged targets only)', 'Escape Rope', 'Switch', 'Scoop Up Cyclone', 'Prime Catcher'],
      retrieval: 'VS Seeker + an eligible Supporter in discard, or Battle Compressor + VS Seeker + an eligible Supporter in deck',
      staticState: 'no public history, six unknown Prizes, actor Bench and other Bench available, Item/Supporter access, ACE SPEC unused',
      floatStoneState: 'target Tool slot open, Tool effects active, retreat permitted; Arven requires a legal Item/Tool search, Guzma & Hala requires a Stadium and Special Energy in deck plus two discardable cards',
      omissions: ['Channeler is in the Expanded card pool but absent from all 29 Aichi lists',
        'U-Turn Board access is shown only for target retreat cost 1',
        'VS Seeker/BC retrieval of Arven or Guzma & Hala', 'other draw/search and opponent decisions']
    },
    staticScenarios, publicScenarios, floatStoneSearchScenarios, uTurnBoardScenarios
  };
}

if (require.main === module) {
  const sourcePath = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  process.stdout.write(JSON.stringify(run(source), null, 2) + '\\n');
}

module.exports = {
  choose, estimatePaleMoonEscapeAccess, estimateSwitchOutAccess: estimatePaleMoonEscapeAccess,
  estimateFloatStoneSearchAccess, estimateUTurnBoardAccess, run
};
