'use strict';
const assert=require('node:assert/strict');
const VERSION='agent7-owner-powerglass-next-turn-one-energy-ko-threat-v1';

/**
 * Expose a resource-to-attack possibility to an information-set-safe owner
 * decision policy. The opponent may switch, damage or Knock Out the attacker
 * before the next turn; this function makes no strategy or Store claim.
 *
 * @param {object} actor Detached actorObservation with owner hand and public board
 * @param {{basicEnergyPrintings:Set<string>,colorlessType:number}} catalog
 * @returns {object|null} A conditional payoff proposal, not a forced win
 */
function diagnosePowerglassThreat(actor,catalog){
  assert.ok(catalog.basicEnergyPrintings instanceof Set);
  assert.ok(Number.isSafeInteger(catalog.colorlessType));
  if(actor?.decisionKind!=='owner-root')return null;
  const own=actor.ownPublic,opponent=actor.opponentPublic;
  const active=own?.active,defender=opponent?.active;
  if(!active||!defender||
     own?.publicTurnRestrictions?.toolPlayLocked===true||
     actor.ownTurnResources?.toolPlayLocked===true||
     (active.tools??[]).length!==0)return null;
  const handIndex=actor.ownHand.indexOf('Powerglass SFA');
  if(handIndex<0)return null;
  const energys=own.discard.filter(printing=>catalog.basicEnergyPrintings.has(printing));
  if(energys.length===0)return null;
  const hp=defender.hp-defender.damage;
  if(!Number.isSafeInteger(hp)||hp<=0)return null;
  const candidate=(active.attacks??[]).find(attack=>
    attack.gxAttack!==true&&
    attack.cost?.length===1&&
    attack.cost[0]===catalog.colorlessType&&
    Number.isSafeInteger(attack.damage)&&
    attack.damage>0&&attack.damage>=hp);
  if(!candidate)return null;
  return Object.freeze({
    schema:VERSION,
    kind:'equip-held-powerglass-for-next-turn-single-colorless-threat',
    handIndex,printing:'Powerglass SFA',
    activePrinting:active.printing,attackName:candidate.name,
    printedDamageBeforeModifiers:candidate.damage,
    defenderPrinting:defender.printing,defenderRemainingHp:hp,
    publicEligibleBasicEnergyPrintings:[...new Set(energys)],
    actualStoreAcceptanceUnverified:true,
    opponentCanRespondBeforeAttack:true
  });
}

module.exports={VERSION,diagnosePowerglassThreat};
