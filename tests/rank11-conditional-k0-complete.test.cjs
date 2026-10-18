'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../results/aichi-2026/registrations/rank11-conditional-firstturn-k0-v1-20261018.json');
const {seedFor}=require('../simulation/evaluation/rank11-conditional-k0-screen-run.cjs');
const {executeAll}=require('../simulation/evaluation/rank11-conditional-k0-complete.cjs');

function partition(p) {
  const start=p*32;
  const records=Array.from({length:32},(_,k)=>{
    const index=start+k;
    return {index,seed:seedFor(index),
      trialId:'rank11-conditional-K0-v1:'+index,
      status:index===500?'selected-K0':'verified-non-K0',
      sourceFirst:index===500,qualifiedCompetitiveGame:false,
      continuedGame:false};
  });
  return {partition:p,registrationSha256:registration.frameSha256,
    attempted:32,records,
    selectedK0:records.filter(r=>r.status==='selected-K0').length,
    verifiedNonK0:records.filter(r=>r.status==='verified-non-K0').length,
    unverifiedDraw:0,screenExceptions:0};
}
test('complete all 512 predeclared attempts with no outcome filtering',()=>{
  const calls=[];
  const r=executeAll({runPartition:p=>{calls.push(p);return partition(p);}});
  assert.deepEqual(calls,Array.from({length:16},(_,i)=>i));
  assert.equal(r.attempts,512);
  assert.equal(r.selectedK0,1);
  assert.equal(r.actualSourceFirst,1);
  assert.equal(r.selectedSeeds[0],seedFor(500));
  assert.equal(r.qualifiedCompetitiveGames,0);
  assert.equal(r.records.length,512);
  assert.match(r.recordsSha256,/^[0-9a-f]{64}$/);
  assert.ok(r.records.every(x=>x.continuedGame===false));
});
test('reject a partition which omits or relabels one frozen trial',()=>{
  assert.throws(()=>executeAll({
    runPartition:p=>{
      const x=partition(p);
      if(p===1)x.records[0].seed=5;
      return x;
    }
  }),{name:'AssertionError'});
});
