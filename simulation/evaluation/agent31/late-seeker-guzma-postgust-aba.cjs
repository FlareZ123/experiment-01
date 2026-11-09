'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {preflight}=require('../agent31-prospective-allpass-r5-r11.cjs');
const {preflight:preflightPinnedPolicy}=
  require('../agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent31-rank11-postgust-seeker-guzma-actual-turn36-aba-v1';
const TARGET_ID='11:3:B:champion-reference';
const TARGET_SEED=1101197735;
const TARGET_SEAT=1;
const TARGET_TURN=36;
const digest=value=>createHash('sha256').update(
  JSON.stringify(value)).digest('hex');

/** @param {object} row Result of one actual Twinleaf game. */
function evidence(row){
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const gust=row.actorOnlyDecisionCoverage?.guzmaPromptAudit;
  const ledger=row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  return {
    id:row.trial?.id??null,seed:row.trial?.seed??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    nativeFirstSeat:row.actualStarterSeat??null,
    nativeStatus:row.status??(row.finished?'terminal':'incomplete'),
    nativeError:row.error??null,winner:row.winner??null,
    endReason:row.endReason??null,finalPrizes:row.finalPrizes??null,
    ledgerHash:digest(ledger),
    rootActions:ledger.length,
    seekerOptIn:audit?.seekerGuzmaNominalKoOptIn??false,
    seekerPromptsProposed:audit?.seekerGuzmaPromptsProposed??0,
    seekerPromptsAccepted:audit?.seekerGuzmaPromptsAccepted??0,
    seekerRootIntents:audit?.typedIntentCounts?.['play-seeker-get-guzma']??0,
    guzmaRootIntents:audit?.typedIntentCounts?.['play-guzma-forced-nominal-ko']??0,
    gustOwnPhysicalConfirmations:gust?.ownTargetPhysicalConfirmations??0,
    gustOppPhysicalConfirmations:gust?.gustTargetPhysicalConfirmations??0,
    gustOppPhysicalMismatches:gust?.gustTargetPhysicalMismatches??0,
    nativePhysicalConfirmed:audit?.nativePhysicalConfirmed??0,
    nativePrompts:audit?.seekerGuzmaPromptsAccepted??null,
    nearbyAcceptedActions:ledger.filter(root=>
      root.actionOrdinal>=175&&root.actionOrdinal<=215).map(root=>({
      ordinal:root.actionOrdinal,turn:root.turnBefore,
      seat:root.actorSeat,action:root.action,
      card:root.card??null,detail:root.detail??null
    })),
    rootReceipts:(audit?.nativeRootAcceptances??[]).filter(x=>
      x.kind==='play-seeker-get-guzma'||
      x.kind==='play-guzma-forced-nominal-ko'),
    guzmaPromptReceipts:(gust?.receipts??[]).filter(x=>
      x.kind==='native-own-recipient'||x.kind==='native-opponent-gust'),
    physicalAttackActions:ledger.filter(x=>x.action==='AttackAction').map(x=>({
      ordinal:x.actionOrdinal,turn:x.turnBefore,
      seat:x.actorSeat,attack:x.detail??null
    })),
    paperCompetitiveQualified:false
  };
}

/** Matched physical A/B/A on one already-observed deal, two printed sixties. */
function run(){
  const registration=preflight();
  const trials=registration.registration.trials.filter(row=>
    row.rank===11&&row.repeat===3&&row.candidateSlot==='B');
  assert.equal(trials.length,2);
  assert.ok(trials.some(row=>row.id===TARGET_ID));
  assert.ok(trials.every(row=>row.seed===TARGET_SEED));
  const policy=preflightPinnedPolicy().registration.frozenCommonPolicy;
  const fixed={
    ...policy,registeredTrials:trials,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    actorFundedShadowRiderFloatStoneRoot:false,
    nativeAllOwnerPassFrontier:true,
    // Reproduce the actual earlier Float Stone rescue and source Guzma.
    actorZeroEnergyStrandFloatStoneRoot:true,
    actorZeroEnergyStrandFloatStoneTargetTurn:34,
    actorZeroEnergyStrandFloatStoneOwnerSeat:TARGET_SEAT,
    // The continuation bridge is enabled symmetrically in all three phases.
    actorGuzmaPromptContinuation:true,
    actorSeekerGuzmaOwnerSeat:TARGET_SEAT,
    actorSeekerGuzmaGlobalTurn:TARGET_TURN
  };
  assert.equal(fixed.actorOnlyComposition,true);
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  const phases=[];
  try{
    for(const phase of [
      {name:'A0-control',enabled:false},
      {name:'B-postgust-seeker',enabled:true},
      {name:'A1-control-replay',enabled:false}
    ]){
      const native=runDevelopment({
        ...fixed,actorSeekerGuzmaNominalKo:phase.enabled,
        registeredFrameName:VERSION+'-'+phase.name
      });
      assert.equal(native.attempted,2);
      phases.push({name:phase.name,enabled:phase.enabled,native});
    }
  }finally{
    restore();
    if(previous===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  const comparisons=trials.map(trial=>{
    const reports=phases.map(phase=>{
      const row=phase.native.rows.find(x=>x.trial.id===trial.id);
      assert.ok(row,'Missing actual native arm '+phase.name+' '+trial.id);
      return evidence(row);
    });
    const [before,treatment,recontrol]=reports;
    const sameDeal=reports.every(x=>
      x.fullPhysicalDealFingerprint===before.fullPhysicalDealFingerprint);
    const controlsSameRootActionDigest=
      before.ledgerHash===recontrol.ledgerHash;
    assert.ok(sameDeal,'Retrospective phases must use same native deal');
    assert.ok(controlsSameRootActionDigest,
      'Both physical control root action digests must replay');
    const sourcePostGuzmaAttack=treatment.physicalAttackActions.filter(x=>
      x.seat===0&&x.turn>=TARGET_TURN+1);
    return {
      id:trial.id,seed:trial.seed,sameDeal,
      controlsSameRootActionDigest,
      treatmentChangedNativeActions:
        treatment.ledgerHash!==before.ledgerHash,
      actualSeekerPromptResolved:treatment.seekerPromptsAccepted>0,
      actualOwnGuzmaSwitchResolved:
        treatment.gustOwnPhysicalConfirmations>0,
      actualOpponentGustResolved:
        treatment.gustOppPhysicalConfirmations>0,
      sourceAnsweredWithAttack:sourcePostGuzmaAttack.length>0,
      before,treatment,recontrol
    };
  });
  return {
    schema:VERSION,priorImmutableRegistration:registration.registeredBlob,
    pinnedNativeRevision:registration.pin,
    targetHistoricalSeed:TARGET_SEED,targetTurn:TARGET_TURN,
    candidateSeat:TARGET_SEAT,targetTrial:TARGET_ID,
    identicalDecklists:true,retrospectiveSelectedDeal:true,
    sixNativeContenderArms:6,competitiveQualifiedGames:0,
    summary:comparisons.map(row=>({
      id:row.id,controlsSameRootActionDigest:row.controlsSameRootActionDigest,
      treatmentChangedNativeActions:row.treatmentChangedNativeActions,
      actualSeekerPromptResolved:row.actualSeekerPromptResolved,
      actualOwnGuzmaSwitchResolved:row.actualOwnGuzmaSwitchResolved,
      actualOpponentGustResolved:row.actualOpponentGustResolved,
      sourceAnsweredWithAttack:row.sourceAnsweredWithAttack,
      controlStatus:row.before.nativeStatus,
      treatmentStatus:row.treatment.nativeStatus,
      controlRoots:row.before.rootActions,
      treatmentRoots:row.treatment.rootActions,
      controlWinner:row.before.winner,treatmentWinner:row.treatment.winner,
      controlPrizes:row.before.finalPrizes,
      treatmentPrizes:row.treatment.finalPrizes
    })),comparisons,rawPhases:phases,
    interpretation:'Matched actual Store development on selected existing physical deal. No paper clock, competitive bot quality or 99.5 percent qualification.'
  };
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT31_POSTGUST_SEEKER_NATIVE_OUTPUT)
    save(process.env.AGENT31_POSTGUST_SEEKER_NATIVE_OUTPUT,result);
  const focal=result.comparisons.find(x=>x.id===TARGET_ID);
  if(focal){
    process.stdout.write('AGENT31_POSTGUST_FOCAL_DETAILS '+
      JSON.stringify({
        nativeControl:{winner:focal.before.winner,
          endReason:focal.before.endReason,
          finalPrizes:focal.before.finalPrizes},
        nativeTreatment:{winner:focal.treatment.winner,
          endReason:focal.treatment.endReason,
          finalPrizes:focal.treatment.finalPrizes},
        seekerNativePromptsAccepted:
          focal.treatment.seekerPromptsAccepted,
        guzmaNativeRootIntents:focal.treatment.guzmaRootIntents,
        gustOwnPhysicalConfirmations:
          focal.treatment.gustOwnPhysicalConfirmations,
        gustOppPhysicalConfirmations:
          focal.treatment.gustOppPhysicalConfirmations,
        gustPromptReceipts:focal.treatment.guzmaPromptReceipts,
        nativeStepsAroundIntervention:
          focal.treatment.nearbyAcceptedActions.filter(step=>
            step.turn>=TARGET_TURN-1).slice(0,24),
        nativeCandidateAttacksAfterIntervention:
          focal.treatment.physicalAttackActions.filter(x=>
            x.seat===TARGET_SEAT&&x.turn>=TARGET_TURN).slice(0,8)
      })+'\\n');
  }
  process.stdout.write('AGENT31_POSTGUST_SEEKER_NATIVE '+
    JSON.stringify({schema:result.schema,summary:result.summary,
      competitiveQualifiedGames:0})+'\n');
}

module.exports={VERSION,TARGET_ID,TARGET_SEED,TARGET_SEAT,TARGET_TURN,
  evidence,run};
