'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {reconcileShadowAndChoice,reconcileIncludingLastBench}=
  require('../simulation/twinleaf/agent27-shadow-choice-reconciliation.cjs');

/** One original-60-conserved native root, with the existing pure chooser. */
for(const seat of [0,1]){
  test('native detached owner root captures missing same-kind Bench shadow seat '+seat,()=>{
    const fixture=stage(seat);
    const view=actorObservation(fixture.state,seat);
    const baseline=chooseActorRootIntent(view,fixture.catalog,{});
    assert.equal(baseline.kind,'bench-basic');
    assert.equal(baseline.printing,'Girafarig LOT');
    const before=structuredClone(view);
    const shadow=reconcileShadowAndChoice(view,fixture.catalog,baseline,{});
    assert.deepEqual(view,before);
    assert.deepEqual(shadow.selectedIntent,baseline);
    assert.equal(shadow.verification.selectedPhysicalOfferInShadow,true);
    assert.equal(shadow.verification.nativeStoreAccepted,false);
    assert.equal(shadow.verification.competitiveQualified,false);
    assert.equal(shadow.ownerObservationSha256.length,64);
    assert.equal(fixture.owner.bench[4].getPokemonCard(),undefined);
    assert.equal(fixture.state.prompts.length,0);
    assert.ok(shadow.selectionReceipt.skippedSelectors.length>0);
    // The current all-proposer list omits a known physical same-kind Basic.
    assert.equal(shadow.shadowReceipt.supportedAlternativeCount,0);
    const augmented=reconcileIncludingLastBench(
      view,fixture.catalog,baseline,{});
    assert.deepEqual(augmented.selectedIntent,baseline);
    assert.equal(augmented.shadowReceipt.supportedAlternativeCount,1);
    assert.equal(augmented.selectionReceipt.supportedAlternativeCount,1);
    assert.equal(augmented.opportunityCensus.observedStructuralAlternatives,1);
    assert.equal(augmented.opportunityCensus.explicitlyNativeWiredAlternatives,0);
    assert.equal(augmented.opportunityCensus.observationOnlyAlternatives,1);
    assert.equal(augmented.opportunityCensus.nativeCanPlayEstablished,0);
    const contender=augmented.shadowReceipt.offers.find(row=>
      row.source==='agent27-lastbench-same-kind');
    assert.ok(contender);
    assert.equal(contender.printing,'Tapu Lele-GX GRI');
    assert.equal(contender.handIndex,1);
    assert.equal(contender.slot,'bench');
    assert.equal(contender.index,4);
    assert.equal(contender.nativeDispatchImplemented,false);
    assert.equal(contender.nativePlayability,'unverified');
    assert.equal(augmented.selectionReceipt.changed,false);
    assert.equal(augmented.verification.nativeStoreAccepted,false);
    assert.equal(augmented.verification.prePostShadowExecutableDecisionIdentical,true);
    assert.deepEqual(view,before);
    console.log(JSON.stringify({seat,
      baselineKind:shadow.selectionReceipt.baselineKind,
      shadowSupportedAlternatives:shadow.shadowReceipt.supportedAlternativeCount,
      afterLastBenchShadowAlternatives:augmented.shadowReceipt.supportedAlternativeCount,
      shadowSelectorErrorCount:shadow.shadowReceipt.selectorErrors.length,
      selectedPhysicalOfferInShadow:true,
      stagedArtificialBoard:true,originalRegisteredSixtiesPreserved:true,
      storeActionsDispatched:0,competitiveQualifiedGames:0}));
  });
}
