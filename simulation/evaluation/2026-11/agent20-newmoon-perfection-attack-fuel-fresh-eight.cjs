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
  const candidatePath=path.join(ROOT,reg.candidateEnglishProxyManifest);
  const candidateBlob=execFileSync('git',['hash-object',candidatePath],{
    cwd:ROOT,encoding:'utf8'
  }).trim();
  assert.equal(candidateBlob,reg.candidateEnglishProxyManifestGitBlobSha);
  const candidate=JSON.parse(fs.readFileSync(candidatePath,'utf8'));
  assert.equal(candidate.canonical_id_count_sha256,
    reg.candidateEnglishProxyCanonicalIdCountSha256);
  assert.equal(candidate.counts.total,60);
  const sourcePath=path.join(ROOT,reg.sourceOpponentManifest);
  const sourceBlob=execFileSync('git',['hash-object',sourcePath],{
    cwd:ROOT,encoding:'utf8'
  }).trim();
  assert.equal(sourceBlob,reg.sourceDeckListManifestGitBlobSha);
  const sourceRoster=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
  const source=sourceRoster.decks.find(deck=>deck.rank===5);
  assert.ok(source);
  assert.equal(source.archetype,'Mew Genesect');
  assert.equal(source.cards.reduce((n,card)=>n+card.count,0),60);
  assert.ok(reg.registeredTrials.every(t=>t.rank===5&&
    t.candidateId==='new-moon-lockbreaker-v1'));
  assert.equal(new Set(reg.registeredTrials.map(t=>t.id)).size,8);
  assert.equal(new Set(reg.seeds).size,4);
  const engine=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(engine,reg.pinnedTwinleaf);
  const researchCommit=execFileSync('git',['rev-parse','HEAD'],{
    cwd:ROOT,encoding:'utf8'
  }).trim();
  return {reg,engine,researchCommit};
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

/** Pair actual native discard payments by seat, turn and prompt across A/B. */
function comparePayments(arms){
  const [control,treatment]=arms;
  return control.records.map((a,index)=>{
    const b=treatment.records[index];
    assert.equal(a.id,b.id);
    const key=row=>[row.seat,row.turn,row.promptId,row.requiredCount].join(':');
    const left=new Map((a.handDiscardAudit?.selections??[]).map(row=>[key(row),row]));
    const right=new Map((b.handDiscardAudit?.selections??[]).map(row=>[key(row),row]));
    const keys=[...new Set([...left.keys(),...right.keys()])];
    const acceptedChanged=[],unmatchedControl=[],unmatchedTreatment=[];
    for(const k of keys){
      const x=left.get(k),y=right.get(k);
      if(!x){unmatchedTreatment.push(y);continue;}
      if(!y){unmatchedControl.push(x);continue;}
      if(JSON.stringify(x.printings)!==JSON.stringify(y.printings)){
        acceptedChanged.push({
          seat:y.seat,actorRole:y.seat===a.candidateSeat?'candidate':'source',
          turn:y.turn,promptId:y.promptId,requiredCount:y.requiredCount,
          controlPrintings:x.printings,treatmentPrintings:y.printings
        });
      }
    }
    return {
      id:a.id,seed:a.seed,candidateSeat:a.candidateSeat,sourceSeat:a.sourceSeat,
      controlAttackFuelSelected:a.handDiscardAudit?.attackFuelSelected??0,
      treatmentAttackFuelSelected:b.handDiscardAudit?.attackFuelSelected??0,
      acceptedChangedPayments:acceptedChanged,
      candidateAcceptedChangedPayments:acceptedChanged.filter(x=>x.actorRole==='candidate').length,
      sourceAcceptedChangedPayments:acceptedChanged.filter(x=>x.actorRole==='source').length,
      unmatchedControlSelections:unmatchedControl,
      unmatchedTreatmentSelections:unmatchedTreatment
    };
  });
}

