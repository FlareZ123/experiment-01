'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./hood-guard-window-exact.cjs');

/**
 * Exact opening-seven and next-card resource cross-tabulation.
 * The categories are disjoint and their physical card counts total 60.
 * `Darkrai` and `otherBasic` are opening-eligible Basics.
 * All direct opportunities are conditional on an opening with at least
 * one Basic Pokémon, before applying effects/search/attacks or mulligan extras.
 *
 * @param {{darkrai:number,otherBasic:number,status:number,elixir:number,energy:number,janine:number,other:number}} p
 * @returns {object}
 */
function evaluate(p) {
  const groups = Object.values(p);
  assert.equal(groups.length, 7);
  assert.equal(groups.reduce((sum,x)=>sum+x,0),60);
  assert.ok(groups.every(x=>Number.isInteger(x)&&x>=0));
  const numerator = Array(6).fill(0n);
  let valid = 0n;
  const names = [
    'darkraiAndStatus',
    'darkraiStatusJanine',
    'darkraiStatusTwoElixirs',
    'darkraiStatusTwoElixirsEnergy',
    'darkraiStatusTwoElixirsEnergyBothBasicKindsInitially',
    'darkraiStatusTwoElixirsEnergyJanine'
  ];
  const picked=[];
  /**
   * @param {number} index
   * @param {number} remaining
   * @param {bigint} ways
   */
  function enumerate(index,remaining,ways) {
    if(index===groups.length) {
      if(remaining!==0||picked[0]+picked[1]===0)return;
      valid+=ways*53n;
      for(let indexDraw=0;indexDraw<groups.length;indexDraw++) {
        const rem=groups[indexDraw]-picked[indexDraw];
        if(rem<=0)continue;
        const seen=picked.slice();
        seen[indexDraw]+=1;
        const [d,b,s,x,e,j]=seen;
        const present=d>=1&&s>=1;
        const two=present&&x>=2;
        const tests=[
          present,
          present&&j>=1,
          two,
          two&&e>=1,
          two&&e>=1&&picked[0]>=1&&picked[1]>=1,
          two&&e>=1&&j>=1
        ];
        for(let i=0;i<tests.length;i++)if(tests[i])numerator[i]+=ways*BigInt(rem);
      }
      return;
    }
    for(let k=0;k<=Math.min(remaining,groups[index]);k++) {
      picked.push(k);
      enumerate(index+1,remaining-k,ways*choose(groups[index],k));
      picked.pop();
    }
  }
  enumerate(0,7,1n);
  const expected=(choose(60,7)-choose(60-p.darkrai-p.otherBasic,7))*53n;
  assert.equal(valid,expected);
  return Object.fromEntries(names.map((key,i)=>[key,{
    favorable:numerator[i].toString(),
    legalSevenThenOne:valid.toString(),
    conditional:numerator[i]===0n?0:Number(numerator[i])/Number(valid)
  }]));
}

const frozenDeckCounts = Object.freeze({
  darkrai:4,
  otherBasic:7,
  status:8,
  elixir:4,
  energy:13,
  janine:3,
  other:21
});

if(require.main===module){
  process.stdout.write(JSON.stringify({
    schema:'agent15-mega-darkrai-restricted-direct-early-resource-v1',
    deck:'results/aichi-2026/candidate-abyss-eye-mega-darkrai-v0.json',
    hypotheses:evaluate(frozenDeckCounts),
    disclaimer:'Opening physical card access only. Max Elixir hits, legal placement, search, shuffle, Prize cards, supporter timing, switch/retreat, opponent action, and attack success are not modeled.'
  },null,2)+'\n');
}
module.exports={evaluate,frozenDeckCounts};
