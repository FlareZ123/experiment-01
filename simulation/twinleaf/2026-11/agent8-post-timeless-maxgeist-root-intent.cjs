'use strict';

const {
  attackBlocked,
  postRetreatPrintedDamage,
  opponentHasUnmodeledDamageOrPrizeText
}=require('../agent42-public-two-unit-paid-retreat-proposal-v2.cjs');
const {
  opponentActiveBlocksRetreat
}=require('../agent2-owner-skyliner-funded-bench-frontier.cjs');
const {
  publicSkylinerSuppressionReason
}=require('../agent6-skyliner-ability-suppression-guard.cjs');

const VERSION='agent8-post-timeless-maxgeist-root-intent-v6-actor-stadium-array-guard';
const MIMIKYU='Mimikyu GRI';
const DIALGA='Dialga-GX UPR';
const RADIANT_ETERNATUS='Radiant Eternatus CRZ';
const REGIDRAGO_VSTAR='Regidrago VSTAR SIT';
const LATIAS_EX='Latias ex SSP';
const CLEFAIRY_EX="Lillie's Clefairy ex JTG";
const SHADOW_RIDER_VMAX='Shadow Rider Calyrex VMAX CRE';

function isPsychicBasic(printing,catalog){
  return typeof printing==='string'&&
    printing.startsWith('Psychic Energy ')&&
    catalog.basicEnergies instanceof Set&&
    catalog.basicEnergies.has(printing);
}

function hasSkyliner(pokemon){
  return !!pokemon&&(
    (Array.isArray(pokemon.abilities)&&pokemon.abilities.includes('Skyliner'))||
    (Array.isArray(pokemon.abilityDetails)&&
      pokemon.abilityDetails.some(ability=>ability?.name==='Skyliner'))
  );
}

function hasWondrousLabyrinth(view){
  // actorObservation.publicPlayer() exposes Stadiums as arrays of exact
  // printing names. Missing or malformed arrays are unknown, not evidence
  // that the cost-increasing Stadium is absent.
  const zones=[view.ownPublic?.stadium,view.opponentPublic?.stadium];
  if(!zones.every(Array.isArray))return true;
  return zones.some(zone=>zone.some(printing=>
    typeof printing!=='string'||
    printing.startsWith('Wondrous Labyrinth Prism Star')));
}

function prizeCountForTarget(target,catalog){
  if(Number.isSafeInteger(target?.prizeCount))return target.prizeCount;
  const subtypes=Array.isArray(target?.printed?.subtypes)?
    target.printed.subtypes.map(value=>String(value).toUpperCase().replace(/[^A-Z]/g,'')):[];
  // The actor observation's current `printed.subtypes` is empty for
  // Twinleaf PokemonCard objects; use catalog sets built from pinned CardTags.
  if(catalog.threePrizePokemonPrintings instanceof Set&&
     catalog.threePrizePokemonPrintings.has(target.printing))return 3;
  if(catalog.onePrizeRuleboxPokemonPrintings instanceof Set&&
     catalog.onePrizeRuleboxPokemonPrintings.has(target.printing))return 1;
  // Keep tag-shaped fallback support for detached synthetic callers.
  if(subtypes.includes('VMAX')||subtypes.includes('TAGTEAM')||
     subtypes.includes('VUNION'))return 3;
  if(subtypes.includes('RADIANT')||subtypes.includes('PRISMSTAR')||
     subtypes.includes('BREAK'))return 1;
  if(catalog.ruleboxPokemonPrintings instanceof Set&&
     catalog.ruleboxPokemonPrintings.has(target.printing))return 2;
  return 1;
}

