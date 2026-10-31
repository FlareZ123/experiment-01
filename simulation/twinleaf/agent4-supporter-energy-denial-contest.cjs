'use strict';

const assert = require('node:assert/strict');
const {collectOwnerPlumeriaPaymentMenu} =
  require('./agent4-plumeria-payment-menu.cjs');

const VERSION = 'agent4-owner-supporter-energy-denial-contest-v1';
const FLARE_PRINTING = 'Team Flare Grunt XY';

/**
 * Compare only the *public Energy targets* and physical owner-hand costs of
 * two distinct Supporter families. Team Flare Grunt can reach attached
 * Energy on the opposing Active; Plumeria can reach opposing Bench Energy
 * but needs two other owner-hand cards. The two proposed actions consume
 * different Supporter cards and must not be treated as true value dominance.
 *
 * @param {object} view Frozen, detached actorObservation owner-root.
 * @returns {object} Read-only physical choice-space comparison.
 */
function compareOwnerEnergyDenialSupporters(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  const plumeria = collectOwnerPlumeriaPaymentMenu(view);
  const flareIndices = view.ownHand.flatMap((name,index) =>
    name === FLARE_PRINTING ? [index] : []);
  const locked = view.globalTurn === 1 ||
    view.ownTurnResources?.supporterPlayedTurn !== 0 ||
    view.ownTurnResources?.supporterPlayLocked === true ||
    view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked === true ||
    (view.ownPublic?.resolvingSupporter?.length ?? 0) > 0;
  const activeTargets = locked ? [] :
    (view.opponentPublic?.active?.energies ?? []).map(
      (printing,energyIndex)=>({
        slot:'active',index:0,
        pokemonPrinting:view.opponentPublic.active.printing,
        energyIndex,energyPrinting:printing
      }));
  const flare = locked ? [] : flareIndices.map(handIndex => ({
    kind:'play-team-flare-grunt-denial',
    printing:FLARE_PRINTING,handIndex,
    publicTargets:activeTargets,
    nativePlayability:'unverified'
  })).filter(offer=>offer.publicTargets.length>0);
  const plumeriaOffers=plumeria.offers;
  const physicalPaymentPairs=plumeriaOffers.flatMap(
    offer=>offer.paymentPairs.map(pair=>({plumeriaIndex:offer.handIndex,
      ...pair})));
  const discardingFlare=physicalPaymentPairs.filter(pair=>
    pair.handIndices.some(index=>flareIndices.includes(index)));
  const preservingFlare=physicalPaymentPairs.filter(pair=>
    pair.handIndices.every(index=>!flareIndices.includes(index)));
  const sharedTargets=plumeria.targets.filter(target=>
    target.slot==='active'&&activeTargets.some(active=>
      active.energyIndex===target.energyIndex&&
      active.energyPrinting===target.energyPrinting));
  const benchExclusiveTargets=plumeria.targets.filter(
    target=>target.slot==='bench');
  return {
    version:VERSION,
    physicalFlareHeld:flareIndices.length,
    flare,
    plumeriaReason:plumeria.reason,
    plumeriaOffers:plumeriaOffers.length,
    plumeriaPhysicalPaymentPairs:physicalPaymentPairs.length,
    plumeriaPairsConsumingFlare:discardingFlare.length,
    plumeriaPairsPreservingFlare:preservingFlare.length,
    sharedActiveEnergyTargets:sharedTargets,
    plumeriaExclusiveBenchEnergyTargets:benchExclusiveTargets,
    supporterQuotaContended:flare.length>0&&plumeriaOffers.length>0,
    onBoardTargetEquivalenceIsNotCardValueDominance:true,
    bothNativePlayabilitiesUnverified:true,
    policyActionChosen:false
  };
}

module.exports = {VERSION,FLARE_PRINTING,compareOwnerEnergyDenialSupporters};
