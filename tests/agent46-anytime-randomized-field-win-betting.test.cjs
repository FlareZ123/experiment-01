'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {VERSION,PROTOCOL,assignedCell,anytimeRandomizedFieldWinBetting}=
  require('../simulation/evaluation/agent46-anytime-randomized-field-win-betting.cjs');
const SEED='a'.repeat(64),FIXED='f'.repeat(64),SOURCE='1'.repeat(64);
const COMMIT=createHash('sha256').update(Buffer.from(SEED,'hex')).digest('hex');
/** @param {number} [n] */
function roster(n=32){return Array.from({length:n},(_,i)=>({
  rank:i+1,printed60Sha256:SOURCE,physicalCards:60}));}
/** @param {number} n @param {'RANK'|'RANK_SEAT'|'RANK_SEAT_START'} [layout] */
function games(n,layout='RANK'){
  const C={RANK:32,RANK_SEAT:64,RANK_SEAT_START:128}[layout];
  return Array.from({length:n},(_,i)=>{
    const cell=assignedCell(SEED,i,layout);
    return {trialIndex:i,gameId:'registered-'+i,cell,rank:Math.floor(cell/(C/32))+1,
      candidateSeat:C===32?undefined:Math.floor((cell%(C/32))/(C/64)),
      startingSeat:C===128?cell%2:undefined,candidatePrinted60Digest:FIXED,
      sourcePrinted60Digest:SOURCE,sourceDealFingerprint:(i+1).toString(16).padStart(64,'0'),
      status:'QUALIFIED_WIN',nativeWinnerSeat:0};
  });
}
/** @param {object[]} entries @param {object} [overrides] */
function check(entries,overrides={}){
  return anytimeRandomizedFieldWinBetting({candidateOrdinal:1,
    candidateId:'prospective-synthetic-fixed-60',candidatePrinted60Digest:FIXED,
    layout:'RANK',samplingProtocol:PROTOCOL,randomSeed:SEED,
    precommittedSeedDigest:COMMIT,externalRegistrationId:'sealed-register-01',
    independentFreshGameDraws:true,authenticatedOriginalPrints:roster(),
    games:entries,...overrides});
}
test('deterministic assignment over 32, 64 and 128 cells',()=>{
  assert.equal(VERSION,'agent46-anytime-randomized-field-win-betting-v1');
  for(const layout of ['RANK','RANK_SEAT','RANK_SEAT_START']){
    const C={RANK:32,RANK_SEAT:64,RANK_SEAT_START:128}[layout];
    const cells=Array.from({length:256},(_,i)=>assignedCell(SEED,i,layout));
    assert.deepEqual(cells,Array.from({length:256},(_,i)=>assignedCell(SEED,i,layout)));
    assert.ok(cells.every(x=>x>=0&&x<C));
    assert.ok(new Set(cells).size>20);
  }
});
test('zero trials contain zero qualifying observations and e=1',()=>{
  const r=check([]);
  assert.equal(r.registeredGames,0);assert.equal(r.observedCells,0);
  assert.ok(Math.abs(r.eValue-1)<1e-12);assert.equal(r.competitiveQualified,false);
});
test('1024 all-win hypothetical randomized trials cross the same 99.5 threshold',()=>{
  const a=games(1024),snapshot=JSON.stringify(a),r=check(a);
  assert.equal(r.qualifiedWins,1024);assert.equal(r.observedCells,32);
  assert.ok(r.perCellCounts.some(x=>x!==32));
  assert.ok(Math.abs(r.eValue-46.7020276276)<1e-8);
  assert.equal(r.decision,'EVIDENCE_RANDOMIZED_FIELD_RATE_EXCEEDS_TARGET');
  assert.equal(r.competitiveQualified,false);assert.equal(JSON.stringify(a),snapshot);
});
test('768 perfect synthetic wins remain insufficient',()=>{
  const r=check(games(768));
  assert.ok(Math.abs(r.eValue-16.5843034323)<1e-8);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});
