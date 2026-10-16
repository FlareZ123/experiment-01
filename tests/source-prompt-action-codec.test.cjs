'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {capturePromptAction,restorePromptAction,SCHEMA} =
  require('../simulation/twinleaf/source-prompt-action-codec.cjs');

class ChooseCardsPrompt {
  constructor(cards, id = 9) {
    this.id = id;
    this.cards = {cards};
    this.message = 'CHOOSE_CARDS';
  }
}
class ChooseAttackPrompt {
  constructor(cards, id = 10) {
    this.id = id;
    this.cards = cards;
    this.message = 'CHOOSE_ATTACK';
  }
}
class ResolvePromptAction {
  constructor(id, result, log) {
    this.type = 'RESOLVE_PROMPT';
    this.id = id;
    this.result = result;
    this.log = log;
  }
}

test('identical card printing copies retain the selected live index in new Store', () => {
  const original = [{fullName:'Pidgey MEW'},{fullName:'Pidgey MEW'}];
  const prompt = new ChooseCardsPrompt(original);
  const archive = JSON.parse(JSON.stringify(capturePromptAction(prompt,
    new ResolvePromptAction(9, [original[1]]), {})));
  assert.equal(archive.schema,SCHEMA);
  const fresh = [{fullName:'Pidgey MEW'},{fullName:'Pidgey MEW'}];
  const action = restorePromptAction(new ChooseCardsPrompt(fresh), {}, archive,
    ResolvePromptAction);
  assert.equal(action.result[0],fresh[1]);
  assert.notEqual(action.result[0],fresh[0]);
  assert.equal(action.log,undefined);
});

test('changed candidate pool or prompt ID fails prior to dispatch', () => {
  const source = [{fullName:'Pidgey MEW'}];
  const captured = capturePromptAction(new ChooseCardsPrompt(source),
    new ResolvePromptAction(9,[source[0]]),{});
  assert.throws(() => restorePromptAction(
    new ChooseCardsPrompt([{fullName:'Solrock CES'}]), {}, captured,
    ResolvePromptAction), /Replay card selection differs|candidate/);
  assert.throws(() => restorePromptAction(
    new ChooseCardsPrompt(source,11), {}, captured, ResolvePromptAction),
    /identity differs/);
});

test('copied attacks are reconstructed using exact source attack object', () => {
  const before = [{fullName:'Dialga-GX UPR',
    attacks:[{name:'Overclock'},{name:'Timeless-GX'}]}];
  const record = JSON.parse(JSON.stringify(capturePromptAction(
    new ChooseAttackPrompt(before),
    new ResolvePromptAction(10, before[0].attacks[1]),{})));
  const after = [{fullName:'Dialga-GX UPR',
    attacks:[{name:'Overclock'},{name:'Timeless-GX'}]}];
  const replay = restorePromptAction(new ChooseAttackPrompt(after),{},
    record,ResolvePromptAction);
  assert.equal(replay.result,after[0].attacks[1]);
});

test('unknown prompts and nonportable logs remain out of replay scope', () => {
  class OtherPrompt {constructor() {this.id = 1;}}
  assert.equal(capturePromptAction(new OtherPrompt(),
    new ResolvePromptAction(1,5),{}),null);
  assert.throws(() => capturePromptAction(new ChooseCardsPrompt([]),
    new ResolvePromptAction(9,[],{data:'log'}),{}),/StateLog/);
});
