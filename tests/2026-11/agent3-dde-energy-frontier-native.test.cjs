'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const frontierModule = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const adapterModule = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const {
  createValidationRandomScope,
  seededRandom,
  createStoreStateSnapshotter
} = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

const compiledActionEnumerator = path.join(
  __dirname,
  '../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js'
);

const DDE = 'Double Dragon Energy ROS';
const REGIDRAGO = 'Regidrago V SIT';
const KECLEON = 'Kecleon PLF';
const DEDENNE = 'Dedenne GX UNB';
const TAPU_LELE = 'Tapu Lele-GX GRI';

function makePokemonList(native, card = null) {
  const list = new native.PokemonCardList();
  list.cards = card ? [card] : [];
  list.hp = card?.hp ?? 0;
  list.damage = 0;
  list.energies.cards = [];
  list.tools = [];
  list.specialConditions = [];
  return list;
}

function makePlayer(native, id, activeCard, cloneCard) {
  const player = new native.Player();
  player.id = id;
  player.active = makePokemonList(native, activeCard);
  player.bench = Array.from({ length: 5 }, () => makePokemonList(native));
  player.prizes = Array.from({ length: 6 }, () => {
    const prize = new native.CardList();
    prize.cards = [cloneCard(REGIDRAGO)];
    return prize;
  });
  player.deck.cards = Array.from({ length: 30 }, () => cloneCard(REGIDRAGO));
  player.hand.cards = [];
  player.discard.cards = [];
  player.stadium.cards = [];
  player.lostzone.cards = [];
  player.supporter.cards = [];
  player.playableCardIds = [];
  player.playableHandAbilityCardIds = [];
  player.energyPlayedTurn = 0;
  player.supporterTurn = 0;
  player.canEvolve = false;
  player.stadiumAndToolHaveNoEffectTurnsRemaining = 0;
  return player;
}

function makeGameState({
  native,
  actorSeat,
  energyCard,
  cloneCard,
  withValidationRandom,
  actorActiveCard = REGIDRAGO,
  opponentActiveCard = REGIDRAGO
}) {
  const candidate = makePlayer(native, actorSeat, cloneCard(actorActiveCard), cloneCard);
  candidate.bench[0] = makePokemonList(native, cloneCard(DEDENNE));
  candidate.bench[1] = makePokemonList(native, cloneCard(TAPU_LELE));
  candidate.hand.cards = [energyCard];
  candidate.playableCardIds = [energyCard.id];

  const opponent = makePlayer(native, 1 - actorSeat, cloneCard(opponentActiveCard), cloneCard);
  const initialState = new native.State();
  initialState.players = actorSeat === 0 ? [candidate, opponent] : [opponent, candidate];
  initialState.activePlayer = actorSeat;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;

  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  return simulator.store.state;
}

