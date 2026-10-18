'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');

/**
 * Track immutable State projections at root dispatch boundaries.
 * @param {Record<number,string>} expectedCheckpoints
 */
function createSourcePrefixAudit(expectedCheckpoints) {
  const digest=crypto.createHash('sha256');
  const checkpoints=new Map(Object.entries(expectedCheckpoints)
    .map(([key,value])=>[Number(key),value]));
  let steps=0;
  const observed=[];
  /** @param {Array<string|number>} row */
  function record(row) {
    assert.equal(row[0],steps,'Root action ordinal mismatch');
    assert.equal(row.length,8,'Expected six State fingerprints');
    digest.update(JSON.stringify(row)+'\n');
    steps++;
    if(checkpoints.has(steps)) {
      const actual=digest.copy().digest('hex');
      observed.push({afterActions:steps,actual,
        expected:checkpoints.get(steps),matches:actual===checkpoints.get(steps)});
    }
  }
  function finish() {
    assert.equal(observed.length,checkpoints.size,
      'Some historical prefix checkpoints were not reached');
    return {steps,sha256:digest.copy().digest('hex'),
      checkpoints:observed,allMatched:observed.every(c=>c.matches)};
  }
  return {record,finish};
}
module.exports={createSourcePrefixAudit};
