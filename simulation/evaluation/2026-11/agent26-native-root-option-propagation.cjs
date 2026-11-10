'use strict';
const assert=require('node:assert/strict');
const VERSION='agent26-native-root-option-propagation-audit-v1';
/**
 * A new experiment flag can silently disappear between runDevelopment and
 * the real owner-root actor. This proves actual per-game option delivery
 * and refuses absent or different actor option fields before interpreting
 * winner statistics. It does not establish native option eligibility,
 * actual action selection, paper legality or beneficial performance.
 *
 * @param {object[]} rows Actual runDevelopment native game rows.
 * @param {Record<string,boolean|number|null|string>} expected Exact actor
 *   audit field names and registered values, not driver option field names.
 * @returns {{version:string,rowsChecked:number,fields:string[]}}
 */
function assertNativeRootOptionPropagation(rows,expected){
  assert.ok(Array.isArray(rows)&&rows.length>0,
    'Native experiment requires at least one actual game row');
  assert.ok(expected&&typeof expected==='object'&&!Array.isArray(expected));
  const fields=Object.keys(expected);
  assert.ok(fields.length>0,'Must specify a real owner-root actor option');
  for(const [i,row] of rows.entries()){
    const actual=row?.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    assert.ok(actual&&typeof actual==='object',
      'Game '+i+' has no actual actor root audit');
    for(const key of fields){
      assert.ok(Object.hasOwn(actual,key),
        'Game '+i+' missing actual actor option '+key);
      assert.deepEqual(actual[key],expected[key],
        'Game '+i+' dropped experimental actor option '+key);
    }
  }
  return {version:VERSION,rowsChecked:rows.length,fields};
}
module.exports={VERSION,assertNativeRootOptionPropagation};
