'use strict';

// Exact pinned Twinleaf Store: source 60 Articuno-GX CES hand play -> native
// ConfirmPrompt -> MoveEnergyPrompt -> Cold Crush-GX, both actor seats.
// A constructed legal board, NOT a full competitive game or win-rate sample.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../../simulation/twinleaf/headless.cjs');
const { installArticunoZeroMovementPromptHook } =
  require('../../simulation/twinleaf/articuno-zero-movement-prompt-hook.cjs');
const { installPromptProvenanceHook } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-provenance.cjs');
const { projectPrompt, dispatchPromptChoice } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const worker = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const out = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = subpath => require(path.join(out, subpath));
const { Store } = native('game/store/store');
const { State, GamePhase } = native('game/store/state/state');
const { Player } = native('game/store/state/player');
const { PokemonCardList } = native('game/store/state/pokemon-card-list');
const { CardList } = native('game/store/state/card-list');
const { Format } = native('game/store/card/card-types');
const { PlayCardAction, PlayerType, SlotType } = native('game/store/actions/play-card-action');
const { ResolvePromptAction } = native('game/store/actions/resolve-prompt-action');
const { AttackAction } = native('game/store/actions/game-actions');
const { ActionEnumerator } = native('advanced-bot/action-enumerator');
const { PokemonCard } = native('game/store/card/pokemon-card');
const { EnergyCard } = native('game/store/card/energy-card');
const { TrainerCard } = native('game/store/card/trainer-card');
const { buildNativeActionFrontier, selectedNativeAction } =
  require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const { createKnownCapFreeActionEnumerator, assertKnownCapFreeAdapterAdmissionClear } =
  require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const { Simulator } = native('game/bots/simulator');
const { GameError } = native('game/game-error');
const { CheckPokemonTypeEffect } = native('game/store/effects/check-effects');
const { StateUtils } = native('game/store/state-utils');
const cardActions = native('game/store/actions/play-card-action');
const gameActions = native('game/store/actions/game-actions');
const { Stage, TrainerType, SpecialCondition, EnergyType, CardType, SuperType } =
  native('game/store/card/card-types');
const originalRank3 = require('../../results/aichi-2026/full-decklists.json').decks
  .find(entry => entry.rank === 3);
const { resolvePrintedDeck } = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');


const bindings = { Store, PlayerType, SlotType, ResolvePromptAction };
function fixture(seat) {
  const manager = initializeCards();
  let id = 200;
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Pinned print unavailable: ' + name);
    instance.id = id++;
    return instance;
  };
  const actor = new Player();
  const opponent = new Player();
  actor.id = 801; opponent.id = 802;
  actor.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  opponent.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  const before = card('Bunnelby PRC');
  const water = card('Water Energy SVE');
  actor.active.cards.push(before, water);
  actor.active.energies.cards.push(water);
  const articuno = card('Articuno-GX CES');
  actor.hand.cards.push(articuno);
  opponent.active.cards.push(card('Regidrago V SIT'));
  for (let i = 0; i < 3; i += 1) {
    const grass = card('Grass Energy SVE');
    opponent.active.cards.push(grass);
    opponent.active.energies.cards.push(grass);
  }
  const state = new State();
  state.players = seat === 0 ? [actor, opponent] : [opponent, actor];
  state.activePlayer = seat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  for (const player of state.players) {
    for (let i = 0; i < 12; i += 1) player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const store = new Store({ onStateChange() {} });
  store.state = state;
  const provenanceHook = installPromptProvenanceHook(store);
  return { store, actor, opponent, before, water, articuno, provenanceHook, seat };
}
function pending(scene) {
  return scene.store.state.prompts.find(prompt => prompt.result === undefined);
}
function request(scene, projection) {
  const phase = projection.promptProjection.promptType;
  const active = scene.actor.active.getPokemonCard();
  const benched = scene.actor.bench
    .filter(slot => slot.getPokemonCard())
    .map(slot => ({
      printing: slot.getPokemonCard().fullName,
      energies: slot.energies.cards.map(card => card.fullName)
    }));
  const ownPublic = {
    active: { printing: active.fullName, energies: scene.actor.active.energies.cards.map(card => card.fullName) },
    bench: benched,
    publicTurnRestrictions: { gxUsed: scene.actor.usedGX === true }
  };
  const opponentPublic = {
    active: {
      printing: scene.opponent.active.getPokemonCard().fullName,
      energies: scene.opponent.active.energies.cards.map(card => card.fullName)
    },
    bench: []
  };
  return {
    role: 'opponent', seat: scene.seat,
    observation: {
      actorSeat: scene.seat, globalTurn: 4, decisionKind: 'owner-prompt',
      pendingPromptType: phase, ownHand: scene.actor.hand.cards.map(card => card.fullName),
      ownTurnResources: { gxUsed: scene.actor.usedGX === true },
      ownPublic, opponentPublic
    },
    prompt: projection.promptProjection, actionFrontier: { items: [] }
  };
}
function projectAndDecide(scene) {
  const prompt = pending(scene);
  assert.ok(prompt, 'Pinned source did not generate a new native prompt');
  const projection = projectPrompt({
    prompt, state: scene.store.state,
    actorSeat: scene.seat, native: bindings, store: scene.store,
    provenanceHook: scene.provenanceHook
  });
  assert.equal(projection.hostOnly, false);
  const decision = worker.createPolicy({
    role: 'opponent', seat: scene.seat,
    policyVersion: worker.POLICY_VERSION, config: {}
  }).decide(request(scene, projection));
  protocol.validateDecision(decision, projection.promptProjection, new Set());
  return { prompt, projection, decision };
}

