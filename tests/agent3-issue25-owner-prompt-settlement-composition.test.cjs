'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withActorOnlyChoosePokemon} =
  require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');
const {withOwnerModalAcknowledgements} =
  require('../simulation/twinleaf/agent4-owner-modal-acknowledgements.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}
class ConfirmPrompt {
  constructor(owner) {
    this.id = 77;
    this.playerId = owner;
    this.message = 'optional';
    this.result = undefined;
  }
  validate(value) { return typeof value === 'boolean'; }
}
class ChoosePokemonPrompt {
  constructor(owner) {
    this.id = 78;
    this.playerId = owner;
    this.message = 'promote';
    this.result = undefined;
    this.slots = [2];
    this.playerType = 2;
    this.options = {min: 1, max: 1};
  }
  getPerspectivePlayerId() { return this.playerId; }
  validate(value) {
    return Array.isArray(value) && value.length === 1 &&
      value[0]?.cards?.length > 0;
  }
}
class SimpleTacticsAi {
  constructor(id) { this.client = {id}; }
  decodeNextAction() { throw new Error('Unqualified native bot fallback'); }
}
class BaseStore {
  constructor(state) { this.state = state; }
  dispatch(action) {
    if (action instanceof AddPlayerAction) return this.state;
    const pending = this.state.prompts.find(p =>
      p.id === action.id && p.result === undefined);
    assert.ok(pending?.validate(action.result));
    pending.result = action.result;
    return this.state;
  }
}
class TrialStore extends BaseStore {
  dispatch(action) {
    const prompt = this.state.prompts[0];
    if (action instanceof ResolvePromptAction &&
      (this.silentKind === prompt?.constructor.name)) return this.state;
    return super.dispatch(action);
  }
}

/**
 * Execute the exact v14-style nested native dispatch wrappers for one owner.
 * Modal is installed later (inside) and delegates nonmodal prompts to the
 * outer Pokémon selector. No private card identities reach either chooser.
 * @param {0|1} seat
 * @param {'none'|'ConfirmPrompt'|'ChoosePokemonPrompt'} silentKind
 * @returns {object}
 */
function execute(seat, silentKind) {
  const players = [0, 1].map(id => ({
    id, active: {cards: [{fullName: 'Active ' + id}]},
    bench: [{cards: [{fullName: 'Bench ' + id}]}]
  }));
  const state = {phase: 2, turn: 5, players, prompts: []};
  const bot = new SimpleTacticsAi(seat);
  const modalDeps = {
    Store: TrialStore, SimpleTacticsAi, ResolvePromptAction,
    observe: (s, actorSeat) => Object.freeze({
      decisionKind: 'owner-prompt', phase: s.phase,
      globalTurn: s.turn, actorSeat
    }),
    validate: (s, a) => assert.equal(
      s.prompts[0].validate(a.result), true)
  };
  const pokemonDeps = {
    Store: TrialStore, SimpleTacticsAi, ResolvePromptAction,
    observe: (s, actorSeat) => {
      const p = s.prompts[0];
      if (p?.constructor.name !== 'ChoosePokemonPrompt') return null;
      return {
        actor: {decisionKind: 'owner-prompt', globalTurn: s.turn},
        prompt: {
          kind: 'ChoosePokemonPrompt', id: p.id,
          perspectiveIsAnsweringOwner: true,
          offered: [{printing: 'Bench ' + actorSeat}]
        }
      };
    },
    validate: (s, a) => assert.equal(
      s.prompts[0].validate(a.result), true)
  };
  const wrapped = withActorOnlyChoosePokemon(() =>
    withOwnerModalAcknowledgements(() => {
      const store = new TrialStore(state);
      store.silentKind = silentKind;
      store.dispatch(new AddPlayerAction());
      const modal = new ConfirmPrompt(seat);
      state.prompts = [modal];
      const modalAction = bot.decodeNextAction(state);
      assert.ok(modalAction instanceof ResolvePromptAction);
      assert.equal(modalAction.result, false);
      let modalError = null;
      try { store.dispatch(modalAction); }
      catch (error) { modalError = error.message; }
      if (silentKind === 'ConfirmPrompt') return {modalError};
      assert.equal(modalError, null);

      const pokemon = new ChoosePokemonPrompt(seat);
      state.prompts = [pokemon];
      const pokemonAction = bot.decodeNextAction(state);
      assert.ok(pokemonAction instanceof ResolvePromptAction);
      assert.strictEqual(pokemonAction.result[0], players[seat].bench[0]);
      let pokemonError = null;
      try { store.dispatch(pokemonAction); }
      catch (error) { pokemonError = error.message; }
      return {modalError, pokemonError};
    }, modalDeps), pokemonDeps);

  return {
    events: wrapped.result.result,
    modal: wrapped.result.audit,
    pokemon: wrapped.audit
  };
}

for (const seat of [0, 1]) {
  test('nested owner Confirm then ChoosePokemon genuinely settle seat ' + seat,
    () => {
      const result = execute(seat, 'none');
      assert.deepEqual(result.events, {
        modalError: null, pokemonError: null
      });
      assert.equal(result.modal.accepted, 1);
      assert.equal(result.modal.settled, 1);
      assert.equal(result.pokemon.accepted, 1);
      assert.equal(result.pokemon.postconditionsConfirmed, 1);
      assert.equal(result.modal.bySeat[seat], 1);
      assert.equal(result.pokemon.bySeat[seat], 1);
    });

  test('nested silent modal no-op fails closed seat ' + seat, () => {
    const result = execute(seat, 'ConfirmPrompt');
    assert.match(result.events.modalError,
      /without resolving its prompt/);
    assert.equal(result.modal.accepted, 0);
    assert.equal(result.modal.unsettled, 1);
    assert.equal(result.pokemon.accepted, 0);
  });

  test('nested silent Pokémon no-op fails closed seat ' + seat, () => {
    const result = execute(seat, 'ChoosePokemonPrompt');
    assert.equal(result.events.modalError, null);
    assert.match(result.events.pokemonError,
      /without resolving the prompt/);
    assert.equal(result.modal.accepted, 1);
    assert.equal(result.modal.settled, 1);
    assert.equal(result.pokemon.accepted, 0);
    assert.equal(result.pokemon.postconditionsMissing, 1);
  });
}
