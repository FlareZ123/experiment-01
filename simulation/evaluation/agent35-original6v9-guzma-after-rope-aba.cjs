'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {trainerPrintCatalog}=
  require('../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
const {withSelectedSourceStadium,digestResult}=
  require('./agent7-original6v9-stadium-selected-retrospective.cjs');
const {withOpponentRopeAfterPass}=
  require('../twinleaf/agent7-opponent-escape-rope-after-pass.cjs');
const {withSourceGuzmaAfterRope}=
  require('../twinleaf/agent35-source-guzma-after-rope.cjs');
const {nativeFirstDifference}=
  require('./agent7-funded-stadium-symmetric-eightgroup-native.cjs');

const REGISTERED=require('../../results/aichi-2026/registrations/agent35-rank6-after-rope-guzma-20261105.json');
const AGENT7=require('../../results/aichi-2026/registrations/agent7-rank6-turn11-escape-rope-opponent-counter-20261103.json');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

/**
 * Third-ply source-owner Guzma attempt after real same-deal Stadium and Rope.
 * Both controls include the selected original rank6 Stadium and opponent rank9
 * Rope, differing from treatment only in the owner-legal third native root.
 * Raw native outcomes, including rejection or absence, remain the result.
 * @returns {object}
 */
function run(){
  assert.equal(REGISTERED.seed,AGENT7.seed);
  assert.equal(REGISTERED.requiredInitialFullPhysicalDealSha256,
    AGENT7.exactPreviousSourcePhysicalSha256);
  const source=planAichi(6,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const deckA=source.candidate.cards;
  const deckB=source.opponents.find(d=>d.rank===9)?.cards;
  assert.equal(deckA.length,60);
  assert.equal(deckB.length,60);
  const seeds=deriveSlotSeeds(20261114,'pilot',6,0);
  assert.equal(seeds.A,REGISTERED.seed);

  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {GamePhase}=native('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType}=native('game/store/card/card-types');
  const {ActionEnumerator}=native('advanced-bot/action-enumerator');
  const catalog=trainerPrintCatalog(manager.getAllCards(),{
    TrainerCard,TrainerType
  });
  const stadiumSource={
    id:'rank6-seat0',sourceSeat:AGENT7.sourceStadium.ownerSeat,
    sourceTurn:AGENT7.sourceStadium.turn,
    sourceOriginal:AGENT7.sourceStadium.previous,
    ownerHeldReplacement:AGENT7.sourceStadium.replacement,
    heldPhysicalHandIndex:AGENT7.sourceStadium.handIndex
  };
  const stadiumDeps={Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,ActionEnumerator,catalog,fixture:stadiumSource};
  const ropeDeps={Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,registration:AGENT7};
  const guzmaDeps={Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,registration:REGISTERED};
  const request={deckA,deckB,seed:REGISTERED.seed,
    maxActions:REGISTERED.maxActions,strictPromptValidation:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureInitialFullPhysicalDeal:true,label:REGISTERED.schema};

  const ordinary=()=>withSelectedSourceStadium(
    ()=>withOpponentRopeAfterPass(()=>runMatch(request),ropeDeps),
    stadiumDeps);
  const treated=()=>withSelectedSourceStadium(
    ()=>withOpponentRopeAfterPass(
      ()=>withSourceGuzmaAfterRope(()=>runMatch(request),guzmaDeps),
      ropeDeps),
    stadiumDeps);
  function attempt(label,play){
    try{return{label,status:'executed',payload:play()};}
    catch(error){return{
      label,status:'native-error',nativeAbortStage:error.nativeAbortEvidence?.failureStage??null,
      guzmaAudit:error.agent35GuzmaAudit??null
    };}
  }
  const control=attempt('baseline-prelude',ordinary);
  const intervention=attempt('proposed-source-guzma',treated);
  const repeat=attempt('baseline-prelude-repeat',ordinary);
  const baseline=control.payload?.result?.result??null;
  const on=intervention.payload?.result?.result?.result??null;
  const repeated=repeat.payload?.result?.result??null;
  const getDigest=g=>g?.initialFullPhysicalDealFingerprint?.digestSha256??null;
  const physical=[baseline,on,repeated].map(getDigest);
  const roots=[baseline,on,repeated].map(g=>g?.rootActionLedger??null);
  const receipt=intervention.payload?.result?.result?.audit??
    intervention.guzmaAudit??null;
  const rope=[
    control.payload?.result?.audit??null,
    intervention.payload?.result?.audit??null,
    repeat.payload?.result?.audit??null
  ];
  const stadium=[
    control.payload?.audit??null,
    intervention.payload?.audit??null,
    repeat.payload?.audit??null
  ];
  const firstDiff=nativeFirstDifference(baseline,on);
  const originalReplayExact=Boolean(baseline&&repeated&&
    digestResult(baseline)===digestResult(repeated));
  const sameDeal=physical.every(d=>d&&
    d===REGISTERED.requiredInitialFullPhysicalDealSha256);
  const selected=receipt?.accepted===1;
  const exactThirdRoot=selected&&firstDiff?.firstControl?.turnBefore===
    REGISTERED.thirdRoot.turn&&
    firstDiff.firstTreatment?.turnBefore===REGISTERED.thirdRoot.turn&&
    firstDiff.firstControl?.action==='PassTurnAction'&&
    firstDiff.firstTreatment?.action==='PlayCardAction'&&
    firstDiff.firstTreatment?.playerSlot===REGISTERED.thirdRoot.ownerSeat;
  const compact=g=>g?{
    finished:g.finished,winner:g.winner,actions:g.actions,turns:g.turns,
    rootActionLedger:g.rootActionLedger,attackTrace:g.attackTrace,
    attackDeclarationTrace:g.attackDeclarationTrace,
    // This historical native diagnostic records opponent subsequent actions
    // without assuming they constitute strategically competent replies.
    prizeCardsRemaining:g.prizesRemaining
  }:null;
  return {
    schema:REGISTERED.schema,
    originalSourceRegisteredRosterPreserved:true,
    originalFixedSourceSixties:[6,9],
    originalSeed:REGISTERED.seed,
    physicalDealDigests:physical,
    sameEntireInitialDealAcrossAllThree:sameDeal,
    baselineReplayedExactly:originalReplayExact,
    stadiumPreludeSelectedInEveryArm:stadium.every(a=>
      a?.selectedRoots===1&&a.selectedNativeStore==='accepted'),
    ropePreludeSelectedInEveryArm:rope.every(a=>
      a?.selected===1&&a.accepted===1),
    attempted:3,nativeErrors:[control,intervention,repeat]
      .filter(a=>a.status!=='executed').length,
    exactGuzmaThirdRootDivergence:exactThirdRoot,
    firstDiff,sourceGuzmaAudit:receipt,
    stadiumPreludes:stadium,ropePreludes:rope,
    baseline:compact(baseline),treatment:compact(on),
    repeated:compact(repeated),
    errorArms:[control,intervention,repeat]
      .filter(a=>a.status!=='executed').map(a=>({
        label:a.label,nativeAbortStage:a.nativeAbortStage
      })),
    competitiveQualifiedGames:0,
    status:'Retrospective selected source deal, unqualified even if native Store accepts'
  };
}

if(require.main===module){
  const result=run();
  const destination=process.env.AGENT35_RANK6_GUZMA_ROPE_OUTPUT;
  if(destination){
    const target=path.resolve(destination);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    const lockPath=target+'.lock';
    const lockFd=fs.openSync(lockPath,'wx');
    let temporary=null;
    try{
      temporary=target+'.'+process.pid+'.'+
        crypto.randomBytes(6).toString('hex')+'.tmp';
      fs.writeFileSync(temporary,JSON.stringify(result,null,2)+'\\n',{
        flag:'wx'
      });
      fs.renameSync(temporary,target);
      temporary=null;
    }finally{
      if(temporary!==null && fs.existsSync(temporary))
        fs.unlinkSync(temporary);
      fs.closeSync(lockFd);
      fs.unlinkSync(lockPath);
    }
  }
  process.stdout.write(JSON.stringify({
    schema:result.schema,attempted:result.attempted,
    samePhysicalDeal:result.sameEntireInitialDealAcrossAllThree,
    baselineReplayedExactly:result.baselineReplayedExactly,
    stadiumPreludeSelected:result.stadiumPreludeSelectedInEveryArm,
    ropePreludeSelected:result.ropePreludeSelectedInEveryArm,
    guzmaSelected:result.sourceGuzmaAudit?.selected??null,
    guzmaAccepted:result.sourceGuzmaAudit?.accepted??null,
    exactThirdRoot:result.exactGuzmaThirdRootDivergence,
    firstDiff:result.firstDiff,
    nativeErrors:result.nativeErrors,
    competitiveQualifiedGames:0
  })+'\n');
  if(!result.sameEntireInitialDealAcrossAllThree||
     !result.baselineReplayedExactly||
     !result.stadiumPreludeSelectedInEveryArm||
     !result.ropePreludeSelectedInEveryArm||
     result.nativeErrors!==0)process.exitCode=1;
}

module.exports={run};
