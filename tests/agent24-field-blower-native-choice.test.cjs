'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { withMandatoryOptionFallback } = require('../simulation/twinleaf/mandatory-option-policy.cjs');
const { assertValidPromptAction } = require('../simulation/twinleaf/prompt-integrity.cjs');

const base = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
function engine(name) { return require(path.join(base, name)); }

const { State, GamePhase } = engine('game/store/state/state');
const { Player } = engine('game/store/state/player');
const { Store } = engine('game/store/store');
const { CardList } = engine('game/store/state/card-list');
const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
const { SelectOptionPrompt } = engine('game/store/prompts/select-option-prompt');
const { ChoosePokemonPrompt } = engine('game/store/prompts/choose-pokemon-prompt');
const { PlayCardAction, PlayerType, SlotType } =
  engine('game/store/actions/play-card-action');
const { ResolvePromptAction } =
  engine('game/store/actions/resolve-prompt-action');
const definitions = engine('simple-bot/simple-bot-definitions');

/** @param {boolean} corrected */
function botOptions(corrected) {
  const options = {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: definitions.defaultArbiterOptions
  };
  return corrected ? withMandatoryOptionFallback(options) : options;
}

/** Construct genuine native Field Blower modal with both a Stadium and a Tool. */
function board() {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Card printing must be loaded: ' + name);
    return result;
  };
  const fieldBlower = card('Field Blower GRI');
  const stadium = card('Sky Field ROS');
  const hood = card('Stealthy Hood UNB');
  const state = new State();
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 0;
  const player = new Player();
  player.id = 101;
  player.name = 'Agent 24 fixture player';
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Native opponent';
  state.players = [player, opponent];
  player.active.cards.push(card('Regidrago V SIT'));
  opponent.active.cards.push(card('Dratini OBF'));
  opponent.active.tools.push(hood);
  player.stadium.cards.push(stadium);
  player.hand.cards.push(fieldBlower);
  player.deck.cards.push(card('Psychic Energy MEE'));
  opponent.deck.cards.push(card('Dratini OBF'));
  for (const p of [player, opponent]) {
    p.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
  }
  const store = new Store({ onStateChange() {} });
  store.state = state;
  store.dispatch(new PlayCardAction(player.id, 0, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const prompt = state.prompts.find(p => p.result === undefined);
  assert.ok(prompt instanceof SelectOptionPrompt,
    'Both Stadium and Tool must produce the genuine native required mode prompt');
  assert.equal(prompt.options.allowCancel, false);
  assert.equal(prompt.values.length, 2);
  return { state, store, player, opponent, prompt, stadium, hood };
}

test('native Field Blower default null remains actionable but illegally ignores Stadium', () => {
  const original = board();
  const bot = new SimpleTacticsAi({id: original.player.id}, botOptions(false), null);
  const action = bot.decodeNextAction(original.state);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, original.prompt.id);
  assert.equal(action.result, null);
  assert.throws(() => assertValidPromptAction(original.state, action,
    { enforceSelectOptionLegality: true }), /invalid result to SelectOptionPrompt/);
  original.store.dispatch(action);
  assert.equal(original.player.stadium.cards.includes(original.stadium), true,
    'Pinned null enters the tool-only branch instead of selecting an offered mode');
  assert.ok(original.state.prompts.some(p =>
    p.result === undefined && p instanceof ChoosePokemonPrompt),
  'The native effect proceeds to a Tool target prompt');
});

test('native Field Blower legal default removes the same real Stadium', () => {
  const corrected = board();
  const bot = new SimpleTacticsAi({id: corrected.player.id},
    botOptions(true), null);
  const action = bot.decodeNextAction(corrected.state);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, corrected.prompt.id);
  assert.equal(action.result, 0);
  assert.doesNotThrow(() => assertValidPromptAction(corrected.state, action,
    { enforceSelectOptionLegality: true }));
  corrected.store.dispatch(action);
  assert.equal(corrected.player.stadium.cards.includes(corrected.stadium), false);
  assert.equal(corrected.player.discard.cards.includes(corrected.stadium), true,
    'Native Store must physically discard the Stadium through mode 0');
  assert.ok(corrected.state.prompts.some(p =>
    p.result === undefined && p instanceof ChoosePokemonPrompt),
  'The same option then offers legal Tool targets');
  assert.equal(corrected.opponent.active.tools.includes(corrected.hood), true,
    'Tool remains until the independent required target selection is answered');
});
