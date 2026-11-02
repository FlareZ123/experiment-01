'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent6-owner-public-skyliner-rondo-mobility-v1';

/**
 * Owner-only source-line alternative: an uncharged Latias ex with Skyliner
 * can attempt to retreat into a funded JTG Clefairy. Printed Skyliner,
 * in-play Ability suppression, genuine Retreat cost, and full damage are
 * finally adjudicated by Store; this is a paper-uncertified offer.
 *
 * A genuinely payable attack by the current Active has priority, and an
 * otherwise current-turn-used retreat must be protected. No hidden zones or
 * opponent names, ranks, seed IDs or physical seats enter this function.
 *
 * @param {object} view Deeply frozen authenticated actor owner-root view.
 * @param {object} catalog Public native basic Energy/status metadata.
 * @returns {{kind:'skyliner-rondo-retreat',benchIndex:number,
 *   printing:string,attackName:string,estimatedBaseDamage:number,
 *   reason:string}|null}
 */
function chooseOwnerSkylinerRondoRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,r=view.ownTurnResources;
  if(view.globalTurn===1||active?.printing!=='Latias ex SSP'||
     !active.abilities?.includes('Skyliner')||
     !Array.isArray(own.bench)||!r||
     r.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(s=>
       s===catalog.specialConditions.ASLEEP||
       s===catalog.specialConditions.PARALYZED))return null;
  // If Latias has Energy or can itself do positive immediate attack damage,
  // use existing attack/attachment arbitration rather than overriding it.
  if(!Array.isArray(active.energies)||active.energies.length>0||
     active.attacks?.some(attack=>
       Number.isSafeInteger(attack.damage)&&attack.damage>0&&
       paysWithBasics(active,attack,catalog)))return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(pokemon?.printing!=="Lillie's Clefairy ex JTG"||
       !Array.isArray(pokemon.energies)||
       pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(s=>
         s===catalog.specialConditions.ASLEEP||
         s===catalog.specialConditions.PARALYZED))continue;
    const rondo=pokemon.attacks?.find(a=>a.name==='Full Moon Rondo');
    if(!rondo||!paysWithBasics(pokemon,rondo,catalog))continue;
    return {kind:'skyliner-rondo-retreat',benchIndex,
      printing:pokemon.printing,attackName:rondo.name,
      estimatedBaseDamage:20+20*(own.bench.filter(Boolean).length+
        (view.opponentPublic?.bench?.filter(Boolean).length??0)),
      reason:'owner-public-free-retreat-into-funded-rondo'};
  }
  return null;
}

module.exports={VERSION,chooseOwnerSkylinerRondoRetreat};
