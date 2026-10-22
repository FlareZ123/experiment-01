'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const photoPath = path.join(root,
  'results/aichi-2026/agent21-natsumegu-dragon04-visual-60.json');
const fieldPath = path.join(root, 'results/aichi-2026/full-decklists.json');

/** @param {Array<{name:string,count:number}>} cards */
function countNames(cards) {
  const counts = new Map();
  for (const card of cards) {
    assert.equal(typeof card.name, 'string');
    assert.ok(Number.isSafeInteger(card.count) && card.count >= 1);
    counts.set(card.name, (counts.get(card.name) ?? 0) + card.count);
  }
  return counts;
}

/** @param {Map<string,number>} values */
const sumCounts = values =>
  [...values.values()].reduce((total, count) => total + count, 0);

/**
 * Verify that the independently frozen 38-cell image transcription is one
 * physical 60 and compare names only to the independent exact rank21 list.
 * No official player identity or print-level equivalence is implied.
 * @returns {object} Fail-closed source comparison.
 */
function audit() {
  const photo = JSON.parse(fs.readFileSync(photoPath, 'utf8'));
  const field = JSON.parse(fs.readFileSync(fieldPath, 'utf8'));
  const rank = field.decks.find(deck => deck.rank === 21);
  assert.ok(rank && rank.player === 'Shun Nakajima');
  assert.equal(photo.entries.length, 38);
  const rowSums = [1,2,3,4].map(row =>
    photo.entries.filter(entry => entry.row === row)
      .reduce((sum, entry) => sum + entry.count, 0));
  assert.deepEqual(rowSums, [14,18,12,16]);
  const photoNames = countNames(photo.entries);
  const rankNames = countNames(rank.cards);
  assert.equal(sumCounts(photoNames), 60);
  assert.equal(sumCounts(rankNames), 60);
  const allNames = new Set([...photoNames.keys(), ...rankNames.keys()]);
  const overlap = [...allNames].reduce((sum, name) =>
    sum + Math.min(photoNames.get(name) ?? 0, rankNames.get(name) ?? 0), 0);
  const changed = [...allNames].filter(name =>
    (photoNames.get(name) ?? 0) !== (rankNames.get(name) ?? 0))
    .map(name => ({name, photo: photoNames.get(name) ?? 0,
      publishedRank21: rankNames.get(name) ?? 0}))
    .sort((a,b) => a.name.localeCompare(b.name));
  assert.equal(overlap, 59);
  assert.deepEqual(changed, [
    {name:'Mega Dragonite ex',photo:1,publishedRank21:0},
    {name:'Noivern ex',photo:0,publishedRank21:1}
  ]);
  const donor = photo.entries.find(entry =>
    entry.row === 1 && entry.col === 8);
  assert.equal(donor.name, 'Mega Dragonite ex');
  assert.equal(donor.printingEvidence?.japanese?.number, '232/193');
  assert.equal(donor.printingEvidence?.pinnedTwinleaf?.cardManagerKey,
    'Mega Dragonite ex2 ASC');
  return {
    schema: 'agent21-source-photo-38-cell-name-overlap-audit-v1',
    sourcePhoto: photo.capture.original_url,
    photoCells: photo.entries.length,
    photographedCopies: sumCounts(photoNames),
    rowSums, publishedRank:21, publishedPlayer:rank.player,
    publishedCopies:sumCounts(rankNames), sharedCopies:overlap,
    soleSubstitution: changed,
    printingIdentityOfOneConfirmedDonor:
      donor.printingEvidence.pinnedTwinleaf.cardManagerKey,
    photoAssignedToOfficialPlayer:false,
    qualifiedCompetitiveGames:0
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(audit(), null, 2) + '\n');
}

module.exports = {audit, countNames};
