'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {samplePaperRedeal} = require('../simulation/twinleaf/paper-redeal-sampler.cjs');
test('old prizes move to the end', () => {
  const result = samplePaperRedeal({formerDeck:[{fullName:'A',id:1}], oldPrizes:[{fullName:'B',id:2}], random:()=>0.5});
  assert.equal(result.newPrizes[0].id,1);
  assert.equal(result.deck.at(-1).id,2);
});
