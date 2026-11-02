'use strict';

const assert=require('node:assert/strict');

const VERSION='agent40-owner-exeggutor-blockade-followup-v2-gust-active';
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
 * actual Jet attachment, any required switch, and Blockade attack legality.
 * An opponent's intervening Guzma can gust Exeggutor Active before the
 * owner attacks; directly fund that Active when the opponent leaves it alive.
 *
 * @param {object} view Frozen detached actorObservation of the owner root.
 * @param {object} catalog Immutable public printed card metadata.
 * @returns {object|null} Existing attach-special-energy Bench root.
 */
function chooseOwnerBlockadeContinuation(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic,
    quota=view.ownTurnResources,active=own?.active;
  if(view.globalTurn<=2||!active||
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
        .some(p=>p.startsWith('Temple of Sinnoh '))||
      !own.bench.some(p=>p?.printing===AOR))return null;

  const activeBunnelby=active.printing===BUNNELBY&&
    Array.isArray(active.energies)&&
    active.energies.some(p=>p.startsWith(JET))&&
    Array.isArray(active.tools)&&active.tools.length===0;
  const index=activeBunnelby?
    own.bench.findIndex(p=>p?.printing===EXEGGUTOR):-1;
  const gustedActive=active.printing===EXEGGUTOR;
  const target=gustedActive?active:index>=0?own.bench[index]:null;
  if(!target||!Array.isArray(target.energies)||
      target.energies.length!==0||
      target.specialConditions?.some(x=>
        x===catalog.specialConditions?.ASLEEP||
        x===catalog.specialConditions?.PARALYZED))return null;

  const blockade=target.attacks?.find(a=>a.name==='Blockade'&&
    Array.isArray(a.cost)&&a.cost.length===1&&
    a.cost[0]===catalog.colorlessEnergyType);
  const denied=target.publicRestrictions??{};
  if(!blockade||
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
    printing:view.ownHand[handIndex],
    slot:gustedActive?'active':'bench',
    index:gustedActive?0:index,
    reason:gustedActive?
      'fund-gusted-active-exeggutor-blockade':
      'finish-bunnelby-tm-into-exeggutor-blockade',
    plannedAttackName:'Blockade'};
}

module.exports={VERSION,chooseOwnerBlockadeContinuation};
