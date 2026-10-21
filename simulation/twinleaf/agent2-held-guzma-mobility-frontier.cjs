'use strict';

const assert=require('node:assert/strict');
const {remainingBasicAttachments}=
  require('./agent10-basic-energy-frontier.cjs');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent2-held-guzma-owner-stranded-mobility-v1';

/**
 * Explicit printed Guzma Supporter, excluding Guzma & Hala.
 * A candidate remains subject to native Store legality and prompts.
 * @param {string} fullName Native full printing name.
 * @returns {boolean}
 */
function isGuzma(fullName){
  return /^Guzma [A-Z0-9]{2,6}(?: [0-9]+)?$/.test(fullName);
}

/**
 * A bounded owner-visible attack-funding signal, using only recognized Basic
 * Energy. An unknown Special Energy makes the signal unavailable.
 * @param {object} pokemon Public detached slot.
 * @param {object} catalog Public printed card and numeric Energy catalog.
 * @returns {{minMissing:number,minColored:number}|null}
 */
function attackFunding(pokemon,catalog){
  const provided=[];
  for(const printing of pokemon.energies??[]){
    if(!catalog.basicEnergies.has(printing))return null;
    const type=Object.keys(catalog.basicEnergyTypes).find(name=>
      printing.startsWith(name+' Energy '));
    if(!type)return null;
    provided.push(catalog.basicEnergyTypes[type]);
  }
  const eligible=(pokemon.attacks??[]).filter(attack=>
    !attack.gxAttack&&Array.isArray(attack.cost)&&
    attack.cost.every(Number.isSafeInteger)&&
    Number.isSafeInteger(attack.damage)&&attack.damage>0&&
    pokemon.publicRestrictions?.cannotAttackNextTurn!==true&&
    pokemon.publicRestrictions?.blockedAttackNameNextTurn!==attack.name&&
    pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive!==attack.name&&
    !(pokemon.publicRestrictions?.cannotUseAttacksNextTurn??[])
      .includes(attack.name));
  if(!eligible.length)return null;
  const estimate=eligible.map(attack=>{
    const unused=provided.slice();
    let missingColored=0;
    for(const required of attack.cost){
      if(required===catalog.colorlessEnergyType)continue;
      const index=unused.indexOf(required);
      if(index<0)missingColored++;
      else unused.splice(index,1);
    }
    return {
      minMissing:remainingBasicAttachments(
        attack.cost,provided,catalog.colorlessEnergyType),
      minColored:missingColored
    };
  });
  estimate.sort((a,b)=>a.minMissing-b.minMissing||
    a.minColored-b.minColored);
  return estimate[0];
}

/**
 * Propose one genuine held Guzma as an emergency switch if an otherwise
 * unready Active has an invested Bench attacker with a shorter public
 * printed Basic Energy path. This is a source-agnostic fallback after the
 * higher-priority actor's Energy, attack, retreat and setup opportunities.
 *
 * Guzma additionally gusts an opponent's Bench Pokémon and uses the once-
 * per-turn Supporter resource. This selector does not attempt to value the
 * opponent's switch, resolve either native prompt, or assert tactical merit.
 * Native Store remains responsible for legality.
 *
 * @param {object} view Detached own hand and public board.
 * @param {object} catalog Public card printing catalog.
 * @returns {{kind:'play-held-guzma-mobility',handIndex:number,
 *   printing:string,benchIndex:number,anticipatedMissing:number}|null}
 */
function chooseHeldGuzmaMobility(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const r=view.ownTurnResources;
  if(view.globalTurn===1||!own?.active||
     !Array.isArray(own.bench)||!Array.isArray(view.opponentPublic?.bench)||
     !own.bench.some(Boolean)||!view.opponentPublic.bench.some(Boolean)||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     r?.supporterPlayLocked!==false||
     !Number.isSafeInteger(r.supporterPlayedTurn)||
     r.supporterPlayedTurn===view.globalTurn)return null;
  const handIndex=view.ownHand.findIndex(isGuzma);
  if(handIndex<0)return null;

  // Never gust away from an Active with a currently funded damaging attack.
  const active=own.active;
  if((active.attacks??[]).some(attack=>
    attack.gxAttack!==true&&Number.isSafeInteger(attack.damage)&&
    attack.damage>0&&paysWithBasics(active,attack,catalog)))return null;
  const activeFunding=attackFunding(active,catalog);
  const destinations=[];
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(!pokemon||pokemon.energies?.length===0)continue;
    const funding=attackFunding(pokemon,catalog);
    if(!funding)continue;
    // Prefer the Bench only when its eventual attack is strictly closer, or
    // ties the total deficit while lacking the Active's colored blocker.
    if(activeFunding&&
       !(funding.minMissing<activeFunding.minMissing||
         (funding.minMissing===activeFunding.minMissing&&
          funding.minColored<activeFunding.minColored)))continue;
    destinations.push({benchIndex,...funding});
  }
  destinations.sort((a,b)=>a.minMissing-b.minMissing||
    a.minColored-b.minColored||a.benchIndex-b.benchIndex);
  const best=destinations[0];
  return best?{
    kind:'play-held-guzma-mobility',handIndex,
    printing:view.ownHand[handIndex],benchIndex:best.benchIndex,
    anticipatedMissing:best.minMissing
  }:null;
}

module.exports={VERSION,isGuzma,attackFunding,chooseHeldGuzmaMobility};
