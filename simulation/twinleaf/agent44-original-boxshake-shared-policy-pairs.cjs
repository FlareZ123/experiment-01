'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {schedule}=require('./agent44-rank8-box-k0-source-census.cjs');
const {withRank8AuthenticK0Observer}=
  require('./agent44-rank8-box-k0-source-census.cjs');
const {withSharedFirstTurnBoxShake,VERSION}=
  require('./agent44-owner-boxshake-native-policy.cjs');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const HISTORICAL_SEED=214648959;
const FRESH_START=256;
const FRESH_COUNT=16;
const FLEX_FRESH_START=272;
const FLEX_FRESH_COUNT=32;
const MAX_ACTIONS=120;
function sha(data){
  return crypto.createHash('sha256').update(data).digest('hex');
}
function compactGame(game){
  return {
    firstTurnSlot:game.firstTurnSlot,
    deckHashes:game.deckHashes,
    actions:game.actions,
    finished:game.finished,
    decisionTraceSha256:sha(JSON.stringify(game.decisionTrace))
  };
}

/**
 * Comparisons are same printed original source and same physical seed.
 * The selected historical positive is explicitly retrospective. Indices
 * 256-271 are a separately precommitted future source-deal cohort.
 *
 * @returns {object} Unconditional native evidence and all attempted rows.
 */
function run({flexible=false}={}){
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(deck=>deck.rank===8);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  initializeCards();
  const {Store}=require(path.join(BASE,'game/store/store'));
  const fixed=[{trial:'retrospective-original-positive',sourceSeat:0,
    seed:HISTORICAL_SEED,cohort:'retrospective-selected'}];
  const startIndex=flexible?FLEX_FRESH_START:FRESH_START;
  const count=flexible?FLEX_FRESH_COUNT:FRESH_COUNT;
  const future=schedule(startIndex,count).map(row=>({
    ...row,cohort:'precommitted-unselected-extension'
  }));
  const precommitted=[...fixed,...future];
  const manifestSha256=sha(JSON.stringify(precommitted));
  const trials=[];
  for(const row of precommitted){
    const request={
      deckA:row.sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:row.sourceSeat===1?source.cards:plan.candidate.cards,
      seed:row.seed,maxActions:MAX_ACTIONS,strictPromptValidation:true,
      forestSealSearchCorrection:true,doubleDragonRecovery:true,
      supporterDecisionCorrection:true,isolatePolicyRandomness:true,
      leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
      entryDrawLockCorrection:true,captureDecisionTrace:true,
      label:'agent44-shared-box-shake-'+row.trial
    };
    try{
      const baseline=withRank8AuthenticK0Observer(Store,row.sourceSeat,
        ()=>runMatch(request));
      const treatment=withRank8AuthenticK0Observer(Store,row.sourceSeat,
        ()=>withSharedFirstTurnBoxShake(()=>runMatch(request),{flexible}));
      assert.deepEqual(baseline.sourceK0,treatment.sourceK0,
        'Source K0 before first native action drifted');
      assert.deepEqual(baseline.result.deckHashes,
        treatment.result.result.deckHashes,
        'Initial physical deck fingerprint drifted');
      assert.equal(baseline.result.firstTurnSlot,
        treatment.result.result.firstTurnSlot,
        'Physical first player drifted');
      const audit=treatment.result.audit;
      const noOffer=audit.offers.length===0;
      if(noOffer)assert.deepEqual(baseline.result.decisionTrace,
        treatment.result.result.decisionTrace,
        'No-offer common policy changed default decision trace');
      trials.push({...row,
        sourceActualFirst:baseline.result.firstTurnSlot===row.sourceSeat,
        originalK0Equal:true,physicalDealEqual:true,
        baseline:compactGame(baseline.result),
        treatment:compactGame(treatment.result.result),
        nativePolicyAudit:audit,
        noOfferFullDecisionTraceEqual:noOffer?true:null,
        status:audit.completeNativeEvolutions>0&&
          audit.opponentContinuations.some(w=>w.sourceSeat===row.sourceSeat&&
            w.equippedGarbodor)?
          'NATIVE_FIRSTTURN_SHAKE_EVOLUTION_OBSERVED':
          audit.offers.length?'OFFERED_INCOMPLETE_OR_ABORTED':'NOT_ENCOUNTERED',
        error:null});
    }catch(error){
      trials.push({...row,sourceActualFirst:null,originalK0Equal:null,
        physicalDealEqual:null,baseline:null,treatment:null,
        nativePolicyAudit:null,noOfferFullDecisionTraceEqual:null,
        status:'NATIVE_ERROR',error:{name:error.name,
          message:String(error.message??error)}});
    }
  }
  const historical=trials[0];
  const summary=rows=>({
    attempted:rows.length,
    noOffer:rows.filter(row=>row.status==='NOT_ENCOUNTERED').length,
    completedEvolutions:rows.filter(row=>
      row.status==='NATIVE_FIRSTTURN_SHAKE_EVOLUTION_OBSERVED').length,
    offeredIncomplete:rows.filter(row=>
      row.status==='OFFERED_INCOMPLETE_OR_ABORTED').length,
    nativeErrors:rows.filter(row=>row.status==='NATIVE_ERROR').length
  });
  return {
    schema:flexible?'agent44-shared-box-shake-flexible-original-pairs-v2':
      'agent44-shared-box-shake-original-native-deal-pairs-v1',
    sourceRank:8,sourceOriginal60:true,candidateOriginal60:true,
    policy:flexible?
      require('./agent44-owner-boxshake-native-policy.cjs').FLEX_VERSION:VERSION,
    selectedPolicyDefaultOff:true,flexibleFirstTurnBoxPolicy: Boolean(flexible),
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    engineRevision:plan.engineRevision,
    policySourceSha256:sha(fs.readFileSync(path.join(__dirname,
      'agent44-owner-boxshake-native-policy.cjs'))),
    ownerK1SourceSha256:sha(fs.readFileSync(path.join(__dirname,
      'agent44-secretbox-owner-prompt.cjs'))),
    sourceK0SourceSha256:sha(fs.readFileSync(path.join(__dirname,
      'agent44-rank8-box-k0-window.cjs'))),
    maxActions:MAX_ACTIONS,manifestSha256,
    predeclaredFreshIndices:[startIndex,startIndex+count-1],
    historicalPositiveSummary:summary([historical]),
    prospectiveSummary:summary(trials.slice(1)),
    historicalSourceNextOpponentTurnObserved:
      historical.nativePolicyAudit?.opponentContinuations.some(row=>
        row.sourceSeat===0&&row.equippedGarbodor)??false,
    allAttempted:trials,
    competitiveQualifiedGames:0,
    caveat:'One retrospectively selected positive original deal and 16 separate unselected future original deals. Symmetric owner-only opt-in, no illegal hand/deck/Prize swap. A native-accepted scripted first-turn line remains developmental; original opponent decisions and the paper clock are not competitive-qualified. No win-rate inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run({
  flexible:process.env.AGENT44_RANK8_BOX_FLEXIBLE==='true'
}),null,2)+'\n');
module.exports={HISTORICAL_SEED,FRESH_START,FRESH_COUNT,
  FLEX_FRESH_START,FLEX_FRESH_COUNT,MAX_ACTIONS,run};
