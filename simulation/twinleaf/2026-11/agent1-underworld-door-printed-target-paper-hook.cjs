'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent1-underworld-door-printed-target-paper-hook-v1';
const PATCHED_PROMPT = Symbol('agent1-underworld-door-prompt-patched');

function loadEngine(deps = {}) {
  const output = path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output');
  const load = name => require(path.join(output, name));
  const cardTypes = deps.cardTypes ?? load('game/store/card/card-types');
  const actions = deps.actions ?? load('game/store/actions/play-card-action');
  const messages = deps.messages ?? load('game/game-message');
  return {
    ShadowRiderCalyrexVMAX: deps.ShadowRiderCalyrexVMAX ??
      load('sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax')
        .ShadowRiderCalyrexVMAX,
    EnergyCard: deps.EnergyCard ??
      load('game/store/card/energy-card').EnergyCard,
    PowerEffect: deps.PowerEffect ??
      load('game/store/effects/game-effects').PowerEffect,
    pokemonHasCardType: deps.pokemonHasCardType ??
      load('game/store/card/pokemon-card').pokemonHasCardType,
    GameError: deps.GameError ?? load('game/game-error').GameError,
    CardType: deps.CardType ?? cardTypes.CardType,
    EnergyType: deps.EnergyType ?? cardTypes.EnergyType,
    SuperType: deps.SuperType ?? cardTypes.SuperType,
    PlayerType: deps.PlayerType ?? actions.PlayerType,
    SlotType: deps.SlotType ?? actions.SlotType,
    GameCardMessage: deps.GameCardMessage ?? messages.GameCardMessage,
    GameStoreMessage: deps.GameStoreMessage ?? messages.GameStoreMessage
  };
}

function isUnderworldDoorPrompt(prompt, owner, engine) {
  const filter = prompt?.filter;
  return prompt?.constructor?.name === 'AttachEnergyPrompt' &&
    prompt.cardList === owner?.hand &&
    prompt.playerType === engine.PlayerType.BOTTOM_PLAYER &&
    Array.isArray(prompt.slots) &&
    prompt.slots.length === 1 &&
    prompt.slots[0] === engine.SlotType.BENCH &&
    prompt.message === engine.GameCardMessage.ATTACH_ENERGY_TO_BENCH &&
    filter?.superType === engine.SuperType.ENERGY &&
    filter?.energyType === engine.EnergyType.BASIC &&
    filter?.name === 'Psychic Energy' &&
    prompt.options?.min === 1 &&
    prompt.options?.max === 1;
}

function targetAt(index, engine) {
  return {
    player: engine.PlayerType.BOTTOM_PLAYER,
    slot: engine.SlotType.BENCH,
    index
  };
}

function legalPsychicBench(owner, engine) {
  return owner.bench.map((slot, index) => {
    const pokemon = slot?.getPokemonCard?.();
    return {
      index,
      pokemon,
      legal: !!pokemon &&
        engine.pokemonHasCardType(pokemon, engine.CardType.PSYCHIC)
    };
  });
}

function validAssignment(assignment, owner, prompt, engine) {
  const target = assignment?.to;
  if (!target ||
      target.player !== engine.PlayerType.BOTTOM_PLAYER ||
      target.slot !== engine.SlotType.BENCH ||
      !Number.isInteger(target.index) ||
      target.index < 0 ||
      target.index >= owner.bench.length) {
    return {valid: false, reason: 'target-is-not-own-benched-slot'};
  }
  const pokemon = owner.bench[target.index]?.getPokemonCard?.();
  if (!pokemon ||
      !engine.pokemonHasCardType(pokemon, engine.CardType.PSYCHIC)) {
    return {valid: false, reason: 'target-is-not-benched-psychic'};
  }
  const card = assignment.card;
  if (!(card instanceof engine.EnergyCard) ||
      card.energyType !== engine.EnergyType.BASIC ||
      !Array.isArray(card.provides) ||
      !card.provides.includes(engine.CardType.PSYCHIC) ||
      !prompt.cardList.filter(prompt.filter).includes(card)) {
    return {valid: false, reason: 'source-is-not-basic-psychic-energy'};
  }
  return {valid: true, reason: null};
}

