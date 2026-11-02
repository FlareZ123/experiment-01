'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,anytimeBalancedPairedSignBetting}=
  require('../simulation/evaluation/agent46-anytime-balanced-paired-sign-betting.cjs');
const {anytimeBalancedPairedFieldDelta}=
  require('../simulation/evaluation/agent46-anytime-balanced-paired-field-delta.cjs');

/** @param {number} C @param {number} n */
function grid(C=32,n=7){
  return Array.from({length:C},(_,i)=>Array.from({length:n},(_,j)=>({
    pairId:'cell'+i+'-round'+j,roundId:'round-'+j,
    referenceFingerprint:'deal-'+i+'-'+j,
    challengerFingerprint:'deal-'+i+'-'+j,
    referenceStatus:'QUALIFIED_NONWIN',
    challengerStatus:'QUALIFIED_NONWIN'
  })));
}
/** @param {ReturnType<typeof grid>} cells @param {string} [direction] @param {number} [ordinal] */
function check(cells,direction='CHALLENGER_BETTER',ordinal=1){
  return anytimeBalancedPairedSignBetting({
    candidateOrdinal:ordinal,cells,direction,alpha:0.05,independentAcrossCells:true
  });
}

test('no registered round carries no evidence in either direction',()=>{
  const a=check(grid(32,0));
  assert.equal(VERSION,'agent46-anytime-balanced-paired-sign-betting-v1');
  assert.equal(a.completedRounds,0);
  assert.equal(a.registeredPairs,0);
  assert.ok(Math.abs(a.logEValue)<1e-12);
  assert.ok(Math.abs(a.eValue-1)<1e-12);
  assert.equal(a.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(a.competitiveQualified,false);
});

test('seven sparse qualified discordances pass familywise test while Hoeffding does not',()=>{
  const cells=grid();
  for(let round=0;round<7;round++)cells[0][round].challengerStatus='QUALIFIED_WIN';
  const before=JSON.stringify(cells);
  const result=check(cells);
  const band=anytimeBalancedPairedFieldDelta({
    candidateOrdinal:1,cells,alpha:0.05
  });
  assert.equal(result.registeredPairs,224);
  assert.equal(result.positivePairs,7);
  assert.equal(result.negativePairs,0);
  assert.equal(result.neutralPairs,217);
  assert.ok(Math.abs(result.eValue-45.138572697)<1e-7);
  assert.equal(result.threshold,40);
  assert.equal(result.decision,'DIRECTIONAL_FIELD_IMPROVEMENT_EVIDENCE');
  assert.equal(band.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(JSON.stringify(cells),before);
});

test('six sparse qualified discordances do not meet the selected alpha budget',()=>{
  const cells=grid();
  for(let r=0;r<6;r++)cells[0][r].challengerStatus='QUALIFIED_WIN';
  const result=check(cells);
  assert.equal(result.positivePairs,6);
  assert.ok(result.eValue<result.threshold);
  assert.equal(result.decision,'INSUFFICIENT_INFORMATION');
});

test('equal game outcomes contribute neutral factors',()=>{
  const cells=grid(64,8);
  for(const cell of cells)for(const pair of cell){
    pair.referenceStatus='QUALIFIED_WIN';
    pair.challengerStatus='QUALIFIED_WIN';
  }
  const a=check(cells);
  assert.equal(a.registeredPairs,512);
  assert.equal(a.neutralPairs,512);
  assert.ok(Math.abs(a.eValue-1)<1e-10);
});

test('opposite directional hypothesis must be independently preregistered',()=>{
  const cells=grid();
  for(let r=0;r<7;r++)cells[0][r].referenceStatus='QUALIFIED_WIN';
  const negative=check(cells,'REFERENCE_BETTER');
  const positive=check(cells,'CHALLENGER_BETTER');
  assert.equal(negative.decision,'DIRECTIONAL_FIELD_IMPROVEMENT_EVIDENCE');
  assert.equal(positive.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(positive.positivePairs,0);
  assert.equal(positive.negativePairs,7);
});

test('balanced source ranks with directly opposing effects do not imply field improvement',()=>{
  const cells=grid();
  for(let r=0;r<7;r++){
    cells[0][r].challengerStatus='QUALIFIED_WIN';
    cells[1][r].referenceStatus='QUALIFIED_WIN';
  }
  const result=check(cells);
  assert.equal(result.positivePairs,7);
  assert.equal(result.negativePairs,7);
  assert.ok(result.eValue<1);
  assert.equal(result.decision,'INSUFFICIENT_INFORMATION');
});

test('candidate ordinal raises preregistered Ville threshold',()=>{
  const cells=grid();
  for(let r=0;r<7;r++)cells[0][r].challengerStatus='QUALIFIED_WIN';
  const one=check(cells,'CHALLENGER_BETTER',1);
  const two=check(cells,'CHALLENGER_BETTER',2);
  assert.ok(Math.abs(one.eValue-two.eValue)<1e-10);
  assert.ok(Math.abs(two.threshold-120)<1e-8);
  assert.equal(one.decision,'DIRECTIONAL_FIELD_IMPROVEMENT_EVIDENCE');
  assert.equal(two.decision,'INSUFFICIENT_INFORMATION');
});

test('unqualified native winners are adversarially assigned the worst contrast',()=>{
  const cells=grid();
  for(let r=0;r<7;r++){
    cells[0][r].challengerStatus='CENSORED';
    cells[0][r].nativeWinnerSeat=1;
  }
  const out=check(cells);
  assert.equal(out.ambiguousPairs,7);
  assert.equal(out.negativePairs,0);
  assert.equal(out.positivePairs,0);
  assert.equal(out.eValue,1);
  assert.equal(out.decision,'INSUFFICIENT_INFORMATION');
});

test('fully censored or source-mismatched field cannot create spurious evidence',()=>{
  const cells=grid();
  for(const cell of cells)for(const pair of cell){
    pair.challengerStatus='CENSORED';
    pair.referenceStatus='CENSORED';
  }
  let out=check(cells);
  assert.equal(out.negativePairs,224);
  assert.equal(out.ambiguousPairs,224);
  assert.ok(out.eValue<1);
  assert.equal(out.decision,'INSUFFICIENT_INFORMATION');
  const shift=grid();
  for(let r=0;r<7;r++){
    shift[0][r].challengerStatus='QUALIFIED_WIN';
    shift[0][r].challengerFingerprint='different-source-'+r;
  }
  out=check(shift);
  assert.equal(out.unmatchedPairs,7);
  assert.equal(out.positivePairs,0);
  assert.equal(out.negativePairs,7);
  assert.equal(out.decision,'INSUFFICIENT_INFORMATION');
});

test('one qualified winner and one censored opponent leaves neutral lower score',()=>{
  const cells=grid(32,1);
  cells[0][0].challengerStatus='QUALIFIED_WIN';
  cells[0][0].referenceStatus='CENSORED';
  const result=check(cells);
  assert.equal(result.ambiguousPairs,1);
  assert.equal(result.positivePairs,0);
  assert.equal(result.negativePairs,0);
  assert.equal(result.neutralPairs,32);
  assert.ok(Math.abs(result.eValue-1)<1e-10);
});

test('128 balanced rank/seat/start cells form one field null',()=>{
  const cells=grid(128,7);
  for(let r=0;r<7;r++)cells[127][r].challengerStatus='QUALIFIED_WIN';
  const result=check(cells);
  assert.equal(result.cellCount,128);
  assert.equal(result.registeredPairs,896);
  assert.equal(result.positivePairs,7);
  assert.equal(result.decision,'DIRECTIONAL_FIELD_IMPROVEMENT_EVIDENCE');
});

test('unbalanced rounds, duplicate labels, invalid direction and nonzero null reject',()=>{
  const cells=grid();
  cells[31].pop();
  assert.throws(()=>check(cells),/Balanced confidence/);
  const bad=grid();
  bad[0][2].roundId='wrong';
  assert.throws(()=>check(bad),/unique common registered roundId/);
  assert.throws(()=>check(grid(),'MUTUAL_SUCCESS'),/Predeclare/);
  assert.throws(()=>anytimeBalancedPairedSignBetting({
    candidateOrdinal:1,cells:grid(),direction:'CHALLENGER_BETTER',targetDelta:.1,independentAcrossCells:true
  }),/Predeclare/);
});

test('independence declaration mandatory',()=>{
  assert.throws(()=>anytimeBalancedPairedSignBetting({candidateOrdinal:1,cells:grid(),direction:'CHALLENGER_BETTER'}),/independently sampled across-cell rounds/);
});
