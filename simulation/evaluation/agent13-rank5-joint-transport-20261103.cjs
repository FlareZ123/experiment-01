'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent13-rank5-joint-transport-20261103.json';
const BASE='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const RUNNER='simulation/evaluation/agent41-bilateral-v2-development.cjs';
const REG_BLOB='42b4599354e4a59c4f6ec203fc03213dd66c9e87';
const BASE_BLOB='f6ba98e6a259daa835397689799dc35550a1c14d';
const RUNNER_BLOB='15171b5112492d20f0de5b3fdf5f3a6423fee1a4';
const OUTPUT='agent13-rank5-joint-transport-16arm.json';

/** @param {string} file @returns {Buffer} */
const bytes=file=>fs.readFileSync(path.join(ROOT,file));
/** @param {object} value @returns {string} */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Independently verify the frozen pre-outcome design and exact running code. */
function preflight(){
  assert.equal(gitBlobHash(bytes(REG)),REG_BLOB);
  assert.equal(gitBlobHash(bytes(BASE)),BASE_BLOB);
  assert.equal(gitBlobHash(bytes(RUNNER)),RUNNER_BLOB);
  const design=JSON.parse(bytes(REG).toString('utf8'));
  const base=JSON.parse(bytes(BASE).toString('utf8'));
  assert.equal(base.sourceRunnerGitBlobSha,RUNNER_BLOB);
  assert.equal(design.sourcePrinted60Sha256,
    'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05');
  assert.equal(base.pinnedVendor,design.pinnedVendor);
  assert.equal(design.registeredAttempts,16);
  const groups=base.registeredTrials.filter(x=>x.rank===5);
  assert.equal(groups.length,4);
  const expected=design.sourceSeatGroups.flatMap(group=>
    design.candidateIds.map(candidateId=>({
      ...group,candidateId,id:[group.rank,group.repeat,
        group.candidateSlot,candidateId].join(':')
    })));
  assert.deepEqual(groups,expected);
  const modes=design.modes;
  assert.deepEqual(modes.map(m=>[m.id,m.actorOnlySingleSearch,m.actorHandDiscard]),[
    ['joint_v1_control',false,false],['search_only',true,false],
    ['discard_only',false,true],['search_and_discard',true,true]
  ]);
  assert.equal(base.policyOptions.actorOnlySingleSearch,false);
  assert.equal(base.policyOptions.actorHandDiscard,false);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
  assert.equal(base.policyOptions.nativeRootActionLimit,260);
  assert.equal(design.maxNativeRootActions,260);
  return {design,base,trials:groups};
}

/** @param {object} row @returns {number|null} */
function sourceAttackCount(row){
  const x=row.attackDeclarations?.source;
  if(Number.isSafeInteger(x)&&x>=0)return x;
  if(Array.isArray(x))return x.length;
  return null;
}

/** @param {object} row @param {'A'|'B'} candidateSlot @returns {object} */
function witness(row,candidateSlot){
  const sourceSeat=candidateSlot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const sourceRoots=roots.filter(x=>x.playerSlot===sourceSeat);
  const copies=row.actorOnlyDecisionCoverage?.detailedComponentAudits
    ?.chooseAttack?.selections??[];
  const sourceCopies=Array.isArray(copies)?copies.filter(x=>
    x.seat===sourceSeat&&x.printing==='Genesect V FST'&&
    x.attack==='Techno Blast'):[];
  const settlement=row.sourceAttackSettlement?.attacks??[];
  return {
    nativeStatus:row.status??null,
    finished:row.finished??null,endReason:row.endReason??null,
    actionCount:row.actionCount??null,
    sourceAttackDeclarations:sourceAttackCount(row),
    sourceMewVmaxRoots:sourceRoots.filter(x=>
      x.action==='PlayCardAction'&&
      typeof x.card==='string'&&x.card.startsWith('Mew VMAX'))
      .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,card:x.card})),
    sourceOwnerTechnoBlastCopies:sourceCopies.map(x=>({
      turn:x.turn,sourceIndex:x.sourceIndex,attackIndex:x.attackIndex
    })),
    sourceAttackSettlementCount:Array.isArray(settlement)?settlement.length:null,
    sourceRootPassCount:sourceRoots.filter(x=>x.action==='PassTurnAction').length,
    physicalSourceDeal:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeError:row.error??null,
    paperPaymentCertified:false,qualifiedGame:false
  };
}

