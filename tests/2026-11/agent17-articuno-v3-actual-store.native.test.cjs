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
        assert.equal(confirm.projection.choiceByToken.get(confirm.decision.token), true);
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
