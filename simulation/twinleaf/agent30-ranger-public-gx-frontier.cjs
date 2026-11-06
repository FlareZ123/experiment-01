'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=
  require('./actor-observation-contract.cjs');

const VERSION='agent30-public-paid-gx-ranger-proposal-v1';
const RANGER='Pokemon Ranger STS';

/**
 * Add two already-public, continuing GX-attack effects to a detached
 * player observation. Their origins are an announced paid Altered Creation-GX
 * attack; the Store flags record whether the effect is still active after
 * any intervening Ranger use. No concealed-zone card is inspected here.
 *
 * This is a separately opt-in interface; the default actor observation
 * schema, shared policy profile and original 60-card inventories stay
 * untouched. The object returned to an actor is deeply detached and frozen.
 *
 * @param {object} state Real pinned Store state, read only.
 * @param {0|1} seat Physical actor seat.
 * @param {object} [baseView] Optional independent ordinary actor view.
 * @returns {object} Read-only actor view with explicit public effects.
 */
function observePublicPaidGxEffects(state,seat,baseView){
  assert.ok(seat===0||seat===1);
  assert.equal(state?.players?.length,2);
  const original=baseView??actorObservation(state,seat);
  assert.equal(original.actorSeat,seat);
  const effect=player=>Object.freeze({
    alteredCreationBonusDamage:player.alteredCreationDamage===true,
    alteredCreationBonusPrize:player.usedAlteredCreation===true
  });
  const ownPublic=Object.freeze({
    ...original.ownPublic,
    continuingPaidGxAttack:effect(state.players[seat])
  });
  const opponentPublic=Object.freeze({
    ...original.opponentPublic,
    continuingPaidGxAttack:effect(state.players[1-seat])
  });
  return Object.freeze({...original,ownPublic,opponentPublic});
}

/**
 * Deliberately conservative proposal for an owner-visible paid GX
 * response. It never searches deck, samples Prizes, or looks at the
 * opponent's hand. The gain/tempo of actually spending the Supporter
 * is unresolved; this offer is developmental and default-off.
 *
 * @param {object} view Detached actor-only view (augmented above).
 * @returns {object|null} Native-neutral action proposal.
 */
function proposeRangerAfterPaidGx(view){
  if(view?.decisionKind!=='owner-root')return null;
  const r=view.ownTurnResources;
  if(r.supporterPlayLocked||r.supporterPlayedTurn!==0||
      view.ownPublic.resolvingSupporter.length>0)return null;
  const threat=view.opponentPublic?.continuingPaidGxAttack;
  if(threat?.alteredCreationBonusPrize!==true)return null;
  // Ranger affects *both* players' continuing attack effects. Avoid
  // cancelling a benefit from our own paid GX without comparing payouts.
  if(view.ownPublic?.continuingPaidGxAttack?.
      alteredCreationBonusPrize===true)return null;
  // Keep a conservative explicit Active Ability Supporter-lock veto.
  // Other Ability suppressors can make this case legal in some states;
  // retaining a false negative is safer than an invalid native action.
  const active=view.opponentPublic?.active;
  if(active?.printing==='Stoutland BCR'&&
     active.abilities?.includes('Sentinel'))return null;
  const handIndex=view.ownHand.indexOf(RANGER);
  if(handIndex<0)return null;
  return {
    kind:'play-ranger-paid-gx',
    printing:RANGER,handIndex,
    source:VERSION,
    trigger:'opponent-active-paid-Altered-Creation-extra-Prize'
  };
}

module.exports={VERSION,RANGER,observePublicPaidGxEffects,
  proposeRangerAfterPaidGx};
