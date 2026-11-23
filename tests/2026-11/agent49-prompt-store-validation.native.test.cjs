'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const path = require('node:path');
const { stage } = require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const { initializeCards } = require('../../simulation/twinleaf/headless.cjs');
const { installUnderworldDoorPsychicRecipientHook } =
  require('../../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');
const loadNative = name => require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output', name));

const { Store } = require('../../vendor/twinleaf/ptcg-server/output/game/store/store');
const { State, GamePhase } = require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const { Player } = require('../../vendor/twinleaf/ptcg-server/output/game/store/state/player');
const { ConfirmPrompt } = require('../../vendor/twinleaf/ptcg-server/output/game/store/prompts/confirm-prompt');
const { ResolvePromptAction } = require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');

const {
  projectPrompt,
  dispatchPromptChoice
} = require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {
  cloneNativeValidationGraph
} = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');

function makeFixture(groupSize) {
  const state = new State();
  state.phase = GamePhase.SETUP;
  state.activePlayer = 0;

  const actor = new Player();
  actor.id = 101;
  const opponent = new Player();
  opponent.id = 202;
  state.players = [actor, opponent];

  const liveStore = new Store({ onStateChange() {} });
  liveStore.state = state;

  const prompt = new ConfirmPrompt(actor.id, 'GO_FIRST');
  const group = [prompt];
  if (groupSize === 2) {
    group.push(new ConfirmPrompt(opponent.id, 'GO_FIRST'));
  }

  let liveContinuationCalls = 0;
  liveStore.prompt(state, group, () => {
    liveContinuationCalls += 1;
  });

  return { state, liveStore, prompt, group, getLiveContinuationCalls: () => liveContinuationCalls };
}

for (const groupSize of [1, 2]) {
  test('pinned Twinleaf Store validates and settles an unresolved ConfirmPrompt in an isolated Store (group size ' + groupSize + ')', () => {
    const fixture = makeFixture(groupSize);
    const originalState = cloneNativeValidationGraph(fixture.state);
    const originalPromptGroups = fixture.liveStore.promptItems.map(item => item.ids.slice());
    const validationGroupSizes = [];
    let validationContinuationCalls = 0;
    const validationStores = [];

    class ObservedValidationStore extends Store {
      constructor(handler) {
        super(handler);
        validationStores.push(this);
      }

      prompt(state, prompts, then) {
        const group = Array.isArray(prompts) ? prompts : [prompts];
        validationGroupSizes.push(group.length);
        return super.prompt(state, prompts, (...args) => {
          validationContinuationCalls += 1;
          return then(...args);
        });
      }
    }

    const native = {
      Store: ObservedValidationStore,
      ResolvePromptAction
    };
    const projection = projectPrompt({
      prompt: fixture.prompt,
      state: fixture.state,
      actorSeat: 0,
      native
    });

    const prepared = dispatchPromptChoice({
      store: fixture.liveStore,
      prompt: fixture.prompt,
      state: fixture.state,
      actorSeat: 0,
      projection,
      decision: { kind: 'select-choice', token: 'prompt-0' },
      native,
      dispatch: false,
      withValidationRandom: callback => callback()
    });

    assert.equal(prepared.validationReceipt?.schema, 'agent6-cloned-store-prompt-validation-v1');
    assert.equal(prepared.validationReceipt?.promptDecodeValidated, true);
    assert.equal(prepared.validationReceipt?.clonedPromptResolved, true);
    assert.equal(prepared.validationReceipt?.nativeValidationStoreMode, 'cloned-store');
    assert.equal(prepared.validationReceipt?.fullOriginalStoreStateUnchanged, true);

    assert.deepEqual(validationGroupSizes, [groupSize],
      'the isolated Store must preserve the original native continuation-group membership');
    assert.equal(validationStores.length, 1);
    const clonedPrompt = validationStores[0].state.prompts.find(item =>
      item.playerId === fixture.prompt.playerId && item.message === 'GO_FIRST');
    assert.ok(clonedPrompt);
    assert.equal(clonedPrompt.result, true,
      'the real pinned Store must apply ResolvePromptAction to the cloned prompt');
    assert.equal(validationContinuationCalls, groupSize === 1 ? 1 : 0,
      'only the isolated no-op continuation may run when its complete prompt group is resolved');

    assert.deepEqual(fixture.state, originalState,
      'prompt validation must not mutate the original native state graph');
    assert.deepEqual(fixture.liveStore.promptItems.map(item => item.ids), originalPromptGroups,
      'prompt validation must not mutate the live Store continuation queue');
    assert.equal(fixture.prompt.result, undefined,
      'prompt validation must not resolve the live native prompt');
    assert.equal(fixture.getLiveContinuationCalls(), 0,
      'prompt validation must not execute the live game continuation');
  });
}