test('single loss or paper-censored native winner blocks hypothetical 1024-run result',()=>{
  const a=games(1024);a[0].status='QUALIFIED_NONWIN';
  const l=check(a);assert.equal(l.qualifiedNonwins,1);assert.ok(l.eValue<40);
  a[0].status='CENSORED';const c=check(a);
  assert.equal(c.censoredGames,1);assert.equal(c.qualifiedWins,1023);
  assert.equal(c.decision,'INSUFFICIENT_INFORMATION');
});
test('three missing originals remain censored in randomized sampling',()=>{
  const a=games(1024),absent=[23,25,28];
  const missing=a.filter(g=>absent.includes(g.rank)).length;
  assert.ok(missing>0);
  const r=check(a,{authenticatedOriginalPrints:roster().filter(x=>!absent.includes(x.rank))});
  assert.equal(r.authenticatedSourceRanks,29);
  assert.equal(r.unadmittedSourceGames,missing);
  assert.equal(r.censoredGames,missing);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});
test('wrong printing and missing physical receipt are pessimistic failures',()=>{
  const a=games(1024);a[0].sourcePrinted60Digest='b'.repeat(64);
  a[1].sourceDealFingerprint='UNKNOWN';const r=check(a);
  assert.equal(r.unadmittedSourceGames,1);assert.equal(r.invalidSourceReceipts,1);
  assert.equal(r.censoredGames,2);
});
test('duplicate physical deal rejects entire test, including censored pairs',()=>{
  const a=games(3);a[1].sourceDealFingerprint=a[0].sourceDealFingerprint;
  a[0].status='CENSORED';a[1].status='CENSORED';
  assert.throws(()=>check(a),/Repeated physical source deal/);
});
test('source-choice tampering, trial skipping and game-id reuse rejected',()=>{
  const a=games(10);a[0].cell=(a[0].cell+1)%32;
  assert.throws(()=>check(a),/misidentified/);
  const b=games(10);b.splice(3,1);
  assert.throws(()=>check(b),/misidentified/);
  const c=games(10);c[9].gameId=c[8].gameId;
  assert.throws(()=>check(c),/misidentified/);
});
test('reject changed random seed, unregistered setup, fake status or roster',()=>{
  const a=games(10);
  assert.throws(()=>check(a,{precommittedSeedDigest:'0'.repeat(64)}),/commitment/);
  assert.throws(()=>check(a,{independentFreshGameDraws:false}),/Missing preregistered/);
  assert.throws(()=>check(a,{externalRegistrationId:''}),/Missing preregistered/);
  assert.throws(()=>check(a,{targetRate:1}),/Missing preregistered/);
  assert.throws(()=>check(a,{authenticatedOriginalPrints:[...roster(),roster()[0]]}),/duplicated/);
  a[0].status='NATIVE_WIN';assert.throws(()=>check(a),/misidentified/);
});
test('64- and 128-cell assigned physical seat and starter cannot be overwritten',()=>{
  for(const layout of ['RANK_SEAT','RANK_SEAT_START']){
    const a=games(80,layout),r=check(a,{layout});
    assert.equal(r.registeredGames,80);
    a[0].candidateSeat=1-a[0].candidateSeat;
    assert.throws(()=>check(a,{layout}),/misidentified/);
    if(layout==='RANK_SEAT_START'){
      const b=games(80,layout);b[0].startingSeat=1-b[0].startingSeat;
      assert.throws(()=>check(b,{layout}),/misidentified/);
    }
  }
});
test('candidate familywise ordinal and lower precommitted benchmark',()=>{
  const a=games(1024),r=check(a,{candidateOrdinal:2});
  assert.ok(Math.abs(r.threshold-120)<1e-9);assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  const low=check(games(128),{targetRate:.5});
  assert.equal(low.decision,'EVIDENCE_RANDOMIZED_FIELD_RATE_EXCEEDS_TARGET');
});
