'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeSourceContestSampleEvidence}=
  require('../scripts/agent4-original32-plumeria-flare-census.cjs');

const sample=(seat,ordinal,positive=false)=>({
  seat,ownerRootOrdinal:ordinal,paperScreenedBothPlayable:positive
});

/** @param {object} [override] */
function makeAudit(override={}){
  return {
    contestedOwnerSamples:Array.from({length:8},(_,i)=>sample(0,i+1)),
    bothPlayablePassSamples:[],
    bySeat:{
      0:{
        bothHeldRoots:30,bothNativePlayableRoots:22,
        positiveContestSamples:[sample(0,9,true),sample(0,10,true)],
        earliestNativePositiveContest:sample(0,9,true)
      },
      1:{
        bothHeldRoots:0,bothNativePlayableRoots:0,
        positiveContestSamples:[],earliestNativePositiveContest:null
      }
    },
    ...override
  };
}

test('per-arm truncation catches 30 held roots despite globally complete capped array',()=>{
  const audit=makeAudit();
  const r=summarizeSourceContestSampleEvidence(audit,0);
  assert.equal(r.sourceExamples.length,8);
  assert.equal(r.positiveExamples.length,2);
  assert.equal(r.sourceExamplesMayBeTruncated,true);
  assert.equal(r.positiveExamplesMayBeTruncated,true);
  assert.equal(r.auditSamplesMayBeTruncated,true);
  assert.equal(r.positiveWitnessStatus,'captured');
  assert.equal(r.firstNativePositiveSourceWitness.ownerRootOrdinal,9);
});

test('first native-positive per source survives absence from global contested examples',()=>{
  const positives=[sample(0,131,true)];
  const audit=makeAudit({
    contestedOwnerSamples:Array.from({length:128},(_,i)=>sample(0,i+1)),
    bySeat:{
      0:{bothHeldRoots:131,bothNativePlayableRoots:1,
        positiveContestSamples:positives,
        earliestNativePositiveContest:positives[0]},
      1:{bothHeldRoots:0,bothNativePlayableRoots:0,
        positiveContestSamples:[],earliestNativePositiveContest:null}
    }
  });
  const r=summarizeSourceContestSampleEvidence(audit,0);
  assert.equal(r.firstNativePositiveSourceWitness.ownerRootOrdinal,131);
  assert.equal(r.positiveExamples.length,1);
  assert.equal(r.positiveWitnessStatus,'captured');
  assert.equal(r.sourceExamplesMayBeTruncated,true);
  assert.equal(r.positiveExamplesMayBeTruncated,false);
});

test('known native positive without separate witness fails closed',()=>{
  const audit=makeAudit({
    contestedOwnerSamples:[],
    bySeat:{
      0:{bothHeldRoots:1,bothNativePlayableRoots:1,
        positiveContestSamples:[],earliestNativePositiveContest:null}
    }
  });
  const r=summarizeSourceContestSampleEvidence(audit,0);
  assert.equal(r.positiveWitnessStatus,'POSITIVE_WITNESS_MISSING');
  assert.equal(r.positiveExamplesMayBeTruncated,true);
});

test('zero native-positive roots report absence rather than missing witness',()=>{
  const r=summarizeSourceContestSampleEvidence(makeAudit(),1);
  assert.equal(r.positiveWitnessStatus,'no-native-positive-root');
  assert.equal(r.sourceExamplesMayBeTruncated,false);
  assert.equal(r.positiveExamplesMayBeTruncated,false);
});

test('positive per-seat evidence does not contaminate other seat',()=>{
  const audit=makeAudit();
  const own=summarizeSourceContestSampleEvidence(audit,0);
  const other=summarizeSourceContestSampleEvidence(audit,1);
  assert.equal(own.positiveExamples[0].seat,0);
  assert.equal(other.positiveExamples.length,0);
  assert.equal(other.sourceExamples.length,0);
});

test('unsupported audit seat fails instead of silently reporting no opportunity',()=>{
  assert.throws(()=>summarizeSourceContestSampleEvidence(makeAudit(),2));
  assert.throws(()=>summarizeSourceContestSampleEvidence({bySeat:{}},0));
});
