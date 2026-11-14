'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  openingMulliganProbability,
  pairedSetupMulligans,
  opponentEligibleAtLeast
} = require('./agent12-expanded-mulligan-pairing.cjs');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'results', 'aichi-2026');
const STRICT_EXPANDED_INCOMPATIBLE_RANKS = new Set([3, 6, 7, 24, 29]);
const BASIC_COPIES = new Map([
  ['Shadow Rider Calyrex V', 4], ["Lillie's Clefairy ex", 2],
  ['Tapu Lele-GX', 1], ['Trevenant & Dusknoir-GX', 1],
  ['Latias ex', 1], ['Dialga-GX', 1], ['Mimikyu', 1],
  ['Girafarig', 1], ['Marshadow', 1], ['Radiant Eternatus', 1]
]);
const NONBASIC_COPIES = new Map([['Shadow Rider Calyrex VMAX', 4]]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function sumCopies(cards) {
  return cards.reduce((sum, card) => sum + card.count, 0);
}
function countCandidateBasics(candidate) {
  let basic = 0, nonbasic = 0, pokemon = 0;
  const seenBasic = new Set(), seenNonbasic = new Set();
  for (const card of candidate.cards) {
    if (card.category !== 'Pokémon') continue;
    pokemon += card.count;
    if (BASIC_COPIES.has(card.name)) {
      if (card.count !== BASIC_COPIES.get(card.name) || seenBasic.has(card.name))
        throw new Error('Candidate Basic inventory changed: ' + card.name);
      seenBasic.add(card.name);
      basic += card.count;
    } else if (NONBASIC_COPIES.has(card.name)) {
      if (card.count !== NONBASIC_COPIES.get(card.name) || seenNonbasic.has(card.name))
        throw new Error('Candidate evolution inventory changed: ' + card.name);
      seenNonbasic.add(card.name);
      nonbasic += card.count;
    } else {
      throw new Error('Unclassified candidate Pokémon: ' + card.name);
    }
  }
  if (seenBasic.size !== BASIC_COPIES.size ||
      seenNonbasic.size !== NONBASIC_COPIES.size ||
      pokemon !== candidate.category_counts['Pokémon'] ||
      basic !== 14 || nonbasic !== 4 || sumCopies(candidate.cards) !== 60)
    throw new Error('Candidate is no longer the frozen Hood Shield v1 60.');
  return basic;
}
function mean(rows, key) {
  if (!rows.length) throw new Error('Cannot summarize an empty field.');
  return rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
}
function summarize(rows) {
  const candidate = mean(rows, 'candidateExpectedBonus');
  const opponent = mean(rows, 'opponentExpectedBonus');
  return {
    n: rows.length,
    meanCandidateExpectedBonus: candidate,
    meanOpponentExpectedBonus: opponent,
    meanNetCandidateMinusOpponent: candidate - opponent,
    meanCandidateBonusProbability: mean(rows, 'candidateBonusProbability'),
    meanOpponentBonusProbability: mean(rows, 'opponentBonusProbability')
  };
}
function buildFieldMatrix({field, openingAudit, candidate}) {
  if (field.published_deck_count !== 29 || field.decks.length !== 29 ||
      openingAudit.decks.length !== 29)
    throw new Error('Expected 29 published and audited Aichi source sixties.');
  const missing = field.missing_full_lists.map(x => x.rank).sort((a,b)=>a-b);
  if (missing.join(',') !== '23,25,28')
    throw new Error('Missing-list set changed; do not impute ranks.');
  const auditByRank = new Map(openingAudit.decks.map(x => [x.rank, x]));
  if (auditByRank.size !== 29) throw new Error('Duplicate opening-audit rank.');

  const candidateBasics = countCandidateBasics(candidate);
  const rows = field.decks.map(deck => {
    const audit = auditByRank.get(deck.rank);
    if (!audit || audit.player !== deck.player || audit.archetype !== deck.archetype)
      throw new Error('Source/audit identity mismatch at rank ' + deck.rank);
    if (audit.unresolved_pokemon.length !== 0 ||
        sumCopies(audit.basics) !== audit.basic_count_known)
      throw new Error('Unresolved or inconsistent Basic census at rank ' + deck.rank);
    if (Math.abs(audit.probabilities.mulligan_initial -
        openingMulliganProbability(audit.basic_count_known)) > 1e-12)
      throw new Error('Opening-audit probability mismatch at rank ' + deck.rank);
    if (sumCopies(deck.cards) !== 60 ||
        Object.values(deck.category_counts).reduce((a,b)=>a+b,0) !== 60)
      throw new Error('Source deck is not exactly 60 at rank ' + deck.rank);

    const opponentBasics = audit.basic_count_known;
    const paired = pairedSetupMulligans(candidateBasics, opponentBasics);
    // The helper returns the second player's eligibility due to the first
    // player's mulligans. Reverse arguments to measure the candidate's side.
    const candidateAtLeast1 =
      opponentEligibleAtLeast(opponentBasics, candidateBasics, 1);
    const opponentAtLeast1 =
      opponentEligibleAtLeast(candidateBasics, opponentBasics, 1);
    const candidateAtLeast5 =
      opponentEligibleAtLeast(opponentBasics, candidateBasics, 5);
    const opponentAtLeast5 =
      opponentEligibleAtLeast(candidateBasics, opponentBasics, 5);
    const neither = paired.probabilityNeitherSetupNeedsRedraws;

    if (Math.abs(candidateAtLeast1 -
        paired.probabilityOnlyOpposingSetupNeedsRedraws) > 1e-12 ||
        Math.abs(opponentAtLeast1 -
        paired.probabilityOnlyMySetupNeedsRedraws) > 1e-12 ||
        Math.abs(candidateAtLeast1 + opponentAtLeast1 + neither - 1) > 1e-12)
      throw new Error('Paired bonus-event probability identity failed at rank ' + deck.rank);

    return {
      rank: deck.rank, player: deck.player, archetype: deck.archetype,
      basicCount: opponentBasics,
      opponentNoBasicProbability: openingMulliganProbability(opponentBasics),
      candidateBonusProbability: candidateAtLeast1,
      candidateExpectedBonus: paired.expectedOptionalDrawsAvailableToMe,
      candidateAtLeast5,
      opponentBonusProbability: opponentAtLeast1,
      opponentExpectedBonus: paired.expectedOptionalDrawsAvailableToOpponent,
      opponentAtLeast5,
      neitherBonusProbability: neither,
      expectedSharedRestartRounds: paired.expectedSharedRestartRounds
    };
  }).sort((a,b)=>a.rank-b.rank);

  const compatible = rows.filter(x => !STRICT_EXPANDED_INCOMPATIBLE_RANKS.has(x.rank));
  const incompatible = rows.filter(x => STRICT_EXPANDED_INCOMPATIBLE_RANKS.has(x.rank));
  const basicCountDistribution = {};
  for (const row of rows)
    basicCountDistribution[row.basicCount] = (basicCountDistribution[row.basicCount] || 0) + 1;
  const advantageCounts = rows.reduce((acc,row) => {
    const delta = row.candidateExpectedBonus - row.opponentExpectedBonus;
    if (Math.abs(delta) < 1e-12) acc.equal++;
    else if (delta > 0) acc.candidateMore++;
    else acc.opponentMore++;
    return acc;
  }, {candidateMore:0,equal:0,opponentMore:0});

  return {
    scope: 'maximum optional pregame mulligan-bonus draw eligibility; not actual cards drawn or game performance',
    fieldSource: field.source,
    publishedDeckCount: field.published_deck_count,
    totalPlacements: field.total_placements,
    missingFullLists: field.missing_full_lists,
    candidate: {
      player: candidate.player,
      archetype: candidate.archetype,
      basicCount: candidateBasics,
      noBasicOpeningProbability: openingMulliganProbability(candidateBasics)
    },
    strictExpandedIncompatibleRanks: [...STRICT_EXPANDED_INCOMPATIBLE_RANKS].sort((a,b)=>a-b),
    basicCountDistribution,
    advantageCounts,
    summaries: {
      all29OriginalAichi: summarize(rows),
      expandedCompatible24Sensitivity: summarize(compatible),
      incompatible5Sensitivity: summarize(incompatible)
    },
    rows
  };
}
function loadInputs() {
  return {
    field: readJson(path.join(DATA, 'full-decklists.json')),
    openingAudit: readJson(path.join(DATA, 'opening-hand-audit.json')),
    candidate: readJson(path.join(DATA, 'candidate-hood-shadow-rider.json'))
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(buildFieldMatrix(loadInputs()), null, 2) + '\n');
}
module.exports = {buildFieldMatrix, countCandidateBasics, loadInputs, summarize};
