'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {executeArm,analyze}=
  require('./agent42-rank5-fresh-gengar-lillie-aba.cjs');
const {withActorBattleVipAfterPass}=
  require('../../twinleaf/agent9-battle-vip-owner-after-pass.cjs');
const {withEarlyGengarFogPsychicEnergy}=
  require('../../twinleaf/2026-11/agent20-fog-psychic-energy-priority.cjs');
const ROOT=path.resolve(__dirname,'../../..');
const REG=path.join(ROOT,'results/aichi-2026/registrations',
  'agent20-newmoon-fog-psychic-posthoc-8303A-20261110.json');
const OUTPUT=path.join(ROOT,
  'artifacts/agent20-newmoon-fog-psychic-posthoc-8303A.json');

/** Reconstruct exactly one already inspected physical v1 trial. */
function preflight(){
  const reg=JSON.parse(fs.readFileSync(REG,'utf8'));
  assert.equal(reg.status,'POSTHOC_ENGINEERING_REGRESSION');
  assert.equal(reg.competitiveInference,false);
  assert.equal(reg.historicalCase,'5:8303:A:new-moon-lockbreaker-v1');
  assert.equal(reg.seed,232912642);
  assert.equal(reg.registeredTrial.id,reg.historicalCase);
  const old=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/registrations',
    reg.sourceFreeze),'utf8'));
  assert.ok(old.registeredTrials.some(t=>t.id===reg.historicalCase&&
    t.seed===reg.seed));
  assert.equal(old.sourceOriginalPrintedSixtySha256,
    reg.sourceOriginalPrintedSixtySha256);
  const engine=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(engine,reg.pinnedTwinleaf);
  return {reg,engine};
}
/** Exclusive atomic evidence output. */
function save(value){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
/** A same-physical-deal developmental replay, never a prospective game. */
function main(){
  const {reg,engine}=preflight();
  const scaffold={
    nativeRootCap:320,
    registeredTrials:[reg.registeredTrial]
  };
  const modes=reg.modes.map((id,i)=>({
    id,preferred:i===1
  }));
  const arms=modes.map(m=>executeArm(scaffold,{
    id:m.id,bilateralGengarHorrorHouseTempo:true,
    bilateralGengarHorrorHouseMinOpponentHandCount:6
  },{
    actorVipAfterPassAdapter:(execute,deps)=>
      withActorBattleVipAfterPass(execute,{
        ...deps,preferNewMoonTriadV2Recipient:true
      }),
    ...(m.preferred?{
      actorFogPromptAdapter:withEarlyGengarFogPsychicEnergy
    }:{})
  }));
  const compared=analyze(arms);
  const activation=arms.map(a=>({
    arm:a.id,acceptedVipSearches:a.records[0].vipAfterPassAudit?.
      acceptedSearches??0,
    triadV2Selections:a.records[0].vipAfterPassAudit?.
      preferredNewMoonTriadV2Searches??0,
    chosenPrintings:a.records[0].vipAfterPassAudit?.
      examples?.filter(x=>x.kind==='vip-search').map(x=>x.printings)??[],
    ownerFogSearches:a.records[0].fogAudit?.events?.
      filter(x=>x.kind==='fog-search'&&
        x.seat===a.records[0].candidateSeat).map(x=>x.chosen)??[],
    ownerFogPhysicalCardPlays:a.records[0].fogAudit?.
      postSearchPhysicalCardPlays??0,
    candidateNativeWinner:a.records[0].winner===
      a.records[0].candidateSeat
  }));
  const result={
    schema:'agent20-newmoon-fog-psychic-known-Gengar-energy-replay-v1',
    registration:reg,engine,arms,activation,compared,
    paperQualifiedGames:0,preselectedAfterObservingV1:true
  };
  save(result);
  console.log('AGENT20_GENGAR_FOG_PSYCHIC_POSTHOC',JSON.stringify({
    activation,comparison:compared,arms:arms.map(a=>({
      id:a.id,summary:a.summary
    })),paperQualifiedGames:0
  }));
  assert.equal(arms.length,3);
  assert.equal(compared.matchedFull,1);
  assert.equal(compared.matchedSource,1);
  assert.equal(compared.identicalRepeatPhysical,1);
  return result;
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const {reg,engine}=preflight();
    console.log('AGENT20_GENGAR_FOG_KNOWN_PREFLIGHT',
      JSON.stringify({id:reg.historicalCase,engine,posthoc:true}));
  }else main();
}
module.exports={preflight,main};
