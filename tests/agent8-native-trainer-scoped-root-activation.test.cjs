'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  withCanonicalActorOnlyPolicy
} = require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {
  withNativeTrainerFallbackOptions
} = require('../simulation/evaluation/agent8-issue25-trainer-v6-development.cjs');
const {
  specialEnergyRootProfile
} = require('../simulation/evaluation/agent41-bilateral-special-energy-profile.cjs');

/**
 * Inject one root adapter and four inert canonical prompt adapters. These
 * exercise production composition without a compiled Twinleaf Store.
 * @param {object} rootAudit Actual-root audit to feed the composition.
 * @returns {object}
 */
function adapters(rootAudit){
  const component=(version,audit={})=>execute=>({
    result:execute(),audit:{version,...audit}
  });
  return {
    root:component('injected-special-energy-root',rootAudit),
    fog:component('fog'),
    select:component('select'),
    option:component('option'),
    attack:component('attack')
  };
}

test('v5 inherited both-seat energy root and v6 requests native Trainer',()=>{
  const original={
    actorOnlyComposition:true,
    sourceIndependentCommonPolicy:true,
    nativeRootActionLimit:48,
    bilateralSpecialEnergyRoot:true,
    registeredTrials:Array.from({length:8},(_,i)=>({id:String(i)}))
  };
  const v6=withNativeTrainerFallbackOptions(original);
  assert.equal(specialEnergyRootProfile({
    bilateral:v6.bilateralSpecialEnergyRoot
  },'A').enabled,true);
  assert.equal(v6.nativeOwnerTrainerFallback,true);
  assert.equal(original.nativeOwnerTrainerFallback,undefined);
});

test('requested native Trainer cannot silently disappear under scoped root',()=>{
  assert.throws(()=>withCanonicalActorOnlyPolicy(()=>42,
    adapters({selectedRootDecisions:1,acceptedActorRoots:0}),
    {nativeOwnerTrainerFallback:true}),
  /Native Trainer opt-in was masked by another actor root adapter/);
});

test('an incomplete audit cannot certify fallback installation',()=>{
  assert.throws(()=>withCanonicalActorOnlyPolicy(()=>42,
    adapters({nativeOwnerTrainerFallback:{attemptedUnsupportedPasses:0}}),
    {nativeOwnerTrainerFallback:true}),
  /Native Trainer opt-in was masked by another actor root adapter/);
});

test('native Trainer install receipt is accepted even if no opportunity arises',()=>{
  const observed=withCanonicalActorOnlyPolicy(()=>({rows:[]}),
    adapters({
      selectedRootDecisions:2,
      nativeOwnerTrainerFallback:{
        attemptedUnsupportedPasses:0,selectedNativeTrainerRoots:0,
        acceptedNativeTrainerRoots:0,rejectedNativeTrainerRoots:0
      }
    }),{nativeOwnerTrainerFallback:true});
  assert.equal(observed.audit.nativeOwnerTrainerFallbackOptIn,true);
  assert.equal(observed.audit.nativeOwnerTrainerFallbackAudit.attemptedUnsupportedPasses,0);
  assert.equal(observed.audit.detailedComponentAudits.root
    .nativeOwnerTrainerFallback.acceptedNativeTrainerRoots,0);
  assert.equal(observed.audit.qualification.competitiveGames,0);
});

test('control with special-energy root is not forced into fallback treatment',()=>{
  const observed=withCanonicalActorOnlyPolicy(()=>17,
    adapters({selectedRootDecisions:1}),{nativeOwnerTrainerFallback:false});
  assert.equal(observed.result,17);
  assert.equal(observed.audit.nativeOwnerTrainerFallbackOptIn,undefined);
});
