'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {openingAxes,originalRank}=
  require('../scripts/agent38-hardcluster-lock-choice-overlap.cjs');
const {literalOpeningChance}=
  require('../scripts/agent4-garbotoxin-literal-open.cjs');
const source=require('../results/aichi-2026/full-decklists.json');

test('four source-rank dual-axis exact fractions, including no-Budew case',()=>{
  const expected=new Map([
    [8, ['682689/4338220','2661125507/197276216280',
      '2539354951/2235797117840','21478803553/126554553840']],
    [11,['0/1','68180030335/3517488113568','0/1',
      '68180030335/3517488113568']],
    [16,['80997/284381','13570028727/532952744480',
      '111430883/26892110960','1794721818863/5862480189280']],
    [22,['227563/1578676','0/1','0/1','227563/1578676']]
  ]);
  for(const [rank,ratios] of expected){
    const record=originalRank(source,rank);
    const got=[record.budew,record.directGarbotoxin,
      record.both,record.either];
    got.forEach((v,i)=>assert.equal(
      v.numerator+'/'+v.denominator,ratios[i],rank+' case '+i));
    const old=literalOpeningChance(record.counts);
    assert.ok(Math.abs(old.conditionalProbability-
      record.directGarbotoxin.probability)<1e-13);
    assert.ok(record.either.probability>=record.budew.probability);
    assert.ok(record.either.probability>=
      record.directGarbotoxin.probability);
  }
});

function subsets(xs,k){
  if(k===0)return [[]];
  if(xs.length<k)return [];
  return subsets(xs.slice(1),k-1).map(a=>[xs[0],...a])
    .concat(subsets(xs.slice(1),k));
}

test('independent exact physical toy enumeration accounts for opening vs draw',()=>{
  const physical=['Budew','Trubbish','Float Stone','Boost Shake',
    'Garbodor','Other Basic','A','B','C'];
  const b=original=>['Budew','Trubbish','Other Basic'].includes(original);
  let valid=0, budew=0,direct=0,both=0,either=0;
  for(const opening of subsets([...physical.keys()],3)){
    if(!opening.some(i=>b(physical[i])))continue;
    for(const drawn of physical.keys()){
      if(opening.includes(drawn))continue;
      const seen=new Set([...opening,drawn]);
      const unseen=[...physical.keys()].filter(i=>!seen.has(i));
      for(const prize of subsets(unseen,2)){
        valid++;
        const yesBudew=opening.some(i=>physical[i]==='Budew');
        const yesDirect=['Trubbish','Float Stone','Boost Shake']
          .every(name=>[...seen].some(i=>physical[i]===name)) &&
          ![...seen,...prize].some(i=>physical[i]==='Garbodor');
        if(yesBudew)budew++;
        if(yesDirect)direct++;
        if(yesBudew&&yesDirect)both++;
        if(yesBudew||yesDirect)either++;
      }
    }
  }
  const x=openingAxes({budew:1,trubbish:1,floatStone:1,
    boostShake:1,garbodor:1,basic:3,deckSize:9,
    openingSize:3,prizeCount:2});
  assert.equal(x.denominator,String(valid));
  for(const [axis,n] of Object.entries({budew,directGarbotoxin:direct,
    both,either}))
    assert.equal(x[axis].probability,n/valid);
});

test('zero Boost Shake means zero direct or overlapping Garbotoxin path',()=>{
  const r=originalRank(source,22);
  assert.equal(r.counts.boostShake,0);
  assert.equal(r.directGarbotoxin.probability,0);
  assert.equal(r.both.probability,0);
  assert.equal(r.either.probability,r.budew.probability);
});

test('source population rejects unsupported counts',()=>{
  assert.throws(()=>openingAxes({budew:2,trubbish:2,
    floatStone:4,boostShake:2,garbodor:3,basic:3}));
});
