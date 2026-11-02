'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,anytimeAbsoluteFieldWinBetting}=
  require('../simulation/evaluation/agent46-anytime-absolute-field-win-betting.cjs');
const ORIGINAL='a'.repeat(64);
const FIXED='f'.repeat(64);

/** @param {number} C @param {number} rounds @param {string} status */
function grid(C=32,rounds=32,status='QUALIFIED_WIN'){
  return Array.from({length:C},(_,cell)=>Array.from({length:rounds},(_,r)=>({
    gameId:'c'+cell+'r'+r,roundId:'round-'+r,
    rank:Math.floor(cell/(C/32))+1,
    candidateSeat:C===32?undefined:Math.floor((cell%(C/32))/(C/64)),
    startingSeat:C===128?cell%2:undefined,
    candidatePrinted60Digest:FIXED,
    sourcePrinted60Digest:ORIGINAL,
    sourceDealFingerprint:(''+(cell*rounds+r+1)).padStart(64,'0'),
    status,nativeWinnerSeat:0,finished:true
  })));
}
/** @param {number} [n] */
function roster(n=32){
  return Array.from({length:n},(_,i)=>({
    rank:i+1,printed60Sha256:ORIGINAL,physicalCards:60
  }));
}
/** @param {ReturnType<typeof grid>} cells @param {object} [opts] */
function check(cells,opts={}){
  return anytimeAbsoluteFieldWinBetting({
    candidateOrdinal:1,candidateId:'fixed-hypothetical-60',
    candidatePrinted60Digest:FIXED,layout:'RANK',
    independentAcrossCells:true,
    authenticatedOriginalPrints:roster(),cells,...opts
  });
}

test('zero complete field rounds give no 99.5% inference',()=>{
  const r=check(grid(32,0));
  assert.equal(VERSION,'agent46-anytime-absolute-field-win-betting-v1');
  assert.equal(r.registeredGames,0);
  assert.ok(Math.abs(r.eValue-1)<1e-12);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified,false);
});

test('1024 perfect hypothetical paper wins cross 99.5 test at k=1',()=>{
  const a=grid();
  const unchanged=JSON.stringify(a);
  const r=check(a);
  assert.equal(r.registeredGames,1024);
  assert.equal(r.qualifiedWins,1024);
  assert.equal(r.censoredGames,0);
  assert.equal(r.qualifiedNonwins,0);
  assert.ok(Math.abs(r.eValue-46.7020276276)<1e-8);
  assert.equal(r.decision,'EVIDENCE_FIELD_RATE_EXCEEDS_TARGET');
  assert.equal(r.competitiveQualified,false);
  assert.equal(JSON.stringify(a),unchanged);
});

test('768 wins with no losses do not establish extreme target yet',()=>{
  const r=check(grid(32,24));
  assert.equal(r.registeredGames,768);
  assert.ok(Math.abs(r.eValue-16.5843034323)<1e-8);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('one paper nonwin prevents optimistic target promotion at 1024 games',()=>{
  const a=grid();
  a[0][0].status='QUALIFIED_NONWIN';
  const r=check(a);
  assert.equal(r.qualifiedWins,1023);
  assert.equal(r.qualifiedNonwins,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.ok(r.eValue<40);
});

test('native winner with censored paper gate is counted as a loss',()=>{
  const a=grid();
  a[0][0].status='CENSORED';
  const r=check(a);
  assert.equal(r.censoredGames,1);
  assert.equal(r.qualifiedWins,1023);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('three absent original ranks block confident field success even with asserted wins',()=>{
  const a=grid();
  const keep=roster().filter(row=>![23,25,28].includes(row.rank));
  const r=check(a,{authenticatedOriginalPrints:keep});
  assert.equal(r.unadmittedSourceGames,3*32);
  assert.equal(r.censoredGames,3*32);
  assert.equal(r.qualifiedWins,29*32);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('wrong original source printing is censored, not authenticated by same name',()=>{
  const a=grid();
  a[5][0].sourcePrinted60Digest='b'.repeat(64);
  const r=check(a);
  assert.equal(r.unadmittedSourceGames,1);
  assert.equal(r.censoredGames,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('duplicated actual original physical setups invalidate independent trials',()=>{
  const a=grid();
  a[1][0].sourceDealFingerprint=a[0][0].sourceDealFingerprint;
  assert.throws(()=>check(a),/Reused original source physical setup/);
});

test('missing original source fingerprint is censored with no favorable selection',()=>{
  const a=grid();
  a[0][0].sourceDealFingerprint='UNKNOWN';
  const r=check(a);
  assert.equal(r.invalidSourceReceipts,1);
  assert.equal(r.censoredGames,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('later candidate ordinal uses a larger prespecified threshold',()=>{
  const a=grid();
  const first=check(a),second=check(a,{candidateOrdinal:2});
  assert.ok(Math.abs(first.eValue-second.eValue)<1e-10);
  assert.ok(Math.abs(second.threshold-120)<1e-8);
  assert.equal(second.decision,'INSUFFICIENT_INFORMATION');
});

test('C64 and C128 require exact original rank/seat/start geometry',()=>{
  for(const C of [64,128]){
    const a=grid(C,1);
    const config={layout:C===64?'RANK_SEAT':'RANK_SEAT_START'};
    const r=check(a,config);
    assert.equal(r.cellCount,C);
    assert.equal(r.registeredGames,C);
    assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
    a[C-1][0].candidateSeat=0;
    assert.throws(()=>check(a,config),/misidentified or incomplete/);
  }
});

test('unbalanced rounds and nonuniform registered round IDs reject',()=>{
  const a=grid();
  a[31].pop();
  assert.throws(()=>check(a),/Each balanced field cell/);
  const b=grid();
  b[31][0].roundId='differing';
  assert.throws(()=>check(b),/misidentified or incomplete/);
});

test('invalid candidate, native statuses, target, assumptions and source roster reject',()=>{
  const a=grid();
  a[0][0].status='NATIVE_ENGINE_WIN';
  assert.throws(()=>check(a),/misidentified or incomplete/);
  a[0][0].status='QUALIFIED_WIN';
  assert.throws(()=>check(a,{candidatePrinted60Digest:'wrong'}),/Predeclare/);
  assert.throws(()=>check(a,{targetRate:1}),/Predeclare/);
  assert.throws(()=>check(a,{independentAcrossCells:false}),/Predeclare/);
  assert.throws(()=>check(a,{authenticatedOriginalPrints:[
    ...roster(),...roster().slice(0,1)
  ]}),/Invalid or repeated/);
});

test('single independent balanced round can test a lower predeclared rate',()=>{
  const r=check(grid(32,1),{targetRate:0.5});
  assert.equal(r.targetRate,0.5);
  assert.equal(r.qualifiedWins,32);
  assert.equal(r.decision,'EVIDENCE_FIELD_RATE_EXCEEDS_TARGET');
});
