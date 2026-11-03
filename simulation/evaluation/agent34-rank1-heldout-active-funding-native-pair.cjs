'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:preflightOriginal,compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {preflightFresh:preflightPrior}=
  require('./agent34-rank1-fresh-underworld-native-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {auditedSourceDigest}=require('./agent34-fresh-underworld-abort-pair-audit.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const {countSourceAttacks,countSourceActivePsychicAttachments}=
  require('./agent34-rank1-active-funding-posthoc-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent34-rank1-heldout-active-funding-20261103.json';
const BLOB='7f21635fb83fc9b4daab782adfac389af3127c5b';
const VERSION='agent34-heldout-source-rank1-active-funding-20261103-v1';

/**
 * Frozen before running these 16 new seed groups.
 * This controls trial selection and detects registry modification.
 */
function preflightHeldout(){
  const bytes=fs.readFileSync(path.join(ROOT,REG));
  assert.equal(gitBlobHash(bytes),BLOB,'Held-out preregistration changed');
  const registration=JSON.parse(bytes.toString('utf8'));
  const original=preflightOriginal();
  const prior=preflightPrior().registration;
  assert.equal(registration.registeredBeforeAnyNativeOutcomeForTheseSeeds,true);
  assert.equal(registration.originalRank,1);
  assert.equal(registration.pinnedTwinleafRevision,original.pin);
  assert.equal(registration.originalRosterGitBlobSha,original.rosterBlob);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.registeredArmsPerPolicy,32);
  assert.equal(registration.totalNativeAttempts,64);
  assert.equal(registration.trials.length,32);
  const allSeeds=[...registration.seeds.A,...registration.seeds.B];
  assert.equal(allSeeds.length,16);
  assert.equal(new Set(allSeeds).size,16);
  const earlier=new Set([...prior.seeds.A,...prior.seeds.B]);
  assert.ok(allSeeds.every(seed=>!earlier.has(seed)),
    'Held-out and development seeds must not overlap');
  for(const trial of registration.trials){
    assert.equal(trial.rank,1);
    assert.equal(trial.id,[trial.rank,trial.repeat,
      trial.candidateSlot,trial.candidateId].join(':'));
    assert.equal(trial.seed,
      registration.seeds[trial.candidateSlot][trial.repeat]);
  }
  return {original,registration};
}

function sourceDoors(row,seat){
  if(!Array.isArray(row.rootActionLedger))return null;
  return row.rootActionLedger.filter(x=>
    x.playerSlot===seat&&x.action==='UseAbilityAction'&&
    x.ability==='Underworld Door').length;
}

function nativeClass(row,seat){
  if(row.status==='engine-error'||row.status==='engine-physical-invalid')
    return 'native-engine-error';
  if(row.finished!==true)return 'native-censored';
  if(row.winner===seat)return 'source-native-terminal';
  if(row.winner===1-seat)return 'candidate-native-terminal';
  return 'other-native-terminal';
}

/** Held-out simulation still has zero qualified paper-game observations. */
function run(){
  const {registration,original}=preflightHeldout();
  const base={
    ...original.registration.frozenCommonPolicy,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true
  };
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  let control,treatment;
  try{
    control=runDevelopment({...base,
      actorUnderworldActiveFundingPriority:false});
    treatment=runDevelopment({...base,
      actorUnderworldActiveFundingPriority:true});
  }finally{
    restore();
    if(previous===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  const matching=compareSafely(control.rows,treatment.rows);
  assert.equal(matching.length,32);
  const rows=registration.trials.map((trial,i)=>{
    const a=control.rows[i],b=treatment.rows[i],m=matching[i];
    assert.equal(a.trial.id,trial.id);assert.equal(b.trial.id,trial.id);
    assert.equal(a.trial.seed,trial.seed);assert.equal(b.trial.seed,trial.seed);
    const seat=trial.candidateSlot==='A'?1:0;
    const x=auditedSourceDigest(a,seat),y=auditedSourceDigest(b,seat);
    const ar=b.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
    return {
      trialId:trial.id,registeredSeed:trial.seed,
      sourceSeat:seat,candidateId:trial.candidateId,
      matchingFullSourceInitialDeal:x.digest!==null&&x.digest===y.digest,
      matchingFullBilateralInitialDeal:m.sameSeed&&m.sameSourceDeal&&
        m.sameFullDeal&&m.sameStart,
      controlSourceAttacks:Array.isArray(a.rootActionLedger)?
        countSourceAttacks(a,seat):null,
      prioritySourceAttacks:Array.isArray(b.rootActionLedger)?
        countSourceAttacks(b,seat):null,
      controlSourceActiveManualPsychic:
        countSourceActivePsychicAttachments(a,seat),
      prioritySourceActiveManualPsychic:
        countSourceActivePsychicAttachments(b,seat),
      controlSourceDoors:sourceDoors(a,seat),
      prioritySourceDoors:sourceDoors(b,seat),
      sourceAndCandidatePrioritySelections:
        ar.underworldActiveFundingPrioritySelected??0,
      controlOutcome:nativeClass(a,seat),priorityOutcome:nativeClass(b,seat),
      controlRootSha:a.rootActionLedgerSha256??null,
      priorityRootSha:b.rootActionLedgerSha256??null,
      competitiveGameQualified:false
    };
  });
  const n=fn=>rows.filter(fn).length;
  const sum=k=>rows.reduce((v,r)=>v+(r[k]??0),0);
  const pairedEligible=rows.filter(r=>r.matchingFullBilateralInitialDeal&&
    r.controlSourceAttacks!==null&&r.prioritySourceAttacks!==null);
  const summary={
    registeredUniqueSeedGroups:16,
    registeredPairs:32,nativeAttempts:64,
    exactSourceInitialPairs:n(r=>r.matchingFullSourceInitialDeal),
    exactEntireInitialPairs:n(r=>r.matchingFullBilateralInitialDeal),
    missingAttackLedgers:n(r=>r.controlSourceAttacks===null||
      r.prioritySourceAttacks===null),
    selectedPriorityRootsBothSeats:sum('sourceAndCandidatePrioritySelections'),
    controlOriginalSourceAttackActions:sum('controlSourceAttacks'),
    priorityOriginalSourceAttackActions:sum('prioritySourceAttacks'),
    controlOriginalSourceManualActivePsychic:
      sum('controlSourceActiveManualPsychic'),
    priorityOriginalSourceManualActivePsychic:
      sum('prioritySourceActiveManualPsychic'),
    controlOriginalSourceUnderworldActions:sum('controlSourceDoors'),
    priorityOriginalSourceUnderworldActions:sum('prioritySourceDoors'),
    pairedMoreSourceAttacks:pairedEligible.filter(r=>
      r.prioritySourceAttacks>r.controlSourceAttacks).length,
    pairedFewerSourceAttacks:pairedEligible.filter(r=>
      r.prioritySourceAttacks<r.controlSourceAttacks).length,
    pairedSameSourceAttacks:pairedEligible.filter(r=>
      r.prioritySourceAttacks===r.controlSourceAttacks).length,
    controlOutcomes:Object.fromEntries([...new Set(rows.map(r=>r.controlOutcome))]
      .map(k=>[k,n(r=>r.controlOutcome===k)])),
    priorityOutcomes:Object.fromEntries([...new Set(rows.map(r=>r.priorityOutcome))]
      .map(k=>[k,n(r=>r.priorityOutcome===k)])),
    paperCompetitiveGameQualifying:0
  };
  return {schema:VERSION,registrationGitBlob:BLOB,
    registrationPath:REG,registeredBeforeAnyNativeOutcome:true,
    initiallyUnobservedSeedGroups:16,
    originalSourceAndCandidateSixtiesUnchanged:true,
    unchangedSourceRank:1,enginePin:original.pin,
    originalRosterBlob:original.rosterBlob,
    sameCommonPolicyBothSeats:true,psychicRecipientPaperHookBothArms:true,
    onlyIntentionalDifference:'owner-only last-Psychic active priority option',
    limitations:'Native simulator outcomes are unqualified. This is a fresh-source policy test, not competitive win evidence.',
    summary,rows,control,treatment,competitivePaperGames:0};
}

if(require.main===module){
  if(process.argv.includes('--preflight')){
    const x=preflightHeldout();
    process.stdout.write('AGENT34_HELDOUT_PREFLIGHT '+JSON.stringify({
      blob:BLOB,registered:x.registration.trials.length,
      newSeedGroups:x.registration.independentSeedGroups,
      paperQualified:0})+'\n');
  }else{
    const result=run();
    if(process.env.AGENT34_HELDOUT_PRIORITY_OUTPUT)
      save(process.env.AGENT34_HELDOUT_PRIORITY_OUTPUT,result);
    process.stdout.write('AGENT34_HELDOUT_NATIVE '+JSON.stringify({
      schema:VERSION,summary:result.summary,competitiveGames:0})+'\n');
    assert.equal(result.summary.exactEntireInitialPairs,32,
      'All 32 registered source and candidate physical deal pairs must match');
    assert.equal(result.summary.missingAttackLedgers,0,
      'Missing root ledger prevents clean attack-conversion conclusion');
    assert.equal(result.summary.priorityOutcomes['native-engine-error']??0,0,
      'A source native engine error is a hard failure');
  }
}
module.exports={VERSION,BLOB,REG,preflightHeldout,sourceDoors,
  nativeClass,run};
