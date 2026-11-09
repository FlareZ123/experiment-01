'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reg=require('../../../results/aichi-2026/registrations/agent45-retrospective-rank6-volt-donor-both-seats-v1.json');
const profile=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {withOwnerVoltTransfer,VERSION:POLICY}=
  require('../../twinleaf/agent4-allturn-owner-volt-attach-energy.cjs');
const {sourceNativeSummary,compareArm}=
  require('../agent45-retrospective-volt-donor-native-pair.cjs');
const {writeAtomicLocked}=
  require('../agent20-frozen-rank6-canary-v1.cjs');

const VERSION='agent23-integrated-original-rank6-owner-volt-v3-native-pair';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Exactly eight original registered rank6 physical games from Agent45. */
function registered(){
  assert.equal(reg.schema,'agent45-retrospective-rank6-volt-donor-both-seats-v1');
  assert.equal(reg.enginePin,PIN);
  assert.equal(profile.pinnedVendorRevision,PIN);
  assert.equal(reg.registeredTrials.length,8);
  return reg.registeredTrials.map(trial=>({
    ...trial,
    originalFingerprint:reg.archivedActualInitialSourceDealFingerprintByCell[
      trial.repeat+':'+trial.candidateSlot],
    firstSeat:reg.expectedOriginalVerifiedFirstTurnSeatByCell[
      trial.repeat+':'+trial.candidateSlot]
  }));
}

/**
 * Install the real owner AttachEnergyPrompt resolver at genuine native
 * runMatch entry only, after all other long-lived original-policy wrappers
 * are in place. Restore original runMatch even if a match fails.
 * @param {()=>object} execute
 * @param {{runMatch:Function}} headless
 * @returns {{result:object,rows:object[]}}
 */
function withActualOwnerVoltNative(execute,headless){
  const original=headless.runMatch,rows=[];
  headless.runMatch=function(request){
    const intent=withOwnerVoltTransfer(()=>original(request));
    rows.push({
      matchLabel:request.label,
      sourceOnlyPromptAudit:intent.audit
    });
    return intent.result;
  };
  try{return {result:execute(),rows};}
  finally{
    assert.strictEqual(headless.runMatch,headless.runMatch);
    headless.runMatch=original;
  }
}

/** @param {boolean} variant @param {Function} [nativeRunner] */
function runArm(variant,nativeRunner=runDevelopment){
  const trials=registered();
  const options={
    ...profile.policyOptions,
    registeredTrials:trials.map(x=>({
      id:x.id,rank:x.rank,repeat:x.repeat,candidateSlot:x.candidateSlot,
      candidateId:x.candidateId,seed:x.seed
    })),
    registeredFrameName:VERSION+(variant?'-v3':'-incumbent'),
    paperPromptPortfolio:true,
    nativeRootActionLimit:reg.maxNativeActionsPerGame
  };
  if(!variant)return {development:nativeRunner(options),promptAudit:[]};
  const headless=require('../../twinleaf/headless.cjs');
  const outcome=withActualOwnerVoltNative(()=>nativeRunner(options),headless);
  return {development:outcome.result,promptAudit:outcome.rows};
}

function run(deps={}){
  const trials=registered();
  const base=(deps.runArm??runArm)(false);
  const variant=(deps.runArm??runArm)(true);
  const a=base.development.rows,b=variant.development.rows;
  assert.equal(a.length,8);assert.equal(b.length,8);
  const bm=new Map(b.map(x=>[x.trial.id,x]));
  const pairs=trials.map(expected=>{
    const control=a.find(x=>x.trial.id===expected.id);
    const treatment=bm.get(expected.id);
    assert.ok(control&&treatment,'Every native source game required');
    return compareArm(expected,control,treatment);
  });
  const source=rows=>rows.reduce((n,x)=>n+
    (x.sourceAttackSettlement?.attacks??[]).filter(y=>
      y.attackName==='Volt Cyclone').length,0);
  const ownerSelections=variant.promptAudit.reduce((n,row)=>n+
    (row.sourceOnlyPromptAudit?.ownerPromptChoices??0),0);
  return {
    schema:VERSION,policy:POLICY,nativePin:PIN,
    retrospectivePreviouslyObservedPhysicalSeeds:true,
    registeredTrials:trials.map(x=>x.id),
    actualOwnerPromptSelections:ownerSelections,
    promptAudits:variant.promptAudit,
    allEightSourceDealsMatch:pairs.every(x=>
      x.baselineAgainstOriginalDeal&&x.treatmentAgainstOriginalDeal&&
      x.matchedBaselineAndTreatmentSourceDeal),
    matchedFirstSeats:pairs.filter(x=>x.matchedFirstSeat).length,
    nativeRootIdenticalPairs:pairs.filter(x=>x.rawRootIdentical).length,
    sourceVoltDeclarations:{incumbent:source(a),treatment:source(b)},
    pairs,
    originalNativeRows:a,treatmentNativeRows:b,
    competitivePaperQualifiedGames:0,fieldWinRate:null
  };
}

if(require.main===module){
  const dest=process.env.AGENT23_RANK6_OWNER_VOLT_NATIVE_OUTPUT??
    'artifacts/agent23-rank6-integrated-owner-volt-pair.json';
  const outcome=run();
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  writeAtomicLocked(dest,JSON.stringify(outcome,null,2)+'\n');
  process.stdout.write('AGENT23_RANK6_OWNER_VOLT_NATIVE '+JSON.stringify({
    schema:outcome.schema,matched:outcome.allEightSourceDealsMatch,
    firstSeats:outcome.matchedFirstSeats,
    ownerSelections:outcome.actualOwnerPromptSelections,
    identicalRootPairs:outcome.nativeRootIdenticalPairs,
    sourceVolts:outcome.sourceVoltDeclarations,
    pairs:outcome.pairs.map(p=>({
      id:p.trialId,cell:p.cell,
      matched:p.matchedBaselineAndTreatmentSourceDeal,
      first:p.rawRootCommonPrefix,
      baseline:{status:p.control.status,volt:p.control.nativeVoltDeclarations,
        finished:p.control.finished,roots:p.control.roots},
      treatment:{status:p.treatment.status,volt:p.treatment.nativeVoltDeclarations,
        finished:p.treatment.finished,roots:p.treatment.roots}
    })),competitiveQualifiedGames:0
  })+'\n');
  if(!outcome.allEightSourceDealsMatch)process.exitCode=1;
}

module.exports={VERSION,PIN,registered,withActualOwnerVoltNative,runArm,run};
