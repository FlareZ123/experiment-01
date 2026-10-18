'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {candidatePair}=require('../simulation/twinleaf/newmoon-gengar2-structural-prospective.cjs');

test('physical print provenance is unchanged except the announced two counts',()=>{
  const {source,alternate}=candidatePair();
  assert.equal(source.cards.length,alternate.cards.length);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(alternate.cards.reduce((n,c)=>n+c.count,0),60);
  const changes=[];
  for(let i=0;i<source.cards.length;i++){
    const a=source.cards[i],b=alternate.cards[i];
    assert.equal(a.name,b.name);
    assert.deepEqual(a.printing,b.printing);
    assert.equal(a.category,b.category);
    if(a.count!==b.count)changes.push([a.name,b.count-a.count]);
  }
  assert.deepEqual(changes.sort((x,y)=>x[0].localeCompare(y[0])),
    [['Canceling Cologne',-1],['Gengar & Mimikyu-GX',1]]);
  assert.equal(source.proxyIdCountHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(alternate.proxyIdCountHash,
    '3c1cf2b5fa73a966c23260f3ceb85a5ebd70073cdd805f44b269969bfea2bd33');
  assert.equal(alternate.paperLegalPrintsVerified,false);
});
