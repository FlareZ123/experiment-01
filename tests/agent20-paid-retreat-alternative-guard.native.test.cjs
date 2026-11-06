'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { actorObservation } =
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const { buildActorCardCatalog } =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {
  proposeTwoUnitPaidRetreatV2,
} = require('../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs');
const {
  proposeGuardedTwoUnitPaidRetreatV2,
} = require('../simulation/twinleaf/agent20-paid-retreat-alternative-guard.cjs');

const OUT = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(OUT, name));
const PSY = 'Psychic Energy MEE';
const VMAX = 'Shadow Rider Calyrex VMAX CRE';

function stage({
  activeName = VMAX,
  activeVmax = true,
  bench0Name = 'Latias ex SSP',
  bench0Vmax = false,
  bench1Name = 'Girafarig LOT',
  opponentActiveName = 'Lunatone OBF',
  floatStoneInHand = false,
} = {}) {
  const manager = initializeCards();
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { CardList } = engine('game/store/state/card-list');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { GameSettings } = engine('game/core/game-settings');
  const { PokemonCard } = engine('game/store/card/pokemon-card');
  const { EnergyCard } = engine('game/store/card/energy-card');
  const {
    Stage,
    EnergyType,
    CardType,
    SpecialCondition,
    Format,
  } = engine('game/store/card/card-types');
  const { PowerType } = engine('game/store/card/pokemon-types');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');

  const catalog = buildActorCardCatalog(manager.getAllCards(), {
    PokemonCard,
    EnergyCard,
    Stage,
    EnergyType,
    CardType,
    PowerType,
    SpecialCondition,
  });
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 0;

  const owner = new Player();
  const opponent = new Player();
  owner.id = 101;
  opponent.id = 202;
  owner.name = 'agent20-retreat-guard-owner';
  opponent.name = 'agent20-retreat-guard-opponent';
  state.players = [owner, opponent];

  let nextId = 93000;
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Pinned native printing missing: ' + name);
    instance.id = nextId++;
    return instance;
  };
  const putVmax = slot => {
    slot.cards.push(card('Shadow Rider Calyrex V CRE'), card(VMAX));
  };
  const putSingle = (slot, name) => {
    slot.cards.push(card(name));
  };

  if (activeVmax) putVmax(owner.active);
  else putSingle(owner.active, activeName);

  const firstBench = new PokemonCardList();
  if (bench0Vmax) putVmax(firstBench);
  else putSingle(firstBench, bench0Name);

  const secondBench = new PokemonCardList();
  putSingle(secondBench, bench1Name);
  owner.bench = [firstBench, secondBench];
  putSingle(opponent.active, opponentActiveName);

  for (const player of state.players) {
    for (let i = 0; i < 15; i++) player.deck.cards.push(card(PSY));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card(PSY));
      player.prizes.push(prize);
    }
  }

  function attach(turn, slot, index = 0) {
    state.turn = turn;
    owner.hand.cards.push(card(PSY));
    store.dispatch(new PlayCardAction(owner.id, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot,
      index,
    }));
  }

  attach(20, SlotType.ACTIVE);
  attach(22, SlotType.ACTIVE);
  attach(24, SlotType.BENCH, 0);
  attach(26, SlotType.BENCH, 0);
  attach(28, SlotType.BENCH, 0);
  attach(30, SlotType.BENCH, 1);
  attach(32, SlotType.BENCH, 1);

  let floatStone = null;
  if (floatStoneInHand) {
    floatStone = card('Float Stone BKT');
    owner.hand.cards.push(floatStone);
  }

  state.turn = 34;
  return {
    store,
    state,
    owner,
    opponent,
    catalog,
    floatStone,
    activeBefore: owner.active,
    oldEnergy: [...owner.active.energies.cards],
  };
}

function resolveNoPaymentPrompts(game) {
  const { store, state } = game;
  const { ResolvePromptAction } =
    engine('game/store/actions/resolve-prompt-action');
  const seen = [];
  for (let i = 0; i < 25; i++) {
    const prompt = state.prompts.find(item => item.result === undefined);
    if (!prompt) break;
    const type = prompt.constructor.name;
    assert.equal(type, 'WaitPrompt',
      'A zero-Energy retreat must not request Energy cards');
    store.dispatch(new ResolvePromptAction(prompt.id, null));
    seen.push(type);
  }
  assert.equal(state.prompts.some(item => item.result === undefined), false,
    'No native prompt may remain unresolved');
  return seen;
}

function activePrinting(pokemon) {
  return pokemon.getPokemonCard()?.fullName ?? null;
}