/** Summarize actual native discard-adapter activation without inferring from wins. */
function discardSummary(arms){
  return arms.map(arm=>{
    const audits=arm.records.map(row=>row.handDiscardAudit).filter(Boolean);
    const missingAuditRows=arm.records.filter(row=>!row.handDiscardAudit);
    const reasons={};
    for(const audit of audits)for(const [reason,count] of
      Object.entries(audit.attackFuelReasons??{}))
      reasons[reason]=(reasons[reason]??0)+count;
    return {
      id:arm.id,attempts:arm.records.length,auditRows:audits.length,
      missingAuditRows:missingAuditRows.map(row=>({
        id:row.id,finished:row.finished,error:row.error??null
      })),
      completedGamesMissingAudit:missingAuditRows.filter(row=>
        row.finished===true&&!row.error).length,
      attackFuelOptInValues:[...new Set(audits.map(a=>a.attackFuelOptIn))],
      acceptedDiscardPrompts:audits.reduce((n,a)=>n+(a.accepted??0),0),
      attackFuelAlternativeProposals:audits.reduce((n,a)=>
        n+(a.attackFuelAlternativeProposals??0),0),
      attackFuelSelected:audits.reduce((n,a)=>
        n+(a.attackFuelSelected??0),0),
      attackFuelReasons:reasons,
      candidateAcceptedDiscardSelections:arm.records.reduce((n,row)=>
        n+(row.handDiscardAudit?.selections??[]).filter(s=>
          s.seat===row.candidateSeat).length,0),
      sourceAcceptedDiscardSelections:arm.records.reduce((n,row)=>
        n+(row.handDiscardAudit?.selections??[]).filter(s=>
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

/** Compare prompt-closed native attack declarations and settlements, including Perfection. */
function compareSettlements(arms){
  const [control,treatment,repeat]=arms;
  return control.records.map((a,index)=>{
    const b=treatment.records[index],c=repeat.records[index];
    const count=(row,side,key)=>row[side]?.[key]??0;
    return {
      id:a.id,seed:a.seed,candidateSeat:a.candidateSeat,
      sameFull:a.fullFingerprint!==null&&a.fullFingerprint===b.fullFingerprint,
      sameSource:a.sourceFingerprint!==null&&a.sourceFingerprint===b.sourceFingerprint,
      repeatPhysicalIdentical:a.physicalTapeSha256!==null&&
        a.physicalTapeSha256===c.physicalTapeSha256,
      controlCandidateDeclarations:count(a,'candidateAttackSettlement','declarations'),
      treatmentCandidateDeclarations:count(b,'candidateAttackSettlement','declarations'),
      controlCandidateSettled:count(a,'candidateAttackSettlement','settled'),
      treatmentCandidateSettled:count(b,'candidateAttackSettlement','settled'),
      controlCandidateWithImmediateSourceReturn:
        count(a,'candidateAttackSettlement','withImmediateSourceReturn'),
      treatmentCandidateWithImmediateSourceReturn:
        count(b,'candidateAttackSettlement','withImmediateSourceReturn'),
      controlSourceDeclarations:count(a,'sourceAttackSettlement','declarations'),
      treatmentSourceDeclarations:count(b,'sourceAttackSettlement','declarations'),
      controlSourceSettled:count(a,'sourceAttackSettlement','settled'),
      treatmentSourceSettled:count(b,'sourceAttackSettlement','settled'),
      candidateSettledAttackIncrease:
        count(b,'candidateAttackSettlement','settled')>
        count(a,'candidateAttackSettlement','settled'),
      treatmentCandidateAttackNames:
        (b.candidateAttackSettlement?.attacks??[]).map(x=>({
          attack:x.attackName,triggerAction:x.triggerAction,
          settled:x.settledPromptChain,nextSource:x.nextSourceRoot
        }))
    };
  });
}

/** @returns {object} All preregistered native contexts and their A/B/A comparison. */
function main(){
  const {reg,engine,researchCommit}=preflight();
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
  const attackSettlementPairs=compareSettlements(arms);
  const paymentComparisons=comparePayments(arms);
  const activation=discardSummary(arms);
  const result={
    schema:'agent20-newmoon-perfection-attack-fuel-native-fresh-eight-v1',
    registration:reg,pinnedTwinleaf:engine,
    researchCodeRevision:researchCommit,
    sourceOriginalPrintedSixtySha256:reg.sourceOriginalPrintedSixtySha256,
    candidateEnglishProxyCanonicalIdCountSha256:
      reg.candidateEnglishProxyCanonicalIdCountSha256,
    newMoonPrintedSixtyUnchanged:true,
    sourceSpecificMewPaymentGuardsDisabledInEveryArm:true,
    commonPolicySymmetricBothSeats:true,
    qualifiedPaperGames:0,qualifiedFieldWins:0,
    handDiscardAuditCoverage:activation.map(a=>({
      id:a.id,auditRows:a.auditRows,attempts:a.attempts,
      completedGamesMissingAudit:a.completedGamesMissingAudit
    })),
    activation,comparison,attackSettlementPairs,paymentComparisons,arms,
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
    for(const row of arms[i].records){
      if(row.handDiscardAudit){
        assert.equal(row.handDiscardAudit.attackFuelOptIn,
          reg.modes[i].actorAttackFuelDiscard);
      }
    }
  }
  save(result);
  console.log('AGENT20_NEWMOON_PERFECTION_ATTACK_FUEL',JSON.stringify({
    registeredAttempts:result.allAttemptIds.length,
    activation,matchedFull:comparison.matchedFull,
    matchedSource:comparison.matchedSource,
    repeatPhysical:comparison.identicalRepeatPhysical,
    completePairs:comparison.completedPairs,
    treatmentWinnerReversals:comparison.newCandidateNativeWinnerReversals,
    ordinaryAttackActionCountImprovements:comparison.candidateAttackCountImprovements,
    candidateSettledAttackCountImprovements:attackSettlementPairs.filter(
      p=>p.candidateSettledAttackIncrease).length,
    candidateChangedDiscardPayments:paymentComparisons.reduce((n,p)=>
      n+p.candidateChangedPayments,0),
    sourceChangedDiscardPayments:paymentComparisons.reduce((n,p)=>
      n+p.sourceChangedPayments,0),
    unmatchedTreatmentDiscardSelections:paymentComparisons.reduce((n,p)=>
      n+p.unmatchedTreatmentSelections.length,0),
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
      JSON.stringify({caseId:reg.caseId,engine,researchCommit,seeds:reg.seeds,
        registeredContexts:reg.registeredTrials.length,
        modes:reg.modes}));
  }else main();
}
module.exports={REG,OUTPUT,preflight,comparePayments,
  compareSettlements,discardSummary,main};
