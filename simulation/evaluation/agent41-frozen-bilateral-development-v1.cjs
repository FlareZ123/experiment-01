'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const profile=require('./agent41-frozen-bilateral-development-v1.json');
const registration=require('../../results/aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json');
const {gitBlobHash,assertInventoryUnchanged}=
  require('./agent42-strict-profile-preflight.cjs');
const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');

const VERSION='agent41-frozen-bilateral-development-v1';
const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=profile.registration;
const ENTRY='simulation/evaluation/agent41-bilateral-v2-development.cjs';

/** @param {object} env */
function assertNoUnreviewedAmbientAgentEnvironment(env){
  assert.ok(env&&typeof env==='object');
  const ambient=Object.keys(env).filter(key=>
    /^AGENT(?:[0-9]+|_)/.test(key)&&env[key]!==undefined);
  assert.deepEqual(ambient,profile.permittedAmbientAgentEnvironment,
    'Ambient AGENT policy override would change the frozen development profile');
  return ambient;
}

/** @param {string} root */
function exactSourceFingerprint(root){
  const inventory=assertInventoryUnchanged(root);
  const registrationBytes=fs.readFileSync(path.join(root,REGISTRATION));
  const rosterBytes=fs.readFileSync(path.join(root,profile.originalRoster));
  assert.equal(gitBlobHash(registrationBytes),profile.registrationGitBlobSha,
    'Preregistered seed source changed');
  assert.equal(gitBlobHash(rosterBytes),profile.originalRosterGitBlobSha,
    'Original printed source-60 roster changed');
  const closure=auditSourceClosure(root,[ENTRY]);
  return {
    inventory,
    registrationGitBlobSha:gitBlobHash(registrationBytes),
    originalRosterGitBlobSha:gitBlobHash(rosterBytes),
    profileGitBlobSha:gitBlobHash(fs.readFileSync(path.join(root,
      'simulation/evaluation/agent41-frozen-bilateral-development-v1.json'))),
    sourceClosureSha256:closure.digest,
    recursiveFileCount:closure.files.length,
    recursiveEnvironmentKeyCount:closure.keys.length,
    unreviewedEnvironmentKeys:closure.keys.filter(k=>
      !require('./agent42-strict-switch-inventory-v1.json').keys.includes(k)),
    unresolvedLexicalImportCount:closure.limitations.dynamicRequireSites.length,
    unresolvedComputedEnvCount:closure.limitations.computedEnvSites.length,
    unresolvedUnclassifiedEnvCount:closure.limitations.unclassifiedEnvSites.length,
    unresolvedRelativeImports:closure.limitations.missingRelativeImports
  };
}

/** @returns {object[]} One registered exact seed per both-candidate physical pair. */
function registeredTrials(){
  assert.equal(registration.enginePin,profile.pinnedVendorRevision);
  assert.equal(registration.independentPhysicalPairs,profile.seedGroups);
  assert.equal(registration.attemptedNativeArms,profile.scheduledNativeArms);
  const trials=[];
  const groups=new Set();
  for(const row of registration.flatPredictions){
    assert.ok([6,11].includes(row.rank));
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(Number.isInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
    const group=[row.rank,row.repeat,row.candidateSlot].join(':');
    assert.ok(!groups.has(group),'Duplicate registered physical pair');
    groups.add(group);
    assert.equal(registration.seeds[String(row.rank)][row.candidateSlot][row.repeat],row.seed);
    for(const candidateId of registration.candidateIds){
      trials.push({
        id:group+':'+candidateId,rank:row.rank,repeat:row.repeat,
        candidateSlot:row.candidateSlot,candidateId,seed:row.seed
      });
    }
  }
  assert.equal(groups.size,profile.seedGroups);
  assert.equal(trials.length,profile.scheduledNativeArms);
  return trials;
}

/** @param {string} root */
function assertPinnedNativeStore(root){
  const installed=execFileSync('git',['-C',
    path.join(root,profile.vendorSubmodulePath),'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  assert.equal(installed,profile.pinnedVendorRevision,
    'Running a different native Store revision');
  return installed;
}

/**
 * This is a precompetitive implementation exercise: it records every
 * preregistered arm, failure, cap and source/candidate policy mismatch.
 * @param {object} [overrides]
 */
function runFrozenDevelopment(overrides={}){
  const root=overrides.root??ROOT;
  const env=overrides.env??process.env;
  assertNoUnreviewedAmbientAgentEnvironment(env);
  const provenance=exactSourceFingerprint(root);
  assert.ok(typeof profile.sourceClosureSha256==='string'&&
    profile.sourceClosureSha256.length===64,
    'Transitive source digest must be pinned before executing registered games');
  assert.equal(provenance.sourceClosureSha256,profile.sourceClosureSha256,
    'Transitive actor/source code differs from frozen development profile');
  assertPinnedNativeStore(root);
  const trials=registeredTrials();
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const result=runDevelopment({
      ...profile.policyOptions,registeredTrials:trials,
      registeredFrameName:VERSION+'-agent16-balanced-native-seeds'
    });
    const rows=Array.isArray(result.rows)?result.rows:[];
    const statuses={};
    for(const row of rows){
      const key=row.status??(row.finished===true?'engine-terminal':'censored');
      statuses[key]=(statuses[key]??0)+1;
    }
    return {
      version:VERSION,profile,provenance,
      nativePin:profile.pinnedVendorRevision,
      attempted:result.attempted,
      expectedAttempts:profile.scheduledNativeArms,
      attemptedComplete:result.attempted===profile.scheduledNativeArms&&
        rows.length===profile.scheduledNativeArms,
      statuses,rows,
      sourceComparison:result.paired??null,
      actualCoinAndFirstDrawVerified:false,
      transitiveImportsCompletelyResolved:false,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Development only: native coin/choice receipt, full actor information safety, paper timing and policy competence are not certified.'
    };
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const output=inspect?
    {version:VERSION,profileStatus:profile.status,
      source:exactSourceFingerprint(ROOT),registeredTrialCount:registeredTrials().length,
      qualified:false}:
    runFrozenDevelopment();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!inspect&&!output.attemptedComplete)process.exitCode=1;
}

module.exports={VERSION,registeredTrials,assertNoUnreviewedAmbientAgentEnvironment,
  exactSourceFingerprint,assertPinnedNativeStore,runFrozenDevelopment};
