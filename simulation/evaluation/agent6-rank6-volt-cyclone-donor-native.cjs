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
const {withSourceVoltCycloneEnergyDonor}=
  require('../twinleaf/agent6-volt-cyclone-donor-choice.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent6-rank6-volt-attach-prompt-donor-corrected-20261030.json');

/** Native six-arm original-source physical donor-choice study, not win evidence. */
function run(){
  const reg=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(reg.schema,
    'agent6-original-volt-attach-energy-prompt-corrected-owner-six-arm-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>d.rank===reg.originalCandidateRank);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(x=>x.rank===reg.originalSourceRank);
  assert.equal(source?.status,'ready');
  const {selectedSourceSeat:seat,selectedSeed:seed}=reg;
  assert.equal(seat,0);
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,seed,
    maxActions:reg.common.maxActions,strictPromptValidation:true,
    captureDecisionTrace:true,capturePublicAttackTransitions:true,
    captureInitialSourceDealFingerprintSeat:seat,captureStartingBoard:true
  };
  const arms=[];
  for(const arm of reg.arms){
    try{
      const first=withGoFirstChoice([true,false],()=>
        withCanonicalActorOnlyPolicy(()=>
          withBroadThornsSourceAttack(
            ()=>withSourceVoltCycloneEnergyDonor(
              ()=>runMatch(request),
              {seat,donorName:arm.donor==='native-baseline'?undefined:arm.donor}
            ),{
              seat,turn:3,
              stageSpeedLightningFirstTurn:arm.order==='speed-first',
              stageDceFirstTurn:arm.order==='dce-first',
              turn3DirectSpeedAfterDce:arm.order==='dce-first',
              liveSpeedLightningAlternative:true,
              playLockAwareOpening:true,
              k1ReplanAfterTagCall:true,
              k1PrizedThunderSpeedFallback:false
            }
          )
        )
      );
      const broad=first.result.result;
      const chosen=broad.result;
      const game=chosen.result;
      assert.equal(game.firstTurnSlot,seat);
      assert.equal(game.verifiedByDrawLog,true);
      const settled=candidateAttackSettlement(game,seat);
      const sourceSettled=settled.attacks.filter(x=>
        x.turnBefore===3&&x.attackName==='Volt Cyclone');
      const roots=(s,turn)=>(game.rootActionLedger??[])
        .filter(x=>x.playerSlot===s&&x.turnBefore===turn&&
          x.pendingPrompt===null)
        .map(x=>({ordinal:x.actionOrdinal,action:x.action,
          card:x.card??null,attack:x.attack??null}));
      const firstOwner=(game.decisionTrace??[]).find(x=>
        x.playerSlot===seat&&x.turnBefore===1&&
        x.action!=='ResolvePromptAction'&&
        x.decisionHandBefore?.perspectiveSeat===seat);
      arms.push({
        label:arm.label,status:'native-complete-or-capped',
        sourceActualFirst:true,
        originalSourcePhysicalDealDigest:
          game.initialSourceDealFingerprint?.digestSha256??null,
        originalSourceK0Hand:firstOwner?.
          decisionHandBefore?.ownHandPrintings??null,
        nativeSpeedStage:broad.speedStagingConfirmed,
        nativeDceStage:broad.dceStagingConfirmed,
        nativeDirectSpeedSelected:broad.directSpeedSecondTurnSelected,
        sourceT1Roots:roots(seat,1),
        opponentT2Roots:roots(1-seat,2),
        sourceT3Roots:roots(seat,3),
        opponentT4Roots:roots(1-seat,4),
        ownerMovePromptAudit:chosen.audit,
        sourceT3SettledVoltCyclone:sourceSettled,
        sourceAbort:broad.abortReason,
        gameFinished:game.finished??null,
        competitiveQualified:false
      });
    }catch(error){
      arms.push({label:arm.label,status:'native-error',
        error:String(error?.message??error).slice(0,900)});
    }
  }
  const real=arms.filter(x=>x.status!=='native-error');
  const hashes=real.map(x=>x.originalSourcePhysicalDealDigest);
  return {
    schema:'agent6-original-rank6-volt-cyclone-energy-donor-six-native-v1',
    registration:'results/aichi-2026/registrations/agent6-rank6-volt-attach-prompt-donor-corrected-20261030.json',
    attemptedNativeArms:arms.length,
    nativeErrors:arms.length-real.length,
    samePhysicalSourceOriginalDeal:hashes.length===arms.length&&
      hashes.every(x=>typeof x==='string'&&x===hashes[0]),
    sourceT3AttacksSettled:arms.reduce((n,x)=>
      n+(x.sourceT3SettledVoltCyclone?.length??0),0),
    realOwnerPromptIntentCount:arms.reduce((n,x)=>
      n+(x.ownerMovePromptAudit?.preferredAttachEnergyResultsSelected??0),0),
    realOwnerMoveAcceptedCount:arms.reduce((n,x)=>
      n+(x.ownerMovePromptAudit?.preferredPhysicallyMoved??0),0),
    competitiveQualifiedGames:0,arms
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');
module.exports={run};
