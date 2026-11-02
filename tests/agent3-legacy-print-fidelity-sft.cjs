/**
 * Agent 3 SFT: English card-level Expanded flags versus original-print effects.
 * Run from the repository with Node.js. No network, engine, or third-party dependencies.
 * A printed legality flag is a screening hint, never an independent paper-ruling.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{id:string,name:string,supertype:string,subtypes?:string[], rules?:string[], legalities?:{expanded?:string}}} Card */
/** @typedef {{id:string,series:string,name:string}} SetRecord */

const root = path.resolve(__dirname, '..');
/** @type {SetRecord[]} */
const setRows = JSON.parse(fs.readFileSync(path.join(root, 'resources/sets/en.json'), 'utf8'));
const sets = new Map(setRows.map(row => [row.id, row]));
const preBwSeries = new Set([
  'Base', 'Gym', 'Neo', 'E-Card', 'EX', 'Diamond & Pearl',
  'Platinum', 'HeartGold & SoulSilver', 'POP'
]);
const cardsDir = path.join(root, 'resources/cards/en');
/** @type {Card[]} */
const cards = fs.readdirSync(cardsDir)
  .filter(name => name.endsWith('.json'))
  .flatMap(name => JSON.parse(fs.readFileSync(path.join(cardsDir, name), 'utf8')));
const byId = new Map(cards.map(card => [card.id, card]));
const legacyFlagged = cards.filter(card => {
  const setId = card.id.split('-')[0];
  const series = sets.get(setId)?.series;
  return preBwSeries.has(series) && card.legalities?.expanded === 'Legal';
});

assert.equal(legacyFlagged.length, 233, 'database snapshot unexpectedly changed');
const bySupertype = (name) => legacyFlagged.filter(card => card.supertype === name).length;
assert.equal(bySupertype('Energy'), 102);
assert.equal(bySupertype('Trainer'), 123);
assert.equal(bySupertype('Pokémon'), 8);
assert.equal(legacyFlagged.filter(card => card.subtypes?.includes('Basic') && card.supertype === 'Energy').length, 90);

/** @param {string} id @returns {Card} */
function get(id) {
  const card = byId.get(id);
  assert.ok(card, `missing fixture card: ${id}`);
  return card;
}
/** @param {Card} card @returns {string} */
function printedEffect(card) {
  return (card.rules ?? []).join(' ').replace(/\s+/g, ' ').trim();
}
const crossPrintPairs = [
  ['Quick Ball', 'dp2-114', 'swsh8-237'],
  ['Super Rod', 'neo1-103', 'sv2-188'],
  ['Great Ball', 'ex16-77', 'sv2-183'],
  ['Rare Candy', 'ex2-88', 'sv1-191'],
];
for (const [name, oldId, modernId] of crossPrintPairs) {
  const old = get(oldId);
  const modern = get(modernId);
  assert.equal(old.name, name);
  assert.equal(modern.name, name);
  assert.equal(old.legalities?.expanded, 'Legal');
  assert.equal(modern.legalities?.expanded, 'Legal');
  assert.ok(preBwSeries.has(sets.get(oldId.split('-')[0])?.series));
  assert.notEqual(printedEffect(old), printedEffect(modern));
  console.log(`IDENTICAL NAME + DATABASE EXPANDED LEGAL + DISTINCT ORIGINAL TEXT: ${oldId} <-> ${modernId}`);
  console.log(`  OLD    ${printedEffect(old).slice(0, 230)}`);
  console.log(`  MODERN ${printedEffect(modern).slice(0, 230)}`);
}

const a = get('sm10-81');
const b = get('g1-RC11');
const c = get('sv2-246');
const d = get('sv6pt5-47');
assert.equal(a.abilities?.[0]?.name, 'Resetting Hole');
assert.equal(b.abilities?.[0]?.name, 'Bide Barricade');
assert.deepEqual(c.attacks?.map(attack => attack.name), ['Covert Flight', 'Dominating Echo']);
assert.equal(d.attacks?.[0]?.name, 'Trifrost');
console.log('Artwork-inferred rank-28 source mechanic signatures PASS.');
console.log(JSON.stringify({preBwSeriesCount:preBwSeries.size,preBwFlaggedCards:legacyFlagged.length,
  bySupertype:{energy:bySupertype('Energy'),trainer:bySupertype('Trainer'),pokemon:bySupertype('Pokémon')},
  verifiedDivergentPairs:crossPrintPairs.length,qualifiesOldCardsForPaperPlay:false},null,2));
console.log('ALL CHECKS PASSED: textual divergence is a follow-up paper-admission flag, not a legality verdict.');
