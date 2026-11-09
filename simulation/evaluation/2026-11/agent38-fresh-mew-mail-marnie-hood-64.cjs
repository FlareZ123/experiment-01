'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {sourceResult}=
  require('./agent38-mail-marnie-retrospective-native.cjs');
const {saveAtomic}=
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION='agent38-fresh-native-marnie-payoff-hood-v1';
const ROOT=path.resolve(__dirname,'../../..');
const REGPATH='results/aichi-2026/registrations/agent38-fresh-owner-marnie-payoff-hood-20261109.json';
const OUTPUT=path.join(ROOT,'agent38-fresh-mail-marnie-hood-64native.json');
const SOURCE_SHA='a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';

/** Compare physical identity before attributing a native game result. */
function paired(control,treatment){
  assert.equal(control.trial.id,treatment.trial.id);
  const matched=Boolean(control.fullDeal&&control.sourceDeal&&
    control.fullDeal===treatment.fullDeal&&
    control.sourceDeal===treatment.sourceDeal&&
    control.firstTurn===treatment.firstTurn);
  const paidMarnie=matched&&
    (treatment.marnieFollowStoreAccepted??0)>0&&
    (treatment.marnieFollowPhysicallyDiscarded??0)>0;
  const actualOpponentResponse=paidMarnie&&
    treatment.nativeOpponentReplyAfterMarnie!==null;
  const bothTerminals=matched&&control.finished&&treatment.finished;
  return {trial:control.trial,matched,bothTerminals,paidMarnie,
    actualOpponentResponse,
    sourceResultFlipped:bothTerminals&&paidMarnie&&
      control.sourceWon!==treatment.sourceWon,
    sourceAttackDelta:matched&&
      Number.isSafeInteger(control.sourceAttackDeclarations)&&
      Number.isSafeInteger(treatment.sourceAttackDeclarations)?
      treatment.sourceAttackDeclarations-control.sourceAttackDeclarations:null,
    baseline:control,treatment,qualifiedPaperGame:false};
}

/** Validate precommitted source seeds, original printed sixties and 64 native arms. */
function loadRegistration(){
  const raw=fs.readFileSync(path.join(ROOT,REGPATH));
  const r=JSON.parse(raw.toString('utf8'));
  assert.equal(r.schema,VERSION);
  assert.equal(r.status,'FROZEN_BEFORE_EXECUTION');
  assert.equal(r.originalSourceRank,5);
  assert.equal(r.originalSource60Sha256,SOURCE_SHA);
  assert.equal(r.candidateId,'hood-shield-v1');
  assert.equal(r.freshPhysicalGroups.length,32);
  assert.equal(r.anticipatedNativeStoreAttempts,64);
  const historical=new Set(r.excludedPreviouslyExposedSourceMailSeeds);
  const seedSet=new Set();
  for(const g of r.freshPhysicalGroups){
    assert.equal(g.rank,5);
    assert.ok(['A','B'].includes(g.candidateSlot));
    assert.ok(Number.isSafeInteger(g.repeat)&&g.repeat>=0);
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>0&&g.seed<0x80000000);
    assert.ok(!seedSet.has(g.seed)&&!historical.has(g.seed));
    seedSet.add(g.seed);
  }
  assert.equal(r.freshPhysicalGroups.filter(x=>x.candidateSlot==='A').length,16);
  assert.equal(r.freshPhysicalGroups.filter(x=>x.candidateSlot==='B').length,16);
  const source=require('../../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===5);
  assert.equal(source?.printed60Sha256,SOURCE_SHA);
  assert.equal(source.physicalCards,60);
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((n,x)=>n+x.count,0),60);
  const trials=r.freshPhysicalGroups.map(g=>({...g,
    candidateId:r.candidateId,
    id:[g.rank,g.repeat,g.candidateSlot,r.candidateId].join(':')}));
  return {r,hood,trials,
    registrationSha256:createHash('sha256').update(raw).digest('hex')};
}

