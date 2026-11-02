'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent18-missing-field-ceiling-v1';
const THRESHOLD = 12;
const PRINTING = 'sm8-92';

/**
 * Establish whether an original opponent 60 could ever put enough of its own
 * physical Supporter cards into its Lost Zone for LOT 92 Unown's MISSING.
 * This is a necessary card-supply condition, never an achievable line proof.
 *
 * @param {object} manifest Published original decklist manifest.
 * @param {Map<string,string>} trainerTypes Printed Trainer name-to-subtype index.
 * @returns {object} Source-locked hard ceiling over authenticated original lists.
 */
function missingFieldCeiling(manifest, trainerTypes) {
  assert.ok(Array.isArray(manifest?.decks));
  assert.ok(Array.isArray(manifest?.missing_full_lists));
  assert.ok(trainerTypes instanceof Map);
  const seen = new Set();
  const rows = manifest.decks.map(deck => {
    assert.ok(Number.isSafeInteger(deck.rank) && deck.rank >= 1 && deck.rank <= 32);
    assert.ok(!seen.has(deck.rank), 'duplicate source rank');
    seen.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    let total = 0;
    let supporters = 0;
    for (const card of deck.cards) {
      assert.ok(Number.isSafeInteger(card.count) && card.count > 0);
      total += card.count;
      if (card.category === 'Trainer') {
        const type = trainerTypes.get(card.name);
        assert.ok(type, 'unclassified Trainer '+card.name+' rank '+deck.rank);
        if (type === 'Supporter') supporters += card.count;
      } else {
        assert.ok(card.category === 'Pokémon' || card.category === 'Energy');
      }
    }
    assert.equal(total, 60, 'invalid original 60 at rank '+deck.rank);
    return {
      rank: deck.rank,
      archetype: deck.archetype,
      physicalSupporters: supporters,
      missingDeficit: Math.max(0, THRESHOLD - supporters),
      quantityNecessaryCondition: supporters >= THRESHOLD,
      maxSupportersInOpponentLostZone: supporters
    };
  }).sort((a, b) => a.rank - b.rank);
  const missing = manifest.missing_full_lists.map(row => row.rank).sort((a,b) => a-b);
  assert.ok(missing.every(rank => !seen.has(rank)));
  const eligible = rows.filter(row => row.quantityNecessaryCondition);
  const impossible = rows.filter(row => !row.quantityNecessaryCondition);
  return {
    schema: VERSION,
    card: PRINTING,
    threshold: THRESHOLD,
    authenticatedOriginalSixties: rows.length,
    missingFullListRanks: missing,
    impossibleByPhysicalInventory: impossible.length,
    merelyPotentialByPhysicalInventory: eligible.length,
    impossibleRanks: impossible.map(row => row.rank),
    quantityPossibleRanks: eligible.map(row => row.rank),
    rows,
    competitiveQualifiedGames: 0,
    caveat: 'Assumes Lost Zone cards retain their owner and no new physical Supporters are introduced to the opponent deck. At least 12 actual Lost-Zoned opponent Supporters, Unown Active and live Ability are additional required conditions. Unverified original sixties are unscored.'
  };
}

/** @returns {object} Scan 29 source lists using current repository card metadata. */
function main() {
  const root = path.resolve(__dirname, '..');
  const source = JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'), 'utf8'));
  const unown = JSON.parse(fs.readFileSync(path.join(root,
    'resources/cards/en/sm8.json'), 'utf8'))
    .find(card => card.id === PRINTING);
  assert.ok(unown && unown.abilities?.some(ability =>
    ability.name === 'MISSING' &&
    /12 or more Supporter cards in the Lost Zone/.test(ability.text)),
  'supplied source card database must still print the MISSING condition');
  const trainerTypes = require('./agent3-jellicent-field-exposure.cjs')
    .loadTrainerTypes(path.join(root, 'resources/cards/en'));
  const result = missingFieldCeiling(source, trainerTypes);
  assert.equal(result.authenticatedOriginalSixties, 29);
  assert.deepEqual(result.missingFullListRanks, [23, 25, 28]);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) main();
module.exports = { VERSION, THRESHOLD, PRINTING, missingFieldCeiling, main };
