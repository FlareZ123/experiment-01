'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {run,SEEDS}=require('../../simulation/evaluation/agent1-rank3-owner-zone-scan.cjs');

test('sixteen complementary original rank-3 source-seat-1 deals preserve native parity and owner-only observation',
  {timeout:600000},()=>{
    const result=run(1);
    assert.equal(result.controlsPass,true,JSON.stringify({
      summary:result.summary,
      failures:result.rows.filter(row=>!row.parityPass).map(row=>({
        seed:row.case.seed,status:row.status,error:row.error,parity:row.parity
      }))
    },null,2));
    assert.equal(result.sourceSeat,1);
    assert.equal(result.candidateSeat,0);
    assert.match(result.caveat,/source-seat-1/);
    assert.equal(result.summary.attempted,16);
    assert.deepEqual(result.seeds,SEEDS);
    assert.equal(result.summary.parityFailures,0);
    assert.equal(result.summary.errors,0);
    assert.ok(result.summary.ownerDecisionSnapshots>0);
    assert.ok(result.summary.ownerRootSnapshots>0);
    assert.equal(result.summary.competitivelyQualifiedGames,0);
    assert.equal(result.rows.every(row=>
      row.ownerZoneAudit.opponentHiddenZonesInspected===false&&
      row.ownerZoneAudit.notPolicyInput===true),true);
    assert.equal(result.rows.every(row=>
      row.ownerSnapshots.every(snapshot=>
        snapshot.opponentHiddenZonesInspected===false)),true);
  });
