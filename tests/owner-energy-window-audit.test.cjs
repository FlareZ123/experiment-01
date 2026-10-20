'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  ownerEnergySnapshot, powerglassPromptSnapshot, withOwnerEnergyWindowAudit
} = require('../simulation/twinleaf/owner-energy-window-audit.cjs');

const SuperType = Object.freeze({POKEMON: 1, ENERGY: 3});
const EnergyType = Object.freeze({BASIC: 0, SPECIAL: 1});
const GamePhase = Object.freeze({PLAYER_TURN: 7});
const SlotType = Object.freeze({ACTIVE: 1, BENCH: 2});
const GameMessage = Object.freeze({ATTACH_ENERGY_TO_ACTIVE: 53});

class AddPlayerAction {}
class PlayCardAction {
  /** @param {number} id @param {number} handIndex @param {object} target */
  constructor(id, handIndex, target) {
    this.id = id; this.handIndex = handIndex; this.target = target;
  }
}
class SourceEnergyRemovalAction {}
class ResolvePromptAction {
  /** @param {number} id @param {object[]} result */
  constructor(id, result) { this.id = id; this.result = result; }
}
class FakeStore {
  /** @param {object} state */
  constructor(state) { this.state = state; }
  /** @param {object} action @returns {object} */
  dispatch(action) {
    const owner = this.state.players[0];
    if (action instanceof PlayCardAction) {
      owner.active.cards.push(owner.hand.cards.splice(action.handIndex, 1)[0]);
      owner.energyPlayedTurn = this.state.turn;
    }
    if (action instanceof SourceEnergyRemovalAction) {
      owner.discard.cards.push(owner.active.cards.pop());
    }
    if (action instanceof ResolvePromptAction) {
      const source = owner.discard.cards;
      for (const selected of action.result) {
        source.splice(source.indexOf(selected.card), 1);
        owner.active.cards.push(selected.card);
      }
      this.state.prompts = [];
    }
    return this.state;
  }
}
class FakeBot {
  /** @param {number} id */
  constructor(id) { this.client = {id}; }
  /** @param {object} state @returns {object} */
  decodeNextAction(state) {
    return {type: 'PASS', turn: state.turn};
  }
}

const deps = {SimpleTacticsAi: FakeBot, Store: FakeStore,
  GamePhase, SuperType, EnergyType, SlotType, GameMessage};
const basic = name => ({
  name, fullName: name, superType: SuperType.ENERGY,
  energyType: EnergyType.BASIC
});

/** @returns {object} */
function fixture() {
  const psychic = basic('Psychic Energy SVE');
  const discard = basic('Psychic Energy MEE');
  const owner = {
    id: 101, energyPlayedTurn: 26, bench: [],
    active: {
      cards: [{superType: SuperType.POKEMON, fullName: 'Gengar & Mimikyu-GX TEU'}],
      tools: [{name: 'Powerglass', fullName: 'Powerglass SFA'}],
      getPokemonCard() {return this.cards[0];}
    },
    hand: {cards: [psychic]},
    discard: {cards: [discard]}
  };
  const opponent = {
    id: 202,
    get hand() {throw Error('Read unrevealed opponent hand');},
    get deck() {throw Error('Read unrevealed opponent deck');}
  };
  const state = {turn: 27, activePlayer: 0, phase: GamePhase.PLAYER_TURN,
    players: [owner, opponent], prompts: []};
  return {state, owner, psychic, discard};
}

test('only owned resources enter a Gengar/Powerglass availability snapshot', () => {
  const {state, owner} = fixture();
  const snap = ownerEnergySnapshot(state, owner, {
    superTypeEnergy: SuperType.ENERGY, energyTypeBasic: EnergyType.BASIC
  });
  assert.equal(snap.activePokemon, 'Gengar & Mimikyu-GX TEU');
  assert.equal(snap.activePowerglass, true);
  assert.deepEqual(snap.heldEnergyNames, ['Psychic Energy SVE']);
  assert.deepEqual(snap.discardedBasicEnergyNames, ['Psychic Energy MEE']);
  assert.equal(snap.manualAttachmentUnspentByTurnFlag, true);
  assert.equal(snap.nominalPowerglassResourceWindow, true);
  assert.equal(snap.ownerZonesOnly, true);
  assert.equal(snap.canActuallyAttachOrAttack, 'unverified');
});

