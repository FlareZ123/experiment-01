'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, randomBytes} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {auditSourceClosure} = require('./agent36-source-closure-audit.cjs');

const ROOT = path.resolve(__dirname, '../..');
const PROFILE = path.join(__dirname, 'agent20-frozen-rank6-canary-v1.json');
const OUTPUT = path.join(ROOT, 'agent20-frozen-rank6-canary-v1-output.json');
const RUNNER = 'simulation/evaluation/agent41-bilateral-v2-development.cjs';

/** @param {Buffer|string} data @returns {string} */
function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

/** @param {Buffer} bytes @returns {string} */
function gitBlobSha(bytes) {
  return createHash('sha1').update('blob ' + bytes.length + '\0')
    .update(bytes).digest('hex');
}

/**
 * Identify the complete *declared* option set, rather than trusting new
 * runner defaults when the shared function signature changes.
 * @param {string} source Exact committed runner source.
 * @returns {string[]}
 */
function declaredOptions(source) {
  const match = source.match(/function runDevelopment\(\{([\s\S]*?)\}=\{\}\)\{/);
  assert.ok(match, 'Cannot identify canonical runner options');
  return match[1].split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const parts = s.split('=').map(x => x.trim());
    assert.equal(parts.length, 2, 'Unexpected runner option ' + s);
    assert.ok(['false', 'true', 'null'].includes(parts[1]),
      'Unexpected nonliteral default ' + s);
    return parts[0];
  });
}

/**
 * @param {object} profile Committed immutable profile.
 * @param {string} runnerSource Actual checked-out runner source.
 */
