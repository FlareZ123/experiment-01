'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const registration=require('../../results/aichi-2026/registrations/agent10-rank11-source-funding-mobility-factorial-20261103.json');
const {treatmentOptions}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent10-rank11-original-source-funding-vs-mobility-four-factor-v1';

/** @param {object} row @param {number} sourceSeat */
function sourceLine(row,sourceSeat){
  const roots=(row.rootActionLedger??[]).filter(x=>x.playerSlot===sourceSeat);
  const attacks=roots.filter(x=>x.action==='AttackAction');
  const settled=row.sourceAttackSettlement?.attacks??[];
  const specific=settled.filter(x=>x.attackName==='Claw of Darkness');
  const events=row.nativeAcceptedTargetSidecar?.events??[];
  const turn15Energy=events.find(x=>
    x.playerSlot===sourceSeat&&x.turnBefore===15&&
    x.declared?.ownerHandPrinting==='Darkness Energy MEE'&&
    x.storeAccepted===true);
  return {
    sourceSeat,
    nativeSourceAttacks:attacks.length,
    nativeMotivates:attacks.filter(x=>x.attack==='Motivate').length,
    nativeClaws:attacks.filter(x=>x.attack==='Claw of Darkness').length,
    nativePaidRetreats:roots.filter(x=>x.action==='RetreatAction').length,
    turn15Energy:turn15Energy?{
      declared:turn15Energy.declared,
      actualBoardChanges:turn15Energy.publicBoardChanges,
      accepted:turn15Energy.storeAccepted
    }:null,
    firstMotivateTurn:attacks.find(x=>x.attack==='Motivate')?.turnBefore??null,
    firstClawTurn:attacks.find(x=>x.attack==='Claw of Darkness')?.turnBefore??null,
    sourceClawSettlements:specific.map(x=>({
      turn:x.turnBefore,settled:x.settledPromptChain,
      prizesBefore:x.prizesBefore,prizesAfter:x.prizesAfter,
      nextOpponentRoot:x.nextSourceRoot??null
    }))
  };
}
/** @param {object[]} a @param {object[]} b */
function firstDifferent(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++){
    if(JSON.stringify(a[i])!==JSON.stringify(b[i]))return i;
  }
  return a.length===b.length?null:n;
}
function run(){
  const trials=registration.pairs;
  assert.equal(trials.length,2);
  assert.equal(registration.sourceNativeSeat,0);
  require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(ROOT,profile);
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];process.env[key]=value;
  }
  const results={};
  try{
    const evaluate=require('./agent41-bilateral-v2-development.cjs').runDevelopment;
    for(const [name,factors] of Object.entries(registration.factors)){
      const evaluated=evaluate({
        ...treatmentOptions(),...factors,
        registeredTrials:trials,
        allowAdditionalOriginalSourceRanks:true,
        registeredFrameName:VERSION+'-'+name
      });
      assert.equal(evaluated.attempted,2);
      assert.equal(evaluated.rows.length,2);
      results[name]=evaluated;
    }
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const comparisons=trials.map((trial,index)=>{
    const control=results.control.rows[index];
    const alternatives={};
    for(const [name,evaluation] of Object.entries(results)){
      const row=evaluation.rows[index];
      assert.equal(row.trial?.id,trial.id);
      alternatives[name]={
        sameSource60:row.sourceDeckFingerprint===control.sourceDeckFingerprint,
        sameCandidate60:row.candidateDeckFingerprint===control.candidateDeckFingerprint,
        sameSourcePhysicalDeal:row.sourceDealFingerprint===control.sourceDealFingerprint,
        sameFullPhysicalDeal:row.fullPhysicalDealFingerprint===control.fullPhysicalDealFingerprint,
        sameActualStarter:row.actualStarterSeat===control.actualStarterSeat,
        firstDifferentRoot:firstDifferent(control.rootActionLedger??[],
          row.rootActionLedger??[]),
        native:{finished:row.finished,winner:row.winner,
          endReason:row.endReason,actionCount:row.actionCount,
          finalPrizes:row.finalPrizes,error:row.error??null},
        source:sourceLine(row,registration.sourceNativeSeat),
        candidateRetreatCount:(row.rootActionLedger??[]).filter(x=>
          x.playerSlot!==registration.sourceNativeSeat&&
          x.action==='RetreatAction').length
      };
    }
    return {id:trial.id,seed:trial.seed,
      sourceNativeSeat:registration.sourceNativeSeat,
      candidateNativeSeat:registration.candidateNativeSeat,
      arms:alternatives};
  });
  const dealParity=comparisons.every(c=>
    Object.values(c.arms).every(a=>a.sameSource60&&a.sameCandidate60&&
      a.sameSourcePhysicalDeal&&a.sameFullPhysicalDeal&&a.sameActualStarter));
  return {version:VERSION,diagnosticPostObservation:true,
    parentRegistration:registration.parentRegistration,
    registeredPairs:trials.length,attempts:8,
    vendorPin:profile.pinnedVendorRevision,
    head:process.env.GITHUB_SHA??null,
    sameOriginal120AndStarterAcrossFourArms:dealParity,
    comparisons,competitiveQualifiedGames:0,
    caveat:'Two retrospectively selected original-rank11 source deal pairs from preregistered 20-pair pilot. Native selected funding and mobility factor check only; original source/candidate 60s unchanged. Unqualified native paper rules, owner whole-game custody, opponent decisions and match clock. No win-rate inference.'
  };
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  assert.equal(r.sameOriginal120AndStarterAcrossFourArms,true);
  for(const c of r.comparisons){
    assert.equal(c.arms.control.source.turn15Energy?.declared?.target?.slot,1,
      'Original baseline source Darkness must target its Active');
    assert.equal(c.arms.funding.source.turn15Energy?.declared?.target?.slot,2,
      'Funding-only must be the actor source of the new Bench recipient');
    assert.equal(c.arms.mobility.source.turn15Energy?.declared?.target?.slot,1,
      'Mobility-only must preserve the original Active recipient');
    assert.equal(c.arms.combined.source.turn15Energy?.declared?.target?.slot,2,
      'Combined source must select Bench Mega recipient');
  }
}
module.exports={VERSION,sourceLine,firstDifferent,run};
