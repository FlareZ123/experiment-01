'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION, afterSupporterSequence} =
  require('../../simulation/evaluation/agent9-v8-mail-handiwork-follow-four-arm.cjs');

test('strict follow-through requires opponent substantive root and later source own turn', () => {
  assert.equal(VERSION, 'agent9-v8-mail-handiwork-native-four-arm-v1');
  const tape = [
    {ordinal: 9, seat: 1, turn: 2, action: 'PlayCardAction'},
    {ordinal: 10, seat: 1, turn: 2, action: 'ResolvePromptAction'},
    {ordinal: 11, seat: 0, turn: 3, action: 'PlayCardAction'},
    {ordinal: 12, seat: 1, turn: 3, action: 'ResolvePromptAction'},
    {ordinal: 13, seat: 1, turn: 4, action: 'AttackAction'}
  ];
  const result = afterSupporterSequence(1,9,tape);
  assert.equal(result.settled,true);
  assert.deepEqual(result.opponent,
    {ordinal:11,turn:3,action:'PlayCardAction'});
  assert.deepEqual(result.sourceNextTurn,
    {ordinal:13,turn:4,action:'AttackAction'});
});

test('defensive prompt and same-turn own answer do not count as strategic continuation', () => {
  const t = [
    {ordinal: 6, seat: 1, turn: 2, action: 'PlayCardAction'},
    {ordinal: 7, seat: 0, turn: 3, action: 'AttackAction'},
    {ordinal: 8, seat: 1, turn: 3, action: 'ResolvePromptAction'},
    {ordinal: 9, seat: 1, turn: 3, action: 'PlayCardAction'}
  ];
  assert.equal(afterSupporterSequence(1,6,t).settled, false);
  assert.equal(afterSupporterSequence(1,99,t).settled, false);
  assert.equal(afterSupporterSequence(1,6,t.slice(0,2)).settled, false);
});