/** Preserve every mode including failures; equal seeds alone are not deal evidence. */
function runTransport(run=require('./agent41-bilateral-v2-development.cjs').runDevelopment){
  assert.equal(typeof run,'function');
  const {design,base,trials}=preflight();
  const modes=[];
  for(const mode of design.modes){
    const opts={...base.policyOptions,
      actorOnlySingleSearch:mode.actorOnlySingleSearch,
      actorHandDiscard:mode.actorHandDiscard,
      registeredTrials:trials,
      registeredFrameName:'agent13-rank5-retrospective-transport-'+mode.id};
    const native=run(opts);
    assert.equal(native.attempted,4,
      'A mode must retain all 4 registered original-source attempts');
    assert.equal(native.rows.length,4);
    assert.deepEqual(native.rows.map(x=>x.trial.id),
      trials.map(x=>x.id));
    modes.push({id:mode.id,options:{
      actorOnlySingleSearch:mode.actorOnlySingleSearch,
      actorHandDiscard:mode.actorHandDiscard
    },registeredTrialFrame:opts.registeredFrameName,
    witness:native.rows.map(row=>({
      trialId:row.trial.id,candidateSlot:row.trial.candidateSlot,
      candidateId:row.trial.candidateId,
      ...witness(row,row.trial.candidateSlot)
    })),native});
  }
  const comparisons=trials.map((trial,index)=>{
    const evidence=modes.map(mode=>({mode:mode.id,
      ...mode.witness[index]}));
    const physical=evidence.map(x=>x.physicalSourceDeal);
    const fullyMatched=physical.every(x=>typeof x==='string'&&
      x.length>0)&&new Set(physical).size===1;
    return {trial,physicalStatus:fullyMatched?
      'EXACT_SOURCE_DEAL_MATCH':'UNVERIFIED_OR_DIFFERENT',
      evidence};
  });
  return {schema:'agent13-rank5-joint-v1-same-deal-ablation-executed-v1',
    registrationGitBlobSha:REG_BLOB,
    baselineProfileGitBlobSha:BASE_BLOB,
    runningCodeGitBlobSha:RUNNER_BLOB,
    pinnedVendor:design.pinnedVendor,
    independentNewSourceSeeds:0,
    historicalSameDealComparisons:true,
    modes,comparisons,
    attempts:modes.reduce((n,m)=>n+m.native.rows.length,0),
    physicalVerifiedComparisons:comparisons.filter(x=>
      x.physicalStatus==='EXACT_SOURCE_DEAL_MATCH').length,
    paperCompetitiveGamesQualified:0,target995Demonstrated:false,
    evidenceSha256:digest(comparisons),
    caveat:'Retrospective same-deal root-policy screen. Native counts and terminals are not competitive wins.'};
}

/** Locked atomic output prevents a partial multi-megabyte native archive. */
function writeAtomicLocked(file,value){
  const final=path.join(ROOT,file);
  const lock=final+'.lock';
  const temp=final+'.tmp-'+process.pid;
  const fd=fs.openSync(lock,'wx');
  try {
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,final);
  }finally{
    fs.closeSync(fd);
    fs.rmSync(lock,{force:true});
    fs.rmSync(temp,{force:true});
  }
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {design,trials}=preflight();
    process.stdout.write(JSON.stringify({schema:design.schema,
      registeredTrials:trials,registeredAttempts:design.registeredAttempts,
      modes:design.modes,qualification:false},null,2)+'\n');
  }else{
    const result=runTransport();
    writeAtomicLocked(OUTPUT,result);
    process.stdout.write(JSON.stringify({
      output:OUTPUT,attempts:result.attempts,
      physicalVerifiedComparisons:result.physicalVerifiedComparisons,
      rows:result.comparisons.map(x=>({id:x.trial.id,
        physical:x.physicalStatus,
        modes:x.evidence.map(y=>({name:y.mode,attacks:y.sourceAttackDeclarations,
          copies:y.sourceOwnerTechnoBlastCopies.length,
          evolved:y.sourceMewVmaxRoots.length,
          disposition:y.nativeStatus??y.endReason??'unverified'}))})),
      paperCompetitiveGamesQualified:0
    },null,2)+'\n');
  }
}
module.exports={REG_BLOB,BASE_BLOB,RUNNER_BLOB,preflight,
  sourceAttackCount,witness,runTransport,writeAtomicLocked};
