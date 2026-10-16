'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {evaluateDetachedDeckSamples}=
  require('../simulation/twinleaf/detached-deck-sampling.cjs');
const random=seed=>{let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}};
const permutation=(n,rng)=>{const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const opts={seed:77,samples:8,random,permutation,
  isCard:x=>'fullName' in x||'damageTakenLastTurn' in x};
function setup(reverse=false){const cards=[{id:3,fullName:'A'},{id:5,fullName:'B'},{id:7,fullName:'C'}];const focus={id:31,damageTakenLastTurn:0};return {turn:2,players:[{id:1,deck:{cards:reverse?cards.reverse():cards},active:{cards:[focus]}}]};}
test('same multiset, different hidden order, no live mutation from speculative damage',()=>{
  const a=setup(), b=setup(true);
  const evalFn=state=>{state.players[0].active.cards[0].damageTakenLastTurn=280;state.players[0].deck.cards[0].id+=200;return state.players[0].deck.cards[1].id};
  const score=s=>evaluateDetachedDeckSamples(s,1,{},0,evalFn,null,structuredClone,opts);
  const aBefore=structuredClone(a),bBefore=structuredClone(b);
  assert.equal(score(a),score(b));
  assert.deepEqual(a,aBefore);
  assert.deepEqual(b,bBefore);
});
test('evaluation exception does not touch original state',()=>{
  const state=setup(),snapshot=structuredClone(state);
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,s=>{s.players[0].active.cards[0].damageTakenLastTurn=250;throw Error('probe')},null,structuredClone,opts),/probe/);
  assert.deepEqual(state,snapshot);
});
test('shallow or Card-alias-preserving clone is rejected before scoring',()=>{
  const state=setup();let called=0;
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,()=>{called++;return 0},null,s=>({...s,players:s.players.map(p=>({...p,deck:{cards:p.deck.cards.slice()}}))}),opts),/live Card reference/);
  assert.equal(called,0);
});
test('clone with detached deck but shared active card is rejected before speculative action',()=>{
  const state=setup();let called=0;
  const shallowCardClone=s=>{
    const copied=structuredClone(s);
    copied.players[0].active.cards[0]=s.players[0].active.cards[0];
    return copied;
  };
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,()=>{called++;return 0},null,shallowCardClone,opts),/live Card reference/);
  assert.equal(called,0);
});

test('symbol-keyed hidden Card aliases are rejected',()=>{
  const state=setup();let called=0;const secret=Symbol('hiddenCard');
  const stealth=s=>{const clone=structuredClone(s);clone[secret]=s.players[0].active.cards[0];return clone};
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,()=>{called++;return 1},null,stealth,opts),/live Card reference/);
  assert.equal(called,0);
});

test('known card at deck top survives speculative shuffle',()=>{
  const original=setup();
  const seen=[];
  const options={...opts,knownTopCount:1,knownTopVerified:true};
  evaluateDetachedDeckSamples(original,1,{},0,state=>{
    const names=state.players[0].deck.cards.map(card=>card.fullName);
    seen.push(names);
    assert.equal(names[0],'A');
    return 1;
  },null,structuredClone,options);
  assert.equal(seen.length,options.samples);
  assert.equal(original.players[0].deck.cards[0].fullName,'A');
});

test('known top requires observation evidence',()=>{
  assert.throws(()=>evaluateDetachedDeckSamples(
    setup(),1,{},0,()=>1,null,structuredClone,
    {...opts,knownTopCount:1}),/verified observed prefix/);
});

test('reordering unobserved suffix leaves every sampled score unchanged',()=>{
  const a=setup(),b=setup();
  b.players[0].deck.cards.reverse();
  b.players[0].deck.cards.unshift(b.players[0].deck.cards.pop());
  const options={...opts,knownTopCount:1,knownTopVerified:true};
  const score=state=>evaluateDetachedDeckSamples(
    state,1,{},0,
    sample=>sample.players[0].deck.cards[1].id,
    null,structuredClone,options);
  assert.equal(score(a),score(b));
  assert.equal(a.players[0].deck.cards[0].fullName,'A');
  assert.equal(b.players[0].deck.cards[0].fullName,'A');
});
test('known prefix cannot exceed remaining deck',()=>{
  assert.throws(()=>evaluateDetachedDeckSamples(
    setup(),1,{},0,()=>1,null,structuredClone,
    {...opts,knownTopCount:4,knownTopVerified:true}),/exceeds deck length/);
});
