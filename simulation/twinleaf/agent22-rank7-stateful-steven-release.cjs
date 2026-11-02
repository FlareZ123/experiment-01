'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {gitBlobHash}=
  require('../evaluation/agent36-profile-provenance-gate.cjs');
const {statefulStevenBundleScore,VERSION:MODEL_VERSION}=
  require('./agent22-stateful-steven-score.cjs');
const {scoreBundle:staticHypotheticalScore}=
  require('./agent22-rank7-dealt-steven-pair.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG_PATH='results/aichi-2026/registrations/agent22-rank7-stateful-steven-20261102.json';
const REG_BLOB='9d5cfc7942e1121ae288bbf32b6068cd19348043';
const SCORER_BLOB='a697d664ca2cd657de5e12114d0732fc22e47353';
const VERSION='agent22-rank7-stateful-steven-original-newseed-development-v1';

/** Independent pre-native policy, original printed-card and seed freezes. */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REG_PATH));
  assert.equal(gitBlobHash(bytes),REG_BLOB);
  assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,
    'simulation/twinleaf/agent22-stateful-steven-score.cjs'))),
  SCORER_BLOB);
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.totalNativeAttempts,18);
  assert.equal(registration.pinnedTwinleafRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.model.id,MODEL_VERSION);
  assert.deepEqual(registration.policyModes,
    ['lexical','static-hypothetical','state-contingent']);
  assert.deepEqual(registration.registeredSeeds,
    [690788095,3370031093,63650769]);
  assert.equal(new Set(registration.registeredSeeds).size,3);
  assert.deepEqual(registration.originalSourcePhysicalSeats,[0,1]);
  assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,
    registration.rosterPath))),registration.rosterGitBlobSha);
  const admissionPath=path.join(ROOT,
    'results/aichi-2026/original-printed60-admission-v1.json');
  assert.equal(gitBlobHash(fs.readFileSync(admissionPath)),
    registration.admissionGitBlobSha);
  const admission=JSON.parse(fs.readFileSync(admissionPath,'utf8'));
  for(const [rank,expected] of [
    [7,registration.sourcePrinted60Sha256],
    [1,registration.opponentPrinted60Sha256]
  ]){
    const row=admission.rows.find(item=>item.rank===rank);
    assert.equal(row.printed60Sha256,expected);
    assert.equal(row.physicalCards,60);
  }
  return registration;
}

