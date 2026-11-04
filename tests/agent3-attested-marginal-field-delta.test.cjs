'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {attestedMarginalFieldDelta}=require(
  '../simulation/evaluation/agent3-attested-marginal-field-delta.cjs');

const H=value=>createHash('sha256').update(value).digest('hex');
const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Build a 32-rank synthetic source register; these fake SHA identifiers
 * are intentionally NOT real paper-deck provenance.
 * @param {{seats?:number[],starts?:(number|null)[],rounds?:number}} options
 * @returns {object}
 */
function fixture({seats=[0,1],starts=[null],rounds=2}={}){
  const originalSources=Array.from({length:32},(_,i)=>({
    rank:i+1,source60Sha256:H('source:'+String(i+1))
  }));
  const cells=[];
  for(const {rank,source60Sha256} of originalSources){
    for(const candidateSeat of seats)for(const firstTurnSeat of starts){
      const samples=[];
      for(let n=0;n<rounds;n++){
        const key=[rank,candidateSeat,firstTurnSeat,n].join(':');
        samples.push({
          pairId:'pair:'+key,roundId:'round:'+n,
          seedBlockSha256:H('seed:'+key),
          source60Sha256,
          reference60Sha256:H('reference'),
          challenger60Sha256:H('challenger'),
          policySha256:H('one-frozen-policy'),
          engineRevision:ENGINE,
          referenceSourceFingerprint:H('reference-source:'+key),
          challengerSourceFingerprint:H('challenger-source:'+key),
          referenceFirstTurnSeat:firstTurnSeat===null?0:firstTurnSeat,
          challengerFirstTurnSeat:firstTurnSeat===null?1:firstTurnSeat,
          referenceStatus:'QUALIFIED_NONWIN',
          challengerStatus:'QUALIFIED_WIN'
        });
      }
      cells.push({rank,candidateSeat,firstTurnSeat,samples});
    }
  }
  return {
    candidateOrdinal:1,alpha:0.05,targetDelta:0,
    reference60Sha256:H('reference'),
    challenger60Sha256:H('challenger'),
    policySha256:H('one-frozen-policy'),
    sourceArtCrosswalkSha256:H('crosswalk'),
    registrationSha256:H('registration'),
    engineRevision:ENGINE,
    randomizationProtocol:'synthetic-independent-rounds-v1',
    originalSources,cells,
    independentAcrossCells:true,
    marginalSourceSamplingValidated:true,
    prospectivelyRegisteredRounds:true
  };
}

test('64-cell two-seat complete original field preserves every registered mismatch',()=>{
  const got=attestedMarginalFieldDelta(fixture());
  assert.equal(got.fieldOriginalRanks,32);
  assert.equal(got.cellCount,64);
  assert.equal(got.completedRounds,2);
  assert.equal(got.registeredPairs,128);
  assert.equal(got.differingSourceOpenings,128);
  assert.equal(got.observedLower,1);
  assert.equal(got.observedUpper,1);
  assert.equal(got.seatCoverage,'BOTH_PHYSICAL_SEATS');
  assert.equal(got.startControl,'NATURAL_FIRST_TURN');
  assert.equal(got.competitiveQualified,false);
  assert.match(got.designSha256,/^[0-9a-f]{64}$/);
});

test('32-cell one-seat input is explicitly denied a full seat-qualified decision',()=>{
  const got=attestedMarginalFieldDelta(fixture({seats:[0],rounds:32}));
  assert.equal(got.registeredPairs,1024);
  assert.equal(got.mathematicalDecision,'IMPROVEMENT_ABOVE_TARGET');
  assert.equal(got.seatCoverage,'ONE_PHYSICAL_SEAT_ONLY');
  assert.equal(got.decision,'INSUFFICIENT_SEAT_COVERAGE');
});

test('the true 128-cell rank-seat-first-turn cross-product is accepted',()=>{
  const got=attestedMarginalFieldDelta(fixture({
    seats:[0,1],starts:[0,1],rounds:2
  }));
  assert.equal(got.cellCount,128);
  assert.equal(got.registeredPairs,256);
  assert.equal(got.startControl,'BALANCED_FIRST_TURN');
  assert.equal(got.seatCoverage,'BOTH_PHYSICAL_SEATS');
});

