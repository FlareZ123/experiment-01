'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,actorChooseAttackInput,chooseActorCopiedAttack,
  withActorOnlyChooseAttack
}=require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/** @param {number} opponentHandCount @param {object[]} [alternatives] */
function menu(opponentHandCount,alternatives=[
  {index:0,name:'Printed Impact',damage:80,damageCalculation:null,
    blocked:false,gxAttack:false}
]){
  return {
    actor:{decisionKind:'owner-prompt',globalTurn:5,
      opponentPublic:{handCount:opponentHandCount},
      ownPublic:{publicTurnRestrictions:{gxUsed:false}}},
    prompt:{kind:'ChooseAttackPrompt',id:92,allowCancel:false,offered:[
      {index:0,printing:'Gengar & Mimikyu-GX TEU',attacks:[
        {index:0,name:'Poltergeist',damage:50,damageCalculation:'MULTIPLIER',
          blocked:false,gxAttack:false}]},
      {index:1,printing:'Test Fixed-Printing XXX',attacks:alternatives}
    ]}
  };
}

test('publicly zero-card opposing hand changes only opted-in copied attack',()=>{
  const zero=menu(0),one=menu(1);
  assert.deepEqual(chooseActorCopiedAttack(zero),
    {sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(zero,
    {preferZeroHandPrintedDamage:true}),{sourceIndex:1,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(one,
    {preferZeroHandPrintedDamage:true}),{sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack({...zero,
    opponentHiddenHand:['SECRET','DO_NOT_USE']},
    {preferZeroHandPrintedDamage:true}),{sourceIndex:1,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(zero,{
    preferGengarPoltergeist:true,preferZeroHandPrintedDamage:true}),
    {sourceIndex:1,attackIndex:0});
});

test('refuses guessed or conditional damage and GX-only alternatives',()=>{
  for(const alternate of [
    {index:0,name:'Unknown',damage:null,damageCalculation:null,
      gxAttack:false,blocked:false},
    {index:0,name:'Variable',damage:100,damageCalculation:'PLUS',
      gxAttack:false,blocked:false},
    {index:0,name:'Special',damage:200,damageCalculation:null,
      gxAttack:true,blocked:false},
    {index:0,name:'Blocked',damage:200,damageCalculation:null,
      gxAttack:false,blocked:true},
    {index:0,name:'Zero',damage:0,damageCalculation:null,
      gxAttack:false,blocked:false}
  ]){
    assert.deepEqual(chooseActorCopiedAttack(menu(0,[alternate]),
      {preferZeroHandPrintedDamage:true}),{sourceIndex:0,attackIndex:0});
  }
});

test('native prompt adapter preserves authentic donor Attack identity',()=>{
  class AddPlayerAction{}
  class ChooseAttackPrompt{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    dispatch(action){this.last=action;return true;}
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:101};}
    decodeNextAction(){throw Error('Unexpected generic scorer');}
  }
  const first={name:'Poltergeist',damage:50,damageCalculation:'MULTIPLIER'};
  const second={name:'Printed Impact',damage:80,damageCalculation:null};
  const pending=new ChooseAttackPrompt();
  Object.assign(pending,{id:45,playerId:101,result:undefined,
    cards:[{fullName:'Gengar & Mimikyu-GX TEU',attacks:[first]},
      {fullName:'Test Fixed-Printing XXX',attacks:[second]}],
    options:{allowCancel:false,blocked:[]}});
  const state={players:[{id:101},{id:202}],prompts:[pending],turn:5};
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const previousDispatch=Store.prototype.dispatch;
  const run=withActorOnlyChooseAttack(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.state=state;
    const action=new SimpleTacticsAi().decodeNextAction(state);
    assert.strictEqual(action.result,second);
    store.dispatch(action);
    return action;
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    preferZeroHandPrintedDamage:true,
    observe:(s,seat)=>actorChooseAttackInput(s,seat,()=>menu(0).actor),
    validate:(s,a)=>{
      assert.strictEqual(s,state);
      assert.strictEqual(a.result,second);
    }
  });
  assert.strictEqual(run.result.result,second);
  assert.equal(run.audit.nativeStores,1);
  assert.equal(run.audit.accepted,1);
  assert.equal(run.audit.rejected,0);
  assert.equal(run.audit.version,
    VERSION+'+agent50-zero-hand-poltergeist-v1');
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,previous);
  assert.strictEqual(Store.prototype.dispatch,previousDispatch);
});
