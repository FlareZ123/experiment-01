'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent16-original-rank1-shadow-rider-20261101.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent16-original-rank1-shadow-rider-eight-arm-native-development-v1';
const REGISTRATION='results/aichi-2026/registrations/agent16-original-rank1-shadow-rider-20261101.json';
const REGISTRATION_BLOB='5da0197fb8bf3c83911a1a9e0629ddd224af7458';
const PROFILE='simulation/evaluation/agent41-frozen-bilateral-development-v2.json';
const PROFILE_BLOB='a79e7977cb224928068968934bbcfa9c9410e20a';

function gitBlob(buffer){
  return createHash('sha1').update('blob '+buffer.length+'\0')
    .update(buffer).digest('hex');
}

/** Each original source seed/seat is paired with both unchanged candidate 60s. */
function scheduledArms(){
  assert.equal(registration.schema,'agent16-original-rank1-shadow-rider-bilateral-develop-v1');
  assert.equal(registration.seedGroups,4);
  assert.equal(registration.attemptedNativeArms,8);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.pinnedVendorRevision,profile.pinnedVendorRevision);
  const groups=new Set();
  const trials=[];
  for(const row of registration.seeds){
    assert.equal(row.rank,1);
    assert.ok(row.repeat===0||row.repeat===1);
    assert.ok(row.candidateSlot==='A'||row.candidateSlot==='B');
    assert.ok(Number.isSafeInteger(row.seed)&&
      row.seed>=0&&row.seed<=0xffffffff);
    const group=[row.rank,row.repeat,row.candidateSlot].join(':');
    assert.ok(!groups.has(group));
    groups.add(group);
    for(const candidateId of registration.candidateIds){
      trials.push({...row,candidateId,id:group+':'+candidateId});
    }
  }
  assert.equal(groups.size,4);
  assert.equal(trials.length,8);
  assert.deepEqual([...groups].sort(),['1:0:A','1:0:B','1:1:A','1:1:B']);
  return trials;
}

/** File/printing checks independent of the native card engine. */
function preflight(root=ROOT){
  assert.equal(gitBlob(fs.readFileSync(path.join(root,REGISTRATION))),
    REGISTRATION_BLOB,'Preregistered physical seeds changed');
  assert.equal(gitBlob(fs.readFileSync(path.join(root,PROFILE))),
    PROFILE_BLOB,'Source two-seat policy option profile changed');
  const rosterFile=fs.readFileSync(path.join(root,registration.originalSourceRoster));
  assert.equal(gitBlob(rosterFile),registration.originalSourceRosterGitBlobSha,
    'Authenticated original-source roster changed');
  const roster=JSON.parse(rosterFile);
  const original=roster.decks.find(x=>x.rank===1);
  assert.equal(original?.archetype,registration.archetype);
  assert.equal(original.cards.reduce((s,c)=>s+c.count,0),60);
  assert.equal(original.cards.find(x=>x.name==='Shadow Rider Calyrex V'
    &&x.printing.set==='CRE'&&String(x.printing.number)==='74')?.count,3);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.bilateralPublicContextSpecialEnergy,true);
  assert.equal(profile.policyOptions.physicalZoneGate,true);
  return {
    version:VERSION,
    registrationBlobSha:REGISTRATION_BLOB,
    policyOptionsBlobSha:PROFILE_BLOB,
    originalRosterBlobSha:registration.originalSourceRosterGitBlobSha,
    originalRank:1,originalArchetype:original.archetype,
    originalPrintedCardCount:60,sourceCoverage:'one additional authenticated archetype',
    trialCount:scheduledArms().length,competitiveQualified:false
  };
}

/** Actual pinned two-seat games; failures/caps kept as separate rows. */
function run(){
  const inspected=preflight();
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
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
    const statuses={};
    for(const row of rows){
      const name=row.status??'missing-native-status';
      statuses[name]=(statuses[name]??0)+1;
    }
    const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
    const closure=auditSourceClosure(ROOT,[
      'simulation/evaluation/agent41-bilateral-v2-development.cjs'
    ]);
    return {
      version:VERSION,inspected,registration,profileSchema:profile.schema,
      sourceClosureSha256:closure.digest,
      sourceClosureLimitations:closure.limitations,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      enginePin:profile.pinnedVendorRevision,
      attempted:observed.attempted,expectedAttempts:8,
      complete:observed.attempted===8&&rows.length===8,
      statuses,rows,
      paired:observed.paired??null,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Development discovery only. No independent paper-prompt verdict, Aichi clock, source-policy competency, or tournament win-rate certification. Identical seed does not make a distinct candidate 60 produce an identical physical deal.'
    };
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  const output=process.argv.includes('--inspect-only')?preflight():run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!process.argv.includes('--inspect-only')&&!output.complete)process.exitCode=1;
}

module.exports={VERSION,scheduledArms,preflight,run};