test('native Float Stone alternative is detected before any Energy is spent', () => {
  const game = stage({ floatStoneInHand: true });
  const view = actorObservation(game.state, 0);
  const result = proposeGuardedTwoUnitPaidRetreatV2(view, game.catalog);

  assert.equal(proposeTwoUnitPaidRetreatV2(view, game.catalog)?.kind,
    'two-unit-paid-retreat-proposal-v2');
  assert.equal(result.proposal, null);
  assert.ok(result.assessment.reasons.includes(
    'held-float-stone-alternative-uncompared'));
  assert.deepEqual(view.ownHand, ['Float Stone BKT']);
});

test('native Store settles the Float Stone route without discarding the two Psychic Energy', () => {
  const game = stage({ floatStoneInHand: true });
  const { store, state, owner, floatStone, activeBefore, oldEnergy } = game;
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const { RetreatAction } =
    engine('game/store/actions/game-actions');

  store.dispatch(new PlayCardAction(owner.id, 0, {
    player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.ACTIVE,
    index: 0,
  }));
  assert.equal(owner.hand.cards.includes(floatStone), false);
  assert.equal(owner.active.tools.cards.includes(floatStone), true);

  store.dispatch(new RetreatAction(owner.id, 0));
  const prompts = resolveNoPaymentPrompts(game);

  assert.equal(owner.retreatedTurn, 34);
  assert.equal(activePrinting(owner.active), 'Latias ex SSP');
  assert.equal(owner.bench[0], activeBefore);
  assert.equal(owner.bench[0].tools.cards.includes(floatStone), true);
  assert.equal(owner.active.energies.cards.length, 3);
  assert.equal(owner.bench[0].energies.cards.length, 2);
  for (const energy of oldEnergy) {
    assert.equal(owner.bench[0].energies.cards.includes(energy), true);
    assert.equal(owner.discard.cards.includes(energy), false);
  }
  assert.deepEqual(prompts, []);
});

test('Latias Skyliner makes a Basic Active retreat free and the v2 paid proposal declines', () => {
  const game = stage({
    activeName: 'Mewtwo-EX BKT',
    activeVmax: false,
    bench0Name: VMAX,
    bench0Vmax: true,
    bench1Name: 'Latias ex SSP',
  });
  const { store, state, owner, activeBefore, oldEnergy } = game;
  const view = actorObservation(state, 0);
  const result = proposeGuardedTwoUnitPaidRetreatV2(view, game.catalog);
  const { RetreatAction } = engine('game/store/actions/game-actions');

  assert.equal(view.ownPublic.active.printed.stage, game.catalog.stages.BASIC);
  assert.equal(view.ownPublic.bench[1].abilityDetails.some(
    ability => ability.name === 'Skyliner'), true);
  assert.equal(proposeTwoUnitPaidRetreatV2(view, game.catalog), null);
  assert.equal(result.proposal, null);

  store.dispatch(new RetreatAction(owner.id, 0));
  resolveNoPaymentPrompts(game);

  assert.equal(owner.retreatedTurn, 34);
  assert.equal(activePrinting(owner.active), VMAX);
  assert.equal(owner.bench[0], activeBefore);
  assert.equal(owner.bench[0].energies.cards.length, 2);
  assert.equal(owner.active.energies.cards.length, 3);
  for (const energy of oldEnergy) {
    assert.equal(owner.bench[0].energies.cards.includes(energy), true);
    assert.equal(owner.discard.cards.includes(energy), false);
  }
});

test('Snorlax Block on the opponent Active blocks the proposal and native RetreatAction', () => {
  const game = stage({
    activeName: 'Mewtwo-EX BKT',
    activeVmax: false,
    bench0Name: VMAX,
    bench0Vmax: true,
    bench1Name: 'Girafarig LOT',
    opponentActiveName: 'Snorlax PGO 55',
  });
  const { store, state, owner, activeBefore } = game;
  const view = actorObservation(state, 0);
  const result = proposeGuardedTwoUnitPaidRetreatV2(view, game.catalog);
  const { RetreatAction } = engine('game/store/actions/game-actions');

  assert.equal(view.opponentPublic.active.abilityDetails.some(
    ability => ability.name === 'Block'), true);
  assert.equal(proposeTwoUnitPaidRetreatV2(view, game.catalog), null);
  assert.equal(result.proposal, null);

  let dispatchError = null;
  try {
    store.dispatch(new RetreatAction(owner.id, 0));
  } catch (error) {
    dispatchError = error;
  }

  assert.ok(dispatchError || owner.active === activeBefore,
    'Snorlax Block must prevent the owner Active from leaving the Active Spot');
  assert.equal(owner.active, activeBefore);
  assert.notEqual(owner.retreatedTurn, 34);
  assert.equal(state.prompts.some(item => item.result === undefined), false);
});
