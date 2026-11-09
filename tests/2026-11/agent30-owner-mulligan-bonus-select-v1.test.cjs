'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,
  observeMulliganBonusSelect,
  withOwnerMulliganBonusSelectV1
} = require('../../simulation/twinleaf/agent30/owner-mulligan-bonus-select-v1.cjs');

const GameMessage = {WANT_TO_DRAW_CARDS: 'WANT_TO_DRAW_CARDS'};
const GamePhase = {SETUP: 1, PLAYER_TURN: 3};
const classes = {GameMessage, GamePhase};
class SelectPrompt {
  constructor(playerId, values, id) {
    this.id = id;
    this.playerId = playerId;
    this.message = GameMessage.WANT_TO_DRAW_CARDS;
    this.values = values;
    this.result = undefined;
    this.options = {allowCancel: false, defaultValue: 0};
  }
  validate() { return true; }
}
class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}
class AddPlayerAction {}
class Store {
  constructor(state) {
    this.state = state;
  }
  dispatch(action) {
    if (action instanceof AddPlayerAction) return this.state;
    const prompt = this.state.prompts.find(item =>
      item.id === action.id && item.result === undefined);
    assert.ok(prompt);
    prompt.result = action.result;
    return this.state;
  }
}
class SimpleTacticsAi {
  constructor(id) { this.client = {id}; }
  decodeNextAction() {
    throw new Error('unsupported prompt must reach the quarantined decoder');
  }
}

/** @param {object} state @param {0|1} seat */
function detachedInput(state, seat) {
  const prompt = state.prompts[0];
  return Object.freeze({
    actor: {decisionKind: 'owner-prompt', actorSeat: seat, globalTurn: 0},
    prompt: {
      kind: 'SelectPrompt',
      id: prompt.id,
      message: prompt.message,
      values: [...prompt.values],
      allowCancel: false,
      defaultValue: 0
    }
  });
}

function fixture(seat) {
  const ids = [101, 202];
  const prompt = new SelectPrompt(ids[seat],
    ['Draw 3 card(s)', 'Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)'],
    87 + seat);
  return {
    prompt,
    state: {
      players: ids.map(id => ({id, hand: {
        get cards() { throw Error('concealed owner hand inspected'); }
      }})),
      prompts: [prompt],
      turn: 0,
      phase: GamePhase.SETUP
    }
  };
}

test('only the exact public native setup draw shape is admitted', () => {
  for (const seat of [0, 1]) {
    const {state, prompt} = fixture(seat);
    const audit = [];
    const project = (given, givenSeat) => {
      assert.strictEqual(given, state);
      assert.equal(givenSeat, seat);
      audit.push(seat);
      return detachedInput(given, givenSeat);
    };
    assert.ok(observeMulliganBonusSelect(state, seat, classes, project));
    assert.strictEqual(observeMulliganBonusSelect(state, 1 - seat, classes, project), null);
    prompt.message = 'CHOOSE_OPTION';
    assert.strictEqual(observeMulliganBonusSelect(state, seat, classes, project), null);
    prompt.message = GameMessage.WANT_TO_DRAW_CARDS;
    state.phase = GamePhase.PLAYER_TURN;
    assert.strictEqual(observeMulliganBonusSelect(state, seat, classes, project), null);
    state.phase = GamePhase.SETUP;
    prompt.values = ['Keep', 'Discard'];
    assert.strictEqual(observeMulliganBonusSelect(state, seat, classes, project), null);
    prompt.values = ['Draw 4 card(s)', 'Draw 2 card(s)', 'Draw 0 card(s)'];
    assert.strictEqual(observeMulliganBonusSelect(state, seat, classes, project), null);
    prompt.values = ['Draw 1 card(s)', 'Draw 0 card(s)'];
    prompt.options.allowCancel = true;
    assert.strictEqual(observeMulliganBonusSelect(state, seat, classes, project), null);
    assert.deepEqual(audit, [seat]);
  }
});

test('typed full-bonus selection settles exactly one real Store prompt in both seats', () => {
  for (const seat of [0, 1]) {
    const {state, prompt} = fixture(seat);
    const originalDecoder = SimpleTacticsAi.prototype.decodeNextAction;
    const originalDispatch = Store.prototype.dispatch;
    const wrapped = withOwnerMulliganBonusSelectV1(() => {
      const store = new Store(state);
      store.dispatch(new AddPlayerAction());
      const bot = new SimpleTacticsAi(state.players[seat].id);
      const action = bot.decodeNextAction(state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.id, prompt.id);
      assert.equal(action.result, 0);
      store.dispatch(action);
      assert.equal(prompt.result, 0);
      return 'paid-public-setup-choice';
    }, {
      classes,
      actorInput: detachedInput,
      Store,
      SimpleTacticsAi,
      ResolvePromptAction
    });
    assert.equal(wrapped.result, 'paid-public-setup-choice');
    assert.equal(wrapped.audit.version, VERSION);
    assert.equal(wrapped.audit.selected, 1);
    assert.equal(wrapped.audit.accepted, 1);
    assert.equal(wrapped.audit.nativePromptPostconditionsConfirmed, 1);
    assert.equal(wrapped.audit.bySeat[seat], 1);
    assert.equal(wrapped.audit.genericSelectPromptsAdmitted, false);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, originalDecoder);
    assert.strictEqual(Store.prototype.dispatch, originalDispatch);
  }
});
