'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {marginalCoupledFieldDelta}=require('../simulation/evaluation/agent3-marginal-coupled-field-delta.cjs');

/** @param {number} n @param {(rank:number,round:number)=>object} choose */
function cohort(n,choose){
  return Array.from({length:32},(_,rank)=>
    Array.from({length:n},(_,round)=>({
      pairId:`rank${rank+1}:round${round}`,roundId:`round${round}`,
      referenceFingerprint:`source-${rank}-${round}`,
      challengerFingerprint:`other-${rank}-${round}`,
      referenceStatus:'QUALIFIED_NONWIN',
      challengerStatus:'QUALIFIED_WIN',
      ...choose(rank,round)
    })));
}

/** @param {object[][]} cells */
function analyse(cells,options={}){
  return marginalCoupledFieldDelta({
    candidateOrdinal:1,cells,independentAcrossCells:true,
    marginalSourceSamplingValidated:true,prospectivelyRegisteredRounds:true,
    ...options
  });
}

test('all fully observed physically mismatched games contribute to unconditional contrast',()=>{
  const r=analyse(cohort(16,()=>({})));
  assert.equal(r.registeredPairs,512);
  assert.equal(r.fullyObservedMismatches,512);
  assert.equal(r.censoredPairs,0);
  assert.equal(r.observedLower,1);
  assert.equal(r.observedUpper,1);
  assert.equal(r.decision,'IMPROVEMENT_ABOVE_TARGET');
  assert.equal(r.competitiveQualified,false);
});

test('all opposite mismatched outcomes give a negative unconditional contrast',()=>{
  const r=analyse(cohort(16,()=>({
    referenceStatus:'QUALIFIED_WIN',challengerStatus:'QUALIFIED_NONWIN'
  })));
  assert.equal(r.observedLower,-1);
  assert.equal(r.observedUpper,-1);
  assert.equal(r.decision,'UNDERPERFORMANCE_BELOW_TARGET');
});

test('censoring retains sharp binary interval without hiding registered attempt',()=>{
  const cells=cohort(4,()=>({
    referenceStatus:'QUALIFIED_NONWIN',challengerStatus:'QUALIFIED_NONWIN'
  }));
  cells[0][0].referenceStatus='CENSORED';
  cells[1][0].challengerStatus='CENSORED';
  const r=analyse(cells);
  assert.equal(r.registeredPairs,128);
  assert.equal(r.censoredPairs,2);
  assert.equal(r.observedLower,-1/128);
  assert.equal(r.observedUpper,1/128);
  assert.equal(r.fullyObservedMismatches,126);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('filtering to matching source deals changes the target and can reverse interpretation',()=>{
  const cells=cohort(2,(_,round)=>round===0?{
    referenceFingerprint:'same',challengerFingerprint:'same'
  }:{
    referenceStatus:'QUALIFIED_WIN',challengerStatus:'QUALIFIED_NONWIN'
  });
  const r=analyse(cells);
  assert.equal(r.matchingSourceOpenings,32);
  assert.equal(r.fullyObservedMismatches,32);
  assert.equal(r.observedLower,0);
  assert.equal(r.observedUpper,0);
  // A posthoc matched-only calculation would report +1 (a different estimand).
  const matched=cells.flat().filter(p=>p.referenceFingerprint===p.challengerFingerprint);
  assert.equal(matched.length,32);
  assert.ok(matched.every(p=>p.referenceStatus==='QUALIFIED_NONWIN'&&
    p.challengerStatus==='QUALIFIED_WIN'));
});

test('matching physical source digests have the same observed contribution',()=>{
  const r=analyse(cohort(16,(rank,round)=>({
    referenceFingerprint:`same-${rank}-${round}`,
    challengerFingerprint:`same-${rank}-${round}`
  })));
  assert.equal(r.differingSourceOpenings,0);
  assert.equal(r.matchingSourceOpenings,512);
  assert.equal(r.observedLower,1);
});

test('fail closed on incomplete field, uneven rounds and duplicated pair identities',()=>{
  assert.throws(()=>analyse(cohort(2,()=>({})).slice(1)),TypeError);
  const uneven=cohort(2,()=>({}));uneven[2].pop();
  assert.throws(()=>analyse(uneven),TypeError);
  const duplicated=cohort(2,()=>({}));duplicated[5][0].pairId=duplicated[0][0].pairId;
  assert.throws(()=>analyse(duplicated),TypeError);
});

test('fail closed on repeated round ids, misaligned round ids and missing fingerprints',()=>{
  const repeated=cohort(2,()=>({}));
  repeated.forEach(cell=>{cell[1].roundId='round0';});
  assert.throws(()=>analyse(repeated),TypeError);
  const misaligned=cohort(2,()=>({}));
  misaligned[4][0].roundId='other';
  assert.throws(()=>analyse(misaligned),TypeError);
  const ungrounded=cohort(2,()=>({}));
  ungrounded[0][0].challengerFingerprint='';
  assert.throws(()=>analyse(ungrounded),TypeError);
});

test('statistical design assertions are explicit and never certify a match',()=>{
  const cells=cohort(2,()=>({}));
  for(const missing of ['independentAcrossCells','marginalSourceSamplingValidated',
    'prospectivelyRegisteredRounds']){
    assert.throws(()=>analyse(cells,{[missing]:false}),TypeError);
  }
  assert.throws(()=>analyse(cells,{candidateOrdinal:0}),TypeError);
  assert.throws(()=>analyse(cells,{alpha:1}),TypeError);
  assert.throws(()=>analyse(cells,{targetDelta:NaN}),TypeError);
  assert.equal(analyse(cells).competitiveQualified,false);
});
