'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canonicalCards, parseField, buildCampaign, loadDefaultCampaign, PILOT_RANKS
} = require('../scripts/aichi-comparison-campaign.cjs');

/** @param {string} name @param {number} count */
function card(name, count) {
  return { name, count, printing: { set: 'TST', number: '1', language: 'en' } };
}

/** @returns {{field:Array<object>,source:object,candidates:Array<object>}} */
function synthetic() {
  const field = Array.from({ length: 32 }, (_, i) => ({
    rank: i + 1, player: 'P' + (i + 1), archetype: 'Synthetic',
    published: i < 2
  }));
  const source = { decks: field.slice(0, 2).map(f => ({
    ...f, cards: [card('Psychic Energy', 60)]
  })) };
  const candidates = [
    { id: 'reference', cards: [card('Psychic Energy', 60)], referenceOnly: true },
    { id: 'challenger', cards: [card('Grass Energy', 60)] }
  ];
  return { field, source, candidates };
}

test('real source: three exact fixed 60-card inventories and known source gaps', () => {
  const report = loadDefaultCampaign();
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.candidateRows.length, 3);
  assert.ok(report.candidateRows.every(c => /^[0-9a-f]{64}$/.test(c.deckDigest)));
  assert.deepEqual(report.coverage.missingRanks, [23, 25, 28]);
  assert.equal(report.coverage.publishedRanks.length, 29);
  assert.deepEqual(report.pilotRanks, PILOT_RANKS);
  assert.equal(report.trialCountByPhase.pilot, 54);
  assert.equal(report.trialCountByPhase.publishedField, 174);
  assert.equal(report.trials.length, 228);
  assert.equal(report.engineAndPolicyQualified, false);
  assert.equal(report.strengthClaimPermitted, false);
  assert.ok(report.candidateRows.find(c => c.id === 'champion-reference').referenceOnly);
  assert.equal(report.trials.some(t => [23, 25, 28].includes(t.rank)), false);
});

test('one seed is matched across candidates and engine slots, never labeled true turn', () => {
  const plan = buildCampaign({ ...synthetic(), pilotRanks: [2, 1], repeats: 2 });
  assert.equal(plan.trialCountByPhase.pilot, 16);
  assert.equal(plan.trialCountByPhase.publishedField, 16);
  assert.equal(new Set(plan.trials.map(t => t.trialId)).size, plan.trials.length);
  for (const phase of ['pilot', 'published-field']) {
    for (const rank of [1, 2]) {
      for (const repeat of [0, 1]) {
        const block = plan.trials.filter(t =>
          t.phase === phase && t.rank === rank && t.repeat === repeat);
        assert.equal(block.length, 4);
        assert.equal(new Set(block.map(t => t.seed)).size, 1);
        assert.deepEqual(new Set(block.map(t => t.candidateEngineSlot)), new Set(['A', 'B']));
        assert.ok(block.every(t => t.actualStartingTurn === 'requires-runtime-verification'));
      }
    }
  }
  assert.deepEqual(plan, buildCampaign({ ...synthetic(), pilotRanks: [2, 1], repeats: 2 }));
  assert.notEqual(plan.trials[0].seed,
    plan.trials.find(t => t.phase === 'published-field').seed);
});

test('fingerprinting is insensitive to card row order and duplicate splitting', () => {
  const a = canonicalCards([card('Psychic Energy', 30), card('Grass Energy', 30)]);
  const b = canonicalCards([card('Grass Energy', 30),
    card('Psychic Energy', 10), card('Psychic Energy', 20)]);
  assert.deepEqual(a, b);
  assert.throws(() => canonicalCards([card('Psychic Energy', 59)]), /60/);
  assert.throws(() => canonicalCards([card('Psychic Energy', 60),
    card('Grass Energy', 1)]), /60/);
  assert.throws(() => canonicalCards([{
    name: 'Energy', count: 60, printing: { set: '', number: '1' }
  }]), /printing/);
});

test('unknown list, duplicate rank, altered source, bad pilot and candidate reject', () => {
  const original = synthetic();
  assert.throws(() => buildCampaign({
    ...original, pilotRanks: [3]
  }), /unpublished/);
  assert.throws(() => buildCampaign({
    ...original, field: [...original.field.slice(0, 31), original.field[0]],
    pilotRanks: [1]
  }), /rank 1..32/);
  assert.throws(() => buildCampaign({
    ...original, source: { decks: [original.source.decks[0]] }, pilotRanks: [1]
  }), /disagreement/);
  assert.throws(() => buildCampaign({
    ...original, candidates: [...original.candidates, original.candidates[0]],
    pilotRanks: [1]
  }), /candidate id/);
});

test('strict manifest parser refuses ambiguous or malformed source status', () => {
  const rows = parseField('rank,player,archetype,full_list_published\n1,P1,Test,yes\n2,P2,Test,no\n');
  assert.deepEqual(rows.map(x => x.published), [true, false]);
  assert.throws(() => parseField('rank,player,archetype,published\n1,P,Test,yes'),
    /header/);
  assert.throws(() => parseField('rank,player,archetype,full_list_published\n1,P,Test,maybe'),
    /Malformed/);
});

// Keep the scheduled-trial executor under the same manual campaign CI gate.
require('./aichi-campaign-runner.test.cjs');
