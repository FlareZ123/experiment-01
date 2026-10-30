'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {withOwnerPlumeriaAfterPass}=
  require('../twinleaf/agent4-plumeria-after-pass.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const {observeSourceSupporterPayments}=
  require('./agent6-matched-t3-dce-attack-vs-plumeria-native.cjs');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent6-prized-thunder-discard-preservation-20261030.json');

/** Genuine original Store four-arm hand-discard counterfactual, no win claim. */
function run(){
  const reg=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(reg.schema,
    'agent6-retrospective-original-prized-thunder-guzma-hala-four-discard-payment-arms-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>
    d.rank===reg.selectedOriginalPhysicalSourcefirstDeal.candidateRank);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(d=>
    d.rank===reg.selectedOriginalPhysicalSourcefirstDeal.sourceRank);
  assert.equal(source?.status,'ready');
  const {seed,sourceSeat}=reg.selectedOriginalPhysicalSourcefirstDeal;
  assert.equal(sourceSeat,0);
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,
    seed,maxActions:reg.shared.maxActions,
    strictPromptValidation:reg.shared.strictPromptValidation,
    captureDecisionTrace:true,
    capturePublicAttackTransitions:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureStartingBoard:true
  };
  const arms=[];
  for(const arm of reg.arms){
    try{
      const runSource=()=>withOwnerPlumeriaAfterPass(
        ()=>runMatch(request),{sourceSeat});
      const runBroad=()=>withBroadThornsSourceAttack(runSource,{
        seat:sourceSeat,turn:reg.shared.sourceT3ScriptTurn,
        discardPriority:arm.paymentPriorities,
        stageDceFirstTurn:true,
        stageSpeedLightningFirstTurn:false,
        turn3DirectSpeedAfterDce:false,
        k1PrizedThunderSpeedFallback:true,
        liveSpeedLightningAlternative:true,
        playLockAwareOpening:true,
        k1ReplanAfterTagCall:true
      });
      const runCanonical=()=>withCanonicalActorOnlyPolicy(runBroad);
      const runFirst=()=>withGoFirstChoice([true,false],runCanonical);
      const observed=observeSourceSupporterPayments(sourceSeat,runFirst);
      const outer=observed.result;
      const broad=outer.result.result;
      const {result:game,audit:plumeriaAudit}=broad.result;
      assert.equal(game.firstTurnSlot,sourceSeat);
      assert.equal(game.verifiedByDrawLog,true);
      const settled=candidateAttackSettlement(game,sourceSeat);
      const roots=(seat,turn)=>(game.rootActionLedger??[])
        .filter(x=>x.playerSlot===seat&&x.turnBefore===turn&&
          x.pendingPrompt===null)
        .map(x=>({ordinal:x.actionOrdinal,
          action:x.action,card:x.card??null,attack:x.attack??null}));
      const firstOwner=(game.decisionTrace??[]).find(x=>
        x.playerSlot===sourceSeat&&x.turnBefore===1&&
        x.action!=='ResolvePromptAction'&&
        x.decisionHandBefore?.perspectiveSeat===sourceSeat);
      arms.push({
        status:'native-complete-or-capped',label:arm.label,
        discardPriority:arm.paymentPriorities,
        sourceActualFirst:true,
        originalSourcePhysicalDealDigest:game.initialSourceDealFingerprint?.
          digestSha256??null,
        sourceOwnerK0Hand:firstOwner?.
          decisionHandBefore?.ownHandPrintings??null,
        nativeT1DceAttached:broad.dceStagingConfirmed,
        nativeGenuineK1SpeedPivot:broad.k1SpeedFallbackSelected,
        nativeOwnerGuzmaHalaPayment:observed.payments.filter(x=>
          x.supporter.some(p=>p.startsWith('Guzma & Hala'))),
        nativeOwnerPlumeriaPayments:observed.payments.filter(x=>
          x.supporter.some(p=>p.startsWith('Plumeria'))),
        nativePlumeriaAudit:plumeriaAudit,
        sourceT1Roots:roots(sourceSeat,1),
        candidateT2Roots:roots(1-sourceSeat,2),
        sourceT3Roots:roots(sourceSeat,3),
        opponentT4Roots:roots(1-sourceSeat,4),
        settledSourceT3VoltCyclone:settled.attacks.filter(x=>
          x.turnBefore===3&&x.attackName==='Volt Cyclone'),
        nativeSourcePlanEvents:broad.events,
        sourceAbortReason:broad.abortReason,
        gameFinished:game.finished??null,
        competitivelyQualified:false
      });
    }catch(error){
      arms.push({status:'native-error',label:arm.label,
        error:String(error?.message??error).slice(0,900)});
    }
  }
  const hashes=arms.map(x=>x.originalSourcePhysicalDealDigest).filter(Boolean);
  return {
    schema:'agent6-prized-thunder-four-payment-preservation-native-v1',
    registration:'results/aichi-2026/registrations/agent6-prized-thunder-discard-preservation-20261030.json',
    originalSourceFirstSeed:seed,
    attemptedNativeArms:arms.length,
    nativeErrors:arms.filter(x=>x.status==='native-error').length,
    identicalOriginalSourcePhysicalDeal:
      hashes.length===reg.arms.length&&new Set(hashes).size===1,
    sameOriginalCandidateT2Roots:arms.length===reg.arms.length&&
      arms.every(x=>Array.isArray(x.candidateT2Roots))&&
      arms.every(x=>JSON.stringify(x.candidateT2Roots)===
        JSON.stringify(arms[0].candidateT2Roots)),
    actualSourceT3SettledAttacks:arms.reduce((n,x)=>
      n+(x.settledSourceT3VoltCyclone?.length??0),0),
    physicalSourceT3GuzmaPayments:arms.reduce((n,x)=>
      n+(x.nativeOwnerGuzmaHalaPayment?.length??0),0),
    qualifiedCompetitiveGames:0,arms
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');
module.exports={run};