test('Underworld Door AttachEnergyPrompt clone validation uses the cloned prompt/card graph', () => {
  const manager = initializeCards();
  const x = stage(0);
  let id = 87000;
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, name);
    result.id = id++;
    return result;
  };

  const psychic = x.owner.bench[0];
  const offType = x.owner.bench[1];
  psychic.cards.length = 0;
  psychic.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  offType.cards.length = 0;
  offType.cards.push(card('Dialga-GX UPR'));
  x.owner.hand.cards.length = 0;
  const energy = card('Psychic Energy SVE');
  x.owner.hand.cards.push(energy);
  x.owner.deck.cards.length = 0;
  for (let i = 0; i < 4; i++) x.owner.deck.cards.push(card('Psychic Energy SVE'));

  const { UseAbilityAction } = loadNative('game/store/actions/game-actions');
  const { PlayerType, SlotType } = loadNative('game/store/actions/play-card-action');
  const { CheckPokemonTypeEffect } = loadNative('game/store/effects/check-effects');
  const { EnergyCard } = loadNative('game/store/card/energy-card');
  const { CardType, EnergyType, SuperType } = loadNative('game/store/card/card-types');
  const { AttachEnergyPrompt } = loadNative('game/store/prompts/attach-energy-prompt');
  const originalPromptValidate = AttachEnergyPrompt.prototype.validate;
  const restore = installUnderworldDoorPsychicRecipientHook();

  try {
    x.store.dispatch(new UseAbilityAction(x.owner.id, 'Underworld Door', {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
    }));
    let pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.equal(pending?.constructor.name, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));
    pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.equal(pending?.constructor.name, 'AttachEnergyPrompt');

    const sourceCard = psychic.cards.find(item =>
      item.fullName === 'Shadow Rider Calyrex VMAX CRE');
    const nativeBindings = {
      Store, ResolvePromptAction, PlayerType, SlotType,
      CheckPokemonTypeEffect, EnergyCard, CardType, EnergyType, SuperType
    };
    const provenanceHook = {
      getPromptProvenance: () => ({
        sourceKind: 'card-effect', sourceCard, effectName: 'Underworld Door'
      })
    };
    const projection = projectPrompt({
      prompt: pending, state: x.state, actorSeat: 0,
      native: nativeBindings, store: x.store, provenanceHook
    });
    const energyChoice = projection.promptProjection.choices.find(choice =>
      choice.kind === 'energy');
    assert.ok(energyChoice, 'the owner-visible prompt must expose the physical Basic Psychic Energy');
    assert.deepEqual(pending.underworldDoorAllowedBenchIndices, [0]);
    assert.equal(pending.validate([{
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 1 },
      index: 0,
      card: energy
    }]), false, 'a non-Psychic Bench target must remain rejected');

    const originalState = cloneNativeValidationGraph(x.state);
    const originalPromptGroups = x.store.promptItems.map(item => item.ids.slice());
    const prepared = dispatchPromptChoice({
      store: x.store, prompt: pending, state: x.state, actorSeat: 0,
      projection,
      decision: { kind: 'select-choice', token: energyChoice.token },
      native: nativeBindings,
      dispatch: false,
      withValidationRandom: callback => callback()
    });

    assert.equal(prepared.validationReceipt?.schema,
      'agent6-cloned-store-prompt-validation-v1');
    assert.equal(prepared.validationReceipt?.promptDecodeValidated, true);
    assert.equal(prepared.validationReceipt?.clonedPromptResolved, true);
    assert.equal(prepared.validationReceipt?.nativeValidationStoreMode, 'cloned-store');
    assert.equal(prepared.validationReceipt?.fullOriginalStoreStateUnchanged, true);
    assert.deepEqual(x.state, originalState,
      'clone validation must not mutate the live Underworld Door state');
    assert.deepEqual(x.store.promptItems.map(item => item.ids), originalPromptGroups,
      'clone validation must not mutate the live Underworld Door continuation queue');
    assert.equal(pending.result, undefined,
      'clone validation must leave the live AttachEnergyPrompt unresolved');
    assert.equal(x.owner.hand.cards.includes(energy), true);
    assert.equal(psychic.energies.cards.includes(energy), false);

    x.store.dispatch(prepared.action);
    assert.equal(psychic.energies.cards.includes(energy), true);
    assert.equal(offType.energies.cards.includes(energy), false);
    assert.equal(x.owner.deck.cards.length, 2);
    assert.equal(x.owner.hand.cards.length, 2);
    assert.equal(x.state.prompts.filter(prompt => prompt.result === undefined).length, 0);
    assert.equal(restore.isRestored, false,
      'the hook remains installed through live native prompt settlement');
  } finally {
    restore();
    assert.equal(restore.isRestored, true);
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate);
  }
});



