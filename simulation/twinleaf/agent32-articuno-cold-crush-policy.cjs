'use strict';

const assert = require('node:assert/strict');
const {assertValidPromptAction} = require('./prompt-integrity.cjs');
const {loadNativeAbilityDependencies} =
  require('./agent36-owner-ability-confirm-policy.cjs');
const {
  VERSION: CHOICE_VERSION,
  MIN_OPPONENT_ACTIVE_ENERGY,
  decideOneWaterColdCrush,
  chooseOneArticunoWaterTransfer
} = require('./agent32-articuno-cold-crush-choice.cjs');

const VERSION = 'agent32-articuno-cold-crush-owner-policy-v1';

/** @param {object} left @param {object} right */
function samePhysicalCard(left, right) {
  return left === right ||
    (Number.isInteger(left?.id) && left.id >= 0 && left.id === right?.id);
}

/** @param {object} slot @param {object} card */
function slotHasCard(slot, card) {
  return (slot?.cards ?? []).some(candidate => samePhysicalCard(candidate, card));
}

/**
 * Add a narrowly scoped Articuno CES one-Water Cold Crush owner policy.
 *
 * Install this wrapper inside withOwnerAbilityConfirmPolicy so it composes
 * outside that wrapper's SimpleTacticsAi/Store hooks. It intercepts only the
 * exact CES 31 play, its resulting Ability Confirm, and the matching Water
 * MoveEnergyPrompt. Other prompts/actions fall through unchanged.
 *
 * @param {()=>any} run
 * @param {{ptcgServer?:object,types?:object,validate?:(state:object,action:object)=>void,
 *   minOpponentActiveEnergy?:number}} [deps]
 * @returns {{result:any,audit:object}}
 */
