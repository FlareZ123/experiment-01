'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {withActiveOpeningPivot} = require('../simulation/twinleaf/active-opening-pivot.cjs');

const GameMessage = {CHOOSE_STARTING_POKEMONS: 'CHOOSE_STARTING_POKEMONS'};
class ChooseCardsPrompt {
  constructor(id, message, allowed = true) {
    this.id = id;
    this.message = message;
    this.allowed = allowed;
  }
  validate(cards) { return this.allowed && cards.length === 3; }
}
class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}
class ChooseCardsPromptResolver {
  constructor(options) { this.options = options; }
  resolvePrompt(state, player, prompt) {
    return new ResolvePromptAction(prompt.id, state.selected);
  }
}
class OtherResolver {}
const types = {ChooseCardsPromptResolver, ChooseCardsPrompt, ResolvePromptAction, GameMessage};
function run(cards, message = GameMessage.CHOOSE_STARTING_POKEMONS, valid = true) {
  const options = {promptResolvers: [OtherResolver, ChooseCardsPromptResolver]};
  const next = withActiveOpeningPivot(options, types);
  const custom = new next.promptResolvers[1](next);
  const result = custom.resolvePrompt({selected: cards}, {}, new ChooseCardsPrompt(7, message, valid));
  return {options, next, result};
}

test('selected Shadow Rider V becomes Active while other Basics stay selected', () => {
  const latias = {name: 'Latias ex'}, rider = {name: 'Shadow Rider Calyrex V'},
    clefairy = {name: "Lillie's Clefairy ex"};
  const cards = [latias, rider, clefairy];
  const {options, next, result} = run(cards);
  assert.deepEqual(result.result, [rider, latias, clefairy]);
  assert.deepEqual(cards, [latias, rider, clefairy]);
  assert.equal(result.id, 7);
  assert.equal(options.promptResolvers[1], ChooseCardsPromptResolver);
  assert.equal(next.promptResolvers[0], OtherResolver);
  assert.notEqual(next.promptResolvers[1], ChooseCardsPromptResolver);
});

test('a non-setup prompt retains upstream ordering', () => {
  const cards = [{name: 'Latias ex'}, {name: 'Shadow Rider Calyrex V'}];
  assert.deepEqual(run(cards, 'CHOOSE_CARD_TO_HAND').result.result, cards);
});

test('missing preferred Basic or invalid reorder preserves upstream selection', () => {
  const noTarget = [{name: 'Latias ex'}, {name: 'Dialga-GX'}];
  assert.deepEqual(run(noTarget).result.result, noTarget);
  const cards = [{name: 'Latias ex'}, {name: 'Shadow Rider Calyrex V'}, {name: 'Dialga-GX'}];
  assert.deepEqual(run(cards, GameMessage.CHOOSE_STARTING_POKEMONS, false).result.result, cards);
});

test('a changed pinned resolver interface must fail closed', () => {
  assert.throws(() => withActiveOpeningPivot({promptResolvers: [OtherResolver]}, types),
    /extension point missing/);
});
