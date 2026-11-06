'use strict';

const assert=require('node:assert/strict');
const headless=require('../twinleaf/headless.cjs');
const {runAgent45GuzmaHalaRelaxedV9}=
  require('./agent45-issue25-ghala-relaxed-v9.cjs');
const {buildReceipt}=
  require('./agent1-issue25-v4-public-receipt.cjs');
const {EXPECTED}=
  require('./agent5-ghala-dce-owner-witness-v1.cjs');
const {withActualGuzmaHalaK1Custody,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent45-actual-ghala-k1-custody.cjs');

const VERSION='agent45-native-v10-actual-k1-owner-search-printed-card-custody';

/**
 * Re-execute unchanged original v9 eight trials, adding a genuinely
 * observational Store wrapper. No actor choices, decks, seeds, or cap changed.
 * @param {{runner?:Function,observer?:Function,receipt?:Function,
 *   headless?:object}} [deps]
 * @returns {object}
 */
function runAgent45DirectK1V10(deps={}){
  const engine=deps.headless??headless;
  const run=deps.runner??runAgent45GuzmaHalaRelaxedV9;
  const observer=deps.observer??withActualGuzmaHalaK1Custody;
  const receipt=deps.receipt??buildReceipt;
  const prior=engine.runMatch;
  assert.equal(typeof prior,'function');
  const events=[];

  function observed(request){
    const nativeLabel=request.label??null;
    const prefix='agent41-bilateral-v2-common-policy-development-';
    const id=nativeLabel?.startsWith(prefix)?
      nativeLabel.slice(prefix.length):nativeLabel;
    try{
      const native=observer(()=>prior(request),{trialId:id});
      events.push({id,nativeLabel,status:'returned',audit:native.audit});
      return native.result;
    }catch(error){
      events.push({id,nativeLabel,status:'native-error',
        audit:error?.agent45ActualGuzmaHalaK1Audit??null});
      throw error;
    }
  }
  engine.runMatch=observed;
  let completed;
  try{completed=run();}
  finally{
    assert.strictEqual(engine.runMatch,observed);
    engine.runMatch=prior;
  }

  const publicReceipt=receipt(completed,{
    policyEntryPoint:completed.manifest.policyEntryPoint
  });
  const byId=new Map(events.map(e=>[e.id,e]));
  assert.equal(events.length,8,'all eight original native Store trials must execute');
  assert.equal(byId.size,8,'all native trial labels must be unique');
  assert.equal(publicReceipt.attempts.length,8,'original eight returned attempts');
  const rows=publicReceipt.attempts.map(a=>{
    const native=byId.get(a.id);
    assert.ok(native,'missing source Store observer '+a.id);
    const matched=EXPECTED[a.id]??null;
    const originalHalaRoots=a.publicRootActions.filter(root=>
      root.playerSlot===a.originalSourceSeat&&
      root.action==='PlayCardAction'&&
      root.card==='Guzma & Hala');
    const sameFrozen=matched===null?null:Boolean(
      a.fullPhysicalDealFingerprint===matched.initialFull&&
      a.sourceDealFingerprint===matched.initialSource&&
      a.publicRootLedgerSha256Computed===matched.acceptedRootTape);
    const sourceK1=(native.audit?.nativeOwnDeckSearchResults??[])
      .filter(e=>e.seat===a.originalSourceSeat);
    return {
      id:a.id,status:a.status,originalSourceSeat:a.originalSourceSeat,
      publicRootActionCount:a.nativeRootActionCount,
      fullPhysicalDealFingerprint:a.fullPhysicalDealFingerprint,
      sourceDealFingerprint:a.sourceDealFingerprint,
      acceptedRootTapeSha256:a.publicRootLedgerSha256Computed,
      acceptedRootDigestConsistent:a.publicRootLedgerDigestConsistent,
      matchedFrozenV9SourceAndFullDealAndPublicTapes:sameFrozen,
      originalSourceGuzmaHalaPublicPlayRoots:originalHalaRoots.map(root=>({
        ordinal:root.actionOrdinal,turn:root.turnBefore
      })),
      directNativeSourceK1Prompts:sourceK1,
      nativeObserverAuditStatus:native.status,
      nativeStoreObservers: native.audit?.actualStores??null,
      nativeObserverCaptured:Boolean(native.audit),
      competitiveGameQualified:false
    };
  });
  const targets=rows.filter(row=>EXPECTED[row.id]);
  return {
    schema:VERSION,observerSchema:OBSERVER_VERSION,
    originalNativeAttemptCount:rows.length,
    originalFrozenTargets:targets.map(x=>x.id),
    sourceAndFullDeckAndPublicTapeParity:targets.every(row=>
      row.matchedFrozenV9SourceAndFullDealAndPublicTapes===true),
    zeroActorPolicyChanges:true,
    nativeStoresActuallyObserved:rows.map(row=>({
      trialId:row.id,actualStores:row.nativeStoreObservers
    })),
    rows,
    allStatusesPreserved:true,allOriginalPrintedSixtiesUnchanged:true,
    qualifiedCompetitiveGames:0,estimatedWinRate:null
  };
}
module.exports={VERSION,OBSERVER_VERSION,runAgent45DirectK1V10};
