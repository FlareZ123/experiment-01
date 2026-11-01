'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {lastBenchBasicConflict}=
  require('../simulation/twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
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
    // The current all-proposer list omits physically distinct same-kind
    // Basics, including source copies beyond the two staged head cards.
    assert.equal(shadow.shadowReceipt.supportedAlternativeCount,0);
    const conflict=lastBenchBasicConflict(view,fixture.catalog,baseline);
    assert.ok(conflict);
    assert.ok(conflict.omitted.length>=1);
    assert.ok(conflict.omitted.some(row=>
      row.printing==='Tapu Lele-GX GRI'&&row.handIndex===1));
    const augmented=reconcileIncludingLastBench(
      view,fixture.catalog,baseline,{});
    assert.deepEqual(augmented.selectedIntent,baseline);
    const n=conflict.omitted.length;
    assert.equal(augmented.shadowReceipt.supportedAlternativeCount,n);
    assert.equal(augmented.selectionReceipt.supportedAlternativeCount,n);
    assert.equal(augmented.opportunityCensus.observedStructuralAlternatives,n);
    assert.equal(augmented.opportunityCensus.explicitlyNativeWiredAlternatives,0);
    assert.equal(augmented.opportunityCensus.observationOnlyAlternatives,n);
    assert.equal(augmented.opportunityCensus.nativeCanPlayEstablished,0);
    const contenders=augmented.shadowReceipt.offers.filter(row=>
      row.source==='agent27-lastbench-same-kind');
    assert.equal(contenders.length,n);
    for(const row of conflict.omitted){
      const matches=contenders.filter(offer=>
        offer.printing===row.printing&&offer.handIndex===row.handIndex&&
        offer.slot==='bench'&&offer.index===4&&
        offer.nativeDispatchImplemented===false&&
        offer.nativePlayability==='unverified');
      assert.equal(matches.length,1,'Physical same-kind offer must be lossless');
    }
    assert.equal(augmented.selectionReceipt.changed,false);
    assert.equal(augmented.verification.nativeStoreAccepted,false);
    assert.equal(augmented.verification.prePostShadowExecutableDecisionIdentical,true);
    assert.deepEqual(view,before);
    // Every observed same-kind alternative is separately accepted by native
    // Store on a fresh, identically staged original-source physical state.
    let accepted=0;
    for(const row of conflict.omitted){
      const fresh=stage(seat);
      const freshView=actorObservation(fresh.state,seat);
      assert.deepEqual(freshView,view);
      const nativeIntent={kind:'bench-basic',printing:row.printing,
        handIndex:row.handIndex,benchIndex:4};
      const physicalBefore=rootPhysicalSnapshot(fresh.state,seat,nativeIntent);
      fresh.store.dispatch(new fresh.PlayCardAction(fresh.owner.id,
        row.handIndex,{player:fresh.PlayerType.BOTTOM_PLAYER,
          slot:fresh.SlotType.BENCH,index:4}));
      const physicalAfter=rootPhysicalSnapshot(fresh.state,seat,nativeIntent);
      assert.equal(rootPhysicalWitness(nativeIntent,physicalBefore,
        physicalAfter,fresh.GamePhase),'confirmed-public-effect');
      assert.equal(fresh.owner.bench[4].getPokemonCard()?.fullName,
        row.printing);
      accepted++;
    }
    assert.equal(accepted,n);
    console.log(JSON.stringify({seat,
      baselineKind:shadow.selectionReceipt.baselineKind,
      shadowSupportedAlternatives:shadow.shadowReceipt.supportedAlternativeCount,
      afterLastBenchShadowAlternatives:augmented.shadowReceipt.supportedAlternativeCount,
      nativeAcceptedStagedAlternatives:accepted,
      actualOmittedBasicCopies:conflict.omitted.map(row=>({
        printing:row.printing,handIndex:row.handIndex})),
      shadowSelectorErrorCount:shadow.shadowReceipt.selectorErrors.length,
      selectedPhysicalOfferInShadow:true,
      stagedArtificialBoard:true,originalRegisteredSixtiesPreserved:true,
      storeActionsDispatched:0,competitiveQualifiedGames:0}));
  });
}

/**
 * Native controlled print-and-lock contrast. Both sources conserve their
 * original 60s. The two rank fixtures are deliberately staged, not actual
 * source-dealt trajectories; a pending Ability prompt is not a game result.
 */
for(const seat of [0,1]){
  test('native rank6 Initialization suppresses an actual played Tapu Lele Wonder Tag seat '+seat,()=>{
    const outcomes=[];
    for(const opponentRank of [6,10]){
      const fixture=stage(seat,opponentRank);
      const view=actorObservation(fixture.state,seat);
      assert.equal(view.ownHand[1],'Tapu Lele-GX GRI');
      assert.equal(view.opponentPublic.active.printing,
        opponentRank===6?'Iron Thorns ex TWM':'Regidrago V SIT');
      const intent={kind:'bench-basic',handIndex:1,benchIndex:4,
        printing:'Tapu Lele-GX GRI'};
      const before=rootPhysicalSnapshot(fixture.state,seat,intent);
      fixture.store.dispatch(new fixture.PlayCardAction(
        fixture.owner.id,1,{
          player:fixture.PlayerType.BOTTOM_PLAYER,
          slot:fixture.SlotType.BENCH,index:4
        }));
      const after=rootPhysicalSnapshot(fixture.state,seat,intent);
      assert.equal(rootPhysicalWitness(intent,before,after,fixture.GamePhase),
        'confirmed-public-effect');
      assert.equal(fixture.owner.bench[4].getPokemonCard()?.fullName,
        'Tapu Lele-GX GRI');
      const prompts=fixture.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name);
      if(opponentRank===6){
        assert.equal(prompts.includes('ConfirmPrompt'),false,
          'Iron Thorns Initialization should suppress Wonder Tag');
      }else{
        assert.equal(prompts.includes('ConfirmPrompt'),true,
          'Without active Ability lock Wonder Tag should create its native prompt');
      }
      outcomes.push({opponentRank,seat,playedLeleOnFinalBench:true,
        pendingWonderTagConfirm:prompts.includes('ConfirmPrompt'),
        nativeCardAccepted:true,staged:true});
    }
    console.log(JSON.stringify({contrast:'native-wonder-tag-under-initialization',
      seat,outcomes,qualifiedCompetitiveGames:0}));
  });
}
