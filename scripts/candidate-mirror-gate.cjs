'use strict';

/**
 * Source-specification mirror check for a fixed 60-card candidate.
 * This only detects matching displayed name/set/number/count inventories.
 * It makes no assertion about tournament legality or competitive strength.
 */

/** @param {{cards:Array<object>}} deck */
function deckSignature(deck) {
  if (!Array.isArray(deck?.cards)) throw new Error('Deck must contain cards.');
  const inventory = new Map();
  let total = 0;
  for (const row of deck.cards) {
    if (typeof row.name !== 'string' || !row.name.trim() ||
        !Number.isInteger(row.count) || row.count <= 0 ||
        typeof row.printing?.set !== 'string' || !row.printing.set.trim() ||
        (typeof row.printing?.number !== 'string' &&
         typeof row.printing?.number !== 'number') ||
        !String(row.printing.number).trim()) {
      throw new Error('Invalid card name, printing or count.');
    }
    total += row.count;
    const key = JSON.stringify([
      row.name.trim(),
      row.printing.set.trim().toUpperCase(),
      String(row.printing.number).trim().toUpperCase()
    ]);
    inventory.set(key, (inventory.get(key) || 0) + row.count);
  }
  if (total !== 60) throw new Error('Expected a fixed 60-card list, got ' + total + '.');
  return [...inventory.entries()].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0);
}

/**
 * Displayed-name inventory, deliberately ignoring printings. A same-name
 * match requires card-text review: different Pokemon can share a name.
 * @param {{cards:Array<object>}} deck
 * @returns {Array<[string,number]>}
 */
function nameSignature(deck) {
  deckSignature(deck);
  const names = new Map();
  for (const row of deck.cards) {
    const name = row.name.trim();
    names.set(name, (names.get(name) || 0) + row.count);
  }
  return [...names.entries()].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0);
}

/**
 * Number of name-changing card slots between fixed 60-card inventories.
 * Half of the count-vector L1 distance gives the substitution count.
 * This measures structural change, never deck strength.
 * @param {Array<[string,number]>} left
 * @param {Array<[string,number]>} right
 * @returns {number}
 */
function nameReplacementDistance(left, right) {
  const a = new Map(left), b = new Map(right);
  const allNames = new Set([...a.keys(), ...b.keys()]);
  let difference = 0;
  for (const name of allNames) {
    difference += Math.abs((a.get(name) || 0) - (b.get(name) || 0));
  }
  return difference / 2;
}

/**
 * Detect copies of published field inventories.
 * Under exchangeable equal-strength mirror policies and fair starting order,
 * each identical opposing list contributes at most 0.5 candidate wins.
 * No exact mirror detected does NOT establish target attainability, legality,
 * functional uniqueness after reprints, or a win-rate estimate.
 *
 * @param {{cards:Array<object>}} candidate
 * @param {{decks:Array<object>}} field Aichi 32-placement source manifest
 * @param {number} targetWinFraction Requested average, normally 0.995
 * @returns {object} Audit without competitive-win certification
 */
function auditCandidate(candidate, field, targetWinFraction = 0.995) {
  if (!Array.isArray(field?.decks) ||
      !(targetWinFraction > 0 && targetWinFraction <= 1)) {
    throw new Error('Invalid field manifest or target.');
  }
  const candidateKey = JSON.stringify(deckSignature(candidate));
  const candidateNames = nameSignature(candidate);
  const seen = new Set();
  const exactSourceMirrorRanks = [];
  const sameNameInventoryRanks = [];
  const nameDistances = [];
  for (const opponent of field.decks) {
    if (!Number.isInteger(opponent.rank) || opponent.rank < 1 ||
        opponent.rank > 32 || seen.has(opponent.rank)) {
      throw new Error('Invalid or duplicated field rank.');
    }
    seen.add(opponent.rank);
    if (candidateKey === JSON.stringify(deckSignature(opponent))) {
      exactSourceMirrorRanks.push(opponent.rank);
    }
    const opponentNames = nameSignature(opponent);
    if (JSON.stringify(candidateNames) === JSON.stringify(opponentNames)) {
      sameNameInventoryRanks.push(opponent.rank);
    }
    nameDistances.push({
      rank: opponent.rank,
      replacementSlots: nameReplacementDistance(candidateNames, opponentNames)
    });
  }
  const unpublishedRanks = Array.from({length: 32}, (_, index) => index + 1)
    .filter(rank => !seen.has(rank));
  const conditionalSymmetricMirrorCeiling = exactSourceMirrorRanks.length ?
    (32 - 0.5 * exactSourceMirrorRanks.length) / 32 : null;

  return {
    targetWinFraction,
    publishedFullListsAudited: seen.size,
    unpublishedRanks,
    exactSourceMirrorRanks,
    sameNameInventoryRanks,
    closestNameInventoryOpponents: nameDistances
      .sort((a, b) => a.replacementSlots - b.replacementSlots || a.rank - b.rank)
      .slice(0, 3),
    conditionalSymmetricMirrorCeiling,
    targetExcludedUnderSymmetricMirrorAssumptions:
      conditionalSymmetricMirrorCeiling !== null &&
      conditionalSymmetricMirrorCeiling < targetWinFraction,
    sourceSpecificationOnly: true,
    competitiveStrengthVerified: false,
    caution: 'Name-only equality is a review signal, never proof of identical ' +
      'card effects: distinct Pokemon with the same name can have different ' +
      'attacks or Abilities. Only exact-printing mirrors trigger the current ' +
      'conditional symmetry ceiling. No result establishes game win rates.'
  };
}

module.exports = { deckSignature, nameSignature, nameReplacementDistance, auditCandidate };
