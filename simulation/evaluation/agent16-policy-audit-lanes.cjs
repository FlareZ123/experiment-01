'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  scanPolicySourceClosure,auditCheckedSourcePins
}=require('./agent16-transitive-policy-source-inventory.cjs');

/**
 * Independent historical-pin lane admission. An actual failure of the
 * source-inventory / behavioral test step is always a failure in either lane.
 * Source hash drift alone may be reported as development-only, but cannot
 * pass an explicitly strict historical compatibility run.
 *
 * @param {{inventoryOutcome:string,rootPinsExact:boolean,strictHistoricalPins:boolean}} input
 * @returns {{lane:string,passes:boolean,failures:string[],warnHistoricalDrift:boolean}}
 */
function evaluatePolicyAuditGate(input){
  assert.ok(input&&typeof input==='object');
  assert.ok(['success','failure','cancelled','skipped'].includes(input.inventoryOutcome),
    'Unrecognized inventory test step outcome');
  assert.equal(typeof input.rootPinsExact,'boolean');
  assert.equal(typeof input.strictHistoricalPins,'boolean');
  const failures=[];
  if(input.inventoryOutcome!=='success'){
    failures.push('POLICY_INVENTORY_TEST_FAILURE');
  }
  if(input.strictHistoricalPins&&!input.rootPinsExact){
    failures.push('STRICT_HISTORICAL_SOURCE_PIN_DRIFT');
  }
  return {
    lane:input.strictHistoricalPins?'immutable-historical':'moving-development',
    passes:failures.length===0,
    failures,
    warnHistoricalDrift:!input.strictHistoricalPins&&!input.rootPinsExact
  };
}

/** @returns {void} */
function reportWorkflowAudit(){
  const inventory=require('./agent42-strict-switch-inventory-v1.json');
  const closure=scanPolicySourceClosure(
    path.resolve(__dirname,'../..'),inventory.checkedSources.map(x=>x.path));
  const roots=auditCheckedSourcePins(inventory.checkedSources,closure);
  console.log('AGENT16_COMPUTED_IMPORT_AUDIT '+JSON.stringify({
    sourceFiles:closure.sourceCount,
    affectedFiles:closure.unparsedRequires.length,
    computedCalls:Object.values(closure.computedRequireShapeCounts)
      .reduce((total,n)=>total+n,0),
    shapes:closure.computedRequireShapeCounts,
    pathJoinBases:closure.pathJoinFirstArgumentCounts,
    nonJoin:closure.nonPathJoinComputedRequires
  }));
  console.log('AGENT16_REGISTERED_ROOT_PIN_PARITY '+JSON.stringify({
    registered:roots.registered,matched:roots.matched,
    drifts:roots.mismatches,missing:roots.missing,
    allRootPinsExact:roots.allRootPinsExact,
    qualification:roots.qualification
  }));
  const gate=evaluatePolicyAuditGate({
    inventoryOutcome:process.env.AGENT16_INVENTORY_OUTCOME,
    rootPinsExact:roots.allRootPinsExact,
    strictHistoricalPins:process.env.STRICT_HISTORICAL_PINS==='true'
  });
  console.log('AGENT16_POLICY_AUDIT_LANE_GATE '+JSON.stringify(gate));
  if(gate.warnHistoricalDrift){
    console.warn('::warning::Historical source pins differ from moving development head; this is not a compatibility release.');
  }
  if(!gate.passes){
    for(const failure of gate.failures){
      console.error('::error::'+failure);
    }
    process.exitCode=1;
  }
}

if(require.main===module)reportWorkflowAudit();
module.exports={evaluatePolicyAuditGate,reportWorkflowAudit};
