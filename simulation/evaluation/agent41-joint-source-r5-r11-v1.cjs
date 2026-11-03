'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');

const repo=path.resolve(__dirname,'../..');
const profileFile=path.join(__dirname,'agent41-joint-source-r5-r11-v1.json');
const profile=JSON.parse(fs.readFileSync(profileFile,'utf8'));
const outputFile=path.join(repo,'agent41-joint-source-r5-r11-v1-output.json');

/** @param {Buffer} content @returns {string} */
function gitBlobSha(content){
  return createHash('sha1').update('blob '+content.length+'\0')
    .update(content).digest('hex');
}

/**
 * Pre-outcome registration and code/deck dependency pinning.
 * No supplied option or environment override can silently change the policy.
 * @returns {object}
 */
function inspectProfile(){
  assert.equal(profile.schema,'agent41-joint-original-source-rank5-rank11-v1');
  assert.equal(profile.expectedAttemptCount,8);
  assert.deepEqual(profile.expectedOriginalRanks,[5,11]);
  assert.equal(profile.pinnedVendor,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const pinned=profile.pinnedSourceFiles;
  assert.ok(pinned&&Object.keys(pinned).length>=13);
  for(const [relative,sha] of Object.entries(pinned)){
    assert.match(sha,/^[a-f0-9]{40}$/);
    assert.equal(gitBlobSha(fs.readFileSync(path.join(repo,relative))),sha,
      'Selected source-code/printed-roster drift: '+relative);
  }
  const vendor=execFileSync('git',['-C',path.join(repo,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(vendor,profile.pinnedVendor,'Native engine pin drift');

  const runnerText=fs.readFileSync(path.join(repo,profile.sourceRunner),'utf8');
  const start=runnerText.indexOf('function runDevelopment({');
  const end=runnerText.indexOf('}={}){',start);
  assert.ok(start>=0&&end>start,'Canonical runner signature unavailable');
  const entries=runnerText.slice(start+'function runDevelopment({'.length,end)
    .split(',').map(x=>x.trim().replace(/\s+/g,'')).filter(Boolean);
  const keys=entries.map(x=>x.split('=')[0]);
  assert.equal(keys.length,92,'Runner option count changed');
  assert.deepEqual(Object.keys(profile.policyOptions),keys,
    'Selected effective options omit or add a runner parameter');
  assert.equal(profile.policyOptions.registeredTrials,null);
  assert.equal(profile.policyOptions.registeredFrameName,profile.registeredFrameName);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.allowAdditionalOriginalSourceRanks,true);
  assert.equal(profile.policyOptions.paperSupporterQuota,true);
  assert.equal(profile.policyOptions.sharedPaperPaymentPortfolio,true);
  assert.equal(profile.policyOptions.paperQuickBallPayment,true);
  assert.equal(profile.policyOptions.paperSecretBoxPayment,true);
  assert.equal(profile.policyOptions.nativeAcceptedTargets,true);
  assert.equal(profile.policyOptions.nativeQuickBallOwnerTransactionAudit,true);
  assert.equal(profile.policyOptions.nativeRootActionLimit,260);
  assert.equal(profile.registeredTrials.length,8);
  const ids=new Set();
  const groups=new Map();
  for(const t of profile.registeredTrials){
    assert.ok([5,11].includes(t.rank));
    assert.ok(['A','B'].includes(t.candidateSlot));
    assert.ok(['champion-reference','new-moon-lockbreaker-v1']
      .includes(t.candidateId));
    assert.ok(Number.isInteger(t.seed)&&t.seed>=0&&t.seed<=0xffffffff);
    assert.equal(t.id,[t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    assert.ok(!ids.has(t.id));ids.add(t.id);
    const group=[t.rank,t.repeat,t.candidateSlot].join(':');
    if(!groups.has(group))groups.set(group,{seed:t.seed,arms:[]});
    assert.equal(groups.get(group).seed,t.seed);
    groups.get(group).arms.push(t.candidateId);
  }
  assert.equal(groups.size,4);
  for(const group of groups.values()){
    assert.deepEqual(group.arms,
      ['champion-reference','new-moon-lockbreaker-v1']);
  }
  assert.deepEqual([...groups.keys()].sort(),['11:0:A','11:1:B','5:0:A','5:1:B']);
  const unexpected=Object.keys(process.env).filter(k=>
    /^(AGENT[0-9]+_|AICHI_|TWINLEAF_|PAPER_)/.test(k));
  assert.deepEqual(unexpected,[],
    'Source-visible ambient research flags were not preapproved');
  assert.deepEqual(profile.injectedResearchEnvironment,
    {AGENT4_NATIVE_PAYMENT_RECEIPT_DEV:'true'});
  return {
    schema:'agent41-joint-r5-r11-pinned-inspection-v1',
    profileGitBlob:gitBlobSha(fs.readFileSync(profileFile)),
    pinnedVendor:vendor,pinnedSourceFileCount:Object.keys(pinned).length,
    effectiveOptionCount:keys.length,sourceRanks:[5,11],
    independentPhysicalSeedGroups:groups.size,
    registeredAttempts:profile.registeredTrials.length,
    selectedFlags:profile.policyOptions,
    competitiveQualifiedGames:0
  };
}

/** Atomic replacement with an exclusive run-local lock. @param {object} data */
function preserve(data){
  const lock=outputFile+'.lock';
  const descriptor=fs.openSync(lock,'wx',0o600);
  const tmp=outputFile+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const written=fs.openSync(tmp,'r');
    try{fs.fsyncSync(written);}finally{fs.closeSync(written);}
    fs.renameSync(tmp,outputFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(descriptor);fs.unlinkSync(lock);
  }
}

/** @param {object} row */
function summarizeRow(row){
  const disposition=classifyNativeAttempt(row);
  const sourceAttacks=row.sourceAttackSettlement?.attacks??[];
  const accepted=Array.isArray(sourceAttacks)?sourceAttacks.map(attack=>({
    actionOrdinal:attack.actionOrdinal,turnBefore:attack.turnBefore,
    attackName:attack.attackName,
    sourceSeat:row.sourceSeat,
    settledPromptChain:attack.settledPromptChain===true,
    prizesBefore:attack.prizesBefore??null,
    prizesAfter:attack.prizesAfter??null,
    opponentReply:attack.nextSourceRoot?.action??null
  })):[];
  return {
    trialId:row.trial?.id??null,rank:row.trial?.rank??null,
    candidateId:row.trial?.candidateId??null,
    sourceSeat:row.sourceSeat??null,candidateSeat:row.candidateSeat??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    nativeDisposition:disposition.kind,
    rawStatus:disposition.rawStatus,finished:disposition.finished,
    endReason:disposition.endReason,
    selectedNativeSourceAttacks:accepted,
    competitivelyQualified:false
  };
}

/** Run exactly the eight previously registered original-source native attempts. */
function runSelected(){
  const inspection=inspectProfile();
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const name='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[name],undefined);
  process.env[name]=profile.injectedResearchEnvironment[name];
  let raw;
  try{
    raw=runDevelopment({...profile.policyOptions,
      registeredTrials:profile.registeredTrials,
      registeredFrameName:profile.registeredFrameName});
  }finally{
    delete process.env[name];
  }
  assert.ok(Array.isArray(raw.rows));
  const rows=raw.rows.map(summarizeRow);
  const count=rows.reduce((map,row)=>{
    map[row.nativeDisposition]=(map[row.nativeDisposition]??0)+1;
    return map;
  },{});
  const output={
    schema:'agent41-joint-r5-r11-selected-native-release-v1',
    inspection,originalSourceRanks:[5,11],
    allRegisteredTrialIds:profile.registeredTrials.map(x=>x.id),
    attemptedNativeRows:raw.rows.length,
    originalRunOutput:raw,
    summary:{counts:count,rows,exactRegistrationComplete:raw.rows.length===8},
    fullPaperPaymentCertified:false,
    opponentPolicyCompetent:false,paperMatchClockCertified:false,
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'This is a shared native policy integration gate, not a qualified 32-deck win-rate experiment'
  };
  preserve(output);
  process.stdout.write(JSON.stringify({
    schema:output.schema,
    registered:profile.registeredTrials.length,
    attempted:raw.rows.length,
    sourceRankAttacks:rows.map(r=>({id:r.trialId,
      disposition:r.nativeDisposition,
      sourceAttackCount:r.selectedNativeSourceAttacks.length,
      first:r.selectedNativeSourceAttacks[0]?.attackName??null})),
    statusCounts:count,competitiveQualifiedGames:0
  })+'\n');
  assert.equal(raw.rows.length,8,
    'The shared runner did not retain every registered arm');
  return output;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify(inspectProfile(),null,2)+'\n');
  }else{
    runSelected();
  }
}
module.exports={gitBlobSha,inspectProfile,summarizeRow,runSelected};
