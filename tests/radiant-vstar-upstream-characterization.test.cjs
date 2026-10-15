'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const {Player} = require(path.join(output, 'game/store/state/player'));
const {State} = require(path.join(output, 'game/store/state/state'));
const {PlayPokemonEffect} =
  require(path.join(output, 'game/store/effects/play-card-effects'));
const {PowerEffect} =
  require(path.join(output, 'game/store/effects/game-effects'));
const {EndTurnEffect} =
  require(path.join(output, 'game/store/effects/game-phase-effects'));

/**
 * Thin effect probe against actual compiled pinned Twinleaf card classes.
 * Synchronous prompt callbacks follow the same contract as StoreLike.prompt;
 * this is a reducer/prompt test, not an end-to-end game.
 * @param {number} selectedCount
 */
function gateFixture(selectedCount) {
  const manager = initializeCards();
  const radiant = manager.getCardByName('Radiant Eternatus CRZ');
  const vmax = manager.getCardByName('Shadow Rider Calyrex VMAX CRE');
  assert.ok(radiant && vmax, 'Expected actual CRZ Radiant and CRE VMAX');
  const player = new Player();
  player.name = 'researcher';
  player.id = 31;
  const state = new State();
  state.turn = 3;
  state.players = [player];
  player.bench[0].cards.push(radiant);
  player.deck.cards.push(vmax);
  const records = {prompts: [], ends: 0, plays: 0, zeroValid: null};
  const store = {
    /** @param {object} current @param {object} effect */
    reduceEffect(current, effect) {
      if (effect instanceof EndTurnEffect) records.ends++;
      if (effect.constructor.name === 'PlayPokemonFromDeckEffect') records.plays++;
      return current;
    },
    /** @param {object} current @param {object} prompt @param {Function} callback */
    prompt(current, prompt, callback) {
      records.prompts.push(prompt.constructor.name);
      if (prompt.constructor.name === 'ConfirmPrompt') return callback(true);
      if (prompt.constructor.name === 'ChooseCardsPrompt') {
        records.zeroValid = prompt.validate([]);
        return callback(selectedCount ? [vmax] : []);
      }
      if (prompt.constructor.name === 'ShuffleDeckPrompt') return callback([]);
      throw new Error('Unexpected prompt type: ' + prompt.constructor.name);
    },
    log() {}
  };
  radiant.reduceEffect(store, state,
    new PlayPokemonEffect(player, radiant, player.bench[0]));
  return records;
}

test('pinned Climactic Gate confirms ability yet admits zero VMAX and skips ending turn', () => {
  const record = gateFixture(0);
  assert.equal(record.zeroValid, true, 'Prompt explicitly accepts empty search');
  assert.equal(record.ends, 0, 'Characterize source bug: confirmed Gate does not end turn');
  assert.equal(record.plays, 0);
  assert.deepEqual(record.prompts, ['ConfirmPrompt', 'ChooseCardsPrompt']);
  console.log('REPRODUCED: confirmed Climactic Gate with zero VMAX skips EndTurnEffect.');
});

test('same Climactic Gate card correctly ends turn with one VMAX', () => {
  const record = gateFixture(1);
  assert.equal(record.ends, 1);
  assert.equal(record.plays, 1);
  assert.deepEqual(record.prompts, ['ConfirmPrompt', 'ChooseCardsPrompt', 'ShuffleDeckPrompt']);
});

/** @returns {object} Prompt with unrestricted empty selection during Star Alchemy. */
function vstarPromptFixture() {
  const cards = initializeCards();
  const stone = cards.getCardByName('Forest Seal Stone SIT');
  const filler = cards.getCardByName('Shadow Rider Calyrex VMAX CRE');
  assert.ok(stone && filler, 'Expected Stone and VMAX card identities');
  const player = new Player();
  player.name = 'researcher';
  player.id = 51;
  const state = new State();
  state.players = [player];
  player.deck.cards.push(filler);
  let captured = null;
  const store = {
    prompt(current, prompt) {
      captured = prompt;
      return current;
    },
    reduceEffect(current) { return current; }
  };
  stone.reduceEffect(store, state, new PowerEffect(player, stone.powers[0], stone));
  assert.equal(player.usedVSTAR, true);
  assert.ok(captured, 'Star Alchemy emitted ChooseCardsPrompt');
  return captured;
}

test('pinned unrestricted Star Alchemy search accepts zero despite nonempty deck', () => {
  const prompt = vstarPromptFixture();
  assert.equal(prompt.constructor.name, 'ChooseCardsPrompt');
  assert.equal(prompt.options.min, 0);
  assert.equal(prompt.options.max, 1);
  assert.equal(prompt.cards.cards.length, 1);
  assert.equal(prompt.validate([]), true,
    'Characterize source bug: unrestricted any-card search permits no selection');
  console.log('REPRODUCED: Star Alchemy choose-a-card prompt validates zero in a nonempty deck.');
});
