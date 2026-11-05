'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SOURCE,allocations,routeGivenHand,
  routeProbabilityGivenBonus,bilateralRank6Gate}=require(
  '../simulation/evaluation/agent32-rank6-thunder-dce-resource-gate.cjs');

const close=(a,b,e=1e-10)=>assert.ok(Math.abs(a-b)<=e,
  'Mismatch actual '+a+' expected '+b);

test('enumeration conserves category counts and population combinatorics',()=>{
  const rows=allocations([2,1,1,1,1,6],3);
  const {choose}=require('../simulation/evaluation/agent32-source-special-energy-exposure.cjs');
  assert.equal(rows.reduce((s,x)=>s+x.ways,0),choose(12,3));
  assert.ok(rows.every(x=>x.cards.reduce((a,b)=>a+b,0)===3));
});

test('conditional Prize gate keeps direct duo, distinguishes supporter and Tag',()=>{
  assert.equal(routeGivenHand([1,0,0,1,1,3],52,6),1);
  assert.equal(routeGivenHand([1,0,0,0,0,5],52,6),0);
  const targetSafe=46*45/(52*51);
  close(routeGivenHand([1,1,0,0,0,5],52,6),targetSafe);
  assert.ok(routeGivenHand([1,0,1,0,0,5],52,6)<targetSafe);
});

test('rank6 fixed original baseline increases under each elected extra draw',()=>{
  const xs=[0.3378150571059344,0.37591168213206183,
    0.4118520649431129,0.44567631736946045];
  xs.forEach((v,m)=>close(routeProbabilityGivenBonus(m),v,1e-12));
  assert.ok(xs.every((x,i)=>i===0||x>xs[i-1]));
});

test('independent exhaustive tiny physical partitions reproduce hypergeometric sum',()=>{
  const toy={basic:2,guzmaHala:1,tagCall:1,thunderMountain:1,
    doubleColorless:1,other:6};
  const cards=['B','B','G','T','S','D',...Array(6).fill('O')];
  let wins=0,eligible=0;
  for(let a=0;a<(1<<12);a++){
    if(popcount(a)!==3)continue;
    const opening=cards.filter((_,i)=>a&(1<<i));
    if(!opening.includes('B'))continue;
    for(let z=0;z<(1<<12);z++){
      if(z&a||popcount(z)!==2)continue;
      const prize=cards.filter((_,i)=>z&(1<<i));
      for(let i=0;i<12;i++){
        if((a|z)&(1<<i))continue;
        const held=[...opening,cards[i]];
        const safe=!prize.includes('S')&&!prize.includes('D');
        if(safe&&((held.includes('S')&&held.includes('D'))||
          held.includes('G')||(held.includes('T')&&!prize.includes('G'))))wins++;
        eligible++;
      }
    }
  }
  const exact=wins/eligible;
  const derived=routeProbabilityGivenBonus(0,{opening:3,prizes:2,
    ordinaryDraw:1,source:toy});
  close(exact,derived,1e-12);
});
function popcount(n){let c=0;while(n){c+=n&1;n>>=1;}return c;}

test('simultaneous source/candidate mulligan mixtures remain bounded',()=>{
  const seven=bilateralRank6Gate(7,18);
  const fourteen=bilateralRank6Gate(14,18);
  close(seven.routeProbabilityLower,0.35061787159803975,2e-8);
  close(fourteen.routeProbabilityLower,0.3404617487812517,1e-12);
  assert.ok(seven.routeProbabilityLower>fourteen.routeProbabilityUpper);
  assert.ok(seven.unknownTail<1.4e-8);
  assert.ok(fourteen.unknownTail<3e-17);
});

test('physically impossible scenarios are rejected',()=>{
  assert.throws(()=>bilateralRank6Gate(0));
  assert.throws(()=>bilateralRank6Gate(7,47));
  assert.throws(()=>routeProbabilityGivenBonus(50));
  assert.equal(SOURCE.basic,4);
});
