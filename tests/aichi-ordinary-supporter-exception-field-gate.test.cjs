'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');

const root = path.resolve(__dirname, '..');

/** @param {string} relative */
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const restrictedNames = new Set(['Magnezone', "Lt. Surge's Strategy"]);

/** @param {{name:string,count:number}[]} cards */
const exceptionalRows = cards => cards
  .filter(card => restrictedNames.has(card.name))
  .map(({name,count}) => ({name,count}));

test('provided card pool distinguishes printed Dual Brains from banned Surge', () => {
  const plasmaStorm = read('resources/cards/en/bw8.json');
  const magnezone = plasmaStorm.find(card => card.id === 'bw8-46');
  assert.equal(magnezone?.name, 'Magnezone');
  assert.equal(magnezone.legalities.expanded, 'Legal');
  assert.equal(magnezone.abilities?.find(ability => ability.name === 'Dual Brains')?.text,
    'During your turn, you may play 2 Supporter cards.');

  const japaneseBan = read('results/legality/japan-expanded-aichi-2026.json');
  assert.equal(japaneseBan.valid_for_event, '2026-05-10');
  assert.ok(japaneseBan.banned_identities.some(entry =>
    entry.english_name === "Lt. Surge's Strategy" &&
    entry.selector.type === 'trainer_name'));

  for (const [file, id] of [
    ['sm10', 'sm10-178'],
    ['sm115', 'sm115-60']
  ]) {
    const surge = read('resources/cards/en/' + file + '.json')
      .find(card => card.id === id);
    assert.equal(surge?.name, "Lt. Surge's Strategy");
    assert.equal(surge.legalities.expanded, 'Banned');
    assert.ok(surge.rules.some(line =>
      line.includes('play 3 Supporter cards')));
  }
});

test('all available Aichi exact 60s have zero exceptional Supporter sources', () => {
  const benchmark = read('results/aichi-2026/full-decklists.json');
  assert.equal(benchmark.decks.length, benchmark.published_deck_count);
  assert.equal(benchmark.total_placements, 32);
  assert.deepEqual(benchmark.missing_full_lists.map(row => row.rank), [23, 25, 28]);
  const hits = benchmark.decks.flatMap(deck =>
    exceptionalRows(deck.cards).map(card => ({rank:deck.rank,...card})));
  assert.deepEqual(hits, [],
    'Reassess actual live Dual Brains, applicable ability lock and valid two-Supporter behavior before extending the ordinary quota gate to this new source deck');
});

test('all four frozen nominated 60s remain ordinary Supporter scope', () => {
  const benchmark = read('results/aichi-2026/full-decklists.json');
  const champion = benchmark.decks.find(deck => deck.rank === 1);
  const hood = read('results/aichi-2026/candidate-hood-shadow-rider.json');
  const temple = read('results/aichi-2026/candidate-temple-shadow-rider.json');
  const newMoon = read('results/als/new-moon-lockbreak-english-proxy-60.json');
  const candidates = [
    {name:'rank1-champion-reference',cards:champion.cards},
    {name:'hood',cards:hood.cards},
    {name:'temple',cards:temple.cards},
    {name:'new-moon-lockbreaker',
      cards:newMoon.entries.map(entry => ({name:entry.name_en,count:entry.count}))}
  ];
  for (const candidate of candidates) {
    const total = candidate.cards.reduce((sum,card) => sum + card.count, 0);
    assert.equal(total, 60, candidate.name + ' fixed-list size');
    assert.deepEqual(exceptionalRows(candidate.cards), [],
      candidate.name + ' requires an explicit extra-Supporter exception audit');
  }
});
