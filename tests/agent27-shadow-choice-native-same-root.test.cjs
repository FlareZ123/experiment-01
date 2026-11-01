'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {reconcileShadowAndChoice}=
  require('../simulation/twinleaf/agent27-shadow-choice-reconciliation.cjs');

/** One original-60-conserved native root, with the existing pure chooser. */
for(const seat of [0,1]){
  test('native detached owner root uses two safe shadow/choice passes seat '+seat,()=>{
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
    console.log(JSON.stringify({seat,
      baselineKind:shadow.selectionReceipt.baselineKind,
      shadowSupportedAlternatives:shadow.shadowReceipt.supportedAlternativeCount,
      shadowSelectorErrorCount:shadow.shadowReceipt.selectorErrors.length,
      selectedPhysicalOfferInShadow:true,
      stagedArtificialBoard:true,originalRegisteredSixtiesPreserved:true,
      storeActionsDispatched:0,competitiveQualifiedGames:0}));
  });
}