test('tampered source rank register and duplicate repeated easy opponents fail',()=>{
  const short=fixture();short.originalSources.pop();
  assert.throws(()=>attestedMarginalFieldDelta(short),TypeError);
  const repeated=fixture();repeated.originalSources[31].rank=1;
  assert.throws(()=>attestedMarginalFieldDelta(repeated),TypeError);
  const duplicateCell=fixture();duplicateCell.cells[31].rank=1;
  assert.throws(()=>attestedMarginalFieldDelta(duplicateCell),TypeError);
  const missingRank=fixture();missingRank.cells[31].rank=23;
  assert.throws(()=>attestedMarginalFieldDelta(missingRank),TypeError);
});

test('seat/first-turn permutations must actually cover original field',()=>{
  const onlyOneFirst=fixture({seats:[0],starts:[0,1]});
  assert.throws(()=>attestedMarginalFieldDelta(onlyOneFirst),TypeError);
  const mixed=fixture();mixed.cells[0].firstTurnSeat=0;
  assert.throws(()=>attestedMarginalFieldDelta(mixed),TypeError);
  const falseStarter=fixture({starts:[0,1]});
  falseStarter.cells[0].samples[0].referenceFirstTurnSeat=1;
  assert.throws(()=>attestedMarginalFieldDelta(falseStarter),TypeError);
});

test('each pair has to carry the source, candidate, policy and vendor identities',()=>{
  const changed=[
    ['source60Sha256',H('wrong source')],
    ['reference60Sha256',H('wrong ref')],
    ['challenger60Sha256',H('wrong challenger')],
    ['policySha256',H('wrong policy')],
    ['engineRevision','b'.repeat(40)]
  ];
  for(const [field,replacement] of changed){
    const data=fixture();data.cells[0].samples[0][field]=replacement;
    assert.throws(()=>attestedMarginalFieldDelta(data),TypeError,field);
  }
});

test('same seed block replay, duplicate pair and invalid fingerprints are rejected',()=>{
  const shared=fixture();
  shared.cells[1].samples[0].seedBlockSha256=
    shared.cells[0].samples[0].seedBlockSha256;
  assert.throws(()=>attestedMarginalFieldDelta(shared),TypeError);
  const pair=fixture();pair.cells[1].samples[0].pairId=pair.cells[0].samples[0].pairId;
  assert.throws(()=>attestedMarginalFieldDelta(pair),TypeError);
  const hidden=fixture();hidden.cells[1].samples[0].referenceSourceFingerprint='';
  assert.throws(()=>attestedMarginalFieldDelta(hidden),TypeError);
});

test('registered censoring remains in the denominator and blocks overconfidence',()=>{
  const data=fixture();
  data.cells[0].samples[0].challengerStatus='CENSORED';
  data.cells[1].samples[0].referenceStatus='CENSORED';
  const got=attestedMarginalFieldDelta(data);
  assert.equal(got.registeredPairs,128);
  assert.equal(got.censoredPairs,2);
  assert.equal(got.observedLower,1-1/128);
  assert.equal(got.observedUpper,1);
  assert.equal(got.competitiveQualified,false);
});

test('missing registration/policy/crosswalk identity and unverified design flags fail',()=>{
  for(const field of [
    'reference60Sha256','challenger60Sha256','policySha256',
    'sourceArtCrosswalkSha256','registrationSha256','engineRevision'
  ]){
    const data=fixture();data[field]='unknown';
    assert.throws(()=>attestedMarginalFieldDelta(data),TypeError,field);
  }
  for(const flag of [
    'independentAcrossCells','marginalSourceSamplingValidated',
    'prospectivelyRegisteredRounds'
  ]){
    const data=fixture();data[flag]=false;
    assert.throws(()=>attestedMarginalFieldDelta(data),TypeError,flag);
  }
});

test('32 rounds of synthetically favorable outcomes can pass the pure math gate',()=>{
  const got=attestedMarginalFieldDelta(fixture({rounds:32}));
  assert.equal(got.registeredPairs,2048);
  assert.equal(got.mathematicalDecision,'IMPROVEMENT_ABOVE_TARGET');
  assert.equal(got.decision,'IMPROVEMENT_ABOVE_TARGET');
  assert.equal(got.competitiveQualified,false);
  assert.equal(got.lowerFieldDelta>0,true);
});
