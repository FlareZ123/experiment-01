'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withNativePublicKoVictims:observe}=
  require('../simulation/twinleaf/agent3-public-ko-victim-print-observer.cjs');

class KnockOutEffect{
  constructor(player,target,count=1){
    this.player=player;this.target=target;this.prizeCount=count;
    this.preventDefault=false;
  }
}
class NoopEffect{}
function hiddenCard(){
  return Object.defineProperty({},'name',{get(){
    throw Error('Observer read a hidden Prize face');
  }});
}
function card(name,extra={}){
  return {
    name,fullName:name+' SET',
    set:'SET',setNumber:'001',
    stage:0,tags:[],hp:200,...extra
  };
}
function target(name){
  const top=card(name,{tags:['GX'],hp:210});
  return {
    damage:210,hp:210,
    energies:{cards:[card('Psychic Energy')]},
    tools:[card('Float Stone')],
    getPokemonCard(){return top;},
    getPokemons(){return [card('Basic Stage'),top];}
  };
}
class Store{
  constructor(){
    this.state={
      turn:15,phase:3,
      players:[0,1].map(id=>({
        id,active:target('Active '+id),bench:[],
        prizes:[{cards:[hiddenCard()]}],hand:{cards:[]}
      }))
    };
    this.calculatingPlayability=false;
  }
  reduceEffect(state,effect){return state;}
}
test('public in-play native knockout snapshots exact printed victim before reducer',()=>{
  const store=new Store(),rootBinding={
    current:store,currentTrialId:'11:211:A:champion-reference'
  };
  const before=Store.prototype.reduceEffect;
  const {audit}=observe(()=>{
    const native=new KnockOutEffect(store.state.players[1],
      store.state.players[1].active,2);
    store.reduceEffect(store.state,native);
  },{Store,rootBinding});
  assert.equal(audit.version,VERSION);
  assert.equal(audit.eligibleNativeKoEffects,1);
  assert.equal(audit.recordedKoVictims.length,1);
  const victim=audit.recordedKoVictims[0];
  assert.equal(victim.registeredTrialId,rootBinding.currentTrialId);
  assert.equal(victim.koOwnerSeat,1);
  assert.equal(victim.location,'active');
  assert.equal(victim.publicVictim.name,'Active 1');
  assert.deepEqual(victim.publicVictim.cardTags,['GX']);
  assert.equal(victim.publicVictim.printedHp,210);
  assert.equal(victim.damageCountersValue,210);
  assert.equal(victim.attachedPublicEnergyCards[0].name,'Psychic Energy');
  assert.equal(victim.attachedPublicTools[0].name,'Float Stone');
  assert.equal(victim.evolutionCards.length,2);
  assert.equal(victim.postNativePrizeCount,2);
  assert.equal(audit.readHiddenPrizeCards,false);
  assert.equal(audit.paperPrizeAwardValidityCertified,false);
  assert.strictEqual(Store.prototype.reduceEffect,before);
});
test('bench knockout correctly locates public source owner without hidden-zone inspection',()=>{
  const store=new Store();
  const victim=target('Benched 0');
  store.state.players[0].bench.push(victim);
  const {audit}=observe(()=>
    store.reduceEffect(store.state,
      new KnockOutEffect(store.state.players[0],victim,1)),
    {Store,rootBinding:{current:store,currentTrialId:'6:210:B:champion-reference'}});
  assert.equal(audit.recordedKoVictims[0].location,'bench');
  assert.equal(audit.recordedKoVictims[0].koOwnerSeat,0);
});
test('foreign Store knockout and nonlive playability reductions are ignored',()=>{
  const original=new Store(),foreign=new Store();
  const binding={current:original,currentTrialId:'registered'};
  const {audit}=observe(()=>{
    foreign.reduceEffect(foreign.state,
      new KnockOutEffect(foreign.state.players[0],
        foreign.state.players[0].active));
    original.calculatingPlayability=true;
    original.reduceEffect(original.state,
      new KnockOutEffect(original.state.players[1],
        original.state.players[1].active));
  },{Store,rootBinding:binding});
  assert.equal(audit.eligibleNativeKoEffects,0);
  assert.equal(audit.ignoredForeignOrPlayabilityKoEffects,2);
});
test('non-KO effects never trigger a victim capture',()=>{
  const store=new Store();
  const {audit}=observe(()=>{
    store.reduceEffect(store.state,new NoopEffect());
  },{Store,rootBinding:{current:store}});
  assert.equal(audit.eligibleNativeKoEffects,0);
});
test('throws on missing public KO victim and restores native hook',()=>{
  const store=new Store();
  const original=Store.prototype.reduceEffect;
  assert.throws(()=>observe(()=>{
    store.reduceEffect(store.state,
      new KnockOutEffect(store.state.players[0],{}));
  },{Store,rootBinding:{current:store}}),/in-play PokemonCardList/);
  assert.strictEqual(Store.prototype.reduceEffect,original);
});
test('upstream native reducer error propagates and restores hook',()=>{
  class ThrowStore extends Store{
    reduceEffect(){throw Error('native failure');}
  }
  const store=new ThrowStore();
  const original=ThrowStore.prototype.reduceEffect;
  assert.throws(()=>observe(()=>{
    store.reduceEffect(store.state,
      new KnockOutEffect(store.state.players[0],
        store.state.players[0].active));
  },{Store:ThrowStore,rootBinding:{current:store}}),error=>{
    assert.equal(error.message,'native failure');
    assert.equal(error.agent3PublicKoVictimAudit.aborted,true);
    return true;
  });
  assert.strictEqual(ThrowStore.prototype.reduceEffect,original);
});
test('record cap preserves total actual KO event count as omissions',()=>{
  const store=new Store();
  const {audit}=observe(()=>{
    for(let i=0;i<4;i++)
      store.reduceEffect(store.state,
        new KnockOutEffect(store.state.players[0],
          store.state.players[0].active));
  },{Store,rootBinding:{current:store},maxRecords:1});
  assert.equal(audit.eligibleNativeKoEffects,4);
  assert.equal(audit.recordedKoVictims.length,1);
  assert.equal(audit.omittedVictims,3);
});
