'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { EXPECTED_ENGINE_PIN } =
  require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const { stage } =
  require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const { initializeCards } =
  require('../../simulation/twinleaf/headless.cjs');
const {
  projectPrompt, dispatchPromptChoice, resolveHostOnlyPrompt,
  PINNED_SHUFFLE_DECK_VALIDATION_HOOK
} = require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const repositoryRoot = path.resolve(__dirname, '../..');
const twinleafRoot = path.join(repositoryRoot, 'vendor/twinleaf');
const compiledSimulator = path.join(
  twinleafRoot,
  'ptcg-server/output/game/bots/simulator.js'
);

test('pinned Store retains grouped prompt continuations while State-only Simulator reconstruction is rejected', {
  skip: !fs.existsSync(compiledSimulator),
  timeout: 30000
}, () => {
  const { Simulator } =
    require('../../vendor/twinleaf/ptcg-server/output/game/bots/simulator');
  const { State, GamePhase } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
  const { Player } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/state/player');
  const { ConfirmPrompt } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/prompts/confirm-prompt');
  const { ResolvePromptAction } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const { GameError } =
    require('../../vendor/twinleaf/ptcg-server/output/game/game-error');

  const actualEnginePin = execFileSync(
    'git', ['-C', twinleafRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }
  ).trim();
  assert.equal(actualEnginePin, EXPECTED_ENGINE_PIN,
    'native prompt regression must run against the reviewed Twinleaf pin');

  const initial = new State();
  const firstPlayer = new Player();
  firstPlayer.id = 0;
  const secondPlayer = new Player();
  secondPlayer.id = 1;
  initial.players = [firstPlayer, secondPlayer];
  initial.activePlayer = 0;
  initial.phase = GamePhase.SETUP;
  initial.turn = 0;
  initial.prompts = [];

  const simulator = new Simulator(initial);
  const store = simulator.store;
  const state = store.state;

  const first = new ConfirmPrompt(firstPlayer.id, 'GO_FIRST');
  const second = new ConfirmPrompt(firstPlayer.id, 'GO_FIRST');
  const unrelated = new ConfirmPrompt(secondPlayer.id, 'GO_FIRST');
  let continuationCalls = 0;
  let continuationResults = null;

  store.prompt(state, [first, second], results => {
    continuationCalls += 1;
    continuationResults = results.slice();
  });
  store.prompt(state, unrelated, () => {});

  assert.deepEqual(store.promptItems.map(item => item.ids), [
    [first.id, second.id],
    [unrelated.id]
  ]);
  assert.throws(
    () => new Simulator(state),
    error => error instanceof GameError
  );

  store.dispatch(new ResolvePromptAction(first.id, true));
  assert.equal(continuationCalls, 0,
    'a grouped continuation must wait until every prompt in its group is resolved');
  assert.equal(first.result, true);
  assert.equal(second.result, undefined);

  store.dispatch(new ResolvePromptAction(second.id, false));
  assert.equal(continuationCalls, 1,
    'the original Store must invoke the registered continuation exactly once');
  assert.deepEqual(continuationResults, [true, false]);
  assert.deepEqual(store.promptItems.map(item => item.ids), [[unrelated.id]]);
  assert.equal(unrelated.result, undefined);
});


