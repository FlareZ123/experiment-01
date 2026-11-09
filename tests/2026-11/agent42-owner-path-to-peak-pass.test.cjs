'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PATH, choosePathAfterPass, withOwnerPathAfterPass
} = require('../../simulation/twinleaf/2026-11/agent42-owner-path-to-peak-pass.cjs');

function observation() {
  return {
    decisionKind: 'owner-root', globalTurn: 4,
    ownHand: ['Mysterious Treasure FLI', PATH],
    ownTurnResources: {stadiumPlayedTurn: 0, stadiumPlayLocked: false},
    ownPublic: {
      active: {printing: 'Tapu Lele-GX GRI', abilities: ['Wonder Tag']},
      bench: [null, null], stadium: [],
      publicTurnRestrictions: {stadiumPlayLocked: false}
    },
    opponentPublic: {
      active: {printing: 'Mew V FST', abilities: []},
      bench: [
        {printing: 'Genesect V FST', abilities: ['Fusion Strike System']},
        {printing: 'Genesect V FST', abilities: ['Fusion Strike System']}
      ],
      stadium: []
    }
  };
}

test('owner-visible Path suppresses opposing Genesect after a Pass', () => {
  assert.deepEqual(choosePathAfterPass(observation()),
    {printing: PATH, handIndex: 1});
});
test('do not suppress owner Genesect or select without opponent target', () => {
  const a = observation();
  a.ownPublic.bench[0] = {
    printing: 'Genesect V FST', abilities: ['Fusion Strike System']
  };
  assert.equal(choosePathAfterPass(a), null);
  const b = observation();
  b.opponentPublic.bench = [];
  assert.equal(choosePathAfterPass(b), null);
});
test('respect Stadium once-per-turn, locks and same-name rule', () => {
  const a = observation();
  a.ownTurnResources.stadiumPlayedTurn = 4;
  assert.equal(choosePathAfterPass(a), null);
  const b = observation();
  b.ownPublic.publicTurnRestrictions.stadiumPlayLocked = true;
  assert.equal(choosePathAfterPass(b), null);
  const c = observation();
  c.opponentPublic.stadium = [PATH];
  assert.equal(choosePathAfterPass(c), null);
});

test('nested Bot proposal reaches genuine Store and restores both hooks', () => {
  class PassTurnAction {}
  class PlayCardAction {
    constructor(playerId, handIndex, target) {
      this.playerId = playerId;
      this.handIndex = handIndex;
      this.target = target;
    }
  }
  class Bot {
    constructor(id) {this.client = {id};}
    decodeNextAction() {return new PassTurnAction();}
  }
  class Store {
    constructor(state) {this.state = state;}
    dispatch(action) {
      assert.equal(action.constructor.name, 'PlayCardAction');
      const owner = this.state.players[1];
      owner.stadium.cards.push(owner.hand.cards.splice(action.handIndex, 1)[0]);
      return {accepted: true};
    }
  }
  const view = observation();
  const beforeBot = Bot.prototype.decodeNextAction;
  const beforeStore = Store.prototype.dispatch;
  const state = {
    turn: 4, activePlayer: 1, phase: 'player-turn',
    prompts: [],
    players: [
      {id: 'source', hand: {cards: []}, stadium: {cards: []}},
      {id: 'candidate', hand: {cards: [
        {fullName: 'Mysterious Treasure FLI'}, {fullName: PATH}
      ]}, stadium: {cards: []}}
    ]
  };
  const selected = withOwnerPathAfterPass(() => {
    const action = new Bot('candidate').decodeNextAction(state);
    assert.equal(action.handIndex, 1);
    new Store(state).dispatch(action);
    return 'settled';
  }, {
    Bot, Store, observe: () => view,
    GamePhase: {PLAYER_TURN: 'player-turn'},
    cardActions: {
      PlayCardAction, PlayerType: {ANY: 'any'}, SlotType: {BOARD: 'board'}
    }
  });
  assert.equal(selected.result, 'settled');
  assert.equal(selected.audit.proposed, 1);
  assert.equal(selected.audit.accepted, 1);
  assert.equal(selected.audit.rejected, 0);
  assert.deepEqual(selected.audit.events[0].stadiumAfter, [PATH]);
  assert.strictEqual(Bot.prototype.decodeNextAction, beforeBot);
  assert.strictEqual(Store.prototype.dispatch, beforeStore);
});