for (const seat of [0, 1]) {
  for (const optionalZeroHook of [false, true]) {
    test('pinned native Articuno strict V3 transfer and Cold Crush, seat ' + seat +
         ', zeroHook=' + optionalZeroHook, () => {
      const scene = fixture(seat);
      const restore = optionalZeroHook ? installArticunoZeroMovementPromptHook() : null;
      try {
        const playIndex = scene.actor.hand.cards.indexOf(scene.articuno);
        scene.store.dispatch(new PlayCardAction(scene.actor.id, playIndex, {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
        }));
        const confirm = projectAndDecide(scene);
        assert.equal(confirm.prompt.constructor.name, 'ConfirmPrompt');
        assert.equal(confirm.decision.kind, 'select-choice');
        assert.equal(confirm.projection.choiceByToken.get(confirm.decision.token), true,
          'Actual Articuno Confirm declined: ' + JSON.stringify({
            source: confirm.projection.promptProjection.source,
            observed: request(scene, confirm.projection).observation,
            decision: confirm.decision
          }));
        dispatchPromptChoice({
          store: scene.store, prompt: confirm.prompt,
          state: scene.store.state, actorSeat: seat,
          projection: confirm.projection, decision: confirm.decision,
          native: bindings
        });
        assert.equal(scene.actor.active.getPokemonCard(), scene.articuno);
        assert.equal(scene.actor.bench[0].getPokemonCard(), scene.before);

        const move = projectAndDecide(scene);
        assert.equal(move.prompt.constructor.name, 'MoveEnergyPrompt');
        assert.equal(move.prompt.options.min, optionalZeroHook ? 0 : 1);
        assert.equal(move.decision.kind, 'select-choices');
        assert.equal(move.decision.tokens.length, 1);
        assert.equal(move.projection.choiceByToken.get(move.decision.tokens[0]).index, 1,
          'native transfer must index the full physical card list, not energy subset');
        assert.deepEqual(move.projection.promptProjection.choices
          .filter(choice => choice.kind === 'energy')
          .map(choice => choice.printing), ['Water Energy SVE']);
        const resolved = dispatchPromptChoice({
          store: scene.store, prompt: move.prompt,
          state: scene.store.state, actorSeat: seat,
          projection: move.projection, decision: move.decision,
          native: bindings
        });
        assert.equal(resolved.decoded.length, 1);
        assert.equal(scene.actor.active.energies.cards.includes(scene.water), true);
        assert.equal(scene.actor.bench[0].energies.cards.includes(scene.water), false);

        scene.store.dispatch(new AttackAction(scene.actor.id, 'Cold Crush-GX'));
        assert.equal(scene.actor.usedGX, true);
        assert.equal(scene.actor.active.energies.cards.length, 0);
        assert.equal(scene.opponent.active.energies.cards.length, 0);
        assert.equal(scene.actor.discard.cards.includes(scene.water), true);
      } finally {
        scene.provenanceHook.restore();
        if (restore) restore();
      }
    });
  }
}


