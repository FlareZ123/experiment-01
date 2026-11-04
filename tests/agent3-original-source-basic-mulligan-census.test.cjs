'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalSourceBasicCensus}=
  require('../scripts/agent3-original-source-basic-mulligan-census.cjs');
const {choose}=
  require('../simulation/evaluation/agent3-coupled-opening-input-order.cjs');

test('all 29 original sources have exact corpus-resolved Basic counts and canonical rank coverage',()=>{
  const data=originalSourceBasicCensus();
  assert.equal(data.knownOriginals,29);
  assert.equal(data.exactResolvedSourceBasicStages,29);
  assert.equal(data.unknownSourceStages,0);
  assert.deepEqual(data.unavailableOriginals,[23,25,28]);
  assert.match(data.sourceRosterSha256,/^[0-9a-f]{64}$/);
  assert.equal(new Set(data.ranks.map(row=>row.rank)).size,29);
  assert.equal(data.ranks.length,29);
  for(const row of data.ranks){
    assert.ok(Number.isSafeInteger(row.exactSourceBasicCount));
    assert.ok(row.exactSourceBasicCount>=1);
    assert.ok(row.exactSourceBasicCount<=60);
    const q=choose(60-row.exactSourceBasicCount,7)/choose(60,7);
    assert.ok(Math.abs(q-row.initialSevenMulliganProbability)<1e-14);
    assert.ok(Math.abs(row.initialSevenHasBasicProbability+
      row.initialSevenMulliganProbability-1)<1e-14);
    assert.ok(Math.abs(row.idealExpectedMulliganCount-q/(1-q))<1e-14);
  }
  const byRank=new Map(data.ranks.map(row=>[row.rank,row]));
  for(const [rank,basics] of [[1,14],[5,11],[6,4],[11,11]]){
    assert.equal(byRank.get(rank).exactSourceBasicCount,basics);
  }
  console.log('AGENT3_ORIGINAL29_COMPUTED_BASIC_COUNTS',
    JSON.stringify(data.ranks.map(({rank,exactSourceBasicCount,
      initialSevenMulliganProbability})=>({
      rank,basics:exactSourceBasicCount,
      q:initialSevenMulliganProbability
    }))));
  assert.equal(data.caveat.includes('No actual game outcome'),true);
});

test('original source census is deterministic under the frozen file roster',()=>{
  const first=originalSourceBasicCensus();
  const second=originalSourceBasicCensus();
  assert.deepEqual(first,second);
});
