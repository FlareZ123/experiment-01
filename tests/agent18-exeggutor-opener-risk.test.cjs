'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {onlyFragileBasicsConditional,validateExactSwap} = require('../scripts/agent18-exeggutor-opener-risk.cjs');

test('source and challenger exact BigInt conditional forced fragile opener fractions', () => {
  assert.equal(onlyFragileBasicsConditional(60,14,1).fraction,'283843/10081280');
  assert.equal(onlyFragileBasicsConditional(60,14,2).fraction,'6923/114560');
  assert.equal(onlyFragileBasicsConditional(60,14,3).fraction,'30659/315040');
});

test('full finite-population enumeration on a small partition', () => {
  const n=9, b=4, fragile=2, hand=3;
  // All combinations with >=1 Basic and no Basic outside the fragile group.
  let valid=0,good=0;
  for(let a=0;a<n;a++)for(let c=a+1;c<n;c++)for(let d=c+1;d<n;d++){
    const hits=[a,c,d];
    if(!hits.some(x=>x<b))continue;
    valid++;
    if(hits.every(x=>x>=b||x<fragile))good++;
  }
  const r=onlyFragileBasicsConditional(n,b,fragile,hand);
  assert.equal(r.probability,good/valid);
});

test('risk is conditional on all held Basics being fragile, not a game loss', () => {
  const r=onlyFragileBasicsConditional(60,14,2);
  assert.ok(r.probability>0 && r.probability<1);
  assert.throws(()=>onlyFragileBasicsConditional(60,14,15));
});

test('source list patch accepts exactly five physical removals and five additions', () => {
  const row=(category,name,count,set,number)=>({category,name,count,printing:{set,number}});
  const source={rank:2,cards:[
    row('Pokémon','Lillipup',2,'CEC','174'),
    row('Pokémon','Herdier',2,'SUM','104'),
    row('Pokémon','Stoutland',1,'BCR','122'),
    row('Energy','Jet Energy',2,'PAL','190'),
    row('Energy','Other Energy',4,'LOT','194'),
    row('Trainer','Other Trainer',28,'CEC','193'),
    row('Pokémon','Other Pokemon',21,'TEF','84')
  ]};
  const candidate={sourceDeckRank:2,cards:[
    row('Pokémon','Exeggcute',1,'PLF','4'),
    row('Pokémon','Exeggcute',1,'MEG','4'),
    row('Pokémon','Exeggutor',2,'PLF','5'),
    row('Energy','Jet Energy',3,'PAL','190'),
    ...source.cards.slice(4)
  ]};
  assert.equal(validateExactSwap(source,candidate),true);
  candidate.cards[0].count=2;
  assert.throws(()=>validateExactSwap(source,candidate));
});