function checkProfile(profile, runnerSource) {
  assert.equal(profile.schema, 'agent20-frozen-bilateral-rank6-canary-v1');
  assert.equal(profile.sourceRunner, RUNNER);
  const declared = declaredOptions(runnerSource).sort();
  assert.deepEqual(Object.keys(profile.policyOptions).sort(), declared,
    'Canonical runner option schema changed; release needs review');
  assert.equal(profile.policyOptions.registeredTrials, null);
  assert.equal(profile.policyOptions.registeredFrameName, null);
  assert.equal(profile.policyOptions.sourceFirstRetrospective, false);
  assert.equal(profile.policyOptions.allowAdditionalOriginalSourceRanks, false);
  assert.equal(profile.policyOptions.actorOnlyComposition, true);
  assert.equal(profile.policyOptions.paperSecretBoxPayment, true);
  assert.equal(profile.policyOptions.paperQuickBallPayment, true);
  assert.equal(profile.policyOptions.sharedPaperPaymentPortfolio, true);
  assert.equal(profile.registeredTrials.length, 4);
  assert.deepEqual(profile.candidateIds,
    ['champion-reference', 'new-moon-lockbreaker-v1']);
  const seen = new Set();
  for (const t of profile.registeredTrials) {
    assert.equal(t.rank, 6);
    assert.ok(['A', 'B'].includes(t.candidateSlot));
    assert.ok(profile.candidateIds.includes(t.candidateId));
    assert.equal(t.id, [t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(t.seed) && t.seed>=0 && t.seed<=0xffffffff);
    assert.ok(!seen.has(t.id), 'Duplicate frozen trial');
    seen.add(t.id);
  }
  for (const slot of ['A', 'B']) {
    const pair = profile.registeredTrials.filter(t => t.candidateSlot===slot);
    assert.equal(pair.length, 2);
    assert.equal(pair[0].seed, pair[1].seed);
    assert.deepEqual(pair.map(t=>t.candidateId).sort(),
      profile.candidateIds.slice().sort());
  }
  assert.deepEqual([...new Set(profile.registeredTrials.map(t=>t.seed))].sort(),
    profile.precommitTrialSeeds.slice().sort());
  assert.equal(profile.strictEnvironment, true);
  assert.ok(profile.pinnedSourceGitBlobs &&
    Object.keys(profile.pinnedSourceGitBlobs).length>=11,
    'Frozen research dependency source registry missing');
  assert.equal(profile.pinnedSourceGitBlobs[RUNNER] !== undefined,true);
  assert.equal(profile.preserveEveryAttempt, true);
  assert.equal(profile.dispositionsMustNotClaimWin, true);
}

/**
 * Reject every ambient environment value visible in the conservative code
 * closure except the explicitly reviewed operational values. Prevent
 * unreviewed AGENT-prefixed runtime switches even when they enter via
 * computed env access not caught by the source scanner.
 * @param {object} profile
 * @param {object} closure
 * @param {NodeJS.ProcessEnv|Record<string,string|undefined>} env
 * @param {string} checkoutCommit Actual immutable checked-out Git commit.
 */
function assertEnvironment(profile, closure, env, checkoutCommit) {
  const injected = profile.injectedResearchEnvironment;
  const ambient = profile.allowedAmbientEnvironment;
  const keys = new Set([...closure.keys,
    ...Object.keys(env).filter(k => /^AGENT\d+_/i.test(k))]);
  for (const key of Object.keys(injected)) {
    assert.equal(env[key], undefined,
      'Research environment key must be injected only by frozen profile: '+key);
    keys.add(key);
  }
  for (const key of keys) {
    if (Object.hasOwn(injected,key)) continue;
    const actual=env[key];
    if (actual===undefined) continue;
    const expected=ambient[key]==='@checkoutCommit'?checkoutCommit:ambient[key];
    assert.ok(Object.hasOwn(ambient,key) && actual===expected,
      'Unreviewed source-visible ambient environment: '+key);
  }
}

/**
 * @param {string} filename
 * @param {string} data
 */
function writeAtomicLocked(filename, data) {
  const lock=filename+'.lock';
  const fd=fs.openSync(lock,'wx');
  let tmp=null;
  try {
    tmp=filename+'.'+randomBytes(8).toString('hex')+'.tmp';
    fs.writeFileSync(tmp,data,{flag:'wx'});
    fs.renameSync(tmp,filename);
  } finally {
    if(tmp && fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/** @param {object} run Native run return. @param {object} profile */
function disposition(run, profile) {
  const rows=run.rows??[];
  const attempts=rows.map((row,i)=>{
    const trial=row.trial??profile.registeredTrials[i];
    return {
      trialId:trial?.id??null,
      sourceRank:trial?.rank??null,
      sourcePhysicalSeat:trial?.candidateSlot==='A'?'B':'A',
      candidatePhysicalSeat:trial?.candidateSlot??null,
      nativeStatus:row.status??'UNREPORTED',
      firstTurnSlot:row.actualStarterSeat??row.firstTurnSlot??null,
      verifiedFirstTurn:row.verifiedFirstTurn??null,
      sourceDealFingerprint:row.sourceDealFingerprint??
        row.initialSourceDealFingerprint?.digestSha256??null,
      nativeRootCount:row.rootActionLedger?.length??null,
      observedEngineTerminal:row.gameFinished??null,
      paperPaymentVerified:false,
      sourcePayoffVerified:false,
      opponentContinuationVerified:false,
      competitiveGameQualified:false
    };
  });
  const bothSeats=attempts.length===4 &&
    ['A','B'].every(slot=>attempts.filter(t=>
      t.candidatePhysicalSeat===slot).length===2);
  const bothSeatsAttested=bothSeats && attempts.every(t=>
    t.verifiedFirstTurn===true &&
    typeof t.sourceDealFingerprint==='string' &&
    t.sourceDealFingerprint.length>0 && t.nativeRootCount>0);
  const stages={
    CONFIG_FROZEN:true,
    BOTH_SEATS_EXECUTED:bothSeatsAttested,
    PAPER_PAYMENT_VERIFIED:false,
    SOURCE_PAYOFF_WITNESSED:false,
    OPPONENT_CONTINUATION_WITNESSED:false,
    COMPETITIVE_GAME_QUALIFIED:false
  };
  return {
    stages,firstBlocker:bothSeatsAttested?'PAPER_PAYMENT_UNVERIFIED':
      'BOTH_SEATS_NOT_NATIVE_ATTESTED',
    attempts,competitiveQualifiedGames:0,
    nativeStatusCounts:attempts.reduce((acc,t)=>{
      acc[t.nativeStatus]=(acc[t.nativeStatus]??0)+1;return acc;
    },{}),warnings:[
      'Native terminals and action caps are not competitively qualified games.',
      'The lexical code closure cannot resolve dynamic CommonJS imports.',
      'No action-root-to-paid-attack-and-opponent-response lineage was certified.'
    ]
  };
}

/**
 * Execute the exact four preregistered arms using a single selected policy
 * on both physical actors. Never read the surrounding workflow inputs.
 * @returns {object}
 */
function runFrozenCanary() {
  const profileBytes=fs.readFileSync(PROFILE);
  const profile=JSON.parse(profileBytes.toString('utf8'));
  const runnerSource=fs.readFileSync(path.join(ROOT,RUNNER),'utf8');
  checkProfile(profile,runnerSource);
  const rosterBytes=fs.readFileSync(path.join(ROOT,profile.printedRoster));
  assert.equal(gitBlobSha(rosterBytes),profile.printedRosterBlobSha,
    'Original opponent printing roster has changed');
  for (const [filename,blobSha] of Object.entries(profile.pinnedSourceGitBlobs)) {
    assert.equal(gitBlobSha(fs.readFileSync(path.join(ROOT,filename))),blobSha,
      'Frozen release source dependency changed: '+filename);
  }
  assert.ok(fs.readFileSync(path.join(ROOT,'.gitmodules'),'utf8')
    .includes('path = '+profile.pinnedVendorPath));
  const vendor=execFileSync('git',
    ['-C',path.join(ROOT,profile.pinnedVendorPath),'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  assert.equal(vendor,profile.pinnedVendorRevision,
    'Pinned Twinleaf revision mismatch');
  const checkoutCommit=execFileSync('git',['rev-parse','HEAD'],
    {cwd:ROOT,encoding:'utf8'}).trim();
  const closure=auditSourceClosure(ROOT,[RUNNER]);
  assertEnvironment(profile,closure,process.env,checkoutCommit);
  const prior=new Map();
  try {
    for (const [key,value] of Object.entries(profile.injectedResearchEnvironment)) {
      prior.set(key,process.env[key]);
      process.env[key]=value;
    }
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    let result;
    try {
      result=runDevelopment({...profile.policyOptions,
        registeredTrials:profile.registeredTrials,
        registeredFrameName:profile.schema});
    } catch(error) {
      if(error && typeof error==='object')error.frozenConfigVerified=true;
      throw error;
    }
    return {
      schema:'agent20-frozen-release-disposition-v1',
      releaseProfile:profile.schema,
      profileSha256:sha256(profileBytes),
      runtime:{checkoutCommit,runnerSha256:sha256(runnerSource),
        originalPrintedRosterBlobSha:gitBlobSha(rosterBytes),
        pinnedVendorRevision:vendor,
        sourceClosureSha256:closure.digest,
        sourceClosureFileCount:closure.files.length,
        sourceClosureEnvironmentKeys:closure.keys,
        sourceClosureDynamicRequireSites:
          closure.limitations.dynamicRequireSites.reduce((a,x)=>a+x.count,0),
        sourceClosureComputedEnvSites:
          closure.limitations.computedEnvSites.length,
        frozenPolicyOptions:profile.policyOptions,
        pinnedSourceSnapshotCommit:profile.pinnedSourceSnapshotCommit,
        pinnedSourceGitBlobs:profile.pinnedSourceGitBlobs,
        injectedResearchEnvironment:profile.injectedResearchEnvironment},
      releaseDisposition:disposition(result,profile),
      rawNativeResult:result,
      competitiveGameQualified:false
    };
  } finally {
    for (const [key,value] of prior) {
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if (require.main===module) {
  let out;
  try {out=runFrozenCanary();}
  catch(error){
    const configFrozen=error?.frozenConfigVerified===true;
    out={schema:'agent20-frozen-release-disposition-v1',
      releaseProfile:'agent20-frozen-bilateral-rank6-canary-v1',
      releaseDisposition:{stages:{CONFIG_FROZEN:configFrozen,
        BOTH_SEATS_EXECUTED:false,PAPER_PAYMENT_VERIFIED:false,
        SOURCE_PAYOFF_WITNESSED:false,
        OPPONENT_CONTINUATION_WITNESSED:false,
        COMPETITIVE_GAME_QUALIFIED:false},
      firstBlocker:configFrozen?'NATIVE_EXECUTION_EXCEPTION':
        'PREFLIGHT_REJECTED',attempts:[],
      competitiveQualifiedGames:0},
      error:String(error?.stack??error),competitiveGameQualified:false};
    process.exitCode=1;
  }
  writeAtomicLocked(OUTPUT,JSON.stringify(out,null,2)+'\n');
  process.stdout.write(JSON.stringify({profile:out.releaseProfile,
    disposition:out.releaseDisposition.stages,
    firstBlocker:out.releaseDisposition.firstBlocker,
    totalAttempts:out.releaseDisposition.attempts.length,
    error:out.error??null})+'\n');
}

module.exports={gitBlobSha,declaredOptions,checkProfile,
  assertEnvironment,writeAtomicLocked,disposition,runFrozenCanary};