test('pinned Store frontier keeps DDE-to-Dragon and rejects DDE-to-Dedenne/Tapu Lele in both physical seats', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24001)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 920000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  for (const actorSeat of [0, 1]) {
    const state = makeGameState({
      native,
      actorSeat,
      energyCard: cloneCard(DDE),
      cloneCard,
      withValidationRandom
    });
    const actor = state.players[actorSeat];
    const energy = actor.hand.cards[0];

    assert.equal(energy.fullName, DDE);
    assert.equal(energy.set, 'ROS');
    assert.equal(String(energy.setNumber), '97');

    const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
      native,
      enginePin
    });
    const candidates = enumerator.attachEnergyActions(state, actor);
    assert.equal(candidates.length, 3,
      'the uncapped adapter must propose one attachment to Active and each occupied Bench slot');

    const activeAction = candidates.find(action =>
      action.target.slot === native.SlotType.ACTIVE);
    const benchActions = candidates.filter(action =>
      action.target.slot === native.SlotType.BENCH)
      .sort((left, right) => left.target.index - right.target.index);
    assert.ok(activeAction, 'DDE-to-Active Regidrago action must be enumerated');
    assert.equal(benchActions.length, 2);
    assert.deepEqual(benchActions.map(action => action.target.index), [0, 1]);

    // Confirm the pinned Store itself accepts the Dragon recipient.
    const legalSimulator = withValidationRandom(() =>
      frontierModule.createIsolatedValidationSimulator(state, native));
    withValidationRandom(() => legalSimulator.store.dispatch(activeAction));
    assert.ok(legalSimulator.store.state.players[actorSeat].active.energies.cards.some(card =>
      card.fullName === DDE),
    'DDE must physically attach to the Dragon Regidrago');

    // Confirm both incompatible recipients fail with the pinned native GameError.
    for (const action of benchActions) {
      const rejectedSimulator = withValidationRandom(() =>
        frontierModule.createIsolatedValidationSimulator(state, native));
      assert.throws(
        () => withValidationRandom(() => rejectedSimulator.store.dispatch(action)),
        error => error instanceof native.GameError &&
          error.message === 'CANNOT_PLAY_THIS_CARD'
      );
      assert.equal(
        rejectedSimulator.store.state.players[actorSeat].hand.cards[0].fullName,
        DDE,
        'a rejected DDE attachment must leave the Energy in hand'
      );
      assert.equal(
        rejectedSimulator.store.state.players[actorSeat].bench[action.target.index].energies.cards.length,
        0
      );
    }

    // The production frontier must retain the legal action and discard only the
    // two exact DDE/non-Dragon candidates, while leaving the original Store graph
    // untouched.
    const snapshotStoreState = createStoreStateSnapshotter();
    const before = snapshotStoreState(state);
    const frontier = withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat,
        native,
        enumerator: { enumerate: () => candidates }
      }));

    assert.deepEqual(snapshotStoreState(state), before);
    assert.equal(frontier.diagnostics.enumeratedCount, 3);
    assert.equal(frontier.diagnostics.validatedCount, 1);
    assert.equal(frontier.diagnostics.rejectedCount, 2);
    assert.equal(frontier.diagnostics.preflightRejectedCount, 2);
    assert.equal(frontier.diagnostics.unsupportedCount, 0);
    assert.equal(frontier.diagnostics.truncated, false);
    assert.equal(frontier.diagnostics.omittedCount, 0);
    assert.equal(frontier.actionFrontier.items.length, 1);
    assert.equal(frontier.actionFrontier.items[0].actorPrinting, DDE);
    assert.equal(frontier.actionFrontier.items[0].targetPrinting, REGIDRAGO);
    assert.equal(frontier.actionFrontier.items[0].publicMetadata.targetSeat, 'actor');
    assert.equal(frontier.actionFrontier.items[0].publicMetadata.targetZone, 'active');
  }
});

test('pinned dynamic type check keeps DDE-to-Active Kecleon when opponent Active is Dragon in both seats', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24003)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 940000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  for (const actorSeat of [0, 1]) {
    const state = makeGameState({
      native,
      actorSeat,
      energyCard: cloneCard(DDE),
      cloneCard,
      withValidationRandom,
      actorActiveCard: KECLEON,
      opponentActiveCard: REGIDRAGO
    });
    const actor = state.players[actorSeat];
    const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
      native,
      enginePin
    });
    const candidates = enumerator.attachEnergyActions(state, actor);
    assert.equal(candidates.length, 3);
    const activeAction = candidates.find(action =>
      action.target.slot === native.SlotType.ACTIVE);
    assert.ok(activeAction, 'DDE-to-Active Kecleon action must be enumerated');

    // The pinned Store itself must accept Kecleon because its Active-only Color
    // Change Ability copies the opponent Active Regidrago's Dragon type.
    const legalSimulator = withValidationRandom(() =>
      frontierModule.createIsolatedValidationSimulator(state, native));
    withValidationRandom(() => legalSimulator.store.dispatch(activeAction));
    assert.ok(legalSimulator.store.state.players[actorSeat].active.energies.cards.some(card =>
      card.fullName === DDE),
    'DDE must attach to Active Kecleon when Color Change makes it Dragon');

    const snapshotStoreState = createStoreStateSnapshotter();
    const before = snapshotStoreState(state);
    const frontier = withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat,
        native,
        enumerator: { enumerate: () => candidates }
      }));

    assert.deepEqual(snapshotStoreState(state), before);
    assert.equal(frontier.diagnostics.enumeratedCount, 3);
    assert.equal(frontier.diagnostics.validatedCount, 1);
    assert.equal(frontier.diagnostics.rejectedCount, 2);
    assert.equal(frontier.diagnostics.preflightRejectedCount, 2);
    assert.equal(frontier.diagnostics.unsupportedCount, 0);
    assert.equal(frontier.actionFrontier.items.length, 1);
    assert.equal(frontier.actionFrontier.items[0].targetPrinting, KECLEON);
  }
});

