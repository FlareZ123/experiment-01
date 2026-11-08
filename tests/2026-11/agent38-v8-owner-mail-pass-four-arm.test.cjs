'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION, REGISTRATION, firstDivergence, mailContinuation
} = require('../../simulation/evaluation/agent38-v8-owner-mail-pass-four-arm.cjs');

test('exact preregistration preserves two original seeds and both physical seats', () => {
  assert.equal(VERSION, 'agent38-v8-owner-mail-after-pass-four-arm-v1');
  assert.equal(REGISTRATION.schema, VERSION);
  assert.equal(REGISTRATION.trials.length, 4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(t => t.seed)),
    new Set([2404595552, 948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(t => t.sourceSeat)),
    new Set([0, 1]));
  assert.equal(REGISTRATION.nativeRootActionsPerArm, 260);
});

test('root comparison identifies the exact first native Pass to Mail change', () => {
  const same = {ordinal: 1, seat: 0, turn: 1,
    action: 'ResolvePromptAction', promptId: '5', responseType: 'boolean'};
  const passive = {ordinal: 2, seat: 1, turn: 2,
    action: 'PassTurnAction', promptId: null, responseType: null};
  const mail = {...passive, action: 'PlayCardAction',
    ownerMailAfterPassAction: true};
  const result = firstDivergence([same, passive], [same, mail]);
  assert.equal(result.index, 1);
  assert.equal(result.control.action, 'PassTurnAction');
  assert.equal(result.treatment.ownerMailAfterPassAction, true);
  assert.equal(firstDivergence([same], [same]), null);
});

test('Mail continuation requires opponent strategic action and later source own-turn action', () => {
  const mail = {ordinal: 8, seat: 1, turn: 2,
    action: 'PlayCardAction', ownerMailAfterPassAction: true};
  const opponent = {ordinal: 13, seat: 0, turn: 3,
    action: 'PlayCardAction'};
  const source = {ordinal: 19, seat: 1, turn: 4,
    action: 'AttackAction'};
  const positives = mailContinuation(mail, [mail, opponent, source]);
  assert.equal(positives.continuityPassed, true);
  assert.deepEqual(positives.opponentMeaningfulRoot, opponent);
  assert.deepEqual(positives.sourceOwnTurnMeaningfulRoot, source);
  const defensive = mailContinuation(mail, [mail, opponent,
    {...source, turn: 3, action: 'ResolvePromptAction'}]);
  assert.equal(defensive.continuityPassed, false);
  const passiveOpponent = mailContinuation(mail, [mail,
    {...opponent, action: 'PassTurnAction'}, source]);
  assert.equal(passiveOpponent.continuityPassed, false);
});
