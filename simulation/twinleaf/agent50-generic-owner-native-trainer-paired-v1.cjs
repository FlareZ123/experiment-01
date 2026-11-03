'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const VERSION='agent50-generic-owner-native-trainer-paired-v1';
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const registrationPath=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent50-owner-native-trainer-fallback-v1-20261103.json');
const registrationBytes=fs.readFileSync(registrationPath);
const registration=JSON.parse(registrationBytes.toString('utf8'));
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const manifestHash=createHash('sha256').update(registrationBytes).digest('hex');

/** @param {object} game Real headless native Store result. */
function gameEvidence(game){
  return {
    engine:game.engine,seed:game.seed,
    firstTurnSlot:game.firstTurnSlot,
    fullDealSha256:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
    deckHashes:game.deckHashes,
    decisionTrace:game.decisionTrace??[],
    rootActionLedger:game.rootActionLedger??[],
    finished:game.finished===true,
    winner:game.finished===true?game.winner:null,
    actionCapped:game.finished!==true,
    gameClockPaperCertified:false
  };
}

/**
 * One immutable three-arm diagnostic where the exact same two authenticated
 * original 60s occupy fixed seats and only the named generic option differs.
 * No individual native terminal is a competitive game or deck-ranking result.
 * @param {object} request Frozen native match args.
 * @param {boolean} treated Use generic native Trainer after unsupported Pass.
 */
function attempt(request,treated){
  const record={treated,enginePin:PIN,runStatus:'not-attempted',
    nativeError:null,game:null,summary:null};
  try{
    const result=withCanonicalActorOnlyPolicy(()=>runMatch(request),{},{
      ownerGenericTrainerFrontier:true,
      ownerTrainerRegisteredSixties:[request.deckA,request.deckB],
      genericFallbackAttribution:true,
      nativeOwnerTrainerFallback:treated
    });
    const game=result.result;
    assert.equal(game.engine,PIN);
    record.game=gameEvidence(game);
    const frontier=result.audit.ownerTrainerFrontierAudit?.summary??null;
    const fallback=result.audit.nativeOwnerTrainerFallbackAudit??null;
    if(treated)assert.ok(fallback,
      'Selected canonical policy did not return the native Trainer bridge audit');
    record.summary={
      ownerRootsObserved:frontier?.observedRootCount??null,
      acceptedPassesHoldingGenericallyUnblockedTrainers:frontier?
        frontier.bySeat[0].acceptedPassWithUnblockedTrainer+
        frontier.bySeat[1].acceptedPassWithUnblockedTrainer:null,
      nativeTrainerRootsProposed:fallback?.selectedNativeTrainerRoots??0,
      nativeTrainerRootsAccepted:fallback?.acceptedNativeTrainerRoots??0,
      nativeTrainerRootsRejected:fallback?.rejectedNativeTrainerRoots??0,
      nativeBridgeAttempts:fallback?.attemptedUnsupportedPasses??0,
      fallbackReceipts:fallback?.receipts??[],
      receiptsOmitted:fallback?.receiptsOmitted??0,
      nativeDecisionMayUseHiddenInformation:treated,
      paperPaymentVerified:false,competitiveQualified:false
    };
    record.runStatus=game.finished===true?'native-terminal':'action-capped';
  }catch(e){
    record.runStatus='native-error';
    record.nativeError=String(e?.stack||e).slice(0,3600);
  }
  return record;
}

