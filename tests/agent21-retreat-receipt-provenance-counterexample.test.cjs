'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  withStrandedFusionMewPassRetreat
} = require('../simulation/twinleaf/agent21-owner-stranded-mew-native-pass-retreat.cjs');

const DCE = 'Double Colorless Energy SUM';
class PassTurnAction {
  constructor(playerId) { this.playerId = playerId; }
}
class RetreatAction {
  constructor(playerId, benchIndex) {
    this.playerId = playerId;
    this.benchIndex = benchIndex;
  }
}

/**
 * Deliberate negative control: accepts retreat positioning without any fee.
 * This is a Store test double, never a claim about actual Twinleaf legality.
 */
class CounterexampleStore {
  constructor(seat, options = {}) {
    const makePokemon = name => ({
      getPokemonCard: () => ({fullName:name}),
      energies:{cards:[{fullName:DCE}]}
    });
    const owner = {
      id:101, active:makePokemon('Crobat V DAA'),
      bench:[makePokemon('Mew VMAX FST')],
      discard:{cards:options.existingDce ? [{fullName:DCE}] : []},
      retreatedTurn:0
    };
    const opponent = {
      id:202, active:makePokemon('Tapu Lele-GX GRI'),
      bench:[], discard:{cards:[]}, retreatedTurn:0
    };
    this.state = {phase:'PLAYER_TURN',turn:47,activePlayer:seat,prompts:[],
      players:seat === 0 ? [owner,opponent] : [opponent,owner]};
    this.owner = owner;
    this.actions = [];
  }
  dispatch(action) {
    this.actions.push(action.constructor.name);
    if (action instanceof RetreatAction) {
      const former = this.owner.active;
      this.owner.active = this.owner.bench[action.benchIndex];
      this.owner.bench[action.benchIndex] = former;
      this.owner.retreatedTurn = this.state.turn;
      // Deliberately omit the retreat payment: a negative control.
    }
    return 'test-double-accepted';
  }
}

const deps = {
  Store:CounterexampleStore,
  actions:{PassTurnAction,RetreatAction},
  phase:{GamePhase:{PLAYER_TURN:'PLAYER_TURN'}},
  types:{CardType:{COLORLESS:9},SpecialCondition:{}},
  observe:() => ({decisionKind:'owner-root',ownPublic:{active:null,bench:[]}}),
  choose:() => ({kind:'paid-retreat',benchIndex:0,
    printing:'Mew VMAX FST',paymentPrinting:DCE})
};

for (const seat of [0,1]) {
  test('historical observer accepts stale discard DCE as new fee, seat '+seat,() => {
    const store = new CounterexampleStore(seat,{existingDce:true});
    const before = store.owner.discard.cards.length;
    const wrapped = withStrandedFusionMewPassRetreat(
      () => store.dispatch(new PassTurnAction(101)), deps);
    assert.deepEqual(store.actions,['RetreatAction']);
    assert.equal(store.owner.discard.cards.length,before,
      'No new DCE was discarded in this negative control');
    assert.equal(store.owner.bench[0].energies.cards.length,1,
      'Outgoing Active still holds exact original DCE');
    // Currently true, and intentionally named as a documented defect.
    assert.equal(wrapped.audit.nativeSettledPromotions,1,
      'The old boolean some(DCE) wrongly certifies a historical DCE');
    assert.equal(wrapped.audit.records.at(-1).confirmation,
      'PROMOTED_AND_DCE_DISCARDED');
  });
}

test('prototype hook also intercepts same-class speculative Store test double',() => {
  const live = new CounterexampleStore(0,{existingDce:true});
  const speculative = new CounterexampleStore(0,{existingDce:true});
  const result = withStrandedFusionMewPassRetreat(() => {
    speculative.dispatch(new PassTurnAction(101));
    live.dispatch(new PassTurnAction(101));
  },deps);
  assert.deepEqual(speculative.actions,['RetreatAction'],
    'Hook did not distinguish speculative Store from live Store');
  assert.deepEqual(live.actions,['RetreatAction']);
  assert.equal(result.audit.eligibleOwnerOffers,2);
  assert.equal(result.audit.nativeSettledPromotions,2);
  assert.equal(result.audit.records.filter(r=>r.stage==='pre-native-dispatch').length,2);
});
