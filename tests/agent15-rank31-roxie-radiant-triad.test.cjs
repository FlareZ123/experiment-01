'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { classify, analyze } = require('../scripts/agent15-rank31-roxie-firstdraw.cjs');
const { inventory, countTriad } = require('../scripts/agent15-rank31-roxie-radiant-triad.cjs');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'results', 'aichi-2026', 'full-decklists.json'),
  'utf8'));
const source = manifest.decks.find(deck => deck.rank === 31);

test('original published rank31 printing and disjoint Basic identities', () => {
  assert(source);
  assert.deepEqual(inventory(source), [3, 7, 1, 4, 7, 4, 34]);
  assert.deepEqual(inventory(source, { includeModernEx: true }),
    [3, 9, 1, 2, 7, 4, 34]);
  const altered = structuredClone(source);
  altered.cards.find(card => card.name === 'Radiant Alakazam').printing.number = '60';
  assert.throws(() => inventory(altered), /deep-equal/);
});

test('exact conditional triad, first-draw identities and starter geometry', () => {
  const r = countTriad(inventory(source));
  const e = r.events;
  assert.equal(r.validSeven, '340827300');
  assert.equal(r.denominator, '18063846900');
  assert.equal(e.roxieRetainedKoffing.numerator, '2295407528');
  assert.equal(e.roxieRetainedKoffingAndRadiant.numerator, '309765032');
  assert.equal(e.radiantFromOpening.numerator, '280622167');
  assert.equal(e.radiantFromEighthDraw.numerator, '29142865');
  assert.equal(e.radiantBenchWithPreselectedOpeningActive.numerator, '214720841');
  assert.equal(e.radiantForcedActiveUnderBenchPriority.numerator, '95044191');
  assert.equal(e.triadAndSecondEligibleRoxiePayment.numerator, '277349483');
  assert.equal(
    BigInt(e.radiantBenchWithPreselectedOpeningActive.numerator) +
    BigInt(e.radiantForcedActiveUnderBenchPriority.numerator),
    BigInt(e.roxieRetainedKoffingAndRadiant.numerator));
  assert.equal(
    BigInt(e.radiantFromOpening.numerator) +
    BigInt(e.radiantFromEighthDraw.numerator),
    BigInt(e.roxieRetainedKoffingAndRadiant.numerator));
  assert.equal(e.roxieRetainedKoffingAndRadiant.percent, 1.7148342416476083);
  assert.equal(e.radiantBenchWithPreselectedOpeningActive.percent,
    1.1886772634238834);
});

test('recovers existing retained-Koffing model exactly', () => {
  const known = analyze(classify(source));
  const newCount = countTriad(inventory(source)).events.roxieRetainedKoffing;
  assert.equal(newCount.percent, known.afterDrawRetainedKoffingRoxie.percent);
});

test('old GX/EX versus modern lowercase ex payment sensitivity preserves geometry', () => {
  const before = countTriad(inventory(source)).events;
  const after = countTriad(inventory(source, { includeModernEx: true })).events;
  assert.equal(after.roxieRetainedKoffingAndRadiant.numerator,
    before.roxieRetainedKoffingAndRadiant.numerator);
  assert.equal(after.radiantBenchWithPreselectedOpeningActive.numerator,
    before.radiantBenchWithPreselectedOpeningActive.numerator);
  assert.equal(after.triadAndSecondEligibleRoxiePayment.numerator, '278691599');
  assert(after.triadAndSecondEligibleRoxiePayment.percent >
    before.triadAndSecondEligibleRoxiePayment.percent);
});
