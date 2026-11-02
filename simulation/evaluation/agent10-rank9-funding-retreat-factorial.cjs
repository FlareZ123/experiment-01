'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {run:runControl,treatmentOptions}=
  require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {scheduledArms}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const VERSION='agent10-rank9-funding-by-bilateral-retreat-four-arm-factorial-v1';
const FACTORS=Object.freeze({
  control:{actorRank9MegaAbsolFundingRoot:false,
    actorFlexiblePaidRetreatRoot:false},
  funding:{actorRank9MegaAbsolFundingRoot:true,
    actorFlexiblePaidRetreatRoot:false},
  retreat:{actorRank9MegaAbsolFundingRoot:false,
    actorFlexiblePaidRetreatRoot:true},
  interaction:{actorRank9MegaAbsolFundingRoot:true,
    actorFlexiblePaidRetreatRoot:true}
});

/** @param {object} row @param {0|1} seat */
function realRootSummary(row,seat){
  const roots=row.rootActionLedger??[];
  const actions=roots.filter(x=>x.playerSlot===seat);
  const claws=actions.filter(x=>
    x.action==='AttackAction'&&x.attack==='Claw of Darkness');
  const retreats=actions.filter(x=>x.action==='RetreatAction');
  const settled=(row.sourceAttackSettlement?.attacks??[])
    .filter(x=>x.attackName==='Claw of Darkness');
  return {
    firstClawTurn:claws[0]?.turnBefore??null,
    firstClawOrdinal:claws[0]?.actionOrdinal??null,
    clawAttackCount:claws.length,
    clawSettledCount:settled.filter(x=>x.settledPromptChain).length,
    sourceClawPrizeTransitions:settled.map(x=>({
      turn:x.turnBefore,from:x.prizesBefore?.[seat]??null,
      to:x.prizesAfter?.[seat]??null,
      nextOpponentRoot:x.nextSourceRoot??null
    })),
    retreatRoots:retreats.map(x=>({globalTurn:x.turnBefore,
      ordinal:x.actionOrdinal,actorPolicyDecisionOrdinal:
        x.actorPolicyDecisionOrdinal??null}))
  };
}
function run(){
  const registered=scheduledArms();
  assert.equal(registered.length,4);
  const base=runControl();
  assert.equal(base.complete,true);
  assert.equal(base.rows.length,4);
  const old={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    old[k]=process.env[k];process.env[k]=v;
  }
  const all={control:base};
  try{
    const root=path.resolve(__dirname,'../..');
    require('./agent41-frozen-bilateral-development-v1.cjs')
      .assertPinnedNativeStore(root,profile);
    const evaluate=require('./agent41-bilateral-v2-development.cjs').runDevelopment;
    for(const label of ['funding','retreat','interaction']){
      all[label]=evaluate({
        ...treatmentOptions(),...FACTORS[label],
        registeredFrameName:VERSION+'-'+label
      });
      assert.equal(all[label].attempted,4);
      assert.equal(all[label].rows.length,4);
    }
  }finally{
    for(const [k,v] of Object.entries(old)){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
  const comparisons=registered.map((trial,i)=>{
    const control=all.control.rows[i],seat=trial.candidateSlot==='A'?1:0;
    assert.equal(control.trial?.id,trial.id);
    const arms={};
    for(const [label,raw] of Object.entries(all)){
      const row=raw.rows[i];
      assert.equal(row.trial?.id,trial.id);
      arms[label]={
        nativeFinal:{finished:row.finished,winner:row.winner,
          actionCount:row.actionCount,endReason:row.endReason??null},
        originalSourceDeckSame:row.sourceDeckFingerprint===
          control.sourceDeckFingerprint,
        candidateDeckSame:row.candidateDeckFingerprint===
          control.candidateDeckFingerprint,
        physicalSourceDealSame:row.sourceDealFingerprint===
          control.sourceDealFingerprint,
        fullPhysicalDealSame:row.fullPhysicalDealFingerprint===
          control.fullPhysicalDealFingerprint,
        nativeRootSha256:row.rootActionLedgerSha256,
        source:realRootSummary(row,seat),
        candidateRetreatRoots:(row.rootActionLedger??[])
          .filter(x=>x.playerSlot===1-seat&&x.action==='RetreatAction')
          .map(x=>({globalTurn:x.turnBefore,ordinal:x.actionOrdinal})),
        competitiveQualified:false
      };
    }
    return {id:trial.id,seed:trial.seed,sourceSeat:seat,arms};
  });
  const allDealtEqually=comparisons.every(p=>
    Object.values(p.arms).every(a=>
      a.originalSourceDeckSame&&a.candidateDeckSame&&
      a.physicalSourceDealSame&&a.fullPhysicalDealSame));
  return {
    version:VERSION,
    head:process.env.GITHUB_SHA??null,
    pinnedVendor:profile.pinnedVendorRevision,
    arms:FACTORS,
    originalTrialCount:registered.length,
    totalNativeTrialCount:4*4,
    allPhysicalDealsAndOriginalDecksEqual:allDealtEqually,
    comparisons,
    nativeRaw:all,
    competitiveQualifiedGames:0,
    caveat:'Historical specific four original rank9 deals; mutually comparable native same-deal factor experiment. Original source/candidate decks fixed. Native bot, paper legality, official timing and representative opponent competence remain unqualified.'
  };
}
if(require.main===module){
  const a=run();
  process.stdout.write(JSON.stringify(a,null,2)+'\n');
  if(!a.allPhysicalDealsAndOriginalDecksEqual)process.exitCode=1;
}
module.exports={VERSION,FACTORS,run};
