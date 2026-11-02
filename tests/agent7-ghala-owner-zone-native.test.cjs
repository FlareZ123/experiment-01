'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withGuzmaHalaOwnerZoneLineage
} = require('../simulation/twinleaf/agent7-ghala-owner-zone-lineage.cjs');
const {
  probeGuzmaHalaPayment
} = require('../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs');

for(const seat of [0,1]) {
  for(const paymentCount of [0,1,2]) {
    test('compiled Store source G&H seat '+seat+
      ' optional payment count '+paymentCount, () => {
      const x=withGuzmaHalaOwnerZoneLineage(
        ()=>probeGuzmaHalaPayment(seat,paymentCount));
      const native=x.result;
      const witness=x.audit.events[0];
      assert.equal(native.rootError,null);
      assert.equal(native.choiceFound,true);
      assert.equal(native.paymentPromptFound,true);
      assert.equal(x.audit.observedPaymentPrompts,1);
      assert.equal(witness.ownerSeat,seat);
      assert.equal(witness.requestedCount,paymentCount);
      assert.equal(witness.nativePromptMin,2);
      assert.equal(witness.nativePromptMax,2);
      assert.equal(witness.paperTwoCardZoneWitness,paymentCount===2);
      assert.equal(x.audit.paperTwoCardZoneWitnesses,
        paymentCount===2?1:0);
      assert.equal(x.audit.competitiveGameQualified,false);
      if(paymentCount===2) {
        assert.equal(native.paymentError,null);
        assert.deepEqual(
          native.physicalPaymentCards.map(card=>card.inDiscard),
          [true,true]);
      }
    });
  }
}
