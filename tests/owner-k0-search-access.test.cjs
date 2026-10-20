'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {k0TargetCountAccess,k0AllGroupsAccess}=
  require('../simulation/twinleaf/owner-k0-search-access.cjs');

function belief(pool,prizes,known=[]){
  return {pool,prizeCount:prizes,deckCount:pool.length-prizes,
    observedDeckPrintings:known};
}

const inventory=belief(['J','K','L','M'],2);
const flag={uniformUnknownAllocation:true};

test('one desired card is in unknown two-card deck with exact 1/2 chance',()=>{
  const r=k0TargetCountAccess({
    inventory,eligiblePrintings:['J'],minRequired:1,...flag
  });
  assert.equal(r.exactSuccessNumerator,'3');
  assert.equal(r.exactDenominator,'6');
  assert.equal(r.probabilityAtLeastRequired,.5);
  assert.equal(r.expectedDeckCopies,.5);
});

test('two particular printings are jointly accessible with exact 1/6 chance',()=>{
  const target=k0TargetCountAccess({
    inventory,eligiblePrintings:['J','K'],minRequired:2,...flag
  });
  const groups=k0AllGroupsAccess({
    inventory,targetGroups:[
      {key:'donor1',printings:['J']},
      {key:'donor2',printings:['K']}
    ],...flag
  });
  assert.equal(target.exactSuccessNumerator,'1');
  assert.equal(target.exactDenominator,'6');
  assert.equal(target.probabilityAtLeastRequired,1/6);
  assert.equal(groups.exactSuccessNumerator,'1');
  assert.equal(groups.probabilityAllGroups,1/6);
});

test('known exact deck card satisfies one group without reading hidden pool',()=>{
  const some=belief(['A','B','C','D'],2,['Donor 1']);
  const groups=k0AllGroupsAccess({
    inventory:some,
    targetGroups:[
      {key:'known',printings:['Donor 1']},
      {key:'unknown',printings:['A']}
    ],...flag
  });
  assert.equal(groups.probabilityAllGroups,.5);
  assert.deepEqual(groups.groups.map(x=>x.knownDeck),[1,0]);
  const count=k0TargetCountAccess({
    inventory:some,eligiblePrintings:['Donor 1'],
    minRequired:1,...flag
  });
  assert.equal(count.probabilityAtLeastRequired,1);
});

test('missing category cannot be obtained; condition zero and full-deck edge',()=>{
  assert.equal(k0AllGroupsAccess({
    inventory,targetGroups:[
      {key:'present',printings:['J']},
      {key:'missing',printings:['Unavailable']}
    ],...flag
  }).probabilityAllGroups,0);
  assert.equal(k0TargetCountAccess({
    inventory,eligiblePrintings:['J'],minRequired:3,...flag
  }).probabilityAtLeastRequired,0);
  const guaranteed=belief(['Gengar','Trevenant'],0);
  assert.equal(k0AllGroupsAccess({
    inventory:guaranteed,targetGroups:[
      {key:'G',printings:['Gengar']},{key:'T',printings:['Trevenant']}
    ],...flag
  }).probabilityAllGroups,1);
});

test('calculate every two-card Prize subset independently of closed form',()=>{
  const pool=['A','A','B','C','D','E'],P=2;
  const owner=belief(pool,P);
  let count2=0,both=0,total=0;
  for(let i=0;i<pool.length;i++){
    for(let j=i+1;j<pool.length;j++){
      total++;
      const deck=pool.filter((_,n)=>n!==i&&n!==j);
      if(deck.filter(name=>name==='A').length>=2)count2++;
      if(deck.includes('A')&&deck.includes('B'))both++;
    }
  }
  const exact2=k0TargetCountAccess({
    inventory:owner,eligiblePrintings:['A'],minRequired:2,...flag
  });
  const joint=k0AllGroupsAccess({
    inventory:owner,targetGroups:[
      {key:'A',printings:['A']},
      {key:'B',printings:['B']}
    ],...flag
  });
  assert.equal(total,15);
  assert.equal(exact2.exactDenominator,'15');
  assert.equal(exact2.exactSuccessNumerator,String(count2));
  assert.equal(joint.exactSuccessNumerator,String(both));
  assert.equal(joint.probabilityAllGroups,both/total);
});

test('never infer hypergeometric prior, use overlapping classes or malformed inventory',()=>{
  assert.throws(()=>k0TargetCountAccess({
    inventory,eligiblePrintings:['J'],minRequired:1,
    uniformUnknownAllocation:false
  }),/Uniform unknown Prize allocation/);
  assert.throws(()=>k0AllGroupsAccess({
    inventory,targetGroups:[{key:'A',printings:['J']},
      {key:'B',printings:['J','K']}],...flag
  }),/disjoint/);
  assert.throws(()=>k0TargetCountAccess({
    inventory:belief(['J','K','L','M'],6),
    eligiblePrintings:['J'],minRequired:1,...flag
  }),/Complete owner K0 inventory/);
  assert.throws(()=>k0AllGroupsAccess({
    inventory,targetGroups:[
      {key:'same',printings:['J']},
      {key:'same',printings:['K']}
    ],...flag
  }),/Distinct/);
});
