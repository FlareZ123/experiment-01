'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CORE,TARGET,ownerZoneCounts,withOwnerLastBenchReadOnlyAudit}=
  require('../simulation/evaluation/agent34-rank9-newmoon-lastbench-owner-location.cjs');
class AddPlayerAction {}
class PlayCardAction{
  constructor(clientId,handIndex){this.clientId=clientId;this.handIndex=handIndex;}
}
class PassTurnAction {}
const pokemon=name=>({fullName:name});
function slot(name=null){
  const cards=name?[pokemon(name)]:[];
  return {cards,getPokemonCard:()=>cards[0]};
}
function player(id,primary){
  return {
    id,hand:{cards:primary?[pokemon(TARGET)]:[]},
    deck:{cards:primary?[pokemon(CORE)]:[]},
    discard:{cards:[]},lostzone:{cards:[]},
    prizes:primary?[{cards:[pokemon(CORE)]}]:[],
    active:slot(primary?'Klefki SVI':'Electrode-GX CES'),
    bench:primary?[slot('Unown AOR'),slot('Dusclops SFA'),
      slot('Trevenant & Dusknoir-GX SMP'),slot('Lunatone OBF'),
      slot()]:[slot(),slot(),slot(),slot(),slot()]
  };
}
class Store{
  constructor(){this.state={turn:23,players:[player(71,true),player(72,false)]};}
  dispatch(action){
    if(action.constructor.name==='PlayCardAction'){
      const pl=this.state.players.find(x=>x.id===action.clientId);
      const card=pl.hand.cards.splice(action.handIndex,1)[0];
      const free=pl.bench.find(x=>!x.getPokemonCard());
      free.cards.push(card);
    }
    return 'accepted';
  }
}
test('post-choice exact original Duskull last Bench records Mewtwo zones',()=>{
  const store=new Store(),prior=Store.prototype.dispatch;
  const observed=withOwnerLastBenchReadOnlyAudit(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(71,0));
    return 42;
  },{Store});
  assert.equal(observed.result,42);
  assert.equal(observed.audit.matchingOriginalRootCount,1);
  const e=observed.audit.events[0];
  assert.equal(e.ownerPrivateCoreLocations.total,2);
  assert.equal(e.ownerPrivateCoreLocations.deck,1);
  assert.equal(e.ownerPrivateCoreLocations.prizes,1);
  assert.equal(e.ownerPrivateCoreLocations.hand,0);
  assert.equal(e.ownerPrivateCoreLocations.inPlay,false);
  assert.equal(e.physicalBenchSlotConsumed,true);
  assert.equal(e.privateZonesFedBackToBot,false);
  assert.equal(e.ownerPrivateCoreLocationsAfter.total,2);
  assert.strictEqual(Store.prototype.dispatch,prior);
});
test('only AddPlayerAction original Stores are audited; no original means zero',()=>{
  const store=new Store(),prior=Store.prototype.dispatch;
  const observed=withOwnerLastBenchReadOnlyAudit(()=>{
    store.dispatch(new PlayCardAction(71,0));return 'ok';
  },{Store});
  assert.equal(observed.audit.originalStores,0);
  assert.equal(observed.audit.matchingOriginalRootCount,0);
  assert.strictEqual(Store.prototype.dispatch,prior);
});
test('exact named copy accounting includes active and stacked Bench cards',()=>{
  const owner=player(71,true);
  owner.active.cards.push(pokemon(CORE));
  owner.bench[0].cards.push(pokemon(CORE));
  const counts=ownerZoneCounts(owner);
  assert.equal(counts.active,1);
  assert.equal(counts.bench,1);
  assert.equal(counts.total,4);
});
