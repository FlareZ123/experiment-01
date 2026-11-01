'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {exactSignTail,auditSourceGroups}=
  require('../simulation/evaluation/agent50-source-group-sign-sensitivity.cjs');

function makePairs(){
  const rows=[];
  for(let rep=0;rep<8;rep++){
    const slot=rep%2?'B':'A',sourceSeat=slot==='A'?1:0;
    for(const candidate of ['champion-reference','new-moon-lockbreaker-v1']){
      const originalSourceWin=rep<2;
      const changed=rep>=2&&rep<=4;
      const row=(sourceWin)=>({finished:true,
        winner:sourceWin?sourceSeat:1-sourceSeat,
        sourceDealFingerprint:'source-'+rep});
      rows.push({id:[11,rep,slot,candidate].join(':'),
        seed:155000+rep,sourceSeat,candidateSeat:1-sourceSeat,
        samePhysicalInput:true,original:row(originalSourceWin),
        knownDeadBothSeats:row(originalSourceWin||changed)});
    }
  }
  return {pairs:rows};
}

test('finite small exact independent source-group fair-sign tails',()=>{
  assert.deepEqual(exactSignTail(3,0),
    {nonzero:3,oneSidedFavorSource:0.125,twoSided:0.25});
  assert.deepEqual(exactSignTail(0,0),
    {nonzero:0,oneSidedFavorSource:1,twoSided:1});
  assert.deepEqual(exactSignTail(2,2),
    {nonzero:4,oneSidedFavorSource:0.6875,twoSided:1});
});

test('grouped native arms count independent seed only once for two candidates',()=>{
  const x=auditSourceGroups(makePairs());
  assert.equal(x.sourceSeedGroups,8);
  assert.equal(x.dependentCandidatePolicyPairs,16);
  assert.equal(x.nativeAttempts,32);
  assert.equal(x.groupsFavoringSource,3);
  assert.equal(x.groupsFavoringCandidate,0);
  assert.equal(x.tiedGroups,5);
  assert.equal(x.sourceWinCountDelta,6);
  assert.equal(x.signTest.oneSidedFavorSource,0.125);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('duplicate candidate in a source seed group is refused',()=>{
  const x=makePairs();x.pairs[1].id=x.pairs[0].id;
  assert.throws(()=>auditSourceGroups(x),/Duplicate/);
});

test('physical source deal mismatch is a veto rather than silently excluded',()=>{
  const x=makePairs();x.pairs[0].samePhysicalInput=false;
  assert.throws(()=>auditSourceGroups(x));
});

test('reused independent physical seed across groups is a veto',()=>{
  const x=makePairs();
  x.pairs[2].seed=x.pairs[0].seed;
  x.pairs[3].seed=x.pairs[0].seed;
  assert.throws(()=>auditSourceGroups(x));
});
