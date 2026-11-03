'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const registration=require('../../results/aichi-2026/registrations/agent10-rank11-funding-fresh-eight-seed-20261103.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {treatmentOptions}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {firstDifferent}=require('./agent10-rank11-funding-mobility-disaggregation.cjs');
const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent10-rank11-fresh-8-seed-funding-prospective-v1';

/** @param {object} row @param {number} sourceSeat */
function extractSourceLine(row,sourceSeat){
  if(!Array.isArray(row?.rootActionLedger))return {
    status:'no-native-root-ledger',reason:row?.error??null
  };
  const attacks=(row.rootActionLedger??[]).filter(x=>
    x.playerSlot===sourceSeat&&x.action==='AttackAction');
  const settlements=row.sourceAttackSettlement?.attacks??[];
  const energyEvents=(row.nativeAcceptedTargetSidecar?.events??[])
    .filter(e=>e.playerSlot===sourceSeat&&
      e.action==='PlayCardAction'&&
      e.storeAccepted===true&&
      e.publicBoardChanges?.some(x=>x.seat===sourceSeat&&
        x.after?.pokemon==='Mega Absol ex M1L'&&
        x.after?.energies?.length>x.before?.energies?.length))
    .map(e=>({
      root:e.rootActionOrdinal,turn:e.turnBefore,
      energy:e.declared?.ownerHandPrinting??null,
      declaredTarget:e.declared?.target??null,
      physicalBoardChanges:e.publicBoardChanges
    }));
  return {
    status:'native-root-ledger-available',
    sourceSeat,
    firstMotivateTurn:attacks.find(x=>x.attack==='Motivate')?.turnBefore??null,
    firstClawTurn:attacks.find(x=>x.attack==='Claw of Darkness')?.turnBefore??null,
    nativeMotivateCount:attacks.filter(x=>x.attack==='Motivate').length,
    nativeClawCount:attacks.filter(x=>x.attack==='Claw of Darkness').length,
    nativeRetreatCount:(row.rootActionLedger??[]).filter(x=>
      x.playerSlot===sourceSeat&&x.action==='RetreatAction').length,
    acceptedOwnerMegaEnergyEvents:energyEvents,
    settledClawPrizes:settlements.filter(x=>x.attackName==='Claw of Darkness')
      .map(x=>({turn:x.turnBefore,settled:x.settledPromptChain,
        before:x.prizesBefore,after:x.prizesAfter,
        nextOpponentRoot:x.nextSourceRoot,
        nextOpponentSameEpoch:x.nextSourceSameEpochProven})),
    actualSourcePrizeRemaining:row.finalPrizes?.[sourceSeat]??null
  };
}

/** @param {object} row */
function nativeDisposition(row) {
  return {
    finished:row.finished??null,winnerSeat:row.finished?row.winner:null,
    endReason:row.endReason??null,actionCount:row.actionCount??null,
    originalStarterSeat:row.actualStarterSeat??null,
    finalPrizes:row.finalPrizes??null,
    error:row.error??null,
    qualifiedForCompetitiveInference:false
  };
}

