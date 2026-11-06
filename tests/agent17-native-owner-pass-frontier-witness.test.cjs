'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withNativeOwnerPassFrontier,ownerPassFrontierAudit} =
  require('../simulation/twinleaf/agent17-native-owner-pass-frontier-witness.cjs');

class AddPlayerAction {}
class PassTurnAction {}
class PlayCardAction {}
class FakeStore {
  constructor() {
    this.state={turn:59,activePlayer:0,prompts:[],
      players:[{id:101,hand:['Water Energy MEE','Arven OBF']},
        {id:202,hand:['HiddenOpponentCard MEE']}]};
  }
  dispatch(action) {
    if (action.constructor.name==='PassTurnAction') {
      if (this.rejectPass)throw Error('Native rejected Pass');
      if (!this.silentNoop) {
        this.state.turn++;
        this.state.activePlayer=1;
      }
    }
    return 'accepted';
  }
}

function observe(state,seat) {
  return Object.freeze({
    decisionKind:'owner-root',actorSeat:seat,globalTurn:state.turn,
    ownHand:[...state.players[seat].hand],
    ownPublic:{active:{printing:'Snorlax PGO'},bench:[],handCount:2},
    opponentPublic:{active:{printing:'Trevenant & Dusknoir GX SMP'},
      bench:[],handCount:state.players[1-seat].hand.length},
    ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0},
    ownerK1:null
  });
}
const roots=[{action:'PassTurnAction',turnBefore:59,
  playerSlot:0,actionOrdinal:227}];

test('accepted native Pass snapshots only the acting player, not opposing hand',()=>{
  const old=FakeStore.prototype.dispatch;
  const store=new FakeStore();
  const wrapped=withNativeOwnerPassFrontier(()=>{
    store.dispatch(new AddPlayerAction());
    assert.equal(store.dispatch(new PassTurnAction()),'accepted');
    return {rootActionLedger:roots};
  },{Store:FakeStore,observe,onlySeat:0,onlyTurns:[59]});
  assert.equal(FakeStore.prototype.dispatch,old,'dispatch restored');
  assert.equal(wrapped.audit.rootOrdinalLinked,true);
  assert.equal(wrapped.audit.events[0].rootActionOrdinal,227);
  assert.equal(wrapped.audit.events[0].nativePassTransitionVerified,true);
  assert.equal(wrapped.audit.events[0].nativePassTransitionVerdict,
    'immediate-native-turn-advanced');
  assert.equal(wrapped.audit.verifiedNativeTurnTransitions,1);
  assert.deepEqual(wrapped.audit.events[0].actorHandPrintings,
    ['Water Energy MEE','Arven OBF']);
  assert.equal(JSON.stringify(wrapped.audit).includes('HiddenOpponentCard'),false);
  assert.equal(wrapped.audit.cardPlayabilityCertified,false);
  assert.equal(store.state.turn,60);
});

test('silent native Pass no-op does not manufacture settled turn',()=>{
  const store=new FakeStore();
  store.silentNoop=true;
  const observed=withNativeOwnerPassFrontier(()=>{
    store.dispatch(new AddPlayerAction());
    assert.equal(store.dispatch(new PassTurnAction()),'accepted');
    return {rootActionLedger:roots};
  },{Store:FakeStore,observe,onlySeat:0,onlyTurns:[59]});
  assert.equal(store.state.turn,59);
  assert.equal(observed.audit.rootOrdinalLinked,true);
  assert.equal(observed.audit.verifiedNativeTurnTransitions,0);
  assert.equal(observed.audit.events[0].nativeStoreDispatchReturned,true);
  assert.equal(observed.audit.events[0].nativePassTransitionVerified,false);
  assert.equal(observed.audit.events[0].nativePassTransitionVerdict,
    'turn-transition-unverified');
  assert.equal(observed.audit.status,
    'pass-dispatch-observed-turn-transition-unverified');
});

test('real subsequent WaitPrompt transition proves deferred Pass settlement',()=>{
  const store=new FakeStore();
  store.silentNoop=true;
  const observed=withNativeOwnerPassFrontier(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    return {rootActionLedger:[...roots,{
      action:'ResolvePromptAction',actionOrdinal:228,turnBefore:59,
      turnAfter:60,playerSlot:0,pendingPrompt:'WaitPrompt',
      initiatingRootActionOrdinal:227
    }]};
  },{Store:FakeStore,observe});
  assert.equal(observed.audit.verifiedNativeTurnTransitions,1);
  assert.equal(observed.audit.events[0].nativePassTransitionVerdict,
    'linked-prompt-advanced-turn');
  assert.equal(observed.audit.status,
    'source-owned-verified-pass-turn-transitions');
});

test('noneligible turns and seats are never exposed',()=>{
  const store=new FakeStore();
  const wrapped=withNativeOwnerPassFrontier(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction());
    store.dispatch(new PassTurnAction());
    return {rootActionLedger:roots};
  },{Store:FakeStore,observe,onlySeat:1,onlyTurns:[59]});
  assert.equal(wrapped.audit.count,0);
  assert.equal(wrapped.audit.rootOrdinalLinked,true);
});

test('rejected native Pass never enters accepted evidence, and dispatch restores',()=>{
  const old=FakeStore.prototype.dispatch;
  const store=new FakeStore();
  store.rejectPass=true;
  let failure;
  try {
    withNativeOwnerPassFrontier(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PassTurnAction());
    },{Store:FakeStore,observe});
  } catch(error) {
    failure=error;
  }
  assert.match(failure.message,/Native rejected Pass/);
  assert.equal(failure.ownerPassFrontierEvidence.count,0);
  assert.equal(FakeStore.prototype.dispatch,old);
});

test('abort after accepted Pass preserves partial evidence but cannot link',()=>{
  const old=FakeStore.prototype.dispatch;
  const store=new FakeStore();
  assert.throws(()=>{
    withNativeOwnerPassFrontier(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PassTurnAction());
      throw Error('Later native abort');
    },{Store:FakeStore,observe});
  },error=>{
    assert.equal(error.ownerPassFrontierEvidence.count,1);
    assert.equal(error.ownerPassFrontierEvidence.rootOrdinalLinked,false);
    assert.equal(error.ownerPassFrontierEvidence.events[0].rootActionOrdinal,null);
    return true;
  });
  assert.equal(FakeStore.prototype.dispatch,old);
});

test('ambiguous root linkage must fail closed without inventing ordinal',()=>{
  const event={actorSeat:0,globalTurn:59,
    actorHandPrintings:['Arven OBF']};
  const data=ownerPassFrontierAudit([event],{rootActionLedger:[...roots,
    {...roots[0],actionOrdinal:228}]});
  assert.equal(data.count,1);
  assert.equal(data.rootOrdinalLinked,false);
  assert.equal(data.events[0].rootActionOrdinal,null);
});

test('observer rejects a snapshot that contains opponent concealed hand',()=>{
  const store=new FakeStore();
  assert.throws(()=>{
    withNativeOwnerPassFrontier(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PassTurnAction());
    },{Store:FakeStore,observe:()=>({
      ...observe(store.state,0),
      opponentPublic:{handCount:1,hand:['HiddenOpponentCard MEE']}
    })});
  },/false !== true|true !== false/);
  assert.equal(store.state.turn,59);
});
