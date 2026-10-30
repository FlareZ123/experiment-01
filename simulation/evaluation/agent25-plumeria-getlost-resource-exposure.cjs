'use strict';

const assert=require('node:assert/strict');
const {auditPlumeriaHandCosts}=
  require('./agent25-plumeria-native-hand-cost.cjs');
const {auditPlumeriaNextTurns}=
  require('./agent25-plumeria-next-turn-response.cjs');

const VERSION='agent25-native-plumeria-getlost-resource-exposure-v1';
const PRINTED_GET_LOST_EFFECT=
  "Put 2 cards from your opponent's discard pile in the Lost Zone.";

/** @param {string[]} first @param {string[]} second @returns {number} */
function multisetPrintingIntersection(first,second){
  assert.ok(Array.isArray(first)&&Array.isArray(second));
  const counts=new Map();
  for(const printing of first)
    counts.set(printing,(counts.get(printing)??0)+1);
  let total=0;
  for(const printing of second){
    const available=counts.get(printing)??0;
    if(available>0){total++;counts.set(printing,available-1);}
  }
  return total;
}

/**
 * Audit authentic original Store follow-on Girafarig Get Lost to the
 * preceding Plumeria payment cards and opponent's real discard-zone
 * two-card prompt. The effect is printed to move the selected cards
 * into Lost Zone. Native archived sidecar witnesses prompt choice and
 * fully settled attack; physical final Lost-Zone object identities are
 * not captured independently, so provenance is labeled accordingly.
 *
 * @param {object} archive Original Agent38 prior32 native Plumeria JSON.
 * @returns {object} Full fail-closed matched prompt and resource counts.
 */
function auditPlumeriaGetLost(archive){
  const cost=auditPlumeriaHandCosts(archive);
  const continuation=auditPlumeriaNextTurns(archive);
  const byTrial=new Map(archive.result.rows
    .filter(r=>r.trial?.rank===6).map(r=>[r.trial.id,r]));
  const payments=new Map(cost.records.map(p=>
    [p.trialId+'@'+p.turn,p]));
  const events=[];
  for(const next of continuation.records){
    const gets=next.opponentSettledAttacks.filter(a=>
      a.attackName==='Get Lost');
    for(const attack of gets){
      const original=byTrial.get(next.trialId);
      const paid=payments.get(next.trialId+'@'+next.plumeriaTurn);
      assert.ok(original&&paid);
      const sourceSeat=paid.sourceSeat,opponentSeat=1-sourceSeat;
      const root=original.rootActionLedger.filter(a=>
        a.actionOrdinal===attack.rootOrdinal &&
        a.action==='AttackAction' &&
        a.attack==='Get Lost' &&
        a.turnBefore===paid.turn+1 &&
        a.playerSlot===opponentSeat &&
        a.pendingPrompt===null);
      assert.equal(root.length,1,'Missing accepted native Get Lost root');
      const prompts=original.rootActionLedger.filter(a=>
        a.action==='ResolvePromptAction' &&
        a.pendingPrompt==='ChooseCardsPrompt' &&
        a.initiatingRootActionOrdinal===root[0].actionOrdinal &&
        a.playerSlot===opponentSeat &&
        a.turnBefore===paid.turn+1);
      assert.equal(prompts.length,1,'Expected one Get Lost discard-card prompt');
      assert.ok(prompts[0].actionOrdinal>root[0].actionOrdinal);
      assert.ok(prompts[0].actionOrdinal<=attack.completionRootOrdinal);
      const choices=original.nativePromptChoices.events.filter(e=>
        e.ordinal===prompts[0].actionOrdinal &&
        e.turn===paid.turn+1 &&
        e.actorSeat===opponentSeat &&
        e.kind==='ChooseCardsPrompt');
      assert.equal(choices.length,1,
        'Chosen original discard printings lack unique native prompt');
      const selection=choices[0];
      assert.equal(selection.sourceZone,'discard');
      assert.equal(selection.nativePromptMin,2);
      assert.equal(selection.nativePromptMax,2);
      assert.equal(typeof selection.nativePromptAllowCancel,'boolean');
      assert.equal(selection.selectedCards.length,2);
      assert.ok(selection.sourceZoneCardCountBefore>=2);
      assert.equal(paid.selectedOwnerCards.length,2);
      const overlap=multisetPrintingIntersection(
        paid.selectedOwnerCards,selection.selectedCards);
      events.push({trialId:paid.trialId,
        plumeriaTurn:paid.turn,sourceSeat,
        acceptedPlumeriaRootOrdinal:paid.rootOrdinal,
        chosenPlumeriaPaymentCards:[...paid.selectedOwnerCards],
        nextOpponentTurn:paid.turn+1,
        acceptedGetLostRootOrdinal:root[0].actionOrdinal,
        nativeDiscardPromptOrdinal:prompts[0].actionOrdinal,
        nativeDiscardZoneCardCount:selection.sourceZoneCardCountBefore,
        nativePromptAllowsCancel:selection.nativePromptAllowCancel,
        nativeGetLostChosenFromDiscard:[...selection.selectedCards],
        matchingPlumeriaPaymentPrintingInstances:overlap,
        exactTwoPaymentPrintingMultisetMatch:overlap===2,
        sourceDiscardHadExactlyPaymentPlusPlumeria:
          selection.sourceZoneCardCountBefore===3 && overlap===2,
        attackNativeSettled:true,
        physicalLostZoneDestinationObjectNotIndependentlyObserved:true});
    }
  }
  const matched=events.reduce((n,e)=>
    n+e.matchingPlumeriaPaymentPrintingInstances,0);
  return {version:VERSION,
    printedGetLostEffect:PRINTED_GET_LOST_EFFECT,
    sourceSettledPlumeriaChains:cost.settledPlumeriaChains,
    nextOpponentFullySettledGetLost:events.length,
    chosenOpponentDiscardCardPrintings:events.length*2,
    printingInstancesMatchingImmediatePlumeriaPayment:matched,
    nativeGetLostPromptsAllowCancel:events.filter(e=>
      e.nativePromptAllowsCancel).length,
    fullTwoPaymentPrintingMatches:events.filter(e=>
      e.exactTwoPaymentPrintingMultisetMatch).length,
    fullTwoWithExactlyThreeDiscardCards:events.filter(e=>
      e.sourceDiscardHadExactlyPaymentPlusPlumeria).length,
    oneOfTwoPaymentPrintingMatches:events.filter(e=>
      e.matchingPlumeriaPaymentPrintingInstances===1).length,
    records:events,
    competitiveQualifiedGames:0,
    caveat:'Printing-level prompt matches plus a settled native Get Lost attack and printed Lost Zone text, without independent per-object final Lost Zone card tracking; the native Get Lost prompt may allow cancellation even though observed choices resolved two cards; correlated developmental games, no win inference.'};
}

module.exports={VERSION,PRINTED_GET_LOST_EFFECT,
  multisetPrintingIntersection,auditPlumeriaGetLost};
