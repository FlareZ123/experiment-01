'use strict';

const assert=require('node:assert/strict');
const {chooseActorEnergyRecipient}=
  require('./agent44-actor-energy-recipient.cjs');

const VERSION='agent6-public-active-energy-scaling-risk-v1';

/**
 * Returns the increase in a public opposing Active's printed attack damage
 * for attaching one Basic Energy to our Active, if its text explicitly says
 * so. This intentionally does not claim the opponent can announce the attack
 * on its next turn or that modifiers/locks allow the printed damage.
 *
 * @param {object} opponentPublic Detached opponent visible board.
 * @returns {number}
 */
function printedActiveEnergyScaling(opponentPublic){
  const attacks=opponentPublic?.active?.attacks??[];
  let bonus=0;
  for(const attack of attacks){
    const match=typeof attack.text==='string'?
      attack.text.match(/this attack does (\d+) more damage for each energy attached to your opponent's active pok[eé]mon/i):
      null;
    if(match){
      const amount=Number(match[1]);
      if(Number.isSafeInteger(amount)&&amount>bonus)bonus=amount;
    }
  }
  return bonus;
}

/**
 * Guard a planned Basic attachment to an unready Active against a public
 * source attack whose damage explicitly scales with the recipient's Energy.
 * Reuse the tested generic recipient for a Bench-only alternative by removing
 * Active attacks from a shallow, detached decision-view copy. If no credited
 * Bench plan exists, preserve the held Energy and let the original policy
 * consider its non-Energy actions. This is a planning hypothesis, not a
 * native legality or matchup-outcome prediction.
 *
 * @param {object} view Frozen detached actor observation.
 * @param {object} catalog Public typed card catalog.
 * @param {object|null} recipient Generic proposed Basic Energy recipient.
 * @returns {{triggered:boolean,recipient:object|null,bonusDamage:number}}
 */
function guardActiveEnergyExposure(view,catalog,recipient){
  assert.equal(view.decisionKind,'owner-root');
  if(!recipient||recipient.slot!=='active'||
      !Number.isSafeInteger(recipient.gapAfter)||recipient.gapAfter===0){
    return {triggered:false,recipient,bonusDamage:0};
  }
  const bonusDamage=printedActiveEnergyScaling(view.opponentPublic);
  if(bonusDamage===0)return {triggered:false,recipient,bonusDamage:0};
  const viewWithoutActiveAttacks={
    ...view,
    ownPublic:{
      ...view.ownPublic,
      active:{...view.ownPublic.active,attacks:[]}
    }
  };
  const bench=chooseActorEnergyRecipient(viewWithoutActiveAttacks,catalog);
  assert.ok(bench===null||bench.slot==='bench');
  return {triggered:true,recipient:bench,bonusDamage};
}

module.exports={VERSION,printedActiveEnergyScaling,
  guardActiveEnergyExposure};
