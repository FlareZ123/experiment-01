'use strict';

const assert=require('node:assert/strict');

const VERSION='agent41-native-coheld-denial-owner-only-canplay-v1';
const PLUMERIA='Plumeria BUS';
const FLARE='Team Flare Grunt XY';

/**
 * Authenticate a naturally reached coheld Supporter choice through the
 * original Store's own card.canPlay methods. No native action is dispatched.
 * The acting owner's concealed hand is available to that owner, while only
 * the opponent's face-up Energy is consulted.
 *
 * @param {object} view Detached actorObservation owner root.
 * @param {object} state Genuine pinned native State (never exposed to scorer).
 * @param {object} store Genuine pinned native Store.
 * @param {0|1} seat Actual owner seat.
 * @param {number} ordinal Shared owner-root decision ordinal.
 * @returns {object|null} Null if this root has no coheld contest.
 */
function inspectNativeCoheldDenialCanPlay(view,state,store,seat,ordinal){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isSafeInteger(ordinal)&&ordinal>0);
  if(view.globalTurn<=1||
     view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
     view.ownTurnResources?.supporterPlayLocked===true||
     view.ownTurnResources?.supporterPlayedTurn!==0||
     !Array.isArray(view.opponentPublic?.active?.energies)||
     view.opponentPublic.active.energies.length===0||
     !Array.isArray(view.ownHand)||
     !view.ownHand.includes(PLUMERIA)||
     !view.ownHand.includes(FLARE))return null;
  const owner=state?.players?.[seat];
  assert.ok(owner&&state.activePlayer===seat);
  assert.ok(store?.state===state,'Native owner root must be the live Store');
  const hand=owner.hand.cards;
  assert.deepStrictEqual(hand.map(c=>c.fullName),view.ownHand,
    'Authentic original hand physical cards must match detached owner view');
  const candidates={plumeria:[],teamFlare:[]};
  const observe=(printing,into)=>{
    for(let index=0;index<hand.length;index++){
      const card=hand[index];
      if(card.fullName!==printing)continue;
      const before=require('./actor-observation-contract.cjs')
        .actorObservation(state,seat);
      const quota=owner.supporterTurn;
      let nativePlayable=null,error=null;
      try{nativePlayable=card.canPlay(store,state,owner)===true;}
      catch(e){error=String(e?.message??e);}
      const after=require('./actor-observation-contract.cjs')
        .actorObservation(state,seat);
      assert.deepStrictEqual(after,before,
        'Native canPlay inspection changed public owner/root observation');
      assert.equal(owner.supporterTurn,quota,
        'Native canPlay inspection consumed the acting Supporter quota');
      into.push({handIndex:index,printing,nativePlayable,error});
    }
  };
  observe(PLUMERIA,candidates.plumeria);
  observe(FLARE,candidates.teamFlare);
  assert.ok(candidates.plumeria.length>0&&candidates.teamFlare.length>0);
  const paymentPairsPerCopy=hand.length>=3?
    (hand.length-1)*(hand.length-2)/2:0;
  return {
    version:VERSION,globalTurn:view.globalTurn,seat,rootOrdinal:ordinal,
    ownHandCount:hand.length,publicOpposingActiveEnergyCount:
      view.opponentPublic.active.energies.length,
    ownSupporterQuotaAtRoot:owner.supporterTurn,
    plumeria:candidates.plumeria,teamFlare:candidates.teamFlare,
    bothHaveNativePlayablePhysicalCopy:
      candidates.plumeria.some(x=>x.nativePlayable) &&
      candidates.teamFlare.some(x=>x.nativePlayable),
    paperInitialSupporterRestrictionPassed:true,
    physicalPaymentPairsPerPlumeriaCopy:paymentPairsPerCopy,
    nativeActionDispatched:false,nativePromptsResolved:false,
    outcomeUnverified:true
  };
}

module.exports={VERSION,PLUMERIA,FLARE,inspectNativeCoheldDenialCanPlay};
