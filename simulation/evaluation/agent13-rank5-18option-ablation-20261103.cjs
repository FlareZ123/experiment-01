'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {witness,writeAtomicLocked}=
  require('./agent13-rank5-joint-transport-20261103.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent13-rank5-18option-ablation-20261103.json';
const PROFILE='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const RUNNER='simulation/evaluation/agent41-bilateral-v2-development.cjs';
const REG_BLOB='76908bca53f10a949f191d867aff684fa2746aa7';
const OUTPUT='agent13-rank5-joint-18option-native-8arm.json';

/** @param {string} p @returns {Buffer} */
const read=p=>fs.readFileSync(path.join(ROOT,p));

/** Prove pinned common source, historic explicit fields, and exact cut set. */
function preflight(){
  assert.equal(gitBlobHash(read(REG)),REG_BLOB);
  const manifest=JSON.parse(read(REG).toString('utf8'));
  const joint=JSON.parse(read(PROFILE).toString('utf8'));
  assert.equal(gitBlobHash(read(PROFILE)),manifest.jointProfileGitBlobSha);
  assert.equal(gitBlobHash(read(RUNNER)),manifest.jointCanonicalRunnerGitBlobSha);
  assert.equal(joint.pinnedVendor,manifest.vendorPin);
  assert.equal(Object.keys(joint.policyOptions).length,manifest.jointOptionCount);
  const older=manifest.historicalV31SelectedExplicitOptions;
  assert.equal(Object.keys(older).length,manifest.historicalExplicitOptionCount);
  for(const [key,value] of Object.entries(older))
    assert.deepEqual(joint.policyOptions[key],value,'Original v3.1 shared option changed: '+key);
  const extras=Object.keys(joint.policyOptions).filter(key=>
    !(key in older)&&joint.policyOptions[key]===true).sort();
  assert.deepEqual(extras,manifest.additionalTrueOptions);
  assert.equal(extras.length,19);
  const cuts=extras.filter(key=>key!==manifest.unchangedAdmissionFlag);
  assert.deepEqual(cuts,manifest.cutModeFalseOptions);
  assert.equal(cuts.length,18);
  assert.equal(joint.policyOptions[manifest.unchangedAdmissionFlag],true);
  assert.equal(joint.policyOptions.actorOnlyComposition,true);
  assert.equal(joint.policyOptions.nativeRootActionLimit,manifest.rootCap);
  const selectedTrials=manifest.trials.flatMap(group=>manifest.candidateIds.map(
    candidateId=>({...group,candidateId,
      id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')})));
  assert.deepEqual(joint.registeredTrials.filter(x=>x.rank===5),selectedTrials);
  assert.equal(manifest.expectedNativeAttempts,8);
  assert.deepEqual(manifest.modes.map(m=>[m.id,m.cut]),[
    ['joint_v1_all_92',false],
    ['joint_v1_minus_18_nonadmission_true',true]
  ]);
  return {manifest,joint,trials:selectedTrials};
}

/** @param {object} row @returns {object} */
function describeSource(row){
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger.filter(x=>x.playerSlot===sourceSeat):[];
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits||{};
  return {
    ...witness(row,row.trial.candidateSlot),
    fullNativeRootActionLedgerSha256:row.rootActionLedgerSha256??null,
    sourceFirstOwnTurn:row.sourceFirstOwnedAffordances??null,
    sourceItemPlayRoots:roots.filter(x=>x.action==='PlayCardAction'&&
      typeof x.card==='string'&&
      /Ball|VIP|Mail|Box|Vacuum|Guzma|Crispin|Marnie|Wally|Arven/.test(x.card)),
    sourceRootPassCount:roots.filter(x=>x.action==='PassTurnAction').length,
    sourceCopyPromptSelections:Array.isArray(audit.chooseAttack?.selections)?
      audit.chooseAttack.selections.filter(x=>x.seat===sourceSeat):[],
    sourceAttackSettlement:row.sourceAttackSettlement??null,
    paperCompetitiveGameQualified:false
  };
}

/** Apply precisely the preregistered exclusion of joint-v1's 18 extra opt-ins. */
function optionsForMode(joint,manifest,mode){
  const options={...joint.policyOptions};
  if(mode.cut)for(const key of manifest.cutModeFalseOptions)
    options[key]=false;
  assert.equal(options.allowAdditionalOriginalSourceRanks,true);
  for(const [key,value] of Object.entries(
    manifest.historicalV31SelectedExplicitOptions))
    assert.deepEqual(options[key],value);
  return options;
}

/** Native Store, all original physical deals × two frozen option bundles. */
function runRelease(run=require('./agent41-bilateral-v2-development.cjs').runDevelopment){
  const {manifest,joint,trials}=preflight();
  assert.equal(typeof run,'function');
  const modes=manifest.modes.map(mode=>{
    const opts={...optionsForMode(joint,manifest,mode),
      registeredTrials:trials,
      registeredFrameName:'agent13-rank5-joint-18option-'+mode.id};
    const native=run(opts);
    assert.equal(native.attempted,4);
    assert.deepEqual(native.rows.map(x=>x.trial.id),trials.map(x=>x.id));
    return {id:mode.id,optionsCut:mode.cut?manifest.cutModeFalseOptions:[],
      native,evidence:native.rows.map(describeSource)};
  });
  const comparisons=trials.map((trial,i)=>{
    const a=modes[0].evidence[i],b=modes[1].evidence[i];
    const same=typeof a.physicalSourceDeal==='string'&&
      a.physicalSourceDeal.length>0&&
      a.physicalSourceDeal===b.physicalSourceDeal;
    return {trial,sourcePhysical:same?
      'EXACT_SOURCE_DEAL_MATCH':'UNVERIFIED_OR_DIFFERENT',
      baseline:a,cut18:b,
      nativeRootLedgerIdentical:a.fullNativeRootActionLedgerSha256!=null&&
        a.fullNativeRootActionLedgerSha256===b.fullNativeRootActionLedgerSha256};
  });
  return {schema:'agent13-rank5-joint18-native-eightarm-v1',
    preregistrationBlob:REG_BLOB,commonRunnerBlob:manifest.jointCanonicalRunnerGitBlobSha,
    vendorRevision:manifest.vendorPin,
    selectedHistoricalV31ProfileBlob:manifest.historicalV31ProfileGitBlobSha,
    note:'This is a new joint-runner 18-option ablation, not the historical v3.1 executable.',
    modePolicies:manifest.modes,
    samePhysicalSourcePairCount:comparisons.filter(x=>
      x.sourcePhysical==='EXACT_SOURCE_DEAL_MATCH').length,
    registeredAttempts:8,
    modes,comparisons,
    qualifiedCompetitiveGames:0,target995Demonstrated:false};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {manifest,trials}=preflight();
    process.stdout.write(JSON.stringify({pin:REG_BLOB,trials,
      cut18:manifest.cutModeFalseOptions,attempts:8,
      qualifiedCompetitiveGames:0},null,2)+'\n');
  }else{
    const result=runRelease();
    writeAtomicLocked(OUTPUT,result);
    process.stdout.write(JSON.stringify({output:OUTPUT,
      attempts:result.registeredAttempts,
      matched:result.samePhysicalSourcePairCount,
      rows:result.comparisons.map(c=>({id:c.trial.id,
        physical:c.sourcePhysical,
        completeRootUnchanged:c.nativeRootLedgerIdentical,
        sourceAttacks:[c.baseline.sourceAttackDeclarations,
          c.cut18.sourceAttackDeclarations],
        sourceVmax:[c.baseline.sourceMewVmaxRoots.length,
          c.cut18.sourceMewVmaxRoots.length],
        rootPass:[c.baseline.sourceRootPassCount,
          c.cut18.sourceRootPassCount],
        endReasons:[c.baseline.nativeEndReason,c.cut18.nativeEndReason]
      })),qualifiedCompetitiveGames:0},null,2)+'\n');
  }
}
module.exports={REG_BLOB,preflight,optionsForMode,describeSource,runRelease};
