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

const VERSION='agent29-generic-trainer-frontier-native-a-b-readonly-v1';
const ENGINE_PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const MAX_ACTIONS=90;
const REGISTERED={
  phase:'pilot',rank:5,repeat:0,seedBase:20261113,
  originalSourceRanks:[5,11],
  physicalSlots:['A','B'],
  // Previously used in Agent5's standalone original rank5/rank11 census.
  reuse:'retrospective-mechanism-fixture',
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
  const eleven=plan.opponents.find(x=>x.rank===11)?.cards;
  assert.equal(five.length,60);
  assert.equal(eleven?.length,60);
  const seeds=deriveSlotSeeds(REGISTERED.seedBase,
    REGISTERED.phase,REGISTERED.rank,REGISTERED.repeat);
  const rows=[];
  for(const [source5Seat,physicalSlot] of REGISTERED.physicalSlots.entries()){
    const request={
      deckA:source5Seat===0?five:eleven,
      deckB:source5Seat===0?eleven:five,
      seed:seeds[physicalSlot],
      label:VERSION+':'+physicalSlot,
      maxActions:MAX_ACTIONS,
      strictPromptValidation:true,
      isolatePolicyRandomness:true,
      captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true
    };
    const canonical=()=>withCanonicalActorOnlyPolicy(
      ()=>runMatch(request),{},{}).result;
    const instrumented=()=>withCanonicalActorOnlyPolicy(
      ()=>runMatch(request),{},{
        ownerGenericTrainerFrontier:true
      });
    const control=canonical();
    const observed=instrumented();
    const repeated=canonical();
    const controlEvidence=witness(control);
    const observedEvidence=witness(observed.result);
    const repeatedEvidence=witness(repeated);
    const digest=[controlEvidence,observedEvidence,repeatedEvidence]
      .map(hash);
    const allEqual=digest[0]===digest[1]&&digest[1]===digest[2];
    const summary=observed.audit.ownerTrainerFrontierAudit?.summary;
    assert.ok(summary);
    assert.equal(summary.version,
      'agent29-bilateral-generic-trainer-frontier-transport-v1');
    assert.ok(summary.observedRootCount>0,
      'Native census must intercept actual owner root decisions');
    assert.equal(summary.observedRootCount,
      summary.bySeat[0].observedRoots+summary.bySeat[1].observedRoots);
    rows.push({
      physicalSlot,source5Seat,seed:request.seed,
      controlTraceDigest:digest[0],
      observedTraceDigest:digest[1],
      repeatedControlTraceDigest:digest[2],
      sameDealAndActionsAcrossABA:allEqual,
      originalRank5SourceStartedFirst:control.firstTurnSlot===physicalSlot,
      fullPhysicalDealSha256:
        control.initialFullPhysicalDealFingerprint?.digestSha256??null,
      observerSummary:summary,
      controlFinished:control.finished,
      observedFinished:observed.result.finished,
      controlNativeWinner:control.winner??null,
      observedNativeWinner:observed.result.winner??null
    });
    assert.ok(allEqual,
      'Read-only census must preserve all same-seed physical deals and actions');
  }
  return {
    version:VERSION,enginePin:ENGINE_PIN,sourceOriginalRanks:[5,11],
    registration:REGISTERED,canonicalPolicySameAcrossSeats:true,
    totalPhysicalDealGroups:rows.length,totalNativeAttempts:rows.length*3,
    allThreeWayTraceParity:rows.every(r=>r.sameDealAndActionsAcrossABA),
    observerAppliedToBothPhysicalSeats:true,
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
    'agent29-generic-trainer-native-parity.json'),result);
  process.stdout.write('AGENT29_GENERIC_TRAINER_NATIVE_PARITY '+
    JSON.stringify({matched:result.allThreeWayTraceParity,
      attempts:result.totalNativeAttempts,
      bySeat:result.rows.map(r=>({
        slot:r.physicalSlot,roots:r.observerSummary.observedRootCount,
        bySeat:r.observerSummary.bySeat,
        passExamples:r.observerSummary.examples.slice(0,5)
      }))})+'\n');
}
module.exports={VERSION,REGISTERED,witness,run};
