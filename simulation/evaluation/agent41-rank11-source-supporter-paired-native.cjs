'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const root=path.resolve(__dirname,'../..');
const RELATIVE_PLAN='results/aichi-2026/registrations/agent41-rank11-source-supporter-policy-20261029.json';
const REGISTRATION_BLOB='8dda1a73067255ad799dbd0ffbddd71468553e87';
const SCHEMA='agent41-native-rank11-source-supporter-policy-control-v1';

/** @param {Buffer} bytes @returns {string} */
const gitBlobSha=bytes=>createHash('sha1')
  .update('blob '+bytes.length+'\0').update(bytes).digest('hex');

/** @param {object} plan @returns {object[]} */
function plannedTrials(plan){
  assert.equal(plan.schema,'agent41-rank11-owner-pass-supporter-randomized-control-v1');
  assert.equal(plan.sourceRank,11);
  assert.equal(plan.repeats,4);
  assert.equal(plan.attempts,32);
  assert.equal(plan.distinctPRNGSeeds,8);
  assert.equal(plan.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(plan.candidateSlots,['A','B']);
  assert.deepEqual(plan.referenceCandidatePrints,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.deepEqual(plan.pairedPolicies,
    ['source-pass-supporter-off','source-pass-supporter-on']);
  const trials=[],seenSeeds=new Set();
  for(const slot of plan.candidateSlots){
    const frame=plan.seedsByCandidateSlot[slot];
    assert.equal(frame.length,plan.repeats);
    for(let repeat=0;repeat<plan.repeats;repeat++){
      const seed=frame[repeat];
      assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
      assert.ok(!seenSeeds.has(seed));
      seenSeeds.add(seed);
      for(const candidateId of plan.referenceCandidatePrints){
        trials.push({rank:11,seed,repeat,candidateSlot:slot,candidateId,
          id:[11,repeat,slot,candidateId].join(':')});
      }
    }
  }
  assert.equal(seenSeeds.size,8);
  assert.equal(trials.length,16);
  return trials;
}

/** @param {object} row @returns {string} */
function status(row){
  if(row.status!==undefined)return row.status;
  return row.finished===true?'engine-terminal':'action-cap';
}

/** @param {object} row @param {string} name @returns {object[]} */
function supporterPlayRoots(row,name){
  return (row.rootActionLedger??[]).filter(event=>
    event.playerSlot===row.sourceSeat &&
    event.action==='PlayCardAction'&&event.card===name);
}

/**
 * Preserve every precommitted control/treatment pair, even if a Store root
 * aborts, a full game caps, or native holder starts in a different order.
 * @param {object} control
 * @param {object} treatment
 * @param {object} plan
 * @returns {object}
 */
function auditPairs(control,treatment,plan){
  const trials=plannedTrials(plan);
  assert.equal(control.attempted,16);
  assert.equal(treatment.attempted,16);
  const groups=[['control',control],['treatment',treatment]];
  for(const [role,result] of groups){
    assert.equal(result.rows.length,16);
    assert.equal(result.sourcePairs.length,8);
    assert.equal(result.enginePin,plan.enginePin);
    assert.equal(result.registeredTrialFrame,RELATIVE_PLAN);
    assert.equal(result.rank11SourceSupporterPassRescueOptIn,
      role==='treatment');
  }
  const ctrls=new Map(control.rows.map(r=>[r.trial.id,r]));
  const treats=new Map(treatment.rows.map(r=>[r.trial.id,r]));
  assert.equal(ctrls.size,16);
  assert.equal(treats.size,16);
  const pairs=trials.map(trial=>{
    const base=ctrls.get(trial.id),test=treats.get(trial.id);
    assert.ok(base&&test,'Missing a precommitted candidate-policy arm');
    const nativeProposals=test.rank11SourceSupporterRescueAudit?.issuedSupporters??[];
    const srcRows=test.rootActionLedger??[];
    const accepted=srcRows.filter(root=>
      root.playerSlot===test.sourceSeat&&root.action==='PlayCardAction'&&
      ['Marnie','Carmine'].includes(root.card));
    const proposalMatches=nativeProposals.every(proposed=>
      accepted.some(root=>root.card===proposed.card&&
        root.turnBefore===proposed.turn));
    const physicalSourceAligned=typeof base.sourceDealFingerprint==='string'&&
      base.sourceDealFingerprint===test.sourceDealFingerprint;
    const fullDealAligned=typeof base.fullPhysicalDealFingerprint==='string'&&
      base.fullPhysicalDealFingerprint===test.fullPhysicalDealFingerprint;
    const firstAligned=base.verifiedFirstTurn===true&&
      test.verifiedFirstTurn===true&&
      base.actualStarterSeat===test.actualStarterSeat;

    const first=accepted[0]??null;
    const ordinal=first?.actionOrdinal??null;
    const baselineAtRoot=ordinal===null?null:
      base.rootActionLedger?.[ordinal]??null;
    const before=ordinal===null?null:
      JSON.stringify(srcRows.slice(0,ordinal))===
        JSON.stringify((base.rootActionLedger??[]).slice(0,ordinal));
    const replacementVerified=Boolean(first&&baselineAtRoot&&
      baselineAtRoot.action==='PassTurnAction'&&
      baselineAtRoot.playerSlot===test.sourceSeat&&
      baselineAtRoot.turnBefore===first.turnBefore&&before);
    const noSourceSupporter=accepted.length===0;
    const unaffectedRootTraceIdentical=noSourceSupporter?
      JSON.stringify(base.rootActionLedger)===
        JSON.stringify(test.rootActionLedger):null;
    const rescueBeforeNativePolicyNoop=
      nativeProposals.length===0&&
      noSourceSupporter&&unaffectedRootTraceIdentical===true;
    return {
      trial,controlStatus:status(base),treatmentStatus:status(test),
      actualSourceFirst:base.sourceActuallyFirst??null,
      sourceDealAligned:physicalSourceAligned,
      fullPhysicalDealAligned:fullDealAligned,
      actualFirstPlayerAligned:firstAligned,
      controlRootCount:base.rootActionCount??null,
      treatmentRootCount:test.rootActionCount??null,
      controlSourceAttacks:base.attackDeclarations?.source??null,
      treatmentSourceAttacks:test.attackDeclarations?.source??null,
      controlSourceDirectBoostShakeComplete:base.sourceAudit?.completed===true,
      treatmentSourceDirectBoostShakeComplete:test.sourceAudit?.completed===true,
      controlSourceMarniePlays:supporterPlayRoots(base,'Marnie').length,
      treatmentSourceMarniePlays:supporterPlayRoots(test,'Marnie').length,
      controlSourceCarminePlays:supporterPlayRoots(base,'Carmine').length,
      treatmentSourceCarminePlays:supporterPlayRoots(test,'Carmine').length,
      firstInterventionOrdinal:ordinal,
      proposalCount:nativeProposals.length,
      acceptedSelectedSupporterCount:accepted.length,
      nativeSelectedRootMatched:proposalMatches,
      prefixBeforeFirstInterventionIdentical:before,
      baselineWasRealSourcePass:replacementVerified,
      noProposalControlRootIdentical:rescueBeforeNativePolicyNoop,
      controlNativeWinner:base.finished===true?base.winner:null,
      treatmentNativeWinner:test.finished===true?test.winner:null,
      controlEndReason:base.endReason??null,
      treatmentEndReason:test.endReason??null,
      proposedSupporters:nativeProposals,
      qualifiedCompetitiveGame:false
    };
  });
  const counts=pairs.flatMap(pair=>[pair.controlStatus,pair.treatmentStatus]);
  const aggregate={
    plannedArms:plan.attempts,observedArms:counts.length,
    registeredSourceCandidatePairs:pairs.length,
    sourceOpeningAlignedPairs:pairs.filter(x=>x.sourceDealAligned).length,
    physicalDealAlignedPairs:pairs.filter(x=>x.fullPhysicalDealAligned).length,
    actualStarterAlignedPairs:pairs.filter(x=>x.actualFirstPlayerAligned).length,
    controlTerminals:pairs.filter(x=>x.controlStatus==='engine-terminal').length,
    treatmentTerminals:pairs.filter(x=>x.treatmentStatus==='engine-terminal').length,
    controlCaps:pairs.filter(x=>x.controlStatus==='action-cap').length,
    treatmentCaps:pairs.filter(x=>x.treatmentStatus==='action-cap').length,
    controlErrors:pairs.filter(x=>x.controlStatus==='engine-error').length,
    treatmentErrors:pairs.filter(x=>x.treatmentStatus==='engine-error').length,
    sourceFirstPairs:pairs.filter(x=>x.actualSourceFirst===true).length,
    sourceSecondPairs:pairs.filter(x=>x.actualSourceFirst===false).length,
    sourceDirectBoostShakeControl:pairs.filter(x=>
      x.controlSourceDirectBoostShakeComplete).length,
    sourceDirectBoostShakeTreatment:pairs.filter(x=>
      x.treatmentSourceDirectBoostShakeComplete).length,
    acceptedSourceMarniePlays:pairs.reduce((n,x)=>
      n+x.treatmentSourceMarniePlays,0),
    acceptedSourceCarminePlays:pairs.reduce((n,x)=>
      n+x.treatmentSourceCarminePlays,0),
    plansTriggered:pairs.filter(x=>x.proposalCount>0).length,
    plansActuallyReplacedPass:pairs.filter(x=>x.baselineWasRealSourcePass).length,
    falseNativeProposals:pairs.filter(x=>!x.nativeSelectedRootMatched).length,
    noProposalControlsIntact:pairs.filter(x=>
      x.noProposalControlRootIdentical).length,
    nativeWinnerComparisonQualified:false,
    paperRuleAuditQualified:false,
    ownerInformationBoundaryFullyAudited:false,
    tournamentClockQualified:false,
    competitiveQualifiedGames:0
  };
  return {schema:SCHEMA,registrationPath:RELATIVE_PLAN,aggregate,pairs,
    caveat:'Source-only development intervention on fresh preregistered source-dealt streams. Selected winner changes are not competitive. Retain all errors and caps.'};
}

/** @returns {object} */
function run(){
  const file=fs.readFileSync(path.join(root,RELATIVE_PLAN));
  const blob=gitBlobSha(file);
  assert.equal(blob,REGISTRATION_BLOB);
  const plan=JSON.parse(file.toString('utf8'));
  for(const [name,sha] of [
    ['simulation/evaluation/agent41-bilateral-v2-development.cjs',
      plan.fixedFiles.nativeRunner],
    ['simulation/twinleaf/agent41-rank11-source-pass-supporter.cjs',
      plan.fixedFiles.sourcePassSupporter],
    ['results/aichi-2026/full-decklists.json',plan.fixedFiles.sourceList],
    ['results/als/new-moon-perfection-source-60.json',plan.fixedFiles.newMoon60]
  ]){
    const actual=gitBlobSha(fs.readFileSync(path.join(root,name)));
    assert.equal(actual,sha,'Frozen source file drift: '+name);
  }
  const trials=plannedTrials(plan);
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const flags=plan.priorFrozenNativeManifest;
  const control=runDevelopment({...flags,registeredTrials:trials,
    registeredFrameName:RELATIVE_PLAN,rank11SourceSupporterPassRescue:false});
  const treatment=runDevelopment({...flags,registeredTrials:trials,
    registeredFrameName:RELATIVE_PLAN,rank11SourceSupporterPassRescue:true});
  const audit=auditPairs(control,treatment,plan);
  return {schema:SCHEMA,preregisteredBlob:blob,plan,
    audit,control,treatment};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={SCHEMA,REGISTRATION_BLOB,plannedTrials,status,auditPairs,run};
