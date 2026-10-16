'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {samplePaperRedeal} = require('../simulation/twinleaf/paper-redeal-sampler.cjs');
test('old prizes move to the end', () => {
  const result = samplePaperRedeal({formerDeck:[{fullName:'A',id:1}], oldPrizes:[{fullName:'B',id:2}], random:()=>0.5});
  assert.equal(result.newPrizes[0].id,1);
  assert.equal(result.deck.at(-1).id,2);
});

test('enumerates six physical source orders with exact one-in-three target risk',()=>{
 const formerDeck=[{fullName:'X',id:1},{fullName:'A',id:2},{fullName:'B',id:3}];
 const oldPrizes=[{fullName:'Old',id:4}];let hits=0;
 for(let a=0;a<3;a++)for(let b=0;b<2;b++){
  const seq=[(a+.5)/3,(b+.5)/2];let i=0;
  const r=samplePaperRedeal({formerDeck,oldPrizes,random:()=>seq[i++]});
  hits+=Number(r.newPrizes[0].id===1);
  assert.equal(r.deck.at(-1).id,4);
 }
 assert.equal(hits,2);
});
