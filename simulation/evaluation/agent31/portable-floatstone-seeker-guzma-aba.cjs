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
const {evidence}=require('./late-seeker-guzma-postgust-aba.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent31-portable-zeroenergy-floatstone-plus-seeker-guzma-aba-v1';
const SEED=1101197735;
const ORIGINAL_RANK=11;

/**
 * Test an unscoped, both-owner two-part policy against its OFF baseline.
 * No historical root turn/seat may enter the decision policy. This is the
 * already-known seed, so wins do not estimate generalization.
 *
 * @returns {object} Full genuine Store A0/B/A1 with all six arms.
 */
function run(){
  const original=preflight();
  const selected=original.registration.trials.filter(trial=>
    trial.rank===ORIGINAL_RANK&&trial.repeat===3&&
    trial.candidateSlot==='B');
  assert.equal(selected.length,2);
  assert.ok(selected.every(trial=>trial.seed===SEED));

  const frozen=preflightPinnedPolicy().registration.frozenCommonPolicy;
  const common={
    ...frozen,
    registeredTrials:selected,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    actorFundedShadowRiderFloatStoneRoot:false,
    nativeAllOwnerPassFrontier:true,
    // Both A/B policies have native printed Guzma prompts. Only native owner
    // decision selection differs, never the card set or engine.
    actorGuzmaPromptContinuation:true,
    actorZeroEnergyStrandFloatStoneTargetTurn:null,
    actorZeroEnergyStrandFloatStoneOwnerSeat:null,
    actorSeekerGuzmaOwnerSeat:null,
    actorSeekerGuzmaGlobalTurn:null
  };
  assert.equal(common.actorOnlyComposition,true);
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  const phases=[];
  try{
    for(const phase of [
      {name:'A0-portable-off',enabled:false},
      {name:'B-both-owner-portable-on',enabled:true},
      {name:'A1-portable-off-repeat',enabled:false}
    ]){
      const native=runDevelopment({
        ...common,actorZeroEnergyStrandFloatStoneRoot:phase.enabled,
        actorSeekerGuzmaNominalKo:phase.enabled,
        registeredFrameName:VERSION+'-'+phase.name
      });
      assert.equal(native.attempted,selected.length);
      phases.push({name:phase.name,enabled:phase.enabled,native});
    }
  }finally{
    restore();
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const pairs=selected.map(trial=>{
    const [a,b,a1]=phases.map(phase=>{
      const row=phase.native.rows.find(x=>x.trial.id===trial.id);
      assert.ok(row,'Original physical row missing '+phase.name);
      const witness=evidence(row);
      const roots=row.rootActionLedger??
        row.nativeAbortEvidence?.rootActionLedger??[];
      const floatAudit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
      return {...witness,
        floatStoneRescueSelected:
          floatAudit?.zeroEnergyStrandFloatStoneRootSelected??null,
        scopedZeroEnergyTurn:
          floatAudit?.zeroEnergyStrandFloatStoneTargetTurn??null,
        scopedZeroEnergySeat:
          floatAudit?.zeroEnergyStrandFloatStoneOwnerSeat??null,
        scopedSeekerTurn:floatAudit?.seekerGuzmaGlobalTurn??null,
        scopedSeekerSeat:floatAudit?.seekerGuzmaOwnerSeat??null,
        roots:roots.map(x=>({
          ordinal:x.actionOrdinal,turn:x.turnBefore,
          ownerSeat:x.playerSlot,action:x.action,
          card:x.card??null,attack:x.attack??null
        }))
      };
    });
    assert.ok([a,b,a1].every(x=>
      x.fullPhysicalDealFingerprint===a.fullPhysicalDealFingerprint),
    'A/B/A must preserve original complete physical opening deal');
    assert.equal(a.ledgerHash,a1.ledgerHash,
      'A0 and A1 original Store action ledgers must replay');
    assert.equal(b.scopedZeroEnergyTurn,null);
    assert.equal(b.scopedZeroEnergySeat,null);
    assert.equal(b.scopedSeekerTurn,null);
    assert.equal(b.scopedSeekerSeat,null);
    const first=Array.from({length:Math.max(a.roots.length,b.roots.length)},
      (_,i)=>i).find(i=>
        JSON.stringify(a.roots[i])!==JSON.stringify(b.roots[i]));
    const candidateKo=b.candidateAttackSettlements.filter(x=>
      x.settlementConfirmed&&
      x.afterPrizes?.[trial.candidateSlot==='A'?0:1] <
        x.beforePrizes?.[trial.candidateSlot==='A'?0:1]);
    return {
      trial:trial.id,originalSeed:trial.seed,
      controlLedgerSameInA1:true,
      firstDifferentRootOrdinal:first??null,
      firstControlAction:first===undefined?null:a.roots[first]??null,
      firstPortableAction:first===undefined?null:b.roots[first]??null,
      floatStoneRescueSelected:b.floatStoneRescueSelected,
      seekerRootIntents:b.seekerRootIntents,
      seekerPromptsAccepted:b.seekerPromptsAccepted,
      guzmaRootIntents:b.guzmaRootIntents,
      settledCandidatePrizeAttacks:candidateKo,
      baselineWinner:a.winner,portableWinner:b.winner,
      baselinePrizes:a.finalPrizes,portablePrizes:b.finalPrizes,
      baselineStatus:a.nativeStatus,portableStatus:b.nativeStatus,
      baselineNativeRoots:a.rootActions,portableNativeRoots:b.rootActions,
      A0:a,B:b,A1:a1
    };
  });
  return {
    schema:VERSION,
    originalRegistration:original.registeredBlob,
    nativeEngine:original.pin,originalSeed:SEED,
    originalRank:ORIGINAL_RANK,
    allTurnsBothOwners:true,noScriptedSourceSeatOrTurn:true,
    originalSixtiesUnchanged:true,
    retrospectiveOriginalDeal:true,sourceSeedGroups:1,
    playedNativeContenderArms:6,competitiveQualifiedGames:0,
    pairs,summary:pairs.map(x=>({
      trial:x.trial,firstChanged:x.firstDifferentRootOrdinal,
      firstControl:x.firstControlAction,firstPortable:x.firstPortableAction,
      selectedFloat:x.floatStoneRescueSelected,
      selectedSeeker:x.seekerRootIntents,
      nativeSeekerPromptAccepted:x.seekerPromptsAccepted,
      nativeGuzmaRoot:x.guzmaRootIntents,
      baselineWinner:x.baselineWinner,portableWinner:x.portableWinner,
      baselinePrizes:x.baselinePrizes,portablePrizes:x.portablePrizes,
      baselineStatus:x.baselineStatus,portableStatus:x.portableStatus
    })),
    caution:'Both policy branches use known historical physical seed. Unscoped code is a capability demonstration, not a prospective population experiment or qualified paper win rate.'
  };
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT31_PORTABLE_JOINT_OUTPUT)
    save(process.env.AGENT31_PORTABLE_JOINT_OUTPUT,result);
  console.log('AGENT31_PORTABLE_JOINT_NATIVE',JSON.stringify({
    schema:result.schema,summary:result.summary,
    competitiveQualifiedGames:0}));
}
module.exports={VERSION,SEED,ORIGINAL_RANK,run};
