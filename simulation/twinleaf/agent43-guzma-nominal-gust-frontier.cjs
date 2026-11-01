'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');
const {eligibleDamagingAttack}=
  require('./agent2-held-guzma-mobility-frontier.cjs');

const VERSION='agent43-nominal-guzma-gust-when-first-target-survives-v1';

/**
 * A conservative, opponent-hand-blind target proposal for Guzma's FIRST
 * native ChoosePokemonPrompt. The owner has already selected an incoming
 * Bench attacker; this function never selects the owner's second prompt.
 *
 * A printed fixed damage value is only a nominal estimate. Damage modifiers,
 * attack prevention and competing turn actions remain outside the model.
 * Therefore this is a default-OFF developmental tactic, never a certified KO.
 *
 * The existing native prompt validator, not this function, determines the
 * legally selectable Bench targets.
 *
 * @param {object} view Detached owner prompt observation.
 * @param {{benchIndex:number,anticipatedMissing:number}} plan Own switch plan.
 * @param {{index:number,seat:number,zone:string}[]} offered Native-valid targets.
 * @param {object} catalog Public printed-card and Basic Energy numeric catalog.
 * @returns {{benchIndex:number,firstBenchIndex:number,maxPrintedDamage:number,
 *   targetRemainingHp:number,reason:string}|null}
 */
function chooseNominalGuzmaGust(view,plan,offered,catalog){
  assert.equal(view?.decisionKind,'owner-prompt');
  if(!Number.isSafeInteger(plan?.benchIndex)||
     plan.anticipatedMissing!==0||
     !Array.isArray(offered)||offered.length<2)return null;
  const incoming=view.ownPublic?.bench?.[plan.benchIndex];
  if(!incoming||!Array.isArray(incoming.attacks)||!catalog)return null;
  const nominal=incoming.attacks.filter(attack=>
    eligibleDamagingAttack(incoming,attack,catalog)&&
    paysWithBasics(incoming,attack,catalog)&&
    (attack.damageCalculation===null||
     attack.damageCalculation===undefined)&&
    attack.text===''&&Number.isSafeInteger(attack.damage));
  if(!nominal.length)return null;
  const maxPrintedDamage=Math.max(...nominal.map(move=>move.damage));
  const choices=offered.filter(target=>
    target.seat!==view.actorSeat&&target.zone==='bench'&&
    Number.isSafeInteger(target.index)&&target.index>=0&&
    target.index<view.opponentPublic?.bench?.length);
  if(choices.length<2)return null;
  const projected=choices.map(target=>{
    const pokemon=view.opponentPublic.bench[target.index];
    const valid=Number.isSafeInteger(pokemon?.hp)&&
      Number.isSafeInteger(pokemon?.damage)&&
      pokemon.hp>pokemon.damage&&pokemon.damage>=0;
    return {index:target.index,
      remaining:valid?pokemon.hp-pokemon.damage:null};
  });
  const first=projected[0];
  if(first.remaining===null||first.remaining<=maxPrintedDamage)return null;
  const candidates=projected.slice(1).filter(target=>
    target.remaining!==null&&target.remaining<=maxPrintedDamage);
  if(!candidates.length)return null;
  candidates.sort((a,b)=>a.remaining-b.remaining||a.index-b.index);
  return {
    benchIndex:candidates[0].index,firstBenchIndex:first.index,
    maxPrintedDamage,targetRemainingHp:candidates[0].remaining,
    reason:'fixed-printed-damage-nominal-KO-where-first-native-option-survives'
  };
}

module.exports={VERSION,chooseNominalGuzmaGust};
