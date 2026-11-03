'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  captureGenesectDceRetreat,settleGenesectDceRetreat,
  withGenesectDceRetreatCustody
}=require('../simulation/twinleaf/agent22-genesect-dce-retreat-custody.cjs');

class AddPlayerAction{
  constructor(id){this.id=id;}
}
class RetreatAction{
  constructor(clientId,benchIndex){this.clientId=clientId;this.benchIndex=benchIndex;}
}
function pokemon(name,energies){
  const card={fullName:name};
  return {cards:[card,...energies],
    pokemonCard:card,
    getPokemonCard(){return this.pokemonCard;},
    energies:{cards:energies}};
}
class MockStore{
  constructor(sourceSeat){
    this.state={turn:47,players:[],prompts:[]};
    this.sourceSeat=sourceSeat;
  }
  dispatch(action){
    if(action instanceof AddPlayerAction){
      const id=action.id;
      const source=(this.state.players.length===this.sourceSeat);
      const dce={fullName:'Double Colorless Energy SUM'};
      const otherDce={fullName:'Double Colorless Energy SUM'};
      const owner=source?{
        id,active:pokemon('Genesect V FST',[dce]),
        bench:[pokemon('Mew VMAX FST',[otherDce]),
          pokemon('Genesect V FST',[])],
        discard:{cards:[{fullName:'Double Colorless Energy SUM'}]},
        retreatedTurn:0
      }:{
        id,active:pokemon('Dialga-GX SMP',[]),bench:[],
        discard:{cards:[]},retreatedTurn:0};
      this.state.players.push(owner);
    }else if(action instanceof RetreatAction){
      const owner=this.state.players.find(p=>p.id===action.clientId);
      assert.ok(owner);
      const paidCard=owner.active.energies.cards[0];
      assert.equal(paidCard?.fullName,'Double Colorless Energy SUM');
      owner.active.energies.cards.splice(0,1);
      owner.active.cards.splice(owner.active.cards.indexOf(paidCard),1);
      owner.discard.cards.push(paidCard);
      const to=owner.bench[action.benchIndex];
      owner.bench[action.benchIndex]=owner.active;
      owner.active=to;
      owner.retreatedTurn=this.state.turn;
    }
    return true;
  }
}
function make(sourceSeat){
  const store=new MockStore(sourceSeat);
  store.dispatch(new AddPlayerAction(101));
  store.dispatch(new AddPlayerAction(202));
  return store;
}

for(const seat of [0,1]){
  test('same-object DCE fee and Genesect-to-Mew promotion in seat '+seat,()=>{
    const store=new MockStore(seat);
    const old=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
    const wrapped=withGenesectDceRetreatCustody(()=>{
      store.dispatch(new AddPlayerAction(101));
      store.dispatch(new AddPlayerAction(202));
      const owner=store.state.players[seat];
      const paid=owner.active.energies.cards[0];
      const pre=captureGenesectDceRetreat(store.state,new RetreatAction(owner.id,0));
      assert.strictEqual(pre.paidCard,paid);
      const selected=owner.bench[0].getPokemonCard();
      const oldActive=owner.active.getPokemonCard();
      store.dispatch(new RetreatAction(owner.id,0));
      assert.strictEqual(owner.discard.cards.at(-1),paid);
      assert.strictEqual(owner.active.getPokemonCard(),selected);
      assert.strictEqual(owner.bench[0].getPokemonCard(),oldActive);
      assert.equal(settleGenesectDceRetreat(pre,store.state).status,
        'EXACT_PHYSICAL_DCE_FEE_AND_MEW_PROMOTION');
      return paid;
    },{Store:MockStore});
    assert.strictEqual(MockStore.prototype.dispatch,old.value);
    assert.equal(wrapped.audit.genuineGameCount,1);
    assert.equal(wrapped.audit.attemptedPhysicalRoots,1);
    assert.equal(wrapped.audit.settledExactPhysicalFees,1);
    assert.equal(wrapped.audit.unverifiedPhysicalPayments,0);
    assert.equal(wrapped.audit.pendingAtEnd,0);
    assert.equal(wrapped.audit.records.length,1);
    assert.equal(wrapped.audit.competitiveQualifiedGames,0);
    assert.ok(!JSON.stringify(wrapped.audit).includes('Dialga'));
  });
}

test('unrelated physical duplicate in discard does not pay retreat fee',()=>{
  const store=make(0),owner=store.state.players[0];
  const oldCard=owner.active.energies.cards[0];
  const before=captureGenesectDceRetreat(store.state,new RetreatAction(owner.id,0));
  const replacement=owner.discard.cards[0];
  owner.active.energies.cards.splice(0,1);
  owner.active.cards.splice(owner.active.cards.indexOf(oldCard),1);
  const previous=owner.active;owner.active=owner.bench[0];owner.bench[0]=previous;
  owner.retreatedTurn=47;
  assert.equal(replacement.fullName,oldCard.fullName);
  assert.equal(settleGenesectDceRetreat(before,store.state).status,
    'PHYSICAL_PAYMENT_OR_PROMOTION_UNVERIFIED');
});

test('no source DCE or no Benched donor refuses physical observation',()=>{
  const store=make(0),owner=store.state.players[0];
  const action=new RetreatAction(owner.id,0);
  owner.active.energies.cards.splice(0);
  assert.equal(captureGenesectDceRetreat(store.state,action),null);
  owner.active.energies.cards.push(owner.active.cards[1]);
  owner.bench.pop();
  assert.equal(captureGenesectDceRetreat(store.state,action),null);
});

test('observer never attributes an unregistered speculative Store',()=>{
  const real=new MockStore(0);
  const fake=make(0);
  const {audit}=withGenesectDceRetreatCustody(()=>{
    fake.dispatch(new RetreatAction(101,0));
    real.dispatch(new AddPlayerAction(101));
    real.dispatch(new AddPlayerAction(202));
    real.dispatch(new RetreatAction(101,0));
  },{Store:MockStore});
  assert.equal(audit.genuineGameCount,1);
  assert.equal(audit.settledExactPhysicalFees,1);
});

test('native dispatcher descriptor restored on thrown failure',()=>{
  const before=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  assert.throws(()=>withGenesectDceRetreatCustody(()=>{
    throw new Error('native-failed');
  },{Store:MockStore}),/native-failed/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),before);
});
