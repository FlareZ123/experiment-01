'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {inspectPaperSupporterQuota}=
  require('../scripts/aichi-campaign-quality-screen.cjs');

function legitimateEvidence(){
  return {
    nativeSupporterQuotaQualified:true,
    paperSupporterDiscipline:{
      version:'agent41-bilateral-native-paper-supporter-discipline-v2-shared-owner-tactic',
      appliesToBothSeats:true,
      nativeSupporterQuotaQualified:true,
      rootDispatchVetoes:[],
      nativeSameTurnSecondSupporters:[],
      nativeUnsettledRoots:[],
      legalSupporterRoots:[{
        schema:'native-paper-supporter-pre-dispatch-v1',
        card:'Cynthia & Caitlin CEC',turn:2,seat:1,quotaBefore:0,
        returnedFromNativeDispatch:true,handCardPhysicallyPresent:true
      }],
      nativeSupporterEvents:[{
        evidenceType:'native-Store-dispatch-postcondition-v1',
        name:'Cynthia & Caitlin CEC',turn:2,seat:1,
        settled:true,repeatOnSameTurn:false,
        supporterTurnBefore:0,supporterTurnAfter:1,
        quotaAdvanced:true,cardInHandAfter:false,supporterLogMatched:true
      }]
    }
  };
}

test('old campaign and unfounded success booleans fail closed',()=>{
  assert.equal(inspectPaperSupporterQuota({}),'unverified');
  assert.equal(inspectPaperSupporterQuota({
    nativeSupporterQuotaQualified:true
  }),'unverified');
  assert.equal(inspectPaperSupporterQuota({
    nativeSupporterQuotaQualified:false,
    paperSupporterDiscipline:legitimateEvidence().paperSupporterDiscipline
  }),'unverified');
});

test('actual paired physical Store postconditions are structurally auditable',()=>{
  const a=legitimateEvidence();
  assert.equal(inspectPaperSupporterQuota(a),
    'self-reported-native-quota-complete');
  assert.equal(inspectPaperSupporterQuota({
    ...a,paperSupporterDiscipline:{...a.paperSupporterDiscipline,
      legalSupporterRoots:[],nativeSupporterEvents:[]}
  }),'self-reported-native-quota-complete',
  'empty lists still identify a live both-seat observer with no Supporter event');
});

test('second logged native Supporter and direct-root veto stay explicit negatives',()=>{
  const a=legitimateEvidence();
  a.paperSupporterDiscipline.nativeSameTurnSecondSupporters.push({
    name:'Sidney FST 241',turn:2,seat:1,
    supporterTurnBefore:1,settled:true
  });
  assert.equal(inspectPaperSupporterQuota(a),'settled-same-turn-repeat');
  a.paperSupporterDiscipline.nativeSameTurnSecondSupporters.length=0;
  a.paperSupporterDiscipline.rootDispatchVetoes.push({
    turn:2,seat:1,card:'Sidney FST 241',
    rejectedBeforeNativeDispatch:true
  });
  assert.equal(inspectPaperSupporterQuota(a),'rejected-illegal-native-root');
});

test('contradictory or missing logger/owner identity blocks promotion',()=>{
  const a=legitimateEvidence();
  for(const mutate of [
    p=>{p.nativeSupporterEvents[0].supporterLogMatched=false;},
    p=>{p.nativeSupporterEvents[0].supporterTurnAfter=2;},
    p=>{p.nativeSupporterEvents[0].cardInHandAfter=true;},
    p=>{p.nativeSupporterEvents[0].seat=0;},
    p=>{p.legalSupporterRoots[0].card='Sidney FST 241';},
    p=>{p.appliesToBothSeats=false;},
    p=>{p.nativeUnsettledRoots=[{settled:false}];},
    p=>{delete p.nativeSupporterEvents;}
  ]){
    const witness=structuredClone(a);
    mutate(witness.paperSupporterDiscipline);
    assert.equal(inspectPaperSupporterQuota(witness),'unverified');
  }
});
