'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compareHiddenDeckOrders,withRootHiddenOrderProbe}=
  require('../simulation/twinleaf/rank10-hidden-order-live-probe.cjs');

function state() {
  return {
    turn:27,activePlayer:1,prompts:[],
    players:[
      {id:101,deck:{cards:[{fullName:'Opponent'}]}},
      {id:202,deck:{cards:[
        {fullName:'A',id:10},{fullName:'B',id:20}
      ]}}
    ]
  };
}
class FakeBot {
  constructor(client,options,deck) {
    this.client=client;
    this.tactics=[{options:options??{}}];
    this.deck=deck??null;
  }
  decodeNextAction(source) {
    return {top:source.players[1].deck.cards[0].fullName,
      random:Math.random()<0.5?'L':'R'};
  }
}

test('hidden deck reorder is detectable without altering live State or global PRNG',()=>{
  const physical=state(),before=structuredClone(physical);
  const originalRandom=Math.random;
  const result=compareHiddenDeckOrders(
    physical,202,
    ()=>new FakeBot({id:202},{}),
    structuredClone,
    ()=>()=>0.25
  );
  assert.equal(result.deckCards,2);
  assert.equal(result.actionSensitiveToHiddenDeckOrder,true);
  assert.equal(result.physicalOrder.data,'{"top":"A","random":"L"}');
  assert.equal(result.reversedOrder.data,'{"top":"B","random":"L"}');
  assert.equal(result.liveStatePreserved,true);
  assert.deepEqual(physical,before);
  assert.strictEqual(Math.random,originalRandom);
  assert.equal(result.knownDeckMembershipVerified,false);
});

test('source decision wrapper runs ordinary bot action after matched exploratory worlds',()=>{
  const physical=state();
  const original=FakeBot.prototype.decodeNextAction;
  const result=withRootHiddenOrderProbe(FakeBot,
    ()=>new FakeBot({id:202},{}).decodeNextAction(physical),
    structuredClone,
    {turn:27,seat:1,makeRandom:()=>()=>0.25}
  );
  assert.equal(result.events.length,1);
  assert.equal(result.events[0].actionSensitiveToHiddenDeckOrder,true);
  assert.equal(result.result.top,'A');
  assert.equal(result.events[0].liveStatePreserved,true);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,original);
});

test('source decision wrapper restores original method if detached-state checks fail',()=>{
  const physical=state(),original=FakeBot.prototype.decodeNextAction;
  assert.throws(()=>withRootHiddenOrderProbe(
    FakeBot,()=>new FakeBot({id:202},{}).decodeNextAction(physical),
    ()=>{throw Error('clone preflight failed')},
    {turn:27,seat:1,makeRandom:()=>()=>0.25}
  ),/clone preflight failed/);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,original);
});
