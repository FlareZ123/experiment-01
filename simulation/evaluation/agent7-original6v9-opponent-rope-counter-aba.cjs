'use strict';

const assert=require('node:assert/strict');
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
const {nativeFirstDifference}=
  require('./agent7-funded-stadium-symmetric-eightgroup-native.cjs');
const REGISTRATION=
  require('../../results/aichi-2026/registrations/agent7-rank6-turn11-escape-rope-opponent-counter-20261103.json');

const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

/**
 * Real first-turn historical Stadium intervention is identical in all three
 * arms; only one genuine opposing native turn11 Pass is conditionally
 * replaced by a physical source-held Escape Rope. The original 60s, seed,
 * Store and all remaining bot decisions are unchanged across arms.
 */
function run(){
  const primary=planAichi(6,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const deckA=primary.candidate.cards;
  const deckB=primary.opponents.find(d=>d.rank===9)?.cards;
  assert.equal(deckA?.length,60);
  assert.equal(deckB?.length,60);
  const seeds=deriveSlotSeeds(20261114,'pilot',6,0);
  assert.equal(seeds.A,REGISTRATION.seed);

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
  const sourceFixture={
    id:'rank6-seat0',
    sourceSeat:REGISTRATION.sourceStadium.ownerSeat,
    sourceTurn:REGISTRATION.sourceStadium.turn,
    sourceOriginal:REGISTRATION.sourceStadium.previous,
    ownerHeldReplacement:REGISTRATION.sourceStadium.replacement,
    heldPhysicalHandIndex:REGISTRATION.sourceStadium.handIndex
  };
  const deps={Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,ActionEnumerator,catalog,fixture:sourceFixture};
  const request={
    deckA,deckB,seed:REGISTRATION.seed,maxActions:REGISTRATION.maxActions,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    label:REGISTRATION.schema
  };
  const stadiumOnly=()=>
    withSelectedSourceStadium(()=>runMatch(request),deps);
  const stadiumAndCounter=()=>
    withSelectedSourceStadium(()=>withOpponentRopeAfterPass(
      ()=>runMatch(request),{Store,SimpleTacticsAi,GamePhase,PlayCardAction,
        PlayerType,SlotType,registration:REGISTRATION}),deps);
  const attempt=(id,fn)=>{
    try{return{id,status:'executed',payload:fn()};}
    catch(error){
      return {
        id,status:'native-error',
        error:String(error?.stack??error),
        sourcePartial:error?.agent7RopeAudit??null
      };
    }
  };
  const control=attempt('source-stadium-opponent-control',stadiumOnly);
  const counter=attempt('source-stadium-opponent-rope',stadiumAndCounter);
  const replay=attempt('source-stadium-opponent-control-repeat',stadiumOnly);
  const original=control.payload?.result;
  const intervention=counter.payload?.result?.result;
  const repeated=replay.payload?.result;
  const publicDeals=[original,intervention,repeated].map(x=>
    x?.initialFullPhysicalDealFingerprint?.digestSha256??null);
  const sourceAudit={
    control:control.payload?.audit??null,
    counter:counter.payload?.audit??null,
    repeated:replay.payload?.audit??null
  };
  const rope=counter.payload?.result?.audit??counter.sourcePartial??null;
  const difference=nativeFirstDifference(original,intervention);
  const eligibleRoot=rope?.candidateRoots?.find(r=>r.eligible)??null;
  const exactCounterActivation=!!difference&&
    difference.firstControl?.action==='PassTurnAction'&&
    difference.firstTreatment?.action==='PlayCardAction'&&
    difference.firstControl?.turnBefore===REGISTRATION.opponentCounter.turn&&
    difference.firstTreatment?.turnBefore===REGISTRATION.opponentCounter.turn&&
    difference.firstControl?.playerSlot===REGISTRATION.opponentCounter.seat&&
    difference.firstTreatment?.playerSlot===REGISTRATION.opponentCounter.seat&&
    rope?.selected===1&&rope?.accepted===1;
  const compact=game=>game?{
    finished:game.finished,winner:game.winner,
    actions:game.actions,turns:game.turns,
    rootActionLedger:game.rootActionLedger,
    decisionTrace:game.decisionTrace,
    attackTrace:game.attackTrace
  }:null;
  const result={
    schema:REGISTRATION.schema,
    registration:REGISTRATION,
    pinnedVendor:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    attemptedNativeGames:3,
    sourceInitialDealMatched:publicDeals.every(x=>
      x!==null&&x===REGISTRATION.exactPreviousSourcePhysicalSha256),
    sourceStadiumSelectedInAllThreeArms:
      Object.values(sourceAudit).every(a=>
        a?.selectedRoots===1&&a?.selectedNativeStore==='accepted'),
    originalControlRepeatedExactly:
      !!original&&!!repeated&&digestResult(original)===digestResult(repeated),
    nativeErrorArms:[control,counter,replay].filter(a=>a.error).length,
    matchedFirstDifference:difference,
    exactOpponentRopeFirstDivergence:exactCounterActivation,
    eligibleOwnerCounter:eligibleRoot,
    originalPhysicalDeals:publicDeals,
    sourceStadiumAudits:sourceAudit,
    opponentCounterAudit:rope,
    control:compact(original),
    counterfactual:compact(intervention),
    repeated:compact(repeated),
    errorArms:[control,counter,replay].filter(a=>a.error)
      .map(a=>({arm:a.id,error:a.error})),
    competitiveQualifiedGames:0,
    scope:'Retrospective native opponent reply only; no paper win inference'
  };
  return result;
}

if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  process.stderr.write('AGENT7_RANK6_OPPONENT_ROPE_COUNTER '+
    JSON.stringify({
      nativeAttempts:r.attemptedNativeGames,
      sourceDealParity:r.sourceInitialDealMatched,
      sourceStadiumAll:r.sourceStadiumSelectedInAllThreeArms,
      controlParity:r.originalControlRepeatedExactly,
      eligible:r.eligibleOwnerCounter,
      ropeSelected:r.opponentCounterAudit?.selected??null,
      ropeAccepted:r.opponentCounterAudit?.accepted??null,
      firstDivergence:r.matchedFirstDifference,
      exactRopeFirstDivergence:r.exactOpponentRopeFirstDivergence,
      nativeErrorArms:r.nativeErrorArms
    })+'\n');
  if(!r.sourceInitialDealMatched||
     !r.originalControlRepeatedExactly||
     !r.sourceStadiumSelectedInAllThreeArms||
     r.nativeErrorArms!==0)process.exitCode=1;
}
module.exports={run};
