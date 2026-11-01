'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {selectBoundedDoubleExchanges}=
  require('../simulation/twinleaf/agent23-bounded-double-exchanges.cjs');

const card=(id,name)=>({id,fullName:name,energyType:'BASIC'});

/** Derive the resulting opponent hand independently of the selector's key. */
function resultHand(hand,deck,path){
  const names=hand.map(x=>x.fullName);
  for(const {handIndex,deckIndex} of path.swaps){
    names[handIndex]=deck[deckIndex].fullName;
  }
  return JSON.stringify(names.sort());
}

test('bounded two-swap budget visits rare hand composition before repeated paths',()=>{
  const hand=Array.from({length:4},(_,i)=>card(i,'Repeated Energy'));
  const deck=Array.from({length:20},(_,i)=>card(i+4,'Repeated Trainer'));
  deck.push(card(24,'Rare Trainer'));
  const result=selectBoundedDoubleExchanges(hand,deck,4);
  assert.ok(result.available>4);
  assert.equal(result.exchanges.length,4);
  assert.equal(result.eligibleDistinctHandCompositions,2);
  assert.equal(result.testedDistinctHandCompositions,2);
  assert.equal(new Set(result.exchanges.map(p=>
    resultHand(hand,deck,p))).size,2);
  assert.ok(result.exchanges.some(p=>p.swaps.some(x=>
    deck[x.deckIndex].fullName==='Rare Trainer')));
  assert.equal(result.exhaustive,false);
});

test('distinct resulting multiset cancels intermediate printing replacements',()=>{
  const hand=[card(1,'A'),card(2,'B'),card(3,'C')];
  const deck=[card(4,'B'),card(5,'C'),card(6,'D')];
  const result=selectBoundedDoubleExchanges(hand,deck,64);
  assert.equal(result.available,11);
  assert.equal(result.exchanges.length,11);
  assert.equal(result.eligibleDistinctHandCompositions,8);
  assert.equal(result.testedDistinctHandCompositions,8);
  assert.equal(new Set(result.exchanges.map(p=>
    resultHand(hand,deck,p))).size,8);
  assert.equal(result.exhaustive,true);

  const first=result.exchanges.find(p=>p.swaps.some(x=>
    x.handIndex===0&&x.deckIndex===0)&&p.swaps.some(x=>
    x.handIndex===1&&x.deckIndex===2));
  const second=result.exchanges.find(p=>p.swaps.some(x=>
    x.handIndex===0&&x.deckIndex===1)&&p.swaps.some(x=>
    x.handIndex===2&&x.deckIndex===2));
  assert.ok(first&&second);
  assert.equal(first.handCompositionDelta,second.handCompositionDelta);
  assert.equal(resultHand(hand,deck,first),resultHand(hand,deck,second));
});

test('physical path accounting and deterministic selection remain stable',()=>{
  const hand=[card(1,'A'),card(2,'A'),card(3,'B')];
  const deck=[card(4,'C'),card(5,'C'),card(6,'D')];
  const a=selectBoundedDoubleExchanges(hand,deck,5);
  const b=selectBoundedDoubleExchanges(hand,deck,5);
  assert.deepEqual(a,b);
  assert.equal(a.exchanges.length,5);
  for(const entry of a.exchanges){
    assert.equal(entry.swaps.length,2);
    assert.equal(new Set(entry.swaps.map(x=>x.handIndex)).size,2);
    assert.equal(new Set(entry.swaps.map(x=>x.deckIndex)).size,2);
  }
  const none=selectBoundedDoubleExchanges(
    [card(7,'Same'),card(8,'Same')],
    [card(9,'Same'),card(10,'Same')],8);
  assert.equal(none.available,0);
  assert.equal(none.eligibleDistinctHandCompositions,0);
  assert.equal(none.testedDistinctHandCompositions,0);
  assert.equal(none.exhaustive,true);
});
