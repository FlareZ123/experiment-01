'use strict';

const assert=require('node:assert/strict');

const VERSION='agent40-owner-exeggutor-blockade-followup-v1';
const BUNNELBY='Bunnelby PRC';
const EXEGGUTOR='Exeggutor PLF';
const AOR='Vileplume AOR';
const JET='Jet Energy ';

/**
 * Owner-public continuation of the original rank2 Bunnelby/TM double
 * Evolution, adapted to Agent18's fixed Exeggutor challenger v2.
 *
 * The generic Jet Bench rescue protects an already-payable Active attack,
 * including Bunnelby's one-Colorless Burrow and Rototiller. Here that
 * generic priority can miss the next-turn Blockade Supporter lock.
 * This deliberately narrow, opt-in preference preserves an immediate
 * Bunnelby mill-to-deckout when the opposing deck has one card or fewer.
 *
 * Only the acting player's own hand and face-up public information are
 * considered. This proposes one native action; the Store must still prove
 * actual Jet attachment, switch, and Blockade attack legality.
 *
 * @param {object} view Frozen detached actorObservation of the owner root.
 * @param {object} catalog Immutable public printed card metadata.
 * @returns {object|null} Existing attach-special-energy Bench root.
 */
function chooseOwnerBlockadeContinuation(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic,
    quota=view.ownTurnResources,active=own?.active;
  if(view.globalTurn<=2||!active||active.printing!==BUNNELBY||
      !Array.isArray(active.energies)||
      !active.energies.some(p=>p.startsWith(JET))||
      !Array.isArray(active.tools)||active.tools.length!==0||
      !Array.isArray(own.bench)||!Array.isArray(view.ownHand)||
      opponent?.deckCount<=1||
      opponent?.publicTurnRestrictions?.supporterPlayLocked===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      quota?.energyPlayedTurn===view.globalTurn||
      quota?.energyPlayLocked===true||
      quota?.specialEnergyPlayLocked===true||
      own.publicTurnRestrictions?.energyPlayLocked===true||
      own.publicTurnRestrictions?.specialEnergyPlayLocked===true||
      [...(own.stadium??[]),...(opponent?.stadium??[])]
        .some(p=>p.startsWith('Temple of Sinnoh ')))return null;

  const index=own.bench.findIndex(p=>p?.printing===EXEGGUTOR);
  if(index<0||!own.bench.some(p=>p?.printing===AOR))return null;
  const target=own.bench[index];
  const blockade=target.attacks?.find(a=>a.name==='Blockade'&&
    Array.isArray(a.cost)&&a.cost.length===1&&
    a.cost[0]==='Colorless');
  const denied=target.publicRestrictions??{};
  if(!blockade||!Array.isArray(target.energies)||
      target.energies.length!==0||
      denied.cannotAttackNextTurn===true||
      denied.blockedAttackNameNextTurn==='Blockade'||
      denied.blockedAttackNameUntilLeavesActive==='Blockade'||
      denied.onlyAllowedAttackNameNextTurn&&
        denied.onlyAllowedAttackNameNextTurn!=='Blockade'||
      denied.cannotUseAttacksNextTurn?.includes('Blockade'))return null;

  const handIndex=view.ownHand.findIndex(p=>p.startsWith(JET)&&
    catalog.specialEnergies instanceof Set&&catalog.specialEnergies.has(p));
  if(handIndex<0)return null;
  return {kind:'attach-special-energy',handIndex,
    printing:view.ownHand[handIndex],slot:'bench',index,
    reason:'finish-bunnelby-tm-into-exeggutor-blockade',
    plannedAttackName:'Blockade'};
}

module.exports={VERSION,chooseOwnerBlockadeContinuation};
