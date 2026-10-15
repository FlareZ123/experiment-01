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
console.log(JSON.stringify({ kind: 'headless-smoke', note: 'No Aichi field matches or win-rate evidence', result: run1 }, null, 2));
