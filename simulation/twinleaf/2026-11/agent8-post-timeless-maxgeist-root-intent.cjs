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

const VERSION='agent8-post-timeless-maxgeist-root-intent-v12-provisional-stadium-and-live-newmoon';
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

function publicStadiumPrintings(view){
  // actorObservation.publicPlayer() exposes Stadiums as arrays of exact
  // printing names. Missing or malformed arrays cannot certify attack cost.
  const zones=[view.ownPublic?.stadium,view.opponentPublic?.stadium];
  if(!zones.every(Array.isArray)||
     !zones.every(zone=>zone.every(printing=>typeof printing==='string')))
    return null;
  return zones.flat();
}

/**
 * Resolve Stadium effects on the acting player's Pokémon conservatively.
 * A positive countdown on the acting player is reproduced. Whether an
 * opponent-only positive epoch is global or recipient-specific is unresolved
 * pending a two-seat Store probe. New Moon is recipient-specific and requires
 * an explicit source-attributed live-Ability row; printed text alone is not
 * proof that the Ability is active.
 * @param {object} view detached actor observation
 * @returns {boolean|null}
 */
function stadiumEffectsSuppressedForOwnPokemon(view){
  const own=view?.ownPublic;
  const ownTurns=own?.publicTurnRestrictions
    ?.stadiumAndToolHaveNoEffectTurnsRemaining;
  const opponentTurns=view?.opponentPublic?.publicTurnRestrictions
    ?.stadiumAndToolHaveNoEffectTurnsRemaining;
  if(!own||!Array.isArray(own.bench))return null;
  // This owner-positive case is covered by the existing native Store probe.
  if(Number.isSafeInteger(ownTurns)&&ownTurns>0)return true;
  if(!Number.isSafeInteger(ownTurns)||ownTurns<0||
     !Number.isSafeInteger(opponentTurns)||opponentTurns<0)return null;
  // The cross-seat case is intentionally unknown until actor=0/opponent=1
  // and the mirrored physical-seat case are run against the pinned Store.
  if(opponentTurns>0)return null;
  const board=[own.active,...own.bench].filter(Boolean);
  for(const pokemon of board){
    if(!Array.isArray(pokemon.abilities)||
       !Array.isArray(pokemon.abilityDetails))return null;
  }
  const lunatone=board.find(pokemon=>pokemon.abilities.includes('New Moon'));
  if(!lunatone)return false;
  const solrockPresent=board.some(pokemon=>
    typeof pokemon.printing==='string'&&pokemon.printing.startsWith('Solrock '));
  if(!solrockPresent)return false;
  // The actor projection must prove New Moon is live, not merely printed.
  if(!Array.isArray(lunatone.abilitySuppressions))return null;
  const suppression=lunatone.abilitySuppressions.find(row=>
    row?.abilityName==='New Moon');
  if(!suppression)return null;
  if(suppression.suppressed===false){
    if(suppression.reasonCode!==null||suppression.sourcePrinting!==null)
      return null;
    return true;
  }
  if(suppression.suppressed===true){
    if(typeof suppression.reasonCode!=='string'||
       typeof suppression.sourcePrinting!=='string')return null;
    return false;
  }
  return null;
}

/**
 * This narrow attack route models only two Stadium effects: Dimension Valley
 * and Pokémon League Headquarters attack-cost changes. Other Stadiums can
 * alter damage, Weakness, Prize value, retreat or attack legality, so they
 * are rejected rather than silently treated as inert.
 * @param {string[]} stadiums exact public Stadium printings
 * @returns {boolean}
 */
