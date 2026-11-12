'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  forestSealRootPolicy,heldStoneOpportunity,nativeAttackDamageCarryover
}=require('../../simulation/evaluation/2026-11/agent36-rank5-held-forest-stone-50801-aba.cjs');

function fixture({heldSeat=0,toolAttached=false,actorSeat=0}={}){
  const seats=[0,1].map(seat=>({
    seat,hand:seat===heldSeat?[{printing:'Forest Seal Stone SIT'}]:[],
    active:{cards:[],tools:[],energies:[]},
    bench:seat===heldSeat?[{
      cards:[{printing:'Galarian Articuno V CRE'}],
      tools:toolAttached?[{printing:'Choice Band GRI'}]:[],
      energies:[]
    }]:[]
  }));
  return {candidateSeat:0,sourceSeat:1,
    physicalTape:{postAcceptedRoots:[{
      rootOrdinal:14,turnBefore:1,actorSeat,
      physicalZones:seats
    }]}};
}

test('held Stone opportunity requires the owner hand and an empty Articuno Tool slot',()=>{
  const opportunity=heldStoneOpportunity(fixture(),0);
  assert.deepEqual(opportunity,{
    seat:0,rootOrdinal:14,turnBefore:1,
    heldPrinting:'Forest Seal Stone SIT',
    openHolderPrinting:'Galarian Articuno V CRE'
  });
});

test('opponent-held Stone is never treated as the candidate owner opportunity',()=>{
  assert.equal(heldStoneOpportunity(fixture({heldSeat:1,actorSeat:0}),0),null);
});

test('an occupied Tool slot is not reported as an opportunity',()=>{
  assert.equal(heldStoneOpportunity(fixture({toolAttached:true}),0),null);
});

test('the root audit distinguishes an enabled treatment from a disabled control',()=>{
  assert.deepEqual(forestSealRootPolicy({
    actorPolicy:{detailedComponentAudits:{root:{
      earlyForestSealRootOptIn:true,earlyForestSealRootOwnerSeat:null
    }}}
  }),{optIn:true,ownerSeat:null});
  assert.deepEqual(forestSealRootPolicy({
    actorPolicy:{detailedComponentAudits:{root:{
      earlyForestSealRootOptIn:false,earlyForestSealRootOwnerSeat:null
    }}}
  }),{optIn:false,ownerSeat:null});
  assert.deepEqual(forestSealRootPolicy({}),{optIn:null,ownerSeat:null});
});

test('native carryover stays separate, bilateral, and explicitly unqualified',()=>{
  const result=nativeAttackDamageCarryover({
    trial:{id:'fixture:1'},sourceSeat:1,candidateSeat:0,roots:[],
    sourceAttackSettlement:{attacks:[]},
    candidateAttackSettlement:{attacks:[]}
  });
  assert.equal(result.trialId,'fixture:1');
  assert.equal(result.source.attacksSettlementsExamined??result.source.attackSettlementsExamined,0);
  assert.equal(result.candidate.attackSettlementsExamined,0);
  assert.equal(result.totalCandidateTwoHitLinks,0);
  assert.equal(result.competitiveGameQualified,false);
});

test('native carryover refuses a missing settlement stream',()=>{
  assert.throws(()=>nativeAttackDamageCarryover({
    sourceSeat:1,candidateSeat:0,roots:[],
    sourceAttackSettlement:{attacks:[]}
  }),/candidate attack settlement stream/);
});
