'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {keyOf,replacementProbability}=
  require('../scripts/agent38-k0-payment-replacement.cjs');
const rank6=require('../results/aichi-2026/full-decklists.json')
  .decks.find(d=>d.rank===6);

function rank6Printing(name){
  const rows=rank6.cards.filter(row=>row.name===name);
  assert.equal(rows.length,1);
  return keyOf(rows[0]);
}
const sourceSeven=[
  'Iron Thorns ex','Plumeria','Guzma','Crushing Hammer',
  'VS Seeker','Thunder Mountain ♢','Double Colorless Energy'
].map(rank6Printing);

test('source rank6 duplicate payment retains both physical printings',()=>{
  const result=replacementProbability({
    inventory:rank6.cards,seen:sourceSeven,
    spent:[rank6Printing('Plumeria')],
    payment:[rank6Printing('Guzma'),rank6Printing('Crushing Hammer')]
  });
  assert.equal(result.numerator,'22688028');
  assert.equal(result.denominator,'22957480');
  assert.ok(Math.abs(result.probability-
    0.988262997506695)<1e-15);
});

test('same source hand cannot recover two global singleton printings',()=>{
  const result=replacementProbability({
    inventory:rank6.cards,seen:sourceSeven,
    spent:[rank6Printing('Plumeria')],
    payment:[rank6Printing('Thunder Mountain ♢'),
      rank6Printing('Double Colorless Energy')]
  });
  assert.equal(result.numerator,'0');
  assert.equal(result.probability,0);
});

test('independent exhaustive four-card unknown Prize partition agrees',()=>{
  const inventory=[{name:'A',count:3},{name:'B',count:3},
    {name:'C',count:1}];
  const observed=['A','B','C'].map(x=>keyOf({name:x}));
  const p=replacementProbability({inventory,seen:observed,
    spent:[],payment:[keyOf({name:'A'}),keyOf({name:'B'})],
    prizes:2});
  const unseen=['A','A','B','B'];
  let favorable=0,total=0;
  for(let i=0;i<unseen.length;i++)for(let j=i+1;j<unseen.length;j++){
    total++;
    const taken=[unseen[i],unseen[j]];
    if(taken.filter(x=>x==='A').length<2&&
       taken.filter(x=>x==='B').length<2)favorable++;
  }
  assert.equal(favorable,4);
  assert.equal(total,6);
  assert.equal(p.numerator,String(favorable));
  assert.equal(p.denominator,String(total));
});

test('two paid copies of the same printing produce one loss event',()=>{
  const inventory=[{name:'A',count:3},{name:'B',count:3},
    {name:'C',count:1}];
  const observed=['A','A','C'].map(x=>keyOf({name:x}));
  const p=replacementProbability({inventory,seen:observed,
    spent:[],payment:[keyOf({name:'A'}),keyOf({name:'A'})],
    prizes:2});
  assert.equal(p.probability,0.5);
});

test('played Supporter and paid copy cannot reuse the same physical card',()=>{
  const inventory=[{name:'Plumeria',count:4},
    {name:'Other',count:3},{name:'Basic',count:1}];
  const key=x=>keyOf({name:x});
  const observed=['Plumeria','Plumeria','Other','Basic'].map(key);
  const p=replacementProbability({inventory,seen:observed,
    spent:[key('Plumeria')],payment:[key('Plumeria'),key('Other')],
    prizes:2});
  assert.equal(p.numerator,'4');
  assert.equal(p.denominator,'6');
  assert.throws(()=>replacementProbability({inventory,seen:observed,
    spent:[key('Plumeria')],payment:[key('Plumeria'),key('Plumeria')],
    prizes:2}));
});
