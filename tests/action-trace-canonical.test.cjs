'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canonicalActionTrace, actionTraceSha256, compareCodePoints
} = require('../simulation/evaluation/canonical-action-trace.cjs');

const vectors = [
  {
    trace: [
      { step: 0, action: 'draw', payload: { name: 'Pokémon 🎴', n: 1 } },
      { step: 1, action: 'attack', payload: { damage: 30 } }
    ],
    sha256: '1a1651b2ac44474cc95a0b4ec388e63fd5cdc973c856461b30946f9952e29add'
  },
  {
    trace: [{ step: 0, action: 'draw', payload: { '🎴': 1, '\ue000': 2, quote: '"\\\n' } }],
    sha256: '64f7fb0b555efa2d6ea7d82f41b2a55ac06fbaeba167b75ed306b09dd7ff141d'
  },
  {
    trace: [{ step: 0, action: 'attach', payload: { negative: -7, null: null, flag: true, string: 'é' } }],
    sha256: '75a807d3adaf1c0fb4c972a82c84b99bce5dd416fd864a046ae724f14858bb43'
  }
];

test('matches exact Python 3.12 canonical UTF-8 SHA-256 vectors', () => {
  for (const item of vectors) assert.equal(actionTraceSha256(item.trace), item.sha256);
});

test('ignores object insertion order and respects code-point key order', () => {
  const first = vectors[0].trace;
  const reordered = [
    { payload: { n: 1, name: 'Pokémon 🎴' }, action: 'draw', step: 0 },
    { payload: { damage: 30 }, step: 1, action: 'attack' }
  ];
  assert.equal(canonicalActionTrace(first), canonicalActionTrace(reordered));
  assert.ok(compareCodePoints('🎴', '\ue000') > 0);
  const swapped = [{ step: 0, action: 'attack' }, { step: 1, action: 'draw' }];
  assert.notEqual(actionTraceSha256(swapped), actionTraceSha256([
    { step: 0, action: 'draw' }, { step: 1, action: 'attack' }
  ]));
});

test('rejects nonportable numbers and malformed action envelopes', () => {
  for (const invalid of [
    null, [], {}, [null], [{ step: 1, action: 'draw' }],
    [{ step: 0, action: '' }], [{ step: 0, action: 'draw', n: NaN }],
    [{ step: 0, action: 'draw', n: Infinity }],
    [{ step: 0, action: 'draw', n: 1.0 / 2 }],
    [{ step: 0, action: 'draw', n: Number.MAX_SAFE_INTEGER + 1 }],
    [{ step: 0, action: 'draw', s: String.fromCharCode(0xd800) }],
    [{ step: 0, action: 'draw', s: String.fromCharCode(0xdc00) }],
    [{ step: 0, action: 'draw', obj: new Date(0) }]
  ]) {
    assert.throws(() => actionTraceSha256(invalid));
  }
});

test('rejects cycles and symbol keys', () => {
  const cyclic = { step: 0, action: 'draw' };
  cyclic.self = cyclic;
  assert.throws(() => canonicalActionTrace([cyclic]));
  const symbolic = { step: 0, action: 'draw' };
  symbolic[Symbol('secret')] = 1;
  assert.throws(() => canonicalActionTrace([symbolic]));
});
