'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent4-plumeria-payment-menu-v1';
const PRINTING = 'Plumeria BUS';

/**
 * Enumerate Plumeria's owner-held physical payment pairs and publicly
 * identifiable opposing Energy targets at a single detached owner root.
 *
 * This enumerates only Plumeria's Energy-denial lines. It does not model
 * using Plumeria solely to discard one's own cards when no opposing Energy
 * is attached. It is a necessary structural opportunity census, not native legality,
 * a playable action, a favorable DCI rating, or an outcome prediction.
 * Payments and targets are separate choice axes, preventing an unbounded
 * Cartesian product of hand pairs with opposing attached Energy cards.
 *
 * @param {object} view Actor-only detached root from actorObservation.
 * @returns {{version:string,reason:string,offers:object[],targets:object[],
 *   totalPaymentPairs:number,nativePlayability:string}}
 */
function collectOwnerPlumeriaPaymentMenu(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  const hand = view.ownHand;
  const own = view.ownPublic;
  const opp = view.opponentPublic;
  assert.ok(Array.isArray(hand) && own && opp);
  const empty = reason => ({version:VERSION,reason,offers:[],targets:[],
    totalPaymentPairs:0,nativePlayability:'unverified'});

  if (view.globalTurn === 1) return empty('paper-first-player-supporter-restricted');
  if (view.ownTurnResources?.supporterPlayedTurn !== 0 ||
      view.ownTurnResources?.supporterPlayLocked === true ||
      own.publicTurnRestrictions?.supporterPlayLocked === true ||
      (own.resolvingSupporter?.length ?? 0) > 0)
    return empty('supporter-quota-or-lock');

  const targetSlots = [
    {slot:'active',index:0,pokemon:opp.active},
    ...(opp.bench ?? []).map((pokemon,index)=>({slot:'bench',index,pokemon}))
  ];
  const targets = targetSlots.flatMap(({slot,index,pokemon}) =>
    (pokemon?.energies ?? []).map((energyPrinting,energyIndex)=>({
      slot,index,pokemonPrinting:pokemon.printing,
      energyIndex,energyPrinting
    })));
  if (targets.length === 0) return empty('no-public-energy-denial-target');

  const plumeriaIndices = hand.flatMap((printing,index) =>
    printing === PRINTING ? [index] : []);
  if (plumeriaIndices.length === 0) return empty('plumeria-not-held');

  const offers = plumeriaIndices.map(handIndex => {
    const eligible = hand.flatMap((printing,index) =>
      index === handIndex ? [] : [{index,printing}]);
    const paymentPairs=[];
    for(let i=0;i<eligible.length;i++){
      for(let j=i+1;j<eligible.length;j++){
        const a=eligible[i],b=eligible[j];
        paymentPairs.push({handIndices:[a.index,b.index],
          printings:[a.printing,b.printing]});
      }
    }
    return {kind:'play-plumeria-payment-menu',printing:PRINTING,handIndex,
      paymentPairs,nativeDispatchImplemented:false,
      paymentChoiceUnscored:true};
  }).filter(o=>o.paymentPairs.length>0);
  if (offers.length === 0) return empty('insufficient-other-hand-cards');

  return {version:VERSION,reason:'paper-structural-necessary-opportunity',
    offers,targets,
    totalPaymentPairs:offers.reduce((n,o)=>n+o.paymentPairs.length,0),
    nativePlayability:'unverified'};
}

module.exports = {VERSION,PRINTING,collectOwnerPlumeriaPaymentMenu};