/** @returns {object} All registered original source/candidate developmental arms. */
function run(){
  const registration=preflight();
  const {runMatch,initializeCards}=require('./headless.cjs');
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const {actorObservation}=require('./actor-observation-contract.cjs');
  const {withNumericShuffleValidator}=
    require('./agent22-numeric-shuffle-validation-hook.cjs');
  const {withSparseActorOwnerSearch,sparseObservedOwnerSearch}=
    require('./agent22-sparse-owner-search-adapter.cjs');
  const {withSourceStevenPhysicalLineage}=
    require('./agent22-steven-physical-lineage.cjs');
  const {Store}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  initializeCards();
  const field=resolveManifestFile(path.join(ROOT,registration.rosterPath),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(item=>[item.rank,item]));
  assert.ok(byRank.get(7)?.playableUnderEngine&&
    byRank.get(7).cardIds.length===60);
  assert.ok(byRank.get(1)?.playableUnderEngine&&
    byRank.get(1).cardIds.length===60);

  const rows=[];
  for(const seed of registration.registeredSeeds){
    for(const sourceSeat of registration.originalSourcePhysicalSeats){
      for(const policy of registration.policyModes){
        const trial={seed,sourceSeat,policy,
          id:[seed,sourceSeat,policy].join(':')};
        const request={
          deckA:byRank.get(sourceSeat===0?7:1).cardIds,
          deckB:byRank.get(sourceSeat===1?7:1).cardIds,
          seed,maxActions:registration.maxRootActions,
          strictPromptValidation:true,
          isolatePolicyRandomness:true,
          postSuperAliasRepairIsolation:true,
          supporterDecisionCorrection:true,
          captureInitialSourceDealFingerprintSeat:sourceSeat,
          captureDecisionTrace:true
        };
        try{
          const scored=policy==='state-contingent'?
            statefulStevenBundleScore:policy==='static-hypothetical'?
              staticHypotheticalScore:null;
          const observed=withSourceStevenPhysicalLineage(sourceSeat,()=>
            withNumericShuffleValidator(()=>
              withSparseActorOwnerSearch(()=>runMatch(request),{
                observe:(state,seat)=>seat===sourceSeat?
                  sparseObservedOwnerSearch(state,seat,
                    actorObservation,scored):null
              })),{Store});
          const native=observed.result.result;
          const selected=observed.audit;
          assert.equal(selected.authenticatedLiveStore,true);
          assert.ok(Array.isArray(native.rootActionLedger));
          const rootLedgerSha256=crypto.createHash('sha256')
            .update(JSON.stringify(native.rootActionLedger))
            .digest('hex');
          rows.push({
            trial,status:native.endReason==='action-limit'?'CENSORED':
              native.finished===true?'ENGINE_TERMINAL_UNQUALIFIED':
                'UNVERIFIED',
            nativeEndReason:native.endReason,
            nativeActions:native.actions,
            nativeTurns:native.turns,
            finished:native.finished===true,
            winner:native.finished===true?native.winner:null,
            prizesRemaining:native.prizesRemaining,
            sourceDealFingerprint:
              native.initialSourceDealFingerprint?.digestSha256??null,
            rootLedgerSha256,
            sourceStevenPhysical:selected,
            competitiveGameQualified:false
          });
        }catch(error){
          rows.push({trial,status:'NATIVE_ERROR',
            nativeError:String(error?.stack??error),
            sourceDealFingerprint:null,
            sourceStevenPhysical:null,competitiveGameQualified:false});
        }
      }
    }
  }
  assert.equal(rows.length,registration.totalNativeAttempts);
  const groups=[];
  for(const seed of registration.registeredSeeds){
    for(const seat of registration.originalSourcePhysicalSeats){
      const arms=registration.policyModes.map(policy=>
        rows.find(row=>row.trial.seed===seed&&
          row.trial.sourceSeat===seat&&row.trial.policy===policy));
      const fingerprints=arms.map(row=>row.sourceDealFingerprint);
      const exact=fingerprints.every(x=>typeof x==='string')&&
        new Set(fingerprints).size===1;
      groups.push({seed,sourceSeat:seat,
        physicalSourceDealMatch:exact?'EXACT_SOURCE_DEAL_MATCH':'UNVERIFIED',
        sourceDealFingerprints:fingerprints,
        statuses:arms.map(row=>row.status),
        sourceStevenSearchCounts:arms.map(row=>
          row.sourceStevenPhysical?.nativeSearchPromptResolutions??null),
        laterExactPhysicalPlays:arms.map(row=>
          row.sourceStevenPhysical?.physicalTokensLaterPlayed??null)});
    }
  }
  return {
    schema:VERSION,registrationBlobSha:REG_BLOB,
    scorerBlobSha:SCORER_BLOB,sourceRank:7,opponentRank:1,
    policies:registration.policyModes,
    attempted:rows.length,allNativeArmsRetained:true,
    maxRootActions:registration.maxRootActions,
    sourcePrinted60Sha256:registration.sourcePrinted60Sha256,
    opponentPrinted60Sha256:registration.opponentPrinted60Sha256,
    enginePin:registration.pinnedTwinleafRevision,
    rows,sourceDealGroups:groups,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    caveats:[
      'Native actor and opponent policy unqualified for competitive inference',
      'No official paper clock or full original-field matchups',
      'Known proxy and incomplete printed interactions remain',
      'All action-censored and native-abort arms preserved',
      'Hypothetical hand-card scoring not a proven winner valuation'
    ]
  };
}
if(require.main===module){
  const result=process.argv.includes('--inspect-only')?
    {schema:VERSION,registration:preflight(),
      nativeExecution:false}:run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,REG_BLOB,SCORER_BLOB,preflight,run};
