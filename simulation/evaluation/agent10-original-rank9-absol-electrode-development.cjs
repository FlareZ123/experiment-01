'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent16-eight-missing-original-archetypes-20261101.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {summarizeEight}=require('./agent16-original-rank1-shadow-rider-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent10-original-rank9-absol-electrode-native-development-v1';
const REGISTRATION='results/aichi-2026/registrations/agent16-eight-missing-original-archetypes-20261101.json';
const REGISTRATION_BLOB='e15578d7863422c6f4bd9df751d45b1b7044f904';

/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/** Use only independently preregistered original rank9 physical seat groups. */
function scheduledArms(){
  assert.equal(registration.schema,
    'agent16-eight-missing-cross-archetype-native-discovery-v1');
  assert.equal(registration.nativeAttempts,32);
  assert.equal(registration.seedGroups,16);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  const registered=registration.seeds.filter(x=>x.rank===9);
  assert.equal(registered.length,2);
  const seats=new Set(),trials=[];
  for(const row of registered){
    assert.equal(row.repeat,0);
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
    assert.ok(!seats.has(row.candidateSlot),'Duplicate candidate physical seat');
    seats.add(row.candidateSlot);
    const group=[row.rank,row.repeat,row.candidateSlot].join(':');
    for(const candidateId of registration.candidateIds)
      trials.push({...row,candidateId,id:group+':'+candidateId});
  }
  assert.deepEqual([...seats].sort(),['A','B']);
  assert.deepEqual(registered.map(x=>x.seed),[3060075246,690229661]);
  assert.equal(trials.length,4);
  return trials;
}

/** Immutable source, policy and key printed card checks, before native Store. */
function preflight(root=ROOT){
  assert.equal(gitBlob(fs.readFileSync(path.join(root,REGISTRATION))),
    REGISTRATION_BLOB,'The previously published source seed register changed');
  assert.equal(registration.sourceRosterGitBlobSha,
    'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.equal(registration.nativeDevelopmentProfileGitBlobSha,
    'a79e7977cb224928068968934bbcfa9c9410e20a');
  assert.equal(gitBlob(fs.readFileSync(path.join(root,registration.sourceRosterPath))),
    registration.sourceRosterGitBlobSha,'Published original 60s changed');
  assert.equal(gitBlob(fs.readFileSync(path.join(root,registration.nativeDevelopmentProfile))),
    registration.nativeDevelopmentProfileGitBlobSha,'Frozen policy changed');
  assert.equal(registration.pinnedTwinleaf,profile.pinnedVendorRevision);
  const roster=JSON.parse(fs.readFileSync(
    path.join(root,registration.sourceRosterPath),'utf8'));
  assert.equal(roster.published_deck_count,29);
  const original=roster.decks.find(x=>x.rank===9);
  assert.equal(original?.player,'Shun Ito');
  assert.equal(original.archetype,'Absol Electrode');
  assert.equal(original.cards.reduce((sum,c)=>sum+c.count,0),60);
  for(const [name,set,number,count] of [
    ['Unown','AOR','30',4],
    ['Voltorb','ROS','21',1],
    ['Electrode-GX','CES','48',2],
    ['Mega Absol ex','MEG','86',1],
    ['Prism Energy','ASC','216',4]
  ]){
    assert.equal(original.cards.find(c=>c.name===name&&
      c.printing.set===set&&String(c.printing.number)===number)?.count,count,
      'Key printed source identity drift: '+name);
  }
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.bilateralPublicContextSpecialEnergy,true);
  assert.equal(profile.policyOptions.physicalZoneGate,true);
  return {
    version:VERSION,originalRank:9,originalArchetype:original.archetype,
    sourcePrintingCount:60,preregisteredSourceSeedBlobSha:REGISTRATION_BLOB,
    sourceRosterBlobSha:registration.sourceRosterGitBlobSha,
    policyBlobSha:registration.nativeDevelopmentProfileGitBlobSha,
    nativeAttemptCount:4,sourcePolicyQualified:false,
    paperPromptQualified:false,competitiveQualified:false
  };
}

/** Genuine pinned Store, common bilateral policy; preserve all errors and caps. */
function run(){
  const inspected=preflight();
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const {planAichi}=require('./aichi-pilot.cjs');
  const plan=planAichi(9,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const original=plan.opponents.find(x=>x.rank===9);
  assert.equal(original?.status,'ready','Pinned original rank9 60 is unavailable');
  assert.equal(original.cards.length,60);
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const observed=runDevelopment({
      ...profile.policyOptions,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION
    });
    const rows=observed.rows??[];
    const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
    const closure=auditSourceClosure(ROOT,[
      'simulation/evaluation/agent41-bilateral-v2-development.cjs'
    ]);
    return {
      version:VERSION,inspected,registration,
      sourcePrintingProxyCount:original.substitutions.length,
      sourcePrintingProxies:original.substitutions,
      sourceClosureSha256:closure.digest,
      sourceClosureLimitations:closure.limitations,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      enginePin:profile.pinnedVendorRevision,
      attempted:observed.attempted,expectedAttempts:4,
      complete:observed.attempted===4&&rows.length===4,
      ...summarizeEight(rows),rows,paired:observed.paired??null,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Four native developmental attempts for one new authentic source archetype; no claim of paper prompt fidelity, viable source choice policy, official clock, fixed-60 superiority or qualified wins. Retain missing/aborted/capped outcomes. Different candidate 60s may yield different physical deals even with the same 32-bit seed.'
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
  const output=inspect?preflight():run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!inspect&&!output.complete)process.exitCode=1;
}
module.exports={VERSION,scheduledArms,preflight,run};
