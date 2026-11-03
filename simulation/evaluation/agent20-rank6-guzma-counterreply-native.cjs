'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {trainerPrintCatalog}=
  require('../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
const {withSelectedSourceStadium}=
  require('./agent7-original6v9-stadium-selected-retrospective.cjs');
const {withOpponentRopeAfterPass}=
  require('../twinleaf/agent7-opponent-escape-rope-after-pass.cjs');
const {withRank6GuzmaAfterRope}=
  require('../twinleaf/agent20-rank6-guzma-after-rope-native.cjs');
const {nativeFirstDifference,digest}=
  require('./agent7-funded-stadium-symmetric-eightgroup-native.cjs');
const REGISTRATION=
  require('../../results/aichi-2026/registrations/agent20-rank6-guzma-single-root-rollback-v3-20261103.json');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

function run(){
  const plan=planAichi(6,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const deckA=plan.candidate.cards;
  const deckB=plan.opponents.find(x=>x.rank===9)?.cards;
  assert.equal(deckA.length,60);
  assert.equal(deckB.length,60);
  assert.equal(
    deriveSlotSeeds(20261114,'pilot',6,0).A,REGISTRATION.source.seed
  );
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
  const p=REGISTRATION.prerequisite;
  const stadiumDeps={
    Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,ActionEnumerator,catalog,
    fixture:{
      id:'rank6-seat0',sourceSeat:p.sourceStadiumOwnerSeat,
      sourceTurn:10,sourceOriginal:p.previous,
      ownerHeldReplacement:p.sourceTurn10Stadium,
      heldPhysicalHandIndex:7
    }
  };
  const sourceRopeRegistration={
    schema:REGISTRATION.schema,
    opponentCounter:{
      seat:p.rank9RopeOwnerSeat,turn:p.rank9RopeTurn,
      heldItem:p.rank9Turn11Rope,
      requiredOwnBenchAtLeast:1,
      requiredOpponentBenchAtLeast:1
    }
  };
  const common={Store,SimpleTacticsAi,GamePhase,
    PlayCardAction,PlayerType,SlotType};
  const request={
    deckA,deckB,seed:REGISTRATION.source.seed,
    maxActions:REGISTRATION.maxActions,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    label:REGISTRATION.schema
  };
  const controlPlay=()=>withSelectedSourceStadium(
    ()=>withOpponentRopeAfterPass(
      ()=>runMatch(request),{
        ...common,registration:sourceRopeRegistration
      }
    ),stadiumDeps
  );
  const treatmentPlay=()=>withSelectedSourceStadium(
    ()=>withOpponentRopeAfterPass(
      ()=>withRank6GuzmaAfterRope(
        ()=>runMatch(request),{
          ...common,registration:REGISTRATION
        }
      ),{...common,registration:sourceRopeRegistration}
    ),stadiumDeps
  );
  const attempt=(arm,fn)=>{
    try{return{arm,status:'executed',data:fn()};}
    catch(error){
      return {
        arm,status:'native-error',
        error:String(error?.stack??error),
        partialGuzma:error.agent20GuzmaAudit??null,
        partialRope:error.agent7RopeAudit??null
      };
    }
  };
  const a=attempt('stadium-rope-control',controlPlay);
  const b=attempt('stadium-rope-guzma-selected',treatmentPlay);
  const c=attempt('stadium-rope-control-repeat',controlPlay);
  const first=a.data?.result?.result??null;
  const second=b.data?.result?.result?.result??null;
  const repeat=c.data?.result?.result??null;
  const guzmaAudit=b.data?.result?.result?.audit??b.partialGuzma??null;
  const ropeAudits=[
    a.data?.result?.audit??null,
    b.data?.result?.audit??b.partialRope??null,
    c.data?.result?.audit??null
  ];
  const stadiumAudits=[a.data?.audit??null,b.data?.audit??null,
    c.data?.audit??null];
  const physical=[first,second,repeat].map(game=>
    game?.initialFullPhysicalDealFingerprint?.digestSha256??null);
  const allPhysicalMatch=physical.every(x=>
    x!==null&&x===REGISTRATION.source.physicalDealSha256);
  const controlParity=!!first&&!!repeat&&digest(first)===digest(repeat);
  const difference=nativeFirstDifference(first,second);
  const selectedAtCorrectSourceRoot=!!difference&&
    difference.firstControl?.action==='PassTurnAction'&&
    difference.firstTreatment?.action==='PlayCardAction'&&
    difference.firstControl?.turnBefore===REGISTRATION.intervention.turn&&
    difference.firstTreatment?.turnBefore===REGISTRATION.intervention.turn&&
    difference.firstTreatment?.playerSlot===REGISTRATION.intervention.seat&&
    guzmaAudit?.accepted===1;
  const compact=game=>game?{
    finished:game.finished,winner:game.winner,actions:game.actions,
    firstTurnSlot:game.firstTurnSlot,
    initialFullPhysicalDealFingerprint:game.initialFullPhysicalDealFingerprint,
    rootActionLedger:game.rootActionLedger,
    decisionTrace:game.decisionTrace,
    attackTrace:game.attackTrace
  }:null;
  return{
    schema:REGISTRATION.schema,
    registration:REGISTRATION,
    compiledResearchHead:process.env.GITHUB_SHA??null,
    vendorPin:REGISTRATION.source.vendor,
    allAttempts:[a,b,c].map(x=>({arm:x.arm,status:x.status,
      error:x.error??null})),
    allPhysicalMatch,physical,
    controlParity,
    sourceStadiumAcceptedInAllArms:stadiumAudits.every(x=>
      x?.selectedRoots===1&&x?.selectedNativeStore==='accepted'),
    opponentRopeAcceptedInAllArms:ropeAudits.every(x=>
      x?.accepted===1),
    firstSelectedGuzmaDifference:difference,
    selectedAtCorrectSourceRoot,
    guzmaAudit,ropeAudits,stadiumAudits,
    games:{
      control:compact(first),guzmaSelected:compact(second),
      repeated:compact(repeat)
    },
    competitiveQualifiedGames:0,
    interpretation:'Historical original two-seat physical deal with forced source Guzma response. Native prompt, game-policy and clock qualification absent.'
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT20_RANK6_GUZMA_AFTER_ROPE '+
    JSON.stringify({
      attempts:result.allAttempts,
      physical:result.allPhysicalMatch,
      repeatedControl:result.controlParity,
      thunderAll:result.sourceStadiumAcceptedInAllArms,
      ropeAll:result.opponentRopeAcceptedInAllArms,
      guzmaEligibility:result.guzmaAudit?.candidateRoots??null,
      nativeAccepted:result.guzmaAudit?.accepted??null,
      selectedFirstDivergence:result.firstSelectedGuzmaDifference,
      gameAttackSummary:Object.entries(result.games).map(([name,game])=>({
        name,actions:game?.actions??null,
        attacks:game?.decisionTrace?.filter(x=>x.action==='AttackAction').map(
          x=>({turn:x.turnBefore,seat:x.playerSlot,attack:x.attack,
            prizesAfter:x.prizesAfter}))??null,
        finalPrizes:game?.decisionTrace?.at(-1)?.prizesAfter??null
      }))
    })+'\n');
  if(!result.allPhysicalMatch||!result.controlParity||
      !result.sourceStadiumAcceptedInAllArms||
      !result.opponentRopeAcceptedInAllArms||
      result.allAttempts.some(x=>x.status!=='executed')||
      !result.selectedAtCorrectSourceRoot)process.exitCode=1;
}
module.exports={run};
