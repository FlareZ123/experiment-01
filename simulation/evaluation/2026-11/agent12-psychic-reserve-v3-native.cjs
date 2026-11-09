'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reg=require('../../../results/aichi-2026/registrations/agent12-psychic-reserve-v3-prospective-20261109.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const v1=require('../../../results/aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json');
const v2=require('../../../results/aichi-2026/candidate-iron-thorns-psychic-reserve-v3.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {compare}=require('./agent12-psychic-reserve-v3-compare.cjs');
const {gitBlob}=require('./agent12-thorns-fixed60-eight-rank-native.cjs');
const OUT=path.resolve(__dirname,'../../../agent12-psychic-reserve-v3-native.json');

/** Fail closed on the exact preregistered cards, native revision and policy. */
function verify(){
  assert.equal(reg.schema,
    'agent12-second-psychic-reserve-v3-versus-safeguard-v1-prospective-v1');
  assert.equal(reg.status,'FROZEN BEFORE ANY NATIVE GAME');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.groups.length,24);
  assert.equal(new Set(reg.groups.map(g=>g.seed)).size,24);
  assert.equal(reg.expectedNativeAttempts,48);
  assert.equal(reg.rootCap,360);
  for(const d of [v1,v2])assert.equal(d.cards.reduce((n,c)=>n+c.count,0),60);
  const m=deck=>new Map(deck.cards.map(c=>[c.name,c.count]));
  const a=m(v1),b=m(v2);
  const delta=[...new Set([...a.keys(),...b.keys()])]
    .filter(name=>(a.get(name)||0)!==(b.get(name)||0))
    .map(name=>({name,control:a.get(name)||0,reserve:b.get(name)||0}))
    .sort((x,y)=>x.name.localeCompare(y.name));
  assert.deepEqual(delta,[
    {name:"Player's Ceremony",control:1,reserve:0},
    {name:'Psychic Energy',control:1,reserve:2}
  ]);
  for(const source of reg.policyCodeBlobs)
    assert.equal(gitBlob(source.path),source.blob,
      'Owner policy was modified since preregistration: '+source.path);
  for(const batch of reg.batches)
    validateRegisteredTrialGroups(batch.registeredTrials,
      reg.sourceRanks,false,true);
  return true;
}

/** Atomic one-writer artifact publication for both native 24-game batches. */
function archive(report){
  const lock=OUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const fd2=fs.openSync(tmp,'r');
    try{fs.fsyncSync(fd2)}finally{fs.closeSync(fd2)}
    fs.renameSync(tmp,OUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  verify();
  const before={
    pilot:process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV,
    payment:process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV
  };
  process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV='true';
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const batches=[],audits=[];
  try{
    for(const batch of reg.batches){
      const native=withPaperSemanticsProfileV1(()=>runDevelopment({
        ...frozen.policyOptions,...reg.commonActorOptions,
        registeredTrials:batch.registeredTrials,
        registeredCandidateDecks:{
          'iron-thorns-mimikyu-safeguard-v1':{
            label:'iron-thorns-mimikyu-safeguard-v1',cards:v1.cards},
          'iron-thorns-mimikyu-psychic-reserve-v3':{
            label:'iron-thorns-mimikyu-psychic-reserve-v3',cards:v2.cards}
        },
        registeredFrameName:reg.schema+':'+batch.candidateId,
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        allowExtendedRegisteredNativeRootCap:true,
        nativeRootActionLimit:reg.rootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true
      }),reg.profileEnabled);
      assert.equal(native.result.attempted,24);
      batches.push(native.result);
      audits.push(native.audit);
    }
  }finally{
    for(const [key,value] of [
      ['AGENT12_TEMPLE_THORNS_OWNER_DEV',before.pilot],
      ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV',before.payment]]){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const comparison=compare(batches[0],batches[1],reg);
  const result={
    schema:reg.schema,registered:reg,
    armDescriptions:{v1:"Shared Mimikyu policy with one Basic Psychic and Player's Ceremony",
      v3:"Same shared policy with two Basic Psychic and no Player's Ceremony"},
    enginePin:PINNED_TWINLEAF,revision:process.env.GITHUB_SHA??null,
    pilotEnvEnabledIdenticallyBothArms:true,
    correctionAudits:audits,
    comparison,actualNativeRuns:batches,competitivelyQualifiedGames:0,
    caveat:'Native Store acceptance and selective printed payment receipts do not qualify paper legality, strategy or the official event clock.'
  };
  archive(result);
  process.stdout.write('AGENT12_PSYCHIC_RESERVE '+JSON.stringify({
    summary:comparison.summary,field:comparison.field,byRank:comparison.byRank,
    artifact:path.basename(OUT)
  })+'\n');
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify({verified:verify(),
      groups:reg.groups.length,rootCap:reg.rootCap})+'\n');
  else run();
}
module.exports={verify,run};