function copycatPowerBeamAvailable(active,restrictions,catalog){
  if(!Array.isArray(active?.attacks)||!Array.isArray(active?.energies))
    return null;
  const copycat=active.attacks.find(attack=>
    attack?.name==='Copycat'&&attack.gxAttack!==true);
  if(!copycat)return false;
  const psychicType=catalog.basicEnergyTypes?.Psychic;
  const colorlessType=catalog.colorlessEnergyType;
  if(!Array.isArray(copycat.cost)||copycat.cost.length!==2||
     !Number.isSafeInteger(psychicType)||
     !Number.isSafeInteger(colorlessType)||
     copycat.cost.filter(type=>type===psychicType).length!==1||
     copycat.cost.filter(type=>type===colorlessType).length!==1)
    return null;
  if(active.energies.filter(energy=>isPsychicBasic(energy,catalog)).length<2)
    return false;
  const blocked=attackBlocked(active,copycat,restrictions);
  if(blocked===null)return null;
  return !blocked;
}

function isOpponentApexDragonReceipt(view){
  const receipt=view?.publicEventReceipt;
  if(!receipt||receipt.actorSeat!==view.actorSeat||
     receipt.turn!==view.globalTurn||
     !Array.isArray(receipt.opponentLastTurnAttacks)||
     receipt.opponentLastTurnAttacks.length===0)return false;
  if(!Number.isSafeInteger(receipt.opponentLastTurnTurn)||
     receipt.opponentLastTurnTurn>=view.globalTurn)return false;
  const last=receipt.opponentLastTurnAttacks.at(-1);
  return !!last&&last.turn===receipt.opponentLastTurnTurn&&
    last.sourcePrinting===REGIDRAGO_VSTAR&&
    last.attackName==='Apex Dragon'&&
    last.gxAttack===false&&last.copycatAttack===false;
}

function opponentActiveHasUnmodelledDamageModifier(active,catalog={}){
  if(!active||!Array.isArray(active.tools)||active.tools.length>0)return true;
  const abilities=Array.isArray(active.abilityDetails)?active.abilityDetails:[];
  if(abilities.some(ability=>
    /damage|prevent|reduce|immune|cannot be damaged|can't be damaged/i
      .test(String(ability?.text??''))))return true;
  const restrictions=active.publicRestrictions??{};
  if(restrictions.damageReduction===true||
     restrictions.preventDamage===true||
     restrictions.cannotBeDamaged===true)return true;
  const resistance=Array.isArray(active.printed?.resistance)?
    active.printed.resistance:[];
  const psychicType=catalog.basicEnergyTypes?.Psychic;
  return resistance.some(entry=>entry?.type==='Psychic'||
    (Number.isSafeInteger(psychicType)&&entry?.type===psychicType));
}

/**
 * Candidate-only, owner-view proposal for the extra turn created by
 * Mimikyu Copycat -> Regidrago Apex Dragon -> Dialga Timeless-GX.
 *
 * It abstains when Radiant Eternatus is in the owner's discard because
 * Power Beam is a stronger competing Copycat payload. Fairy Zone is applied
 * only when Lillie's Clefairy ex is publicly present and the shared ability
 * suppression guard confirms the ability is not disabled.
 *
 * @param {object} view detached owner/public actor observation
 * @param {object} catalog pinned card catalog
 * @param {{ownerSeat?:number}} options
 * @returns {object|null}
 */
