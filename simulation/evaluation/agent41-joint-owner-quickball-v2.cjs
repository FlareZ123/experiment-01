'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');

const root=path.resolve(__dirname,'../..');
const manifestFile=path.join(__dirname,'agent41-joint-owner-quickball-v2.json');
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const outputFile=path.join(root,'agent41-joint-owner-quickball-v2-output.json');
const envName='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';

/** Git blob for a real file's bytes. @param {Buffer} input @returns {string} */
function gitBlob(input){
  return createHash('sha1').update('blob '+input.length+'\0')
    .update(input).digest('hex');
}

/** Fail closed on any unselected runner, dependency, registered arm or ambient flag. */
function inspect(){
  assert.equal(manifest.schema,
    'agent41-joint-owner-quickball-v2-prospective-paired-native');
  assert.equal(manifest.nativeVendorRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const pin=execFileSync('git',['-C',path.join(root,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(pin,manifest.nativeVendorRevision,'Vendor changed from registration');
  for(const [relative,sha] of Object.entries(manifest.pinnedSourceFiles)){
    assert.match(sha,/^[a-f0-9]{40}$/);
    assert.equal(gitBlob(fs.readFileSync(path.join(root,relative))),sha,
      'Registered source dependency changed: '+relative);
  }
  const runner=fs.readFileSync(path.join(root,manifest.sourceRunner),'utf8');
  const start=runner.indexOf('function runDevelopment({');
  const end=runner.indexOf('}={}){',start);
  assert.ok(start>=0&&end>start,'Runner signature not recognized');
  const keys=runner.slice(start+'function runDevelopment({'.length,end)
    .split(',').map(x=>x.trim().replace(/\s+/g,'')).filter(Boolean)
    .map(x=>x.split('=')[0]);
  assert.equal(keys.length,93,'Unexpected runner option count');
  assert.deepEqual(Object.keys(manifest.baselinePolicyOptions),keys);
  assert.deepEqual(Object.keys(manifest.treatmentPolicyOptions),keys);
  const changes=keys.filter(key=>
    manifest.baselinePolicyOptions[key]!==manifest.treatmentPolicyOptions[key]);
  assert.deepEqual(changes.sort(),
    ['actorHandDiscard','actorOnlySingleSearch','bilateralQuickBallRoot']);
  for(const key of changes){
    assert.equal(manifest.baselinePolicyOptions[key],false);
    assert.equal(manifest.treatmentPolicyOptions[key],true);
  }
  for(const mode of ['baseline','treatment']){
    const opts=manifest[mode+'PolicyOptions'];
    assert.equal(opts.actorOnlyComposition,true);
    assert.equal(opts.registeredTrials,null);
    assert.equal(opts.nativeRootActionLimit,260);
    assert.equal(opts.paperSupporterQuota,true);
    assert.equal(opts.sharedPaperPaymentPortfolio,true);
    assert.equal(opts.paperQuickBallPayment,true);
    assert.equal(opts.paperSecretBoxPayment,true);
    assert.equal(opts.nativeQuickBallOwnerTransactionAudit,true);
    assert.equal(opts.nativeAcceptedTargets,true);
    assert.equal(opts.allowAdditionalOriginalSourceRanks,true);
  }
  assert.equal(manifest.registeredTrials.length,8);
  assert.equal(manifest.expectedNativeAttempts,16);
  const paired=new Map();
  for(const t of manifest.registeredTrials){
    assert.ok(t.rank===5||t.rank===11);
    assert.ok(t.candidateSlot==='A'||t.candidateSlot==='B');
    assert.ok(Number.isSafeInteger(t.seed)&&t.seed>=0&&t.seed<=0xffffffff);
    assert.equal(t.id,[t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    const key=[t.rank,t.repeat,t.candidateSlot].join(':');
    const group=paired.get(key)??{seed:t.seed,candidates:[]};
    assert.equal(group.seed,t.seed);
    group.candidates.push(t.candidateId);
    paired.set(key,group);
  }
  assert.equal(paired.size,4);
  for(const group of paired.values())assert.deepEqual(group.candidates,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.deepEqual([...paired.keys()].sort(),
    ['11:10:A','11:11:B','5:10:A','5:11:B']);
  assert.deepEqual(Object.keys(process.env).filter(key=>
    /^(AGENT[0-9]+_|AICHI_|TWINLEAF_|PAPER_)/.test(key)),[],
    'Unregistered environment research flags');
  return {vendorPin:pin,pinnedDependencyCount:Object.keys(manifest.pinnedSourceFiles).length,
    optionCount:keys.length,registeredTrials:8,
    fullSourceSeedGroups:4,pairedAttempts:16,
    profileGitBlob:gitBlob(fs.readFileSync(manifestFile)),
    prospectiveSelectedDifference:changes,
    competitivelyQualified:0};
}

/**
 * Guaranteed exact native attempt preservation independent of the decision policy.
 * @param {object} row @returns {object}
 */
function summarize(row){
  return {
    trialId:row.trial?.id??null,
    sourceSeat:row.sourceSeat,candidateSeat:row.candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    nativeDisposition:classifyNativeAttempt(row).kind,
    nativeSourceAttacks:(row.sourceAttackSettlement?.attacks??[]).map(a=>({
      ordinal:a.actionOrdinal,turn:a.turnBefore,name:a.attackName,
      settled:a.settledPromptChain===true,
      prizesBefore:a.prizesBefore??null,prizesAfter:a.prizesAfter??null
    })),
    quickBallTransactions:row.nativeQuickBallOwnerTransactions?.rows??null,
    sourceFirstRoot:row.sourceFirstOwnedAffordances?.firstRootAction??null,
    paperQualified:false,competitiveQualified:false
  };
}

/** Preserve native JSON atomically while holding an exclusive run lock. */
function writeLocked(data){
  const lock=outputFile+'.lock',temp=outputFile+'.tmp.'+process.pid;
  const fd=fs.openSync(lock,'wx',0o600);
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const file=fs.openSync(temp,'r');
    try{fs.fsyncSync(file)}finally{fs.closeSync(file)}
    fs.renameSync(temp,outputFile);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/**
 * Two prospective frozen policies on exact same 8 physical seeds.
 * Every native failure, nonterminal censor, and disposition is retained.
 */
function run(){
  const preflight=inspect();
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const modes={};
  for(const mode of ['baseline','treatment']){
    assert.equal(process.env[envName],undefined);
    process.env[envName]='true';
    try{
      modes[mode]=runDevelopment({
        ...manifest[mode+'PolicyOptions'],
        registeredTrials:manifest.registeredTrials,
        registeredFrameName:manifest.registeredTrialFrame+':'+mode
      });
    }finally{delete process.env[envName]}
  }
  const base=modes.baseline.rows,updated=modes.treatment.rows;
  const summaries={baseline:base.map(summarize),treatment:updated.map(summarize)};
  const physicalMatches=summaries.baseline.map((row,i)=>({
    id:row.trialId,
    exactSourcePhysical:row.sourceDealFingerprint!==null&&
      row.sourceDealFingerprint===summaries.treatment[i]?.sourceDealFingerprint,
    exactBothPlayersPhysical:row.fullPhysicalDealFingerprint!==null&&
      row.fullPhysicalDealFingerprint===
        summaries.treatment[i]?.fullPhysicalDealFingerprint
  }));
  const output={
    schema:'agent41-joint-owner-quickball-v2-native-release',
    preflight,registeredTrials:manifest.registeredTrials,
    baseline:modes.baseline,treatment:modes.treatment,
    summaries,physicalMatches,
    allAttemptsPreserved:true,
    paperGameQualified:false,competitiveQualifiedGames:0,
    caveat:'Native-developmental evidence only; never infer competitive win percentages from engine terminals'
  };
  writeLocked(output);
  process.stdout.write(JSON.stringify({
    attemptedBaseline:base.length,attemptedTreatment:updated.length,
    allSourceDealMatches:physicalMatches.every(x=>x.exactSourcePhysical),
    allTwoPlayerDealMatches:physicalMatches.every(x=>x.exactBothPlayersPhysical),
    rows:physicalMatches.map((entry,i)=>({...entry,
      baseline:summaries.baseline[i].nativeDisposition,
      treatment:summaries.treatment[i].nativeDisposition,
      nativeSourceAttacksBefore:summaries.baseline[i].nativeSourceAttacks.map(a=>a.name),
      nativeSourceAttacksAfter:summaries.treatment[i].nativeSourceAttacks.map(a=>a.name)})),
    competitiveQualifiedGames:0
  },null,2)+'\n');
  assert.equal(base.length,8,'Missing baseline native attempts');
  assert.equal(updated.length,8,'Missing treatment native attempts');
  assert.ok(physicalMatches.every(x=>x.exactSourcePhysical),
    'Pairing failure: a replay changed original physical seed/deal');
  assert.ok(physicalMatches.every(x=>x.exactBothPlayersPhysical),
    'Pairing failure: a replay changed the two-player physical deal');
  return output;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  }else run();
}
module.exports={gitBlob,inspect,summarize,run};
