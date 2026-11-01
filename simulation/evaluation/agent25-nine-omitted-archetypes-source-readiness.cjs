'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent25-nine-omitted-archetypes-source-readiness-v1';
const REGISTRATION_BLOB='ce2820e128cc265c6f497e00dcf73e370eec9fad';

/** @returns {object[]} All precommitted rank, physical seat, candidate 60 arms. */
function scheduledArms(){
  assert.deepEqual(registration.sourceRanks,[1,2,5,9,15,19,26,30,31]);
  assert.equal(registration.sourceGroups,18);
  assert.equal(registration.candidateArms,36);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.vendorPinned,profile.pinnedVendorRevision);
  const seen=new Set();
  const arms=[];
  for(const group of registration.registeredGroups){
    assert.ok(registration.sourceRanks.includes(group.rank));
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.equal(group.repeat,0);
    assert.ok(Number.isSafeInteger(group.seed)&&group.seed>=0&&
      group.seed<=0xffffffff);
    const key=[group.rank,group.repeat,group.candidateSlot].join(':');
    assert.ok(!seen.has(key),'Repeated original rank/seat seed group');
    seen.add(key);
    for(const candidateId of registration.candidateIds)
      arms.push({...group,candidateId,id:key+':'+candidateId});
  }
  assert.equal(seen.size,18);
  assert.equal(arms.length,36);
  for(const rank of registration.sourceRanks){
    assert.equal(arms.filter(arm=>arm.rank===rank).length,4);
  }
  return arms;
}

/** Check immutable source registration without pretending historic closure remains pinned. */
function preflight(){
  const regPath=path.join(ROOT,
    'results/aichi-2026/registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json');
  assert.equal(gitBlobHash(fs.readFileSync(regPath)),REGISTRATION_BLOB);
  const roster=fs.readFileSync(path.join(ROOT,registration.eachSourcePrinted60));
  assert.equal(gitBlobHash(roster),registration.sourceRosterBlob);
  const parsed=JSON.parse(roster.toString('utf8'));
  const admitted=require('./agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(parsed,true);
  for(const rank of registration.sourceRanks)
    assert.ok(admitted.includes(rank),'Precommitted rank lacks exact source printed 60');
  const codePaths=[
    'simulation/evaluation/agent41-bilateral-v2-development.cjs',
    'simulation/evaluation/agent25-authenticated-source-admission.cjs',
    'simulation/evaluation/agent25-nine-omitted-archetypes-source-readiness.cjs'
  ];
  const codeBlobHashes=Object.fromEntries(codePaths.map(relative=>{
    return [relative,gitBlobHash(fs.readFileSync(path.join(ROOT,relative)))];
  }));
  return {version:VERSION,registeredSeedGroups:18,registeredArms:36,
    admissionOriginalRanks:admitted,originalRosterBlob:registration.sourceRosterBlob,
    registrationGitBlob:REGISTRATION_BLOB,pinnedVendor:registration.vendorPinned,
    sourceCodeBlobHashes:codeBlobHashes,legacyFrozenClosureStillValid:false,
    paperAndPolicyQualification:false};
}

/** Complete original-source developmental comparison; failures stay in denominator. */
function runReadiness({runner=null,pinNative=true}={}){
  const origin=preflight();
  const arms=scheduledArms();
  const run=runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  assert.equal(typeof run,'function');
  if(pinNative)require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(ROOT,profile);
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  const rows=[];
  const originalCalls=[];
  try {
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    for(let i=0;i<arms.length;i+=2){
      const group=arms.slice(i,i+2);
      assert.equal(group[0].rank,group[1].rank);
      assert.equal(group[0].seed,group[1].seed);
      let game;
      try {
        game=run({...profile.policyOptions,
          allowAdditionalOriginalSourceRanks:true,
          registeredTrials:group,
          registeredFrameName:VERSION+'-precommitted-seed-source-readiness'});
        assert.equal(game.attempted,2);
        assert.equal(game.rows.length,2);
        assert.deepEqual(game.rows.map(row=>row.trial.id),group.map(x=>x.id));
        rows.push(...game.rows);
        originalCalls.push({group:group[0].id.slice(0,group[0].id.lastIndexOf(':')),
          attempted:2,returned:2,runnerCompleted:true});
      }catch(error){
        // This is a driver-level failure BEFORE a complete 2-arm native return.
        // Do not mislabel it as two actual Store attempts or completed games.
        for(const trial of group)rows.push({
          trial, status:'source-driver-preflight-abort',
          nativeStoreAttemptConfirmed:false,untrustedNativeWinner:null,
          error:String(error?.message||error),code:error?.code??null,
          qualifiesForCompetitiveInference:false
        });
        originalCalls.push({group:group[0].id.slice(0,group[0].id.lastIndexOf(':')),
          attempted:0,returned:0,runnerCompleted:false,
          error:String(error?.message||error)});
      }
    }
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  assert.equal(rows.length,36);
  const counts={};
  for(const row of rows){
    const status=row.status??(row.finished===true?
      'untimed-engine-terminal':'native-action-cap-or-incomplete');
    counts[status]=(counts[status]??0)+1;
  }
  const nativeReturned=originalCalls.reduce((n,c)=>n+c.returned,0);
  return {version:VERSION,registration,preflight:origin,
    originalCalls,rows,registeredArms:36,preservedRows:rows.length,
    nativeReturnedArms:nativeReturned,nativeAttemptUnknownOrNotRun:36-nativeReturned,
    originalEngineStatuses:counts,
    allNineOriginalArchetypesTestedAtDriverLevel:true,
    originalPublishedSixties:29,missingOriginalRanks:[23,25,28],
    qualifiedCompetitiveGames:0,candidateWinRateCertified:false,
    caveat:'Unqualified original-store readiness probes, not a fresh paper-clock benchmark. Drive/printing failures are kept as non-attempts. Same seeds across different candidate decks do not certify paired source physical deals.'};
}

if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const report=inspect?preflight():runReadiness();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(!inspect&&report.nativeReturnedArms!==36)process.exitCode=2;
}

module.exports={VERSION,scheduledArms,preflight,runReadiness};