function hasUnmodelledStadium(stadiums){
  return stadiums.some(printing=>
    !printing.startsWith('Dimension Valley ')&&
    !printing.startsWith('Pokémon League Headquarters '));
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

function opponentActiveBlocksBasicAttacks(opponentActive){
  if(!opponentActive||!Array.isArray(opponentActive.abilityDetails))return null;
  const texts=opponentActive.abilityDetails.map(ability=>
    typeof ability?.text==='string'?ability.text:null);
  if(texts.some(text=>text===null))return null;
  return texts.some(text=>
    /your opponent's Basic Pokémon can't attack/i.test(text));
}

function opponentBoardHasAbility(view,name,expectedText){
  const opponent=view?.opponentPublic;
  if(!opponent?.active||!Array.isArray(opponent.bench))return null;
  const board=[opponent.active,...opponent.bench].filter(Boolean);
  let found=false;
  for(const pokemon of board){
    if(!Array.isArray(pokemon.abilities)||
       !Array.isArray(pokemon.abilityDetails)||
       pokemon.abilities.length!==pokemon.abilityDetails.length)return null;
    for(const ability of pokemon.abilityDetails){
      if(ability?.name!==name)continue;
      if(typeof ability.text!=='string'||!expectedText.test(ability.text))
        return null;
      found=true;
    }
  }
  return found;
}

function opponentBoardBlocksRetreat(view,active){
  if(opponentActiveBlocksRetreat(view))return true;
  const opponentActive=view?.opponentPublic?.active;
  if(!opponentActive||!Array.isArray(opponentActive.abilityDetails))return null;
  const suction=opponentActive.abilityDetails.find(row=>
    row?.name==='Super Suction Cups');
  if(suction){
    if(typeof suction.text!=='string')return null;
    if(/your opponent's Pokémon can't retreat/i.test(suction.text))return true;
  }
  if(!Array.isArray(active?.specialConditions))return null;
  if(active.specialConditions.length===0)return false;
  const swaying=opponentBoardHasAbility(view,'Swaying Strangle',
    /your opponent's Pokémon that are affected by Special Conditions can't retreat/i);
  if(swaying===null)return null;
  if(swaying)return true;
  // Poison Barrier is narrower; fail closed for any visible Special Condition
  // rather than guessing which native enum corresponds to Poisoned.
  const poison=opponentBoardHasAbility(view,'Poison Barrier',
    /your opponent's Poisoned Pokémon can't retreat/i);
  if(poison===null)return null;
  return poison;
}

function opponentBoardBlocksAttack(view,attacker){
  const frigid=opponentBoardHasAbility(view,'Frigid Room',
    /your opponent's Pokémon that have 40 HP or less remaining can't attack/i);
  if(frigid===null)return null;
  if(!frigid)return false;
  const hp=Number(attacker?.hp),damage=Number(attacker?.damage??0);
  if(!Number.isSafeInteger(hp)||!Number.isSafeInteger(damage)||hp<=damage)
    return null;
  return hp-damage<=40;
}

function copycatPowerBeamAvailable(view,active,opponentActive,restrictions,catalog,dimensionValleyActive,pokemonLeagueHeadquartersActive){
  if(!Array.isArray(active?.attacks)||!Array.isArray(active?.energies)||
     !Array.isArray(active?.printed?.subtypes)||
     !active.printed.subtypes.includes('Basic'))return null;
  const hpBlocked=opponentBoardBlocksAttack(view,active);
  if(hpBlocked===null)return null;
  if(hpBlocked)return false;
  const basicAttackBlocked=opponentActiveBlocksBasicAttacks(opponentActive);
  if(basicAttackBlocked===null)return null;
  if(basicAttackBlocked)return false;
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
  const requiredPsychic=dimensionValleyActive?1:(pokemonLeagueHeadquartersActive?3:2);
  if(active.energies.filter(energy=>isPsychicBasic(energy,catalog)).length<requiredPsychic)
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

function opponentHasUnmodelledWeaknessText(view){
  const opponent=view?.opponentPublic;
  if(!opponent||!Array.isArray(opponent.bench))return true;
  const board=[opponent.active,...opponent.bench].filter(Boolean);
  return board.some(pokemon=>{
    const names=Array.isArray(pokemon.abilities)?pokemon.abilities:null;
    const details=Array.isArray(pokemon.abilityDetails)?pokemon.abilityDetails:null;
    if(names===null||details===null||details.length!==names.length)return true;
    return details.some(ability=>{
      const text=String(ability?.text??'');
      // Opponent Fairy Zone changes the candidate's Dragon Pokémon, not the
      // opponent Active target's Weakness used by this outgoing attack.
      if(pokemon.printing===CLEFAIRY_EX&&ability?.name==='Fairy Zone'){
        if(typeof ability.text!=='string'||
           !/weakness of each of your opponent's dragon pokémon in play is now psychic/i
             .test(ability.text))return true;
        return false;
      }
      return /weakness/i.test(text);
    });
  });
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
  // The prior Copycat→Timeless attack has already resolved. Do not
  // re-infer its historical Energy cost from the current Stadium/board.
  // Current Mimikyu Energy matters only for the optional Power Beam route.
  if(active.printing!==MIMIKYU||!Array.isArray(active.energies))return null;
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
  if(!Array.isArray(active.specialConditions))return null;
  if((asleep&&active.specialConditions.includes(asleep))||
     (paralyzed&&active.specialConditions.includes(paralyzed)))return null;
  const retreatBlocked=opponentBoardBlocksRetreat(view,active);
  if(retreatBlocked!==false)return null;
  // Stadium identity is insufficient: only the two cost modifiers below are
  // modeled, and their effects may be suppressed for the acting player.
  const stadiums=publicStadiumPrintings(view);
  const stadiumSuppressed=stadiumEffectsSuppressedForOwnPokemon(view);
  if(publicSkylinerSuppressionReason(view)!==null||
     stadiums===null||stadiumSuppressed===null||
     hasUnmodelledStadium(stadiums)||
     opponentHasUnmodelledWeaknessText(view))
    return null;
  const hasDimensionValley=stadiums.some(printing=>
    printing.startsWith('Dimension Valley '));
  const hasPokemonLeagueHeadquarters=stadiums.some(printing=>
    printing.startsWith('Pokémon League Headquarters '));
  if(hasDimensionValley&&hasPokemonLeagueHeadquarters)return null;
  const dimensionValleyActive=!stadiumSuppressed&&hasDimensionValley;
  const pokemonLeagueHeadquartersActive=
    !stadiumSuppressed&&hasPokemonLeagueHeadquarters;

  const bench=Array.isArray(own.bench)?own.bench:[];
  if(!bench.some(pokemon=>pokemon?.printing===LATIAS_EX&&hasSkyliner(pokemon)))
    return null;

  const benchIndex=bench.findIndex(pokemon=>
    pokemon?.printing===SHADOW_RIDER_VMAX);
  if(benchIndex<0)return null;
  const vmax=bench[benchIndex];
  const maxGeistOpponentBlocked=opponentBoardBlocksAttack(view,vmax);
  if(maxGeistOpponentBlocked!==false)return null;
  const maxGeist=Array.isArray(vmax.attacks)?
    vmax.attacks.find(attack=>attack?.name==='Max Geist'):null;
  const colorlessType=catalog.colorlessEnergyType;
  if(!maxGeist||!Array.isArray(maxGeist.cost)||
     !Number.isSafeInteger(colorlessType)||maxGeist.cost.length!==3||
     maxGeist.cost.some(cost=>cost!==colorlessType)||
     !Array.isArray(vmax.energies)||
     vmax.energies.length<(dimensionValleyActive?2:3)||
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
    const copycatAvailable=copycatPowerBeamAvailable(
      view,active,target,restrictions,catalog,dimensionValleyActive,
      pokemonLeagueHeadquartersActive);
    if(copycatAvailable===null)return null;
    competingPowerBeamAvailable=copycatAvailable;
  }
  const competingPowerBeamDamage=competingPowerBeamAvailable?
    200*weaknessMultiplier:null;
  const competingPowerBeamWouldKo=competingPowerBeamAvailable&&
    competingPowerBeamDamage>=targetRemainingHp;
  // No trustworthy opponent-response valuation exists for an exposed
  // three-Prize VMAX. Never take a nonterminal KO with this route. Even for a
  // terminal KO, retain the one-Prize Mimikyu line if Power Beam also KOs.
  if(!projectedTerminalWin||
     (competingPowerBeamAvailable&&competingPowerBeamWouldKo))return null;
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
    competingPowerBeamAvailable,
    competingPowerBeamDamage,
    competingPowerBeamWouldKo,
    stadiumEffectsSuppressedForOwnPokemon:stadiumSuppressed,
    dimensionValleyActive,
    pokemonLeagueHeadquartersActive,
    retainedBasicPsychicEnergyCount,
    activeLiability:'three-Prize VMAX exposure is allowed only for a terminal KO; a payable terminal Power Beam route vetoes it',
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
