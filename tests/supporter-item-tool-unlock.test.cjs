'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {toolSupporterOpportunities}=
  require('../scripts/supporter-item-tool-unlock.cjs');

test('printed-v1 direct Item/Supporter access fractions',()=>{
  const x=toolSupporterOpportunities();
  const expected={
    fieldBlowerOriginal:'416435/1708349',
    fabaSingle:'3752617/29041933',
    blowerSingle:'3752617/29041933',
    fabaOrBlower:'416435/1708349',
    both:'425839/29041933',
    fabaAndStadium:'55803671/1103593454'
  };
  for(const [key,value] of Object.entries(x)){
    assert.equal(String(value.numerator)+'/'+String(value.denominator),
      expected[key],key);
  }
  assert.equal(x.fieldBlowerOriginal.numerator*x.fabaOrBlower.denominator,
    x.fabaOrBlower.numerator*x.fieldBlowerOriginal.denominator);
});
