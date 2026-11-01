'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {assertNoUnreviewedAmbientAgentEnvironment}=
  require('./agent41-frozen-bilateral-development-v1.cjs');
const {compareOriginalRank11Pairs}=
  require('./agent50-rank11-bilateral-known-dead-native-pair.cjs');

const SCHEMA='agent50-fresh-rank11-bilateral-known-dead-native-v1';
const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=
  'results/aichi-2026/registrations/agent50-prospective-rank11-bilateral-known-dead-20261101.json';
const REGISTRATION_BLOB='ce70a4d88355edbf8084f7be1512e69def6157ef';

/**
 * Fail closed on both the seed manifest and its measured executable inputs.
 * The old archived v2 run is a policy-option source, not a transferable
 * paper-rule or source-closure certificate for this altered run.
 * @returns {{registration:object,profile:object,blobs:object}}
 */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(bytes),REGISTRATION_BLOB,
    'Prospectively committed seed registration was modified');
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.schema,
    'agent50-fresh-coin-stratified-rank11-bilateral-known-dead-v1');
  assert.equal(registration.nativeEnginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.selectedGroups,8);
  assert.equal(registration.nativeGameAttempts,32);
  assert.equal(registration.selectedSeeds.length,8);
  const actual=Object.create(null);
  const frozenInputs={
    ...registration.sourceCodePrecommitBlobs,
    [registration.frozenV2Profile]:registration.frozenV2ProfileGitBlobSha1,
    [registration.originalRoster]:registration.sourceRosterGitBlobSha1
  };
  for(const [file,expected] of Object.entries(frozenInputs)){
    const hash=gitBlobHash(fs.readFileSync(path.join(ROOT,file)));
    assert.equal(hash,expected,'Registered source blob drift: '+file);
    actual[file]=hash;
  }
  const profile=JSON.parse(fs.readFileSync(path.join(ROOT,
    registration.frozenV2Profile),'utf8'));
  assert.equal(profile.pinnedVendorRevision,registration.nativeEnginePin);
  assert.equal(profile.candidate60Evidence.championPrinted60BlobSha,
    registration.candidatePrinted60GitBlobSha1s.champion);
  assert.equal(profile.candidate60Evidence.newMoonPublished60BlobSha,
    registration.candidatePrinted60GitBlobSha1s.newMoon);
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  return {registration,profile,blobs:actual};
}

/**
 * Re-check the precommitted xorshift coin criterion using the existing
 * pinned headless seededRandom implementation. Verify all twelve drawn
 * values, accepted order and exactly two heads/tails for each candidate
 * physical seat. This only predicts; the actual native setup remains final.
 * @param {object} registration
 * @param {(seed:number)=>()=>number} seededRandom
 * @returns {object[]} Original 16 planned candidate-60 attempts.
 */
function plannedTrials(registration,seededRandom){
  assert.equal(typeof seededRandom,'function');
  const actual=registration.seedAttempts;
  assert.ok(Array.isArray(actual)&&actual.length===12);
  const counters={A:{heads:0,tails:0},B:{heads:0,tails:0}};
  const seen=new Set();
  const selected=[];
  for(const attempt of actual){
    assert.ok(['A','B'].includes(attempt.candidateSlot));
    assert.ok(Number.isSafeInteger(attempt.seed)&&attempt.seed>=0&&
      attempt.seed<=0xffffffff);
    assert.ok(!seen.has(attempt.seed),'Repeated independently drawn seed');
    seen.add(attempt.seed);
    const heads=seededRandom(attempt.seed)()<0.5;
    assert.equal(heads,attempt.projectedFirstCoinHeads);
    const slot=counters[attempt.candidateSlot];
    const category=heads?'heads':'tails';
    const select=slot[category]<2;
    assert.equal(select,attempt.selected,
      'Precommitted first-two-per-coin-stratum acceptance changed');
    if(select){slot[category]++;selected.push(attempt);}
  }
  for(const seat of ['A','B'])
    assert.deepEqual(counters[seat],{heads:2,tails:2});
  assert.deepEqual(selected,registration.selectedSeeds);
  const trials=[];
  for(const seat of ['A','B']){
    const rows=selected.filter(row=>row.candidateSlot===seat);
    for(let repeat=0;repeat<rows.length;repeat++){
      const {seed,projectedFirstCoinHeads:heads}=rows[repeat];
      for(const candidateId of registration.candidateIds){
        trials.push({id:['11','agent50fresh'+repeat,seat,candidateId].join(':'),
          rank:11,repeat,candidateSlot:seat,candidateId,seed,
          projectedNativeFirstSeat:heads?1:0});
      }
    }
  }
  assert.equal(trials.length,16);
  return trials;
}