test('pinned dynamic type check rejects DDE-to-Active Kecleon when opponent Active is non-Dragon in both seats', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24006)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 970000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  for (const actorSeat of [0, 1]) {
    const state = makeGameState({
      native,
      actorSeat,
      energyCard: cloneCard(DDE),
      cloneCard,
      withValidationRandom,
      actorActiveCard: KECLEON,
      opponentActiveCard: TAPU_LELE
    });
    // Preserve one legal Dragon recipient so the frontier contract still has
    // a supported action while Kecleon and the other Bench target are rejected.
    state.players[actorSeat].bench[0] = makePokemonList(native, cloneCard(REGIDRAGO));
    const actor = state.players[actorSeat];
    const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
      native,
      enginePin
    });
    const candidates = enumerator.attachEnergyActions(state, actor);
    assert.equal(candidates.length, 3);
    const activeAction = candidates.find(action =>
      action.target.slot === native.SlotType.ACTIVE);
    assert.ok(activeAction);

    // Kecleon copies the opponent Active's Psychic type here, so DDE is
    // genuinely illegal; the native Store and frontier must both reject it.
    const nativeSimulator = withValidationRandom(() =>
      frontierModule.createIsolatedValidationSimulator(state, native));
    assert.throws(
      () => withValidationRandom(() => nativeSimulator.store.dispatch(activeAction)),
      error => error instanceof native.GameError &&
        error.message === 'CANNOT_PLAY_THIS_CARD'
    );

    const frontier = withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat,
        native,
        enumerator: { enumerate: () => candidates }
      }));
    assert.equal(frontier.diagnostics.enumeratedCount, 3);
    assert.equal(frontier.diagnostics.validatedCount, 1);
    assert.equal(frontier.diagnostics.rejectedCount, 2);
    assert.equal(frontier.diagnostics.preflightRejectedCount, 2);
    assert.equal(frontier.diagnostics.unsupportedCount, 0);
    assert.equal(frontier.actionFrontier.items.length, 1);
    assert.equal(frontier.actionFrontier.items[0].targetPrinting, REGIDRAGO);
  }
});

test('exact DDE preflight fails closed on opponent-owned target descriptors', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24005)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 960000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  const state = makeGameState({
    native,
    actorSeat: 0,
    energyCard: cloneCard(DDE),
    cloneCard,
    withValidationRandom
  });
  const actor = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
    native,
    enginePin
  });
  const activeAction = enumerator.attachEnergyActions(state, actor).find(action =>
    action.target.slot === native.SlotType.ACTIVE);
  assert.ok(activeAction);
  const originalPlayer = activeAction.target.player;
  activeAction.target.player = native.PlayerType.TOP_PLAYER;

  assert.throws(
    () => withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat: 0,
        native,
        enumerator: { enumerate: () => [activeAction] }
      })),
    /must belong to the acting player/
  );
  activeAction.target.player = originalPlayer;
});

test('same-message CANNOT_PLAY_THIS_CARD from DDE to a legal Dragon target remains fatal', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24004)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 950000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  const state = makeGameState({
    native,
    actorSeat: 0,
    energyCard: cloneCard(DDE),
    cloneCard,
    withValidationRandom
  });
  const actor = state.players[0];
  // The target is a legal Dragon. Inject the same GameError from the DDE
  // reducer's AttachEnergyEffect path to prove it is never downgraded.
  actor.hand.cards[0].reduceEffect = (store, validationState, effect) => {
    if (effect?.type === 'ATTACH_ENERGY_EFFECT') {
      throw new native.GameError('CANNOT_PLAY_THIS_CARD');
    }
    return validationState;
  };
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
    native,
    enginePin
  });
  const candidates = enumerator.attachEnergyActions(state, actor);
  const activeAction = candidates.find(action =>
    action.target.slot === native.SlotType.ACTIVE);
  assert.ok(activeAction);

  assert.throws(
    () => withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat: 0,
        native,
        enumerator: { enumerate: () => [activeAction] }
      })),
    error => error instanceof native.GameError &&
      error.message === 'CANNOT_PLAY_THIS_CARD'
  );
});

