'use strict';

const assert = require('node:assert/strict');
const { runMatch, upstreamSmokeDeck, seededRandom, deckPermutation, initializeCards } = require('./headless.cjs');
const { registerPlayersCeremony } = require('./card-patches.cjs');

const seed = 20310317;
const shuffle1 = deckPermutation(60, seededRandom(seed));
const shuffle2 = deckPermutation(60, seededRandom(seed));
assert.deepEqual(shuffle1, shuffle2);
assert.equal(new Set(shuffle1).size, 60);
assert.deepEqual([...shuffle1].sort((a, b) => a - b), Array.from({ length: 60 }, (_, i) => i));

const manager = initializeCards();
const ceremonyName = registerPlayersCeremony();
assert.equal(registerPlayersCeremony(), ceremonyName, 'Research card registration must be idempotent.');
const ceremony = manager.getCardByName(ceremonyName);
assert.equal(ceremony.name, "Player's Ceremony");
assert.equal(ceremony.set, 'SP');
assert.equal(ceremony.setNumber, '127');
assert.ok(ceremony.text.includes('draw 2 cards'));

const deck = upstreamSmokeDeck();
assert.equal(deck.length, 60, 'Curated upstream smoke deck must have exactly 60 cards.');
const request = { deckA: deck, deckB: deck, seed, maxActions: 100, label: 'upstream Standard deck under Expanded mechanics, smoke only' };
const run1 = runMatch(request);
const run2 = runMatch(request);
assert.deepEqual(run1, run2, 'Same seed and inputs must give identical observable results.');
assert.ok(run1.actions > 0, 'The engine must advance beyond its initial state.');
assert.ok([0, 1].includes(run1.firstTurnSlot), 'First player must be actually observed.');
assert.equal(run1.firstTurnPlayerId, [101, 202][run1.firstTurnSlot]);
assert.equal(run1.firstTurnPlayerName, run1.firstDrawLogName,
  'The first-turn engine state must match the first draw log.');
assert.equal(run1.verifiedByDrawLog, true);
const isolatedRequest = { ...request, isolatePolicyRandomness: true };
const isolated1 = runMatch(isolatedRequest);
const isolated2 = runMatch(isolatedRequest);
assert.deepEqual(isolated1, isolated2,
  'Separate policy/game RNG streams must remain deterministic under the pinned engine.');
assert.equal(isolated1.policyRandomIsolation, true);
assert.equal(isolated1.randomnessProtocol, 'separate-game-and-per-seat-policy-prng-v1');
assert.equal(run1.policyRandomIsolation, false, 'Legacy records keep their original RNG protocol.');

const {
  PROTOCOL: independentRngProtocol,
  createRandomMaterial,
  randomMaterialCommitment
} = require('../evaluation/agent37-independent-rng-v1.cjs');
const independentMaterialA = createRandomMaterial();
const independentMaterialB = createRandomMaterial();
const independentCommitmentA = randomMaterialCommitment(independentMaterialA);
const independentCommitmentB = randomMaterialCommitment(independentMaterialB);
assert.notEqual(independentCommitmentA, independentCommitmentB,
  'Each attempted game must receive fresh independently sampled stream material.');
const independentRequest = material => ({
  ...request,
  rngProtocol: independentRngProtocol,
  rngMaterial: material,
  rngMaterialCommitment: randomMaterialCommitment(material),
  isolatePolicyRandomness: true,
  label: 'upstream Standard deck under independent CSPRNG streams, smoke only'
});
const independentA = runMatch(independentRequest(independentMaterialA));
const independentB = runMatch(independentRequest(independentMaterialB));
const independentAAfterB = runMatch(independentRequest(independentMaterialA));
assert.deepEqual(independentA, independentAAfterB,
  'A game must replay identically after an intervening game in the same process.');
for (const [result, commitment] of [
  [independentA, independentCommitmentA],
  [independentB, independentCommitmentB],
  [independentAAfterB, independentCommitmentA]
]) {
  assert.equal(result.randomnessProtocol, independentRngProtocol);
  assert.equal(result.rngMaterialCommitment, commitment);
  assert.equal(result.policyRandomIsolation, true);
  assert.equal(result.physicalShuffleRandomIsolation, true);
  assert.equal(result.coinRandomIsolation, true);
  assert.equal(result.engineRandomIsolation, true);
  assert.ok(result.actions > 0);
}
assert.equal(independentA.seed, seed);
assert.equal(independentB.seed, seed,
  'The schedule seed remains fixed while independent RNG material changes.');
assert.notEqual(independentA.rngMaterialCommitment, independentB.rngMaterialCommitment);

const independentRngSummary = {
  protocol: independentRngProtocol,
  freshMaterialPerAttempt: true,
  sameMaterialReplayAfterInterveningGame: true,
  games: [independentA, independentB, independentAAfterB].map(result => ({
    commitment: result.rngMaterialCommitment,
    actions: result.actions,
    endReason: result.endReason,
    policyRandomIsolation: result.policyRandomIsolation,
    physicalShuffleRandomIsolation: result.physicalShuffleRandomIsolation,
    coinRandomIsolation: result.coinRandomIsolation,
    engineRandomIsolation: result.engineRandomIsolation
  }))
};
console.log(JSON.stringify({
  kind: 'headless-smoke',
  note: 'No Aichi field matches or win-rate evidence',
  result: run1,
  isolatedResult: isolated1,
  independentRngSummary
}, null, 2));
