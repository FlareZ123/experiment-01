'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const registration=require('../../results/aichi-2026/registrations/agent41-nine-ready-ranks-18seeds-20261101.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {exactSourceFingerprint,assertPinnedNativeStore,
  assertNoUnreviewedAmbientAgentEnvironment}=
  require('./agent41-frozen-bilateral-development-v1.cjs');
const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
const {attestLoadedResearchModules}=
  require('./agent41-runtime-research-module-attestation.cjs');
const {frozenBilateralEvidenceMatrix}=
  require('./agent41-frozen-bilateral-evidence-matrix.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent41-nine-ready-ranks-frozen-public-special-scout-v1';
const REGISTRATION='results/aichi-2026/registrations/agent41-nine-ready-ranks-18seeds-20261101.json';
const REGISTRATION_GIT_BLOB='16bd8af48b6e70cb92e244e8c17786cc4e0efd43';
const ENTRY='simulation/evaluation/agent41-bilateral-v2-development.cjs';

/** Original source/seat/seed pairs, two unchanged candidate sixties each. */
function scheduledArms(){
  assert.deepEqual(registration.ranks,[3,4,6,7,10,11,21,24,29]);
  assert.equal(registration.seedGroups,18);
  assert.equal(registration.nativeAttempts,36);
  assert.equal(registration.pinnedTwinleaf,profile.pinnedVendorRevision);
  assert.equal(registration.sourceClosureSha256,profile.sourceClosureSha256);
  const groups=new Set(),trials=[];
  for(const row of registration.seeds){
    assert.ok(registration.ranks.includes(row.rank));
    assert.ok(registration.candidateSlots.includes(row.candidateSlot));
    assert.equal(row.repeat,0);
    assert.ok(Number.isSafeInteger(row.seed)&&
      row.seed>=0&&row.seed<=0xffffffff);
    const group=[row.rank,row.repeat,row.candidateSlot].join(':');
    assert.ok(!groups.has(group),'Duplicate original-source seed group');
    groups.add(group);
    for(const candidateId of registration.candidateIds)
      trials.push({...row,candidateId,id:group+':'+candidateId});
  }
  assert.equal(groups.size,18);
  assert.equal(trials.length,36);
  for(const rank of registration.ranks)
    assert.equal(trials.filter(row=>row.rank===rank).length,4);
  return trials;
}

/**
 * Confirm published exact printed-sixties and frozen native research code
 * before any true native game. Static dynamic-import limitations are retained.
 * @param {string} [root]
 */
function preflight(root=ROOT){
  assert.equal(gitBlobHash(fs.readFileSync(path.join(root,REGISTRATION))),
    REGISTRATION_GIT_BLOB,'Registered seeds were modified');
  const provenance=exactSourceFingerprint(root,profile);
  assert.equal(provenance.sourceClosureSha256,
    registration.sourceClosureSha256);
  assert.equal(provenance.originalRosterGitBlobSha,
    registration.sourceRosterGitBlobSha);
  return {version:VERSION,registrationGitBlobSha:REGISTRATION_GIT_BLOB,
    trials:scheduledArms().length,sourceRanks:registration.ranks,
    provenance,competitiveQualified:false};
}

/** Genuine 36-arm original-source research-policy discovery scout. */
function runScout(){
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  const provenance=preflight();
  assertPinnedNativeStore(ROOT,profile);
  const prior={};
  for(const [key,value] of Object.entries(
    profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const data=runDevelopment({
      ...profile.policyOptions,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION+'-unscreened-native-seeds'
    });
    const output={
      version:VERSION,registration,profile,
      originalSourceRanks:registration.ranks,
      expectedAttempts:registration.nativeAttempts,
      attempted:data.attempted,
      attemptedComplete:data.attempted===registration.nativeAttempts&&
        data.rows.length===registration.nativeAttempts,
      provenance,
      runtimeResearchAttestation:attestLoadedResearchModules(
        ROOT,auditSourceClosure(ROOT,[ENTRY])),
      researchHeadCommit:process.env.GITHUB_SHA??null,
      rows:data.rows,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Developmental native original-source policy-scope probe only, no 25-minute tournament clock, universal prompt legality or competitive bot certification.'
    };
    output.matrix=frozenBilateralEvidenceMatrix(output);
    return output;
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const result=inspect?preflight():runScout();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!inspect&&!result.attemptedComplete)process.exitCode=1;
}

module.exports={VERSION,scheduledArms,preflight,runScout};
