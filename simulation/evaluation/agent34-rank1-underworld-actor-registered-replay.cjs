'use strict';
const assert=require('node:assert/strict');
const {preflight,compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {save}=
  require('./agent43-guzma-original-source-pair.cjs');
const {withUnderworldPhysicalSettlementWitness}=
  require('../twinleaf/agent34-underworld-physical-settlement-witness.cjs');

const VERSION='agent34-rank1-retrospective-underworld-actor-root-replay-v1';
const SELECTED_GROUPS=new Set(['1:1:A','1:3:A']);

/**
 * Two source-positive registered, previously observed seed groups; this
 * sample is retrospective and cannot validate any win-rate hypothesis.
 * Both frozen candidate 60s, the exact source 60, and both full physical
 * initial deals remain unchanged within each control/treatment pair.
 * @returns {object}
 */
function run({paperRecipientHook=false}={}){
  assert.equal(typeof paperRecipientHook,'boolean');
  const p=preflight();
  const trials=p.registration.trials.filter(t=>
    SELECTED_GROUPS.has([t.rank,t.repeat,t.candidateSlot].join(':')));
  assert.equal(trials.length,4);
  const fixed={...p.registration.frozenCommonPolicy,
    registeredTrials:trials,
    registeredFrameName:VERSION,
    bilateralBasicEnergyRecipientFrontier:true};
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restorePaperRecipientHook=paperRecipientHook?
    require('../twinleaf/underworld-door-psychic-recipient-hook.cjs')
      .installUnderworldDoorPsychicRecipientHook():null;
  let control,treatment,underworldPhysical;
  try {
    control=runDevelopment({...fixed,actorUnderworldDoorRoot:false});
    const observed=withUnderworldPhysicalSettlementWitness(()=>
      runDevelopment({...fixed,actorUnderworldDoorRoot:true}));
    treatment=observed.result;
    underworldPhysical=observed.audit;
  }finally{
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
    restorePaperRecipientHook?.();
  }
  const matched=compareSafely(control.rows,treatment.rows);
  const allInitialDealsMatched=matched.length===4&&
    matched.every(x=>x.sameSeed&&x.sameSourceDeal&&
      x.sameFullDeal&&x.sameStart);
  const summarise=(rows)=>rows.map(row=>{
    const candidateSeat=row.trial.candidateSlot==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    const abilities=row.abilityTrace??[];
    const roots=row.rootActionLedger??[];
    const underworld=roots.filter(x=>x.action==='UseAbilityAction'&&
      x.ability==='Underworld Door');
    return {
      id:row.trial.id,sourceSeat,candidateSeat,
      status:row.status??null,
      nativeWinner:row.winner??null,
      finalPrizes:row.finalPrizes??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      rootActionLedgerSha256:row.rootActionLedgerSha256??null,
      actualUseAbilityRoots:underworld,
      actorUnderworldSelectionCount:
        row.actorOnlyDecisionCoverage?.underworldDoorRootSelected??null,
      nativeAbilityTrace:abilities.filter(x=>x.name==='Underworld Door'),
      allNativeAbilityRoots:roots.filter(x=>x.action==='UseAbilityAction'),
      nativeEnergyPromptReceipt:
        row.nativeAcceptedEnergyPromptSidecar?.sha256??null,
      nativeAbilityEventCount:abilities.length,
      qualification:'unqualified'
    };
  });
  return {
    schema:VERSION,enginePin:p.pin,
    originalRank:1,registeredSourceSixtyGitBlob:p.rosterBlob,
    originalRegistrationGitBlob:
      '3f74a5e06df96a929157a86daf990613bd0f661f',
    selectedRetrospectively:true,selectedGroups:[...SELECTED_GROUPS],
    paperRecipientHookAppliedSymmetrically:paperRecipientHook,
    originalSourceAndCandidatesUnmodified:true,
    policies:{control:{actorUnderworldDoorRoot:false},
      treatment:{actorUnderworldDoorRoot:true},
      bilateralBasicEnergyRecipientFrontier:true,
      paperValidPsychicRecipientHookBothArms:paperRecipientHook},
    attemptedControl:control.rows.length,attemptedTreatment:treatment.rows.length,
    matched,allInitialDealsMatched,
    controlSummary:summarise(control.rows),
    treatmentSummary:summarise(treatment.rows),
    control,treatment,underworldPhysical,
    competitiveQualifiedGames:0,paperFullGameCertified:false,
    fullNativeUnderworldPromptPaymentCertified:false
  };
}
if(require.main===module){
  const outcome=run({
    paperRecipientHook:process.env.AGENT34_UNDERWORLD_PAPER_RECIPIENT_HOOK==='true'
  });
  if(process.env.AGENT34_UNDERWORLD_NATIVE_OUTPUT)
    save(process.env.AGENT34_UNDERWORLD_NATIVE_OUTPUT,outcome);
  process.stdout.write('AGENT34_RANK1_UNDERWORLD_NATIVE '+
    JSON.stringify({
      schema:outcome.schema,
      paperRecipientHookAppliedSymmetrically:
        outcome.paperRecipientHookAppliedSymmetrically,
      attemptedControl:outcome.attemptedControl,
      attemptedTreatment:outcome.attemptedTreatment,
      allInitialDealsMatched:outcome.allInitialDealsMatched,
      controlSummary:outcome.controlSummary,
      treatmentSummary:outcome.treatmentSummary,
      underworldPhysicalSummary:{
        opened:outcome.underworldPhysical.abilityPromptsOpened,
        resolved:outcome.underworldPhysical.acceptedNativePromptResolutions,
        complete:outcome.underworldPhysical.confirmedCompleteEffects,
        events:outcome.underworldPhysical.events
      },
      competitiveQualifiedGames:0
    })+'\n');
  assert.equal(outcome.allInitialDealsMatched,true,
    'Original full physical deals must match despite policy change');
}
module.exports={VERSION,SELECTED_GROUPS,run};