test('Quick Ball actor choice resumes its real effect in the same pinned Store', {
  skip: !fs.existsSync(compiledSimulator),
  timeout: 30000
}, () => {
  const actualEnginePin = execFileSync(
    'git', ['-C', twinleafRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }
  ).trim();
  assert.equal(actualEnginePin, EXPECTED_ENGINE_PIN,
    'real card-effect prompt regression must run against the reviewed Twinleaf pin');

  const fixture = stage(0);
  const { store, owner } = fixture;
  const manager = initializeCards();
  let nextCardId = 990000;
  const card = fullName => {
    const value = manager.getCardByName(fullName);
    assert.ok(value, 'missing pinned card ' + fullName);
    value.id = nextCardId++;
    return value;
  };

  const quickBall = card('Quick Ball FST');
  const discardCard = owner.hand.cards[0];
  const searchedBasic = card('Venonat MEW');
  owner.hand.cards.unshift(quickBall);
  owner.deck.cards.length = 0;
  owner.deck.cards.push(searchedBasic);
  for (let index = 0; index < 28; index += 1) {
    owner.deck.cards.push(card('Psychic Energy SVE'));
  }
  assert.equal(owner.deck.cards.length, 29,
    'Quick Ball fixture must exercise large-deck numeric shuffle validation');
  for (const slot of owner.bench) slot.cards.length = 0;
  owner.playableCardIds = [quickBall.id];
  owner.playableHandAbilityCardIds = [];

  const { PlayCardAction, PlayerType, SlotType } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const { Store } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/store');
  const { ResolvePromptAction } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const native = { Store, ResolvePromptAction };

  store.dispatch(new PlayCardAction(owner.id, 0, {
    player: PlayerType.ANY,
    slot: SlotType.BOARD,
    index: 0
  }));

  let state = store.state;
  let prompt = state.prompts.find(item => item.result === undefined);
  assert.ok(prompt, 'Quick Ball must create an actor-owned deck-search prompt');
  assert.equal(prompt.constructor.name, 'ChooseCardsPrompt');
  assert.equal(prompt.playerId, state.players[0].id);

  const provenanceHook = {
    getPromptProvenance(candidate) {
      if (candidate.id !== prompt.id) return null;
      const player = store.state.players[0];
      const sourceCard = [...player.supporter.cards, ...player.discard.cards]
        .find(item => item.id === quickBall.id);
      assert.ok(sourceCard, 'Quick Ball source must remain in an actor-visible zone');
      return {
        sourceKind: 'card-effect',
        sourceCard,
        effectName: 'Quick Ball'
      };
    }
  };
  const projection = projectPrompt({
    prompt, state, actorSeat: 0, native, store, provenanceHook
  });
  const choice = projection.promptProjection.choices.find(
    item => item.printing === searchedBasic.fullName
  );
  assert.ok(choice, 'the real deck-search prompt must project its Basic Pokémon choice');

  const decisionReceipt = dispatchPromptChoice({
    store, prompt, state, actorSeat: 0, projection,
    decision: { kind: 'select-choices', tokens: [choice.token] },
    native,
    withValidationRandom: callback => callback()
  });
  assert.equal(decisionReceipt.validationReceipt?.promptDecodeValidated, true);

  const hostPromptKinds = [];
  for (let index = 0; index < 8; index += 1) {
    state = store.state;
    prompt = state.prompts.find(item => item.result === undefined);
    if (!prompt) break;
    const kind = prompt.constructor.name;
    assert.ok(
      ['ShowCardsPrompt', 'ShuffleDeckPrompt', 'WaitPrompt'].includes(kind),
      'Quick Ball continuation produced an unexpected prompt: ' + kind
    );
    hostPromptKinds.push(kind);
    const resolution = resolveHostOnlyPrompt({
      prompt, state, store, native, physicalRandom: () => 0.5,
      enginePin: actualEnginePin
    });
    if (kind === 'ShuffleDeckPrompt') {
      assert.equal(resolution.rawResult.length, 28);
      assert.equal(resolution.summary.validationHookId,
        PINNED_SHUFFLE_DECK_VALIDATION_HOOK.id);
      assert.equal(resolution.summary.nativeValidatorResult, false,
        'the adapter hook must correct the pinned native lexicographic-sort rejection');
    }
  }

  state = store.state;
  assert.equal(store.hasPrompts(), false,
    'the Quick Ball effect and its host-only follow-up prompts must finish');
  assert.equal(store.promptItems.length, 0,
    'the original Store must retire the Quick Ball continuation group');
  assert.ok(hostPromptKinds.includes('ShuffleDeckPrompt'),
    'Quick Ball search must resume through its native deck-shuffle continuation');
  assert.ok(state.players[0].hand.cards.some(item => item.id === searchedBasic.id),
    'the selected Basic Pokémon must reach the hand after same-Store continuation');
  assert.ok(state.players[0].discard.cards.some(item => item.id === discardCard.id),
    'Quick Ball must complete its printed discard cost');
  assert.ok(!state.players[0].hand.cards.some(item => item.id === quickBall.id),
    'Quick Ball must no longer remain in hand after play');
});
