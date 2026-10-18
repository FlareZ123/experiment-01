'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../results/aichi-2026/registrations/rank11-conditional-firstturn-k0-v1-20261018.json');
const {seedFor,verifyRegistration,executePartition}=
  require('../simulation/evaluation/rank11-conditional-k0-screen-run.cjs');

test('fixed prospective digest, 512 nonzero unique SHA256 seeds and sample values',()=>{
  assert.equal(verifyRegistration(),true);
  assert.equal(seedFor(0),2386114251);
  assert.equal(seedFor(1),2501497861);
  assert.equal(seedFor(7),866771461);
  assert.equal(new Set(Array.from({length:512},(_,i)=>seedFor(i))).size,512);
  assert.throws(()=>seedFor(512),/AssertionError/);
  assert.throws(()=>verifyRegistration({...registration,seedBase:1}),
    /digest mismatch/i);
});
test('a 32-index partition retains K0, non-K0, exception and unverified draw',()=>{
  const visited=[];
  const out=executePartition({partition:0,verifyBlobs:false,
    screenOne(seed,index){
      visited.push([seed,index]);
      if(index===1)throw Error('constructed source setup exception');
      if(index===2)return {sourceFirst:true,eligibleK0:true,
        verifiedByDrawLog:false,actualFirstPlayerSeat:0};
      if(index===0)return {sourceFirst:true,eligibleK0:true,
        verifiedByDrawLog:true,firstDrawLogName:'research-A',
        actualFirstPlayerSeat:0,sourceStarter:'Oranguru V',
        sourceOwnHandPrintings:['Oranguru V ASR 133','Float Stone BKT 137']};
      return {sourceFirst:false,eligibleK0:false,
        verifiedByDrawLog:true,actualFirstPlayerSeat:1,
        sourceOwnHandPrintings:['should-be-inaccessible']};
    }});
  assert.equal(out.registeredAttemptCount,512);
  assert.equal(out.attempted,32);
  assert.equal(out.selectedK0,1);
  assert.equal(out.verifiedNonK0,29);
  assert.equal(out.unverifiedDraw,1);
  assert.equal(out.screenExceptions,1);
  assert.equal(visited.length,32);
  assert.deepEqual(out.indices,[0,31]);
  assert.equal(out.records[0].sourceStarter,'Oranguru V');
  assert.equal(out.records[0].status,'selected-K0');
  assert.equal(out.records[1].status,'screen-exception');
  assert.equal(out.records[2].status,'unverified-first-draw');
  assert.ok(out.records.slice(3).every(x=>x.sourceOwnHandPrintings===null));
  assert.equal(out.qualifiedCompetitiveGames,0);
  assert.ok(out.records.every(x=>x.continuedGame===false &&
    x.qualifiedCompetitiveGame===false));
});
test('predeclared partitions cover the entire 512-attempt source frame without overlap',()=>{
  const seen=new Set();
  for(let p=0;p<16;p++) {
    const out=executePartition({partition:p,verifyBlobs:false,
      screenOne:()=>({verifiedByDrawLog:true,sourceFirst:false,
        eligibleK0:false,actualFirstPlayerSeat:1})});
    assert.equal(out.attempted,32);
    for(const row of out.records) {
      assert.equal(seen.has(row.index),false);
      seen.add(row.index);
    }
  }
  assert.equal(seen.size,512);
  assert.throws(()=>executePartition({partition:16,verifyBlobs:false,
    screenOne:()=>null}),/outside precommitted/);
});
