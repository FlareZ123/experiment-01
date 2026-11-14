'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  buildNativeActionFrontier,
  selectedNativeAction,
  dispatchSelectedNativeAction
} = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');

class PokemonCard {
  constructor(fullName) { this.fullName = fullName; this.name = fullName; }
}
class TrainerCard {
  constructor(fullName) { this.fullName = fullName; this.name = fullName; }
}
class EnergyCard {
  constructor(fullName) { this.fullName = fullName; this.name = fullName; }
}

function slot(card = null) {
  const cards = card ? [card] : [];
  return {
    cards,
    getPokemonCard() { return card; }
  };
}

function fakeNative() {
  const actions = [
    {
      type: 'PLAY_CARD_ACTION',
      clientId: 'p0',
      handIndex: 0,
      target: { player: 1, slot: 2, index: 0 }
    },
    {
      type: 'ATTACK_ACTION',
      clientId: 'p0',
      name: 'Unavailable Attack'
    },
    {
      type: 'PASS_TURN',
      clientId: 'p0'
    }
  ];
  class ActionEnumerator {
    enumerate(state, player, clientId) {
      assert.equal(state.players[0], player);
      assert.equal(clientId, 'p0');
      return actions;
    }
  }
  class Simulator {
    constructor(state) {
      this.store = {
        dispatch(action) {
          if (action.type === 'ATTACK_ACTION') throw new Error('not payable');
          return { accepted: action.type };
        }
      };
    }
  }
  return {
    ActionEnumerator,
    Simulator,
    PokemonCard,
    TrainerCard,
    EnergyCard,
    PlayerType: { BOTTOM_PLAYER: 1, TOP_PLAYER: 2, ANY: 3 },
    SlotType: { BENCH: 2, ACTIVE: 1, BOARD: 9, HAND: 3, DECK: 4, DISCARD: 5 }
  };
}

function fixtureState() {
  return {
    activePlayer: 0,
    phase: 2,
    turn: 7,
    prompts: [],
    players: [
      {
        id: 'p0',
        hand: { cards: [new TrainerCard('Test Item')] },
        active: slot(new PokemonCard('Own Active Pokemon')),
        bench: [slot(new PokemonCard('Own Bench Pokemon'))],
        discard: { cards: [] },
        stadium: { cards: [] },
        lostzone: { cards: [] },
        supporter: { cards: [] },
        prizes: []
      },
      {
        id: 'p1',
        hand: { isPublic: false, cards: [{ fullName: 'HIDDEN_OPPONENT_HAND_SENTINEL' }] },
        active: slot(new PokemonCard('Opponent Active Pokemon')),
        bench: [slot()],
        discard: { cards: [] },
        stadium: { cards: [] },
        lostzone: { cards: [] },
        supporter: { cards: [] },
        prizes: []
      }
    ]
  };
}

test('frontier is Simulator-validated, actor-visible, and opaque-token mapped', () => {
  const state = fixtureState();
  const native = fakeNative();
  const built = buildNativeActionFrontier({ state, actorSeat: 0, native });
  assert.equal(built.diagnostics.enumeratedCount, 3);
  assert.equal(built.diagnostics.validatedCount, 2);
  assert.equal(built.diagnostics.rejectedCount, 1);
  assert.equal(built.diagnostics.unsupportedCount, 0);
  assert.equal(built.actionFrontier.schema, protocol.FRONTIER_SCHEMA);
  assert.deepEqual(built.actionFrontier.items.map(item => item.kind), ['play-card', 'pass']);
  assert.equal(built.actionFrontier.items[0].actorPrinting, 'Test Item');
  assert.equal(built.actionFrontier.items[0].targetPrinting, 'Own Bench Pokemon');
  assert.deepEqual(built.actionFrontier.items[0].publicMetadata, {
    cardType: 'trainer',
    handIndex: 0,
    targetSeat: 'actor',
    targetZone: 'bench',
    targetIndex: 0
  });
  const serialized = JSON.stringify(built.actionFrontier);
  assert.equal(serialized.includes('HIDDEN_OPPONENT_HAND_SENTINEL'), false);
  assert.equal(serialized.includes('clientId'), false);
  assert.equal(serialized.includes('handIndex":0'), true);
  assert.equal(selectedNativeAction(built, 'act-0').type, 'PLAY_CARD_ACTION');
  assert.throws(() => selectedNativeAction(built, 'unknown-token'),
    /unknown or stale native action token/);

  let dispatched = 0;
  const store = {
    state,
    dispatch(action) {
      dispatched += 1;
      assert.equal(action.type, 'PLAY_CARD_ACTION');
      return { dispatched: true };
    }
  };
  const result = dispatchSelectedNativeAction({
    store,
    frontier: built,
    token: 'act-0',
    state,
    actorSeat: 0,
    native
  });
  assert.deepEqual(result, { dispatched: true });
  assert.equal(dispatched, 1);
});

test('dispatch rejects a stale Store state and a token owned by another seat', () => {
  const state = fixtureState();
  const native = fakeNative();
  const built = buildNativeActionFrontier({ state, actorSeat: 0, native });
  const staleStore = { state: { ...state }, dispatch() { throw new Error('must not dispatch'); } };
  assert.throws(() => dispatchSelectedNativeAction({
    store: staleStore,
    frontier: built,
    token: 'act-0',
    state,
    actorSeat: 0,
    native
  }), /state changed/);

  const wrongSeat = {
    ...state,
    players: [
      { ...state.players[0], id: 'different-player' },
      state.players[1]
    ]
  };
  const wrongStore = { state: wrongSeat, dispatch() { throw new Error('must not dispatch'); } };
  assert.throws(() => dispatchSelectedNativeAction({
    store: wrongStore,
    frontier: built,
    token: 'act-0',
    state: wrongSeat,
    actorSeat: 0,
    native
  }), /different physical seat|state changed/);
});
