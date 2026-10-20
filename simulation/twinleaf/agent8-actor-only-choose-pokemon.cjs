'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {assertValidPromptAction} = require('./prompt-integrity.cjs');

const VERSION = 'agent8-actor-only-choose-pokemon-v1';
const ANY = 0, TOP = 1, BOTTOM = 2;
const ACTIVE = 1, BENCH = 2;

/**
 * Enumerate only physically eligible Pokémon lists for a pending native
 * single-choice prompt. TOP/BOTTOM are relative to getPerspectivePlayerId(),
 * which need not equal the responding playerId. The native validator checks
 * blocked slots and prompt-specific restrictions.
 * @param {object} state Genuine live native State.
 * @param {object} pending Native ChoosePokemonPrompt.
 * @returns {Array<{physical:object,seat:number,zone:string,index:number}>}
 */
function nativeSinglePokemonChoices(state, pending) {
  const perspectiveId = pending.getPerspectivePlayerId();
  const perspective = state.players.findIndex(p => p.id === perspectiveId);
  assert.ok(perspective === 0 || perspective === 1);
  const choices = [];
  for (let seat = 0; seat < 2; seat++) {
    const side = seat === perspective ? BOTTOM : TOP;
    if (pending.playerType !== ANY && pending.playerType !== side) continue;
    const player = state.players[seat];
    const add = (physical, zone, index) => {
      if (!physical?.cards?.length) return;
      if (pending.validate([physical], state) !== true) return;
      choices.push({physical, seat, zone, index});
    };
    if (pending.slots.includes(ACTIVE)) add(player.active, 'active', 0);
    if (pending.slots.includes(BENCH)) {
      player.bench.forEach((slot, index) => add(slot, 'bench', index));
    }
  }
  return choices;
}

/**
 * Supply pure decision code with the actor's detached observation and visible
 * eligible Pokémon. Never expose native PokémonCardList or Store references.
 * @param {object} state Authenticated genuine State.
 * @param {0|1} seat Answering physical seat.
 * @param {Function} [observe] Actor-only observation factory.
 * @returns {object|null}
 */
function actorChoosePokemonInput(state, seat, observe = actorObservation) {
  assert.ok(seat === 0 || seat === 1);
  const pending = state.prompts?.find(p => p.result === undefined);
  if (pending?.constructor?.name !== 'ChoosePokemonPrompt' ||
      pending.playerId !== state.players?.[seat]?.id ||
      pending.options?.min !== 1 || pending.options?.max !== 1 ||
      !Array.isArray(pending.slots) ||
      typeof pending.getPerspectivePlayerId !== 'function') return null;

  const actor = observe(state, seat);
  assert.equal(actor.decisionKind, 'owner-prompt');
  const native = nativeSinglePokemonChoices(state, pending);
  const offered = native.map(({seat: targetSeat, zone, index}, id) => {
    const board = targetSeat === seat ? actor.ownPublic : actor.opponentPublic;
    const pokemon = zone === 'active' ? board.active : board.bench[index];
    assert.ok(pokemon?.printing);
    return Object.freeze({
      index: id,
      side: targetSeat === seat ? 'own' : 'opponent',
      zone, benchIndex: zone === 'bench' ? index : null,
      printing: pokemon.printing,
      remainingHp: pokemon.hp - pokemon.damage,
      attachedEnergyCount: pokemon.energies.length,
      attackNames: Object.freeze(pokemon.attacks.map(attack => attack.name))
    });
  });
  return Object.freeze({
    actor,
    prompt: Object.freeze({
      kind: 'ChoosePokemonPrompt',
      id: pending.id,
      message: pending.message ?? null,
      perspectiveIsAnsweringOwner:
        pending.getPerspectivePlayerId() === state.players[seat].id,
      offered: Object.freeze(offered),
      allowCancel: pending.validate(null, state) === true
    })
  });
}

/**
 * Neutral deterministic legal baseline. This adapter establishes ownership,
 * native acceptance and audit coverage; it does not establish strategic
 * choice competence for gust, promotion, Bench, or attack sequencing.
 * @param {object} input Detached actor-only prompt input.
 * @returns {{index:number|null}|null}
 */
function chooseActorPokemon(input) {
  assert.equal(input.actor?.decisionKind, 'owner-prompt');
  assert.equal(input.prompt.kind, 'ChoosePokemonPrompt');
  if (input.prompt.offered.length) return {index: 0};
  if (input.prompt.allowCancel) return {index: null};
  return null;
}

