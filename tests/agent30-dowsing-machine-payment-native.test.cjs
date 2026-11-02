'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probeDowsingPayment,PRINTING}=
  require('../simulation/twinleaf/agent30-dowsing-machine-payment-native.cjs');

test('original rank26 Dowsing PLS mandatory two-card native prompt audit both seats',()=>{
  assert.equal(PRINTING,'Dowsing Machine PLS');
  for(const seat of [0,1]){
    const rows=[0,1,2].map(count=>probeDowsingPayment(seat,count));
    for(const r of rows){
      assert.equal(r.sourceRank,26);
      assert.equal(r.firstPromptFound,true,JSON.stringify(r));
      assert.equal(r.nativePaymentPromptSourceCard,PRINTING,JSON.stringify(r));
      assert.equal(r.rootError,null,JSON.stringify(r));
      assert.equal(r.nativePaymentLimits.min,2);
      assert.equal(r.nativePaymentLimits.max,2);
      assert.equal(r.paperPaymentValid,r.count===2);
      assert.equal(r.competitivelyQualified,false);
      console.log('AGENT30_RANK26_DOWSING_PAYMENT '+JSON.stringify(r));
    }
    assert.equal(rows[2].nativePaymentValidatorAccepted,true);
    assert.equal(rows[0].nativePaymentValidatorAccepted,false);
    assert.equal(rows[1].nativePaymentValidatorAccepted,false);
  }
});

// The original diagnostic retains its unguarded negative controls. These
// additional tests are separate source-stamped, default-off corrected Store
// cases under the same existing manually dispatched native CI suite.
require('./agent36-dowsing-payment-guard.test.cjs');
require('./agent36-dowsing-payment-guard.native.test.cjs');
