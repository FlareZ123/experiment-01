'use strict';

const {
  attackBlocked,
  postRetreatPrintedDamage,
  projectedPrizeOutcome
}=require('../agent42-public-two-unit-paid-retreat-proposal-v2.cjs');
const {
  opponentActiveBlocksRetreat
}=require('../agent2-owner-skyliner-funded-bench-frontier.cjs');
const {
  publicSkylinerSuppressionReason
}=require('../agent6-skyliner-ability-suppression-guard.cjs');

const VERSION='agent8-post-timeless-maxgeist-root-intent-v1';
const MIMIKYU='Mimikyu GRI';
const DIALGA='Dialga-GX UPR';
const RADIANT_ETERNATUS='Radiant Eternatus CRZ';
const REGIDRAGO_VSTAR='Regidrago VSTAR SIT';
const LATIAS_EX='Latias ex SSP';
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

function opponentActiveHasUnmodelledDamageModifier(active){
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
  return resistance.some(entry=>entry?.type==='Psychic');
}

/**
 * Candidate-only, owner-view proposal for the extra turn created by
 * Mimikyu Copycat -> Regidrago Apex Dragon -> Dialga Timeless-GX.
 *
 * It deliberately abstains when Radiant Eternatus is in the owner's discard:
 * Power Beam is then a competing non-GX Copycat payload and needs a separate
 * comparison. It also uses Max Geist's unmodified base damage for the KO
 * threshold, so Fairy Zone weakness is never assumed by this proposal.
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
  if(!Array.isArray(own.discard)||!own.discard.includes(DIALGA)||
     own.discard.includes(RADIANT_ETERNATUS))return null;
  if(!isOpponentApexDragonReceipt(view))return null;

  // Do not infer that the same Regidrago which used Apex Dragon has no
  // lingering copied attack effect (e.g. a defensive payload).
  if(target.printing===REGIDRAGO_VSTAR||
     opponentActiveHasUnmodelledDamageModifier(target))return null;

  if(resources.retreatedTurn===view.globalTurn||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true)return null;
  const asleep=catalog.specialConditions?.ASLEEP;
  const paralyzed=catalog.specialConditions?.PARALYZED;
  if(Array.isArray(active.specialConditions)&&
     ((asleep&&active.specialConditions.includes(asleep))||
      (paralyzed&&active.specialConditions.includes(paralyzed))))return null;
  if(opponentActiveBlocksRetreat(view)||
     publicSkylinerSuppressionReason(view)!==null)return null;

  const bench=Array.isArray(own.bench)?own.bench:[];
  if(!bench.some(pokemon=>pokemon?.printing===LATIAS_EX&&hasSkyliner(pokemon)))
    return null;

  const benchIndex=bench.findIndex(pokemon=>
    pokemon?.printing===SHADOW_RIDER_VMAX);
  if(benchIndex<0)return null;
  const vmax=bench[benchIndex];
  const maxGeist=Array.isArray(vmax.attacks)?
    vmax.attacks.find(attack=>attack?.name==='Max Geist'):null;
  const psychicType=catalog.basicEnergyTypes?.Psychic;
  if(!maxGeist||!Array.isArray(maxGeist.cost)||
     !Number.isSafeInteger(psychicType)||maxGeist.cost.length!==2||
     maxGeist.cost.some(cost=>cost!==psychicType)||
     !Array.isArray(vmax.energies)||
     vmax.energies.filter(energy=>isPsychicBasic(energy,catalog)).length<2)
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
     hp<=damage)return null;
  const targetRemainingHp=hp-damage;
  if(projectedPrintedDamage<targetRemainingHp)return null;

  const prizeView={...view,opponentPublic:{...opponent,
    active:{...target,hp,damage}}};
  const prize=projectedPrizeOutcome(prizeView,catalog,projectedPrintedDamage);
  if(!prize)return null;
  return {
    kind:'skyliner-free-retreat',
    benchIndex,
    printing:SHADOW_RIDER_VMAX,
    attackName:'Max Geist',
    projectedPrintedDamage,
    targetRemainingHp,
    ...prize,
    source:VERSION,
    ownerVisibleOnly:true,
    nativeStoreRetreatVerified:false,
    nativeStoreAttackVerified:false,
    nativeTerminalVerified:false,
    competitiveGameQualified:false,
    decisionReason:'post-timeless-copycat-extra-turn-max-geist-base-damage-immediate-ko',
    competingCopycatPayload:'Radiant Eternatus Power Beam absent from owner discard'
  };
}

module.exports={
  VERSION,
  MIMIKYU,
  DIALGA,
  RADIANT_ETERNATUS,
  REGIDRAGO_VSTAR,
  LATIAS_EX,
  SHADOW_RIDER_VMAX,
  isOpponentApexDragonReceipt,
  opponentActiveHasUnmodelledDamageModifier,
  choosePostTimelessMaxGeistRetreat
};
