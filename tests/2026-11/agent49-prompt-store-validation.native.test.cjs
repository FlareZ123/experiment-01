'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

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