/** Same owner-native Mail and Mew setup in both arms; only Marnie follow differs. */
function execute(){
  const {r,hood,trials,registrationSha256}=loadRegistration();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const common={
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    actorDceMewMobilityRoot:true,
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorGenesectFusionDrawRoot:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewQuickBallPaymentGuard:true,
    actorOwnerMailAfterPass:true,
    actorOwnerMailAfterPassSourceOnly:true,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
    },
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const modes={};
  for(const [id,marnie] of [['mailOnly',false],['mailPlusMarnie',true]]){
    try{
      const native=runDevelopment({...common,
        actorOwnerMailSelectedMarnieOnPass:marnie,
        registeredTrials:trials,
        registeredFrameName:VERSION+'-'+id
      });
      assert.equal(native.attempted,32);
      assert.deepEqual(native.rows.map(x=>x.trial.id),trials.map(x=>x.id));
      modes[id]={nativeReport:native,rows:native.rows.map(sourceResult),
        batchError:null};
    }catch(error){
      modes[id]={nativeReport:null,batchError:String(error?.stack??error),
        rows:trials.map(trial=>({
          trial,fullDeal:null,sourceDeal:null,firstTurn:null,
          nativeDisposition:'NATIVE_BATCH_ERROR',
          nativeError:String(error?.message??error),finished:false,
          competitiveQualified:false
        }))};
    }
  }
  const comparisons=trials.map((trial,i)=>paired(
    modes.mailOnly.rows[i],modes.mailPlusMarnie.rows[i]));
  return {schema:VERSION,registration:REGPATH,registrationSha256,
    originalSourceRank:5,source60Sha256:SOURCE_SHA,
    registeredNativeAttempts:r.anticipatedNativeStoreAttempts,
    actualNativeRows:modes.mailOnly.rows.length+
      modes.mailPlusMarnie.rows.length,
    physicalMatchedGroups:comparisons.filter(x=>x.matched).length,
    completePairedTerminals:comparisons.filter(x=>x.bothTerminals).length,
    marniePaidGroups:comparisons.filter(x=>x.paidMarnie).length,
    marnieOpponentReplyGroups:comparisons.filter(x=>x.actualOpponentResponse).length,
    marnieWinnerReversals:comparisons.filter(x=>x.sourceResultFlipped).length,
    comparisons,modes,qualifiedPaperGames:0,
    verifiedWinRate:null};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {r,registrationSha256}=loadRegistration();
    process.stdout.write(JSON.stringify({schema:VERSION,
      registrationSha256,groups:r.freshPhysicalGroups,
      plannedAttempts:r.anticipatedNativeStoreAttempts},null,2)+'\n');
  }else{
    const z=execute();
    saveAtomic(OUTPUT,z);
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256:z.registrationSha256,
      nativeRows:z.actualNativeRows,
      physicallyMatched:z.physicalMatchedGroups,
      completeNativeTerminals:z.completePairedTerminals,
      physicallyPlayedMarnieGroups:z.marniePaidGroups,
      opponentRespondedToMarnieGroups:z.marnieOpponentReplyGroups,
      nativeWinnerReversals:z.marnieWinnerReversals,
      groupRows:z.comparisons.map(x=>({
        trial:x.trial.id,matched:x.matched,
        marniePaid:x.paidMarnie,opponentReply:x.actualOpponentResponse,
        sourceFlip:x.sourceResultFlipped,attackDelta:x.sourceAttackDelta,
        control:{finished:x.baseline.finished,sourceWon:x.baseline.sourceWon,
          prizes:x.baseline.sourcePrizes,
          attacks:x.baseline.sourceAttackDeclarations,
          mail:x.baseline.mailStoreAccepted},
        treatment:{finished:x.treatment.finished,sourceWon:x.treatment.sourceWon,
          prizes:x.treatment.sourcePrizes,
          attacks:x.treatment.sourceAttackDeclarations,
          mail:x.treatment.mailStoreAccepted,
          selectedMarnie:x.treatment.selectedMarniePhysically,
          settledMarnie:x.treatment.marnieFollowPhysicallyDiscarded,
          errors:x.treatment.nativeError}
      })),
      batchErrors:Object.fromEntries(Object.entries(z.modes)
        .filter(([,v])=>v.batchError).map(([id,v])=>[id,v.batchError])),
      qualifiedPaperGames:0
    },null,2)+'\n');
    if(Object.values(z.modes).some(x=>x.batchError))process.exitCode=1;
  }
}

module.exports={VERSION,REGPATH,loadRegistration,paired,execute};