function choosePostTimelessMaxGeistRetreat(view,catalog,{ownerSeat}={}){
  if(!view||view.decisionKind!=='owner-root'||
     !Number.isSafeInteger(ownerSeat)||ownerSeat!==view.actorSeat||
     !Number.isSafeInteger(view.globalTurn))return null;

  const own=view.ownPublic;
  const opponent=view.opponentPublic;
  const active=own?.active;
  const target=opponent?.active;
  const resources=view.ownTurnResources;
  const restrictions=own?.publicTurnRestrictions;
  if(!own||!opponent||!active||!target||!resources||!restrictions)return null;

  if(resources.extraTurnActive!==true||restrictions.gxUsed!==true)return null;
  if(active.printing!==MIMIKYU||!Array.isArray(active.energies)||
     active.energies.filter(energy=>isPsychicBasic(energy,catalog)).length<2)
    return null;
  if(!Array.isArray(own.discard)||!own.discard.includes(DIALGA))return null;
  if(!isOpponentApexDragonReceipt(view))return null;

  // Do not infer that the same Regidrago which used Apex Dragon has no
  // lingering copied attack effect (e.g. a defensive payload).
  if(target.printing===REGIDRAGO_VSTAR||
     opponentActiveHasUnmodelledDamageModifier(target,catalog))return null;

  if(resources.retreatedTurn===view.globalTurn||
     active.publicRestrictions?.cannotRetreat===true||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true)return null;
  const asleep=catalog.specialConditions?.ASLEEP;
  const paralyzed=catalog.specialConditions?.PARALYZED;
  if(Array.isArray(active.specialConditions)&&
     ((asleep&&active.specialConditions.includes(asleep))||
      (paralyzed&&active.specialConditions.includes(paralyzed))))return null;
  // Wondrous Labyrinth adds [C] to non-Fairy attacks, including Max Geist.
  // This narrow policy does not project that stadium cost modifier.
  if(opponentActiveBlocksRetreat(view)||
     publicSkylinerSuppressionReason(view)!==null||
     hasWondrousLabyrinth(view))return null;

  const bench=Array.isArray(own.bench)?own.bench:[];
  if(!bench.some(pokemon=>pokemon?.printing===LATIAS_EX&&hasSkyliner(pokemon)))
    return null;

  const benchIndex=bench.findIndex(pokemon=>
    pokemon?.printing===SHADOW_RIDER_VMAX);
  if(benchIndex<0)return null;
  const vmax=bench[benchIndex];
  const maxGeist=Array.isArray(vmax.attacks)?
    vmax.attacks.find(attack=>attack?.name==='Max Geist'):null;
  const colorlessType=catalog.colorlessEnergyType;
  if(!maxGeist||!Array.isArray(maxGeist.cost)||
     !Number.isSafeInteger(colorlessType)||maxGeist.cost.length!==3||
     maxGeist.cost.some(cost=>cost!==colorlessType)||
     !Array.isArray(vmax.energies)||vmax.energies.length<3||
     vmax.energies.some(energy=>!catalog.basicEnergies.has(energy)))
    return null;
  const blocked=attackBlocked(vmax,maxGeist,restrictions);
  if(blocked===null||blocked)return null;

  const projectedPrintedDamage=postRetreatPrintedDamage(
    view,vmax,maxGeist,{indices:[],printings:[]},catalog);
  if(!Number.isSafeInteger(projectedPrintedDamage)||projectedPrintedDamage<=0)
    return null;
  const hp=Number(target.hp);
  const damage=Number(target.damage??0);
  if(!Number.isSafeInteger(hp)||!Number.isSafeInteger(damage)||
     hp<=damage||opponentHasUnmodeledDamageOrPrizeText(view))return null;
  const targetRemainingHp=hp-damage;
  const ownBoard=[own.active,...bench].filter(Boolean);
  const fairyZoneActive=ownBoard.some(pokemon=>
    pokemon?.printing===CLEFAIRY_EX&&
    Array.isArray(pokemon.abilities)&&pokemon.abilities.includes('Fairy Zone'));
  const targetIsDragon=catalog.dragonPokemonPrintings instanceof Set?
    catalog.dragonPokemonPrintings.has(target.printing):
    Array.isArray(target.printed?.types)&&target.printed.types.includes('Dragon');
  if(!Array.isArray(target.printed?.weakness))return null;
  const psychicType=catalog.basicEnergyTypes?.Psychic;
  const psychicWeakness=target.printed.weakness.find(entry=>
    entry?.type==='Psychic'||
    (Number.isSafeInteger(psychicType)&&entry?.type===psychicType));
  const fairyZoneMultiplier=fairyZoneActive&&targetIsDragon?2:1;
  let weaknessMultiplier=1;
  if(fairyZoneMultiplier===2){
    weaknessMultiplier=2;
  }else if(psychicWeakness){
    const value=psychicWeakness.value;
    // Twinleaf's actor observation normalizes an omitted Weakness value to
    // null; the pinned Weakness interface defines that omission as ×2.
    if(value===null||value===undefined||value===2||
       value==='2'||value==='x2'||value==='×2')
      weaknessMultiplier=2;
    else return null;
  }
  const projectedDamage=projectedPrintedDamage*weaknessMultiplier;
  if(projectedDamage<targetRemainingHp)return null;
  const projectedPrizeCount=prizeCountForTarget(target,catalog);
  const projectedTerminalWin=Number.isSafeInteger(own.prizeCount)&&
    own.prizeCount<=projectedPrizeCount;
  const radiantInDiscard=own.discard.includes(RADIANT_ETERNATUS);
  let competingPowerBeamAvailable=false;
  if(radiantInDiscard){
    const copycatAvailable=copycatPowerBeamAvailable(active,restrictions,catalog);
    if(copycatAvailable===null)return null;
    competingPowerBeamAvailable=copycatAvailable;
  }
  const competingPowerBeamDamage=competingPowerBeamAvailable?
    200*weaknessMultiplier:null;
  const competingPowerBeamWouldKo=competingPowerBeamAvailable&&
    competingPowerBeamDamage>=targetRemainingHp;
  // If the one-Prize Mimikyu can also take the KO with Power Beam, retain it
  // Active instead of exposing the three-Prize VMAX. If Max Geist is the
  // only KO, still abstain unless that KO ends the game: the VMAX liability
  // cannot be priced without a trustworthy opponent-response model.
  if(competingPowerBeamAvailable&&
     (competingPowerBeamWouldKo||!projectedTerminalWin))return null;
  const retainedBasicPsychicEnergyCount=ownBoard.reduce((sum,pokemon)=>
    sum+pokemon.energies.filter(energy=>isPsychicBasic(energy,catalog)).length,0);
  return {
    kind:'skyliner-free-retreat',
    benchIndex,
    printing:SHADOW_RIDER_VMAX,
    attackName:'Max Geist',
    projectedPrintedDamage,
    projectedDamage,
    fairyZoneActive,
    fairyZoneMultiplier,
    weaknessMultiplier,
    targetRemainingHp,
    projectedPrizeCount,
    projectedTerminalWin,
    competingPowerBeamDamage,
    competingPowerBeamWouldKo,
    retainedBasicPsychicEnergyCount,
    activeLiability:competingPowerBeamAvailable?
      'Max Geist exposes three-Prize VMAX; Power Beam retains one-Prize Mimikyu':
      'no public Power Beam route established',
    routeComparison:competingPowerBeamAvailable?
      'max-geist-unique-terminal-ko':'max-geist-only-known-route',
    source:VERSION,
    ownerVisibleOnly:true,
    nativeStoreRetreatVerified:false,
    nativeStoreAttackVerified:false,
    nativeTerminalVerified:false,
    competitiveGameQualified:false,
    decisionReason:'post-timeless-copycat-extra-turn-max-geist-immediate-ko-after-route-crossover',
    competingCopycatPayload:competingPowerBeamAvailable?
      'Radiant Eternatus Power Beam (200)':'no legal public Power Beam route established'
  };
}

module.exports={
  VERSION,
  MIMIKYU,
  DIALGA,
  RADIANT_ETERNATUS,
  REGIDRAGO_VSTAR,
  LATIAS_EX,
  CLEFAIRY_EX,
  SHADOW_RIDER_VMAX,
  prizeCountForTarget,
  isOpponentApexDragonReceipt,
  opponentActiveHasUnmodelledDamageModifier,
  choosePostTimelessMaxGeistRetreat
};
