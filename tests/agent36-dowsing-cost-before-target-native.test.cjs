'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probePaidTrainerAsDowsingTarget,PRINTING}=
  require('../simulation/twinleaf/agent36-dowsing-cost-before-target-native.cjs');

test('original source-printed Dowsing excludes newly paid Trainer before recovery in genuine Store both seats',()=>{
  assert.equal(PRINTING,'Dowsing Machine PLS');
  for(const seat of [0,1]){
    const r=probePaidTrainerAsDowsingTarget(seat);
    assert.equal(r.originalSourceRank,26);
    assert.equal(r.paymentSourceStamp,PRINTING);
    assert.equal(r.nativePaymentValid,true);
    assert.equal(r.paymentPromptClosed,true);
    assert.equal(r.recoveryPromptFound,true);
    assert.equal(r.recoverySourceIsOwnerDiscard,true);
    assert.equal(r.paperNewTrainerWasEligibleAtRecovery,true);
    assert.equal(r.nativeNewTrainerOffered,false);
    assert.equal(r.nativeNewTrainerTargetValidator,false);
    assert.equal(r.existingTargetOffered,true);
    assert.deepEqual(r.preRecoveryPhysicalZones,{
      paidTrainerInHand:true,paidTrainerInDiscard:false,
      paidEnergyInHand:true,paidEnergyInDiscard:false
    });
    assert.deepEqual(r.postRecoveryPhysicalZones,{
      paidTrainerInDiscard:true,paidEnergyInDiscard:true,
      existingTrainerRecovered:true,submittedTrainerStillInHand:false
    });
    assert.equal(r.competitivelyQualified,false);
    console.log('AGENT36_DOWSING_PAPER_SELECTION_GAP '+JSON.stringify(r));
  }
});
