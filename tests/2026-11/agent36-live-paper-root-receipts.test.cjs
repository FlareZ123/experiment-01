'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {createLivePaperRootReceipts, physicalView} =
  require('../../simulation/twinleaf/agent36-live-paper-root-receipts.cjs');

function makeStore() {
  const cards = seat => Array.from({length:60}, (_,i) =>
    ({fullName: 'Card' + seat + '-' + i + ' TEST ' + i}));
  const player = seat => ({id:seat+100, deck:{cards:cards(seat)},
    hand:{cards:[]},discard:{cards:[]}, lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[]})),
    active:{cards:[],tools:[],energies:{cards:[]}},bench:[]});
  const state = {players:[player(0),player(1)],turn:1,phase:'PLAYER_TURN',
    activePlayer:0,prompts:[]};
  return {state, dispatch(action) {
    if(action.fail) throw Object.assign(new Error('simulated veto'),
      {code:'PAPER_VETO'});
    if(action.card) {
      const actor=state.players[state.activePlayer];
      const at=actor.hand.cards.indexOf(action.card);
      if(at>=0){actor.hand.cards.splice(at,1);\n        if(action.attachEnergy) actor.active.energies.cards.push(action.card);\n        else actor.discard.cards.push(action.card);}
    }
    if(action.prompt) state.prompts.push(action.prompt);
    return true;
  }};
}

class PlayCardAction {
  constructor(card){this.card=card;}
}
class ResolvePromptAction {
  constructor(result){this.result=result;}
}

test('actual dispatched root captures 120 physical identities and exact payment',()=>{
  const store=makeStore();
  const recorder=createLivePaperRootReceipts('rank5-frozen-trial');
  const unwrapped=store.dispatch;
  recorder.onRootStoreCreated(store);
  const card=store.state.players[0].deck.cards.shift();
  store.state.players[0].hand.cards.push(card);
  const action=new PlayCardAction(card);
  assert.equal(store.dispatch(action),true);
  recorder.onRootActionDispatched(store,action,19,0,1);
  const row=recorder.result();
  assert.equal(row.originalPhysicalCards.length,120);
  assert.equal(row.acceptedStoreRootCount,1);
  assert.equal(row.settledPhysicalIdentityClean,true);
  assert.deepEqual(row.receipts[0].movement,[{
    id:'0:0',printing:'Card0-0 TEST 0',from:'s0.hand:0',to:'s0.discard:0'
  }]);
  assert.equal(row.receipts[0].beforePositions['0:0'],'s0.hand:0');
  assert.equal(row.receipts[0].afterPositions['0:0'],'s0.discard:0');
  recorder.close();
  assert.strictEqual(store.dispatch,unwrapped);
});

test('attached Energy remains in physical custody and records its exact movement',()=>{
  const store=makeStore();
  const recorder=createLivePaperRootReceipts('rank5-energy-payment');
  recorder.onRootStoreCreated(store);
  const card=store.state.players[0].deck.cards.shift();
  store.state.players[0].hand.cards.push(card);
  const action={card,attachEnergy:true};
  assert.equal(store.dispatch(action),true);
  recorder.onRootActionDispatched(store,action,20,0,1);
  const row=recorder.result();
  assert.equal(row.schema,'agent36-live-paper-root-receipts-v2-attached-energy-custody');
  assert.deepEqual(row.receipts[0].movement,[{
    id:'0:0',printing:'Card0-0 TEST 0',from:'s0.hand:0',
    to:'s0.active.energies:0'
  }]);
  assert.equal(row.settledPhysicalIdentityClean,true);
  recorder.close();
});

test('real unresolved prompt choices identify selected physical card',()=>{
  const store=makeStore();
  const recorder=createLivePaperRootReceipts('rank5-prompt');
  recorder.onRootStoreCreated(store);
  const card=store.state.players[1].deck.cards[0];
  const prompt={id:3,playerId:101,message:'Choose',options:{min:1,max:1},
    cards:{cards:[card]}};
  store.state.prompts.push(prompt);
  const action=new ResolvePromptAction([card]);
  store.dispatch(action);
  recorder.onRootActionDispatched(store,action,0,1,1);
  const r=recorder.result().receipts[0];
  assert.deepEqual(r.selected,[{physicalId:'1:0'}]);
  assert.deepEqual(r.beforePrompts[0].availablePhysicalIds,['1:0']);
  recorder.close();
});

