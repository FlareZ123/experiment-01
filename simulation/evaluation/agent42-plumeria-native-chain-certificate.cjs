'use strict';
const assert=require('node:assert/strict');
/**
 * Narrow evidence classifier for an actual source Plumeria BUS root.
 * Requires real native physical owner payment, target-Energy effect, root
 * provenance and a subsequent opponent policy action. This does not certify
 * unrelated card effects, the match winner, decisions or match clock.
 * @param {object} row Native selected trial, with unredacted public root ledger.
 * @param {object[]} payments Real Store post-payment physical object receipts.
 * @param {object[]} effects Real Store post-effect physical Energy receipts.
 * @returns {object} One receipt per source Plumeria root, never a game win.
 */
function sourcePlumeriaActionCertificates(row,payments,effects){
 assert.ok(row?.trial&&Array.isArray(row.rootActionLedger));
 assert.ok(Array.isArray(payments)&&Array.isArray(effects));
 const sourceSeat=row.trial.candidateSlot==='A'?1:0;
 const roots=row.rootActionLedger;
 const promptEvents=row.nativePromptChoices?.events??[];
 const sourcePlays=roots.filter(r=>r.playerSlot===sourceSeat&&
  r.action==='PlayCardAction'&&r.card==='Plumeria');
 return sourcePlays.map(play=>{
  const chain=roots.filter(r=>r.initiatingRootActionOrdinal===
   play.actionOrdinal&&r.action==='ResolvePromptAction');
  const cost=chain.find(r=>r.pendingPrompt==='ChooseCardsPrompt');
  const target=chain.find(r=>r.pendingPrompt==='ChoosePokemonPrompt'&&
   r.actionOrdinal>(cost?.actionOrdinal??Infinity));
  const energy=chain.find(r=>r.pendingPrompt==='ChooseCardsPrompt'&&
   r.actionOrdinal>(target?.actionOrdinal??Infinity));
  const nativeCost=promptEvents.find(e=>e.ordinal===cost?.actionOrdinal&&
   e.actorSeat===sourceSeat&&e.kind==='ChooseCardsPrompt'&&
   e.nativePromptMin===2&&e.nativePromptMax===2&&
   Array.isArray(e.selectedCards)&&e.selectedCards.length===2);
  const nativeEnergy=promptEvents.find(e=>e.ordinal===energy?.actionOrdinal&&
   e.actorSeat===sourceSeat&&e.kind==='ChooseCardsPrompt'&&
   e.nativePromptMin===1&&e.nativePromptMax===1&&
   Array.isArray(e.selectedCards)&&e.selectedCards.length===1);
  const sorted=arr=>JSON.stringify([...arr].sort());
  const paid=payments.find(p=>p.ownerSeat===sourceSeat&&
   p.globalTurnAfter===play.turnBefore&&p.independentlyPaidTwo===true&&
   nativeCost&&Array.isArray(p.paymentNames)&&
   sorted(p.paymentNames)===sorted(nativeCost.selectedCards));
  const removed=effects.find(e=>e.ownerSeat===sourceSeat&&
   paid&&e.nativeStoreOrdinal===paid.nativeStoreOrdinal&&
   e.paymentIndependentlyPaidTwo===true&&
   e.independentEnergyRemoval===true&&nativeEnergy&&
   e.energyPrinting===nativeEnergy.selectedCards[0]);
  const sourceCompletion=roots.find(r=>r.playerSlot===sourceSeat&&
   ['PassTurnAction','AttackAction'].includes(r.action)&&
   r.actionOrdinal>(energy?.actionOrdinal??Infinity)&&
   r.turnBefore===play.turnBefore);
  const opponentResponse=roots.find(r=>r.playerSlot!==sourceSeat&&
   r.actionOrdinal>(sourceCompletion?.actionOrdinal??Infinity)&&
   Number.isSafeInteger(r.actorPolicyDecisionOrdinal)&&
   r.turnBefore>play.turnBefore);
  const checks={
   nativeCostPrompt:Boolean(cost&&nativeCost),
   nativeOpponentTargetPrompt:Boolean(target),
   nativeEnergySelection:Boolean(energy&&nativeEnergy),
   physicalTwoCardPayment:Boolean(paid),
   physicalOpponentEnergyRemoval:Boolean(removed),
   actualSourceTurnCompletion:Boolean(sourceCompletion),
   subsequentOpponentPolicyRoot:Boolean(opponentResponse)
  };
  return {registeredTrialId:row.trial.id,sourceRank:row.trial.rank,
   sourceSeat,playOrdinal:play.actionOrdinal,playTurn:play.turnBefore,
   costPromptOrdinal:cost?.actionOrdinal??null,
   targetPromptOrdinal:target?.actionOrdinal??null,
   energyPromptOrdinal:energy?.actionOrdinal??null,
   sourceTurnCompletionOrdinal:sourceCompletion?.actionOrdinal??null,
   sourceTurnCompletionAction:sourceCompletion?.action??null,
   sourcePassOrdinal:sourceCompletion?.action==='PassTurnAction'?
    sourceCompletion.actionOrdinal:null,
   opponentContinuation:opponentResponse?{
    ordinal:opponentResponse.actionOrdinal,turn:opponentResponse.turnBefore,
    action:opponentResponse.action,
    attack:opponentResponse.attack??null,card:opponentResponse.card??null}:null,
   physicalPaidCardNames:paid?.paymentNames??null,
   physicalRemovedEnergyPrinting:removed?.energyPrinting??null,
   checks,allLocalChecksPassed:Object.values(checks).every(Boolean),
   qualifiedCompetitiveGames:0,
   scope:'Only the printed Plumeria action and subsequent opponent policy root; no full-game certification'};
 });
}
module.exports={sourcePlumeriaActionCertificates};
