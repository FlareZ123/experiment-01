'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {attempt,registration,PIN}=
  require('./agent50-generic-owner-native-trainer-paired-v1.cjs');
const {withNativeTrainerScoreObserver,VERSION}=
  require('./agent9-native-trainer-score-observer.cjs');

const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Original, previously registered four A/B/A source-deal cohorts. This is a
 * reread of the same registered 5-vs-11 treatment policy in native Store,
 * with a read-only scorer hook. No selected card, seed, 60 or policy changes.
 * Every baseline/observed pair is compared on the full archived game
 * projection (including physical first-deal hashes, decisions, terminals).
 *
 * @returns {object} Synthetic/provenance-safe scorer-use diagnostic.
 */
function run(){
  initializeCards();
  const source=planAichi(5,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const five=source.candidate.cards;
  const eleven=source.opponents.find(x=>x.rank===11)?.cards;
  assert.equal(five?.length,60);
  assert.equal(eleven?.length,60);
  const rows=[];
  for(const repeat of registration.seedProtocol.repeats){
    const seeds=deriveSlotSeeds(registration.seedProtocol.base,
      registration.seedProtocol.phase,registration.seedProtocol.rank,repeat);
    for(const order of registration.physicalSeatOrders){
      const seat=order.rank5Seat;
      const request={
        deckA:seat===0?five:eleven,
        deckB:seat===0?eleven:five,
        seed:seeds[order.slot],
        maxActions:registration.perAttempt.maxActions,
        strictPromptValidation:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true,
        captureInitialFullPhysicalDeal:true,
        label:'agent9-native-trainer-score-census:'+repeat+':'+order.slot
      };
      const baseline=attempt(request,true);
      const observed=withNativeTrainerScoreObserver(()=>attempt(request,true));
      assert.deepStrictEqual(observed.result,baseline,
        'Read-only native scorer observer changed actual registered game evidence');
      assert.ok(observed.audit.realOwnerNativeDelegations>=
        (baseline.summary?.nativeBridgeAttempts??0),
        'Delegated unsupported Pass roots were not actually observed');
      assert.equal(observed.audit.competitiveGamesQualified,0);
      rows.push({
        repeat,slot:order.slot,rank5Seat:seat,seed:request.seed,
        originalPrinted60Hashes:[sha(request.deckA),sha(request.deckB)],
        identicalBaselineAndObservedGame:true,
        sourceDealSha256:baseline.game?.fullDealSha256??null,
        nativeStatus:baseline.runStatus,
        nativeBridgeAttempts:baseline.summary?.nativeBridgeAttempts??null,
        acceptedNativeTrainers:baseline.summary?.nativeTrainerRootsAccepted??null,
        delegateAudit:observed.audit,
        sourceGameCompetenceCertified:false
      });
    }
  }
  const sum=(key)=>rows.reduce((n,row)=>n+(row.delegateAudit[key]??0),0);
  return {
    version:VERSION+'-four-registered-cohort-readonly-v1',
    enginePin:PIN,registeredSourceRanks:[5,11],
    unchangedExactPrintedSixties:true,seedRegistrationStable:true,
    physicalGroups:rows.length,pairedArms:rows.length*2,
    allMatchedSourcePhysicalDeals:rows.every(row=>row.sourceDealSha256!==null),
    allMatchedBaselineGameEvidence:rows.every(row=>row.identicalBaselineAndObservedGame),
    authenticDelegations:sum('realOwnerNativeDelegations'),
    delegationsWithAnyScorerCalls:sum('delegationsWithAnyScorerCalls'),
    delegationsWithoutScorerCalls:sum('delegationsWithoutScorerCalls'),
    tacticEvaluateActionCalls:sum('tacticEvaluateActionCalls'),
    tacticGetStateScoreCalls:sum('tacticGetStateScoreCalls'),
    nativeAcceptedTrainers:rows.reduce((n,row)=>n+
      (row.acceptedNativeTrainers??0),0),
    causalInformationLeakAtSpecificSourceRootProven:false,
    paperLegalGamesQualified:0,opponentPolicyCompetenceCertified:false,
    selectedFixed60:null,credible99point5:null,rows
  };
}
if(require.main===module){
  const output=run();
  process.stdout.write('AGENT9_NATIVE_REALROOT_SCORER '+
    JSON.stringify({
      cohorts:output.physicalGroups,
      pairedArms:output.pairedArms,
      authenticDelegations:output.authenticDelegations,
      nativeAcceptedTrainers:output.nativeAcceptedTrainers,
      scorerRootCount:output.delegationsWithAnyScorerCalls,
      scoreCalls:output.tacticGetStateScoreCalls,
      evaluateCalls:output.tacticEvaluateActionCalls,
      provenanceParities:output.allMatchedBaselineGameEvidence
    })+'\n');
  require('node:fs').writeFileSync('agent9-native-trainer-realroot-score-census.json',
    JSON.stringify(output,null,2)+'\n');
}
module.exports={run};
