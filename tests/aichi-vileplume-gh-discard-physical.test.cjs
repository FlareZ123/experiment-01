'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {EXPECTED,exact}=
  require('../scripts/aichi-vileplume-gh-discard-frontier.cjs');

/**
 * Independently deal the registered 60, counting Prizes concretely.
 * A seeded xorshift32 partial Fisher-Yates shuffle selects 14 physical cards.
 * This implementation does not call the exact search-probability functions.
 */
function sample(seed=20261018,n=180000) {
  let state=seed>>>0;
  const random=()=>{state^=state<<13;state^=state>>>17;
    state^=state<<5;return state>>>0;};
  const physical=Object.entries(EXPECTED).flatMap(([key,count])=>
    Array(count).fill(key));
  const protectedGroups=new Set(['o','p','y','g']);
  let valid=0,gh=0,repeat=0,singletonProtected=0;
  for(let sample=0;sample<n;sample++){
    const cards=physical.slice();
    for(let i=0;i<14;i++){
      const other=i+random()%(60-i);
      [cards[i],cards[other]]=[cards[other],cards[i]];
    }
    const opening=cards.slice(0,7);
    if(!opening.some(k=>['b','e','o'].includes(k)))continue;
    valid++;
    const observed=[...opening,cards[13]];
    if(!observed.includes('b')||!observed.includes('e')||
      (!observed.includes('h')&&!observed.includes('t')))continue;
    const activeBunnelby=opening.includes('b');
    const energy=activeBunnelby?['j','c','y','g']:['j'];
    const toolInHand=observed.includes('m');
    const energyInHand=energy.some(k=>observed.includes(k));
    if(toolInHand&&energyInHand)continue;
    const deck=cards.slice(14);
    if(!observed.includes('h')&&!deck.includes('h'))continue;
    if(!toolInHand&&!deck.includes('m'))continue;
    if(!energyInHand&&!energy.some(k=>deck.includes(k)))continue;
    gh++;
    const reserved=new Set();
    function keep(name) {
      const idx=observed.findIndex((card,i)=>card===name&&!reserved.has(i));
      assert.ok(idx>=0);reserved.add(idx);
    }
    keep('b');keep('e');keep(observed.includes('h')?'h':'t');
    if(toolInHand)keep('m');
    if(energyInHand)keep(activeBunnelby?
      ['y','g','c','j'].find(k=>observed.includes(k)):'j');
    const remaining=observed.filter((_,i)=>!reserved.has(i));
    if(remaining.filter(k=>!protectedGroups.has(k)).length>=2)
      singletonProtected++;
    if(remaining.filter(k=>['b','h','t'].includes(k)).length>=2)
      repeat++;
  }
  return {valid,gh,repeat,singletonProtected,
    rates:{gh:gh/valid,protected:singletonProtected/valid,repeat:repeat/valid}};
}

test('180000 physical openings independently audit exact ranked source GH frontier',()=>{
  const expected=exact(EXPECTED).conditionalOnLegalSeven;
  const real=sample();
  assert.ok(real.valid>150000);
  for(const [name,exactRate] of [
    ['gh',expected.ghNeeded],
    ['protected',expected.ghAndTwoNonSingletonOrRepeat],
    ['repeat',expected.ghAndTwoRepeatConnectors]
  ])assert.ok(Math.abs(real.rates[name]-exactRate)<0.003,
    name+' physical sample deviates from independent combinatorics');
  console.log('RANK2_PHYSICAL_180K='+JSON.stringify(real));
});
