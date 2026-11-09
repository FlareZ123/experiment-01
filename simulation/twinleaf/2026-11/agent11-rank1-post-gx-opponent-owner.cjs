'use strict';

const { actorObservation } =
  require('../actor-observation-contract.cjs');

/**
 * Observe only the original opponent's own information set immediately after
 * its truly accepted Skyliner Retreat into Girafarig and before the already
 * prescribed Pass. This is a forked owner-policy research observation; no
 * data from it is furnished to the source-player decision module.
 *
 * @param {{state:object,ownerId:number,opponentId:number}} context
 * @returns {object}
 */
function inspectOpponentPostGXRetreat(context){
  const {state,ownerId,opponentId}=context;
  const seat=state.players.findIndex(p=>p.id===opponentId);
  if(seat<0)throw new Error('Authentic opponent-owner seat absent');
  const observed=actorObservation(state,seat);
  const active=observed.ownPublic.active;
  const opponentPublic=observed.opponentPublic;
  const hand=observed.ownHand;
  return {
    version:'agent11-original-rank1-postgx-opponent-owner-information-v1',
    status:'opponent-own-root-observation',
    ownerId:opponentId,
    sourceOpponentId:ownerId,
    ownerSeat:seat,
    ownerTurn:observed.globalTurn,
    decisionKind:observed.decisionKind,
    ownHand:hand,
    ownHandCardCount:hand.length,
    ownActive:active?.printing??null,
    ownActiveEnergy:active?.energies?.slice()??[],
    ownBench:observed.ownPublic.bench.filter(Boolean)
      .map(p=>({printing:p.printing,energy:p.energies.slice(),
        canEvolveFromTurn:p.lastPlayedOrEvolvedTurn})),
    sourceActive:opponentPublic.active?.printing??null,
    sourceActiveEnergy:opponentPublic.active?.energies?.slice()??[],
    ownerTurnResources:observed.ownTurnResources,
    spectatorOrSourceHiddenAccess:false,
    originalSourcePhysicalStateNotModified:true,
    nativeActionAttempted:false,
    competitiveQualifiedGames:0
  };
}

module.exports={inspectOpponentPostGXRetreat};
