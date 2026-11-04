'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditPerRankPhysicalSourceSeats:audit}=
  require('../simulation/evaluation/agent10-issue25-per-rank-seat-coverage.cjs');
function row(id,sourceSeat){
  return {id,originalSourceSeat:sourceSeat};
}
test('actual v3 rank/seat cross-tab fails despite global two seats observed',()=>{
  const a=audit([
    row('6:0:A:champion-reference',1),
    row('6:0:A:new-moon-lockbreaker-v1',1),
    row('11:2:B:champion-reference',null),
    row('11:2:B:new-moon-lockbreaker-v1',0)
  ]);
  assert.equal(a.globalBothSourceSeatsObserved,true);
  assert.equal(a.allRanksBothSourceSeatsObserved,false);
  assert.equal(a.verdict,'FAIL');
  assert.deepEqual(a.byRank.map(x=>x.missingSourceSeats),[[0],[1]]);
});
test('source-stamped abort corroborates orientation but not the untested opposite seat',()=>{
  const rows=[
    row('6:0:A:reference',1),row('6:0:A:newmoon',1),
    {...row('11:2:B:reference',null),
      nativeAbortProvenance:{aborted:true,sourceSeat:0,
        sourceDealStatus:'VERIFIED',fullPhysicalDealStatus:'VERIFIED'}},
    row('11:2:B:newmoon',0)];
  const a=audit(rows);
  assert.equal(a.byRank[1].counts[0],2);
  assert.equal(a.byRank[1].counts[1],0);
  assert.equal(a.byRank[1].rows[0].origin,'verified-native-abort');
  assert.equal(a.verdict,'FAIL');
});
test('two seats explicitly observed inside every original-source rank passes only coverage',()=>{
  const a=audit([
    row('6:0:A:candidate',1),row('6:1:B:candidate',0),
    row('11:2:B:candidate',0),row('11:3:A:candidate',1)
  ]);
  assert.equal(a.verdict,'PASS');
  assert.equal(a.allRanksBothSourceSeatsObserved,true);
  assert.equal(a.qualifiedGameCount,0);
});
test('unverified abort source seat does not fill a missing coverage cell',()=>{
  const a=audit([
    row('6:0:A:reference',0),
    {...row('6:1:B:newmoon',null),
      nativeAbortProvenance:{aborted:true,sourceSeat:1,
        sourceDealStatus:'UNRESOLVED',fullPhysicalDealStatus:'VERIFIED'}}
  ]);
  assert.equal(a.verdict,'FAIL');
  assert.equal(a.byRank[0].unresolvedRows,1);
});
test('contradictory direct and native-abort seats fails closed',()=>{
  const a=audit([
    {...row('6:0:A:reference',0),
      nativeAbortProvenance:{aborted:true,sourceSeat:1,
        sourceDealStatus:'VERIFIED',fullPhysicalDealStatus:'VERIFIED'}},
    row('6:1:B:newmoon',1)]);
  assert.equal(a.verdict,'FAIL');
  assert.equal(a.anomalies[0].reason,'contradictory-direct-and-abort-seat');
});
test('malformed registered IDs and empty evidence cannot pass vacuously',()=>{
  assert.equal(audit([]).verdict,'FAIL');
  assert.equal(audit([row('bad-id',0)]).verdict,'FAIL');
});
