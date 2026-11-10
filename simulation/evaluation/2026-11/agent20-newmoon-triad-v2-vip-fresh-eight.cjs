'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {executeArm,analyze}=
  require('./agent42-rank5-fresh-gengar-lillie-aba.cjs');
const {withActorBattleVipAfterPass}=
  require('../../twinleaf/agent9-battle-vip-owner-after-pass.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REG=path.join(ROOT,'results/aichi-2026/registrations',
  'agent20-newmoon-triad-v2-vip-fresh-eight-20261110.json');
const OUTPUT=path.join(ROOT,
  'artifacts/agent20-newmoon-triad-v2-vip-fresh-eight.json');
const hash=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @returns {{reg:object,engine:string}} Frozen input and actual engine revision. */
function preflight(){
  const reg=JSON.parse(fs.readFileSync(REG,'utf8'));
  assert.equal(reg.status,'FROZEN_BEFORE_FIRST_NATIVE_ATTEMPT');
  assert.equal(reg.observedTrialsBeforeRegistration,0);
  assert.equal(reg.noPosthocFiltering,true);
  assert.deepEqual(reg.seeds,
    [1321451920,1349573700,232912642,198442248]);
  assert.equal(reg.registeredTrials.length,8);
  assert.equal(reg.expectedNativeAttempts,24);
  assert.deepEqual(reg.modes.map(m=>m.preferNewMoonTriadV2Recipient),
    [false,true,false]);
  assert.ok(reg.registeredTrials.every(t=>t.rank===5&&
    t.candidateId==='new-moon-lockbreaker-v1'));
  assert.equal(new Set(reg.registeredTrials.map(t=>t.id)).size,8);
  const engine=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(engine,reg.pinnedTwinleaf);
  return {reg,engine};
}
/** Write the complete original-source attempt ledger under an exclusive lock. */
function save(value){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(tmp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
/** @returns {object} All A/B/A native contexts, including censored attempts. */
function main(){
  const {reg,engine}=preflight();
  const arms=reg.modes.map(mode=>{
    const extra=mode.preferNewMoonTriadV2Recipient?{
      actorVipAfterPassAdapter:(execute,deps)=>
        withActorBattleVipAfterPass(execute,{
          ...deps,preferNewMoonTriadV2Recipient:true
        })
    }:{};
    return executeArm(reg,{
      id:mode.id,
      bilateralGengarHorrorHouseTempo:true,
      bilateralGengarHorrorHouseMinOpponentHandCount:6
    },extra);
  });
  const comparison=analyze(arms);
  const activations=arms.map(arm=>({
    id:arm.id,attempts:arm.records.length,
    triadV2Searches:arm.records.reduce((n,row)=>
      n+(row.vipAfterPassAudit?.preferredNewMoonTriadV2Searches??0),0),
    acceptedNativeVipSearches:arm.records.reduce((n,row)=>
      n+(row.vipAfterPassAudit?.acceptedSearches??0),0),
    physicalBenchConfirmations:arm.records.reduce((n,row)=>
      n+(row.vipAfterPassAudit?.nativeBenchConfirmed??0),0)
  }));
  const result={
    schema:'agent20-newmoon-triad-v2-native-owner-vip-fresh-eight-v1',
    registration:reg,pinnedTwinleaf:engine,
    sourceOriginalPrintedSixtySha256:reg.sourceOriginalPrintedSixtySha256,
    newMoonPrintedSixtyUnchanged:true,
    paperQualifiedGames:0,qualifiedFieldWins:0,
    activations,comparison,arms,
    allAttemptIds:arms.flatMap(a=>a.records.map(r=>a.id+':'+r.id)),
    attemptLedgerSha256:hash(arms.map(a=>a.records.map(r=>({
      id:r.id,root:r.rootLedgerSha256,physical:r.physicalTapeSha256,
      finished:r.finished,winner:r.winner,error:r.error
    }))))
  };
  save(result);
  console.log('AGENT20_NEWMOON_TRIAD_V2_VIP',JSON.stringify({
    registeredAttempts:result.allAttemptIds.length,
    activations,matchedFull:comparison.matchedFull,
    matchedSource:comparison.matchedSource,
    repeatPhysical:comparison.identicalRepeatPhysical,
    completePairs:comparison.completedPairs,
    treatmentWinnerReversals:comparison.newCandidateNativeWinnerReversals,
    arms:arms.map(a=>({id:a.id,summary:a.summary})),
    pairs:comparison.pairs.map(p=>({
      id:p.id,sameFull:p.sameFull,sameSource:p.sameSource,
      repeatPhysicalIdentical:p.repeatPhysicalIdentical,
      controlWinner:p.control.winner,treatmentWinner:p.treatment.winner,
      controlCandidateAttacks:p.control.candidateAttacks.length,
      treatmentCandidateAttacks:p.treatment.candidateAttacks.length,
      firstActionDifference:p.firstActionDifference,
      firstPhysicalDifference:p.firstPhysicalDifference
    })),paperQualifiedGames:0
  }));
  assert.equal(result.allAttemptIds.length,24);
  return result;
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const {reg,engine}=preflight();
    console.log('AGENT20_TRIAD_V2_VIP_PREFLIGHT',
      JSON.stringify({caseId:reg.caseId,engine,
        seeds:reg.seeds,registeredContexts:reg.registeredTrials.length}));
  }else main();
}
module.exports={preflight,main};
