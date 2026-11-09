'use strict';

const assert=require('node:assert/strict');

const VERSION='agent33-active-vmax-manual-psychic-after-underworld-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';

/**
 * Use a genuinely held Basic Psychic attachment to advance an underfunded
 * Active Shadow Rider VMAX after the regular Underworld Door root has declined
 * or been exhausted. Benched Psychic already improves Max Geist's damage; the
 * priority concerns the Active's printed attack cost. It does not inspect
 * either concealed deck, future cards or opposing hand.
 *
 * @param {object} view Detached acting owner's native root observation.
 * @param {object} catalog Public printed card/type catalog.
 * @returns {object|null} Source-owned normal attachment intent.
 */
function chooseMaxGeistManualRecovery(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const resources=view.ownTurnResources;
  const active=own?.active;
  if(!resources||!active||active.printing!==VMAX||
      view.globalTurn<=1||
      resources.energyPlayedTurn===view.globalTurn||
      resources.energyPlayLocked===true||
      own.publicTurnRestrictions?.energyPlayLocked===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      active.publicRestrictions?.cannotAttackWhileActive===true||
      active.publicRestrictions?.cannotAttackNextTurn===true||
      (active.specialConditions??[]).some(c=>
        c===catalog.specialConditions?.ASLEEP||
        c===catalog.specialConditions?.PARALYZED))return null;
  const colorless=catalog.colorlessEnergyType;
  if(!Number.isSafeInteger(colorless)||
      !active.attacks?.some(attack=>
        attack.name==='Max Geist'&&attack.gxAttack!==true&&
        attack.cost?.length===3&&
        attack.cost.every(type=>type===colorless)))return null;
  const energy=active.energies??[];
  if(energy.length<1||energy.length>=3||
      !energy.every(p=>catalog.basicEnergies?.has(p)===true&&
        p.startsWith('Psychic Energy ')))return null;
  const benchPsychic=(own.bench??[]).reduce((count,p)=>
    count+(p?.energies??[]).filter(x=>
      catalog.basicEnergies?.has(x)===true&&
      x.startsWith('Psychic Energy ')).length,0);
  if(benchPsychic<3)return null;
  const held=view.ownHand.flatMap((printing,handIndex)=>
    catalog.basicEnergies?.has(printing)===true&&
    printing.startsWith('Psychic Energy ')?[{printing,handIndex}]:[]);
  if(held.length!==1)return null;

  return {
    kind:'attach-basic-energy',
    printing:held[0].printing,
    handIndex:held[0].handIndex,
    slot:'active',index:0,
    source:VERSION,
    attackName:'Max Geist',
    gapBefore:3-energy.length,
    gapAfter:2-energy.length,
    publicBenchPsychic:benchPsychic,
    proposedAfterUnderworldDeclined:true,
    nativeEffectAndFutureAttackUnconfirmed:true
  };
}

module.exports={VERSION,chooseMaxGeistManualRecovery};
