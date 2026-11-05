'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  independentPutDamageNegative,withPaperPromptContractPortfolio,VERSION
}=require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

const target={player:0,slot:1,index:0};
class ResolvePromptAction{
  /** @param {number} id @param {unknown} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class PutDamagePrompt{
  /** @param {number} budget @param {boolean} partial */
  constructor(budget=70,partial=true){
    this.id=46;
    this.playerId=0;
    this.damage=budget;
    this.result=undefined;
    this.options={allowCancel:false,allowPlacePartialDamage:partial,
      damageMultiple:10};
    this.maxAllowedDamage=[{target,damage:150}];
  }
  /** Pinned upstream optional budget decision. @param {unknown} answer */
  validate(answer){
    if(!Array.isArray(answer))return false;
    return this.options.allowPlacePartialDamage||
      answer.reduce((sum,row)=>sum+row.damage,0)===this.damage;
  }
}
class FakeStore{
  /** @param {object} state */
  constructor(state){this.state=state;this.mutations=0;}
  /** @param {object} action */
  dispatch(action){
    this.mutations++;
    this.state.prompts[0].result=action.result;
    return {nativeAccepted:true};
  }
}
class IronThornsex{
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  reduceEffect(){return undefined;}
}

/** @param {number} budget */
function fixture(budget=70){
  const prompt=new PutDamagePrompt(budget);
  const state={turn:3,players:[{id:0},{id:1}],prompts:[prompt]};
  return {prompt,state,store:new FakeStore(state)};
}
const deps={Store:FakeStore,IronThornsex,types:{
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{ACTIVE:1,BENCH:2}},currentTrialId:()=> '46:partial'};
/** @param {number} damage */
const allocate=damage=>[{target,damage}];

test('independent common portfolio rejects native-valid excess without relying on native validate',()=>{
  const f=fixture();
  assert.equal(f.prompt.validate(allocate(80)),true,
    'Native optional prompt incorrectly approves 80 against printed max 70');
  assert.equal(independentPutDamageNegative(f.prompt,allocate(80)),
    'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET');
  assert.equal(independentPutDamageNegative(f.prompt,allocate(70)),null);
  f.prompt.validate=()=>false;
  assert.equal(independentPutDamageNegative(f.prompt,allocate(80)),
    'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET',
    'Paper negative check must ignore native validator disagreement');
});

test('common unified Store boundary vetoes 80 before mutation, then accepts 70 as unverified',()=>{
  const f=fixture();
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const out=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(46,allocate(80))),
      /PAPER_PROMPT_INVALID:.*EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET/);
    assert.equal(f.store.mutations,0);
    assert.equal(f.prompt.result,undefined);
    return f.store.dispatch(new ResolvePromptAction(46,allocate(70)));
  },deps);
  assert.deepEqual(out.result,{nativeAccepted:true});
  assert.equal(f.store.mutations,1);
  assert.equal(out.audit.schema,VERSION);
  assert.match(VERSION,/^agent41-unified-paper-prompt-contract-portfolio-v\\d+/);
  assert.equal(out.audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(out.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(out.audit.statusCounts.PAPER_PROMPT_VERIFIED,0,
    'Negative-only contract never certifies complete paper legality');
  assert.equal(out.audit.vetoedBeforeDispatch,1);
  assert.equal(out.audit.nativeAccepted,1);
  assert.equal(out.audit.examples[0].reason,
    'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET');
  assert.strictEqual(
    Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch').value,
    original.value);
});

test('portfolio upper bound preserves legal zero, partial and exact allocations',()=>{
  const f=fixture(90);
  for(const amount of [0,10,30,70,90]){
    assert.equal(independentPutDamageNegative(f.prompt,allocate(amount)),null);
  }
  assert.equal(independentPutDamageNegative(f.prompt,allocate(100)),
    'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET');
});

test('portfolio retains packet, blocked target, negative and overflow vetoes',()=>{
  const f=fixture();
  const blocked={player:0,slot:2,index:0};
  f.prompt.maxAllowedDamage.push({target:blocked,damage:0});
  assert.equal(independentPutDamageNegative(f.prompt,allocate(15)),
    'INVALID_PRINTED_DAMAGE_PACKET');
  assert.equal(independentPutDamageNegative(f.prompt,[{target:blocked,damage:10}]),
    'PRINTED_TARGET_ZERO_CAP');
  assert.equal(independentPutDamageNegative(f.prompt,allocate(-10)),
    'INVALID_DAMAGE_AMOUNT');
  assert.equal(independentPutDamageNegative(f.prompt,[
    {target,damage:Number.MAX_SAFE_INTEGER-1},{target,damage:20}]),
    'INVALID_DAMAGE_TOTAL');
});

test('mandatory prompts remain outside the narrow optional-budget paper certification',()=>{
  const p=new PutDamagePrompt(70,false);
  assert.equal(independentPutDamageNegative(p,allocate(70)),null);
  assert.equal(independentPutDamageNegative(p,allocate(60)),null,
    'Required totals need separate printed-card verification and native preflight');
});
