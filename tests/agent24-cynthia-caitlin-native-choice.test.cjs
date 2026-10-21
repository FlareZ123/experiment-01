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


test('printed C&C source-tagged native prompt gets legal recovery through opt-in resolver', () => {
  const {isPrintedCynthiaCaitlinRecovery,withPrintedCynthiaCaitlinRecovery} =
    require('../simulation/twinleaf/cynthia-caitlin-required-recovery.cjs');
  const original = board();
  assert.equal(original.prompt.sourceCard?.fullName, 'Cynthia & Caitlin CEC');
  assert.equal(isPrintedCynthiaCaitlinRecovery(original.prompt), true);
  const bot = new SimpleTacticsAi({id: original.player.id},
    withPrintedCynthiaCaitlinRecovery(options(false)), null);
  const chosen = bot.decodeNextAction(original.state);
  assert.ok(chosen instanceof ResolvePromptAction);
  assert.equal(chosen.id, original.prompt.id);
  assert.equal(chosen.result, 0);
  assert.doesNotThrow(() => assertValidPromptAction(original.state, chosen,
    {enforcePrintedCynthiaRecovery: true}));
  original.store.dispatch(chosen);
  const next = original.state.prompts.find(p =>
    p.result === undefined && p instanceof ChooseCardsPrompt);
  assert.ok(next, 'Printed recovery must offer a genuine discard choice');
  original.store.dispatch(new ResolvePromptAction(next.id, [original.recoverable]));
  assert.equal(original.player.hand.cards.includes(original.recoverable), true);
  assert.equal(original.player.discard.cards.includes(original.recoverable), false);
});

test('exact-source printed guard vetoes metadata-cancelled C&C while leaving other modal untouched', () => {
  const {isPrintedCynthiaCaitlinRecovery,withPrintedCynthiaCaitlinRecovery} =
    require('../simulation/twinleaf/cynthia-caitlin-required-recovery.cjs');
  const original = board();
  const action = new ResolvePromptAction(original.prompt.id, null);
  assert.doesNotThrow(() => assertValidPromptAction(original.state, action,
    {enforceSelectOptionLegality: true}),
  'Generic gate honors upstream allowCancel true');
  assert.throws(() => assertValidPromptAction(original.state, action,
    {enforceSelectOptionLegality: true,enforcePrintedCynthiaRecovery: true}),
  /invalid result to SelectOptionPrompt/);
  assert.equal(isPrintedCynthiaCaitlinRecovery({
    ...original.prompt,
    sourceCard: {fullName: 'Guzma & Hala CEC'}
  }), false);
  const compound = withPrintedCynthiaCaitlinRecovery(options(true));
  assert.throws(() => withPrintedCynthiaCaitlinRecovery(compound),
    /already installed/);
});

test('full headless records opt-in correction and fails closed without strict gate', () => {
  const {runMatch,upstreamSmokeDeck} =
    require('../simulation/twinleaf/headless.cjs');
  const deck = upstreamSmokeDeck();
  const request = {
    deckA: deck,deckB: deck,seed: 20261021,maxActions: 20,
    strictPromptValidation: true,isolatePolicyRandomness: true,
    printedCynthiaCaitlinRecovery: true,enforcePrintedCynthiaRecovery: true,
    enforceSelectOptionLegality: true,mandatoryOptionFallback: true
  };
  const game=runMatch(request);
  assert.equal(game.printedCynthiaCaitlinRecovery,true);
  assert.equal(game.enforcePrintedCynthiaRecovery,true);
  assert.match(game.policy,/CynthiaCaitlinPrintedMandatoryRecovery-v1/);
  assert.match(game.policy,/CynthiaCaitlinPrintedRecoveryGate-v1/);
  assert.ok(game.actions<=request.maxActions);
  assert.throws(()=>runMatch({...request,strictPromptValidation:false,
    enforceSelectOptionLegality:false}),
    /Printed C&C recovery gate requires strictPromptValidation:true/);
});
