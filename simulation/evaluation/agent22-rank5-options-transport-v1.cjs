'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {inspectProfile}=require('./agent41-joint-source-r5-r11-v1.cjs');
const {classifyNativeAttempt}=
  require('./agent41-native-attempt-disposition.cjs');

const root=path.resolve(__dirname,'../..');
const manifestPath=path.join(__dirname,'agent22-rank5-options-transport-v1.json');
const jointProfilePath=path.join(__dirname,'agent41-joint-source-r5-r11-v1.json');
const outputPath=path.join(root,'agent22-rank5-options-transport-v1-output.json');
const registration=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const jointProfile=JSON.parse(fs.readFileSync(jointProfilePath,'utf8'));
const registeredManifestBlob='fc0fac1a12b3b1debe45f83c691416f97a1c270f';

function gitBlobSha(data){
  const buffer=Buffer.isBuffer(data)?data:Buffer.from(data);
  return createHash('sha1').update('blob '+buffer.length+'\0').update(buffer)
    .digest('hex');
}

/** Pure preflight: no cards, Store, native game or file mutation. */
function inspect(){
  const pinned=inspectProfile();
  assert.equal(registration.schema,'agent22-rank5-same-code-option-shape-transport-v1');
  assert.equal(gitBlobSha(fs.readFileSync(manifestPath)),registeredManifestBlob);
  assert.equal(registration.engineGitCommit,jointProfile.pinnedVendor);
  assert.equal(registration.jointFrozenProfileGitBlobSha,
    gitBlobSha(fs.readFileSync(jointProfilePath)));
  assert.equal(registration.oldFrozenProfileGitBlobSha,
    '14195053fbe11c2f6e35dae994c1cf8e0a73cc33');
  assert.equal(registration.oldRunnerGitBlobSha,
    '3163bb84a57c75990fa4cea92277d5e16effcdb4');
  assert.equal(registration.actualRunnerGitBlobSha,
    jointProfile.pinnedSourceFiles['simulation/evaluation/agent41-bilateral-v2-development.cjs']);
  assert.equal(registration.original60GitBlobSha,
    jointProfile.pinnedSourceFiles['results/aichi-2026/full-decklists.json']);
  assert.equal(registration.expectedNativeAttempts,16);
  assert.equal(registration.registeredTrials.length,8);
  assert.equal(registration.policyModes.length,2);
  assert.equal(registration.expectedPhysicalSeedGroups,4);
  const modes=registration.policyModes;
  assert.deepEqual(Object.keys(modes[1].options),
    Object.keys(jointProfile.policyOptions));
  assert.deepEqual(modes[1].options,jointProfile.policyOptions);
  assert.equal(modes[0].options.actorMewGenesectTechnoBlast,true);
  assert.equal(modes[0].options.actorNaturalEvolutionRoot,true);
  assert.equal(modes[0].options.actorOnlySingleSearch,undefined);
  assert.equal(modes[0].options.actorHandDiscard,undefined);
  assert.equal(modes[0].options.nativeRootActionLimit,260);
  assert.equal(modes[1].options.nativeRootActionLimit,260);
  const ids=new Set();
  for(const t of registration.registeredTrials){
    assert.equal(t.rank,5);
    assert.equal(t.id,[t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    assert.ok(!ids.has(t.id));ids.add(t.id);
    assert.ok(['champion-reference','new-moon-lockbreaker-v1'].includes(t.candidateId));
  }
  assert.equal(registration.metadataAliasMismatchKnown.enforcedPinnedRoster,
    registration.original60GitBlobSha);
  return {registrationGitBlobSha:registeredManifestBlob,
    underlyingJointSelectedCodeProfileGitBlobSha:pinned.profileGitBlob,
    selectedRunnerGitBlobSha:registration.actualRunnerGitBlobSha,
    originalPrintedSourceRosterGitBlobSha:registration.original60GitBlobSha,
    enginePin:registration.engineGitCommit,registeredSourceRank:5,
    physicalSeedGroupCount:4,originalCandidateTrials:8,
    registeredNativeAttempts:16,developmentOnly:true};
}

function attempt(row,mode){
  const disposition=classifyNativeAttempt(row);
  const attacks=row.sourceAttackSettlement?.attacks;
  const accepted=Array.isArray(attacks)?attacks:[];
  return {mode,trialId:row.trial?.id??null,
    candidateId:row.trial?.candidateId??null,
    physicalSeed:row.trial?.seed??null,
    candidateSeat:row.candidateSeat??null,
    sourceSeat:row.sourceSeat??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    nativeDisposition:disposition.kind,
    finished:disposition.finished,endReason:disposition.endReason,
    selectedNativeSourceAttacks:accepted.map(a=>({
      actionOrdinal:a.actionOrdinal??null,
      turnBefore:a.turnBefore??null,
      attackName:a.attackName??null,
      settledPromptChain:a.settledPromptChain===true,
      prizesBefore:a.prizesBefore??null,prizesAfter:a.prizesAfter??null
    })),
    paperQualified:false,competitivelyQualified:false};
}

/** Lock and atomically replace the complete machine-readable evidence. */
function save(data){
  const lock=outputPath+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const tmp=outputPath+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const written=fs.openSync(tmp,'r');
    try{fs.fsyncSync(written);}finally{fs.closeSync(written);}
    fs.renameSync(tmp,outputPath);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

function execute(){
  const preflight=inspect();
  const {runDevelopment}=
    require('./agent41-bilateral-v2-development.cjs');
  const ambient='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[ambient],undefined);
  process.env[ambient]='true';
  let rawModes=[];
  try {
    for(const mode of registration.policyModes){
      const raw=runDevelopment({...mode.options,
        registeredTrials:registration.registeredTrials,
        registeredFrameName:registration.schema+'-'+mode.name});
      assert.ok(Array.isArray(raw.rows));
      // Retain all attempted native rows, including error and action-cap rows.
      rawModes.push({mode:mode.name,raw,
        attempts:raw.rows.map(row=>attempt(row,mode.name))});
    }
  }finally{delete process.env[ambient];}
  const paired=[];
  for(const trial of registration.registeredTrials){
    const a=rawModes[0].attempts.find(x=>x.trialId===trial.id);
    const b=rawModes[1].attempts.find(x=>x.trialId===trial.id);
    assert.ok(a&&b,'Every registered original physical trial must be retained');
    paired.push({trialId:trial.id,
      sameSourcePhysicalDeal:Boolean(a.sourceDealFingerprint&&b.sourceDealFingerprint&&
        a.sourceDealFingerprint===b.sourceDealFingerprint),
      sameActualStarter:a.actualStarterSeat!==null&&
        a.actualStarterSeat===b.actualStarterSeat,
      firstSourceFingerprint:a.sourceDealFingerprint,
      secondSourceFingerprint:b.sourceDealFingerprint,
      baselineSourceAttacks:a.selectedNativeSourceAttacks.length,
      jointSourceAttacks:b.selectedNativeSourceAttacks.length,
      baselineDisposition:a.nativeDisposition,
      jointDisposition:b.nativeDisposition});
  }
  const output={schema:'agent22-original-rank5-within-code-option-transport-result-v1',
    preflight,allNativeRows:rawModes,
    registeredAttemptCount:16,
    executedAttemptCount:rawModes.reduce((s,x)=>s+x.attempts.length,0),
    physicallyMatchedTrialPairs:paired.filter(x=>x.sameSourcePhysicalDeal).length,
    sameStartTrialPairs:paired.filter(x=>x.sameActualStarter).length,
    paired,
    comparisonScope:'24 historical v3.1 options versus full joint-v1 options, both on joint-v1 frozen code revision',
    oldHistoricalNativeCodeNotExecuted:true,
    sameIntegerSeedNotAssumedPhysicalParity:true,
    paperEffectsFullyAudited:false,competentOpponentReplyAudited:false,
    paperMatchClockAudited:false,competitiveQualifiedGames:0,
    conclusionNotPredetermined:true};
  save(output);
  process.stdout.write(JSON.stringify({
    schema:output.schema,
    attempted:output.executedAttemptCount,
    physicalPairs:output.physicallyMatchedTrialPairs,
    sameStarts:output.sameStartTrialPairs,
    paired:paired.map(x=>({
      trial:x.trialId,physicalMatch:x.sameSourcePhysicalDeal,
      oldShapeAttacks:x.baselineSourceAttacks,jointAttacks:x.jointSourceAttacks,
      dispositions:[x.baselineDisposition,x.jointDisposition]})),
    competitiveQualifiedGames:0})+'\n');
  assert.equal(output.executedAttemptCount,16);
  return output;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  }else execute();
}
module.exports={gitBlobSha,inspect,attempt,execute};
