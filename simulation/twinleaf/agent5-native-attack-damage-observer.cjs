'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent5-native-attack-damage-ko-prize-observer-v1';

function cardName(card) {
  return card?.fullName ?? card?.name ?? null;
}

function remainingPrizes(player) {
  if (typeof player?.getPrizeLeft === 'function') return player.getPrizeLeft();
  if (Array.isArray(player?.prizes)) {
    return player.prizes.filter(slot => slot.cards.length > 0).length;
  }
  return null;
}

/**
 * Detached public-board snapshot. Prize faces, hands, decks and hidden zones
 * are deliberately excluded.
 * @param {object} state Native Store state.
 * @returns {object[]}
 */
function publicBoardSnapshot(state) {
  return state.players.map((player, seat) => ({
    seat,
    active: cardName(player.active?.getPokemonCard?.()),
    activeDamage: player.active?.damage ?? null,
    activeEnergies: (player.active?.energies?.cards ?? []).map(cardName),
    bench: (player.bench ?? []).map((slot, index) => ({
      index,
      pokemon: cardName(slot.getPokemonCard?.()),
      damage: slot.damage ?? null,
      energies: (slot.energies?.cards ?? []).map(cardName)
    })),
    prizesRemaining: remainingPrizes(player)
  }));
}

/**
 * @param {object} state
 * @param {object|null|undefined} target
 * @returns {{seat:number,zone:'active'|'bench',index:number,pokemon:string|null}|null}
 */
function locatePublicTarget(state, target) {
  if (!target) return null;
  for (let seat = 0; seat < state.players.length; seat++) {
    const player = state.players[seat];
    if (player.active === target) {
      return {
        seat,
        zone: 'active',
        index: 0,
        pokemon: cardName(target.getPokemonCard?.())
      };
    }
    const index = (player.bench ?? []).indexOf(target);
    if (index >= 0) {
      return {
        seat,
        zone: 'bench',
        index,
        pokemon: cardName(target.getPokemonCard?.())
      };
    }
  }
  return null;
}

