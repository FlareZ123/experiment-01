'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}

/** @param {number} min @param {number} max */
function fixture(min, max) {
  const prompt = {
    id: 7,
    result: undefined,
    validate(result) {
      return Array.isArray(result) && result.length >= min && result.length <= max;
    }
  };
  return { prompts: [prompt] };
}

test('accepts a valid prompt result while checking the original game state', () => {
  assert.doesNotThrow(() => assertValidPromptAction(
    fixture(1, 2), new ResolvePromptAction(7, ['card'])));
});

test('rejects a zero-card response even though Store can receive it', () => {
  assert.throws(() => assertValidPromptAction(
    fixture(1, 1), new ResolvePromptAction(7, [])), /invalid result/);
});

test('rejects resolving an unrelated ID or acting while a prompt is pending', () => {
  assert.throws(() => assertValidPromptAction(
    fixture(0, 1), new ResolvePromptAction(8, [])), /unknown or already-resolved/);
  assert.throws(() => assertValidPromptAction(
    fixture(0, 1), {constructor: {name: 'AttackAction'}}), /not answered/);
});

test('checks the specifically answered prompt among multiple pending prompts', () => {
  const state = fixture(1, 1);
  state.prompts.push({id: 8, result: undefined, validate: value => value === true});
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(8, true)));
});

test('resolved prompts do not require a ResolvePromptAction on the next turn', () => {
  const state = fixture(1, 1);
  state.prompts[0].result = ['already resolved'];
  assert.doesNotThrow(() => assertValidPromptAction(state, {}));
});

class ShuffleDeckPrompt {
  constructor(playerId, id = 7) {
    this.playerId = playerId;
    this.id = id;
    this.result = undefined;
  }
  getPerspectivePlayerId() { return this.playerId; }
  validate(result) {
    const sorted = result.slice().sort();
    return sorted.every((entry, index) => entry === index);
  }
}

test('strict gate accepts large valid shuffle despite upstream lexicographic sorting', () => {
  const permutation = Array.from({length: 60}, (_, index) => index).reverse();
  const prompt = new ShuffleDeckPrompt(101);
  const state = {
    prompts: [prompt], players: [{id: 101, deck: {cards: Array(60).fill(null)}}]
  };
  assert.equal(prompt.validate(permutation), false,
    'Original pinned source accidentally sorts numeric deck indices lexicographically');
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(7, permutation)));
});

test('strict shuffle validation rejects missing, duplicate and foreign deck indices', () => {
  const prompt = new ShuffleDeckPrompt(101);
  const state = {
    prompts: [prompt], players: [{id: 101, deck: {cards: Array(12).fill(null)}}]
  };
  const full = Array.from({length: 12}, (_, index) => index);
  const sparse = full.slice();
  delete sparse[4];
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(7, full)));
  const candidates = [
    full.slice(1),
    [...full.slice(0, 11), 11.5],
    [...full.slice(0, 11), 12],
    [...full.slice(0, 11), 0],
    sparse,
    null
  ];
  for (const candidate of candidates) {
    assert.throws(() => assertValidPromptAction(
      state, new ResolvePromptAction(7, candidate)), /invalid result/);
  }
});

class ChooseCardsPrompt {
  constructor(cards, id = 7) {
    this.id = id;
    this.cards = {cards};
    this.result = undefined;
  }
  validate(result) {
    return Array.isArray(result) && result.length === 2 &&
      result.every(card => this.cards.cards.includes(card));
  }
}

test('strict selection gate rejects selecting one physical card twice', () => {
  const a = {name: 'Card A'};
  const b = {name: 'Card A'};
  const prompt = new ChooseCardsPrompt([a, b]);
  const state = {prompts: [prompt]};
  assert.equal(prompt.validate([a, a]), true);
  assert.throws(() => assertValidPromptAction(
    state, new ResolvePromptAction(7, [a, a])), /invalid result/);
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(7, [a, b])));
});

test('strict shuffle predicate agrees with exact dense permutations up to size five', () => {
  const prompt = new ShuffleDeckPrompt(101);
  for (let size = 0; size <= 5; size++) {
    const state = {
      prompts: [prompt],
      players: [{id: 101, deck: {cards: Array(size).fill(null)}}]
    };
    const alphabet = Array.from({length: size + 3}, (_, i) => i - 1);
    for (let sample = 0; sample < alphabet.length ** size; sample++) {
      let remaining = sample;
      const proposed = [];
      for (let i = 0; i < size; i++) {
        proposed.push(alphabet[remaining % alphabet.length]);
        remaining = Math.floor(remaining / alphabet.length);
      }
      const expected = new Set(proposed).size === size &&
        proposed.every(index => Number.isInteger(index) &&
          index >= 0 && index < size);
      let accepted = true;
      try {
        assertValidPromptAction(state, new ResolvePromptAction(7, proposed));
      } catch (error) {
        assert.match(error.message, /invalid result/);
        accepted = false;
      }
      assert.equal(accepted, expected,
        'Permutation gate mismatch for size ' + size + ' candidate ' +
        JSON.stringify(proposed));
    }
  }
});

class AttachEnergyPrompt {
  constructor(cards) {
    this.id = 19;
    this.result = undefined;
    this.message = 'Attach one Energy';
    this.cardList = {
      cards,
      filter(predicate) { return this.cards.filter(predicate); }
    };
    this.filter = () => true;
    this.options = {min: 1, max: 2};
  }
  validate(result) {
    return Array.isArray(result) && result.length >= 1 && result.length <= 2;
  }
}

test('invalid AttachEnergyPrompt reports bounded post-choice card identity diagnostics', () => {
  const energy = {fullName: 'Darkness Energy fixture'};
  const foreign = {fullName: 'Foreign Energy fixture'};
  const prompt = new AttachEnergyPrompt([energy]);
  const state = {prompts: [prompt]};
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(19, [{card: energy}])));
  assert.throws(() => assertValidPromptAction(
    state, new ResolvePromptAction(19, [{card: energy}, {card: energy}])), error => {
    assert.match(error.message, /post-choice-invalid-attach-energy-selection-v1/);
    assert.match(error.message, /"duplicate":true/);
    assert.match(error.message, /"eligible":true/);
    assert.match(error.message, /"promptId":19/);
    return true;
  });
  assert.throws(() => assertValidPromptAction(
    state, new ResolvePromptAction(19, [{card: foreign}])), error => {
    assert.match(error.message, /"inSource":false/);
    assert.match(error.message, /"eligible":false/);
    return true;
  });
});
