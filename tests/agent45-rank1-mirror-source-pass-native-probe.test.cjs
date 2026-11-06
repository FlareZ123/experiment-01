'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActualOwnerMirrorSourcePassAttackProbe}=
 require('../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

class AddPlayerAction{}
class PassTurnAction{
 constructor(clientId){this.clientId=clientId;}
}
function fixture(){
  const player=(id,label)=>({id,
    active:{getPokemonCard:()=>({fullName:label}),damage:0,
      energies:{cards:[{fullName:'Psychic Energy MEE'}]}},
    bench:[{getPokemonCard:()=>({fullName:'Healthy Bench'}),damage:0}]});
  const owners=[player(1,'Active Source'),player(2,'Active Candidate')];
  class Store{
    constructor(){this.state={players:owners,turn:3,prompts:[]};this.actions=[];}
    dispatch(action){
      this.actions.push(action.constructor.name);
      if(action instanceof PassTurnAction)this.state.turn++;
      return true;
    }
  }
  return {Store,owners};
}
test('records only owner source Pass after real bot choice and never mutates proposed action',()=>{
 const f=fixture();
 const old=f.Store.prototype.dispatch;
 const probe=(state,id)=>{
   assert.equal(id,1);
   assert.equal(state.turn,3);
   return {tested:[{name:'Possible Attack',source:'printed',
     engineAcceptedAnnouncement:true}],truncated:false};
 };
 const x=withActualOwnerMirrorSourcePassAttackProbe(()=>{
   const store=new f.Store();
   store.dispatch(new AddPlayerAction());
   const action=new PassTurnAction(1);
   assert.equal(store.dispatch(action),true);
   assert.deepEqual(store.actions,['AddPlayerAction','PassTurnAction']);
   return 11;
 },{Store:f.Store,probe,sourceSeat:0,trialId:'fixture'});
 assert.equal(x.result,11);
 assert.equal(x.audit.actualStores,1);
 assert.equal(x.audit.selectedSourcePassCount,1);
 assert.equal(x.audit.sourcePasses[0].turn,3);
 assert.equal(x.audit.sourcePasses[0].possibleEngineAttackAnnouncements,1);
 assert.equal(x.audit.sourcePasses[0].visibleActivePrinting,'Active Source');
 assert.equal(x.audit.sourcePasses[0].ownerActiveDamage,0);
 assert.deepEqual(x.audit.sourcePasses[0].ownerBenchVisibleDamage,
   [{printing:'Healthy Bench',damage:0}]);
 assert.deepEqual(x.audit.sourcePasses[0].visibleAttachedEnergyPrintings,
   ['Psychic Energy MEE']);
 assert.equal(x.audit.decisionsChanged,false);
 assert.strictEqual(f.Store.prototype.dispatch,old);
});
test('candidate seat and speculative secondary Store cannot inflate source Pass count',()=>{
 const f=fixture();
 const x=withActualOwnerMirrorSourcePassAttackProbe(()=>{
   const real=new f.Store(),speculative=new f.Store();
   real.dispatch(new AddPlayerAction());
   speculative.dispatch(new PassTurnAction(1));
   real.dispatch(new PassTurnAction(2));
 },{Store:f.Store,probe:()=>({tested:[]}),sourceSeat:0});
 assert.equal(x.audit.selectedSourcePassCount,0);
});
test('postchoice cloned probe failure is recorded without stopping real Pass',()=>{
 const f=fixture();
 const x=withActualOwnerMirrorSourcePassAttackProbe(()=>{
   const real=new f.Store();
   real.dispatch(new AddPlayerAction());
   real.dispatch(new PassTurnAction(1));
 },{Store:f.Store,sourceSeat:0,probe:()=>{throw Error('clone failed');}});
 assert.equal(x.audit.sourcePasses[0].status,'post-choice-probe-error');
 assert.equal(x.audit.auditErrors,1);
 assert.equal(x.audit.selectedSourcePassCount,1);
});
test('original Store dispatch descriptor is restored on native execution throw',()=>{
 const f=fixture(),old=f.Store.prototype.dispatch;
 assert.throws(()=>withActualOwnerMirrorSourcePassAttackProbe(()=>{
   const real=new f.Store();real.dispatch(new AddPlayerAction());
   throw Error('runner terminated');
 },{Store:f.Store,sourceSeat:0,probe:()=>({tested:[]})}),/runner terminated/);
 assert.strictEqual(f.Store.prototype.dispatch,old);
});
