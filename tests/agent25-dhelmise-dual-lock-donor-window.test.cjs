'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {printedMix, eligibleDonors, prizeOnlyRetention, screenMix,
  maximinMixes} = require('../scripts/agent25-dhelmise-dual-lock-donor-window.cjs');

test('v2 full printed sixty and three distinct HNS rule-text classes', () => {
  const mix = printedMix();
  assert.deepEqual(mix, {banette:4, shuppet:2, sinistcha:2});
  const cards = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../resources/cards/en/me5.json')));
  const byId = new Map(cards.map(card => [card.id, card]));
  for (const [id, kind, type] of [
    ['me5-34', 'Stage 1', 'Psychic'],
    ['me5-33', 'Basic', 'Psychic'],
    ['me5-6', 'Stage 1', 'Grass']
  ]) {
    const card = byId.get(id);
    assert.ok(card);
    assert.ok(card.subtypes.includes(kind));
    assert.ok(card.types.includes(type));
    assert.ok(card.abilities.some(ability =>
      ability.name === "Hide 'n' Sneak"));
  }
});

test('both independent lock filters and joint-lock strength', () => {
  const mix = printedMix();
  assert.deepEqual(['none','wobbuffet','silent-lab','both','garbotoxin']
    .map(lock => eligibleDonors(mix, lock)), [8,6,6,4,0]);
  assert.deepEqual(maximinMixes(8), {
    total:8,maximumMinimumEligibleDonors:6,
    mixes:[{banette:4,shuppet:2,sinistcha:2}]
  });
  assert.deepEqual(maximinMixes(10), {
    total:10,maximumMinimumEligibleDonors:7,
    mixes:[{banette:4,shuppet:3,sinistcha:3}]
  });
});

test('exact strict ordinary-draw event: unlocked and lock pressure', () => {
  const mix = printedMix();
  const none = screenMix(mix, 'none');
  const wobb = screenMix(mix, 'wobbuffet');
  const lab = screenMix(mix, 'silent-lab');
  const both = screenMix(mix, 'both');
  const garb = screenMix(mix, 'garbotoxin');
  assert.equal(none.strictFraction, '89836718226797/1240231753460700');
  assert.equal(wobb.strictFraction,
    '1154351270049793/17363244548449800');
  assert.equal(lab.strictFraction, wobb.strictFraction);
  assert.equal(both.strictFraction, '7617578410427/263079462855300');
  assert.equal(garb.strictFraction, '0');
  assert.equal(garb.strictUnconditional, 0);
  assert.equal(garb.prizeOnlyRetention, 0);
  assert.ok(Math.abs(none.strictUnconditional - 0.07243542827872268) < 1e-13);
  assert.ok(Math.abs(wobb.strictUnconditional - 0.06648246339148947) < 1e-13);
  assert.ok(wobb.strictUnconditional > both.strictUnconditional);
  assert.equal(none.basicCount, 14);
  assert.equal(none.competitivelyQualifiedGames, 0);
});

test('six versus seven effective donors: strict event and Prize-only limits', () => {
  const v2 = screenMix(printedMix(), 'wobbuffet');
  const proposed = {banette:4,shuppet:3,sinistcha:3};
  const ten = screenMix(proposed, 'wobbuffet');
  const tenLab = screenMix(proposed, 'silent-lab');
  const unlockedTen = screenMix(proposed, 'none');
  const unlockedV2 = screenMix(printedMix(), 'none');
  assert.equal(ten.strictFraction,
    '529002790057237/7441390520764200');
  assert.equal(tenLab.strictFraction, ten.strictFraction);
  assert.equal(unlockedTen.strictFraction, '264074861227/3626408635850');
  assert.equal(ten.basicCount, 15);
  assert.ok(ten.strictUnconditional > v2.strictUnconditional);
  assert.ok(ten.prizeOnlyRetention > v2.prizeOnlyRetention);
  assert.ok(unlockedTen.strictUnconditional >
    unlockedV2.strictUnconditional);
  assert.ok(unlockedTen.strictGivenBasicOpening <
    unlockedV2.strictGivenBasicOpening);
  assert.ok(Math.abs(prizeOnlyRetention(6)-0.9896558115974278)<1e-13);
  assert.ok(Math.abs(prizeOnlyRetention(7)-0.99901425898842)<1e-13);
  assert.ok(ten.assumesHypotheticalExtraDonorsReplaceNonBasicTrainers);
  assert.ok(!v2.assumesHypotheticalExtraDonorsReplaceNonBasicTrainers);
});

test('bad counts and unknown lock fail before any strategic inference', () => {
  assert.throws(() => eligibleDonors({banette:5,shuppet:2,sinistcha:1},
    'none'));
  assert.throws(() => screenMix({banette:0,shuppet:0,sinistcha:0},
    'none'));
  assert.throws(() => screenMix(printedMix(),'unsupported'));
  assert.throws(() => maximinMixes(13));
  assert.throws(() => prizeOnlyRetention(-1));
});