test('Powerglass-like native resolution is attributed cautiously', () => {
  const {state, owner} = fixture();
  state.prompts = [{
    id: 33, playerId: 101, cardList: owner.discard,
    message: GameMessage.ATTACH_ENERGY_TO_ACTIVE,
    slots: [SlotType.ACTIVE]
  }];
  const matching = powerglassPromptSnapshot(state,
    new ResolvePromptAction(33, []), owner, {
      superTypeEnergy: SuperType.ENERGY,
      energyTypeBasic: EnergyType.BASIC,
      slotActive: SlotType.ACTIVE,
      messageAttachActive: GameMessage.ATTACH_ENERGY_TO_ACTIVE
    });
  assert.equal(matching.genuineNativeRoot, true);
  assert.equal(matching.selectedCount, 0);
  assert.equal(matching.sourceReducerIdentified, false);
  assert.equal(powerglassPromptSnapshot(state,
    new ResolvePromptAction(34, []), owner, {
      superTypeEnergy: 3, energyTypeBasic: 0,
      slotActive: 1, messageAttachActive: 53
    }), null);
});

test('same real Store records accepted native Energy and zero-or-one Powerglass resolution', () => {
  const {state, owner, discard} = fixture();
  const store = new FakeStore(state);
  const bot = new FakeBot(101);
  const beforeDecode = FakeBot.prototype.decodeNextAction;
  const beforeDispatch = FakeStore.prototype.dispatch;
  const result = withOwnerEnergyWindowAudit(0, () => {
    store.dispatch(new AddPlayerAction());
    const choice = bot.decodeNextAction(store.state);
    assert.deepEqual(choice, {type: 'PASS', turn: 27});
    store.dispatch(new PlayCardAction(101, 0,
      {player: 2, slot: SlotType.ACTIVE, index: 0}));
    store.state.turn = 28;
    const pending = {id: 17, playerId: 101, cardList: owner.discard,
      message: GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      slots: [SlotType.ACTIVE]};
    store.state.prompts.push(pending);
    store.dispatch(new ResolvePromptAction(17, []));
    store.state.turn = 29;
    store.state.prompts.push({...pending, id: 18});
    store.dispatch(new ResolvePromptAction(18, [
      {card: discard, to: {player: 2, slot: SlotType.ACTIVE, index: 0}}
    ]));
    store.state.turn = 30;
    store.state.activePlayer = 1;
    store.dispatch(new SourceEnergyRemovalAction());
    return 'unchanged-execution';
  }, deps);
  assert.equal(result.result, 'unchanged-execution');
  assert.equal(result.audit.ownerRootDecisions, 1);
  assert.equal(result.audit.candidateOwnTurns, 1);
  assert.equal(result.audit.nativeManualEnergyAccepted, 1);
  assert.equal(result.audit.likelyPowerglassPromptAccepted, 2);
  assert.equal(result.audit.publicEnergyTransitions, 3);
  assert.deepEqual(result.audit.publicEnergyTransitionsLedger.map(x =>
    x.attachedCardDelta), [1, 1, -1]);
  assert.deepEqual(result.audit.publicEnergyTransitionsLedger.map(x =>
    x.actorSeat), [0, 0, 1]);
  assert.equal(result.audit.publicEnergyTransitionsLedger[2].sourceCardAttribution,
    'unverified-public-root-join-required');
  assert.deepEqual(result.audit.likelyPowerglassPrompts.map(x =>
    x.selectedCount), [0, 1]);
  assert.deepEqual(result.audit.nativeManualEnergy[0].before.heldEnergyNames,
    ['Psychic Energy SVE']);
  assert.deepEqual(result.audit.nativeManualEnergy[0].after.activeEnergyNames,
    ['Psychic Energy SVE']);
  assert.deepEqual(result.audit.likelyPowerglassPrompts[1].activeEnergyAfter,
    ['Psychic Energy SVE', 'Psychic Energy MEE']);
  assert.equal(FakeBot.prototype.decodeNextAction, beforeDecode);
  assert.equal(FakeStore.prototype.dispatch, beforeDispatch);
});

test('all research hooks restore even when an actual execution throws', () => {
  const originalDecode = FakeBot.prototype.decodeNextAction;
  const originalDispatch = FakeStore.prototype.dispatch;
  assert.throws(() => withOwnerEnergyWindowAudit(1, () => {
    throw Error('synthetic failure');
  }, deps), /synthetic failure/);
  assert.equal(FakeBot.prototype.decodeNextAction, originalDecode);
  assert.equal(FakeStore.prototype.dispatch, originalDispatch);
});
