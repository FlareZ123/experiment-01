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
  'agent20-newmoon-perfection-attack-fuel-fresh-eight-20261112.json');
const OUTPUT=path.join(ROOT,
  'artifacts/agent20-newmoon-perfection-attack-fuel-fresh-eight.json');
const hash=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @returns {{reg:object,engine:string}} Frozen registration and actual engine pin. */
function preflight(){
  const reg=JSON.parse(fs.readFileSync(REG,'utf8'));
  assert.equal(reg.status,'FROZEN_BEFORE_FIRST_NATIVE_ATTEMPT');
  assert.equal(reg.observedTrialsBeforeRegistration,0);
  assert.equal(reg.noPosthocFiltering,true);
  assert.deepEqual(reg.seeds,
    [612705295,1450316514,1120767139,1313997058]);
  assert.equal(reg.registeredTrials.length,8);
  assert.equal(reg.expectedNativeAttempts,24);
  assert.deepEqual(reg.modes.map(m=>m.actorAttackFuelDiscard),
    [false,true,false]);
  assert.equal(reg.sourceOriginalPrintedSixtySha256,
    'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05');
  assert.equal(reg.candidateEnglishProxyCanonicalIdCountSha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.ok(reg.registeredTrials.every(t=>t.rank===5&&
    t.candidateId==='new-moon-lockbreaker-v1'));
  assert.equal(new Set(reg.registeredTrials.map(t=>t.id)).size,8);
  assert.equal(new Set(reg.seeds).size,4);
  const engine=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(engine,reg.pinnedTwinleaf);
  return {reg,engine};
}

/** Write the complete native A/B/A ledger under an exclusive lock. */
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

/** Summarize actual native discard-adapter activation without inferring from wins. */
function discardSummary(arms){
  return arms.map(arm=>{
    const audits=arm.records.map(row=>row.handDiscardAudit);
    for(const audit of audits)assert.ok(audit,
      'Missing native owner hand-discard audit for '+arm.id);
    const reasons={};
    for(const audit of audits)for(const [reason,count] of
      Object.entries(audit.attackFuelReasons??{}))
      reasons[reason]=(reasons[reason]??0)+count;
    return {
      id:arm.id,attempts:arm.records.length,
      attackFuelOptInValues:[...new Set(audits.map(a=>a.attackFuelOptIn))],
      acceptedDiscardPrompts:audits.reduce((n,a)=>n+(a.accepted??0),0),
      attackFuelAlternativeProposals:audits.reduce((n,a)=>
        n+(a.attackFuelAlternativeProposals??0),0),
      attackFuelSelected:audits.reduce((n,a)=>n+(a.attackFuelSelected??0),0),
      attackFuelReasons:reasons,
      candidateAcceptedDiscardSelections:arm.records.reduce((n,row)=>
        n+(row.handDiscardAudit.selections??[]).filter(s=>
          s.seat===row.candidateSeat).length,0),
      sourceAcceptedDiscardSelections:arm.records.reduce((n,row)=>
        n+(row.handDiscardAudit.selections??[]).filter(s=>
          s.seat===row.sourceSeat).length,0),
      candidateAttackDeclarations:arm.records.reduce((n,row)=>
        n+(row.candidateAttackSettlement?.declarations??0),0),
      candidateSettledAttacks:arm.records.reduce((n,row)=>
        n+(row.candidateAttackSettlement?.settled??0),0),
      candidateAttacksWithImmediateSourceReturn:arm.records.reduce((n,row)=>
        n+(row.candidateAttackSettlement?.withImmediateSourceReturn??0),0)
    };
  });
}

/** @returns {object} All preregistered native contexts and their A/B/A comparison. */
function main(){
  const {reg,engine}=preflight();
  const arms=reg.modes.map(mode=>{
    const extra={
      actorVipAfterPassAdapter:(execute,deps)=>
        withActorBattleVipAfterPass(execute,{
          ...deps,preferNewMoonTriadV2Recipient:true
        }),
      // Keep the generic hand-discard resolver in every arm; only the dynamic
      // one-attachment Energy-preservation rule changes.
      actorHandDiscard:true,
      actorAttackFuelDiscard:mode.actorAttackFuelDiscard,
      actorMewUltraBallPaymentGuard:false,
      actorMewQuickBallPaymentGuard:false
    };
    return executeArm(reg,{
      id:mode.id,
      bilateralGengarHorrorHouseTempo:true,
      bilateralGengarHorrorHouseMinOpponentHandCount:6
    },extra);
  });
  const comparison=analyze(arms);
  const activation=discardSummary(arms);
  const result={
    schema:'agent20-newmoon-perfection-attack-fuel-native-fresh-eight-v1',
    registration:reg,pinnedTwinleaf:engine,
    sourceOriginalPrintedSixtySha256:reg.sourceOriginalPrintedSixtySha256,
    candidateEnglishProxyCanonicalIdCountSha256:
      reg.candidateEnglishProxyCanonicalIdCountSha256,
    newMoonPrintedSixtyUnchanged:true,
    sourceSpecificMewPaymentGuardsDisabledInEveryArm:true,
    commonPolicySymmetricBothSeats:true,
    qualifiedPaperGames:0,qualifiedFieldWins:0,
    activation,comparison,arms,
    allAttemptIds:arms.flatMap(a=>a.records.map(r=>a.id+':'+r.id)),
    attemptLedgerSha256:hash(arms.map(a=>a.records.map(r=>({
      id:r.id,root:r.rootLedgerSha256,physical:r.physicalTapeSha256,
      finished:r.finished,winner:r.winner,error:r.error,
      handDiscard:r.handDiscardAudit,
      candidateAttackSettlement:r.candidateAttackSettlement,
      sourceAttackSettlement:r.sourceAttackSettlement
    }))))
  };
  assert.equal(result.allAttemptIds.length,24);
  for(let i=0;i<arms.length;i++){
    assert.equal(arms[i].records.length,8);
    assert.ok(arms[i].records.every(row=>
      row.handDiscardAudit.attackFuelOptIn===reg.modes[i].actorAttackFuelDiscard));
  }
  save(result);
  console.log('AGENT20_NEWMOON_PERFECTION_ATTACK_FUEL',JSON.stringify({
    registeredAttempts:result.allAttemptIds.length,
    activation,matchedFull:comparison.matchedFull,
    matchedSource:comparison.matchedSource,
    repeatPhysical:comparison.identicalRepeatPhysical,
    completePairs:comparison.completedPairs,
    treatmentWinnerReversals:comparison.newCandidateNativeWinnerReversals,
    candidateAttackCountImprovements:comparison.candidateAttackCountImprovements,
    arms:arms.map(a=>({id:a.id,summary:a.summary})),
    pairs:comparison.pairs.map(p=>({
      id:p.id,seed:p.seed,candidateSeat:p.candidateSeat,
      sameFull:p.sameFull,sameSource:p.sameSource,
      repeatPhysicalIdentical:p.repeatPhysicalIdentical,
      controlWinner:p.control.winner,treatmentWinner:p.treatment.winner,
      controlCandidateAttacks:p.control.candidateAttacks.length,
      treatmentCandidateAttacks:p.treatment.candidateAttacks.length,
      firstActionDifference:p.firstActionDifference,
      firstPhysicalDifference:p.firstPhysicalDifference
    })),qualifiedPaperGames:0
  }));
  return result;
}

if(require.main===module){
  if(process.argv.includes('--preflight')){
    const {reg,engine}=preflight();
    console.log('AGENT20_NEWMOON_ATTACK_FUEL_PREFLIGHT',
      JSON.stringify({caseId:reg.caseId,engine,seeds:reg.seeds,
        registeredContexts:reg.registeredTrials.length,
        modes:reg.modes}));
  }else main();
}
module.exports={REG,OUTPUT,preflight,discardSummary,main};
