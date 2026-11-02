'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=
  require('./agent42-strict-profile-preflight.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {replayFingerprint}=
  require('./agent43-guzma-held-root-retrospective.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const {
  receipt,pairArms,summarizePairs,
  VERSION:SOURCE_METHOD
}=require('./agent2-rank11-basic-recipient-matched-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=
  'results/aichi-2026/registrations/agent31-rank1-prospective-basic-recipient-20261102.json';
const REGISTERED_BLOB='3f74a5e06df96a929157a86daf990613bd0f661f';
const VERSION='agent31-rank1-prospective-symmetric-basic-energy-recipient-v1';

/** Exact preregistration and pinned native source admission. */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(bytes),REGISTERED_BLOB,
    'A preregistered original rank1 trial or seed has changed');
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.originalRank,1);
  assert.equal(registration.trials.length,16);
  assert.equal(registration.totalNativeAttempts,32);
  assert.equal(registration.sourceRank1Printed60Required,true);
  assert.equal(registration.frozenCommonPolicy.actorOnlyComposition,true);
  assert.equal(
    registration.frozenCommonPolicy.allowAdditionalOriginalSourceRanks,true);
  assert.equal(registration.frozenCommonPolicy.nativeOwnerSupporterOpportunity,
    true);
  assert.equal(registration.frozenCommonPolicy.actorGuzmaNominalGust,false);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  const fullSeeds=[...registration.seeds.A,...registration.seeds.B];
  assert.equal(fullSeeds.length,8);
  assert.equal(new Set(fullSeeds).size,8);
  for(const row of registration.trials){
    assert.equal(row.rank,1);
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,
      row.candidateId].join(':'));
    assert.equal(row.seed,registration.seeds[row.candidateSlot][row.repeat]);
  }
  assert.equal(new Set(registration.trials.map(row=>row.id)).size,16);
  const roster=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobHash(roster),registration.originalRosterGitBlobSha);
  const deck=JSON.parse(roster.toString('utf8')).decks
    .find(row=>row.rank===1);
  assert.equal(deck.cards.reduce((n,row)=>n+row.count,0),60);
  const pin=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(pin,registration.nativeEnginePin);
  return {registration,pin,source:deck,
    rosterBlob:gitBlobHash(roster)};
}

/** Preserve raw rows even if a physical matching prerequisite fails. */
function compareSafely(control,treatment){
  const keys=new Map(treatment.map(row=>[row.trial?.id,row]));
  return control.map(a=>{
    const b=keys.get(a.trial?.id);
    const owner=receipt(a),other=b?receipt(b):null;
    return {
      id:owner.id,
      control:owner,
      treatment:other,
      sameSeed:Boolean(other)&&owner.seed===other.seed,
      sameSourceDeal:Boolean(other&&owner.sourceDeal&&other.sourceDeal)&&
        owner.sourceDeal===other.sourceDeal,
      sameFullDeal:Boolean(other&&owner.fullPhysicalDeal&&other.fullPhysicalDeal)&&
        owner.fullPhysicalDeal===other.fullPhysicalDeal,
      sameStart:Boolean(other&&owner.actualStarterSeat!=null&&
        other.actualStarterSeat!=null)&&
        owner.actualStarterSeat===other.actualStarterSeat,
      sourceOriginalOwnedSeat:owner.sourceSeat,
      candidateOwnedSeat:owner.candidateSlot==='A'?0:1
    };
  });
}

/**
 * Execute one frozen public-actor policy with exactly one symmetric Basic
 * Energy recipient toggle. Store settles all native actions and prompts.
 */
