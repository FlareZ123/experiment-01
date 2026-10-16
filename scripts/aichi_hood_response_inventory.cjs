'use strict';

const field = require('../results/aichi-2026/full-decklists.json');
const openingAudit = require('../results/aichi-2026/opening-hand-audit.json');

const REMOVAL_CARDS = Object.freeze([
  'Faba', 'Field Blower', 'Lost Vacuum', 'Megaton Blower'
]);
const ADDITIONAL_CARDS = Object.freeze([
  'Tool Jammer', 'Guzma', 'Counter Catcher', 'Prime Catcher'
]);

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    result = result * (n - i + 1) / i;
  }
  return result;
}

/**
 * Exactly sample a uniform seven-card initial hand conditioned on a Basic
 * Pokémon and two further regular draws. All hard-response cards are Trainers
 * and therefore disjoint from the basicCount category.
 *
 * @param {number} basics Known Basic Pokémon in the source deck.
 * @param {number} answerCards Physical copies among the four named Tool removals.
 * @returns {number} Chance at least one printed response copy is in the first nine
 * observed cards, conditional on an initial legal seven. Does not model
 * playable effects, prizes explicitly, search, lock, draw Supporters or policy.
 */
function exactAnswerAccess(basics, answerCards) {
  if (!Number.isInteger(basics) || !Number.isInteger(answerCards) ||
      basics < 1 || answerCards < 0 || basics + answerCards > 60) {
    throw new Error('Invalid disjoint Basic/Trainer partition.');
  }
  if (answerCards === 0) return 0;
  const validSeven = choose(60, 7) - choose(60 - basics, 7);
  const validSevenNoAnswer = choose(60 - answerCards, 7) -
    choose(60 - basics - answerCards, 7);
  const noAnswerTwoDraws = choose(53 - answerCards, 2) / choose(53, 2);
  return 1 - validSevenNoAnswer / validSeven * noAnswerTwoDraws;
}

/**
 * @returns {object} Exact names and physical quantities from published source
 * inventories; no inference from archetype name alone.
 */
function auditHoodResponses() {
  const basicsByRank = new Map(openingAudit.decks.map(d => [d.rank, d.basic_count_known]));
  const rows = field.decks.map(deck => {
    const count = name => deck.cards.filter(card => card.name === name)
      .reduce((sum, card) => sum + card.count, 0);
    const hardRemoval = Object.fromEntries(REMOVAL_CARDS.map(name => [name, count(name)]));
    const other = Object.fromEntries(ADDITIONAL_CARDS.map(name => [name, count(name)]));
    const totalHardRemovalCopies = Object.values(hardRemoval)
      .reduce((sum, n) => sum + n, 0);
    const basics = basicsByRank.get(deck.rank);
    if (!Number.isInteger(basics)) throw new Error('Missing known Basic count rank '+deck.rank);
    return {
      rank: deck.rank, archetype: deck.archetype, player: deck.player,
      initialBasicCount: basics,
      namedToolRemoval: hardRemoval, otherResponseCards: other,
      totalHardRemovalCopies,
      anyHardRemoval: totalHardRemovalCopies > 0,
      directNineCardRemovalAccessConditionalBasic: exactAnswerAccess(
        basics, totalHardRemovalCopies
      )
    };
  });
  const lockRows = rows.filter(row =>
    row.archetype === 'Iron Thorns' || row.archetype === 'Absol Garbodor');
  return {
    sourceDeckCount:rows.length,
    missingSourceRanks:[23,25,28],
    coveredRanks:rows.map(r=>r.rank),
    hardRemovalNames:REMOVAL_CARDS,
    additionalNames:ADDITIONAL_CARDS,
    withAtLeastOneNamedHardRemoval:rows.filter(r=>r.anyHardRemoval).length,
    withNoNamedHardRemoval:rows.filter(r=>!r.anyHardRemoval).map(r=>r.rank),
    lockRanks:lockRows.map(row=>({
      rank:row.rank, archetype:row.archetype,
      initialBasicCount:row.initialBasicCount,
      namedToolRemoval:row.namedToolRemoval,
      additionalResponses:row.otherResponseCards,
      directNineCardRemovalAccessConditionalBasic:
        row.directNineCardRemovalAccessConditionalBasic
    })),
    rows,
    significance:'inventory coverage and narrow direct-access probability, not successful playable removal',
    excludes:'card draw/search, extra mulligan draws, costs, prizes after first draws, Item/Supporter locks, opponent policy, other Pokemon or card-based removal'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(auditHoodResponses(),null,2));
}
module.exports = { choose, exactAnswerAccess, auditHoodResponses };