test('rejects speculative Store alias and fails closed on missing accepted dispatch',()=>{
  const store=makeStore();
  const recorder=createLivePaperRootReceipts('rank6-claim');
  recorder.onRootStoreCreated(store);
  const a=new PlayCardAction(null);
  assert.throws(()=>recorder.onRootActionDispatched(store,a,0,0,1),
    /lacks matching exact Store dispatch/);
  store.dispatch(a);
  assert.throws(()=>recorder.onRootActionDispatched(makeStore(),a,0,0,1),
    /Speculative Store/);
  recorder.close();
});

test('records Store veto separately without promoting an accepted root',()=>{
  const store=makeStore(),rec=createLivePaperRootReceipts('rank7');
  rec.onRootStoreCreated(store);
  const action={fail:true};
  assert.throws(()=>store.dispatch(action),/simulated veto/);
  assert.equal(rec.result().acceptedStoreRootCount,0);
  assert.deepEqual(rec.result().rejectedDispatches.map(r=>r.errorCode),
    ['PAPER_VETO']);
  rec.close();
});

test('physical duplicates and missing original identities fail closed',()=>{
  const store=makeStore(),rec=createLivePaperRootReceipts('rank11');
  rec.onRootStoreCreated(store);
  store.state.players[0].deck.cards.push(store.state.players[0].deck.cards[0]);
  const action={};
  store.dispatch(action);
  rec.onRootActionDispatched(store,action,0,0,1);
  assert.equal(rec.result().settledPhysicalIdentityClean,false);
  assert.equal(rec.result().receipts[0].anomalies.afterDuplicates.length,1);
  rec.close();
});

test('pre-existing duplicate physical IDs are surfaced',()=>{
  const store=makeStore();
  const ids=new Map(store.state.players[0].deck.cards.map((c,i)=>[c,'0:'+i]));
  store.state.players[0].hand.cards.push(store.state.players[0].deck.cards[0]);
  assert.equal(physicalView(store.state,ids).duplicates.length,1);
});

test('later prototype rule hooks remain active after recorder installation',()=>{
  class NativeStore {
    constructor(){this.state=makeStore().state;}
    dispatch(){return 'old';}
  }
  const store=new NativeStore();
  const recorder=createLivePaperRootReceipts('hook-safety');
  recorder.onRootStoreCreated(store);
  const original=NativeStore.prototype.dispatch;
  let calls=0;
  NativeStore.prototype.dispatch=function(){calls++;return 'corrected';};
  const action={};
  assert.equal(store.dispatch(action),'corrected');
  recorder.onRootActionDispatched(store,action,0,0,1);
  assert.equal(calls,1);
  recorder.close();
  NativeStore.prototype.dispatch=original;
});

test('native Store callback before AddPlayerAction binds after both physical decks',()=>{
  const players=makeStore().state.players;
  const store={state:{players:[],turn:0,phase:'SETUP',activePlayer:0,
    prompts:[]},dispatch(action){
      if(action.type==='AddPlayerAction')
        this.state.players.push(players[this.state.players.length]);
      return true;
    }};
  const recorder=createLivePaperRootReceipts('native-setup');
  recorder.onRootStoreCreated(store);
  store.dispatch({type:'AddPlayerAction'});
  store.dispatch({type:'AddPlayerAction'});
  store.state.turn=1;
  const action={};
  store.dispatch(action);
  recorder.onRootActionDispatched(store,action,0,0,1);
  assert.equal(recorder.result().originalPhysicalCards.length,120);
  assert.equal(recorder.result().acceptedStoreRootCount,1);
  assert.equal(recorder.result().settledPhysicalIdentityClean,true);
  recorder.close();
});
