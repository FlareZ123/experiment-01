'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {observeFirstTurn, summarizeTurnOrder} =
  require('../simulation/twinleaf/turn-order-evidence.cjs');

const players = [{id: 101, name: 'research-A'}, {id: 202, name: 'research-B'}];

test('setup activePlayer is not first-turn evidence', () => {
  assert.equal(observeFirstTurn({turn: 0, activePlayer: 0, players}), null);
});

test('turn-one state identifies either starting player', () => {
  assert.deepEqual(observeFirstTurn({turn: 1, activePlayer: 0, players}),
    {slot: 0, playerId: 101, playerName: 'research-A'});
  assert.deepEqual(observeFirstTurn({turn: 1, activePlayer: 1, players}),
    {slot: 1, playerId: 202, playerName: 'research-B'});
  assert.equal(observeFirstTurn({turn: 2, activePlayer: 0, players}), null);
});

test('invalid first-turn slots fail rather than misattribute', () => {
  assert.throws(() => observeFirstTurn({turn: 1, activePlayer: 2, players}), /invalid activePlayer/);
});

test('first draw log independently checks starter identity', () => {
  const first = observeFirstTurn({turn: 1, activePlayer: 1, players});
  const logs = [
    {message: 'LOG_TURN', params: {turn: 1}},
    {message: 'LOG_PLAYER_DRAWS_CARD', params: {name: 'research-B'}},
    {message: 'LOG_PLAYER_DRAWS_CARD', params: {name: 'research-A'}},
  ];
  assert.deepEqual(summarizeTurnOrder(first, logs), {
    firstTurnSlot: 1,
    firstTurnPlayerId: 202,
    firstTurnPlayerName: 'research-B',
    firstDrawLogName: 'research-B',
    verifiedByDrawLog: true,
  });
  assert.throws(() => summarizeTurnOrder(first, [
    {message: 'LOG_PLAYER_DRAWS_CARD', params: {name: 'research-A'}},
  ]), /contradicts/);
});

test('absence of turn one is explicitly unverified', () => {
  assert.deepEqual(summarizeTurnOrder(null, []), {
    firstTurnSlot: null,
    firstTurnPlayerId: null,
    firstTurnPlayerName: null,
    firstDrawLogName: null,
    verifiedByDrawLog: false,
  });
});
