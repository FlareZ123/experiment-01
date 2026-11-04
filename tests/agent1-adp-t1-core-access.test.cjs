'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  GROUPS,selections,exactAdpInitialActiveCoreOpportunity,
  agent5OriginalCandidateGroups
}=require('../simulation/evaluation/agent1-adp-t1-core-access.cjs');

const FIXED={
  adp:2,doubleDragon:4,guzmaHala:3,tagCall:4,other:47,basics:7
};
const expectedFull={
  initialAdp:'92290059159217920',
  directDoubleDragon:'37606562218854720',
  heldGuzmaHala:'18751154685007360',
  tagCallToGuzmaHala:'16241591574433680',
  combinedCoreAccess:'72599308478295760'
};

function close(actual,expected) {
  assert.ok(Math.abs(actual-expected)<1e-12,
    'Expected '+expected+', received '+actual);
}

/**
 * Enumerate distinct physical card indices independently of the group model.
 * Suitable only for the 9-card verification toy.
 * @param {number[]} arr
 * @param {number} k
 * @returns {number[][]}
 */
function subsets(arr,k) {
  if(k===0)return [[]];
  const result=[];
  for(let i=0;i<arr.length;i++) {
    for(const tail of subsets(arr.slice(i+1),k-1))
      result.push([arr[i],...tail]);
  }
  return result;
}

/** @returns {object} Exactly enumerated 9-card hand/prize/draw worlds. */
function bruteToy() {
  const names=['A','D','D','G','T','b','o','o','o'];
  const physical=names.map((_,i)=>i);
  const numerator={
    initialAdp:0,directDoubleDragon:0,
    heldGuzmaHala:0,tagCallToGuzmaHala:0,combinedCoreAccess:0
  };
  let accepted=0;
  for(const hand of subsets(physical,3)) {
    const handNames=hand.map(i=>names[i]);
    const valid=handNames.includes('A')||handNames.includes('b');
    for(const prizes of subsets(physical.filter(i=>!hand.includes(i)),2)) {
      const remaining=physical.filter(i=>!hand.includes(i)&&!prizes.includes(i));
      for(const draw of remaining) {
        if(!valid)continue;
        accepted++;
        if(!handNames.includes('A'))continue;
        numerator.initialAdp++;
        const held=[...handNames,names[draw]];
        const deck=remaining.filter(i=>i!==draw).map(i=>names[i]);
        let route=null;
        if(held.includes('D'))route='directDoubleDragon';
        else if(deck.includes('D')) {
          if(held.includes('G'))route='heldGuzmaHala';
          else if(held.includes('T')&&deck.includes('G'))
            route='tagCallToGuzmaHala';
        }
        if(route) {
          numerator[route]++;
          numerator.combinedCoreAccess++;
        }
      }
    }
  }
  return {accepted,numerator};
}

test('physical group enumeration has the expected combinatorial count',()=>{
  const rows=selections([1,2,1,1,4],3);
  const total=rows.reduce((n,row)=>n+row.ways,0n);
  assert.equal(total,84n);
  assert.ok(rows.every(row=>row.counts.reduce((s,v)=>s+v,0)===3));
});

test('independent 9-card physical index enumeration verifies 3 mutually exclusive routes',()=>{
  const exact=exactAdpInitialActiveCoreOpportunity({
    adp:1,doubleDragon:2,guzmaHala:1,tagCall:1,
    other:4,basics:2,handSize:3,prizeSize:2
  });
  const brute=bruteToy();
  assert.equal(exact.totals.acceptedWorlds,String(brute.accepted));
  assert.equal(brute.accepted,2940);
  for(const [key,value] of Object.entries(brute.numerator))
    assert.equal(exact.numerators[key],String(value),key);
  assert.equal(brute.numerator.combinedCoreAccess,1440);
});

test('fixed ADP source manifest has exact registered physical counts',()=>{
  assert.deepEqual(agent5OriginalCandidateGroups(),FIXED);
  const supporter=require('../resources/cards/en/sm12.json')
    .find(c=>c.id==='sm12-193');
  const tag=require('../resources/cards/en/sm12.json')
    .find(c=>c.id==='sm12-206');
  const energy=require('../resources/cards/en/xy6.json')
    .find(c=>c.id==='xy6-97');
  assert.equal(supporter.name,'Guzma & Hala');
  assert.ok(supporter.rules.join(' ').includes('discard 2 other cards'));
  assert.ok(supporter.rules.join(' ').includes('Special Energy'));
  assert.ok(tag.rules.join(' ').includes('up to 2 TAG TEAM cards'));
  assert.ok(energy.rules.join(' ').includes('2 Energy at a time'));
  assert.deepEqual(GROUPS,['adp','doubleDragon','guzmaHala','tagCall','other']);
});

test('exact 60-card first-seven then six-Prize then draw-one core opportunity',()=>{
  const x=exactAdpInitialActiveCoreOpportunity(agent5OriginalCandidateGroups());
  assert.equal(x.totals.acceptedWorlds,'250397245379590400');
  assert.deepEqual(x.numerators,expectedFull);
  close(x.probabilities.initialAdp,0.3685745784435869);
  close(x.probabilities.directDoubleDragon,0.15018760354909236);
  close(x.probabilities.heldGuzmaHala,0.07488562686295329);
  close(x.probabilities.tagCallToGuzmaHala,0.06486329971327039);
  close(x.probabilities.combinedCoreAccess,0.289936530125316);
  close(x.probabilities.combinedCoreAccess/x.probabilities.initialAdp,
    0.786642777561212);
  assert.ok(x.probabilities.combinedCoreAccess<=x.probabilities.initialAdp);
});

test('without any DDE or access Supporter routes no core event can fire',()=>{
  const x=exactAdpInitialActiveCoreOpportunity({
    adp:1,doubleDragon:0,guzmaHala:1,tagCall:1,other:6,
    basics:2,handSize:3,prizeSize:2
  });
  assert.equal(x.numerators.combinedCoreAccess,'0');
});