/**
 * Genuine native Store-only, both-seat reversible ChoosePokemonPrompt adapter.
 * Limits supported prompts to one mandatory/optional Pokémon, delegating all
 * other cases to the explicitly unqualified original decision policy.
 * @template T
 * @param {()=>T} execute Existing canonical synchronous experiment.
 * @param {object} [deps] Injectable native classes and fixtures.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyChoosePokemon(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const base = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi = deps.SimpleTacticsAi ??
    require(path.join(base, 'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store = deps.Store ??
    require(path.join(base, 'game/store/store')).Store;
  const ResolvePromptAction = deps.ResolvePromptAction ??
    require(path.join(base, 'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe = deps.observe ?? actorChoosePokemonInput;
  const choose = deps.choose ?? chooseActorPokemon;
  const validate = deps.validate ?? assertValidPromptAction;
  const original = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  const originalDispatch = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof original?.value, 'function');
  assert.equal(typeof originalDispatch?.value, 'function');

  let liveStore = null;
  const selected = new WeakMap();
  const audit = {
    version: VERSION,
    decisionOrigin: 'actorObservation-and-owner-visible-legal-Pokemon-menu',
    nativeStores: 0, selected: 0, accepted: 0, rejected: 0,
    postconditionsConfirmed: 0, postconditionsMissing: 0,
    unsupportedNativeFallbacks: 0, nonLiveFallbacks: 0,
    bySeat: {0: 0, 1: 0}, boundedSelections: [],
    competitiveGameQualified: false
  };

  function decode(state) {
    if (state !== liveStore?.state) {
      audit.nonLiveFallbacks++;
      return original.value.call(this, state);
    }
    const seat = state.players?.findIndex(p => p.id === this.client?.id) ?? -1;
    const input = seat >= 0 ? observe(state, seat) : null;
    if (!input) {
      const pending = state.prompts?.find(p => p.result === undefined);
      if (pending?.playerId === this.client?.id &&
          pending.constructor?.name === 'ChoosePokemonPrompt') {
        audit.unsupportedNativeFallbacks++;
      }
      return original.value.call(this, state);
    }
    const intent = choose(input);
    if (!intent) {
      audit.unsupportedNativeFallbacks++;
      return original.value.call(this, state);
    }
    const pending = state.prompts.find(p =>
      p.id === input.prompt.id && p.result === undefined);
    assert.ok(pending, 'ChoosePokemon prompt changed before native dispatch');
    const native = nativeSinglePokemonChoices(state, pending);
    const result = intent.index === null ? null :
      [native[intent.index]?.physical];
    assert.ok(intent.index === null ||
      (Number.isInteger(intent.index) &&
       intent.index >= 0 &&
       intent.index < input.prompt.offered.length &&
       result[0] !== undefined), 'Invalid detached Pokémon index');
    const action = new ResolvePromptAction(input.prompt.id, result);
    validate(state, action);
    const record = {
      seat, turn: input.actor.globalTurn, promptId: input.prompt.id,
      choiceIndex: intent.index, offered: input.prompt.offered.length,
      selectedPrinting: intent.index === null ? null :
        input.prompt.offered[intent.index].printing,
      perspectiveIsAnsweringOwner: input.prompt.perspectiveIsAnsweringOwner
    };
    selected.set(action, record);
    audit.selected++;
    audit.bySeat[seat]++;
    if (audit.boundedSelections.length < 64)
      audit.boundedSelections.push(record);
    return action;
  }

  function dispatch(action, ...args) {
    if (action?.constructor?.name === 'AddPlayerAction' &&
        this !== liveStore) {
      liveStore = this;
      audit.nativeStores++;
    }
    const choice = this === liveStore ? selected.get(action) : undefined;
    if (!choice) return originalDispatch.value.apply(this, [action, ...args]);
    const before = this.state.prompts?.find(p =>
      p.id === choice.promptId && p.result === undefined);
    try {
      const result = originalDispatch.value.apply(this, [action, ...args]);
      audit.accepted++;
      const after = this.state.prompts?.find(p => p.id === choice.promptId);
      if (before && (after === undefined || after.result !== undefined))
        audit.postconditionsConfirmed++;
      else audit.postconditionsMissing++;
      return result;
    } catch (error) {
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction',
    {...original, value: decode});
  Object.defineProperty(Store.prototype, 'dispatch',
    {...originalDispatch, value: dispatch});
  try {
    return {result: execute(), audit};
  } finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', originalDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', original);
  }
}

module.exports = {
  VERSION, nativeSinglePokemonChoices, actorChoosePokemonInput,
  chooseActorPokemon, withActorOnlyChoosePokemon
};
