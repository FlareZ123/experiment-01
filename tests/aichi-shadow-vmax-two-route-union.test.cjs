'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, expandProfile, KEYS } = require('../scripts/aichi-shadow-vmax-two-route-union.cjs');
const { exactFirstDraw, sourceTurnProfiles } = require('../scripts/aichi-radiant-wobbuffet-turnone.cjs');
const { sourceCandidates } = require('../scripts/aichi-radiant-start-tradeoff.cjs');
const { naturalEvolutionChance } = require('../scripts/first-evolution-natural.cjs');

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, String(a) + ' != ' + String(b));

function combinations(ids, k) {
  if (!k) return [[]];
  const out = [];
  for (let i = 0; i <= ids.length - k; i += 1) {
    for (const tail of combinations(ids.slice(i + 1), k - 1)) out.push([ids[i], ...tail]);
  }
  return out;
}

/** All physical card deals, independent of the BigInt category DP. */
function physicalDeals(groups, h, q) {
  const cards = groups.flatMap((count, category) => Array(count).fill(category));
  const ids = cards.map((_, i) => i);
  const tallies = {valid:0n, natural:0n, gate:0n, overlap:0n, either:0n, gateBlocked:0n};
  for (const openingIds of combinations(ids, h)) {
    const opening = openingIds.map(i => cards[i]);
    if (!opening.some(i => [0, 4, 5, 6].includes(i))) continue;
    const afterHand = ids.filter(i => !openingIds.includes(i));
    for (const prizeIds of combinations(afterHand, q)) {
      const prizes = prizeIds.map(i => cards[i]);
      const deckBeforeFirstDraw = afterHand.filter(i => !prizeIds.includes(i));
      for (const firstDrawId of deckBeforeFirstDraw) {
        const firstHand = [...opening, cards[firstDrawId]];
        const deckAfterFirstDraw = deckBeforeFirstDraw.filter(i => i !== firstDrawId);
        const deckVMAX = deckAfterFirstDraw.filter(i => cards[i] === 3).length;
        const radiantInDeck = deckAfterFirstDraw.some(i => cards[i] === 0);
        const alternate = opening.some(i => [4, 5, 6].includes(i));
        const route = (opening.includes(0) && alternate)
          || (cards[firstDrawId] === 0 && alternate)
          || (radiantInDeck && alternate && firstHand.includes(1))
          || (prizes.includes(0) && alternate && firstHand.includes(2));
        const gateResources = route && deckVMAX >= 2;
        const forcedWobbuffet = opening.includes(4) && !opening.some(i => [5, 6].includes(i));
        for (const secondDrawId of deckAfterFirstDraw) {
          tallies.valid += 1n;
          const natural = firstHand.includes(5)
            && (firstHand.includes(3) || cards[secondDrawId] === 3);
          const gate = gateResources && !forcedWobbuffet;
          if (natural) tallies.natural += 1n;
          if (gate) tallies.gate += 1n;
          if (natural && gate) tallies.overlap += 1n;
          if (natural || gate) tallies.either += 1n;
          if (gateResources && forcedWobbuffet) tallies.gateBlocked += 1n;
        }
      }
    }
  }
  return Object.fromEntries(Object.entries(tallies).map(([k, v]) => [k, v.toString()]));
}

test('source groupings match independent natural evolution and direct Radiant marginals', () => {
  const profiles = sourceCandidates();
  const gateProfiles = sourceTurnProfiles();
  for (const label of ['champion', 'hood', 'temple']) {
    const groups = expandProfile(label);
    assert.equal(groups.reduce((a, b) => a + b, 0), 60);
    const x = calculate(groups);
    const c = profiles[label];
    const basics = c.radiant + c.lele + c.shadowV + c.wobbuffet + c.otherBasic;
    const natural = naturalEvolutionChance({
      deckSize:60, openingSize:7, prizeCount:6, basicCount:basics,
      targetBasicCount:c.shadowV, stageOneCount:c.shadowVMAX,
    });
    const gate = exactFirstDraw(gateProfiles[label]);
    close(x.natural, natural.conditional);
    close(x.gate, gate.unblockedTwoVmax);
    close(x.gateBlocked, gate.selflockedTwoVmax);
    close(x.either, x.natural + x.gate - x.overlap);
  }
});

test('physical-card opening, Prizes and both draw positions match all six exact event counts', () => {
  const small = [1, 1, 1, 2, 1, 1, 1, 3];
  assert.equal(small.length, KEYS.length);
  const x = calculate(small, {openingSize:3, prizeCount:2});
  const physical = physicalDeals(small, 3, 2);
  for (const [key, value] of Object.entries(physical)) {
    assert.equal(x.numerators[key], value, 'Mismatch: ' + key);
  }
  console.log('physical deals:', physical.valid);
});

test('source-verified Hood has 14 Basics and joint outcomes anchor exactly', () => {
  const c = sourceCandidates().hood;
  assert.equal(c.radiant+c.lele+c.shadowV+c.wobbuffet+c.otherBasic,14);
  const a = calculate(expandProfile('champion'));
  const b = calculate(expandProfile('hood'));
  const d = calculate(expandProfile('temple'));
  close(a.either, 0.6067819926140124);
  close(b.either, 0.6323447364326875);
  close(d.either, 0.5663593104831307);
  close(b.natural, 0.23014369326185374);
  assert.ok(b.either > a.either && a.either > d.either);
});
