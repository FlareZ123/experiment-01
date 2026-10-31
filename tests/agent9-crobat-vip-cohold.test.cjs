'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose,openingCohold,percent,handAfterBoth,run} =
  require('../scripts/agent9-crobat-vip-cohold.cjs');

test('exact original printed source Basic and VIP inventories match calculation', () => {
  const result = run();
  assert.equal(result.competitiveQualifiedGames, 0);
  assert.deepEqual(result.rows.map(row => [row.rank,row.basicCount,row.vipCount]),
    [[8,10,2],[11,11,4],[26,12,3]]);
  assert.deepEqual(result.rows.map(row => [row.goingFirstPercent,row.goingSecondPercent]), [
    ['1.7986828280','2.4480479315'],
    ['3.4062028581','4.5439041286'],
    ['2.7073530815','3.6366474503']
  ]);
  assert.deepEqual(result.rows.map(row => [row.firstBenchPercent,row.secondBenchPercent]), [
    ['1.7943262025','2.4397426384'],
    ['3.3928604823','4.5191604892'],
    ['2.6923405014','3.6087536836']
  ]);
});

test('small-deck exhaustive enumeration independently agrees on next-card probability', () => {
  const cards = ['C','O','O','V','V','X','X','X','X','X'];
  let valid = 0, first = 0, next = 0;
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        const hand = [cards[i],cards[j],cards[k]];
        if (!hand.some(card => card === 'C' || card === 'O')) continue;
        valid++;
        if (hand.includes('C') && hand.includes('O') && hand.includes('V')) first++;
        for (let r = 0; r < cards.length; r++) {
          if (r === i || r === j || r === k) continue;
          const extended = [...hand,cards[r]];
          if (hand.includes('O') && extended.includes('C') && extended.includes('V')) next++;
        }
      }
    }
  }
  const result = openingCohold({basicCount:3,vipCount:2,total:10,opening:3});
  assert.equal(choose(10,3),120n);
  assert.equal(result.validSeven,BigInt(valid));
  assert.equal(result.goingFirst.numerator,BigInt(first));
  assert.equal(result.goingSecond.numerator,BigInt(next));
  assert.equal(result.goingSecond.denominator,BigInt(valid*7));
  assert.equal(percent(result.goingFirst),'4.7058823529');
});

test('Dark Asset six-card conditional order comparison covers the boundary', () => {
  for (let hand = 2; hand <= 12; hand++) {
    const vipFirst = handAfterBoth(hand,'vip-first');
    const crobatFirst = handAfterBoth(hand,'crobat-first');
    assert.equal(vipFirst-crobatFirst,hand<=7?1:0);
  }
});
