'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const VERSION='agent30-original5-26-prize-trainer-native-preregistered-a-b-a-v1';
const ENGINE_PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const MAX_ACTIONS=90;
const REGISTERED={
  phase:'pilot',rank:5,repeats:[0,1],seedBase:20261130,
  originalSourceRanks:[5,26],
  physicalSlots:['A','B'],
  // Previously used in Agent5's standalone original rank5/rank11 census.
  reuse:'prospective-precommitted-four-physical-groups',
  independentGamesForCompetitiveInference:0
};

/** @param {unknown} v */
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** @param {object} result */
function witness(result){
  return {
    deckHashes:result.deckHashes,
    firstTurnSlot:result.firstTurnSlot,
    physicalDeal:result.initialFullPhysicalDealFingerprint,
    decisionTrace:result.decisionTrace,
    rootActionLedger:result.rootActionLedger,
    finished:result.finished,winner:result.winner
  };
}

/**
 * A deterministic A/B test of read-only Trainer accounting INSIDE the
 * canonical actor composition, not around it. The two original printed
 * source decks exchange physical seats. Both policies choose actions with
 * the same canonical actor components. Only the observer is toggled.
 *
 * @returns {object} Exact native paired evidence, developmental only.
 */
function run(){
  initializeCards();
  const plan=planAichi(5,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const five=plan.candidate.cards;
  const twentySix=plan.opponents.find(x=>x.rank===26)?.cards;
  assert.equal(five.length,60);
  assert.equal(twentySix?.length,60);
  const registration=require('../../results/aichi-2026/registrations/agent30-public-prize-source5-26-native-v1-20261103.json');
  assert.equal(registration.seedBase,REGISTERED.seedBase);
  assert.deepEqual(registration.repeats,REGISTERED.repeats);
  assert.deepEqual(registration.sourceRanks,REGISTERED.originalSourceRanks);
  assert.equal(registration.maxActionsPerNativeAttempt,MAX_ACTIONS);
  const originalAdmission=require('../../results/aichi-2026/original-printed60-admission-v1.json');
  for(const rank of registration.sourceRanks){
    const actual=originalAdmission.rows.find(row=>row.rank===rank);
    assert.equal(actual?.printed60Sha256,
      registration.originalPrinted60Sha256ByRank[String(rank)]);
  }
  const rows=[];
  for(const repeat of REGISTERED.repeats){
    const seeds=deriveSlotSeeds(REGISTERED.seedBase,
      REGISTERED.phase,REGISTERED.rank,repeat);
    for(const [source5Seat,physicalSlot] of REGISTERED.physicalSlots.entries()){
    const request={
      deckA:source5Seat===0?five:twentySix,
      deckB:source5Seat===0?twentySix:five,
      seed:seeds[physicalSlot],
      label:VERSION+':'+physicalSlot,
      maxActions:MAX_ACTIONS,
      strictPromptValidation:true,
      isolatePolicyRandomness:true,
      captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true
    };
    const canonical=()=>withCanonicalActorOnlyPolicy(
      ()=>runMatch(request),{},{genericFallbackAttribution:true});
    const instrumented=()=>withCanonicalActorOnlyPolicy(
      ()=>runMatch(request),{},{
        ownerGenericTrainerFrontier:true,
        ownerTrainerPublicPrizeScreen:true,
        ownerTrainerRegisteredSixties:[request.deckA,request.deckB],
        genericFallbackAttribution:true
      });
    const control=canonical();
    const observed=instrumented();
    const repeated=canonical();
    const controlEvidence=witness(control.result);
    const observedEvidence=witness(observed.result);
    const repeatedEvidence=witness(repeated.result);
    const digest=[controlEvidence,observedEvidence,repeatedEvidence]
      .map(hash);
    const allEqual=digest[0]===digest[1]&&digest[1]===digest[2];
    const summary=observed.audit.ownerTrainerFrontierAudit?.summary;
    const originalGeneric=observed.audit.detailedComponentAudits?.genericFallback;
    assert.ok(originalGeneric&&originalGeneric.bySeat,
      'Observe actual native generic fallback exposure separately');
    const gamePhase=require(path.resolve(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/state/state'))
      .GamePhase;
    const nativeOwnerTurnFallbacks=(originalGeneric.boundedRecords??[])
      .filter(row=>row.decisionKind==='owner-root-or-setup'&&
        row.phase===gamePhase.PLAYER_TURN);
    assert.equal(nativeOwnerTurnFallbacks.length,0,
      'Canonical root should fully own every actual turn decision');
    assert.ok(summary);
    const prizeAudit=observed.audit.ownerTrainerFrontierAudit;
    assert.equal(prizeAudit.ownerPublicPrizeScreenOptIn,true);
    assert.equal(summary.publicPrizeNecessaryFailures,
      prizeAudit.observedPublicPrizeConditionFailures);
    assert.ok(prizeAudit.roots.every(root=>
      root.ownerPublicPrizeNecessity?.heldTrainerCopies===root.trainers.length));
    const heldExactPrizeCopies=prizeAudit.roots.flatMap(root=>
      root.ownerPublicPrizeNecessity.rows.filter(x=>x.knownPrintedPrerequisite)
        .map(x=>({seat:root.seat,ownerGlobalTurn:root.turn,
          printing:x.printing,handIndex:x.handIndex,
          ownerPrizeCount:x.observedOwnPrizeCount,
          opponentPrizeCount:x.observedOpponentPrizeCount,
          provenBlocked:x.blocked,sourceCardId:x.exactSourceCardId,
          enumeratorOffered:root.trainers.find(r=>r.handIndex===x.handIndex)
            ?.nativeEnumeratorOffered??null,
          chosenRoot:root.chosen?.action??null,
          nativeDispatch:root.dispatch,
          ownerPrivatePostgameOnly:true})));
    const publicPrizeExamples=prizeAudit.roots.filter(root=>
      root.ownerPublicPrizeNecessity?.provenPrizeBlockedCopies>0).slice(0,24)
      .map(root=>({seat:root.seat,turn:root.turn,
        chosenAction:root.chosen?.action,nativeDispatch:root.dispatch,
        heldPrizeRuleCopies:root.ownerPublicPrizeNecessity.exactPrintedPrizeRulesSeen,
        provenPrizeBlockedCopies:root.ownerPublicPrizeNecessity.provenPrizeBlockedCopies,
        blockedPrintings:root.ownerPublicPrizeNecessity.rows
          .filter(row=>row.blocked).map(row=>({printing:row.printing,
            handIndex:row.handIndex,ownPrizeCount:row.observedOwnPrizeCount,
            opposingPrizeCount:row.observedOpponentPrizeCount})),
        ownerPrivateHandAfterMatchOnly:true}));
    assert.equal(summary.version,
      'agent29-bilateral-generic-trainer-frontier-transport-v1');
    assert.ok(summary.observedRootCount>0,
      'Native census must intercept actual owner root decisions');
    assert.equal(summary.observedRootCount,
      summary.bySeat[0].observedRoots+summary.bySeat[1].observedRoots);
    rows.push({
      repeat,physicalSlot,source5Seat,seed:request.seed,
      controlTraceDigest:digest[0],
      observedTraceDigest:digest[1],
      repeatedControlTraceDigest:digest[2],
      sameDealAndActionsAcrossABA:allEqual,
      originalRank5SourceStartedFirst:control.result.firstTurnSlot===source5Seat,
      fullPhysicalDealSha256:
        control.result.initialFullPhysicalDealFingerprint?.digestSha256??null,
      observerSummary:summary,
      publicPrizeConditionBlockedRootCount:prizeAudit.roots.filter(root=>
        root.ownerPublicPrizeNecessity?.provenPrizeBlockedCopies>0).length,
      publicPrizeConditionBlockedCopyRootSum:summary.publicPrizeNecessaryFailures,
      publicPrizeExamples,
      heldExactPrizeCopies,
      physicallyHeldSourcePrizeTrainerCopyRootObservations:heldExactPrizeCopies.length,
      canonicalSelectedRoots:observed.audit.detailedComponentAudits?.root?.selectedRootDecisions??null,
      nativeGenericDecoderCalls:originalGeneric.liveGenericDecodes,
      nativeGenericFallbackBySeat:originalGeneric.bySeat,
      nativeOwnerTurnFallbackSampleCount:nativeOwnerTurnFallbacks.length,
      k0GuaranteedVipPasses:summary.k0GuaranteedVipPasses,
      k0FirstTurnVipExamples:summary.k0FirstTurnVipExamples,
      controlFinished:control.result.finished,
      observedFinished:observed.result.finished,
      controlNativeWinner:control.result.winner??null,
      observedNativeWinner:observed.result.winner??null
    });
    assert.ok(allEqual,
      'Read-only census must preserve all same-seed physical deals and actions');
    }
  }
  return {
    version:VERSION,enginePin:ENGINE_PIN,sourceOriginalRanks:[5,26],
    registration:REGISTERED,canonicalPolicySameAcrossSeats:true,
    totalPhysicalDealGroups:rows.length,totalNativeAttempts:rows.length*3,
    registeredCohortsPreserved:rows.length===4&&rows.every(r=>r.sameDealAndActionsAcrossABA),
    allThreeWayTraceParity:rows.every(r=>r.sameDealAndActionsAcrossABA),
    observerAppliedToBothPhysicalSeats:true,
    observedPrizeBlockedCopyRootSum:rows.reduce((sum,row)=>
      sum+row.publicPrizeConditionBlockedCopyRootSum,0),
    allPrizeScreenRootsOwnerAuthenticated:rows.every(row=>
      row.observerSummary.publicPrizeNecessaryFailures!==null),
    k0VipCertifiedPasses:rows.reduce((sum,row)=>
      sum+(row.k0GuaranteedVipPasses??0),0),
    nativeActionEnumeratorPaperLegal:false,
    paperPaymentsVerified:false,
    independentlyCompetentOpponent:false,
    competitivelyQualifiedGames:0,
    rows
  };
}

if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent30-original5-26-public-prize-native-parity.json'),result);
  process.stdout.write('AGENT30_ORIGINAL5_26_PUBLIC_PRIZE_NATIVE_PARITY '+
    JSON.stringify({matched:result.allThreeWayTraceParity,
      attempts:result.totalNativeAttempts,
      bySeat:result.rows.map(r=>({
        repeat:r.repeat,slot:r.physicalSlot,roots:r.observerSummary.observedRootCount,
        paperPrizeBlocked:r.publicPrizeConditionBlockedCopyRootSum,
        paperPrizeExamples:r.publicPrizeExamples.slice(0,5),
        physicallyHeldSourcePrizeTrainerCopyRootObservations:
          r.physicallyHeldSourcePrizeTrainerCopyRootObservations,
        heldExactPrizeCopies:r.heldExactPrizeCopies.slice(0,12),
        nativeGenericDecodes:r.nativeGenericDecoderCalls,
        nativeOwnerTurnFallbackSamples:r.nativeOwnerTurnFallbackSampleCount,
        k0VipPasses:r.k0GuaranteedVipPasses,
        k0VipExamples:r.k0FirstTurnVipExamples,
        bySeat:r.observerSummary.bySeat,
        passExamples:r.observerSummary.examples.slice(0,5)
      }))})+'\n');
}
module.exports={VERSION,REGISTERED,witness,run};
