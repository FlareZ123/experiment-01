'use strict';

const assert=require('node:assert/strict');
const {preflightFresh}=require('./agent34-rank1-fresh-underworld-native-pair.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {auditedSourceDigest}=require('./agent34-fresh-underworld-abort-pair-audit.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent34-retrospective-underworld-active-funding-priority-v1';

/** @param {object} row @param {0|1} seat */
function countSourceAttacks(row,seat){
  return (row.rootActionLedger??[]).filter(x=>
    x.playerSlot===seat&&x.action==='AttackAction').length;
}

/** Count actual native Store-accepted owner-declared manual Psychic to Active. */
function countSourceActivePsychicAttachments(row,seat){
  return (row.nativeAcceptedTargetSidecar?.events??[]).filter(e=>
    e.playerSlot===seat&&e.action==='PlayCardAction'&&
    e.storeAccepted===true&&
    e.declared?.ownerHandPrinting?.startsWith('Psychic Energy ')&&
    e.declared?.target?.slot===1).length;
}

/** Read accepted source root policy choices, independently from attack counts. */
function sourceRootAudit(row){
  return row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
}

/** @returns {object} Previously observed seeds only, no independent win sample. */
function run(){
  const {registration,original}=preflightFresh();
  const common={
    ...original.registration.frozenCommonPolicy,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true
  };
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  let control,treatment;
  try{
    control=runDevelopment({...common,
      actorUnderworldActiveFundingPriority:false});
    treatment=runDevelopment({...common,
      actorUnderworldActiveFundingPriority:true});
  }finally{
    restore();
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const matching=compareSafely(control.rows,treatment.rows);
  assert.equal(matching.length,16);
  const rows=registration.trials.map((trial,index)=>{
    const baseline=control.rows[index],changed=treatment.rows[index];
    assert.equal(baseline.trial.id,trial.id);
    assert.equal(changed.trial.id,trial.id);
    assert.equal(baseline.trial.seed,changed.trial.seed);
    const seat=trial.candidateSlot==='A'?1:0;
    const a=auditedSourceDigest(baseline,seat);
    const b=auditedSourceDigest(changed,seat);
    const m=matching[index];
    const sameOriginal=a.digest!==null&&a.digest===b.digest;
    const sameComplete=m.sameSeed&&m.sameSourceDeal&&
      m.sameFullDeal&&m.sameStart;
    const root=sourceRootAudit(changed);
    return {
      trialId:trial.id,candidateSlot:trial.candidateSlot,
      candidateId:trial.candidateId,sourceSeat:seat,
      strictSourceInitialDealMatched:sameOriginal,
      strictEntirePhysicalDealAndStartMatched:sameComplete,
      baseSourceAttackActions:countSourceAttacks(baseline,seat),
      prioritySourceAttackActions:countSourceAttacks(changed,seat),
      baseSourceActivePsychicManualAttachments:
        countSourceActivePsychicAttachments(baseline,seat),
      prioritySourceActivePsychicManualAttachments:
        countSourceActivePsychicAttachments(changed,seat),
      baseSourceUnderworldActions:(baseline.rootActionLedger??[])
        .filter(x=>x.playerSlot===seat&&x.action==='UseAbilityAction'&&
          x.ability==='Underworld Door').length,
      prioritySourceUnderworldActions:(changed.rootActionLedger??[])
        .filter(x=>x.playerSlot===seat&&x.action==='UseAbilityAction'&&
          x.ability==='Underworld Door').length,
      baseNativeStatus:baseline.status??(baseline.finished?'native-terminal':'censored'),
      priorityNativeStatus:changed.status??(changed.finished?'native-terminal':'censored'),
      baseNativeWinner:baseline.winner??null,
      priorityNativeWinner:changed.winner??null,
      priorityRootSelectedAllSeats:root.underworldActiveFundingPrioritySelected??0,
      baseSourceRootSha:baseline.rootActionLedgerSha256??null,
      prioritySourceRootSha:changed.rootActionLedgerSha256??null,
      competitiveGameQualified:false
    };
  });
  const count=fn=>rows.filter(fn).length;
  const sum=k=>rows.reduce((n,r)=>n+r[k],0);
  const summary={
    previouslyObservedSourceSeedGroups:8,
    previousRegistrationTrials:16,nativeAttempts:32,
    allExactSourceInitialDeals:count(r=>r.strictSourceInitialDealMatched),
    allExactBilateralInitialDeals:count(r=>r.strictEntirePhysicalDealAndStartMatched),
    baseNativeSourceAttacks:sum('baseSourceAttackActions'),
    priorityNativeSourceAttacks:sum('prioritySourceAttackActions'),
    baseNativeSourceActiveManualPsychic:
      sum('baseSourceActivePsychicManualAttachments'),
    priorityNativeSourceActiveManualPsychic:
      sum('prioritySourceActivePsychicManualAttachments'),
    selectedPriorityRootsAllSeats:sum('priorityRootSelectedAllSeats'),
    baseSourceDoorRoots:sum('baseSourceUnderworldActions'),
    prioritySourceDoorRoots:sum('prioritySourceUnderworldActions'),
    moreSourceAttacks:count(r=>
      r.prioritySourceAttackActions>r.baseSourceAttackActions),
    fewerSourceAttacks:count(r=>
      r.prioritySourceAttackActions<r.baseSourceAttackActions),
    equalSourceAttacks:count(r=>
      r.prioritySourceAttackActions===r.baseSourceAttackActions),
    nativePriorityErrors:count(r=>r.priorityNativeStatus==='engine-error'),
    competitivelyQualifiedGames:0
  };
  return {schema:VERSION,originalRank:1,registrationBlob:
    '1af4f729c0101483a2295e0df22b9070a8510417',
    prospective:false,retrospective:true,observedPriorSeeds:true,
    originalSourceAndCandidatesUnchanged:true,
    twoSeatSymmetricCommonPolicy:true,
    paperRecipientHookBothArms:true,
    sourceOriginalRosterBlob:original.rosterBlob,enginePin:original.pin,
    onlyPolicyDifference:'Opt-in last-Psychic manual Active funding priority',
    sourceGameStrengthUnqualified:true,summary,rows,control,treatment};
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT34_ACTIVE_PRIORITY_OUTPUT)
    save(process.env.AGENT34_ACTIVE_PRIORITY_OUTPUT,result);
  process.stdout.write('AGENT34_UNDERWORLD_ACTIVE_PRIORITY '+JSON.stringify({
    schema:result.schema,summary:result.summary,
    interesting:result.rows.filter(row=>row.trialId.startsWith('1:1:B')),
    qualifiedGames:0
  })+'\n');
  assert.equal(result.summary.allExactBilateralInitialDeals,16,
    'Same-source native comparison requires actual full physical deal parity');
  assert.equal(result.summary.nativePriorityErrors,0,
    'Strict native errors remain a test failure');
}
module.exports={VERSION,countSourceAttacks,
  countSourceActivePsychicAttachments,run};
