'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withGuzmaHalaOwnerZoneLineage, VERSION
} = require('../simulation/twinleaf/agent7-ghala-owner-zone-lineage.cjs');

class ResolvePromptAction {
  constructor(id, result) {
    this.id = id;
    this.result = result;
  }
}

class FakeStore {
  constructor({seat = 0, payment = 2, throwNative = false,
    actuallyMoves = true, relevant = true} = {}) {
    this.cards = [
      {fullName:'Crushing Hammer POR'},
      {fullName:'Team Flare Grunt XY'}
    ];
    const owner = {
      id:'owner', hand:{cards:[...this.cards]},
      discard:{cards:[]}
    };
    const other = {
      id:'other', hand:{cards:[]}, discard:{cards:[]}
    };
    this.state = {
      players:seat === 0 ? [owner,other] : [other,owner],
      prompts:[{
        id:17, result:undefined, playerId:'owner',
        sourceCard:{fullName:relevant ?
          'Guzma & Hala CEC' : 'Other Supporter'},
        message:'CHOOSE_CARD_TO_DISCARD',
        options:{min:2,max:2},
        cards:{cards:[...this.cards]}
      }]
    };
    this.payment = payment;
    this.throwNative = throwNative;
    this.actuallyMoves = actuallyMoves;
  }
  dispatch(action) {
    if (this.throwNative) throw Error('native refusal');
    const owner = this.state.players.find(p=>p.id==='owner');
    if (this.actuallyMoves && Array.isArray(action.result)) {
      for (const card of action.result) {
        const index = owner.hand.cards.indexOf(card);
        if (index >= 0) {
          owner.hand.cards.splice(index,1);
          owner.discard.cards.push(card);
        }
      }
    }
    return 'native-done';
  }
  run() {
    const cards = this.cards.slice(0,this.payment);
    return this.dispatch(new ResolvePromptAction(17,cards));
  }
}

test('two real owner cards move into discard, in both seats', () => {
  for(const seat of [0,1]) {
    const result = withGuzmaHalaOwnerZoneLineage(()=>{
      const s = new FakeStore({seat});
      return s.run();
    },{Store:FakeStore});
    assert.equal(result.result,'native-done');
    assert.equal(result.audit.schema,VERSION);
    assert.equal(result.audit.paperTwoCardZoneWitnesses,1);
    assert.equal(result.audit.events.length,1);
    assert.equal(result.audit.events[0].ownerSeat,seat);
    assert.equal(result.audit.events[0].paperTwoCardZoneWitness,true);
    assert.equal(result.audit.events[0].ownerDiscardCountAfter,2);
    assert.equal(result.audit.competitiveGameQualified,false);
  }
});

test('native success with an empty enhanced payment is caught', () => {
  const x=withGuzmaHalaOwnerZoneLineage(
    ()=>new FakeStore({payment:0}).run(),{Store:FakeStore});
  assert.equal(x.audit.events[0].nativeDispatchCompleted,true);
  assert.equal(x.audit.paperTwoCardZoneWitnesses,0);
  assert.equal(x.audit.rejectedOrUnverifiedPayments,1);
});

test('native success with a single-card payment is caught', () => {
  const x=withGuzmaHalaOwnerZoneLineage(
    ()=>new FakeStore({payment:1}).run(),{Store:FakeStore});
  assert.equal(x.audit.paperTwoCardZoneWitnesses,0);
  assert.equal(x.audit.events[0].requestedCount,1);
});

test('two selected cards staying in the hand fail the zone witness', () => {
  const x=withGuzmaHalaOwnerZoneLineage(
    ()=>new FakeStore({actuallyMoves:false}).run(),{Store:FakeStore});
  assert.equal(x.audit.events[0].validPhysicalSelectionBefore,true);
  assert.equal(x.audit.events[0].selectedStillInHand,true);
  assert.equal(x.audit.paperTwoCardZoneWitnesses,0);
});

test('unrelated payment prompt is not attributed to Guzma & Hala', () => {
  const x=withGuzmaHalaOwnerZoneLineage(
    ()=>new FakeStore({relevant:false}).run(),{Store:FakeStore});
  assert.equal(x.audit.observedPaymentPrompts,0);
});

test('native rejection propagates and Store descriptor is restored', () => {
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withGuzmaHalaOwnerZoneLineage(
    ()=>new FakeStore({throwNative:true}).run(),{Store:FakeStore}),
    /native refusal/);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    original);
});

test('one invalid duplicated card reference never becomes a positive payment', () => {
  const original=FakeStore.prototype.dispatch;
  const x=withGuzmaHalaOwnerZoneLineage(()=>{
    const store=new FakeStore();
    return store.dispatch(new ResolvePromptAction(17,
      [store.cards[0],store.cards[0]]));
  },{Store:FakeStore});
  assert.equal(x.audit.events[0].distinctSelected,1);
  assert.equal(x.audit.paperTwoCardZoneWitnesses,0);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});

class AddPlayerAction {}

test('live-only natural-game filter excludes detached and preexisting prepared Stores', () => {
  const x=withGuzmaHalaOwnerZoneLineage(()=>{
    const ignored=new FakeStore();
    ignored.run();
    const real=new FakeStore({seat:1});
    real.dispatch(new AddPlayerAction());
    real.run();
    return 'done';
  },{Store:FakeStore,liveOnly:true});
  assert.equal(x.result,'done');
  assert.equal(x.audit.liveOnly,true);
  assert.equal(x.audit.events.length,1);
  assert.equal(x.audit.events[0].gameOrdinal,0);
  assert.equal(x.audit.events[0].ownerSeat,1);
  assert.equal(x.audit.paperTwoCardZoneWitnesses,1);
});
