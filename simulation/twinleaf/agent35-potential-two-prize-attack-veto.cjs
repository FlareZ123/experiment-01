'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent35-visible-potential-two-prize-terminal-veto-v1';

/**
 * A conservative potential-finisher warning for an actor-root arbiter. This
 * is not a live Store damage/Prize prediction. It relies exclusively on the
 * acting player's detached printed card and public board observations.
 *
 * @param {object} view Authenticated actorObservation owner root.
 * @param {object} first Already selected native-neutral attack intent.
 * @returns {{protect:boolean,reason:string,opponentPrinting?:string,
 *   printedDamage?:number,opponentRemainingHp?:number}}
 */
function potentialTwoPrizeAttackVeto(view,first) {
  assert.equal(view.decisionKind,'owner-root');
  if(first?.kind!=='attack'||view.ownPublic?.prizeCount!==2)
    return {protect:false,reason:'outside-two-prize-attack-window'};
  const opponent=view.opponentPublic?.active;
  const own=view.ownPublic?.active;
  const p=opponent?.printing;
  // These name suffixes are a *lower-bound proxy* for the printed two-Prize
  // Rule. An actual prize-changing effect can still defeat the win condition.
  // Other card names are explicitly unsupported rather than guessed.
  if(typeof p!=='string'||!(/-GX\s|(?:^|\s)(?:V|VSTAR|VMAX|ex|EX)(?:\s|$)/.test(p)))
    return {protect:false,reason:'unverified-two-prize-target'};
  if(opponent.energies?.some(energy=>energy.startsWith('Legacy Energy '))||
     opponent.tools?.some(tool=>tool.startsWith('Life Dew ')))
    return {protect:false,reason:'visible-prize-reduction-unmodeled'};
  const attack=own?.attacks?.find(a=>a.name===first.attackName);
  const remainingHp=opponent.hp-opponent.damage;
  if(!attack||!Number.isSafeInteger(attack.damage)||
     attack.damageCalculation!==undefined&&attack.damageCalculation!==null||
     !Number.isSafeInteger(remainingHp)||remainingHp<=0||
     attack.damage<remainingHp)
    return {protect:false,reason:'no-verified-printed-fixed-damage-threshold'};
  return {protect:true,reason:'potential-two-prize-finishing-attack',
    opponentPrinting:p,printedDamage:attack.damage,
    opponentRemainingHp:remainingHp};
}

module.exports={VERSION,potentialTwoPrizeAttackVeto};
