'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const REGISTRATION=path.resolve(__dirname,
 '../../results/aichi-2026/registrations/agent8-rank13-public-flat-copy-prospective-native-20261103.json');
const VERSION='agent8-rank13-public-copy-prospective-registration-v1';

/**
 * Read an immutable native-study plan before any engine compilation.
 * @param {string} [file] Registration path.
 * @returns {object} Validated registration.
 */
function preflight(file=REGISTRATION){
  const p=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(p.schema,'agent8-rank13-public-flat-copy-prospective-native-v1');
  assert.equal(p.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(p.sourceRank,13);
  assert.equal(p.opponentRank,1);
  assert.equal(p.expectedNativeAttempts,16);
  assert.equal(p.trialMatrix.length,8);
  assert.equal(p.exactOriginalSixties,'results/aichi-2026/full-decklists.json');
  const seen=new Set();
  const counts=[0,0];
  for(const row of p.trialMatrix){
    assert.ok(row.sourceSeat===0||row.sourceSeat===1);
    counts[row.sourceSeat]++;
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&
      row.seed<=0xffffffff);
    assert.ok(!seen.has(row.seed),'duplicate independent seed');
    seen.add(row.seed);
  }
  assert.deepEqual(counts,[4,4]);
  return p;
}
if(require.main===module){
  const plan=preflight();
  console.log(JSON.stringify({version:VERSION,preflight:'PASS',
    sourceRank:plan.sourceRank,opponentRank:plan.opponentRank,
    physicalSeedGroups:plan.trialMatrix.length,
    expectedNativeAttempts:plan.expectedNativeAttempts,
    seats:[0,1]}));
}
module.exports={VERSION,preflight};
