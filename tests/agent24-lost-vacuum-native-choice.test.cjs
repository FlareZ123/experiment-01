'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { withMandatoryOptionFallback } =
  require('../simulation/twinleaf/mandatory-option-policy.cjs');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');
const base = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
function engine(name) { return require(path.join(base, name)); }

const { State, GamePhase } = engine('game/store/state/state');
const { Player } = engine('game/store/state/player');
const { Store } = engine('game/store/store');
const { CardList } = engine('game/store/state/card-list');
const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
const { ChooseCardsPrompt } = engine('game/store/prompts/choose-cards-prompt');
const { SelectOptionPrompt } = engine('game/store/prompts/select-option-prompt');
const { ChoosePokemonPrompt } = engine('game/store/prompts/choose-pokemon-prompt');
const { PlayCardAction, PlayerType, SlotType } =
  engine('game/store/actions/play-card-action');
const { ResolvePromptAction } =
  engine('game/store/actions/resolve-prompt-action');
const definitions = engine('simple-bot/simple-bot-definitions');

/** @param {boolean} corrected */
function options(corrected) {
  const original = {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: definitions.defaultArbiterOptions
  };
  return corrected ? withMandatoryOptionFallback(original) : original;
}

/** Real source printing with a mandatory hand-to-Lost-Zone cost. */
function board() {
  const manager = initializeCards();
  /** @param {string} printing */
  const card = printing => {
    const c = manager.getCardByName(printing);
    assert.ok(c, 'Missing pinned printing: ' + printing);
    return c;
  };
  const vacuum = card('Lost Vacuum LOR');
  const cost = card('Fire Energy MEE');
  const stadium = card('Sky Field ROS');
  const hood = card('Stealthy Hood UNB');
  const state = new State();
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 0;
  const player = new Player();
  player.id = 101;
  player.name = 'Actor';
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Opponent';
  state.players = [player, opponent];
  player.active.cards.push(card('Regidrago V SIT'));
  opponent.active.cards.push(card('Dratini OBF'));
  opponent.active.tools.push(hood);
  player.stadium.cards.push(stadium);
  player.hand.cards.push(vacuum, cost);
  player.deck.cards.push(card('Psychic Energy MEE'));
  opponent.deck.cards.push(card('Dratini OBF'));
  for (const p of [player, opponent]) {
    p.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
  }
  const store = new Store({ onStateChange() {} });
  store.state = state;
  store.dispatch(new PlayCardAction(player.id, 0,
    {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0}));
  const costPrompt = state.prompts.find(p =>
    p.result === undefined && p instanceof ChooseCardsPrompt);
  assert.ok(costPrompt, 'Lost Vacuum must first pay a physical hand-card cost');
  assertValidPromptAction(state, new ResolvePromptAction(costPrompt.id, [cost]));
  store.dispatch(new ResolvePromptAction(costPrompt.id, [cost]));
  assert.ok(player.lostzone.cards.includes(cost),
    'Printed Lost Vacuum cost must physically reach owner Lost Zone');
  const modal = state.prompts.find(p =>
    p.result === undefined && p instanceof SelectOptionPrompt);
  assert.ok(modal, 'Both Stadium and Tool must offer required native option');
  assert.equal(modal.options.allowCancel, false);
  assert.equal(modal.values.length, 2);
  return {state, store, player, opponent, modal, vacuum, cost, stadium, hood};
}

test('Lost Vacuum mandatory choice is rejected before native undefined-option path', () => {
  const fixture = board();
  const bot = new SimpleTacticsAi({id: fixture.player.id}, options(false), null);
  const action = bot.decodeNextAction(fixture.state);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, fixture.modal.id);
  assert.equal(action.result, null);
  assert.throws(() => assertValidPromptAction(fixture.state, action,
    {enforceSelectOptionLegality: true}), /invalid result to SelectOptionPrompt/);
  assert.throws(() => fixture.store.dispatch(action), /action|undefined/,
    'The pinned native reducer dereferences an absent modal option');
});

test('corrected default native Lost Vacuum chooses physical Tool removal', () => {
  const fixture = board();
  const bot = new SimpleTacticsAi({id: fixture.player.id}, options(true), null);
  const action = bot.decodeNextAction(fixture.state);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, fixture.modal.id);
  assert.equal(action.result, 0);
  assert.doesNotThrow(() => assertValidPromptAction(fixture.state, action,
    {enforceSelectOptionLegality: true}));
  fixture.store.dispatch(action);
  const pokemonChoice = fixture.state.prompts.find(p =>
    p.result === undefined && p instanceof ChoosePokemonPrompt);
  assert.ok(pokemonChoice, 'Tool mode must lead to native physical recipient prompt');
  fixture.store.dispatch(new ResolvePromptAction(
    pokemonChoice.id, [fixture.opponent.active]));
  assert.equal(fixture.opponent.active.tools.includes(fixture.hood), false);
  assert.equal(fixture.opponent.lostzone.cards.includes(fixture.hood), true,
    'Native mode removes the original physical opponent Tool to its Lost Zone');
});
