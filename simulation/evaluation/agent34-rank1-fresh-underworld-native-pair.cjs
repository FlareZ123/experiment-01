'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=
  require('./agent42-strict-profile-preflight.cjs');
const {preflight,compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {save}=
  require('./agent43-guzma-original-source-pair.cjs');
const {withUnderworldPhysicalSettlementWitness}=
  require('../twinleaf/agent34-underworld-physical-settlement-witness.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent34-rank1-fresh-underworld-20261102.json';
const BLOB='1af4f729c0101483a2295e0df22b9070a8510417';
const VERSION='agent34-fresh-rank1-underworld-paper-hook-source-paired-v1';

/** Load the frozen, prospectively registered physical-game schedule. */
function preflightFresh(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(bytes),BLOB,
    'Fresh original rank1 native trial registration was altered');
  const registration=JSON.parse(bytes.toString('utf8'));
  const original=preflight();
  assert.equal(registration.originalRank,1);
  assert.equal(registration.originalRosterGitBlobSha,original.rosterBlob);
  assert.equal(registration.pinnedTwinleafRevision,original.pin);
  assert.equal(registration.registeredBeforeAnyNativeOutcomeForTheseSeeds,true);
  assert.equal(registration.trials.length,16);
  assert.equal(registration.totalNativeAttempts,32);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  const uniqueSeeds=[...registration.seeds.A,...registration.seeds.B];
  assert.equal(new Set(uniqueSeeds).size,8);
  assert.equal(uniqueSeeds.length,8);
  for(const trial of registration.trials){
    assert.equal(trial.rank,1);
    assert.equal(trial.id,[trial.rank,trial.repeat,
      trial.candidateSlot,trial.candidateId].join(':'));
    assert.equal(trial.seed,
      registration.seeds[trial.candidateSlot][trial.repeat]);
  }
  return {registration,original};
}

/**
 * Replays every registered original source and both immutable candidates
 * with one default-off Ability root difference. The paper-recipient guard is
 * symmetrically installed in both arms. This does not simulate tournament
 * clock, player expertise, or a complete 32-opponent benchmark.
 * @returns {object}
 */
function run(){
  const {registration,original}=preflightFresh();
  const frozen={
    ...original.registration.frozenCommonPolicy,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    bilateralBasicEnergyRecipientFrontier:true
  };
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  let control,treatment,physical;
  try{
    control=runDevelopment({...frozen,actorUnderworldDoorRoot:false});
    const observed=withUnderworldPhysicalSettlementWitness(()=>
      runDevelopment({...frozen,actorUnderworldDoorRoot:true}));
    treatment=observed.result;
    physical=observed.audit;
  }finally{
    restore();
    if(previous===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  const matched=compareSafely(control.rows,treatment.rows);
  const strictInitialDealsMatched=matched.length===16&&
    matched.every(x=>x.sameSeed&&x.sameSourceDeal&&
      x.sameFullDeal&&x.sameStart);
  const rowBrief=(row,seat,abilityRoots)=>{
    const sourceAttacks=(row.rootActionLedger??[])
      .filter(x=>x.playerSlot===seat&&x.action==='AttackAction');
    return {
      id:row.trial.id,sourceSeat:seat,
      gameStatus:row.status??(row.finished?'native-terminal':'censored'),
      nativeWinner:row.winner??null,
      nativePrizes:row.finalPrizes??null,
      rootActionSHA256:row.rootActionLedgerSha256??null,
      sourceDeal:row.sourceDealFingerprint??null,
      fullInitialDeal:row.fullPhysicalDealFingerprint??null,
      sourceUnderworldRootCount:abilityRoots.length,
      sourceAttackRootCount:sourceAttacks.length,
      nativeMatchQualified:false
    };
  };
  const eventsByGame=new Map();
  for(const event of physical.events){
    const list=eventsByGame.get(event.game)??[];
    list.push(event);eventsByGame.set(event.game,list);
  }
  const pairs=registration.trials.map((trial,index)=>{
    const seat=trial.candidateSlot==='A'?1:0;
    const sourceRoots=row=>(row?.rootActionLedger??[])
      .filter(x=>x.playerSlot===seat&&
        x.action==='UseAbilityAction'&&
        x.ability==='Underworld Door');
    const sourceEffects=(eventsByGame.get(index+1)??[])
      .filter(e=>e.sourceSeat===seat);
    return {
      trialId:trial.id,seed:trial.seed,
      candidateId:trial.candidateId,candidateSlot:trial.candidateSlot,
      control:rowBrief(control.rows[index],seat,
        sourceRoots(control.rows[index])),
      treatment:rowBrief(treatment.rows[index],seat,
        sourceRoots(treatment.rows[index])),
      physicalSourceUnderworldPrompts:sourceEffects.length,
      fullySettledSourceEffects:sourceEffects.filter(e=>
        e.fullPhysicalEffect===true).length,
      physicallyIncompleteSourceEffects:sourceEffects.filter(e=>
        e.fullPhysicalEffect!==true).length,
      sourceOwnHandDeckCountsOnly:true
    };
  });
  const sum=(row,key)=>pairs.reduce((n,p)=>n+p[row][key],0);
  const sourceEffects=pairs.reduce((n,p)=>n+p.fullySettledSourceEffects,0);
  return {
    schema:VERSION,registeredUtc:registration.registeredUtc,
    preregistrationGitBlob:BLOB,preregistrationFile:REGISTRATION,
    originalRank:1,rosterBlob:original.rosterBlob,enginePin:original.pin,
    nativeActorOnlySameBothSeats:true,
    paperRecipientCompatibilityGuardBothArms:true,
    originalSourceAndCandidates60Unchanged:true,
    eightIndependentFreshSeedGroups:8,
    gamesPerArm:16,actualControl:control.rows.length,
    actualTreatment:treatment.rows.length,strictInitialDealsMatched,
    matched,pairs,
    controlSourceUnderworldRoots:sum('control','sourceUnderworldRootCount'),
    treatmentSourceUnderworldRoots:sum('treatment','sourceUnderworldRootCount'),
    completeOriginalSourceAbilityEffects:sourceEffects,
    incompleteOriginalSourceAbilityEffects:
      pairs.reduce((n,p)=>n+p.physicallyIncompleteSourceEffects,0),
    allSeatAbilityPhysicalEvidence:physical,
    control,treatment,
    competitivelyQualifiedGames:0,
    estimatedCompetitiveWinRate:null,
    note:'Fresh preregistered real native source games, paired by identical full initial deals. Game engine and bot remain unqualified for competitive paper-game inference.'
  };
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {registration}=preflightFresh();
    process.stdout.write('AGENT34_FRESH_UNDERWORLD_PREFLIGHT '+
      JSON.stringify({registeredUtc:registration.registeredUtc,
        blob:BLOB,trials:registration.trials.length,
        seeds:registration.seeds,paperQualifiedGames:0})+'\n');
  }else{
    const result=run();
    if(process.env.AGENT34_FRESH_UNDERWORLD_OUTPUT)
      save(process.env.AGENT34_FRESH_UNDERWORLD_OUTPUT,result);
    process.stdout.write('AGENT34_FRESH_UNDERWORLD_NATIVE '+
      JSON.stringify({
        registrationGitBlob:result.preregistrationGitBlob,
        sourceRank:1,matched:result.strictInitialDealsMatched,
        control:result.controlSourceUnderworldRoots,
        treatment:result.treatmentSourceUnderworldRoots,
        completeSourceAbilities:result.completeOriginalSourceAbilityEffects,
        incompleteSourceAbilities:result.incompleteOriginalSourceAbilityEffects,
        sourcePerTrial:result.pairs.map(p=>({
          id:p.trialId,controlRoots:p.control.sourceUnderworldRootCount,
          treatmentRoots:p.treatment.sourceUnderworldRootCount,
          completeEffects:p.fullySettledSourceEffects,
          sourceWinnerBefore:p.control.nativeWinner,
          sourceWinnerAfter:p.treatment.nativeWinner
        })),
        paperQualifiedGames:0})+'\n');
    assert.equal(result.strictInitialDealsMatched,true,
      'Native rank1 policy A/B requires all complete deals and seats matched');
  }
}
module.exports={VERSION,BLOB,preflightFresh,run};
