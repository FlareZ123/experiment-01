'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,chooseChargedOwnPromotion}=
  require('../simulation/twinleaf/agent1-charged-promotion-choice.cjs');

/**
 * @param {Array<{side:string,zone:string,attachedEnergyCount:number}>} offered
 * @param {boolean} [allowCancel]
 * @returns {object}
 */
function fixture(offered,allowCancel=false){
  return {actor:{decisionKind:'owner-prompt',ownHand:['Float Stone BKT']},
    prompt:{kind:'ChoosePokemonPrompt',offered,allowCancel}};
}

test('exclusive own-Bench prompt preserves charged attacker instead of first slot',()=>{
  const selected=chooseChargedOwnPromotion(fixture([
    {side:'own',zone:'bench',attachedEnergyCount:0},
    {side:'own',zone:'bench',attachedEnergyCount:3},
    {side:'own',zone:'bench',attachedEnergyCount:1}
  ]));
  assert.deepEqual(selected,{index:1});
  assert.match(VERSION,/charged-promotion/);
});

test('equal attached-card count preserves deterministic native ordering',()=>{
  assert.deepEqual(chooseChargedOwnPromotion(fixture([
    {side:'own',zone:'bench',attachedEnergyCount:2},
    {side:'own',zone:'bench',attachedEnergyCount:2}
  ])),{index:0});
});

test('opponent or mixed target menus delegate to first eligible index',()=>{
  assert.deepEqual(chooseChargedOwnPromotion(fixture([
    {side:'opponent',zone:'bench',attachedEnergyCount:0},
    {side:'opponent',zone:'bench',attachedEnergyCount:4}
  ])),{index:0});
  assert.deepEqual(chooseChargedOwnPromotion(fixture([
    {side:'own',zone:'bench',attachedEnergyCount:0},
    {side:'own',zone:'active',attachedEnergyCount:3}
  ])),{index:0});
});

test('unsupported counts defer; empty mandatory and cancelable menus keep semantics',()=>{
  assert.deepEqual(chooseChargedOwnPromotion(fixture([
    {side:'own',zone:'bench',attachedEnergyCount:1},
    {side:'own',zone:'bench',attachedEnergyCount:null}
  ])),{index:0});
  assert.equal(chooseChargedOwnPromotion(fixture([])),null);
  assert.deepEqual(chooseChargedOwnPromotion(fixture([],true)),{index:null});
});

test('uses only offered public information and does not mutate frozen inputs',()=>{
  const x=Object.freeze(fixture(Object.freeze([
    Object.freeze({side:'own',zone:'bench',attachedEnergyCount:1}),
    Object.freeze({side:'own',zone:'bench',attachedEnergyCount:4})
  ])));
  assert.deepEqual(chooseChargedOwnPromotion(x),{index:1});
  assert.deepEqual(x.prompt.offered.map(v=>v.attachedEnergyCount),[1,4]);
});
