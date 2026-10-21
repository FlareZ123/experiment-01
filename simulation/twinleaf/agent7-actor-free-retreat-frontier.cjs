'use strict';

const assert=require('node:assert/strict');

/**
 * Pay printed costs using public attached Basic Energy only. Unknown
 * Special Energy contributes no units until another model handles it.
 * @param {object} slot Detached face-up Pokémon.
 * @param {object} attack Printed attack.
 * @param {object} catalog Public card-printing catalog.
 * @returns {boolean}
 */
function paysWithBasics(slot,attack,catalog){
  const types=[];
  for(const printing of slot.energies){
    if(!catalog.basicEnergies.has(printing))return false;
    const entry=Object.entries(catalog.basicEnergyTypes).find(([name])=>
      printing.startsWith(name+' Energy '));
    if(!entry)return false;
    types.push(entry[1]);
  }
  if(!Array.isArray(attack.cost))return false;
  const left=types.slice();
  for(const required of attack.cost){
    if(required===catalog.colorlessEnergyType)continue;
    const at=left.indexOf(required);
    if(at<0)return false;
    left.splice(at,1);
  }
  return left.length>=attack.cost.filter(type=>
    type===catalog.colorlessEnergyType).length;
}

/**
 * Conservative free RetreatAction to an already funded Benched potential KO.
 * Retains the active position if normal printed retreat is nonzero, the
 * once-turn retreat was used, the Active has Energy or a zero-cost attack,
 * or the candidate Bench cannot pay its fixed positive printed attack.
 * Printed base damage alone does not guarantee a true KO: the native
 * Store still arbitrates all active rules and damage effects.
 *
 * @param {object} view Deeply frozen owner observation.
 * @param {object} catalog Public Basic Energy and status enums.
 * @returns {object|null} Native-neutral action intent.
 */
function chooseFreeRetreatToPotentialKo(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own.active,foe=view.opponentPublic?.active;
  if(!active||!foe||view.globalTurn===1)return null;
  const r=view.ownTurnResources;
  if(!Number.isSafeInteger(r?.retreatedTurn)||
      r.retreatedTurn===view.globalTurn)return null;
  if(own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  if(!Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length!==0)return null;
  if(active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(type=>
       type===catalog.specialConditions.ASLEEP||
       type===catalog.specialConditions.PARALYZED))return null;
  if(active.energies?.length!==0||
     active.attacks?.some(attack=>Array.isArray(attack.cost)&&
       attack.cost.length===0))return null;

  if(!Number.isSafeInteger(foe.hp)||!Number.isSafeInteger(foe.damage))return null;
  const remaining=foe.hp-foe.damage;
  if(remaining<=0)return null;

  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const slot=own.bench[benchIndex];
    if(!slot||slot.publicRestrictions?.cannotAttackNextTurn===true)continue;
    const attack=slot.attacks?.find(move=>
      move.gxAttack!==true&&Number.isSafeInteger(move.damage)&&
      move.damage>0&&move.damage>=remaining&&
      (move.damageCalculation===null||move.damageCalculation===undefined)&&
      paysWithBasics(slot,move,catalog));
    if(attack)return {
      kind:'free-retreat',benchIndex,printing:slot.printing,
      attackName:attack.name
    };
  }
  return null;
}

module.exports={paysWithBasics,chooseFreeRetreatToPotentialKo};
