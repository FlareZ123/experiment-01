'use strict';

const assert=require('node:assert/strict');
const VERSION='agent5-rank9-original120-custody-samedeal-v1';

/**
 * Enable the existing native 120-original-reference audit without exposing
 * owner information to either policy. Restore the export after the run.
 * @template T
 * @param {()=>T} execute Original synchronous bilateral runner.
 * @param {{headless?:{runMatch:Function}}} [deps] Test dependency injection.
 * @returns {{result:T,audit:object}}
 */
function withOriginal120Custody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const previous=Object.getOwnPropertyDescriptor(headless,'runMatch');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const receipts=[];
  function auditedRunMatch(request){
    assert.equal(request.capturePhysicalZoneIntegrity,true,
      'Existing physical zone check must already be enabled');
    assert.equal(request.enforceSettledPhysicalZoneIntegrity,true,
      'Existing settled-root physical gate must remain enabled');
    const enhanced={...request,captureOriginalOwnerIntegrity:true};
    try{
      const result=previous.value(enhanced);
      const custody=result?.physicalZoneIntegrity;
      receipts.push({
        returned:true,
        originalOwnerCustodyRequested:custody?.originalOwnerCustodyRequested??false,
        originalOwnerCardCount:custody?.originalOwnerCardCount??null,
        settledRootsChecked:custody?.settledRootsChecked??null,
        settledRootsWithAnomaly:custody?.settledRootsWithAnomaly??null,
        firstSettledAnomaly:custody?.firstSettledRootAnomaly??null
      });
      return result;
    }catch(error){
      receipts.push({returned:false,
        errorCode:error?.code??null,
        message:String(error?.message??error),
        firstSettledAnomaly:error?.physicalConservationWitness??null});
      throw error;
    }
  }
  Object.defineProperty(headless,'runMatch',{...previous,value:auditedRunMatch});
  try{
    const result=execute();
    return {result,audit:{schema:VERSION,attempts:receipts.length,
      receipts,policyAltered:false,ownerFactsPassedToPolicy:false,
      competitivelyQualifiedGames:0}};
  }finally{
    assert.strictEqual(headless.runMatch,auditedRunMatch,
      'Nested native executor replaced the custody hook');
    Object.defineProperty(headless,'runMatch',previous);
  }
}

/**
 * Run both original rank9 source seats against the two unchanged candidates
 * on exactly the same retrospective registered physical deals.
 * @returns {object} Complete native-development comparison.
 */
function run(){
  const {classifyNativeAttempt}=require('./native-attempt-disposition.cjs');
  const {run:runKnownDead}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
  const control=runKnownDead();
  const treatment=withOriginal120Custody(runKnownDead);
  const oldRows=control.rows??[],newRows=treatment.result.rows??[];
  const trials=Array.from({length:4},(_,i)=>{
    const a=oldRows[i]??null,b=newRows[i]??null;
    const id=a?.trial?.id??b?.trial?.id??null;
    const identityMatched=Boolean(id&&id===b?.trial?.id);
    const sourceDealMatched=identityMatched&&
      typeof a?.sourceDealFingerprint==='string'&&
      a.sourceDealFingerprint===b?.sourceDealFingerprint;
    const fullDealMatched=sourceDealMatched&&
      typeof a?.fullPhysicalDealFingerprint==='string'&&
      a.fullPhysicalDealFingerprint===b?.fullPhysicalDealFingerprint;
    const rootTraceIdentical=identityMatched&&
      typeof a?.rootActionLedgerSha256==='string'&&
      a.rootActionLedgerSha256===b?.rootActionLedgerSha256;
    return {
      id,identityMatched,sourceDealMatched,fullDealMatched,rootTraceIdentical,
      control:{status:classifyNativeAttempt(a),
        physical:a?.physicalZoneQualification??null,
        nativeRoots:a?.rootActionCount??null},
      original120:{status:classifyNativeAttempt(b),
        physical:b?.physicalZoneQualification??null,
        nativeRoots:b?.rootActionCount??null}
    };
  });
  return {
    schema:VERSION,checkoutCommit:process.env.GITHUB_SHA??null,
    baselineVersion:control.version,treatmentVersion:treatment.result.version,
    engineRevision:control.enginePin,
    controlSourceClosure:control.sourceClosureSha256,
    observedSourceClosure:treatment.result.sourceClosureSha256,
    registeredAttemptsPerArm:4,
    observedControlAttempts:oldRows.length,
    observedOriginal120Attempts:newRows.length,
    historicalRetrospectiveSeeds:true,originalPrintedSourceRank:9,
    controlPolicyIdentical:true,
    intervention:'Read-only captureOriginalOwnerIntegrity request atop existing physical-zone gate',
    nativeCustodyAudit:treatment.audit,trials,
    allIdentityAndPhysicalDealsMatch:trials.every(x=>x.fullDealMatched),
    allNativeRootsIdentical:trials.every(x=>x.rootTraceIdentical),
    original120CertifiedGames:trials.filter(x=>
      x.original120.physical?.originalOwnerIntegrityQualified===true).length,
    competitiveQualifiedGames:0,
    caveat:'Historical rank9 source deals and unqualified bots. Owner custody verifies only physical reference conservation; paper play, strategic competence and clock remain unqualified.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.observedControlAttempts!==4||result.observedOriginal120Attempts!==4)
    process.exitCode=1;
}
module.exports={VERSION,withOriginal120Custody,run};
