'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,marginalOwnerSearchValue}=
  require('../simulation/twinleaf/agent22-actor-marginal-search-value.cjs');
const {firstNativeValidBundle}=
  require('../simulation/twinleaf/agent22-sparse-owner-bundles.cjs');

/** @param {string[]} hand @returns {object} */
function actor(hand){
  return Object.freeze({decisionKind:'owner-prompt',
    actorSeat:0,ownHand:Object.freeze([...hand]),
    opponentPublic:Object.freeze({handCount:5})});
}

/** @param {string[]} names @returns {object} */
function prompt(names){
  const cards=names.map(fullName=>({fullName}));
  return {cards:{cards},validate:chosen=>Array.isArray(chosen)&&
    chosen.length<=2&&chosen.every(c=>cards.includes(c))};
}

test('current owner hand changes best legally complete printed bundle',()=>{
  const values={weights:{A:10,B:9,C:7},perCardCost:1};
  const p=prompt(['C','B','A']);
  const before=firstNativeValidBundle(p,2,names=>
    marginalOwnerSearchValue(names,actor([]),values));
  const after=firstNativeValidBundle(p,2,names=>
    marginalOwnerSearchValue(names,actor(['A','A']),values));
  assert.deepEqual(before,[{printings:['A','B']}]);
  assert.deepEqual(after,[{printings:['B','C']}]);
});

test('repeat-copy marginal payoff decreases as physical owner hand grows',()=>{
  const values={weights:{A:10,B:9},perCardCost:0};
  const one=marginalOwnerSearchValue(['A'],actor([]),values);
  const oneHeld=marginalOwnerSearchValue(['A'],actor(['A']),values);
  const twoHeld=marginalOwnerSearchValue(['A'],actor(['A','A']),values);
  assert.equal(one,10);
  assert.equal(oneHeld,5);
  assert.ok(Math.abs(twoHeld-10/3)<1e-10);
  assert.ok(Math.abs(marginalOwnerSearchValue(['A','A'],
    actor(['A']),values)-25/3)<1e-10);
  assert.equal(marginalOwnerSearchValue(['A','B'],
    actor(['A']),values),14);
});

test('optional native prompt may prefer preserving all deck resources',()=>{
  const p=prompt(['A','B','C']);
  const values={weights:{A:0,B:0,C:0},perCardCost:1};
  assert.deepEqual(firstNativeValidBundle(p,2,names=>
    marginalOwnerSearchValue(names,actor([]),values)),
  [{printings:[]}]);
});

test('owner hand permutation is invariant; opponent concealed identities cannot enter',()=>{
  const values={weights:{A:10,B:9,C:7},perCardCost:1};
  const a=actor(['B','A','A']),b=actor(['A','B','A']);
  const c=Object.freeze({...a,opponentPublic:{handCount:5,
    privateIdentity:'DIFFERENT-INACCESSIBLE-VALUE'}});
  const choices=[['A','B'],['A','C'],['B','C'],['A','A']];
  for(const chosen of choices){
    const first=marginalOwnerSearchValue(chosen,a,values);
    assert.equal(first,marginalOwnerSearchValue(chosen,b,values));
    assert.equal(first,marginalOwnerSearchValue(chosen,c,values));
  }
});

test('strict owner prompt and finite nonnegative weight contracts',()=>{
  assert.equal(typeof VERSION,'string');
  const view=actor([]);
  assert.throws(()=>marginalOwnerSearchValue(['A'],
    {decisionKind:'owner-root',ownHand:[]},
    {weights:{A:10},perCardCost:0}));
  assert.throws(()=>marginalOwnerSearchValue(['A'],view,
    {weights:{A:Infinity},perCardCost:0}));
  assert.throws(()=>marginalOwnerSearchValue(['A'],view,
    {weights:{A:1},perCardCost:-1}));
  assert.equal(marginalOwnerSearchValue([],view,
    {weights:{A:1},perCardCost:0}),0);
});