function run(){
  const p=preflight();
  const fixed={...p.registration.frozenCommonPolicy,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema};
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let control,treatment;
  try{
    control=runDevelopment({...fixed,
      bilateralBasicEnergyRecipientFrontier:false});
    treatment=runDevelopment({...fixed,
      bilateralBasicEnergyRecipientFrontier:true});
  }finally{
    if(prior===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else
      process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const matched=compareSafely(control.rows,treatment.rows);
  const allPhysicalMatched=matched.length===16&&matched.every(p=>
    p.sameSeed&&p.sameSourceDeal&&p.sameFullDeal&&p.sameStart);
  let validatedPairs=null,summary=null,validationError=null;
  try{
    validatedPairs=pairArms(control.rows,treatment.rows);
    summary=summarizePairs(validatedPairs);
  }catch(error){
    validationError=String(error?.message??error);
  }
  const safePairs=validatedPairs??[];
  return {
    schema:VERSION,genericCompareMethod:SOURCE_METHOD,
    registeredAtUtc:p.registration.registeredUtc,
    registrationPath:REGISTRATION,
    registrationGitBlobSha:REGISTERED_BLOB,
    rosterGitBlobSha:p.rosterBlob,pinnedNativeRevision:p.pin,
    sourceRank:1,sourceArchetype:p.source.archetype,
    exactOriginalSourceCardCount:60,
    sourcePrintedEnergy:p.source.cards
      .filter(row=>row.category==='Energy')
      .map(row=>({name:row.name,count:row.count})),
    controlFlag:false,treatmentFlag:true,
    symmetricTwoSeats:true,
    candidateIds:p.registration.candidateIds,
    eightFreshSeedGroups:p.registration.seeds,
    registeredAttemptsPerPolicy:16,attemptsTotal:32,
    actualControlTrials:control.rows.length,
    actualTreatmentTrials:treatment.rows.length,
    controlRootDigest:replayFingerprint(control.rows),
    treatmentRootDigest:replayFingerprint(treatment.rows),
    comparisonAudit:{
      matchedExactSameOriginalDeals:matched.filter(x=>
        x.sameSourceDeal).length,
      matchedExactCompleteDeals:matched.filter(x=>
        x.sameFullDeal).length,
      matchedStartingSeats:matched.filter(x=>
        x.sameStart).length,
      matchingPhysicalPairCount:matched.length,
      allPhysicalMatched,
      independentlyCheckedByAgent2Method:validatedPairs!==null,
      validationError
    },
    summary,matched,
    // Full failed, censored and terminal native outcomes remain archived.
    validatedPairs:safePairs,
    control,treatment,
    noQualifiedPaperMatches:true,competitiveQualifiedGames:0,
    limitations:[
      'Eight truly fresh random seed groups generated and committed before the first native treatment/control run',
      'Source original rank1 versus both fixed candidate sixty cards; symmetric actor recipient switch alone changes',
      'A complete matched native physical deal does not guarantee stronger playing policy, complete paper legality or time correctness',
      'Native turn and attack counts correlate within a small 16-game repeated-seed cohort',
      'Winning a native engine terminal would not by itself certify any Aichi official paper-game win'
    ]
  };
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write('AGENT31_RANK1_BASIC_RECIPIENT_PREFLIGHT '+
      JSON.stringify({
        schema:VERSION,rank:1,pin:p.pin,registrar:REGISTERED_BLOB,
        registeredTrials:p.registration.trials.length,
        seeds:p.registration.seeds,qualifiedGames:0
      })+'\n');
  }else{
    const result=run();
    if(process.env.AGENT31_RANK1_BASIC_RECIPIENT_OUTPUT)
      save(process.env.AGENT31_RANK1_BASIC_RECIPIENT_OUTPUT,result);
    process.stdout.write('AGENT31_RANK1_BASIC_RECIPIENT_NATIVE '+
      JSON.stringify({
        schema:result.schema,
        allPhysicalMatched:result.comparisonAudit.allPhysicalMatched,
        genericMethodVerified:
          result.comparisonAudit.independentlyCheckedByAgent2Method,
        pairingError:result.comparisonAudit.validationError,
        control:result.summary?.control??null,
        treatment:result.summary?.treatment??null,
        nativeAttempts:result.attemptsTotal,
        qualifiedGames:0
      })+'\n');
    assert.equal(result.comparisonAudit.allPhysicalMatched,true,
      'Exact original physical source deal and start must match');
    assert.equal(result.comparisonAudit.independentlyCheckedByAgent2Method,
      true,'Independent source-pair verifier rejected original native cards');
  }
}
module.exports={VERSION,REGISTERED_BLOB,preflight,compareSafely,run};