/** Actual compiled Store across immutable, unused developer seed identities. */
function run(){
  assert.equal(registration.schema,
    'agent50-generic-native-trainer-fallback-registration-v1');
  assert.deepEqual(registration.sourceRanks,[5,11]);
  assert.equal(registration.plannedNativeAttempts,12);
  assert.deepEqual(registration.seedProtocol.repeats,[1,2]);
  initializeCards();
  const original=planAichi(5,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const five=original.candidate.cards;
  const eleven=original.opponents.find(x=>x.rank===11)?.cards;
  assert.equal(five?.length,60);
  assert.equal(eleven?.length,60);
  const cases=[];
  const seedIdentities=new Set();
  for(const repeat of registration.seedProtocol.repeats){
    const seeds=deriveSlotSeeds(registration.seedProtocol.base,
      registration.seedProtocol.phase,registration.seedProtocol.rank,repeat);
    for(const order of registration.physicalSeatOrders){
      const seed=seeds[order.slot];
      assert.ok(Number.isSafeInteger(seed)&&!seedIdentities.has(seed));
      seedIdentities.add(seed);
      const deckA=order.rank5Seat===0?five:eleven;
      const deckB=order.rank5Seat===0?eleven:five;
      const request={deckA,deckB,seed,
        maxActions:registration.perAttempt.maxActions,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
        label:VERSION+':repeat'+repeat+':'+order.slot};
      const results=[
        attempt(request,false),attempt(request,true),attempt(request,false)
      ];
      const successful=results.every(row=>row.game!==null);
      const physicalHashes=results.map(row=>row.game?.fullDealSha256??null);
      const replayHashes=results.map(row=>row.game?sha(row.game):null);
      const physicalMatch=successful&&physicalHashes[0]!==null&&
        physicalHashes.every(x=>x===physicalHashes[0]);
      const controlReplayMatch=successful&&replayHashes[0]===replayHashes[2];
      cases.push({
        repeat,slot:order.slot,source5Seat:order.rank5Seat,seed,
        originalPrinted60Hashes:[sha(deckA),sha(deckB)],
        physicalMatch,controlReplayMatch,
        physicalHashes,replayHashes,
        results
      });
    }
  }
  assert.equal(cases.length,registration.plannedPhysicalCohorts);
  const nativeErrors=cases.flatMap(c=>c.results.filter(r=>
    r.runStatus==='native-error').map(r=>({
      repeat:c.repeat,slot:c.slot,treated:r.treated,
      error:r.nativeError
    })));
  const fullParity=cases.every(c=>c.physicalMatch&&c.controlReplayMatch);
  const selectedTrainer=cases.reduce((n,c)=>n+
    (c.results[1].summary?.nativeTrainerRootsAccepted??0),0);
  const output={
    version:VERSION,registration,registrationSha256:manifestHash,
    pinnedEngine:PIN,policySymmetricBothSeats:true,
    originalPrintedSourceRanks:[5,11],
    original60sUnchangedInEveryArm:true,
    attemptsRegistered:registration.plannedNativeAttempts,
    attemptsArchived:cases.reduce((n,c)=>n+c.results.length,0),
    physicalGroups:cases.length,fullParity,
    nativeErrors,selectedNativeTrainerRootAcceptances:selectedTrainer,
    achievedQualifiedPaperGames:0,
    credibleFieldWinRate:null,bestFixed60Selected:false,
    paperPaymentOrEffectVerified:false,
    nativeBotHiddenInformationNotExcluded:true,
    comparisonsAreDevelopmental:true,
    cases
  };
  return output;
}
if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent50-generic-owner-native-trainer-paired-v1.json'),result);
  process.stdout.write('AGENT50_GENERIC_OWNER_NATIVE_TRAINER '+
    JSON.stringify({
      registrationSha256:result.registrationSha256,
      attempted:result.attemptsArchived,physicalGroups:result.physicalGroups,
      fullParity:result.fullParity,
      errors:result.nativeErrors.length,
      nativeTrainerRoots:result.selectedNativeTrainerRootAcceptances,
      perGroup:result.cases.map(c=>({
        repeat:c.repeat,slot:c.slot,physicalMatch:c.physicalMatch,
        replayMatch:c.controlReplayMatch,
        status:c.results.map(x=>x.runStatus),
        nativeTrainerSelected:c.results[1].summary?.nativeTrainerRootsProposed??0,
        nativeTrainerAccepted:c.results[1].summary?.nativeTrainerRootsAccepted??0
      }))
    })+'\n');
  if(!result.fullParity||result.nativeErrors.length||
     result.attemptsArchived!==registration.plannedNativeAttempts)
    process.exitCode=1;
}
module.exports={VERSION,PIN,registration,gameEvidence,attempt,run};
