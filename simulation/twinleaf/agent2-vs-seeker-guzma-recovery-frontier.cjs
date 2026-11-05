'use strict';

const VERSION='agent2-owner-vs-seeker-guzma-resource-frontier-v1';

/**
 * A strictly owner-observable inventory opportunity for the printed
 * VS Seeker PHF -> previously discarded Guzma BUS route.
 * Never reads opponent concealed zones or proposes a native action.
 *
 * This is a two-step resource opportunity. It does not certify VS Seeker
 * target-prompt resolution, real Store acceptance, paper legality in every
 * effect state, beneficial gust target, or a resulting attack.
 *
 * @param {object} view Detached actorObservation on the acting owner's root.
 * @returns {object|null}
 */
function ownerVsSeekerGuzmaOpportunity(view){
  if(view?.decisionKind!=='owner-root'||view.globalTurn<=1)
    return null;
  const turn=view.ownTurnResources;
  const pub=view.ownPublic;
  if(turn?.supporterPlayedTurn!==0||
     turn?.supporterPlayLocked===true||
     turn?.itemPlayLocked===true||
     pub?.publicTurnRestrictions?.supporterPlayLocked===true||
     pub?.publicTurnRestrictions?.itemPlayLocked===true)
    return null;
  const ownHand=view.ownHand??[];
  if(ownHand.includes('Guzma BUS'))return null;
  const seeker=ownHand.indexOf('VS Seeker PHF');
  if(seeker<0||!pub?.discard?.includes('Guzma BUS'))
    return null;
  if(!(pub.bench??[]).some(Boolean)||
     !(view.opponentPublic?.bench??[]).some(Boolean))
    return null;
  return Object.freeze({
    kind:'unqualified-owner-vsseeker-guzma-opportunity',
    actorSeat:view.actorSeat,
    supportItemPrinting:'VS Seeker PHF',
    supportItemHandIndex:seeker,
    desiredDiscardSupporterPrinting:'Guzma BUS',
    ownerBenchOptions:pub.bench.flatMap((p,index)=>p?[index]:[]),
    opponentBenchOptions:view.opponentPublic.bench
      .flatMap((p,index)=>p?[index]:[]),
    promptResolutionRequired:true,
    supporterPlayStillRequired:true
  });
}

module.exports={VERSION,ownerVsSeekerGuzmaOpportunity};