function correctPrompt(prompt, owner, engine, audit) {
  assert.ok(prompt.options && typeof prompt.decode === 'function',
    'Underworld Door prompt must expose mutable options and decode');

  const targets = legalPsychicBench(owner, engine);
  const legal = targets.filter(target => target.legal);
  if (legal.length === 0) {
    audit.noPsychicBenchRejections++;
    throw new engine.GameError(engine.GameStoreMessage.CANNOT_USE_POWER);
  }

  const originalBlocked = Array.isArray(prompt.options.blocked) ?
    [...prompt.options.blocked] : null;
  const originalBlockedTo = Array.isArray(prompt.options.blockedTo) ?
    [...prompt.options.blockedTo] : [];
  const rejectedTargets = targets.filter(target => !target.legal)
    .map(target => targetAt(target.index, engine));
  const blockedTo = [...originalBlockedTo];
  for (const target of rejectedTargets) {
    if (!blockedTo.some(existing =>
      existing.player === target.player &&
      existing.slot === target.slot &&
      existing.index === target.index)) {
      blockedTo.push(target);
    }
  }

  // Underworld Door has no source-Energy exclusions. The pinned card code
  // mistakenly builds a source-index block from Bench slots and never fills
  // AttachEnergyPrompt.options.blockedTo.
  prompt.options.blocked = [];
  prompt.options.blockedTo = blockedTo;
  prompt.options.validCardTypes = [engine.CardType.PSYCHIC];

  const originalDecode = prompt.decode;
  prompt.decode = function(result, decodeState) {
    const decoded = Reflect.apply(originalDecode, this, [result, decodeState]);
    if (decoded === null) return null;
    const actualOwner = decodeState?.players?.find(player =>
      player.id === this.getPerspectivePlayerId());
    let failure = null;
    if (!actualOwner || !Array.isArray(decoded) || decoded.length !== 1) {
      failure = 'assignment-count-or-owner-invalid';
    } else {
      for (const assignment of decoded) {
        const checked = validAssignment(assignment, actualOwner, this, engine);
        if (!checked.valid) {
          failure = checked.reason;
          break;
        }
      }
    }
    if (failure !== null) {
      audit.invalidAssignmentsRejected++;
      audit.rejections.push({
        ownerPlayerId: actualOwner?.id ?? null,
        reason: failure
      });
      throw new engine.GameError(
        failure === 'target-is-not-own-benched-slot' ||
        failure === 'target-is-not-benched-psychic' ?
          engine.GameStoreMessage.CAN_ONLY_ATTACH_TO_PSYCHIC :
          engine.GameStoreMessage.INVALID_PROMPT_RESULT
      );
    }
    audit.validAssignmentsAccepted++;
    return decoded;
  };

  audit.promptsCorrected++;
  audit.rows.push({
    ownerPlayerId: owner.id,
    originalBlocked,
    correctedBlocked: [],
    originalBlockedTo,
    correctedBlockedTo: blockedTo,
    legalPsychicBenchIndices: legal.map(target => target.index)
  });
}

/**
 * Opt-in, research-owned correction for the pinned Shadow Rider Calyrex VMAX
 * Underworld Door prompt. It leaves Twinleaf vendor code untouched, exposes
 * only the acting owner's Bench, and patches only the matching prompt emitted
 * during ShadowRiderCalyrexVMAX.reduceEffect().
 *
 * The wrapper is scoped to one serial experiment invocation. It supports
 * synchronous or Promise-returning execute callbacks and always restores the
 * original prototype and Store.prompt descriptor.
 *
 * @template T
 * @param {()=>T|Promise<T>} execute
 * @param {object} [deps] Injectable pinned-engine classes/enums for tests.
 * @returns {{result:T,audit:object}|Promise<{result:T,audit:object}>}
 */
