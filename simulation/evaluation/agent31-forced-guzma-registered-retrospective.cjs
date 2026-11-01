'use strict';
const assert=require('node:assert/strict');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const {createHash}=require('node:crypto');
const {preflight}=require('./agent43-guzma-nominal-fresh-rank11-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {replayFingerprint}=require('./agent43-guzma-held-root-retrospective.cjs');

const VERSION='agent31-forced-guzma-registered-16-arm-retrospective-v1';
const ORIGINAL_BASELINE_DIGEST=
  '4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216';
const KIND='play-guzma-forced-nominal-ko';

/**
 * Execute original registered rank11 source trials with only the new root
 * switch changed. These seeds were used before this feature was designed:
 * any observed contrast is retrospective, never independent generalization.
 *
 * @param {object} common Registration-fixed policies and trials.
 * @param {boolean} treatment
 * @returns {object}
 */
function runArm(common,treatment){
  const old2=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  const old31=process.env.AGENT31_GUZMA_FORCED_KO_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  process.env.AGENT31_GUZMA_FORCED_KO_DEV=treatment?'true':'false';
  try{return runDevelopment(common);}
  finally{
    if(old2===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old2;
    if(old31===undefined)delete process.env.AGENT31_GUZMA_FORCED_KO_DEV;
    else process.env.AGENT31_GUZMA_FORCED_KO_DEV=old31;
  }
}

/**
 * Only read complete postgame owner decision receipts and the original
 * registered physical deal fingerprint. This never feeds hidden state into
 * either player's next decision.
 * @param {object} row
 * @returns {object}
 */
function account(row){
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const intentCount=root?.typedIntentCounts?.[KIND]??0;
  const joins=(root?.nativeRootJoinReceipts??[])
    .filter(event=>event.kind===KIND);
  return {
    id:row.trial?.id??row.id??null,
    sourceSeat:row.sourceSeat??null,
    sourceDeal:row.sourceDealFingerprint??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    actualFirstSeat:row.actualStarterSeat??null,
    actionLedgerSha256:row.rootActionLedgerSha256??null,
    winner:row.winner??null,
    status:row.status??(row.finished===true?'terminal':'unfinished'),
    forcedRootIntents:intentCount,
    nativeForcedRootAttemptCount:joins.length,
    nativeForcedRootAccepted:joins.filter(x=>x.accepted===true).length,
    nativeForcedRootRejected:joins.filter(x=>x.accepted===false).length,
    forcedRootReceipts:joins.map(x=>({
      seat:x.seat,turn:x.globalTurn,accepted:x.accepted,
      nativeStoreActionOrdinal:x.nativeStoreActionOrdinal??null,
      nativePhysicalEffect:x.nativePhysicalEffect??null,
      errorDigest:x.errorDigest??null
    })),
    policyVersion:row.actorOnlyPolicyVersion??null,
    qualifiedCompetitiveGame:false
  };
}

/**
 * @returns {object} Frozen-source retrospective physical-game comparison.
 */
function run(){
  const p=preflight();
  const options={...p.registration.setupAndPolicyFixed,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    nativeOwnerSupporterOpportunity:true,actorGuzmaNominalGust:false};
  const baseline=runArm(options,false);
  const treatment=runArm(options,true);
  assert.equal(baseline.rows.length,16);
  assert.equal(treatment.rows.length,16);
  const baselineDigest=replayFingerprint(baseline.rows);
  assert.equal(baselineDigest,ORIGINAL_BASELINE_DIGEST,
    'Frozen baseline must replay exactly before interpreting the treatment');
  const treatmentDigest=replayFingerprint(treatment.rows);
  const controls=baseline.rows.map(account);
  const treated=treatment.rows.map(account);
  const pairs=controls.map((original,index)=>{
    const newRow=treated[index];
    assert.equal(newRow.id,original.id,
      'Paired rank11 original registered trial identity drifted');
    assert.equal(newRow.sourceSeat,original.sourceSeat);
    assert.equal(newRow.sourceDeal,original.sourceDeal);
    assert.equal(newRow.fullPhysicalDeal,original.fullPhysicalDeal);
    assert.equal(newRow.actualFirstSeat,original.actualFirstSeat);
    return {
      id:original.id,
      sourceSeat:original.sourceSeat,
      sourceDeal:original.sourceDeal,
      fullPhysicalDeal:original.fullPhysicalDeal,
      actualFirstSeat:original.actualFirstSeat,
      baselineLedger:original.actionLedgerSha256,
      treatmentLedger:newRow.actionLedgerSha256,
      actionLedgerChanged:
        original.actionLedgerSha256!==newRow.actionLedgerSha256,
      originalStatus:original.status,
      treatmentStatus:newRow.status,
      originalWinner:original.winner,
      treatmentWinner:newRow.winner,
      forcedRootIntents:newRow.forcedRootIntents,
      forcedRootAccepted:newRow.nativeForcedRootAccepted,
      forcedRootRejected:newRow.nativeForcedRootRejected,
      forcedRootReceipts:newRow.forcedRootReceipts
    };
  });
  const selected=pairs.reduce((sum,row)=>sum+row.forcedRootIntents,0);
  const changed=pairs.filter(row=>row.actionLedgerChanged).length;
  if(selected===0)assert.equal(changed,0,
    'A no-exposure read-only selector must not change the native game sequence');
  const accepted=pairs.reduce((sum,row)=>sum+row.forcedRootAccepted,0);
  const rejected=pairs.reduce((sum,row)=>sum+row.forcedRootRejected,0);
  return {
    schema:VERSION,
    registeredSourceRank:11,
    registrationBlob:p.registrationBlob,
    nativeEnginePin:p.native,
    originalSourceRosterUnchanged:true,
    sameRegisteredEightSeedGroups:true,
    sameActualPhysicalDeals:pairs.length,
    retrospectiveAfterFeatureDesign:true,
    experimentArms:32,
    matchedPairs:pairs.length,
    originalBaselineDigest:ORIGINAL_BASELINE_DIGEST,
    actualBaselineDigest:baselineDigest,
    treatmentDigest,
    exactBaselineReplay:true,
    changedActionLedgers:changed,
    attemptedForcedRootIntents:selected,
    acceptedForcedRoots:accepted,
    rejectedForcedRoots:rejected,
    pairs,
    competitiveQualifiedGames:0,
    interpretation:
      'Native paired developmental policy comparison. Reused seeds and known weak bots; no unbiased win-rate or 99.5% certification.'
  };
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    assert.equal(p.registration.trials.length,16);
    console.log(JSON.stringify({schema:VERSION,originalTrials:16,
      nativeEnginePin:p.native,baselineDigest:ORIGINAL_BASELINE_DIGEST,
      prospective:false}));
  }else{
    const result=run();
    if(process.env.AGENT31_FORCED_GUZMA_OUTPUT)
      save(process.env.AGENT31_FORCED_GUZMA_OUTPUT,result);
    console.log('AGENT31_FORCED_GUZMA_REGISTERED_RETROSPECTIVE '+
      JSON.stringify({matchedPairs:result.matchedPairs,
        trueBaselineReplay:result.exactBaselineReplay,
        changedActionLedgers:result.changedActionLedgers,
        attemptedForcedRootIntents:result.attemptedForcedRootIntents,
        acceptedForcedRoots:result.acceptedForcedRoots,
        rejectedForcedRoots:result.rejectedForcedRoots,
        competitiveQualifiedGames:0}));
  }
}
module.exports={VERSION,run,runArm,account};
