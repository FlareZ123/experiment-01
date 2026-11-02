'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeDowsingPayment,PRINTING}=
  require('../simulation/twinleaf/agent30-dowsing-machine-payment-native.cjs');
const {withDowsingMachinePaperPaymentGuard,VERSION}=
  require('../simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs');

/**
 * Genuine pinned native Store fixture, both physical owner seats, using
 * source Dowsing Machine PLS 128 and real target Trainer objects. No
 * naturally shuffled game or competitive result is inferred.
 */
test('source-stamped original PLS payment is native-vetoed for 0/1 and physically settled for 2, in both seats',()=>{
  for(const seat of [0,1]){
    for(const count of [0,1,2]){
      const {result,audit}=withDowsingMachinePaperPaymentGuard(
        ()=>probeDowsingPayment(seat,count));
      assert.equal(result.printing,PRINTING);
      assert.equal(result.nativePaymentPromptSourceCard,PRINTING);
      assert.equal(result.firstPromptFound,true);
      assert.equal(audit.schema,VERSION);
      assert.equal(audit.inspectedRoots,1);
      assert.equal(audit.inspectedPayments,1);
      assert.equal(audit.sourceStampedPayments[0].seat,seat);
      assert.equal(audit.competitiveQualifiedGames,0);
      if(count<2){
        assert.equal(audit.invalidPayments,1);
        assert.equal(audit.acceptedPayments,0);
        assert.equal(audit.settledPhysicalPayments,0);
        assert.match(String(result.paymentError),/PAPER_PROMPT_INVALID/);
        assert.equal(result.nativeRecoveredTarget,false);
        assert.deepEqual(result.paymentDiscarded,[false,false]);
      }else{
        assert.equal(audit.invalidPayments,0);
        assert.equal(audit.acceptedPayments,1);
        assert.equal(audit.settledPhysicalPayments,1);
        assert.equal(result.paymentError,null);
        assert.equal(result.nativeRecoveredTarget,true);
        assert.deepEqual(result.paymentDiscarded,[true,true]);
      }
      console.log('AGENT36_ORIGINAL_DOWSING_GUARDED_NATIVE '+
        JSON.stringify({seat,count,paymentVeto:audit.invalidPayments,
          accepted:audit.acceptedPayments,settled:audit.settledPhysicalPayments,
          sourceStamp:result.nativePaymentPromptSourceCard,
          nativeTargetRecovered:result.nativeRecoveredTarget,
          fullGameQualified:false}));
    }
  }
});