test('Underworld hook preserves native Blaziken Firestarter AttachEnergyPrompt validation', () => {
  const manager = initializeCards();
  const x = stage(0);
  let id = 88000;
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, name);
    result.id = id++;
    return result;
  };

  const blaziken = card('Blaziken DRM');
  const fireEnergy = card('Fire Energy SVE');
  x.owner.bench[0].cards.length = 0;
  x.owner.bench[0].cards.push(blaziken);
  x.owner.discard.cards.length = 0;
  x.owner.discard.cards.push(fireEnergy);

  const { UseAbilityAction } = loadNative('game/store/actions/game-actions');
  const { PlayerType, SlotType } = loadNative('game/store/actions/play-card-action');
  const { AttachEnergyPrompt } = loadNative('game/store/prompts/attach-energy-prompt');
  const originalPromptValidate = AttachEnergyPrompt.prototype.validate;
  const restore = installUnderworldDoorPsychicRecipientHook();

  try {
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate,
      'the Underworld hook must not replace the shared AttachEnergyPrompt prototype validator');

    x.store.dispatch(new UseAbilityAction(x.owner.id, 'Firestarter', {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
    }));
    let pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.equal(pending?.constructor.name, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));

    pending = x.state.prompts.find(prompt => prompt.result === undefined);
    assert.ok(pending instanceof AttachEnergyPrompt);
    assert.strictEqual(pending.cardList, x.owner.discard,
      'Firestarter must source its Energy from discard, not the Underworld hand');
    assert.equal(Object.prototype.hasOwnProperty.call(pending, 'validate'), false,
      'a non-Underworld prompt must retain the native inherited validator');

    const originalState = cloneNativeValidationGraph(x.state);
    const originalPromptGroups = x.store.promptItems.map(item => item.ids.slice());
    const rawFirestarterChoice = {
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 1 },
      index: 0
    };
    const projection = {
      promptProjection: {
        choices: [
          { token: 'prompt-0', kind: 'energy', label: 'Fire Energy SVE' },
          { token: 'prompt-1', kind: 'cancel', label: 'Cancel selection' }
        ],
        publicMetadata: {
          selectionType: 'energy-payment', energyCount: 1, count: 1, allowCancel: true
        }
      },
      choiceByToken: new Map([
        ['prompt-0', rawFirestarterChoice],
        ['prompt-1', null]
      ])
    };
    const prepared = dispatchPromptChoice({
      store: x.store, prompt: pending, state: x.state, actorSeat: 0,
      projection,
      decision: { kind: 'select-choices', tokens: ['prompt-0'] },
      native: { Store, ResolvePromptAction },
      dispatch: false,
      withValidationRandom: callback => callback()
    });

    assert.equal(prepared.validationReceipt?.schema,
      'agent6-cloned-store-prompt-validation-v1');
    assert.equal(prepared.validationReceipt?.promptDecodeValidated, true);
    assert.equal(prepared.validationReceipt?.clonedPromptResolved, true);
    assert.equal(prepared.validationReceipt?.nativeValidationStoreMode, 'cloned-store');
    assert.equal(prepared.validationReceipt?.fullOriginalStoreStateUnchanged, true);
    assert.deepEqual(x.state, originalState,
      'non-Underworld cloned prompt validation must not mutate the live Store state');
    assert.deepEqual(x.store.promptItems.map(item => item.ids), originalPromptGroups,
      'non-Underworld cloned prompt validation must preserve the live continuation queue');
    assert.equal(pending.result, undefined,
      'non-Underworld cloned prompt validation must leave the live prompt unresolved');
    assert.equal(x.owner.discard.cards.includes(fireEnergy), true);
    assert.equal(x.owner.bench[1].energies.cards.includes(fireEnergy), false);
    assert.equal(pending.validate([{
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 1 },
      card: fireEnergy
    }]), true, 'a native-valid non-Underworld Firestarter selection must remain valid');

    x.store.dispatch(prepared.action);
    assert.equal(x.owner.bench[1].energies.cards.includes(fireEnergy), true);
    assert.equal(x.owner.discard.cards.includes(fireEnergy), false);
    assert.equal(x.store.state.prompts.filter(prompt => prompt.result === undefined).length, 0);
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate);
  } finally {
    restore();
    assert.equal(restore.isRestored, true);
    assert.strictEqual(AttachEnergyPrompt.prototype.validate, originalPromptValidate);
  }
});
