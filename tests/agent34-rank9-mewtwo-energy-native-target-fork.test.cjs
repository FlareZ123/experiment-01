'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CORE}=require(
  '../simulation/evaluation/agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {withOwnerMewtwoEnergyTarget}=require(
  '../simulation/evaluation/agent34-rank9-mewtwo-energy-native-target-fork.cjs');
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
}
const PlayerType={BOTTOM_PLAYER:2};
const SlotType={ACTIVE:1,BENCH:2};
const pokemon=fullName=>({fullName});
const pos=(name=null)=>({
  cards:name?[pokemon(name)]:[],
  energies:{cards:[]},
  getPokemonCard(){return this.cards[0]??null;}
});
class Store{
  constructor(turn=11,benchMewtwo=true){
    this.state={turn,players:[{
      id:42,hand:{cards:[{name:'Psychic Energy',
        fullName:'Psychic Energy SVE'}]},
      active:pos('Klefki SVI'),
      bench:[pos('Unown AOR'),pos(benchMewtwo?CORE:'Duskull VIV')]
    },{id:99}]};
  }
  dispatch(action){
    if(action instanceof PlayCardAction){
      const owner=this.state.players[0],card=
        owner.hand.cards.splice(action.handIndex,1)[0];
      if(action.target.slot===SlotType.BENCH)
        owner.bench[action.target.index].energies.cards.push(card);
      else owner.active.energies.cards.push(card);
    }
    return 'accepted';
  }
}
const deps={Store,PlayerType,SlotType};
test('actual owner PlayCardAction attachment retargets authorized Mewtwo Bench',()=>{
  const store=new Store(),original=Store.prototype.dispatch;
  const got=withOwnerMewtwoEnergyTarget(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(42,0,
      {player:2,slot:SlotType.ACTIVE,index:0}));
    return 42;
  },deps);
  assert.equal(got.result,42);
  assert.equal(got.audit.attempts.length,1);
  assert.equal(got.audit.nativeAccepted,1);
  assert.equal(got.audit.physicallyConfirmed,1);
  assert.equal(store.state.players[0].bench[1].energies.cards.length,1);
  assert.equal(store.state.players[0].active.energies.cards.length,0);
  assert.strictEqual(Store.prototype.dispatch,original);
});
test('nonregistered target turn never changes original proposal',()=>{
  const store=new Store(17),original=Store.prototype.dispatch;
  const got=withOwnerMewtwoEnergyTarget(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(42,0,
      {player:2,slot:SlotType.ACTIVE,index:0}));
  },deps);
  assert.equal(got.audit.nativeAccepted,0);
  assert.equal(store.state.players[0].active.energies.cards.length,1);
  assert.strictEqual(Store.prototype.dispatch,original);
});
test('missing face-up Mewtwo cannot cause private-zone inference',()=>{
  const store=new Store(11,false),original=Store.prototype.dispatch;
  const got=withOwnerMewtwoEnergyTarget(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(42,0,
      {player:2,slot:SlotType.ACTIVE,index:0}));
  },deps);
  assert.equal(got.audit.attempts.length,0);
  assert.equal(store.state.players[0].bench[1].energies.cards.length,0);
  assert.equal(store.state.players[0].active.energies.cards.length,1);
  assert.strictEqual(Store.prototype.dispatch,original);
});
