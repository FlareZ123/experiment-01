'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withGoFirstChoice}=require('../simulation/twinleaf/agent6-go-first-choice.cjs');

class Confirm{constructor(id,playerId,message='GO_FIRST'){
  Object.assign(this,{id,playerId,message});
}}
class Resolve{constructor(id,result){Object.assign(this,{id,result});}}
class Bot{constructor(id){this.client={id};}
  decodeNextAction(){return 'default';}
}
const deps={Bot,Confirm,Resolve,Message:{GO_FIRST:'GO_FIRST'}};
const state=(id,message='GO_FIRST')=>({
  turn:0,prompts:[new Confirm(7,id,message)]
});

test('opening winner chooses per physical seat and method is restored',()=>{
  const old=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  const observed=withGoFirstChoice([true,false],()=>{
    const a=new Bot(101).decodeNextAction(state(101));
    const b=new Bot(202).decodeNextAction(state(202));
    assert.ok(a instanceof Resolve);
    assert.ok(b instanceof Resolve);
    assert.deepEqual([a.result,b.result],[true,false]);
    return 2;
  },deps);
  assert.equal(observed.result,2);
  assert.deepEqual(observed.audit.choices.map(x=>x.seat),[0,1]);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction'),old);
});

test('non-GO_FIRST prompts and other actors preserve default',()=>{
  withGoFirstChoice([true,true],()=>{
    assert.equal(new Bot(101).decodeNextAction(state(101,'OTHER')),'default');
    assert.equal(new Bot(202).decodeNextAction(state(101)),'default');
    assert.equal(new Bot(101).decodeNextAction({turn:0,prompts:[]}),
      'default');
  },deps);
});

test('invalid preferences and thrown games leave old policy intact',()=>{
  const old=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.throws(()=>withGoFirstChoice([true,0],()=>null,deps));
  assert.throws(()=>withGoFirstChoice([true,false],()=>{
    throw new Error('fault');
  },deps),/fault/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction'),old);
});