// This extends the proven native continuation backward to a *real native*
// root action choice. The source-manifest cards are original Aichi rank 3;
// the constructed physical setup is not an original-60 deal or a full game.
// The full root frontier is admitted through the pinned cloned-Store adapter; Handiwork is a genuine competing Supporter.
for (const seat of [0, 1]) {
  test('native rank-3 full-root Articuno beats Handiwork/attack, then resolves GX, seat ' + seat, () => {
    assert.equal(originalRank3.cards.find(row => row.name === 'Articuno-GX')?.count, 1);
    assert.equal(originalRank3.cards.find(row => row.name === "Team Rocket's Handiwork")?.count, 1);
    const scene = fixture(seat);
    try {
      const handiwork = initializeCards().getCardByName("Team Rocket's Handiwork FCO");
      assert.ok(handiwork, 'original rank-3 Handiwork not loaded by pinned engine');
      handiwork.id = 910 + seat;
      scene.actor.hand.cards.push(handiwork);
      // Run the same reviewed uncapped source enumerator plus cloned-Store
      // legality filter as the V3 fixture host. Do not cherry-pick two hand
      // plays while silently hiding attacks, passes, or other legal actions.
      const nativeBindings = {
        ActionEnumerator, Simulator, cardActions, gameActions,
        PokemonCard, TrainerCard, EnergyCard, PlayerType, SlotType,
        Stage, TrainerType, SpecialCondition, EnergyType, CardType,
        SuperType, GameError, CheckPokemonTypeEffect, StateUtils
      };
      const enumerator = createKnownCapFreeActionEnumerator({
        native: nativeBindings,
        enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
      });
      const admitted = buildNativeActionFrontier({
        state: scene.store.state, actorSeat: seat,
        native: nativeBindings, enumerator
      });
      assertKnownCapFreeAdapterAdmissionClear({
        enumerator, enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
        frontierDiagnostics: admitted.diagnostics
      });
      const frontier = admitted.actionFrontier;
      const items = frontier.items;
      const tokens = protocol.validateFrontier(frontier);
      assert.ok(items.some(item => item.actorPrinting === 'Articuno-GX CES' &&
        item.kind === 'play-card'), 'physical Articuno action was omitted');
      assert.ok(items.some(item => item.actorPrinting === "Team Rocket's Handiwork FCO" &&
        item.kind === 'play-card'), 'legal competing Handiwork action was omitted');
      assert.ok(items.some(item => item.kind === 'pass'), 'full native frontier lacks pass');
      const observation = {
        actorSeat: seat, globalTurn: 4, decisionKind: 'owner-root',
        ownHand: scene.actor.hand.cards.map(card => card.fullName),
        ownTurnResources: { supporterPlayedTurn: 0, gxUsed: false },
        ownPublic: {
          active: {
            printing: scene.before.fullName,
            energies: scene.actor.active.energies.cards.map(card => card.fullName)
          },
          bench: [], discard: [], stadium: [],
          publicTurnRestrictions: { gxUsed: false }
        },
        opponentPublic: {
          active: {
            printing: scene.opponent.active.getPokemonCard().fullName,
            energies: scene.opponent.active.energies.cards.map(card => card.fullName)
          },
          bench: [], deckCount: scene.opponent.deck.cards.length, prizeCount: 6
        }
      };
      const decision = worker.createPolicy({
        role: 'opponent', seat, policyVersion: worker.POLICY_VERSION, config: {}
      }).decide({
        role: 'opponent', seat, observation, prompt: null, actionFrontier: frontier
      });
      protocol.validateDecision(decision, null, tokens);
      const selected = items.find(item => item.token === decision.token);
      assert.ok(selected, 'root worker selected an unoffered native token');
      assert.equal(selected.actorPrinting, 'Articuno-GX CES',
        'full-frontier root must prefer payable Cold Crush-GX over Handiwork / attack / pass');
      scene.store.dispatch(selectedNativeAction(admitted, decision.token));

      const confirm = projectAndDecide(scene);
      assert.equal(confirm.projection.choiceByToken.get(confirm.decision.token), true);
      dispatchPromptChoice({
        store: scene.store, prompt: confirm.prompt, state: scene.store.state,
        actorSeat: seat, projection: confirm.projection, decision: confirm.decision,
        native: bindings
      });
      assert.equal(scene.actor.active.getPokemonCard(), scene.articuno);
      const move = projectAndDecide(scene);
      assert.equal(move.prompt.constructor.name, 'MoveEnergyPrompt');
      assert.equal(move.decision.kind, 'select-choices');
      assert.equal(move.decision.tokens.length, 1);
      assert.equal(move.projection.choiceByToken.get(move.decision.tokens[0]).index, 1);
      dispatchPromptChoice({
        store: scene.store, prompt: move.prompt, state: scene.store.state,
        actorSeat: seat, projection: move.projection, decision: move.decision,
        native: bindings
      });
      assert.ok(scene.actor.active.energies.cards.includes(scene.water));
      scene.store.dispatch(new AttackAction(scene.actor.id, 'Cold Crush-GX'));
      assert.equal(scene.actor.usedGX, true);
      assert.equal(scene.actor.active.energies.cards.length, 0);
      assert.equal(scene.opponent.active.energies.cards.length, 0);
      assert.ok(scene.actor.discard.cards.includes(scene.water));
    } finally {
      scene.provenanceHook.restore();
    }
  });
}


