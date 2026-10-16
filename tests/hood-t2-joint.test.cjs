'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { exactHoodOpening } = require('../scripts/hood-t2-joint.cjs');
const { auditCandidate } = require('../scripts/candidate-mirror-gate.cjs');
const field = require('../results/aichi-2026/full-decklists.json');
const candidate = require('../results/aichi-2026/candidate-hood-shadow-rider.json');

/** @param {number} left @param {number} right */
function near(left, right) {
  assert.ok(Math.abs(left - right) < 1e-10, left + ' versus ' + right);
}

/** @param {string} name */
function count(name) {
  return candidate.cards.filter(card => card.name === name)
    .reduce((total, card) => total + card.count, 0);
}

test('Hood Shield manifest is a fixed, source-distinct 60-card list', () => {
  assert.equal(candidate.cards.reduce((s, x) => s + x.count, 0), 60);
  for (const [category, expected] of Object.entries(candidate.category_counts)) {
    assert.equal(candidate.cards.filter(row => row.category === category)
      .reduce((sum, row) => sum + row.count, 0), expected);
  }
  assert.equal(count('Shadow Rider Calyrex V'), 4);
  assert.equal(count('Shadow Rider Calyrex VMAX'), 4);
  assert.equal(count('Stealthy Hood'), 2);
  assert.equal(count('Arven'), 1);
  assert.equal(count('Pokémon Ranger'), 1);
  assert.equal(count('VS Seeker'), 2);
  assert.equal(count('Temple of Sinnoh'), 0);
  assert.equal(count('Wobbuffet'), 0);
  assert.deepEqual(auditCandidate(candidate, field).exactSourceMirrorRanks, []);
});

test('rank-1 base rate and proposed Hood Shield joint opening are exact', () => {
  const original = exactHoodOpening({
    riderV: 3, riderVMAX: 4, hoodCount: 0, arvenCount: 0
  });
  near(original.validOpeningProbability, 0.8614093191287201);
  near(original.readyVAndVMAXByTurn2, 0.1825732235695298);
  assert.equal(original.readyWithDirectOrArvenHoodByTurn2, 0);
  const proposal = exactHoodOpening({
    riderV: 4, riderVMAX: 4, hoodCount: 2, arvenCount: 1
  });
  near(proposal.validOpeningProbability, 0.8614093191287201);
  near(proposal.readyVAndVMAXByTurn2, 0.2301436932618534);
  near(proposal.readyWithDirectHoodByTurn2, 0.05456978782843523);
  near(proposal.readyWithDirectOrArvenHoodByTurn2, 0.07714336015705044);
  near(proposal.arvenAdditionalReadyByTurn2, 0.02257357232861521);
});

test('more potential Hood channels never lower a direct-setup opportunity', () => {
  const get = (h, a) => exactHoodOpening({
    riderV: 4, riderVMAX: 4, hoodCount: h, arvenCount: a
  }).readyWithDirectOrArvenHoodByTurn2;
  assert.ok(get(2, 0) < get(2, 1));
  assert.ok(get(2, 1) < get(2, 2));
  assert.ok(get(1, 1) < get(2, 1));
  assert.equal(get(0, 2), 0);
});

test('independent exhaustive ten-card deal and Prize census', () => {
  const config = {
    totalCards: 10, initialHandSize: 3, prizeCount: 2,
    basicCount: 3, riderV: 2, riderVMAX: 2, hoodCount: 2, arvenCount: 1
  };
  const cards = ['V','V','MAX','MAX','HOOD','HOOD','ARVEN','BASIC','OTHER','OTHER'];
  let hands = 0;
  let validHands = 0;
  let validDeals = 0;
  let readyDeals = 0;
  let directDeals = 0;
  let availableDeals = 0;
  for (let a = 0; a < 10; a += 1) {
    for (let b = a + 1; b < 10; b += 1) {
      for (let c = b + 1; c < 10; c += 1) {
        hands += 1;
        const hand = [a, b, c];
        if (!hand.some(i => ['V', 'BASIC'].includes(cards[i]))) continue;
        validHands += 1;
        const remaining = cards.map((_, i) => i).filter(i => !hand.includes(i));
        for (const first of remaining) {
          for (const second of remaining) {
            if (first === second) continue;
            const observed = [...hand, first, second];
            const unobserved = remaining.filter(i => i !== first && i !== second);
            for (let u = 0; u < unobserved.length; u += 1) {
              for (let v = u + 1; v < unobserved.length; v += 1) {
                validDeals += 1;
                const prize = [unobserved[u], unobserved[v]];
                const ready = [...hand, first].some(i => cards[i] === 'V') &&
                  observed.some(i => cards[i] === 'MAX');
                if (!ready) continue;
                readyDeals += 1;
                const direct = observed.some(i => cards[i] === 'HOOD');
                if (direct) directDeals += 1;
                const arven = observed.some(i => cards[i] === 'ARVEN');
                const searchableHood = unobserved.some(i =>
                  cards[i] === 'HOOD' && !prize.includes(i));
                if (direct || (arven && searchableHood)) availableDeals += 1;
              }
            }
          }
        }
      }
    }
  }
  const model = exactHoodOpening(config);
  assert.equal(hands, 120);
  assert.equal(validDeals, validHands * 7 * 6 * 10);
  near(model.validOpeningProbability, validHands / hands);
  near(model.readyVAndVMAXByTurn2, readyDeals / validDeals);
  near(model.readyWithDirectHoodByTurn2, directDeals / validDeals);
  near(model.readyWithDirectOrArvenHoodByTurn2, availableDeals / validDeals);
});

// The fixed candidate's seven-lock matchup has adversarial hard answers.
require('./aichi_hood_response_inventory.test.cjs');
