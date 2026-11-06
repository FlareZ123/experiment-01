'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {preflight}=require('./agent31-prospective-allpass-r5-r11.cjs');
const {preflight:preflightPinnedSource}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent14-rank11-zero-energy-strand-one-seed-aba-v1';
const SOURCE_TRIAL='11:3:B:champion-reference';
const SOURCE_SEED=1101197735;
const TARGET_TURN=34;
const TARGET_SEAT=1;

function digest(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
function firstDifference(before,after){
  const a=before.rootActionLedger??before.nativeAbortEvidence?.rootActionLedger??[];
  const b=after.rootActionLedger??after.nativeAbortEvidence?.rootActionLedger??[];
  const first=Array.from({length:Math.max(a.length,b.length)},
    (_,i)=>i).find(i=>JSON.stringify(a[i])!==JSON.stringify(b[i]));
  return {
    firstAcceptedRootDifference:first??null,
    beforeRoot:first===undefined?null:a[first]??null,
    afterRoot:first===undefined?null:b[first]??null,
    beforeRootCount:a.length,afterRootCount:b.length,
    beforeSha:digest(a),afterSha:digest(b)
  };
}
function rowReceipt(row){
  return {
    trial:row.trial.id,sourceSeat:row.sourceSeat,
    candidateSeat:row.candidateSeat,actualStarterSeat:row.actualStarterSeat,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    sourceDeckFingerprint:row.sourceDeckFingerprint,
    candidateDeckFingerprint:row.candidateDeckFingerprint,
    nativeStatus:row.status??null,finished:row.finished??false,
    endReason:row.endReason??null,actionCount:row.actionCount??null,
    nativeError:row.error??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    strandSelected:
      row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root
        ?.zeroEnergyStrandFloatStoneRootSelected??null,
    acceptedToolRoots:(row.rootActionLedger??[]).filter(root=>
      root.action==='PlayCardAction'&&
      String(root.card??root.detail??'').includes('Float Stone')),
    nativeAttackRoots:(row.rootActionLedger??[]).filter(root=>
      root.action==='AttackAction').map(root=>({
        actionOrdinal:root.actionOrdinal,turnBefore:root.turnBefore,
        actorSeat:root.actorSeat,detail:root.detail??null
      }))
  };
}

function run(){
  const p=preflight();
  const registered=p.registration.trials.filter(t=>
    t.rank===11&&t.repeat===3&&t.candidateSlot==='B');
  assert.equal(registered.length,2);
  assert.ok(registered.some(t=>t.id===SOURCE_TRIAL));
  assert.ok(registered.every(t=>t.seed===SOURCE_SEED));
  assert.ok(registered.every(t=>t.candidateSlot==='B'));
  const flags={
    ...preflightPinnedSource().registration.frozenCommonPolicy,
    registeredTrials:registered,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    actorFundedShadowRiderFloatStoneRoot:false,
    nativeAllOwnerPassFrontier:true,
    actorZeroEnergyStrandFloatStoneTargetTurn:TARGET_TURN,
    actorZeroEnergyStrandFloatStoneOwnerSeat:TARGET_SEAT
  };
  assert.equal(flags.actorOnlyComposition,true);
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreHook=installUnderworldDoorPsychicRecipientHook();
  const phases=[];
  try{
    for(const phase of [
      {id:'A0-control',enabled:false},
      {id:'B-treatment',enabled:true},
      {id:'A1-recontrol',enabled:false}
    ]){
      const native=runDevelopment({
        ...flags,
        actorZeroEnergyStrandFloatStoneRoot:phase.enabled,
        registeredFrameName:VERSION+'-'+phase.id
      });
      assert.equal(native.attempted,2);
      phases.push({id:phase.id,enabled:phase.enabled,native});
    }
  }finally{
    restoreHook();
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const byId=id=>phases.map(phase=>{
    const row=phase.native.rows.find(row=>row.trial.id===id);
    assert.ok(row,'missing registered contender '+id);
    return row;
  });
  const comparisons=registered.map(trial=>{
    const [a,b,a1]=byId(trial.id);
    const physical=[a,b,a1].map(row=>row.fullPhysicalDealFingerprint);
    const aToB=firstDifference(a,b),aToA=firstDifference(a,a1);
    return {
      trialId:trial.id,originalSeed:trial.seed,
      fullPhysicalDealMatched:
        physical.every(value=>value===physical[0]),
      controlsRootIdentical:aToA.firstAcceptedRootDifference===null,
      treatmentChangedAcceptedRoot:
        aToB.firstAcceptedRootDifference!==null,
      firstDifference:aToB,controlRepeatDifference:aToA,
      receipts:[a,b,a1].map(rowReceipt)
    };
  });
  assert.ok(comparisons.every(row=>row.fullPhysicalDealMatched),
    'A/B/A must have the same physical opening within each printed 60');
  assert.ok(comparisons.every(row=>row.controlsRootIdentical),
    'Recontrols must replay exact original actions');
  return {
    version:VERSION,originalPreregistration:p.registeredBlob,
    originalRegistrationAtUtc:p.registration.registeredUtc,
    nativeVendorPin:p.pin,sourceTrial:SOURCE_TRIAL,
    originalSeed:SOURCE_SEED,interventionTargetTurn:TARGET_TURN,
    interventionPhysicalSeat:TARGET_SEAT,
    unchangedPrinted60s:true,
    retrospectivePostHoc:true,selectedPolicyChanged:false,
    sampleUnit:'one registered physical seed with two correlated contender arms',
    competitivelyQualifiedGames:0,
    resultDisclaimer:'Native A/B/A is a developmental policy intervention. A Store-accepted action, simulation terminal, or nominal attack calculation does not certify a paper game or competitive win.',
    comparisons,rawPhases:phases
  };
}
if(require.main===module){
  try{
    const result=run();
    if(process.env.AGENT14_STRAND_ABA_OUTPUT)
      save(process.env.AGENT14_STRAND_ABA_OUTPUT,result);
    console.log('AGENT14_ZERO_ENERGY_STRAND_ABA',
      JSON.stringify({
        version:result.version,compared:result.comparisons.map(row=>({
          trial:row.trialId,
          samePhysical:row.fullPhysicalDealMatched,
          recontrolIdentical:row.controlsRootIdentical,
          firstChangedRoot:row.firstDifference.firstAcceptedRootDifference,
          nativeActions:row.receipts.map(r=>({
            count:r.actionCount,terminal:r.finished,error:!!r.nativeError,
            selected:r.strandSelected,attacks:r.nativeAttackRoots.length
          }))
        })),
        competitivelyQualifiedGames:0
      }));
  }catch(error){console.error(error);process.exitCode=1;}
}
module.exports={VERSION,SOURCE_TRIAL,SOURCE_SEED,TARGET_TURN,
  TARGET_SEAT,digest,firstDifference,rowReceipt,run};
