'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE:PROFILE}=
  require('./policy-profiles.cjs');
const {withRank26SourceSetup}=require('./agent3-rank26-energy-setup.cjs');
const {withDealFingerprint}=require('./rank26-natural-pre-koko-cologne-cohort.cjs');
const {withSourceCompressorRootProvenance}=
  require('./agent3-compressor-root-provenance-v3.cjs');
const {ownerCompressorPrompt}=
  require('./agent3-compressor-discard-settlement.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const SOURCE_SEAT=1;
const SEED=4195563994;
const HISTORICAL_PHYSICAL_ROOT=
  'f1c6722173f9d7c7e24224e19783fda15e73fe827a9de749fd02e73f6ead9ffc';
const ERROR_TAG='AGENT3_DELIBERATE_NATIVE_ABORT_AFTER_COMPRESSION';

/**
 * Native-only fault injection. Abort AFTER the genuine root Store has
 * accepted an original-source Compressor ChooseCardsPrompt result.
 *
 * Install inside withSourceCompressorRootProvenance so that the real source
 * observer has already recorded physical card-object movement before this
 * wrapper raises the deliberate exception. Cloned Simulator Stores are
 * never eligible to trigger the failure.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute Native game execution
 * @param {()=>void} onTrigger
 * @returns {T}
 */
function withNativeAbortAfterPaidPrompt(sourceSeat,execute,onTrigger){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  assert.equal(typeof onTrigger,'function');
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const prior=Store.prototype.dispatch;
  let live=null,triggered=false;
  function dispatch(action,...args){
    if(!live&&action?.constructor?.name==='AddPlayerAction'&&
        action.clientId===101)live=this;
    const pending=this===live&&
      action?.constructor?.name==='ResolvePromptAction'?
      ownerCompressorPrompt(this.state,sourceSeat):null;
    const matches=Boolean(pending&&
      action.id===pending.prompt.id&&
      pending.prompt.result===undefined);
    const result=prior.call(this,action,...args);
    if(matches&&pending.prompt.result!==undefined){
      assert.equal(triggered,false,'One intentional abort per fixture');
      triggered=true;
      onTrigger();
      throw new Error(ERROR_TAG);
    }
    return result;
  }
  Store.prototype.dispatch=dispatch;
  try{return execute();}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Store.prototype.dispatch=prior;
  }
}

/**
 * A single archived original-source native deal. This deliberate test failure
 * is not a game failure and must never enter a competitive denominator.
 * @returns {object}
 */
function run(){
  initializeCards();
  const field=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const originalSource=field.candidate.cards;
  const originalOpponent=field.opponents.find(x=>x.rank===6)?.cards;
  assert.equal(originalSource.length,60);
  assert.equal(originalOpponent?.length,60);
  let injected=false;
  const request={
    deckA:originalOpponent,deckB:originalSource,
    rank26SourceSeat:SOURCE_SEAT,seed:SEED,maxActions:120,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,battleCompressorPositiveSelectionCorrection:true,
    forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,
    label:'agent3-native-original-source-deliberate-abort-v1'
  };
  const observed=withDealFingerprint(()=>
    withSourceCompressorRootProvenance(SOURCE_SEAT,()=>
      withNativeAbortAfterPaidPrompt(SOURCE_SEAT,()=>
        withRank26SourceSetup(SOURCE_SEAT,()=>
          runWithResearchProfile(request,PROFILE)),
        ()=>{injected=true;}
      )));
  assert.equal(injected,true,
    'The fault must be induced by a genuine settled source prompt');
  assert.equal(observed.result,null,
    'The intentionally aborted game cannot return as a completed game');
  assert.ok(observed.error?.includes(ERROR_TAG),
    'The actual native error must survive the enclosing fingerprint wrapper');
  assert.equal(observed.physicalRoot?.digestSha256,HISTORICAL_PHYSICAL_ROOT,
    'Intentional abort must use the exact previously audited original deal');
  const audit=observed.abortSourceCompressorAudit;
  assert.equal(audit?.executionDisposition,'NATIVE_ABORT');
  assert.equal(audit?.observationIsPartial,true);
  assert.equal(audit?.sourceSeat,SOURCE_SEAT);
  assert.equal(audit?.liveRootIdentified,true);
  assert.equal(audit?.selectedSourcePlays,1);
  assert.equal(audit?.acceptedSourcePlays,1);
  assert.equal(audit?.linkedPromptsIssued,1);
  assert.equal(audit?.positiveLinkedSettlements,1);
  assert.equal(audit?.unresolvedLinkedPrompt,false);
  assert.equal(audit?.receipts.length,1);
  assert.ok(audit.receipts[0].physicallyMoved.length>=1,
    'One or more original source cards must physically move deck to discard');
  assert.equal(audit.competitivelyQualified,false);
  return {
    schema:'agent3-rank26-native-deliberate-abort-custody-v1',
    sourceRank:26,opponentRank:6,sourceSeat:SOURCE_SEAT,seed:SEED,
    exactHistoricalPhysicalRoot:HISTORICAL_PHYSICAL_ROOT,
    observedPhysicalRoot:observed.physicalRoot.digestSha256,
    deliberatelyAborted:true,sourceRootAudit:audit,
    nativeSourceActionActuallySettled:true,
    releaseQualification:'DEVELOPMENT_CAUSAL_ABORT_ONLY',
    competitiveQualifiedGames:0
  };
}

module.exports={run,withNativeAbortAfterPaidPrompt};
if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent3-rank26-native-deliberate-abort-custody.json'),result);
  process.stdout.write('AGENT3_NATIVE_ABORT_CUSTODY '+
    JSON.stringify(result)+'\n');
}
