'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const registration=require('../../results/aichi-2026/registrations/agent10-prospective-5rank-resource-retreat-20261102.json');
const {treatmentOptions}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const VERSION='agent10-prospective-5rank-two-seat-resource-retreat-v1';
const twoCandidates=['champion-reference','new-moon-lockbreaker-v1'];
function registeredTrials(){
  const trials=registration.seedGroups.flatMap(g=>twoCandidates.map(id=>({
    rank:g.rank,repeat:0,candidateSlot:g.candidateSlot,candidateId:id,
    id:[g.rank,0,g.candidateSlot,id].join(':'),seed:g.seed
  })));
  assert.deepEqual(trials.map(t=>t.id),registration.trialIds);
  return trials;
}
function rootSummary(row,seat){
  const roots=row.rootActionLedger??[];
  const own=roots.filter(x=>x.playerSlot===seat);
  const attacks=own.filter(x=>x.action==='AttackAction');
  const paidRetreats=own.filter(x=>x.action==='RetreatAction');
  const settled=((seat===row.sourceSeat?
      row.sourceAttackSettlement:row.candidateAttackSettlement)
       ?.attacks??[]);
  return {
    firstAttack:attacks[0]?
      {turn:attacks[0].turnBefore,name:attacks[0].attack,
        ordinal:attacks[0].actionOrdinal}:null,
    firstClaw:attacks.find(x=>x.attack==='Claw of Darkness')?.turnBefore??null,
    attackCount:attacks.length,settledAttackCount:settled.filter(x=>
      x.settledPromptChain).length,
    paidRetreatRoots:paidRetreats.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal
    })),
    settledPrizes:settled.map(x=>({
      name:x.attackName,turn:x.turnBefore,
      ownBefore:x.prizesBefore?.[seat]??null,
      ownAfter:x.prizesAfter?.[seat]??null,
      sourceOpponentContinuation:x.nextSourceRoot??null
    }))
  };
}
function run(){
  const trials=registeredTrials();
  assert.equal(trials.length,20);
  const existing=treatmentOptions();
  const envBefore={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    envBefore[k]=process.env[k];process.env[k]=v;
  }
  let control,treatment;
  try{
    const root=path.resolve(__dirname,'../..');
    require('./agent41-frozen-bilateral-development-v1.cjs')
      .assertPinnedNativeStore(root,profile);
    const evaluate=require('./agent41-bilateral-v2-development.cjs').runDevelopment;
    const options={
      ...existing,registeredTrials:trials,
      allowAdditionalOriginalSourceRanks:true,
      actorRank9MegaAbsolFundingRoot:false,
      actorFlexiblePaidRetreatRoot:false
    };
    control=evaluate({...options,registeredFrameName:VERSION+'-control'});
    treatment=evaluate({...options,
      actorRank9MegaAbsolFundingRoot:true,
      actorFlexiblePaidRetreatRoot:true,
      registeredFrameName:VERSION+'-interaction'
    });
  }finally{
    for(const [k,v] of Object.entries(envBefore)){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
  assert.equal(control.attempted,20);
  assert.equal(treatment.attempted,20);
  const comparisons=trials.map((trial,index)=>{
    const b=control.rows[index],t=treatment.rows[index];
    assert.equal(b.trial?.id,trial.id);
    assert.equal(t.trial?.id,trial.id);
    const prior=b.rootActionLedger??[],next=t.rootActionLedger??[];
    let diff=Math.min(prior.length,next.length);
    for(let j=0;j<diff;j++){
      if(JSON.stringify(prior[j])!==JSON.stringify(next[j])){
        diff=j;break;
      }
    }
    if(prior.length===next.length&&diff===prior.length)diff=null;
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    return {
      id:trial.id,rank:trial.rank,sourceSeat,candidateSeat,
      seed:trial.seed,
      actualStarterSame:b.actualStarterSeat===t.actualStarterSeat,
      fullPhysicalDealSame:b.fullPhysicalDealFingerprint===
        t.fullPhysicalDealFingerprint,
      sourcePhysicalDealSame:b.sourceDealFingerprint===
        t.sourceDealFingerprint,
      sourceDeckFingerprintSame:b.sourceDeckFingerprint===
        t.sourceDeckFingerprint,
      candidateDeckFingerprintSame:b.candidateDeckFingerprint===
        t.candidateDeckFingerprint,
      rootFirstDifference:diff,
      rootHashes:{control:b.rootActionLedgerSha256,
        treatment:t.rootActionLedgerSha256},
      control:{finished:b.finished,winner:b.winner,
        actionCount:b.actionCount,endReason:b.endReason,
        source:rootSummary(b,sourceSeat),
        candidate:rootSummary(b,candidateSeat)},
      treatment:{finished:t.finished,winner:t.winner,
        actionCount:t.actionCount,endReason:t.endReason,
        source:rootSummary(t,sourceSeat),
        candidate:rootSummary(t,candidateSeat)},
      paperAudit:{
        control:b.physicalZoneQualification??null,
        treatment:t.physicalZoneQualification??null
      },competitivelyQualified:false
    };
  });
  const matched=comparisons.every(x=>x.actualStarterSame&&
    x.fullPhysicalDealSame&&x.sourcePhysicalDealSame&&
    x.sourceDeckFingerprintSame&&x.candidateDeckFingerprintSame);
  return {
    version:VERSION,registrationSchema:registration.schema,
    researchHead:process.env.GITHUB_SHA??null,
    vendorPin:profile.pinnedVendorRevision,
    beforeAndAfterSamePhysicalDeal:matched,
    trialsPerArm:trials.length,
    totalNativeAttempts:2*trials.length,
    symmetricFlexibleMobility:true,
    exactMegaAbsolFundingByPrinting:true,
    comparisons,rawControl:control,rawTreatment:treatment,
    competitiveQualifiedGames:0,
    caveat:'Fresh separately preregistered random source deals and original 60s, 5 distinct archetypes and two physical seats. Native policy remains underqualified due engine paper rules, owner identity/payment, opponent competence, match clock. No reliable competitive win-rate inference.'
  };
}
if(require.main===module){
  const a=run();
  process.stdout.write(JSON.stringify(a,null,2)+'\n');
  if(!a.beforeAndAfterSamePhysicalDeal||a.totalNativeAttempts!==40)
    process.exitCode=1;
}
module.exports={VERSION,registeredTrials,run};