/** @param {object[]} rows @returns {object} */
function starterEvidence(rows){
  assert.equal(rows.length,16);
  const receipts=rows.map(row=>({
    id:row.trial.id,seed:row.trial.seed,
    projectedNativeFirstSeat:row.trial.projectedNativeFirstSeat,
    actualStarterSeat:row.actualStarterSeat??null,
    initialSetupStatus:row.nativeSetupCoinChoiceReceipt?.status??null,
    nativeVerifiedFirstTurn:row.verifiedFirstTurn===true,
    match:row.verifiedFirstTurn===true&&
      row.actualStarterSeat===row.trial.projectedNativeFirstSeat
  }));
  return {allMatched:receipts.every(x=>x.match),
    matched:receipts.filter(x=>x.match).length,receipts};
}

/** @param {object[]} rows @returns {object} */
function gameOutcomeSummary(rows){
  const aggregate={attempts:rows.length,sourceEngineWins:0,
    candidateEngineWins:0,caps:0,errors:0};
  for(const row of rows){
    const candidate=row.candidateSeat??(row.trial.candidateSlot==='A'?0:1);
    const source=1-candidate;
    if(row.finished===true){
      if(row.winner===source)aggregate.sourceEngineWins++;
      else if(row.winner===candidate)aggregate.candidateEngineWins++;
      else aggregate.errors++;
    }else if(row.status===null||row.status===undefined){
      aggregate.caps++;
    }else aggregate.errors++;
  }
  return aggregate;
}

/**
 * Execute every precommitted arm twice, preserving exactly one optional
 * symmetric owner-root policy change. Never replace a failed source deal.
 * @param {object} [deps] Optional pure-test injected dependencies.
 * @returns {object} All 32 original physical native attempts and paired evidence.
 */
function run(deps={}){
  const {registration,profile,blobs}=deps.preflight?.()??preflight();
  const seededRandom=deps.seededRandom??
    require('../twinleaf/headless.cjs').seededRandom;
  const trials=plannedTrials(registration,seededRandom);
  const native=deps.runDevelopment??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const common={...profile.policyOptions,registeredTrials:trials,
    registeredFrameName:SCHEMA+':precommitted-eight-original-deals'};
  assert.equal(common.actorOnlyComposition,true);
  assert.equal(common.bilateralKnownDeadAttackRoot,undefined);
  const saved={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    saved[key]=process.env[key];process.env[key]=value;
  }
  try{
    const baseline=native(common);
    const treatment=native({...common,bilateralKnownDeadAttackRoot:true});
    const pairs=compareOriginalRank11Pairs(baseline.rows,treatment.rows,
      {expectedArms:trials.length,schema:SCHEMA});
    const beforeStarter=starterEvidence(baseline.rows);
    const afterStarter=starterEvidence(treatment.rows);
    return {...pairs,registeredManifestBlobSha1:REGISTRATION_BLOB,
      frozenOriginalPolicyProfile:profile.schema,
      registeredSourceBlobs:blobs,
      selectedSeedGroups:registration.selectedSeeds,
      originalPhysicalArms:trials,
      sourceClosureQualified:false,
      official25MinuteClockQualified:false,
      nativeAttemptCountVerified:baseline.attempted===trials.length&&
        treatment.attempted===trials.length,
      originalSetupFirstSeatEvidence:{baseline:beforeStarter,
        treatment:afterStarter},
      outcomes:{baseline:gameOutcomeSummary(baseline.rows),
        treatment:gameOutcomeSummary(treatment.rows)},
      raw:{baseline,treatment},
      caveat:'Fresh coin-stratified seed groups with unchanged 60s, but weak generic policy, unqualified paper prompt semantics, no official 25-minute clock, and only one of 32 Aichi ranks. Engine winners are NOT competitive games.'
    };
  }finally{
    for(const [key,value] of Object.entries(saved)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.nativeAttemptCountVerified||
     result.mismatchedPhysicalInputPairs>0||
     !result.originalSetupFirstSeatEvidence.baseline.allMatched||
     !result.originalSetupFirstSeatEvidence.treatment.allMatched)
    process.exitCode=1;
}

module.exports={SCHEMA,REGISTRATION_BLOB,preflight,plannedTrials,
  starterEvidence,gameOutcomeSummary,run};
