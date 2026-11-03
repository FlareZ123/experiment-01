'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const registration=require('../../results/aichi-2026/registrations/agent10-active-mega-counterfactual-20261103.json');
const {treatmentOptions}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {firstDifferent}=require('./agent10-rank11-funding-mobility-disaggregation.cjs');
const VERSION='agent10-active-mega-claw-headway-two-seed-6-native-factor-v1';
const root=path.resolve(__dirname,'../..');
/** Post-observation diagnostic, not a new prospective cohort. */
function run(){
  require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(root,profile);
  const old={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    old[k]=process.env[k];process.env[k]=v;
  }
  const arms={};
  try{
    const evaluate=require('./agent41-bilateral-v2-development.cjs').runDevelopment;
    for(const [name,opts] of Object.entries(registration.factors)){
      arms[name]=evaluate({...treatmentOptions(),
        ...opts,actorFlexiblePaidRetreatRoot:false,
        registeredTrials:registration.trialRows,
        allowAdditionalOriginalSourceRanks:true,
        registeredFrameName:VERSION+'-'+name
      });
      assert.equal(arms[name].attempted,4);
      assert.equal(arms[name].rows.length,4);
    }
  }finally{
    for(const [k,v] of Object.entries(old)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
  const trials=registration.trialRows.map((trial,i)=>{
    const ctrl=arms.control.rows[i],cases={};
    for(const [name,part] of Object.entries(arms)){
      const row=part.rows[i];
      assert.equal(row.trial.id,trial.id);
      const sources=row.rootActionLedger?.filter(x=>x.playerSlot===0)??[];
      const acceptedEnergy=(row.nativeAcceptedTargetSidecar?.events??[])
        .filter(x=>x.playerSlot===0&&x.storeAccepted===true&&
          x.declared?.ownerHandPrinting==='Darkness Energy MEE')
        .map(x=>({turn:x.turnBefore,
          ownerHandPrinting:x.declared.ownerHandPrinting,
          target:x.declared.target,actualBoardChanges:x.publicBoardChanges}));
      const sourceAttacks=row.sourceAttackSettlement?.attacks??[];
      cases[name]={
        identicalPrintedSource60:row.sourceDeckFingerprint===ctrl.sourceDeckFingerprint,
        identicalPrintedCandidate60:row.candidateDeckFingerprint===ctrl.candidateDeckFingerprint,
        identicalTwoPlayerPhysicalDeal:row.fullPhysicalDealFingerprint===
          ctrl.fullPhysicalDealFingerprint,
        identicalActualStarter:row.actualStarterSeat===ctrl.actualStarterSeat,
        firstDifferentRoot:firstDifferent(ctrl.rootActionLedger??[],
          row.rootActionLedger??[]),
        actualSourceEnergyRecipients:acceptedEnergy,
        firstSourceClaw:sources.find(x=>x.action==='AttackAction'&&
          x.attack==='Claw of Darkness')?.turnBefore??null,
        sourceClawSettlements:sourceAttacks.filter(x=>
          x.attackName==='Claw of Darkness').map(x=>({
            turn:x.turnBefore,settled:x.settledPromptChain,
            prizesBefore:x.prizesBefore,prizesAfter:x.prizesAfter,
            nextOpponentRoot:x.nextSourceRoot??null
          })),
        actualSourceRetreatCount:sources.filter(x=>x.action==='RetreatAction').length,
        nativeStatus:{
          finished:row.finished,winnerSeat:row.finished?row.winner:null,
          endReason:row.endReason,actionCount:row.actionCount,
          finalPrizes:row.finalPrizes,error:row.error??null
        },
        qualifiedCompetitiveGame:false
      };
    }
    return {id:trial.id,seed:trial.seed,originalSourceSeat:0,
      candidateSeat:1,cases};
  });
  const dealParity=trials.every(t=>Object.values(t.cases).every(x=>
    x.identicalPrintedSource60&&x.identicalPrintedCandidate60&&
    x.identicalTwoPlayerPhysicalDeal&&x.identicalActualStarter));
  return {version:VERSION,registrationSchema:registration.schema,
    vendorPin:profile.pinnedVendorRevision,
    head:process.env.GITHUB_SHA??null,
    postObservationDiagnostics:true,
    actualNativeAttempts:registration.totalNativeAttempts,
    exactPrintedAndTwoPlayerDealParity:dealParity,
    trials,competitiveQualifiedGames:0,
    caveat:'Exactly two original rank11 source deals selected after observation, three opt-in policy factors. Real native Store roots and recipients, no paper validity, no opponent competence, no 25min clock, no win-rate inference.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  assert.equal(result.actualNativeAttempts,12);
  assert.equal(result.exactPrintedAndTwoPlayerDealParity,true);
}
module.exports={VERSION,run};
