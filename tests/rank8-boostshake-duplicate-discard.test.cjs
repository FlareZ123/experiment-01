'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectBoostShakeWindow,inspectBoostShakeWindowAllowDuplicates}=
  require('../simulation/twinleaf/rank8-boostshake-autonomous-policy.cjs');
function own(names){
  return {hand:{cards:names.map(name=>({name}))},
    bench:[{getPokemonCard:()=>({name:'Mega Absol ex'}),tools:[]},
      {getPokemonCard:()=>null,tools:[]}]};
}
test('same-name physical priority copies are legal fallback options',()=>{
  const x=own(['Secret Box','Boost Shake','Float Stone',
    'Dark Patch','Dark Patch','Dark Patch']);
  assert.equal(inspectBoostShakeWindow(x).eligible,false);
  const y=inspectBoostShakeWindowAllowDuplicates(x);
  assert.equal(y.eligible,true);
  assert.deepEqual(y.discardNames,['Dark Patch','Dark Patch','Dark Patch']);
});
test('distinct categories remain preferred and v1 preserved when eligible',()=>{
  const x=own(['Secret Box','Boost Shake','Float Stone',
    'Dark Patch','Dark Patch','VS Seeker']);
  assert.deepEqual(inspectBoostShakeWindowAllowDuplicates(x).discardNames,
    ['Dark Patch','VS Seeker','Dark Patch']);
  const y=own(['Secret Box','Boost Shake','Float Stone',
    'Dark Patch','VS Seeker','Iono']);
  assert.deepEqual(inspectBoostShakeWindowAllowDuplicates(y),
    inspectBoostShakeWindow(y));
});
test('no ghost copies and no bypass of source board restrictions',()=>{
  const x=own(['Secret Box','Boost Shake','Float Stone',
    'Dark Patch','Dark Patch']);
  assert.equal(inspectBoostShakeWindowAllowDuplicates(x).eligible,false);
  x.hand.cards.push({name:'Dark Patch'});
  x.bench[1]={getPokemonCard:()=>({name:'Trubbish'}),tools:[]};
  assert.equal(inspectBoostShakeWindowAllowDuplicates(x).eligible,false);
});
