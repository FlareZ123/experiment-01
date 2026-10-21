'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { ticketPostShuffleAccess } = require('../scripts/aichi-ticket-postshuffle-access.cjs');

test('paper-legal one-card Compressor shuffle has 45 cards and k/45 DCE access', () => {
  const result = ticketPostShuffleAccess(60, 12, 7, 6, 4, 1);
  assert.equal(result.cardsBeforeCompressor, 46);
  assert.equal(result.cardsRemaining, 45);
  assert.equal(result.compressorDiscardCount, 1);
  assert.equal(result.conditionalAfterShuffle, 1 / 45);
  assert.ok(Math.abs(result.unconditionalAfterShuffle - 0.0001124851877161848) < 1e-12);
});

/** Exact independent enumeration of ordered physical initial hands and Prizes. */
function independent(n, b, h, q, c, k, discarded) {
  const cards = ['D', 'T', ...Array.from({ length: c }, (_, i) => 'C' + i),
    ...Array.from({ length: b }, (_, i) => 'B' + i)];
  while (cards.length < n) cards.push('X' + cards.length);
  const used = Array(n).fill(false), order = [];
  let legal = 0, route = 0, post = 0, plain = 0;
  function visit() {
    if (order.length === h + q + 1) {
      if (!order.slice(0, h).some(x => x[0] === 'B')) return;
      legal++;
      if (!order.slice(h, h + q).includes('D')) return;
      const seen = order.slice(0, h).concat(order[h + q]);
      if (!seen.includes('T') || !seen.some(x => x[0] === 'C')) return;
      route++;
      const before = n - h - q - 1;
      post += k;
      plain += before * Math.max(0, k - (before - q)) / q;
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      order.push(cards[i]);
      visit();
      order.pop();
      used[i] = false;
    }
  }
  visit();
  const before = n - h - q - 1;
  return {
    route: route / legal,
    post: post / (legal * (before - discarded)),
    plain: plain / (legal * before)
  };
}

test('independent physical mini-deck enumerations agree with all legal discard counts', () => {
  for (const [n, b, h, q, c] of [[9, 2, 2, 2, 1], [10, 3, 2, 2, 1]]) {
    const before = n - h - q - 1;
    for (const discarded of [1, 2, 3]) {
      const remaining = before - discarded;
      for (const k of [0, 1, remaining]) {
        const result = ticketPostShuffleAccess(n, b, h, q, c, k, discarded);
        const counted = independent(n, b, h, q, c, k, discarded);
        assert.ok(Math.abs(counted.route - result.directTicketCompressor) < 1e-12);
        assert.ok(Math.abs(counted.post - result.unconditionalAfterShuffle) < 1e-12);
        assert.ok(Math.abs(counted.plain - result.unconditionalWithoutShuffle) < 1e-12);
      }
    }
  }
});

/** Enumerate each possible physical shuffle of one DCE plus expendable cards. */
test('exact shuffled survivor arrangements give k/(46-discarded)', () => {
  function enumerate(remaining, prefix, callback) {
    if (remaining.length === 0) {
      callback(prefix);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      enumerate(remaining.filter((_, j) => j !== i), prefix.concat(remaining[i]), callback);
    }
  }
  for (const discarded of [1, 2, 3]) {
    const cards = ['D', ...Array.from({ length: 5 - discarded }, (_, i) => 'X' + i)];
    const counts = Array(cards.length + 1).fill(0);
    let permutations = 0;
    enumerate(cards, [], order => {
      permutations++;
      const position = order.indexOf('D');
      for (let k = 0; k <= cards.length; k++) {
        if (position < k) counts[k]++;
      }
    });
    for (let k = 0; k <= cards.length; k++) {
      assert.equal(counts[k] / permutations, k / cards.length);
    }
  }
});

test('zero-card Compressor and exhausted draw horizons are rejected', () => {
  assert.throws(() => ticketPostShuffleAccess(60, 12, 7, 6, 4, 1, 0), RangeError);
  assert.throws(() => ticketPostShuffleAccess(60, 12, 7, 6, 4, 1, 4), RangeError);
  assert.throws(() => ticketPostShuffleAccess(60, 12, 7, 6, 4, 46), RangeError);
  assert.throws(() => ticketPostShuffleAccess(60, 12, 7, 6, 4, -1), RangeError);
  assert.throws(() => ticketPostShuffleAccess(10, 2, 2, 4, 1, 0), RangeError);
});
