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
const { SelectOptionPrompt } = engine('game/store/prompts/select-option-prompt');
const { ChooseCardsPrompt } = engine('game/store/prompts/choose-cards-prompt');
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

/** A valid discard Supporter is publicly recoverable under the printed card. */
function board() {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Missing actual printing: ' + name);
    return c;
  };
  const cynthiaCaitlin = card('Cynthia & Caitlin CEC');
  const recoverable = card('Guzma & Hala CEC');
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
  player.hand.cards.push(cynthiaCaitlin, card('Fire Energy MEE'));
  player.discard.cards.push(recoverable);
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
  const prompt = state.prompts.find(p =>
    p.result === undefined && p instanceof SelectOptionPrompt);
  assert.ok(prompt, 'Genuine native C&C mode prompt must be present');
  assert.equal(prompt.options.allowCancel, true,
    'Pinned card incorrectly allows skipping both available recovery modes');
  assert.equal(prompt.values.length, 2);
  return {state, store, player, prompt, recoverable};
}

test('native C&C bot silently cancels recovery even with eligible Supporter visible', () => {
  const fixture = board();
  const bot = new SimpleTacticsAi({id: fixture.player.id}, options(false), null);
  const action = bot.decodeNextAction(fixture.state);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, fixture.prompt.id);
  assert.equal(action.result, null);
  assert.doesNotThrow(() => assertValidPromptAction(fixture.state, action,
    {enforceSelectOptionLegality: true}),
  'Current generic gate trusts the pinned allowCancel true, unlike mandatory printed recovery');
  fixture.store.dispatch(action);
  assert.equal(fixture.player.discard.cards.includes(fixture.recoverable), true);
  assert.equal(fixture.player.hand.cards.includes(fixture.recoverable), false,
    'Primary printed recovery effect is skipped');
});

test('native legal C&C recovery mode physically returns original Supporter', () => {
  const fixture = board();
  const action = new ResolvePromptAction(fixture.prompt.id, 0);
  assert.doesNotThrow(() => assertValidPromptAction(fixture.state, action,
    {enforceSelectOptionLegality: true}));
  fixture.store.dispatch(action);
  const searchPrompt = fixture.state.prompts.find(p =>
    p.result === undefined && p instanceof ChooseCardsPrompt);
  assert.ok(searchPrompt, 'Mode 0 requires actual public discard Supporter choice');
  assertValidPromptAction(fixture.state,
    new ResolvePromptAction(searchPrompt.id, [fixture.recoverable]));
  fixture.store.dispatch(new ResolvePromptAction(
    searchPrompt.id, [fixture.recoverable]));
  assert.equal(fixture.player.hand.cards.includes(fixture.recoverable), true);
  assert.equal(fixture.player.discard.cards.includes(fixture.recoverable), false);
});
