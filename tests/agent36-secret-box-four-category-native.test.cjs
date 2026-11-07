'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeSecretBoxFourCategories}=
  require('../simulation/twinleaf/agent36-secret-box-four-category-native.cjs');

for(const seat of [0,1]){
  test(`native Secret Box selects all four categories for seat ${seat}`,()=>{
    const result=probeSecretBoxFourCategories(seat);
    assert.equal(result.ownerPromptBound,true);
    assert.equal(result.paymentSourceBound,true);
    assert.equal(result.paymentOfferedCardsAreOwnerHand,true);
    assert.equal(result.searchSourceBound,true);
    assert.equal(result.searchCollectionBound,true);
    assert.equal(result.fogSourceBound,true);
    assert.equal(result.fogCollectionBound,true);
    assert.equal(result.fogEnergyInHand,true);
    assert.equal(result.fogCrystalDiscarded,true);
    assert.deepEqual(result.selected,[
      'Fog Crystal CRE','Powerglass SFA','Ace Trainer AOR','Sky Field ROS'
    ]);
    assert.equal(result.selectedPhysicalCount,4);
    assert.equal(result.deckBefore-result.deckAfter,5);
    assert.equal(result.boxDiscarded,true);
    assert.equal(result.guardAudit.acceptedSearches,1);
    assert.equal(result.guardAudit.vetoedSearches,0);
    assert.equal(result.qualifiedGame,false);
  });
}
