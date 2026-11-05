'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  DCE,publicAndOwnerSnapshot,withPaidHalaDceOwnerWitness
}=require('../simulation/twinleaf/agent5-paid-ghala-dce-owner-witness.cjs');

function pokemon(name){
  return {
    energies:{cards:[]},tools:[],
    getPokemonCard(){return {name};}
  };
}

function fixture(){
  const physical={fullName:DCE};
  const thunder={fullName:'Thunder Mountain Prism Star LOT'};
  const owner={
    id:100,hand:{cards:[physical,thunder]},
    active:pokemon('Iron Thorns ex'),
    bench:[pokemon('Iron Thorns ex')],
    stadium:{cards:[]},energyPlayedTurn:0,
    stadiumPlayedTurn:0,cannotPlayEnergyCards:false,
    cannotPlayStadiumCards:false
  };
  const opponent={id:200,
    get hand(){throw Error('OPPONENT_PRIVATE_HAND_NOT_READABLE');},
    get deck(){throw Error('OPPONENT_PRIVATE_DECK_NOT_READABLE');}
  };
  const state={turn:2,players:[owner,opponent]};
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return this.state;
      if(action instanceof PlayCardAction){
        const card=owner.hand.cards.splice(action.handIndex,1)[0];
        owner.active.energies.cards.push(card);
        owner.energyPlayedTurn=this.state.turn;
        return this.state;
      }
      throw Error('UNEXPECTED_NATIVE_ACTION');
    }
  }
  return {physical,thunder,owner,opponent,state,
    AddPlayerAction,PlayCardAction,Store};
}

test('read-only owner snapshot uses only owner hand and public board',()=>{
  const f=fixture();
  const snapshot=publicAndOwnerSnapshot(f.owner);
  assert.deepEqual(snapshot.hand,[DCE,
    'Thunder Mountain Prism Star LOT']);
  assert.deepEqual(snapshot.active.energies,[]);
  assert.equal(snapshot.bench[0].name,'Iron Thorns ex');
});

test('genuine source DCE root settles exact physical energy to Active and preserves Stadium hand',()=>{
  const f=fixture();
  const native=new f.Store();
  const descriptor=Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch');
  const action=new f.PlayCardAction(f.owner.id,0,{
    player:0,slot:1,index:0
  });
  const x=withPaidHalaDceOwnerWitness(()=>{
    native.dispatch(new f.AddPlayerAction());
    native.dispatch(action);
    return 'native-completed';
  },{Store:f.Store,trialId:'6:101:B:champion-reference'});
  assert.equal(x.result,'native-completed');
  assert.equal(x.audit.actualNativeStores,1);
  assert.equal(x.audit.sourceTurn2Seat0DceCardPlayObservations.length,1);
  const row=x.audit.sourceTurn2Seat0DceCardPlayObservations[0];
  assert.equal(row.globalTurn,2);
  assert.equal(row.actualActingSeat,0);
  assert.equal(row.physicalCardLeftOwnHand,true);
  assert.equal(row.attachedExactPhysicalObjectToOwnPokemon,true);
  assert.deepEqual(row.exactPhysicalRecipientSlots,['Active']);
  assert.deepEqual(row.playCardTarget,{player:0,slot:1,index:0});
  assert.deepEqual(row.before.hand,[DCE,
    'Thunder Mountain Prism Star LOT']);
  assert.deepEqual(row.after.hand,['Thunder Mountain Prism Star LOT']);
  assert.deepEqual(row.after.active.energies,[DCE]);
  assert.equal(row.after.energyPlayedTurn,2);
  assert.equal(x.audit.opponentConcealedZonesRead,false);
  assert.equal(x.audit.unopenedOwnerDeckRead,false);
  assert.strictEqual(f.Store.prototype.dispatch,descriptor.value);
});

test('non-source seat or wrong turn creates no positive DCE witness',()=>{
  const f=fixture();
  const native=new f.Store();
  const x=withPaidHalaDceOwnerWitness(()=>{
    native.dispatch(new f.AddPlayerAction());
    f.state.turn=4;
    native.dispatch(new f.PlayCardAction(f.owner.id,0,{
      player:0,slot:1,index:0
    }));
    return 'done';
  },{Store:f.Store});
  assert.equal(x.result,'done');
  assert.deepEqual(x.audit.sourceTurn2Seat0DceCardPlayObservations,[]);
});

test('Store observer restores exactly on native action rejection',()=>{
  const f=fixture();
  const prior=f.Store.prototype.dispatch;
  assert.throws(()=>withPaidHalaDceOwnerWitness(()=>{
    const native=new f.Store();
    native.dispatch(new f.AddPlayerAction());
    native.dispatch({constructor:{name:'Unexpected'}});
  },{Store:f.Store}),/UNEXPECTED_NATIVE_ACTION/);
  assert.strictEqual(f.Store.prototype.dispatch,prior);
});