// A second constructed root test starts from a complete exact 60-card actor
// inventory reconstructed from the *immutable* published rank-3 rows. Unlike
// the early four-card tactical fixture, all 60 owner cards are physical,
// unique instances; their locations (midgame Active/hand/deck/prizes) are
// constructed, not the result of an original-source shuffled deal.
// The opponent remains a constructed Regidrago board; this is NOT a game.
function exactRank3PhysicalScene(seat) {
  const scene = fixture(seat);
  const manager = initializeCards();
  const resolved = resolvePrintedDeck(originalRank3, manager.getAllCards(), {
    label: 'exact Aichi original rank-3 actor 60'
  });
  assert.equal(resolved.total, 60);
  assert.deepEqual(resolved.categoryCounts, { Pokémon: 11, Trainer: 44, Energy: 5 });
  const pool = new Map();
  const allPhysical = [];
  let uniqueId = 10000 + 100 * seat;
  for (const row of resolved.resolvedRows) {
    const copies = [];
    for (let i = 0; i < row.count; i += 1) {
      const card = manager.getCardByName(row.engineFullName);
      assert.ok(card, 'source resolver failed physical materialization: ' + row.name);
      card.id = uniqueId++;
      copies.push(card);
      allPhysical.push(card);
    }
    assert.equal(pool.has(row.name), false, 'rank-3 original source duplicate row');
    pool.set(row.name, copies);
  }
  const take = name => {
    const card = pool.get(name)?.shift();
    assert.ok(card, 'rank-3 original physical card not available: ' + name);
    return card;
  };
  const before = take('Bunnelby');
  const water = take('Water Energy');
  const articuno = take('Articuno-GX');
  const hand = [
    articuno, take("Team Rocket's Handiwork"), take('Arven'),
    take('Plumeria'), take('Nest Ball'), take('Capture Energy'),
    take('Water Energy')
  ];
  const remaining = Array.from(pool.values()).flat();
  assert.equal(remaining.length, 51);
  const prizes = remaining.splice(0, 6).map(prize => {
    const slot = new CardList();
    slot.cards.push(prize);
    return slot;
  });
  assert.equal(remaining.length, 45);
  scene.actor.active.cards = [before, water];
  scene.actor.active.energies.cards = [water];
  scene.actor.hand.cards = hand;
  scene.actor.prizes = prizes;
  scene.actor.deck.cards = remaining;
  scene.before = before;
  scene.water = water;
  scene.articuno = articuno;
  scene.originalResolved = resolved;
  scene.originalPhysicalCards = allPhysical;
  return scene;
}
function ownerPhysicalCards(actor) {
  return [
    ...actor.active.cards,
    ...actor.bench.flatMap(slot => slot.cards),
    ...actor.hand.cards,
    ...actor.deck.cards,
    ...actor.discard.cards,
    ...actor.lostzone.cards,
    ...actor.stadium.cards,
    ...actor.supporter.cards,
    ...actor.prizes.flatMap(slot => slot.cards)
  ];
}
function assertExactRank3PhysicalConservation(scene) {
  const physical = ownerPhysicalCards(scene.actor);
  assert.equal(physical.length, 60, 'original actor inventory missing/duplicated card');
  assert.equal(new Set(physical).size, 60, 'original actor inventory duplicated object identity');
  assert.deepEqual(
    physical.map(card => card.fullName).sort(),
    scene.originalResolved.fullNames.slice().sort(),
    'original actor 60-card exact source/proxy multiset changed'
  );
  assert.deepEqual(new Set(physical), new Set(scene.originalPhysicalCards),
    'original actor physical cards replaced rather than moved');
}
for (const seat of [0, 1]) {
  test('original rank3 60 physical owner cards, full root to native GX, seat ' + seat, () => {
    const scene = exactRank3PhysicalScene(seat);
    try {
      assertExactRank3PhysicalConservation(scene);
      assert.equal(scene.actor.hand.cards.length, 7);
      assert.equal(scene.actor.deck.cards.length, 45);
      assert.equal(scene.actor.prizes.length, 6);
      const enginePin = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
      const nativeBindings = {
        ActionEnumerator, Simulator, cardActions, gameActions,
        PokemonCard, TrainerCard, EnergyCard, PlayerType, SlotType,
        Stage, TrainerType, SpecialCondition, EnergyType, CardType,
        SuperType, GameError, CheckPokemonTypeEffect, StateUtils
      };
      const enumerator = createKnownCapFreeActionEnumerator({
        native: nativeBindings, enginePin
      });
      const admitted = buildNativeActionFrontier({
        state: scene.store.state, actorSeat: seat,
        native: nativeBindings, enumerator
      });
      assertKnownCapFreeAdapterAdmissionClear({
        enumerator, enginePin, frontierDiagnostics: admitted.diagnostics
      });
      assert.equal(admitted.diagnostics.truncated, false);
      const frontier = admitted.actionFrontier;
      assert.ok(frontier.items.some(item =>
        item.actorPrinting === 'Articuno-GX CES' && item.kind === 'play-card'));
      for (const source of ["Team Rocket's Handiwork FCO", 'Arven OBF',
        'Plumeria BUS', 'Nest Ball SVI', 'Capture Energy RCL']) {
        assert.ok(frontier.items.some(item => item.actorPrinting === source),
          'original hand competitor not enumerated: ' + source);
      }
      const observation = {
        actorSeat: seat, globalTurn: 4, decisionKind: 'owner-root',
        ownHand: scene.actor.hand.cards.map(card => card.fullName),
        ownTurnResources: { supporterPlayedTurn: 0, gxUsed: false },
        ownPublic: {
          active: {
            printing: scene.before.fullName,
            energies: [scene.water.fullName]
          }, bench: [], discard: [], stadium: [],
          deckCount: scene.actor.deck.cards.length,
          prizeCount: scene.actor.prizes.length,
          publicTurnRestrictions: { gxUsed: false }
        },
        opponentPublic: {
          active: {
            printing: scene.opponent.active.getPokemonCard().fullName,
            energies: scene.opponent.active.energies.cards.map(card => card.fullName)
          },
          bench: [], deckCount: scene.opponent.deck.cards.length,
          prizeCount: scene.opponent.prizes.length
        }
      };
      const decision = worker.createPolicy({
        role: 'opponent', seat, policyVersion: worker.POLICY_VERSION, config: {}
      }).decide({
        role: 'opponent', seat, observation, prompt: null, actionFrontier: frontier
      });
      protocol.validateDecision(decision, null, protocol.validateFrontier(frontier));
      const selected = frontier.items.find(item => item.token === decision.token);
      assert.equal(selected?.actorPrinting, 'Articuno-GX CES',
        'full original-60 root deviated from immediate payable native GX');
      scene.store.dispatch(selectedNativeAction(admitted, decision.token));
      assertExactRank3PhysicalConservation(scene);
      const confirm = projectAndDecide(scene);
      assert.equal(confirm.projection.choiceByToken.get(confirm.decision.token), true);
      dispatchPromptChoice({
        store: scene.store, prompt: confirm.prompt,
        state: scene.store.state, actorSeat: seat,
        projection: confirm.projection, decision: confirm.decision,
        native: bindings
      });
      assertExactRank3PhysicalConservation(scene);
      const move = projectAndDecide(scene);
      assert.equal(move.prompt.constructor.name, 'MoveEnergyPrompt');
      assert.equal(move.decision.kind, 'select-choices');
      assert.equal(move.decision.tokens.length, 1);
      assert.equal(move.projection.choiceByToken.get(move.decision.tokens[0]).index, 1);
      dispatchPromptChoice({
        store: scene.store, prompt: move.prompt, state: scene.store.state,
        actorSeat: seat, projection: move.projection, decision: move.decision,
        native: bindings
      });
      assertExactRank3PhysicalConservation(scene);
      assert.ok(scene.actor.active.energies.cards.includes(scene.water));
      scene.store.dispatch(new AttackAction(scene.actor.id, 'Cold Crush-GX'));
      assertExactRank3PhysicalConservation(scene);
      assert.equal(scene.actor.usedGX, true);
      assert.equal(scene.actor.active.energies.cards.length, 0);
      assert.equal(scene.opponent.active.energies.cards.length, 0);
      assert.ok(scene.actor.discard.cards.includes(scene.water));
    } finally {
      scene.provenanceHook.restore();
    }
  });
}