function withArticunoColdCrushPolicy(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const native = deps.ptcgServer && deps.types ? null : loadNativeAbilityDependencies();
  const ptcg = deps.ptcgServer ?? native.ptcgServer;
  const types = deps.types ?? native.types;
  const validate = deps.validate ?? assertValidPromptAction;
  const minOpponentActiveEnergy =
    deps.minOpponentActiveEnergy ?? MIN_OPPONENT_ACTIVE_ENERGY;
  if (!Number.isInteger(minOpponentActiveEnergy) || minOpponentActiveEnergy < 1) {
    throw new Error('Cold Crush opponent Energy threshold must be a positive integer.');
  }

  const {Store, SimpleTacticsAi, ConfirmPrompt, ResolvePromptAction} = ptcg;
  assert.ok(Store?.prototype && SimpleTacticsAi?.prototype);
  assert.equal(typeof ResolvePromptAction, 'function');

  const originalDispatch = Store.prototype.dispatch;
  const originalDecode = SimpleTacticsAi.prototype.decodeNextAction;
  const pendingByPrompt = new WeakMap();
  const pendingByOwner = new Map();
  const submitted = new WeakMap();
  const pendingColdCrush = new Map();
  const audit = {
    version: VERSION,
    choiceVersion: CHOICE_VERSION,
    minOpponentActiveEnergy,
    readsOpponentHidden: false,
    readsUnopenedDeck: false,
    usesOwnerHandOnlyToIdentifyPlayedCard: true,
    confirmOffers: 0,
    confirmSettled: 0,
    confirmUnsettled: 0,
    confirmEvents: [],
    moveEnergyOffers: 0,
    moveEnergySubmitted: 0,
    moveEnergyEvents: [],
    coldCrushAttackEvents: []
  };

  Store.prototype.dispatch = function agent32ArticunoColdCrushDispatch(action, ...args) {
    const stateBefore = this.state;
    const beforePrompts = new Set(stateBefore?.prompts ?? []);
    let played = null;

    if (action?.constructor?.name === 'PlayCardAction') {
      const owner = stateBefore?.players?.find(player => player.id === action.id);
      const card = owner?.hand?.cards?.[action.handIndex] ?? null;
      if (card?.fullName === 'Articuno-GX CES') {
        played = {
          ownerId: action.id,
          card,
          cardName: card.name ?? null,
          fullName: card.fullName,
          turn: stateBefore.turn
        };
      }
    }

    const meta = action && typeof action === 'object' ? submitted.get(action) : null;
    if (action?.constructor?.name === 'AttackAction' &&
        action.name === 'Cold Crush-GX') {
      const owner = stateBefore?.players?.find(player => player.id === action.clientId);
      const opponent = stateBefore?.players?.find(player => player.id !== action.clientId);
      pendingColdCrush.set(action.clientId, {
        turn: stateBefore.turn,
        ownerActiveName: owner?.active?.getPokemonCard?.()?.fullName ?? null,
        opponentActiveName: opponent?.active?.getPokemonCard?.()?.fullName ?? null,
        ownerActiveEnergyBefore: owner?.active?.energies?.cards?.length ?? 0,
        opponentActiveEnergyBefore: opponent?.active?.energies?.cards?.length ?? 0
      });
    }

    const result = originalDispatch.call(this, action, ...args);
    const newPrompts = (this.state?.prompts ?? [])
      .filter(prompt => !beforePrompts.has(prompt));

    if (played) {
      for (const prompt of newPrompts) {
        if (prompt instanceof ConfirmPrompt &&
            prompt.message === 'WANT_TO_USE_ABILITY' &&
            prompt.playerId === played.ownerId &&
            played.turn === this.state.turn) {
          pendingByPrompt.set(prompt, played);
        }
      }
    }

    if (meta?.kind === 'confirm') {
      const settled = meta.prompt.result === meta.decision;
      if (!settled) {
        audit.confirmUnsettled++;
        throw new Error('Articuno Cold Crush Ability Confirm did not settle to the submitted choice.');
      }
      pendingByPrompt.delete(meta.prompt);
      if (meta.decision) {
        const movePrompts = newPrompts.filter(prompt =>
          prompt.playerId === meta.ownerId &&
          prompt.constructor?.name === 'MoveEnergyPrompt' &&
          prompt.message === types.GameMessage.MOVE_ENERGY_TO_ACTIVE);
        if (movePrompts.length !== 1) {
          throw new Error('Accepted Articuno Cold Crush Ability did not open exactly one owner Water prompt.');
        }
        pendingByOwner.set(meta.ownerId, meta.played);
      } else {
        pendingByOwner.delete(meta.ownerId);
      }
      audit.confirmSettled++;
      audit.confirmEvents.push({
        ownerId: meta.ownerId,
        turn: meta.turn,
        decision: meta.decision,
        reason: meta.reason,
        details: meta.details,
        opponentActiveEnergyCount: meta.opponentActiveEnergyCount
      });
    }

    if (meta?.kind === 'move-energy') {
      pendingByOwner.delete(meta.ownerId);
      const transfers = Array.isArray(meta.prompt.result) ? meta.prompt.result : [];
      const owner = this.state.players.find(player => player.id === meta.ownerId);
      const physicallyMoved = transfers.length === 1 &&
        transfers.every(transfer =>
          (owner?.active?.energies?.cards ?? []).some(card =>
            samePhysicalCard(card, transfer.card)) &&
          !(owner?.bench?.[transfer.from.index]?.energies?.cards ?? []).some(card =>
            samePhysicalCard(card, transfer.card)));
      const settled = meta.prompt.result !== undefined;
      const allBasicWater = transfers.every(transfer =>
        transfer?.card?.name === 'Water Energy' &&
        transfer.card.superType === types.SuperType.ENERGY &&
        Array.isArray(transfer.card.provides) &&
        transfer.card.provides.includes(types.CardType.WATER));
      if (!settled || !physicallyMoved || !allBasicWater) {
        throw new Error('Articuno Cold Crush one-Water transfer did not settle into physical owner Active custody.');
      }
      audit.moveEnergyEvents.push({
        ownerId: meta.ownerId,
        turn: meta.turn,
        transferCount: transfers.length,
        physicallyMoved,
        allBasicWater,
        card: transfers[0].card.fullName ?? transfers[0].card.name,
        from: transfers[0].from,
        to: transfers[0].to
      });
    }

    for (const [ownerId, before] of pendingColdCrush) {
      const owner = this.state.players.find(player => player.id === ownerId);
      const opponent = this.state.players.find(player => player.id !== ownerId);
      const unresolved = (this.state.prompts ?? []).some(prompt => prompt.result === undefined);
      if (!unresolved) {
        audit.coldCrushAttackEvents.push({
          ownerId,
          turn: before.turn,
          ownerActiveNameBefore: before.ownerActiveName,
          opponentActiveNameBefore: before.opponentActiveName,
          ownerActiveEnergyBefore: before.ownerActiveEnergyBefore,
          opponentActiveEnergyBefore: before.opponentActiveEnergyBefore,
          ownerActiveEnergyAfter: owner?.active?.energies?.cards?.length ?? 0,
          opponentActiveEnergyAfter: opponent?.active?.energies?.cards?.length ?? 0,
          ownerWaterInDiscard: (owner?.discard?.cards ?? []).some(card =>
            card.name === 'Water Energy' && card.superType === types.SuperType.ENERGY),
          opponentEnergyInDiscard: (opponent?.discard?.cards ?? [])
            .filter(card => card.superType === types.SuperType.ENERGY).length,
          ownerUsedGX: owner?.usedGX === true
        });
        pendingColdCrush.delete(ownerId);
      }
    }
    return result;
  };

  SimpleTacticsAi.prototype.decodeNextAction = function agent32ArticunoColdCrushDecode(state) {
    const ownerId = this.client?.id;
    const owner = state.players.find(player => player.id === ownerId);
    const prompt = state.prompts.find(candidate =>
      candidate.playerId === ownerId && candidate.result === undefined);

    if (prompt instanceof ConfirmPrompt) {
      const played = pendingByPrompt.get(prompt);
      if (played) {
        const opponent = state.players.find(player => player.id !== ownerId);
        const choice = decideOneWaterColdCrush({
          card: played.card,
          owner,
          opponent,
          types,
          minOpponentActiveEnergy
        });
        audit.confirmOffers++;
        const action = new ResolvePromptAction(prompt.id, choice.decision);
        validate(state, action);
        submitted.set(action, {
          kind: 'confirm',
          prompt,
          decision: choice.decision,
          played,
          ownerId,
          turn: state.turn,
          reason: choice.reason,
          details: choice.details,
          opponentActiveEnergyCount: opponent?.active?.energies?.cards?.length ?? 0
        });
        return action;
      }
    }

    const ability = pendingByOwner.get(ownerId);
    if (ability &&
        prompt?.constructor?.name === 'MoveEnergyPrompt' &&
        prompt.message === types.GameMessage.MOVE_ENERGY_TO_ACTIVE) {
      audit.moveEnergyOffers++;
      const selected = chooseOneArticunoWaterTransfer({
        prompt, owner, played: ability, types
      });
      const action = new ResolvePromptAction(prompt.id, selected);
      validate(state, action);
      submitted.set(action, {
        kind: 'move-energy',
        prompt,
        selected,
        ownerId,
        turn: state.turn
      });
      audit.moveEnergySubmitted++;
      return action;
    }

    return originalDecode.call(this, state);
  };

  try {
    return {result: run(), audit};
  } catch (error) {
    if (error && typeof error === 'object') {
      error.articunoColdCrushAudit = {
        ...audit,
        confirmEvents: [...audit.confirmEvents],
        moveEnergyEvents: [...audit.moveEnergyEvents],
        coldCrushAttackEvents: [...audit.coldCrushAttackEvents]
      };
    }
    throw error;
  } finally {
    Store.prototype.dispatch = originalDispatch;
    SimpleTacticsAi.prototype.decodeNextAction = originalDecode;
  }
}

module.exports = {VERSION, withArticunoColdCrushPolicy};
