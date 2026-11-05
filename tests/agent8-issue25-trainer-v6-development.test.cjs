'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {VERSION,withNativeTrainerFallbackOptions,runIssue25NativeTrainerV6}=
  require('../simulation/evaluation/agent8-issue25-trainer-v6-development.cjs');

test('v6 preserves the original source, both seats and exactly one treatment option',()=>{
  const original={actorOnlyComposition:true,sourceIndependentCommonPolicy:true,
    nativeRootActionLimit:48,
    registeredTrials:Array.from({length:8},(_,i)=>({id:String(i)})),
    bilateralSpecialEnergyRoot:true,nativeAcceptedTargets:true,
    paperSupporterQuota:true};
  const changed=withNativeTrainerFallbackOptions(original);
  assert.equal(Object.prototype.hasOwnProperty.call(original,
    'nativeOwnerTrainerFallback'),false);
  assert.equal(changed.nativeOwnerTrainerFallback,true);
  assert.deepEqual(Object.keys(changed).filter(k=>k!=='nativeOwnerTrainerFallback')
    .sort(),Object.keys(original).sort());
  for(const k of Object.keys(original))assert.strictEqual(changed[k],original[k]);
});

test('v6 refuses changed horizons, one-seat policies, unregistered or already treated runs',()=>{
  const base={actorOnlyComposition:true,sourceIndependentCommonPolicy:true,
    nativeRootActionLimit:48,registeredTrials:Array(8).fill(null)};
  for(const patch of [
    {actorOnlyComposition:false},
    {sourceIndependentCommonPolicy:false},
    {nativeRootActionLimit:96},
    {registeredTrials:[]},
    {nativeOwnerTrainerFallback:true}
  ])assert.throws(()=>withNativeTrainerFallbackOptions({...base,...patch}));
});

test('v6 executes all eight unchanged v5 registrations and cannot claim qualified games',()=>{
  const layers=Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
  let seen=null;
  const result=runIssue25NativeTrainerV6({
    innerLayer:next=>({result:next(),audit:{nativeMatchCalls:8,
      nativeMatchAttempts:[],competitiveGamesQualified:0}}),
    layers,
    attackLayer:next=>({result:next(),audit:{}}),
    runner:options=>{
      seen=options;
      return {sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'censored',
          sourceSeat:trial.candidateSlot==='A'?1:0,
          bilateralSpecialEnergyProfile:{mode:'both'}
        }))};
    }
  });
  assert.equal(seen.nativeOwnerTrainerFallback,true);
  assert.equal(seen.nativeRootActionLimit,48);
  assert.equal(seen.registeredTrials.length,8);
  assert.equal(seen.sourceIndependentCommonPolicy,true);
  assert.equal(seen.bilateralSpecialEnergyRoot,true);
  assert.equal(result.manifest.version,VERSION);
  assert.equal(result.diagnostic.selectedNativeAttempts.length,8);
  assert.equal(result.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(result.manifest.nativeTrainerPreferenceInformationSetSafe,false);
  assert.equal(result.manifest.trainerPaperPaymentVerified,false);
  assert.equal(result.manifest.releaseQualified,false);
  assert.equal(result.diagnostic.competitiveGamesQualified,0);
});