function withUnderworldDoorPrintedTargetHook(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const engine = loadEngine(deps);
  const prototype = engine.ShadowRiderCalyrexVMAX.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'reduceEffect');
  assert.equal(typeof descriptor?.value, 'function');
  const originalReduceEffect = descriptor.value;
  const audit = {
    schema: VERSION,
    ownerZonesOnly: true,
    vendorModified: false,
    underworldDoorEffectCalls: 0,
    promptsMatched: 0,
    promptsCorrected: 0,
    noPsychicBenchRejections: 0,
    validAssignmentsAccepted: 0,
    invalidAssignmentsRejected: 0,
    rows: [],
    rejections: []
  };

  function patchedReduceEffect(store, state, effect) {
    const isUnderworldDoorEffect =
      effect instanceof engine.PowerEffect &&
      effect.power === this.powers[0] &&
      effect.card === this;
    if (!isUnderworldDoorEffect) {
      return Reflect.apply(originalReduceEffect, this,
        [store, state, effect]);
    }
    audit.underworldDoorEffectCalls++;
    assert.ok(store && typeof store.prompt === 'function' &&
      Object.isExtensible(store),
    'Underworld Door requires a safely interceptable Store.prompt');
    const promptDescriptor = Object.getOwnPropertyDescriptor(store, 'prompt');
    assert.ok(promptDescriptor?.configurable !== false,
      'Store.prompt must be safely shadowable for the scoped hook');
    const originalPrompt = store.prompt;
    const expectedOwner = effect.player;
    let matchedPrompts = 0;

    function patchedPrompt(promptState, prompt, callback) {
      const owner = promptState?.players?.find(player =>
        player.id === prompt?.getPerspectivePlayerId?.());
      if (owner === expectedOwner &&
          isUnderworldDoorPrompt(prompt, owner, engine)) {
        matchedPrompts++;
        audit.promptsMatched++;
        if (prompt[PATCHED_PROMPT] !== true) {
          Object.defineProperty(prompt, PATCHED_PROMPT, {
            configurable: false,
            enumerable: false,
            value: true
          });
          correctPrompt(prompt, owner, engine, audit);
        }
      }
      return Reflect.apply(originalPrompt, this,
        [promptState, prompt, callback]);
    }

    Object.defineProperty(store, 'prompt', {
      configurable: true,
      enumerable: promptDescriptor?.enumerable ?? false,
      writable: true,
      value: patchedPrompt
    });
    try {
      const result = Reflect.apply(originalReduceEffect, this,
        [store, state, effect]);
      if (matchedPrompts !== 1) {
        throw new Error('Underworld Door did not emit exactly one matching AttachEnergyPrompt; fail closed');
      }
      return result;
    } finally {
      if (promptDescriptor) {
        Object.defineProperty(store, 'prompt', promptDescriptor);
      } else {
        delete store.prompt;
      }
    }
  }

  Object.defineProperty(prototype, 'reduceEffect', {
    ...descriptor,
    value: patchedReduceEffect
  });

  const restore = () => {
    assert.strictEqual(prototype.reduceEffect, patchedReduceEffect);
    Object.defineProperty(prototype, 'reduceEffect', descriptor);
  };
  const snapshot = () => JSON.parse(JSON.stringify(audit));
  const attachAudit = error => {
    if (error && typeof error === 'object') {
      error.agent1UnderworldDoorPaperAudit = snapshot();
    }
  };

  let result;
  try {
    result = execute();
  } catch (error) {
    attachAudit(error);
    restore();
    throw error;
  }

  if (result && typeof result.then === 'function') {
    return result.then(value => ({
      result: value,
      audit: snapshot()
    }), error => {
      attachAudit(error);
      throw error;
    }).finally(restore);
  }

  restore();
  return {result, audit: snapshot()};
}

module.exports = {
  VERSION,
  isUnderworldDoorPrompt,
  withUnderworldDoorPrintedTargetHook
};
