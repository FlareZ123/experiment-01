'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicAbilityContext,withRejectedUnderworldPublicLockWitness}=
  require('../simulation/twinleaf/agent4-underworld-door-public-lock-witness.cjs');

class AddPlayerAction{}
class UseAbilityAction{
  constructor(clientId,name){
    this.clientId=clientId;
    this.name=name;
  }
}
class DummyStore{
  constructor(state){this.state=state;this.trace=[];}
  dispatch(action){
    this.trace.push(action.constructor.name);
    if(action instanceof UseAbilityAction)
      throw new Error('UNKNOWN_POWER');
    return true;
  }
}
function state(){
  const slot=(name,powers=[])=>({
    getPokemonCard:()=>({name,fullName:name,powers}),
    tools:[]
  });
  return {
    turn:32,phase:2,
    players:[
      {id:1,active:slot('Shadow Rider Calyrex VMAX',
        [{name:'Underworld Door',powerType:1}]),bench:[
          slot('Mewtwo & Mew-GX'),slot('Shadow Rider Calyrex VMAX',
          [{name:'Underworld Door',powerType:1}])
        ]},
      {id:2,active:slot('Iron Thorns ex',
        [{name:'Initialization',powerType:1}]),bench:[]}
    ]
  };
}
test('printed live public Underworld targets and owner seat only',()=>{
  const publicState=publicAbilityContext(state(),1);
  assert.equal(publicState.actingSeat,0);
  assert.equal(publicState.opposingActiveIronThornsEx,true);
  assert.deepEqual(publicState.opposingActivePowerNames,['Initialization']);
  assert.equal(publicState.actingUnderworldSources.length,2);
  assert.deepEqual(publicState.actingUnderworldSources.map(x=>x.zone),
    ['Active','Bench']);
});
test('post native rejection, probe printed Powers without changing dispatch',()=>{
  let originalThrowSeen=false,checkAfterThrow=false;
  const original=DummyStore.prototype.dispatch;
  const observed=withRejectedUnderworldPublicLockWitness(()=>{
    const store=new DummyStore(state());
    store.dispatch(new AddPlayerAction());
    try{store.dispatch(new UseAbilityAction(1,'Underworld Door'));}
    catch(error){
      assert.match(error.message,/UNKNOWN_POWER/);
      originalThrowSeen=true;
    }
    return true;
  },{
    Store:DummyStore,
    isAbilityBlocked:(store,st,owner,card,power)=>{
      assert.equal(originalThrowSeen,false);
      checkAfterThrow=store.trace.includes('UseAbilityAction');
      assert.equal(st.players[0],owner);
      assert.equal(card.name,'Shadow Rider Calyrex VMAX');
      assert.equal(power.name,'Underworld Door');
      return true;
    }
  });
  assert.equal(checkAfterThrow,true);
  assert.equal(originalThrowSeen,true);
  assert.equal(observed.result,true);
  assert.equal(observed.audit.liveGameCount,1);
  assert.equal(observed.audit.exactRejectedUnderworldActions,1);
  const event=observed.audit.events[0];
  assert.equal(event.preDispatchPublicContext.actingSeat,0);
  assert.equal(event.preDispatchPublicContext.opposingActive,
    'Iron Thorns ex');
  assert.equal(event.postRejectionSpecificNativePowerChecks.length,2);
  assert.equal(event.allPrintedUnderworldPowersBlocked,true);
  assert.equal(DummyStore.prototype.dispatch,original);
});
test('separate games indexed and non-target rejected action excluded',()=>{
  const x=withRejectedUnderworldPublicLockWitness(()=>{
    for(let i=0;i<2;i++){
      const store=new DummyStore(state());
      store.dispatch(new AddPlayerAction());
      assert.throws(()=>store.dispatch(new UseAbilityAction(1,
        i===0?'Other Power':'Underworld Door')),/UNKNOWN_POWER/);
    }
    return 2;
  },{Store:DummyStore,isAbilityBlocked:()=>false});
  assert.equal(x.audit.liveGameCount,2);
  assert.equal(x.audit.events.length,1);
  assert.equal(x.audit.events[0].liveGameIndex,1);
  assert.equal(x.audit.events[0].allPrintedUnderworldPowersBlocked,false);
});
test('unrecognized owner ID fails closed and restores native dispatch',()=>{
  const original=DummyStore.prototype.dispatch;
  assert.throws(()=>withRejectedUnderworldPublicLockWitness(()=>{
    const store=new DummyStore(state());
    store.dispatch(new AddPlayerAction());
    store.dispatch(new UseAbilityAction(9,'Underworld Door'));
  },{Store:DummyStore,isAbilityBlocked:()=>true}),/owner ID/);
  assert.equal(DummyStore.prototype.dispatch,original);
});