// Aichi rank 3 contains precisely two Water Energy. Exercise both actual
// objects and both full-card indices in the same native MoveEnergyPrompt; a
// single-transfer green result would not catch index shifting or aliasing.
for (const seat of [0, 1]) {
  for (const zeroHook of [false, true]) {
    test('rank3 native two Water Energy objects transfer together, seat ' + seat +
      ', zeroHook=' + zeroHook, () => {
      const scene = fixture(seat);
      const extra = initializeCards().getCardByName('Water Energy SVE');
      assert.ok(extra, 'pinned additional Water Energy missing');
      extra.id = 8900 + seat;
      scene.actor.active.cards.push(extra);
      scene.actor.active.energies.cards.push(extra);
      const restore = zeroHook ? installArticunoZeroMovementPromptHook() : null;
      try {
        const playIndex = scene.actor.hand.cards.indexOf(scene.articuno);
        scene.store.dispatch(new PlayCardAction(scene.actor.id, playIndex, {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
        }));
        const confirm = projectAndDecide(scene);
        assert.equal(confirm.projection.choiceByToken.get(confirm.decision.token), true);
        dispatchPromptChoice({
          store: scene.store, prompt: confirm.prompt, state: scene.store.state,
          actorSeat: seat, projection: confirm.projection,
          decision: confirm.decision, native: bindings
        });
        assert.equal(scene.actor.active.getPokemonCard(), scene.articuno);
        assert.deepEqual(scene.actor.bench[0].energies.cards, [scene.water, extra]);
        const move = projectAndDecide(scene);
        assert.equal(move.prompt.constructor.name, 'MoveEnergyPrompt');
        assert.equal(move.prompt.options.min, zeroHook ? 0 : 1);
        assert.equal(move.decision.kind, 'select-choices');
        assert.equal(move.decision.tokens.length, 2);
        const raw = move.decision.tokens.map(t => move.projection.choiceByToken.get(t));
        assert.deepEqual(raw.map(item => item.index), [1, 2],
          'each raw index must address the physical CardList.cards, not energies ordinal');
        const resolved = dispatchPromptChoice({
          store: scene.store, prompt: move.prompt, state: scene.store.state,
          actorSeat: seat, projection: move.projection,
          decision: move.decision, native: bindings
        });
        assert.equal(resolved.decoded.length, 2);
        assert.deepEqual(scene.actor.active.energies.cards, [scene.water, extra]);
        assert.equal(scene.actor.bench[0].energies.cards.length, 0);
        scene.store.dispatch(new AttackAction(scene.actor.id, 'Cold Crush-GX'));
        assert.equal(scene.actor.usedGX, true);
        assert.equal(scene.actor.active.energies.cards.length, 0);
        assert.equal(scene.opponent.active.energies.cards.length, 0);
        assert.ok(scene.actor.discard.cards.includes(scene.water));
        assert.ok(scene.actor.discard.cards.includes(extra));
      } finally {
        scene.provenanceHook.restore();
        if (restore) restore();
      }
    });
  }
}
