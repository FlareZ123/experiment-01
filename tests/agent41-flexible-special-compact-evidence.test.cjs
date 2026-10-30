'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {summarize}=require('../simulation/evaluation/agent41-flexible-special-compact-evidence.cjs');

test('native error is not misconstrued as an authenticated source-first physical pair',()=>{
  const trial={rank:10,candidateSlot:'A',id:'10:A'};
  const r=summarize({
    comparisonMode:'public-context',candidate:'unchanged original sixty',
    attempts:2,expectedAttempts:2,pairedPhysicalStarts:0,
    nativeErrors:2,treatmentSpecialSelections:0,
    treatmentSpecialSampleAcceptedLowerBound:0,
    sourceAttackControl:0,sourceAttackTreatment:0,
    rows:[{trial,control:{status:'native-error-unqualified',
      error:'Original Store error'},treatment:{
        status:'native-error-unqualified',error:'Second Store error'},
      comparison:{fullDealMatch:false,sourceDealMatch:false,
        firstPlayerMatch:false,deckAndEngineMatch:false,
        controlStatus:'native-error-unqualified',
        treatmentStatus:'native-error-unqualified',
        controlSpecialSelected:null,treatmentSpecialSelected:null,
        firstDifferentLedgerIndex:null}}]
  });
  assert.equal(r.physicallyAuthenticatedPairs,0);
  assert.equal(r.nativeErrors,2);
  assert.equal(r.rows[0].fixedDealAuthenticated,false);
  assert.equal(r.rows[0].controlError.message,'Original Store error');
  assert.equal(r.rows[0].treatmentError.message,'Second Store error');
  assert.equal(r.rows[0].targetComparison.status,'target-unobserved');
});

test('only genuine accepted Store targets carry their printed recipient',()=>{
  const trial={rank:4,candidateSlot:'B',id:'4:B'};
  const nativeTargetSidecar={observedLiveStore:true,rootOrdinalLinked:true,
    acceptedTargetDispatches:1,targetUnobserved:0,
    events:[{rootActionOrdinal:7,action:'PlayCardAction',
      declared:{ownerHandPrinting:'Unit Energy LPM UPR',
        target:{player:0,slot:1,index:0}},storeAccepted:true,
      publicBoardChanges:[{seat:1,position:'active'}]}]};
  const result=summarize({comparisonMode:'public-context',
    candidate:'original',attempts:2,expectedAttempts:2,
    pairedPhysicalStarts:1,nativeErrors:0,
    treatmentSpecialSelections:1,treatmentSpecialSampleAcceptedLowerBound:1,
    sourceAttackControl:0,sourceAttackTreatment:1,
    rows:[{trial,control:{status:'native-terminal-unqualified'},
      treatment:{status:'native-terminal-unqualified',
        nativeTargetSidecar},
      comparison:{fullDealMatch:true,sourceDealMatch:true,
        firstPlayerMatch:true,deckAndEngineMatch:true,
        controlStatus:'native-terminal-unqualified',
        treatmentStatus:'native-terminal-unqualified',
        controlSpecialSelected:0,treatmentSpecialSelected:1,
        controlSpecialSampleAccepted:0,
        treatmentSpecialSampleAccepted:1,
        firstDifferentLedgerIndex:7}}]});
  assert.equal(result.rows[0].fixedDealAuthenticated,true);
  assert.equal(result.rows[0].treatmentTargetSummary.energyAttachments.length,1);
  assert.equal(result.rows[0].treatmentTargetSummary.energyAttachments[0].rootOrdinal,7);
  assert.equal(result.competitiveQualifiedGames,0);
});
