'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {withRealOwnerDecisionObserver} = require(
  '../simulation/twinleaf/agent9-v7-real-owner-decision-observer.cjs');

class AddPlayerAction {}
class PassTurnAction {}
class PlayCardAction { constructor(handIndex) {this.handIndex = handIndex;} }

/** @returns {object} Correctly owned synthetic physical Stores. */
function nativeFixture() {
  class Ai {
    constructor(id, action) {this.client = {id};this.action = action;}
    decodeNextAction() {return this.action;}
  }
  class Store {
    constructor(state) {this.state = state;this.dispatches = [];}
    dispatch(action) {this.dispatches.push(action);return 'original-store';}
  }
  const owner = id => ({id, supporterTurn: 0});
  const state = {activePlayer: 0, turn: 5, phase: 2,
    players: [owner(100), owner(101)], prompts: []};
  const store = new Store(state);
  const view = (s, seat) => ({actorSeat: seat, globalTurn: s.turn,
    decisionKind: 'owner-root', phase: s.phase,
    ownHand: ['Palace Book SMP'],
    ownPublic: {active: {printing: 'Iron Thorns ex TWM'},
      bench: [], stadium: [], discard: []},
    opponentPublic: {active: {printing: 'Tapu Lele-GX GRI'},
      bench: [], stadium: [], discard: []},
    ownTurnResources: {supporterPlayedTurn: s.players[seat].supporterTurn}});
  return {Ai, Store, state, store, view};
}

test('observes the acting real owner and preserves exact bot action', () => {
  const f = nativeFixture();
  const oldDecoder = f.Ai.prototype.decodeNextAction;
  const oldDispatch = f.Store.prototype.dispatch;
  const ai = new f.Ai(100, new PassTurnAction());
  const original = f.Ai.prototype.decodeNextAction;
  const x = withRealOwnerDecisionObserver(() => {
    assert.equal(f.store.dispatch(new AddPlayerAction()), 'original-store');
    assert.strictEqual(f.Ai.prototype.decodeNextAction.call(ai, f.state), ai.action);
    return 42;
  }, {trialId: 'original-A', SimpleTacticsAi: f.Ai, Store: f.Store,
    observe: f.view});
  assert.equal(x.result, 42);
  assert.equal(x.audit.actorOwnedRootObservations, 1);
  assert.equal(x.audit.realStoreRootProposals[0].globalTurn, 5);
  assert.equal(x.audit.realStoreRootProposals[0].seat, 0);
  assert.deepEqual(x.audit.realStoreRootProposals[0].ownerHand,
    ['Palace Book SMP']);
  assert.equal(x.audit.realStoreRootProposals[0].isAcceptedStoreRoot, false);
  assert.strictEqual(f.Ai.prototype.decodeNextAction, original);
  assert.strictEqual(f.Ai.prototype.decodeNextAction, oldDecoder);
  assert.strictEqual(f.Store.prototype.dispatch, oldDispatch);
  assert.deepEqual(f.store.dispatches.map(a => a.constructor.name),
    ['AddPlayerAction']);
});

test('does not inspect speculative clone or other physical owner', () => {
  const f = nativeFixture();
  const ai = new f.Ai(100, new PassTurnAction());
  let reads = 0;
  const out = withRealOwnerDecisionObserver(() => {
    f.store.dispatch(new AddPlayerAction());
    assert.strictEqual(ai.decodeNextAction({...f.state}), ai.action);
    const opp = new f.Ai(101, new PassTurnAction());
    assert.strictEqual(opp.decodeNextAction(f.state), opp.action);
  }, {SimpleTacticsAi: f.Ai, Store: f.Store, observe:()=>{
    reads++;return f.view(f.state,0);
  }});
  assert.equal(reads, 0);
  assert.equal(out.audit.realStoreRootProposals.length, 0);
});

test('does not observe owner pending prompts as native voluntary root', () => {
  const f = nativeFixture();
  const ai = new f.Ai(100, new PassTurnAction());
  const out = withRealOwnerDecisionObserver(() => {
    f.store.dispatch(new AddPlayerAction());
    f.state.prompts.push({playerId:100,result:undefined});
    assert.strictEqual(ai.decodeNextAction(f.state), ai.action);
  }, {SimpleTacticsAi: f.Ai, Store: f.Store, observe:f.view});
  assert.equal(out.audit.actorOwnedRootObservations,0);
});

test('captures printed owner PlayCard without guessing settlement', () => {
  const f = nativeFixture();
  const ai = new f.Ai(100,new PlayCardAction(0));
  const out = withRealOwnerDecisionObserver(() => {
    f.store.dispatch(new AddPlayerAction());
    ai.decodeNextAction(f.state);
  }, {SimpleTacticsAi:f.Ai,Store:f.Store,observe:f.view});
  assert.equal(out.audit.realStoreRootProposals[0].nativeProposedAction,
    'PlayCardAction');
  assert.equal(out.audit.realStoreRootProposals[0].nativeProposedPlayedPrinting,
    'Palace Book SMP');
  assert.equal(out.audit.changedAnyBotSelection,false);
});

test('records attempted quota mutation distinctly and restores after thrown engine error',()=>{
  const f=nativeFixture();
  f.Ai.prototype.decodeNextAction=function() {
    f.state.players[0].supporterTurn=12;
    throw Error('native failed');
  };
  const oldAi=f.Ai.prototype.decodeNextAction;
  const oldDispatch=f.Store.prototype.dispatch;
  const ai=new f.Ai(100,new PassTurnAction());
  assert.throws(()=>withRealOwnerDecisionObserver(()=>{
    f.store.dispatch(new AddPlayerAction());
    ai.decodeNextAction(f.state);
  },{SimpleTacticsAi:f.Ai,Store:f.Store,observe:f.view}),/native failed/);
  assert.strictEqual(f.Ai.prototype.decodeNextAction,oldAi);
  assert.strictEqual(f.Store.prototype.dispatch,oldDispatch);
});