test('CANNOT_PLAY_THIS_CARD from a non-DDE Energy reducer remains a fatal frontier error', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24002)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 930000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  const ordinaryEnergyDefinition = manager.getAllCards().find(card =>
    card instanceof native.EnergyCard && card.fullName !== DDE);
  assert.ok(ordinaryEnergyDefinition, 'pinned card pool must contain another Energy printing');
  const ordinaryEnergy = cloneCard(ordinaryEnergyDefinition.fullName);
  const state = makeGameState({
    native,
    actorSeat: 0,
    energyCard: ordinaryEnergy,
    cloneCard,
    withValidationRandom
  });
  const actor = state.players[0];
  // Inject the control failure after Simulator construction so only the
  // cloned Store's actual AttachEnergyEffect dispatch can raise this error.
  actor.hand.cards[0].reduceEffect = (store, validationState, effect) => {
    if (effect?.type === 'ATTACH_ENERGY_EFFECT') {
      throw new native.GameError('CANNOT_PLAY_THIS_CARD');
    }
    return validationState;
  };
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
    native,
    enginePin
  });
  const candidates = enumerator.attachEnergyActions(state, actor);
  assert.equal(candidates.length, 3);

  assert.throws(
    () => withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat: 0,
        native,
        enumerator: { enumerate: () => [candidates[0]] }
      })),
    error => error instanceof native.GameError &&
      error.message === 'CANNOT_PLAY_THIS_CARD'
  );
});


test('DDE dynamic-type probe mutates only its throwaway clone, not the candidate-validation clone', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24007)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 990000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  const state = makeGameState({
    native,
    actorSeat: 0,
    energyCard: cloneCard(DDE),
    cloneCard,
    withValidationRandom
  });
  const originalTypes = [...state.players[0].bench[0].cards[0].cardType];
  assert.ok(!originalTypes.includes(native.CardType.FIGHTING),
    'Dedenne control target must not start with Fighting type');
  const actor = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
    native,
    enginePin
  });
  const candidateActions = enumerator.attachEnergyActions(state, actor);
  const benchAction = candidateActions.find(action =>
    action.target.slot === native.SlotType.BENCH && action.target.index === 0);
  const activeAction = candidateActions.find(action =>
    action.target.slot === native.SlotType.ACTIVE);
  assert.ok(benchAction, 'DDE-to-Dedenne Bench action must be enumerated');
  assert.ok(activeAction, 'DDE-to-Dragon Active control must be enumerated');

  const simulators = [];
  let pushedTypeChecks = 0;
  const BaseSimulator = native.Simulator;
  class TrackingSimulator extends BaseSimulator {
    constructor(validationState) {
      super(validationState);
      const simulatorIndex = simulators.length;
      simulators.push(this);
      // The first candidate's throwaway probe is Simulator #2 (index 1).
      // Inject a push there only; its candidate-validation clone must remain
      // untouched, and the later legal Active control uses the native reducer.
      if (simulatorIndex === 1) {
        const reduceEffect = this.store.reduceEffect.bind(this.store);
        this.store.reduceEffect = (stateForEffect, effect) => {
          const result = reduceEffect(stateForEffect, effect);
          if (effect instanceof native.CheckPokemonTypeEffect) {
            // Mimic the pinned push-based type reducers: cardTypes aliases the
            // target PokemonCard.cardType array, so a push mutates that clone.
            effect.cardTypes.push(native.CardType.FIGHTING);
            pushedTypeChecks += 1;
          }
          return result;
        };
      }
    }
  }
  const instrumentedNative = Object.create(native);
  instrumentedNative.Simulator = TrackingSimulator;

  const before = createStoreStateSnapshotter()(state);
  const frontier = withValidationRandom(() =>
    frontierModule.buildNativeActionFrontier({
      state,
      actorSeat: 0,
      native: instrumentedNative,
      enumerator: { enumerate: () => [benchAction, activeAction] }
    }));

  assert.equal(simulators.length, 4,
    'each DDE candidate needs a candidate-validation Simulator and a separate probe Simulator');
  assert.equal(pushedTypeChecks, 1,
    'the throwaway probe must execute the dynamic-type effect exactly once');
  assert.deepEqual(
    simulators[0].store.state.players[0].bench[0].cards[0].cardType,
    originalTypes,
    'the candidate-validation clone must not receive the probe reducer push'
  );
  assert.ok(
    simulators[1].store.state.players[0].bench[0].cards[0].cardType.includes(native.CardType.FIGHTING),
    'the push-based type probe must mutate only its throwaway clone'
  );
  assert.deepEqual(createStoreStateSnapshotter()(state), before,
    'neither clone may mutate the original live Store graph');
  assert.equal(frontier.diagnostics.preflightRejectedCount, 1);
  assert.equal(frontier.actionFrontier.items.length, 1,
    'the legal DDE-to-Dragon Active control must remain in the frontier');
});

