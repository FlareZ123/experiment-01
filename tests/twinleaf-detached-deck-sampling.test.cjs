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
