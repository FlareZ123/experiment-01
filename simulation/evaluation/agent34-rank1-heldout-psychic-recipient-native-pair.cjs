'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:preflightOriginal,compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {preflightFresh:preflightPrior}=
  require('./agent34-rank1-fresh-underworld-native-pair.cjs');
const {preflightHeldout:preflightActive}=
  require('./agent34-rank1-heldout-active-funding-native-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {auditedSourceDigest}=require('./agent34-fresh-underworld-abort-pair-audit.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const {countSourceAttacks}=require(
  './agent34-rank1-active-funding-posthoc-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent34-rank1-heldout-psychic-bench-recipient-20261103.json';
const BLOB='f0b971a07c269ee2ccc9acc72fdf9bdf11c42fc2';
const VERSION='agent34-heldout-rank1-public-attack-gap-psychic-recipient-v1';

function preflightRecipient(){
  const bytes=fs.readFileSync(path.join(ROOT,REG));
  assert.equal(gitBlobHash(bytes),BLOB,'Unseen recipient registration changed');
  const registration=JSON.parse(bytes.toString('utf8'));
  const original=preflightOriginal();
  const previous=preflightPrior().registration;
  const previousActive=preflightActive().registration;
  assert.equal(registration.registeredBeforeNativeOutcomesForTheseSeeds,true);
  assert.equal(registration.originalRank,1);
  assert.equal(registration.pinnedTwinleafRevision,original.pin);
  assert.equal(registration.originalRosterGitBlobSha,original.rosterBlob);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.independentSeedGroups,16);
  assert.equal(registration.trials.length,32);
  assert.equal(registration.totalNativeAttempts,64);
  const seeds=[...registration.seeds.A,...registration.seeds.B];
  assert.equal(seeds.length,16);
  assert.equal(new Set(seeds).size,16);
  const inspected=new Set([...previous.seeds.A,...previous.seeds.B,
    ...previousActive.seeds.A,...previousActive.seeds.B]);
  assert.ok(seeds.every(seed=>!inspected.has(seed)),
    'Recipient study must have distinct new random seeds');
  for(const trial of registration.trials){
    assert.equal(trial.rank,1);
    assert.equal(trial.id,[trial.rank,trial.repeat,
      trial.candidateSlot,trial.candidateId].join(':'));
    assert.equal(trial.seed,
      registration.seeds[trial.candidateSlot][trial.repeat]);
  }
  return {original,registration};
}

function nativeClass(row,seat){
  if(row.status==='engine-error'||row.status==='engine-physical-invalid')
    return 'native-engine-error';
  if(row.finished!==true)return 'native-censored';
  return row.winner===seat?'source-native-terminal':
    row.winner===1-seat?'candidate-native-terminal':'other-native-terminal';
}

function originalSourceDoorCount(row,seat){
  if(!Array.isArray(row.rootActionLedger))return null;
  return row.rootActionLedger.filter(x=>
    x.playerSlot===seat&&x.action==='UseAbilityAction'&&
    x.ability==='Underworld Door').length;
}

/** Read actual native source prompt-selection and Store acceptance evidence. */
function promptNativeAudit(row,seat){
  const a=row.actorOnlyDecisionCoverage?.ownerUnderworldPromptAudit??{};
  const rows=(a.proposalRows??[]).filter(x=>
    x.seat===seat&&x.accepted===true);
  const counter={};
  for(const p of rows)counter[p.benchIndex]=(counter[p.benchIndex]??0)+1;
  return {ownerPromptNativeAcceptedBothSeats:a.sourcePromptNativeAccepted??0,
    sourceAcceptedPromptRows:rows.length,
    sourceRecipientIndices:counter,
    totalRowsCaptured:a.proposalRows?.length??0,
    nativeProposalsBothSeats:a.sourcePromptProposals??0,
    nativeRejectionsBothSeats:a.sourcePromptNativeRejected??0,
    prioritizedNativeAcceptedBothSeats:
      a.prioritizedTargetNativeAccepted??0};
}

function run(){
  const {registration,original}=preflightRecipient();
  const options={
    ...original.registration.frozenCommonPolicy,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorRoot:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldActiveFundingPriority:false
  };
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  let control,treatment;
  try{
    control=runDevelopment({...options,actorUnderworldAttackGapRecipient:false});
    treatment=runDevelopment({...options,actorUnderworldAttackGapRecipient:true});
  }finally{
    restore();
    if(previous===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  const matched=compareSafely(control.rows,treatment.rows);
  assert.equal(matched.length,32);
  const rows=registration.trials.map((trial,i)=>{
    const a=control.rows[i],b=treatment.rows[i];
    const seat=trial.candidateSlot==='A'?1:0;
    assert.equal(a.trial.id,trial.id);assert.equal(b.trial.id,trial.id);
    assert.equal(a.trial.seed,trial.seed);assert.equal(b.trial.seed,trial.seed);
    const m=matched[i];
    const own=auditedSourceDigest(a,seat),other=auditedSourceDigest(b,seat);
    return {trialId:trial.id,seed:trial.seed,sourceSeat:seat,
      sourceOriginalAndCandidateUnchanged:true,
      sameSourceOpening:own.digest!==null&&own.digest===other.digest,
      sameFullPhysicalOpening:m.sameSeed&&m.sameSourceDeal&&
        m.sameFullDeal&&m.sameStart,
      controlSourceAttacks:Array.isArray(a.rootActionLedger)?
        countSourceAttacks(a,seat):null,
      alternateSourceAttacks:Array.isArray(b.rootActionLedger)?
        countSourceAttacks(b,seat):null,
      controlSourceDoors:originalSourceDoorCount(a,seat),
      alternateSourceDoors:originalSourceDoorCount(b,seat),
      controlPrompt:promptNativeAudit(a,seat),
      alternatePrompt:promptNativeAudit(b,seat),
      controlOutcome:nativeClass(a,seat),
      alternateOutcome:nativeClass(b,seat),
      controlRootSha:a.rootActionLedgerSha256??null,
      alternateRootSha:b.rootActionLedgerSha256??null,
      competitivePaperQualification:false};
  });
  const n=fn=>rows.filter(fn).length;
  const sum=k=>rows.reduce((m,r)=>m+(r[k]??0),0);
  const pair=rows.filter(r=>
    r.sameFullPhysicalOpening&&r.controlSourceAttacks!==null&&
    r.alternateSourceAttacks!==null);
  const hist=arm=>{
    const out={};
    for(const r of rows)
      for(const [index,num] of Object.entries(r[arm].sourceRecipientIndices))
        out[index]=(out[index]??0)+num;
    return out;
  };
  const summary={newIndependentSeedGroups:16,matchedPolicyTrials:32,
    attemptedNativeGames:64,
    identicalFullPhysicalOpenings:n(r=>r.sameFullPhysicalOpening),
    identicalOriginalSourceOpenings:n(r=>r.sameSourceOpening),
    completeRootLedgers:n(r=>
      r.controlSourceAttacks!==null&&r.alternateSourceAttacks!==null),
    controlSourceAttackActions:sum('controlSourceAttacks'),
    alternateSourceAttackActions:sum('alternateSourceAttacks'),
    controlSourceUnderworldActions:sum('controlSourceDoors'),
    alternateSourceUnderworldActions:sum('alternateSourceDoors'),
    controlActualSourceAcceptedPromptRows:rows.reduce((n,r)=>
      n+r.controlPrompt.sourceAcceptedPromptRows,0),
    alternateActualSourceAcceptedPromptRows:rows.reduce((n,r)=>
      n+r.alternatePrompt.sourceAcceptedPromptRows,0),
    alternateNativePublicRankAcceptedAcrossBothSeats:rows.reduce((n,r)=>
      n+r.alternatePrompt.prioritizedNativeAcceptedBothSeats,0),
    controlCapturedSourceRecipientHistogram:hist('controlPrompt'),
    alternateCapturedSourceRecipientHistogram:hist('alternatePrompt'),
    moreSourceAttacks:pair.filter(r=>
      r.alternateSourceAttacks>r.controlSourceAttacks).length,
    fewerSourceAttacks:pair.filter(r=>
      r.alternateSourceAttacks<r.controlSourceAttacks).length,
    sameSourceAttacks:pair.filter(r=>
      r.alternateSourceAttacks===r.controlSourceAttacks).length,
    controlNativeOutcomes:Object.fromEntries([...new Set(rows.map(r=>r.controlOutcome))]
      .map(k=>[k,n(r=>r.controlOutcome===k)])),
    alternateNativeOutcomes:Object.fromEntries([...new Set(rows.map(r=>r.alternateOutcome))]
      .map(k=>[k,n(r=>r.alternateOutcome===k)])),
    competitivePaperGames:0};
  return {schema:VERSION,registrationGitBlob:BLOB,registrationPath:REG,
    registrationWasCommittedBeforeNativeResults:true,
    sourceOriginalRank:1,enginePin:original.pin,
    originalRosterBlob:original.rosterBlob,
    originalSourceAndTwoCandidateSixtiesUnchanged:true,
    sameRootAndPaperPsychicHookBothArms:true,
    noManualActiveFundingInterventionBothArms:true,
    intentionalDifference:'source-preferred Bench Psychic recipient versus public visible nearest printed-attack-gap Bench Psychic recipient',
    limitations:'Native game results are developmental only; no complete all-opponent field or competent competitive paper opponent.',
    summary,rows,control,treatment,qualifiedPaperGames:0};
}

if(require.main===module){
  if(process.argv.includes('--preflight')){
    const {registration}=preflightRecipient();
    process.stdout.write('AGENT34_RECIPIENT_PREFLIGHT '+JSON.stringify({
      blob:BLOB,seeds:registration.independentSeedGroups,
      trials:registration.trials.length,qualifiedPaper:0})+'\n');
  }else{
    const result=run();
    if(process.env.AGENT34_HELDOUT_RECIPIENT_OUTPUT)
      save(process.env.AGENT34_HELDOUT_RECIPIENT_OUTPUT,result);
    process.stdout.write('AGENT34_RECIPIENT_HELDOUT '+JSON.stringify({
      schema:VERSION,summary:result.summary,qualifiedPaper:0})+'\n');
    assert.equal(result.summary.identicalFullPhysicalOpenings,32);
    assert.equal(result.summary.completeRootLedgers,32);
    assert.equal(result.summary.alternateNativeOutcomes['native-engine-error']??0,0);
  }
}
module.exports={VERSION,BLOB,REG,preflightRecipient,promptNativeAudit,run};
