'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withPublicKoEnergyPhysicalCustody:observe}=
  require('../simulation/twinleaf/agent3-public-ko-energy-physical-custody.cjs');

class KnockOutEffect{
  constructor(player,target,count=1){
    this.player=player;this.target=target;this.prizeCount=count;
    this.preventDefault=false;
  }
}
function card(name){return {
  name,fullName:name+' TEST',set:'TEST',setNumber:'9'
};}
function pokemon(name='Dialga-GX'){
  const energ=[card('Psychic Energy 1'),card('Psychic Energy 2')];
  const tools=[card('Float Stone')];
  return {
    energies:{cards:[...energ]},tools:[...tools],
    getPokemonCard(){return {
      name,fullName:name+' UPR',hp:180,tags:['GX']
    };}
  };
}
function player(id){
  return {
    id,active:pokemon('Active '+id),bench:[],
    discard:{cards:[]},lostzone:{cards:[]},
    hand:{cards:[]},prizes:[{cards:[Object.defineProperty({},'name',{
      get(){throw Error('Read hidden Prize card face');}
    })]}]
  };
}
class Store{
  constructor(destination='discard'){
    this.state={turn:18,phase:3,players:[player(0),player(1)]};
    this.calculatingPlayability=false;
    this.destination=destination;
  }
  reduceEffect(state,effect){
    if(effect instanceof KnockOutEffect){
      const owned=effect.player[this.destination]?.cards;
      if(owned){
        owned.push(...effect.target.energies.cards,...effect.target.tools);
        effect.target.energies.cards=[];
        effect.target.tools=[];
      }
    }
    return state;
  }
}
test('actual native KO energy and Tools are correlated by exact identity to owner discard',()=>{
  const store=new Store();
  const before=Store.prototype.reduceEffect;
  const target=store.state.players[1].active;
  const [e1,e2]=target.energies.cards;
  const [tool]=target.tools;
  const {audit}=observe(()=>{
    store.reduceEffect(store.state,
      new KnockOutEffect(store.state.players[1],target,2));
  },{Store,rootBinding:{
    current:store,currentTrialId:'11:211:A:champion-reference'}});
  assert.equal(audit.version,VERSION);
  assert.equal(audit.observedNativeKnockouts,1);
  assert.equal(audit.totalPublicEnergyBeforeKo,2);
  assert.equal(audit.resolvedPublicEnergyToOwnerDiscard,2);
  assert.equal(audit.unresolvedPublicEnergyObjects,0);
  assert.equal(audit.resolvedPublicToolsToOwnerDiscard,1);
  assert.ok(store.state.players[1].discard.cards.includes(e1));
  assert.ok(store.state.players[1].discard.cards.includes(e2));
  assert.ok(store.state.players[1].discard.cards.includes(tool));
  assert.equal(audit.recordedNativeKnockouts[0].koOwnerSeat,1);
  assert.equal(audit.recordedNativeKnockouts[0].postNativePrizeCount,2);
  assert.equal(audit.hiddenZoneCardFacesRead,false);
  assert.equal(audit.paperValidityCertified,false);
  assert.strictEqual(Store.prototype.reduceEffect,before);
});
test('KO attached cards moving to owner lostzone are separately visible',()=>{
  const store=new Store('lostzone');
  const {audit}=observe(()=>{
    store.reduceEffect(store.state,new KnockOutEffect(
      store.state.players[0],store.state.players[0].active));
  },{Store,rootBinding:{current:store}});
  assert.equal(audit.resolvedPublicEnergyToOwnerLostZone,2);
  assert.equal(audit.resolvedPublicToolsToOwnerLostZone,1);
  assert.equal(audit.resolvedPublicEnergyToOwnerDiscard,0);
});
test('unmoved attachments remain unresolved with no fabricated custody',()=>{
  const store=new Store('missing');
  const {audit}=observe(()=>{
    store.reduceEffect(store.state,new KnockOutEffect(
      store.state.players[0],store.state.players[0].active));
  },{Store,rootBinding:{current:store}});
  assert.equal(audit.unresolvedPublicEnergyObjects,2);
  assert.equal(audit.unresolvedPublicToolObjects,1);
});
test('foreign Store events and playability reductions are not attributed',()=>{
  const owned=new Store(),foreign=new Store();
  const {audit}=observe(()=>{
    foreign.reduceEffect(foreign.state,new KnockOutEffect(
      foreign.state.players[0],foreign.state.players[0].active));
    owned.calculatingPlayability=true;
    owned.reduceEffect(owned.state,new KnockOutEffect(
      owned.state.players[0],owned.state.players[0].active));
  },{Store,rootBinding:{current:owned}});
  assert.equal(audit.observedNativeKnockouts,0);
  assert.equal(audit.totalPublicEnergyBeforeKo,0);
});
test('ambiguous dual-public-zone physical object fails closed and hook restores',()=>{
  class DuplicateStore extends Store{
    reduceEffect(state,effect){
      if(effect instanceof KnockOutEffect){
        const e=effect.target.energies.cards[0];
        effect.player.discard.cards.push(e);
        effect.player.lostzone.cards.push(e);
      }
      return state;
    }
  }
  const store=new DuplicateStore();
  const prior=DuplicateStore.prototype.reduceEffect;
  assert.throws(()=>observe(()=>{
    store.reduceEffect(store.state,new KnockOutEffect(
      store.state.players[0],store.state.players[0].active));
  },{Store:DuplicateStore,rootBinding:{current:store}}),
  /both owner public zones/);
  assert.strictEqual(DuplicateStore.prototype.reduceEffect,prior);
});
test('native engine abort preserves original error and always restores wrapper',()=>{
  class ThrowStore extends Store{
    reduceEffect(){throw Error('native injected failure');}
  }
  const store=new ThrowStore();
  const prior=ThrowStore.prototype.reduceEffect;
  assert.throws(()=>observe(()=>{
    store.reduceEffect(store.state,new KnockOutEffect(
      store.state.players[0],store.state.players[0].active));
  },{Store:ThrowStore,rootBinding:{current:store}}),error=>{
    assert.equal(error.message,'native injected failure');
    assert.equal(error.agent3KoEnergyPhysicalCustodyAudit.aborted,true);
    return true;
  });
  assert.strictEqual(ThrowStore.prototype.reduceEffect,prior);
});
test('record cap tracks all native KO and cards even if stored detail truncated',()=>{
  const store=new Store();
  const {audit}=observe(()=>{
    for(let i=0;i<2;i++){
      const victim=pokemon('Victim '+i);
      store.reduceEffect(store.state,new KnockOutEffect(
        store.state.players[0],victim));
    }
  },{Store,rootBinding:{current:store},maxRecords:1});
  assert.equal(audit.observedNativeKnockouts,2);
  assert.equal(audit.recordedNativeKnockouts.length,1);
  assert.equal(audit.omittedRecords,1);
  assert.equal(audit.totalPublicEnergyBeforeKo,4);
});