test('DDE dynamic-type preflight rejects unknown non-empty CardType results', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24008)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 1000000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  const state = makeGameState({
    native,
    actorSeat: 0,
    energyCard: cloneCard(DDE),
    cloneCard,
    withValidationRandom
  });
  const actor = state.players[0];
  const activeAction = adapterModule.createKnownCapFreeActionEnumerator({
    native,
    enginePin
  }).attachEnergyActions(state, actor).find(action =>
    action.target.slot === native.SlotType.ACTIVE);
  assert.ok(activeAction, 'DDE-to-Dragon Active action must be enumerated');

  const malformedNative = Object.create(native);
  malformedNative.CheckPokemonTypeEffect = class extends native.CheckPokemonTypeEffect {
    constructor(target) {
      super(target);
      this.cardTypes = [999];
    }
  };
  assert.throws(
    () => withValidationRandom(() =>
      frontierModule.buildNativeActionFrontier({
        state,
        actorSeat: 0,
        native: malformedNative,
        enumerator: { enumerate: () => [activeAction] }
      })),
    /only valid numeric CardType enum values/
  );
});


test('pinned DDE host-type-change discard runs after a native Switch prompt in both physical seats', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0xdde24009)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 1010000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  for (const kecleonSeat of [0, 1]) {
    const switcherSeat = 1 - kecleonSeat;
    const initialState = makeGameState({
      native,
      actorSeat: kecleonSeat,
      energyCard: cloneCard(DDE),
      cloneCard,
      withValidationRandom,
      actorActiveCard: KECLEON,
      opponentActiveCard: REGIDRAGO
    });
    const initialSwitcher = initialState.players[switcherSeat];
    initialSwitcher.bench[0] = makePokemonList(native, cloneCard(DEDENNE));
    const switchCard = cloneCard('Switch BS');
    const switchCardId = switchCard.id;
    initialSwitcher.hand.cards = [switchCard];
    initialSwitcher.playableCardIds = [switchCardId];

    // Keep a real Store so both the Energy attachment and the opponent's
    // Switch/ChoosePokemonPrompt chain pass through pinned native reducers.
    const simulator = withValidationRandom(() => new native.Simulator(initialState));
    const store = simulator.store;
    let state = store.state;
    let owner = state.players[kecleonSeat];
    let switcher = state.players[switcherSeat];
    const ddeId = owner.hand.cards[0].id;
    assert.equal(owner.hand.cards[0].fullName, DDE);
    assert.equal(switcher.active.cards[0].fullName, REGIDRAGO);

    const enumerator = adapterModule.createKnownCapFreeActionEnumerator({
      native,
      enginePin
    });
    const attachAction = enumerator.attachEnergyActions(state, owner).find(action =>
      action.target.slot === native.SlotType.ACTIVE);
    assert.ok(attachAction, 'DDE-to-Active Kecleon action must be enumerated');
    withValidationRandom(() => store.dispatch(attachAction));

    state = store.state;
    owner = state.players[kecleonSeat];
    switcher = state.players[switcherSeat];
    let host = owner.active;
    assert.ok(host.cards.some(card => card.id === ddeId),
      'legal DDE attachment must enter the host main card list');
    assert.ok(host.energies.cards.some(card => card.id === ddeId),
      'legal DDE attachment must enter the host Energy list');
    const initialType = new native.CheckPokemonTypeEffect(host);
    store.reduceEffect(state, initialType);
    assert.ok(initialType.cardTypes.includes(native.CardType.DRAGON),
      'Active Kecleon must copy the opposing Regidrago Dragon type');

    // End the Kecleon owner's turn through the native action reducer. DDE
    // must remain attached while the opposing Active is still Regidrago.
    store.dispatch(new native.gameActions.PassTurnAction(owner.id));
    let waitPromptsResolved = 0;
    while (true) {
      const waitPrompt = store.state.prompts.find(prompt => prompt.result === undefined);
      if (waitPrompt === undefined) {
        break;
      }
      assert.equal(waitPrompt.type, 'WaitPrompt',
        'turn transition should expose only its native silent WaitPrompt');
      store.dispatch(new native.ResolvePromptAction(waitPrompt.id, null));
      waitPromptsResolved += 1;
      assert.ok(waitPromptsResolved <= 4,
        'native turn transition must settle within four WaitPrompts');
    }
    state = store.state;
    owner = state.players[kecleonSeat];
    switcher = state.players[switcherSeat];
    assert.equal(state.activePlayer, switcherSeat);
    assert.equal(state.phase, native.GamePhase.PLAYER_TURN);
    assert.ok(owner.active.cards.some(card => card.id === ddeId),
      'DDE must remain attached while Kecleon still copies Dragon');

    // Play the real Switch Item and resolve its native ChoosePokemonPrompt.
    const switchIndex = switcher.hand.cards.findIndex(card => card.id === switchCardId);
    assert.ok(switchIndex >= 0, 'Switch must remain in the opponent hand');
    assert.ok(switcher.hand.cards[switchIndex] instanceof native.TrainerCard,
      'Switch printing must remain a native TrainerCard after Simulator cloning');
    assert.ok(switcher.bench[0].cards.length > 0,
      'the Switch player must have a legal Bench target');
    assert.equal(state.phase, native.GamePhase.PLAYER_TURN,
      'the native PassTurnAction must leave the opponent in its Player Turn');
    switcher.playableCardIds = [switchCardId];
    const switchAction = new native.cardActions.PlayCardAction(
      switcher.id,
      switchIndex,
      {
        player: native.PlayerType.BOTTOM_PLAYER,
        slot: native.SlotType.ACTIVE,
        index: 0
      }
    );
    assert.ok(switchAction instanceof native.cardActions.PlayCardAction);
    store.dispatch(switchAction);
    state = store.state;
    const unresolvedPrompts = state.prompts.filter(prompt => prompt.result === undefined);
    assert.equal(unresolvedPrompts.length, 1,
      'native Switch must open exactly one unresolved ChoosePokemonPrompt');
    const prompt = unresolvedPrompts[0];
    assert.equal(prompt.type, 'Choose pokemon');
    const chosenBenchPokemon = state.players[switcherSeat].bench[0];
    assert.equal(chosenBenchPokemon.cards[0].fullName, DEDENNE);
    store.dispatch(new native.ResolvePromptAction(prompt.id, [chosenBenchPokemon]));

    state = store.state;
    owner = state.players[kecleonSeat];
    switcher = state.players[switcherSeat];
    host = owner.active;
    assert.equal(state.prompts.filter(prompt => prompt.result === undefined).length, 0,
      'the native Switch prompt chain must settle before the state check');
    assert.ok(switcher.active.cards.some(card => card.fullName === DEDENNE),
      'the opponent must finish with the non-Dragon Dedenne Active');
    assert.ok(switcher.bench.some(slot =>
      slot.cards.some(card => card.fullName === REGIDRAGO)),
    'Regidrago must have moved to the Bench');

    const finalType = new native.CheckPokemonTypeEffect(host);
    store.reduceEffect(state, finalType);
    assert.ok(finalType.cardTypes.includes(native.CardType.LIGHTNING),
      'Active Kecleon must now copy Dedenne Lightning type');
    assert.ok(!finalType.cardTypes.includes(native.CardType.DRAGON),
      'the host must no longer be Dragon after the native Active switch');
    assert.ok(owner.discard.cards.some(card => card.id === ddeId),
      'CheckTableStateEffect must move DDE to its owner discard');
    assert.ok(!host.cards.some(card => card.id === ddeId),
      'discarded DDE must leave the host main card list');
    assert.ok(!host.energies.cards.some(card => card.id === ddeId),
      'discarded DDE must leave the host Energy list');
  }
});
