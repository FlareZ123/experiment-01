'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/agent12-temple-mimikyu-versus-safeguard-fresh-20261109.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const v1=require('../../../results/aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json');
const v2=require('../../../results/aichi-2026/candidate-iron-thorns-temple-mimikyu-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {gitBlob,compact,pairedContribution}=
  require('./agent12-thorns-fixed60-eight-rank-native.cjs');
const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'agent12-temple-mimikyu-native.json');

/** Structural test for exactly one tactical Stadium change between 60s. */
function verify(){
  assert.equal(reg.schema,
    'agent12-temple-v2-versus-safeguard-v1-fresh-original-thorns-focus-v1');
  assert.equal(reg.status,'FROZEN PRIOR TO NATIVE EXECUTION');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.groups.length,24);
  assert.equal(reg.expectedNativeAttempts,48);
  assert.equal(new Set(reg.groups.map(g=>g.seed)).size,24);
  for(const d of [v1,v2])assert.equal(
    d.cards.reduce((n,c)=>n+c.count,0),60);
  const nameCount=deck=>new Map(deck.cards.map(c=>[c.name,c.count]));
  const a=nameCount(v1),b=nameCount(v2);
  const names=new Set([...a.keys(),...b.keys()]);
  const changes=[...names].filter(n=>(a.get(n)||0)!==(b.get(n)||0))
    .map(name=>({name,original:a.get(name)||0,temple:b.get(name)||0}))
    .sort((x,y)=>x.name.localeCompare(y.name));
  assert.deepEqual(changes,[
    {name:"Player's Ceremony",original:1,temple:0},
    {name:'Temple of Sinnoh',original:0,temple:1}
  ]);
  for(const file of reg.frozenBlobs)
    assert.equal(gitBlob(file.path),file.blob,'Frozen upstream changed: '+file.path);
  for(const batch of reg.batches)
    validateRegisteredTrialGroups(batch.registeredTrials,
      reg.sourceRanks,false,true);
  return {changes};
}

/** Public settled actions by owner; no hidden deck/Prize reads or in-game intervention. */
function compactNative(row){
  const x=compact(row);
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const attacks=row.candidateAttackSettlement?.attacks??[];
  const sourceAttacks=row.sourceAttackSettlement?.attacks??[];
  const templePlays=roots.filter(y=>y.playerSlot===x.candidateSeat&&
    y.action==='PlayCardAction'&&y.card==='Temple of Sinnoh');
  const sourceVolt=sourceAttacks.filter(y=>y.attackName==='Volt Cyclone');
  return {...x,
    templeNativePlayRoots:templePlays.map(y=>({
      turn:y.turnBefore,ordinal:y.actionOrdinal,action:y.action,card:y.card
    })),
    ghostEyeDeclared:attacks.filter(y=>y.attackName==='Ghost Eye').length,
    ghostEyeSettled:attacks.filter(y=>y.attackName==='Ghost Eye'&&
      y.settledPromptChain).length,
    voltCycloneDeclared:attacks.filter(y=>y.attackName==='Volt Cyclone').length,
    sourceVoltCycloneDeclared:sourceVolt.length,
    sourceAttacksDeclared:sourceAttacks.length,
    // Observation of an opponent Pass after Temple is never enough on its
    // own to attribute attack denial without a real payable-attack witness.
    sourcePassesAfterFirstTemple:templePlays.length?roots.filter(y=>
      y.playerSlot===x.sourceSeat&&y.action==='PassTurnAction'&&
      y.actionOrdinal>templePlays[0].actionOrdinal).length:0
  };
}