/**
 * Read-only observer for actual attack damage, native KnockOutEffect and the
 * physical Prize/promotion prompt chain on the genuine Store. It never
 * changes an action, prompt answer, card, zone, or reducer.
 *
 * @template T
 * @param {()=>T} execute One synchronous native match.
 * @param {{Store?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeAttackDamageObserver(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ?? require(path.join(output, 'game/store/store')).Store;
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  const oldReduce = Object.getOwnPropertyDescriptor(Store.prototype, 'reduceEffect');
  assert.equal(typeof oldDispatch?.value, 'function');
  assert.equal(typeof oldReduce?.value, 'function');
  assert.equal(oldDispatch.configurable, true);
  assert.equal(oldReduce.configurable, true);

  let liveStore = null;
  let currentAttack = null;
  let nextAttackId = 0;
  const audit = {
    schema: VERSION,
    realStores: 0,
    acceptedAttackActions: 0,
    rejectedAttackActions: 0,
    observedDamageEffects: 0,
    observedDamagePipelineEffects: 0,
    observedDamageCounterEffects: 0,
    observedKnockOutEffects: 0,
    completedPromptChains: 0,
    incompletePromptChains: 0,
    attacks: [],
    observerReadOnly: true,
    opponentConcealedZonesRead: false,
    ownerHandReadOnlyForPrizeTransfer: true,
    competitiveGamesQualified: 0
  };

  function unresolvedPrompts(state) {
    return (state.prompts ?? []).filter(prompt => prompt.result === undefined);
  }

  function finishAttack(store, error = null) {
    if (!currentAttack) return;
    const state = store.state;
    const pending = unresolvedPrompts(state);
    currentAttack.settlement = {
      complete: pending.length === 0,
      unresolvedPromptTypes: pending.map(prompt => prompt.constructor?.name ?? null),
      finalPublicBoard: publicBoardSnapshot(state),
      error: error === null ? null : String(error?.message ?? error).slice(0, 320)
    };
    if (currentAttack.settlement.complete) audit.completedPromptChains++;
    else audit.incompletePromptChains++;
    audit.attacks.push(currentAttack);
    currentAttack = null;
  }

  function dispatch(action, ...args) {
    const kind = action?.constructor?.name ?? null;
    if (kind === 'AddPlayerAction' && !liveStore) {
      liveStore = this;
      audit.realStores++;
    }
    const live = this === liveStore;
    const state = this.state;
    const isAttack = live && kind === 'AttackAction';
    let startedAttack = null;
    let promptRecord = null;
    const promptAttack = currentAttack;

    if (isAttack) {
      if (currentAttack) finishAttack(this, new Error('Superseded by another AttackAction'));
      const actorId = action.id ?? action.clientId ?? action.playerId;
      const actorSeat = state.players.findIndex(player => player.id === actorId);
      startedAttack = {
        id: ++nextAttackId,
        actorSeat: actorSeat >= 0 ? actorSeat : state.activePlayer,
        turn: state.turn,
        attackName: action.name ?? action.attackName ?? action.attack?.name ?? null,
        actionKind: kind,
        accepted: false,
        beforePublicBoard: publicBoardSnapshot(state),
        afterActionPublicBoard: null,
        effects: [],
        promptResolutions: [],
        settlement: null
      };
      currentAttack = startedAttack;
    }

    if (live && currentAttack && kind === 'ResolvePromptAction') {
      const prompt = state.prompts?.find(row =>
        row.id === action.id && row.result === undefined);
      if (prompt) {
        const ownerSeat = state.players.findIndex(player =>
          player.id === prompt.playerId);
        const owner = ownerSeat >= 0 ? state.players[ownerSeat] : null;
        const selectedPrizeCards =
          prompt.constructor?.name === 'ChoosePrizePrompt' &&
          Array.isArray(action.result)
            ? action.result.flatMap(slot => slot.cards.slice())
            : [];
        promptRecord = {
          promptType: prompt.constructor?.name ?? null,
          message: prompt.message ?? null,
          ownerSeat,
          selectedSlots: Array.isArray(action.result) ? action.result.length : null,
          selectedPrizeCards: selectedPrizeCards.length,
          physicalPrizeCardsToOwnerHand: null,
          activeBefore: owner ? publicBoardSnapshot(state)[ownerSeat].active : null,
          activeAfter: null,
          resolved: false
        };
        promptRecord._selectedPrizeCards = selectedPrizeCards;
      }
    }

    try {
      const result = oldDispatch.value.call(this, action, ...args);
      if (startedAttack) {
        startedAttack.accepted = true;
        audit.acceptedAttackActions++;
        startedAttack.afterActionPublicBoard = publicBoardSnapshot(this.state);
      }
      if (promptRecord && promptAttack) {
        const owner = promptRecord.ownerSeat >= 0
          ? this.state.players[promptRecord.ownerSeat]
          : null;
        const cards = promptRecord._selectedPrizeCards;
        promptRecord.physicalPrizeCardsToOwnerHand =
          owner !== null && cards.length > 0 &&
          cards.every(card => owner.hand.cards.includes(card));
        promptRecord.activeAfter = owner
          ? publicBoardSnapshot(this.state)[promptRecord.ownerSeat].active
          : null;
        promptRecord.resolved = !this.state.prompts?.some(prompt =>
          prompt.id === action.id && prompt.result === undefined);
        delete promptRecord._selectedPrizeCards;
        promptAttack.promptResolutions.push(promptRecord);
      }
      if (live && currentAttack && unresolvedPrompts(this.state).length === 0) {
        finishAttack(this);
      }
      return result;
    } catch (error) {
      if (startedAttack) {
        startedAttack.dispatchError = String(error?.message ?? error).slice(0, 320);
        audit.rejectedAttackActions++;
        finishAttack(this, error);
      } else if (live && currentAttack) {
        currentAttack.promptDispatchError =
          String(error?.message ?? error).slice(0, 320);
        finishAttack(this, error);
      }
      throw error;
    }
  }

  function reduceEffect(state, effect, ...args) {
    const kind = effect?.constructor?.name ?? null;
    const relevant = /Damage|KnockOut/i.test(kind ?? '') ||
      Number.isFinite(effect?.damage);
    if (this !== liveStore || !currentAttack || !relevant) {
      return oldReduce.value.call(this, state, effect, ...args);
    }

    const attackRecord = currentAttack;
    const target = effect.target ?? null;
    const targetLocation = locatePublicTarget(state, target);
    const effectPlayerSeat = effect.player
      ? state.players.indexOf(effect.player)
      : -1;
    const effectPlayerActive = effectPlayerSeat >= 0
      ? state.players[effectPlayerSeat].active
      : null;
    const beforeDamage = target?.damage ?? null;
    const beforeEffectPlayerDamage = effectPlayerActive?.damage ?? null;
    const beforeBoard = publicBoardSnapshot(state);
    const result = oldReduce.value.call(this, state, effect, ...args);
    const afterState = result?.players ? result : this.state;
    attackRecord.effects.push({
      effectType: kind,
      target: targetLocation,
      damage: Number.isFinite(effect.damage) ? effect.damage : null,
      damageCounters: Number.isFinite(effect.damageCounters)
        ? effect.damageCounters
        : null,
      targetDamageBefore: beforeDamage,
      targetDamageAfter: target?.damage ?? null,
      effectPlayerSeat: effectPlayerSeat >= 0 ? effectPlayerSeat : null,
      effectPlayerActiveBefore: effectPlayerActive
        ? cardName(effectPlayerActive.getPokemonCard?.())
        : null,
      effectPlayerDamageBefore: beforeEffectPlayerDamage,
      victimSeat: /KnockOut/i.test(kind ?? '')
        ? (targetLocation?.seat ?? (effectPlayerSeat >= 0 ? effectPlayerSeat : null))
        : null,
      victimPokemonBefore: /KnockOut/i.test(kind ?? '')
        ? (targetLocation?.pokemon ??
          (effectPlayerActive ? cardName(effectPlayerActive.getPokemonCard?.()) : null))
        : null,
      victimDamageBefore: /KnockOut/i.test(kind ?? '')
        ? (beforeDamage ?? beforeEffectPlayerDamage)
        : null,
      prizeCount: Number.isFinite(effect.prizeCount) ? effect.prizeCount : null,
      preventDefault: effect.preventDefault === true,
      beforePublicBoard: beforeBoard,
      afterPublicBoard: publicBoardSnapshot(afterState)
    });
    if (kind === 'DealDamageEffect') audit.observedDamageEffects++;
    if (/Damage|PutCounters/i.test(kind ?? '') || Number.isFinite(effect.damage)) {
      audit.observedDamagePipelineEffects++;
    }
    if (/PutDamage|PutCounters/i.test(kind ?? '')) {
      audit.observedDamageCounterEffects++;
    }
    if (/KnockOut/i.test(kind ?? '')) audit.observedKnockOutEffects++;
    return result;
  }

  Object.defineProperty(Store.prototype, 'dispatch', {
    ...oldDispatch,
    value: dispatch
  });
  Object.defineProperty(Store.prototype, 'reduceEffect', {
    ...oldReduce,
    value: reduceEffect
  });

  try {
    const result = execute();
    if (currentAttack) finishAttack(liveStore);
    return {result, audit};
  } catch (error) {
    if (currentAttack) finishAttack(liveStore, error);
    if (error && typeof error === 'object') {
      error.agent5AttackDamageAudit = {
        ...audit,
        attacks: [...audit.attacks]
      };
    }
    throw error;
  } finally {
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    assert.strictEqual(Store.prototype.reduceEffect, reduceEffect);
    Object.defineProperty(Store.prototype, 'dispatch', oldDispatch);
    Object.defineProperty(Store.prototype, 'reduceEffect', oldReduce);
  }
}

module.exports = {
  VERSION,
  publicBoardSnapshot,
  locatePublicTarget,
  withNativeAttackDamageObserver
};
