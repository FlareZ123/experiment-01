'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {conservativelyPayableAttacks,withNativeDeadFirstAttackAudit,VERSION}=
  require('../simulation/twinleaf/agent1-native-dead-first-attack-audit.cjs');

class AddPlayerAction{}
class AttackAction{constructor(clientId,name){this.clientId=clientId;this.name=name;}}
class Store{
  constructor(){this.state={phase:2,activePlayer:0,turn:9,prompts:[],
    players:[{id:10},{id:20}]};this.attacks=[];}
  dispatch(a){if(a instanceof AttackAction)this.attacks.push(a.name);return this.state;}
}
const terminal={name:'Terminal Period',cost:[7,9],damage:0};
const claw={name:'Claw of Darkness',cost:[7,7,9],damage:200};
const getLost={name:'Get Lost',cost:[9],damage:0};
const mindShock={name:'Mind Shock',cost:[9,9,9],damage:70};
const catalog={
  basicEnergies:new Set(['Darkness Energy MEE','Psychic Energy MEE']),
  basicEnergyTypes:{Darkness:7,Psychic:5},colorlessEnergyType:9
};
const view=()=>({
  decisionKind:'owner-root',
  ownPublic:{active:{
    printing:'Mega Absol ex M1L',energies:[
      'Darkness Energy MEE','Darkness Energy MEE','Darkness Energy MEE'],
    attacks:[terminal,claw]
  }},
  opponentPublic:{active:{printing:'Mimikyu GRI',damage:0},
    discard:[]}
});
const deps={Store,AttackAction,GamePhase:{PLAYER_TURN:2},
  catalog,observe:view};

test('three Basic Darkness pay both native Mega Absol costs',()=>{
  const paid=conservativelyPayableAttacks(view(),catalog);
  assert.deepEqual(paid.map(a=>a.name),
    ['Terminal Period','Claw of Darkness']);
  const v=view();v.ownPublic.active.energies.pop();
  assert.deepEqual(conservativelyPayableAttacks(v,catalog)
    .map(a=>a.name),['Terminal Period']);
  v.ownPublic.active.energies=['Double Colorless Energy SUM'];
  assert.deepEqual(conservativelyPayableAttacks(v,catalog),[]);
});
test('actual owner Terminal Period chosen despite non-60 damage is counted',()=>{
  const old=Store.prototype.dispatch;
  const x=withNativeDeadFirstAttackAudit(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(10,'Terminal Period'));
    return store.attacks;
  },deps);
  assert.strictEqual(Store.prototype.dispatch,old);
  assert.deepEqual(x.result,['Terminal Period']);
  assert.equal(x.audit.version,VERSION);
  assert.equal(x.audit.realAttackRoots,1);
  assert.equal(x.audit.eligibleDeadLeadingRoots,1);
  assert.equal(x.audit.witnesses[0].alternatePaidAttackName,
    'Claw of Darkness');
  assert.equal(x.audit.qualification.counterfactualAttackSettled,false);
});
test('does not count lethal Terminal Period at exactly six counters',()=>{
  const v=view();v.opponentPublic.active.damage=60;
  const x=withNativeDeadFirstAttackAudit(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(10,'Terminal Period'));
  },{...deps,observe:()=>v});
  assert.equal(x.audit.realAttackRoots,1);
  assert.equal(x.audit.eligibleDeadLeadingRoots,0);
});
test('public empty-discard Girafarig first attack qualifies with three Basic Energy',()=>{
  const v=view();
  v.ownPublic.active.printing='Girafarig LOT';
  v.ownPublic.active.attacks=[getLost,mindShock];
  v.ownPublic.active.energies=Array(3).fill('Psychic Energy MEE');
  const x=withNativeDeadFirstAttackAudit(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(10,'Get Lost'));
  },{...deps,observe:()=>v});
  assert.equal(x.audit.eligibleDeadLeadingRoots,1);
  assert.equal(x.audit.witnesses[0].alternatePaidAttackName,'Mind Shock');
});
test('foreign-owner, unresolved prompt and non-live cloned dispatch are ignored',()=>{
  const x=withNativeDeadFirstAttackAudit(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(20,'Terminal Period'));
    store.state.prompts=[{result:undefined}];
    store.dispatch(new AttackAction(10,'Terminal Period'));
    const clone=new Store();
    clone.dispatch(new AttackAction(10,'Terminal Period'));
  },deps);
  assert.equal(x.audit.realAttackRoots,0);
  assert.equal(x.audit.eligibleDeadLeadingRoots,0);
});
test('reversible Store dispatch restored after workload throws',()=>{
  const old=Store.prototype.dispatch;
  assert.throws(()=>withNativeDeadFirstAttackAudit(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    throw Error('Synthetic failure');
  },deps),/Synthetic failure/);
  assert.strictEqual(Store.prototype.dispatch,old);
});
