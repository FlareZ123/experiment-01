'use strict';

const assert=require('node:assert/strict');
const {missingEnergyUnits}=
  require('./agent3-special-energy-frontier.cjs');
const {knownMewtwoEnergyUnits,publicPerfectionVeto}=
  require('./agent30-known-perfection-options.cjs');

const VERSION='agent35-known-donor-benched-perfection-transition-v1';
const MEWTWO='Mewtwo & Mew-GX UNM';

/**
 * One owner-visible two-stage plan for a Benched Mewtwo & Mew-GX:
 * fund a known publicly discarded GX donor attack with Basic Psychic,
 * then retreat the unproductive Active into the funded copy attacker.
 *
 * This is a bounded hypothesis. Printed Energy alone does not establish
 * native Attack legality; the real Store must settle any retreat and
 * Perfection action. No deck, face-down Prize or opponent hand identities
 * are consulted.
 *
 * @param {object} view Detached owner observation.
 * @param {object} catalog Public CardManager printing and numeric type data.
 * @returns {object|null} Supported native-neutral root intent.
 */
function choosePerfectionTransition(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  if(!active||view.globalTurn===1||
      !(catalog.perfectionDonors instanceof Map))return null;
  const index=(own.bench??[]).findIndex(p=>p?.printing===MEWTWO);
  if(index<0)return null;
  const mewtwo=own.bench[index];
  if(!(mewtwo.abilities??[]).includes('Perfection'))return null;

  // The same public ability-lock gate used by active-Perfection planning,
  // evaluated on the proposed future active, with no state mutation.
  const next={...view,ownPublic:{...own,active:mewtwo}};
  if(publicPerfectionVeto(next)!==null)return null;
  const sourceNames=new Set([
    ...(own.discard??[]),
    ...(own.bench??[]).flatMap(p=>p?[p.printing]:[])
  ]);
  const usedGX=own.publicTurnRestrictions?.gxUsed===true||
    own.publicTurnRestrictions?.cannotUseGXAttacks===true;
  const units=knownMewtwoEnergyUnits(next,catalog);
  if(units===null)return null;
  const sources=[...catalog.perfectionDonors.entries()]
    .filter(([printing])=>sourceNames.has(printing))
    .flatMap(([printing,attacks])=>attacks
      .filter(a=>!(usedGX&&a.gxAttack===true))
      .filter(a=>Array.isArray(a.cost)&&a.cost.every(Number.isSafeInteger))
      .map(a=>({sourcePrinting:printing,attackName:a.name,
        required:missingEnergyUnits(a.cost,units,catalog.colorlessEnergyType),
        cost:a.cost})));
  if(!sources.length)return null;
  const available=sources.filter(a=>a.required===0);
  const ownTurn=view.ownTurnResources??{};
  const activeCanDamage=active.attacks?.some(a=>
    Number.isSafeInteger(a.damage)&&a.damage>=80 &&
    a.gxAttack!==true);
  const protectedActive=activeCanDamage===true;
  const status=catalog.specialConditions??{};
  const retreatViable=Array.isArray(active.printed?.retreatCost)&&
    active.printed.retreatCost.length===1&&
    active.publicRestrictions?.cannotRetreatNextTurn!==true&&
    active.publicRestrictions?.cannotRetreatWhileActive!==true&&
    !(active.specialConditions??[]).some(x=>
      x===status.ASLEEP||x===status.PARALYZED)&&
    Number.isSafeInteger(ownTurn.retreatedTurn)&&
    ownTurn.retreatedTurn!==view.globalTurn;
  if(available.length>0&&retreatViable&&!protectedActive&&
     active.energies.length===1&&
     catalog.basicEnergies.has(active.energies[0])){
    const chosen=available.sort((a,b)=>
      a.cost.length-b.cost.length||
      a.attackName.localeCompare(b.attackName))[0];
    return {kind:'paid-retreat',benchIndex:index,
      printing:mewtwo.printing,attackName:chosen.attackName,
      sourcePrinting:chosen.sourcePrinting,retreatCostUnits:1,
      plan:VERSION};
  }
  if(ownTurn.energyPlayLocked===true||
      ownTurn.energyPlayedTurn===view.globalTurn)return null;
  const psychicType=catalog.basicEnergyTypes.Psychic;
  const psychicIndex=(view.ownHand??[]).findIndex(p=>
    catalog.basicEnergies.has(p)&&p.startsWith('Psychic Energy '));
  if(psychicIndex<0)return null;
  const energyPrint=view.ownHand[psychicIndex];
  if(available.length===0){
    const helps=sources.some(a=>
      missingEnergyUnits(a.cost,[...units,psychicType],
        catalog.colorlessEnergyType)<a.required);
    return helps?{kind:'attach-basic-energy',slot:'bench',index,
      handIndex:psychicIndex,printing:energyPrint,
      attackName:sources[0].attackName,plan:VERSION}:null;
  }
  // If the target already has a payable copied attack, fund the one-Basic
  // Active retreat payment on a later turn. No speculative future switch.
  if(retreatViable&&!protectedActive&&active.energies.length===0){
    return {kind:'attach-basic-energy',slot:'active',index:0,
      handIndex:psychicIndex,printing:energyPrint,
      attackName:available[0].attackName,plan:VERSION};
  }
  return null;
}

module.exports={VERSION,choosePerfectionTransition};
