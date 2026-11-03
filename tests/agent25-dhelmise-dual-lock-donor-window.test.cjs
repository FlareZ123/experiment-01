'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {printedMix, maximinMixes, jointLockWindow, study} =
  require('../scripts/agent25-dhelmise-dual-lock-donor-window.cjs');

test('original 60 and actual printed donor rule categories', () => {
  assert.deepEqual(printedMix(), {banette:4,shuppet:2,sinistcha:2});
  const cards = JSON.parse(fs.readFileSync(path.resolve(
    __dirname, '../resources/cards/en/me5.json')));
  const byId = new Map(cards.map(c => [c.id,c]));
  for (const [id, stage, type] of [
    ['me5-34','Stage 1','Psychic'],
    ['me5-33','Basic','Psychic'],
    ['me5-6','Stage 1','Grass']
  ]) {
    const card = byId.get(id);
    assert.ok(card);
    assert.ok(card.subtypes.includes(stage));
    assert.ok(card.types.includes(type));
    assert.ok(card.abilities.some(a => a.name === "Hide 'n' Sneak"));
  }
});

test('enumerated maximin individual Wobbuffet/Silent Lab mixes', () => {
  assert.deepEqual(maximinMixes(8), {
    total:8,optimum:6,mixes:[{banette:4,shuppet:2,sinistcha:2}]
  });
  assert.deepEqual(maximinMixes(10), {
    total:10,optimum:7,mixes:[{banette:4,shuppet:3,sinistcha:3}]
  });
  assert.throws(() => maximinMixes(13));
});

test('simultaneous locks leave only four Banette at 8/10/12 donors', () => {
  const studyResult = study();
  const [eight,ten,twelve] = studyResult.jointLockCounterfactuals;
  assert.deepEqual(studyResult.jointLockCounterfactuals
    .map(s => s.jointLockEffectiveDonors), [4,4,4]);
  assert.deepEqual(studyResult.jointLockCounterfactuals
    .map(s => s.hypotheticalOtherNonBasicCardCuts), [0,2,4]);
  for (const row of [eight,ten,twelve]) {
    assert.ok(Math.abs(row.ordinaryDrawStrictUnconditional -
      0.02895542786863926) < 1e-13);
    assert.ok(Math.abs(row.prizeOnlyAllFourUnprized -
      0.6485404041957612) < 1e-13);
    assert.equal(row.favorableWorlds, eight.favorableWorlds);
    assert.equal(row.totalWorlds, eight.totalWorlds);
    assert.equal(row.competitivelyQualifiedGames, 0);
  }
  assert.ok(eight.ordinaryDrawStrictGivenBasicOpening >
    ten.ordinaryDrawStrictGivenBasicOpening);
  assert.ok(ten.ordinaryDrawStrictGivenBasicOpening >
    twelve.ordinaryDrawStrictGivenBasicOpening);
  assert.ok(eight.bothLocksActuallyEstablishedByAnOriginalSourceUnverified);
  assert.ok(studyResult.originalFixedSixtyUnchanged);
  assert.throws(() => jointLockWindow(1));
  assert.throws(() => jointLockWindow(5));
});


test('combined Wobbuffet/Silent Lab is absent from all 29 authenticated opposing 60s', () => {
  const field = require('../results/aichi-2026/full-decklists.json');
  assert.equal(field.published_deck_count, 29);
  assert.deepEqual(field.missing_full_lists.map(x => x.rank), [23,25,28]);
  const wobbuffetRanks = [], silentLabRanks = [], combined = [];
  for (const deck of field.decks) {
    const wobb = deck.cards.some(card => card.name === 'Wobbuffet' &&
      card.printing?.set === 'PHF');
    const lab = deck.cards.some(card => card.name === 'Silent Lab' &&
      card.printing?.set === 'PRC');
    if (wobb) wobbuffetRanks.push(deck.rank);
    if (lab) silentLabRanks.push(deck.rank);
    if (wobb && lab) combined.push(deck.rank);
  }
  assert.deepEqual(wobbuffetRanks, [7,10,21]);
  assert.deepEqual(silentLabRanks, [9,13,15,32]);
  assert.deepEqual(combined, []);
});