function run(){
  const ids=registration.trialIds;
  const trials=registration.seedGroups.flatMap(g=>
    registration.candidateIds.map(candidateId=>({
      ...g,candidateId,id:`${g.rank}:${g.repeat}:${g.candidateSlot}:${candidateId}`
    })));
  assert.equal(trials.length,16);
  assert.equal(new Set(trials.map(t=>t.id)).size,16);
  assert.deepEqual(trials.map(t=>t.id),ids);
  require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(ROOT,profile);
  const old={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    old[k]=process.env[k];process.env[k]=v;
  }
  let control,funding;
  try{
    const evaluate=require('./agent41-bilateral-v2-development.cjs').runDevelopment;
    const common={...treatmentOptions(),
      registeredTrials:trials,allowAdditionalOriginalSourceRanks:true};
    control=evaluate({...common,
      actorRank9MegaAbsolFundingRoot:false,
      actorFlexiblePaidRetreatRoot:false,
      registeredFrameName:VERSION+'-control'});
    funding=evaluate({...common,
      actorRank9MegaAbsolFundingRoot:true,
      actorFlexiblePaidRetreatRoot:false,
      registeredFrameName:VERSION+'-funding'});
  }finally{
    for(const [k,v] of Object.entries(old)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
  assert.equal(control.attempted,16);
  assert.equal(funding.attempted,16);
  assert.equal(control.rows.length,16);
  assert.equal(funding.rows.length,16);
  const comparisons=trials.map((t,i)=>{
    const b=control.rows[i],a=funding.rows[i];
    assert.equal(b.trial.id,t.id);
    assert.equal(a.trial.id,t.id);
    const sourceSeat=t.candidateSlot==='A'?1:0;
    const bothDealsPresent=typeof b.fullPhysicalDealFingerprint==='string'&&
      typeof a.fullPhysicalDealFingerprint==='string';
    const identicalPhysicalDeal=bothDealsPresent?
      b.fullPhysicalDealFingerprint===a.fullPhysicalDealFingerprint:null;
    return {
      id:t.id,rank:11,repeat:t.repeat,seed:t.seed,
      sourceSeat,candidateSeat:1-sourceSeat,candidateId:t.candidateId,
      physicalControlAndFunding:{
        sourceDeckSame:b.sourceDeckFingerprint===a.sourceDeckFingerprint,
        candidateDeckSame:b.candidateDeckFingerprint===a.candidateDeckFingerprint,
        sourceDealSame:b.sourceDealFingerprint===a.sourceDealFingerprint,
        fullDealSame:identicalPhysicalDeal,
        actualStarterSame:b.actualStarterSeat===a.actualStarterSeat
      },
      rootFirstDifference:firstDifferent(b.rootActionLedger??[],a.rootActionLedger??[]),
      control:{native:nativeDisposition(b),source:extractSourceLine(b,sourceSeat)},
      funding:{native:nativeDisposition(a),source:extractSourceLine(a,sourceSeat)}
    };
  });
  return {
    version:VERSION,
    preregistered:true,
    registrationUri:'results/aichi-2026/registrations/agent10-rank11-funding-fresh-eight-seed-20261103.json',
    nativeVendorPin:profile.pinnedVendorRevision,
    researchHead:process.env.GITHUB_SHA??null,
    attemptedControl:control.attempted,attemptedFunding:funding.attempted,
    independentOriginalSourceSeedGroups:registration.totalIndependentOriginalSeedGroups,
    pairedComparisons:comparisons.length,
    fullDealParityProvenPairs:comparisons.filter(c=>
      c.physicalControlAndFunding.fullDealSame===true).length,
    unavailablePhysicalDealAuditPairs:comparisons.filter(c=>
      c.physicalControlAndFunding.fullDealSame===null).length,
    differingRootPairs:comparisons.filter(c=>c.rootFirstDifference!==null).length,
    sourceNativeClawPairCount:comparisons.filter(c=>
      c.funding.source.nativeClawCount>0).length,
    pairedNativePaperQualifiedGames:0,
    comparisons,
    rawControl:control,rawFunding:funding,
    competitiveQualifiedGames:0,
    caveat:'Eight new independently pre-registered original rank11 source seed groups, four per source seat, two fixed candidates each, 32 attempted native games. Distinguish repeated source seeds across candidate matchups. Unqualified paper ownership/complete engine support, opponent policy, 25min clock and all-32 field. Not a competitive win rate.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  assert.equal(result.pairedComparisons,16);
  assert.equal(result.attemptedControl,16);
  assert.equal(result.attemptedFunding,16);
  assert.equal(result.competitiveQualifiedGames,0);
}
module.exports={VERSION,extractSourceLine,nativeDisposition,run};