/** Partial identification and gameplay for all 24 frozen source groups. */
function compare(left,right){
  assert.equal(left.rows.length,24);
  assert.equal(right.rows.length,24);
  const groups=reg.groups.map((regRow,index)=>{
    const a=compactNative(left.rows[index]);
    const b=compactNative(right.rows[index]);
    const matched=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&a.actualStarterSeat===b.actualStarterSeat);
    return {
      groupId:[regRow.rank,regRow.repeat,regRow.candidateSlot].join(':'),
      rank:regRow.rank,seed:regRow.seed,seat:regRow.candidateSlot,
      physicalSourceMatched:matched,
      bothTerminal:a.candidateWins!==null&&b.candidateWins!==null,
      sharpDelta:matched?
        pairedContribution(a.candidateWins,b.candidateWins):null,
      safeguardV1:a,templeV2:b
    };
  });
  const matched=groups.filter(g=>g.physicalSourceMatched);
  const summary=arr=>({
    wins:arr.filter(x=>x.candidateWins===1).length,
    losses:arr.filter(x=>x.candidateWins===0).length,
    caps:arr.filter(x=>x.nativeDisposition==='right-censored').length,
    errors:arr.filter(x=>x.nativeDisposition==='engine-error').length,
    otherUnresolved:arr.filter(x=>x.candidateWins===null&&
      !['right-censored','engine-error'].includes(x.nativeDisposition)).length,
    templePlays:arr.reduce((n,x)=>n+x.templeNativePlayRoots.length,0),
    ghostEyeSettled:arr.reduce((n,x)=>n+x.ghostEyeSettled,0),
    ghostEyeDeclared:arr.reduce((n,x)=>n+x.ghostEyeDeclared,0),
    voltCycloneDeclared:arr.reduce((n,x)=>n+x.voltCycloneDeclared,0),
    sourceVoltCycloneDeclared:arr.reduce((n,x)=>n+x.sourceVoltCycloneDeclared,0),
    sourcePassesAfterFirstTemple:arr.reduce((n,x)=>
      n+x.sourcePassesAfterFirstTemple,0)
  });
  const byRank=reg.sourceRanks.map(rank=>{
    const g=groups.filter(x=>x.rank===rank);
    const a=summary(g.map(x=>x.safeguardV1));
    const b=summary(g.map(x=>x.templeV2));
    return {rank,groups:g.length,
      physicallyMatched:g.filter(x=>x.physicalSourceMatched).length,
      doubleTerminalMatched:g.filter(x=>x.physicalSourceMatched&&x.bothTerminal).length,
      v1:a,v2:b};
  });
  return {
    summary:{
      sourceGroups:groups.length,nativeAttempts:groups.length*2,
      matchedSourceDeals:matched.length,
      bothTerminalMatched:matched.filter(x=>x.bothTerminal).length,
      sharpTempleMinusSafeguardNativeWins:{
        low:matched.reduce((n,x)=>n+x.sharpDelta.low,0),
        high:matched.reduce((n,x)=>n+x.sharpDelta.high,0)
      },
      firstMirrorsSourceGroups:groups.filter(x=>[6,24,29].includes(x.rank)).length,
      paperCompetitiveGames:0
    },
    field:[
      {candidateId:reg.candidateIds[0],...summary(groups.map(x=>x.safeguardV1))},
      {candidateId:reg.candidateIds[1],...summary(groups.map(x=>x.templeV2))}
    ],
    byRank,groups
  };
}

/** Lock and publish complete native artifact atomically. */
function archive(output){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
    const r=fs.openSync(temp,'r');
    try{fs.fsyncSync(r)}finally{fs.closeSync(r)}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/** Execute 48 preregistered original-60 Store games under common policy. */
function run(){
  const preflight=verify();
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
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
          'iron-thorns-mimikyu-temple-v2':{
            label:'iron-thorns-mimikyu-temple-v2',cards:v2.cards}
        },
        registeredFrameName:reg.schema+':'+batch.candidateId,
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        nativeRootActionLimit:reg.rootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true
      }),reg.profileEnabled);
      assert.equal(native.result.attempted,24);
      batches.push(native.result);
      audits.push(native.audit);
    }
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  const comparison=compare(...batches);
  const output={
    schema:reg.schema,registration:reg,
    candidatePrintedSixties:{safeguardV1:v1,templeV2:v2},
    preflight,engine:PINNED_TWINLEAF,revision:process.env.GITHUB_SHA??null,
    correctionAudits:audits,comparison,
    rawNativeRuns:batches,competitivelyQualifiedGames:0,
    caveat:'Developmental native policy, no qualified opponent policy or Japanese paper clock. Temple roots do not alone prove denied attacks.'
  };
  archive(output);
  process.stdout.write('AGENT12_TEMPLE_V2 '+JSON.stringify({
    summary:comparison.summary,field:comparison.field,byRank:comparison.byRank,
    output:path.basename(OUTPUT)
  })+'\n');
  return output;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify({preflight:verify(),
      groups:reg.groups.length,attempts:reg.expectedNativeAttempts})+'\n');
  else run();
}
module.exports={verify,compactNative,compare,run};
