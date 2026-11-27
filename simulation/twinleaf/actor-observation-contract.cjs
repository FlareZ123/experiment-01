'use strict';

const assert=require('node:assert/strict');

/** @param {object} card @returns {string} */
// Pinned Twinleaf CardType is numeric (ANY=0, PSYCHIC=5, COLORLESS=9,
// DRAGON=11). The actor policy compares readable names, not enum ordinals.
// Leave unknown future enum members unchanged to fail closed in policies.
// Source: ptcg-server/src/game/store/card/card-types.ts @ a9905a76.
const PINNED_CARD_TYPE_NAMES = Object.freeze([
  'Any','Grass','Fire','Water','Lightning','Psychic','Fighting',
  'Darkness','Metal','Colorless','Fairy','Dragon','None'
]);
const canonicalCardType=type=>Number.isSafeInteger(type)&&type>=0&&
  type<PINNED_CARD_TYPE_NAMES.length?PINNED_CARD_TYPE_NAMES[type]:type;

// Pinned PokemonCard has `stage` (numeric Stage enum) and `tags` (CardTag[]),
// NOT a reliable `subtypes` property. Emit the strategic subtype strings
// consumed throughout candidate and opponent policies.
const PINNED_STAGE_NAMES=Object.freeze([
  'NONE','RESTORED','BASIC','STAGE_1','STAGE_2','VMAX',
  'VSTAR','VUNION','LEGEND','MEGA','BREAK','LV_X'
]);
const canonicalStage=stage=>Number.isSafeInteger(stage)&&stage>=0&&
  stage<PINNED_STAGE_NAMES.length?PINNED_STAGE_NAMES[stage]:stage;

const PINNED_STAGE_SUBTYPES=Object.freeze({
  2:'Basic',3:'Stage 1',4:'Stage 2',5:'VMAX',6:'VSTAR',
  7:'V-UNION',8:'LEGEND',9:'MEGA',10:'BREAK',11:'Lv.X'
});
function canonicalPokemonSubtypes(pokemon){
  const items=[];
  const add=value=>{if(typeof value==='string'&&value.length>0&&
      !items.includes(value))items.push(value);};
  add(PINNED_STAGE_SUBTYPES[pokemon.stage]);
  for(const source of [pokemon.subtypes,pokemon.tags,pokemon.cardTag]){
    if(Array.isArray(source))for(const tag of source)add(tag);
  }
  if(items.some(tag=>['VMAX','VSTAR','V-UNION'].includes(tag)))add('V');
  return items;
}

// The following pinned PokemonCardList fields are public state derived from
// face-up attacks, Stadiums, Tools or other visible effects. Several modify
// current attack damage, effective HP, KO behavior or Prize awards but are
// not individually represented in this narrow policy schema. Do not certify
// a deterministic final KO while one is active; this is a bounded veto only,
// not a replacement for the Store's damage engine.
// Source: ptcg-server/src/game/store/state/pokemon-card-list.ts @ a9905a76.
function nonzeroNativeField(slot,keys){
  return keys.some(key=>typeof slot[key]==='number'&&slot[key]!==0);
}
function presentNativeField(slot,keys){
  return keys.some(key=>slot[key]!==undefined&&slot[key]!==null);
}
// Source-of-damage and recipient-of-damage effects are deliberately separate.
// A holder's +HP Tool does not weaken its own outgoing attack; a defender's
// outgoing Growl reduction does not protect it from the current attack.
function incomingTerminalUncertain(slot){
  return nonzeroNativeField(slot,[
    'hpBonus','damageReductionNextTurn','damageReductionBeforeWeaknessNextTurn'
  ])||['coinFlipPreventAttackDamageNextTurn','noWeaknessNextTurn',
    'denyPrizesIfKnockedOutNextTurn'].some(key=>slot[key]===true)||
    presentNativeField(slot,[
      'preventDamageNextTurn','surviveOnTenHpNextTurn',
      'retaliateOnDamageNextTurn','weaknessOverrideType'
    ]);
}
function outgoingTerminalUncertain(slot){
  return nonzeroNativeField(slot,[
    'attackDamageReductionNextTurn','attackDamageReductionAfterWeaknessNextTurn',
    'whileActiveAttackDamageBonus','outgoingAttackDamageBonusNextTurn',
    'coinFlipCancelAttackNextTurn'
  ])||presentNativeField(slot,[
    'nextTurnAttackDamageBonus','nextTurnAttackBaseDamage'
  ]);
}

const printing=card=>{
  assert.ok(typeof card?.fullName==='string'&&card.fullName.length>0);
  return card.fullName;
};

/**
 * A complete detached, exact-printing description of a face-up Pokémon.
 * Every field here is visible to both players in a paper match.
 * @param {object} slot Pinned engine Pokémon card list.
 * @returns {object|null}
 */
function visiblePokemon(slot){
  const pokemon=slot.getPokemonCard();
  if(!pokemon)return null;
  const powers=pokemon.powers;
  const abilitySuppressions=powers.every(power=>
    typeof power?.name==='string'&&power.name.length>0)?
      powers.map(power=>({
        abilityName:power.name,suppressed:null,
        reasonCode:null,sourcePrinting:null
      })):null;
  return {
    printing:printing(pokemon),name:pokemon.name,
    hp:pokemon.hp,damage:slot.damage,
    lastPlayedOrEvolvedTurn:slot.pokemonPlayedTurn,
    // Zero is the native "no established Active locker" sentinel.
    abilityLockActivationOrder:Number.isSafeInteger(slot.abilityLockActivationOrder)&&
      slot.abilityLockActivationOrder>0?slot.abilityLockActivationOrder:null,
    // Fully face-up printed information needed to compare attack options,
    // vulnerabilities, and retreat. Printed values are not a final damage
    // or retreat-cost calculation; effects may modify them in the Store.
    printed:{
      stage:canonicalStage(pokemon.stage??null),
      subtypes:canonicalPokemonSubtypes(pokemon),
      types:(pokemon.cardType??[]).map(canonicalCardType),
      retreatCost:(pokemon.retreat??[]).map(canonicalCardType),
      weakness:(pokemon.weakness??[]).map(weakness=>({
        // Native PokemonCard Weakness.value is optional: undefined means x2,
        // not missing/unknown (pokemon-types.ts, pinned Twinleaf).
        type:canonicalCardType(weakness.type),value:weakness.value??2
      })),
      resistance:(pokemon.resistance??[]).map(resistance=>({
        type:canonicalCardType(resistance.type),value:resistance.value
      }))
    },
    // Public temporary restrictions must be visible to an attack/retreat
    // planner. These represent effects, not a claim that a particular
    // action is legal: the genuine Store remains the final rules authority.
    specialConditions:[...(slot.specialConditions??[])],
    publicRestrictions:{
      cannotAttackNextTurn:slot.cannotAttackNextTurn===true,
      cannotUseAttacksNextTurn:[...(slot.cannotUseAttacksNextTurn??[])],
      blockedAttackNameNextTurn:slot.blockedAttackNameNextTurn??null,
      blockedAttackNameUntilLeavesActive:
        slot.blockedAttackNameUntilLeavesActive??null,
      onlyAllowedAttackNameNextTurn:slot.onlyAllowedAttackNameNextTurn??null,
      attackCostIncreaseNextTurn:slot.attackCostIncreaseNextTurn??0,
      attackCostIncreaseWhileActive:slot.attackCostIncreaseWhileActive??0,
      cannotRetreat:slot.cannotRetreat===true,
      cannotRetreatNextTurn:slot.cannotRetreatNextTurn===true,
      cannotRetreatWhileActive:slot.cannotRetreatWhileActive===true,
      cannotEvolveNextTurn:slot.cannotEvolveNextTurn===true,
      incomingTerminalUncertain:incomingTerminalUncertain(slot),
      outgoingTerminalUncertain:outgoingTerminalUncertain(slot)
    },
    evolutionPrintings:slot.cards.map(printing),
    energies:slot.energies.cards.map(printing),
    tools:slot.tools.map(printing),
    attacks:pokemon.attacks.map(attack=>({
      name:attack.name,cost:attack.cost.map(canonicalCardType),
      damage:attack.damage??null,
      damageCalculation:attack.damageCalculation??null,
      text:attack.text??null,
      gxAttack:attack.gxAttack===true,
      // Public printing-specific attack permission, used only under explicit
      // first-player opening-turn exception tests; native Store is final.
      ...(attack.canUseOnFirstTurn===true?{canUseOnFirstTurn:true}:{}),
      barrage:attack.barrage===true
    })),
    abilities:powers.map(power=>power.name),
    abilityDetails:powers.map(power=>({
      name:power.name,powerType:power.powerType??null,
      text:power.text??null
    })),
    // Explicit unknown is safer than inferring a live Ability from the absence
    // of a recognized suppressor; the host/Store adapter may replace null with
    // a source-attributed true/false fact when it can prove one.
    abilitySuppressions
  };
}

/** @param {object} player @param {boolean} [hidePokemon] @returns {object} */
function publicPlayer(player,hidePokemon=false){
  const pokemonView=slot=>hidePokemon ?
    (slot.cards.length>0?{concealed:true}:null):visiblePokemon(slot);
  // Missing or malformed public countdowns remain explicitly unknown.
  const stadiumToolSuppression=player.stadiumAndToolHaveNoEffectTurnsRemaining;
  return {
    active:pokemonView(player.active),
    bench:player.bench.map(pokemonView),
    stadium:player.stadium.cards.map(printing),
    // Twinleaf writes Parallel City's orientation to this owning Stadium
    // CardList, not to the card object. It determines which Bench is capped;
    // preserve it for policy decisions rather than keeping only the printing.
    stadiumDirection:player.stadium.cards.length===1&&
      ['up','down'].includes(player.stadium.stadiumDirection)?
        player.stadium.stadiumDirection:null,
    discard:player.discard.cards.map(printing),
    lostZone:player.lostzone.cards.map(printing),
    resolvingSupporter:player.supporter.cards.map(printing),
    // Public hidden-zone reveals participate in the actor information key.
    // Concealed hand and face-down Prize identities remain absent.
    publicHand:player.hand.isPublic===true?
      player.hand.cards.map(printing):null,
    prizeSlots:player.prizes.flatMap((slot,index)=>{
      if(slot.cards.length===0)return [];
      if(slot.faceUpPrize===true) {
        assert.equal(slot.cards.length,1,
          'A face-up Prize slot must contain exactly one card');
        return [{index,printing:printing(slot.cards[0])}];
      }
      return [{index}];
    }),
    // These are public game-use and player-wide constraints. They exclude
    // opponent concealed hand contents and the identity of any unknown cards.
    publicTurnRestrictions:{
      gxUsed:player.usedGX===true,
      vstarUsed:player.usedVSTAR===true,
      // Twinleaf CEC156 Altered Creation-GX stores two public, persistent
      // attack effects on the player. The +30 damage flag is distinct from
      // its optional extra-Water +1 Prize flag. Both players can infer these
      // from the announced GX attack and publicly attached Energy.
      alteredCreationDamage:player.alteredCreationDamage===true,
      usedAlteredCreation:player.usedAlteredCreation===true,
      // Public once-per-game Legacy Energy reduction: omit rather than infer
      // a false unused marker if a future engine revision lacks the field.
      ...(typeof player.legacyEnergyUsed === 'boolean' ?
        {legacyEnergyUsed:player.legacyEnergyUsed}:{}),
      attackLockTurnsRemaining:player.cannotAttackTurnsRemaining??0,
      attackMaxEnergy:player.cannotAttackMaxEnergy??null,
      attackMaxEnergyTurnsRemaining:player.cannotAttackMaxEnergyTurnsRemaining??0,
      ignoreAttackCostCardTypes:(player.ignoreAttackCostCardTypes??[]).map(canonicalCardType),
      ignoreAttackCostTurnsRemaining:player.ignoreAttackCostTurnsRemaining??0,
      cannotUseGXAttacks:player.cannotUseGXAttacks===true,
      pokemonPlayLocked:player.cannotPlayPokemonCards===true,
      abilityPokemonPlayLocked:player.cannotPlayPokemonWithAbilities===true,
      evolutionPlayLocked:player.cannotEvolvePokemonCards===true,
      itemPlayLocked:player.cannotPlayItemCards===true,
      supporterPlayLocked:player.cannotPlaySupporterCards===true,
      stadiumPlayLocked:player.cannotPlayStadiumCards===true,
      // Public per-player epoch from Shiftry's Stadium/Tool suppression effect.
      // Null means the pinned Store field was absent or malformed.
      stadiumAndToolHaveNoEffectTurnsRemaining:
        Number.isSafeInteger(stadiumToolSuppression)&&stadiumToolSuppression>=0?
          stadiumToolSuppression:null,
      toolPlayLocked:player.cannotPlayToolCards===true,
      energyPlayLocked:player.cannotPlayEnergyCards===true,
      specialEnergyPlayLocked:player.cannotPlaySpecialEnergyCards===true
    },
    handCount:player.hand.cards.length,
    deckCount:player.deck.cards.length,
    prizeCount:player.prizes.reduce((sum,slot)=>sum+slot.cards.length,0)
  };
}

/** @param {any} value @returns {any} */
function freezeView(value){
  if(value&&typeof value==='object'){
    Object.values(value).forEach(freezeView);
    Object.freeze(value);
  }
  return value;
}

/**
 * Construct the only native-State-derived input admitted to an actor-owned
 * decision module at a root or pending owner-authenticated prompt.
 * The own hand is private to its owner; public boards, explicitly public
 * hands, face-up Prizes, discard piles and counts are visible to both sides.
 * Concealed hand, deck and face-down Prize identities are never read.
 *
 * The caller may supply an authenticated owner K1 snapshot. This routine
 * refuses physical deck/Prize identities even if the owner has performed
 * a legitimate deck search: such information must enter through the
 * separately provenance-checked owner-knowledge ledger.
 *
 * This is an interface for NEW decision policies, not a repair to Twinleaf's
 * unmodified SimpleTacticsAi. Native action construction and legality checks
 * must remain separate and use the genuine Store state.
 *
 * @param {object} state Real, already-authenticated Store State.
 * @param {0|1} seat Actual acting physical seat.
 * @param {{ownerK1Snapshot?:object}} [options]
 * @returns {object} Deeply frozen, detached actor observation.
 */
function actorObservation(state,seat,options={}){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  const owner=state.players[seat];
  const pending=state.prompts?.find(prompt=>prompt.result===undefined)??null;
  if(pending){
    assert.equal(pending.playerId,owner.id,
      'Only the prompted actor may inspect its own decision observation');
  }else{
    assert.equal(state.activePlayer,seat,'Actor-only root observation');
  }
  const ownK1=options.ownerK1Snapshot??null;
  if(ownK1!==null){
    // New owner-K1 custody projections carry the physical owner seat.
    // Preserve older untagged fixture snapshots without trusting a tagged
    // snapshot from the opposite actor's physical seat.
    if(ownK1.ownerSeat!==undefined){
      assert.equal(ownK1.ownerSeat,seat,
        'Owner K1 snapshot belongs to a different physical seat');
    }
    assert.equal(typeof ownK1.exactMembershipKnown,'boolean');
    assert.ok(Number.isSafeInteger(ownK1.epoch)&&ownK1.epoch>=0);
  }
  const result={
    actorSeat:seat,
    turnSeat:state.activePlayer===0||state.activePlayer===1?state.activePlayer:null,
    globalTurn:state.turn,phase:state.phase,
    decisionKind:pending?'owner-prompt':'owner-root',
    pendingPromptType:pending?.constructor.name??null,
    pendingOwnerDeckSearch:Boolean(pending&&
      pending.constructor?.name==='ChooseCardsPrompt'&&
      pending.cards===owner.deck),
    ownHand:owner.hand.cards.map(printing),
    ownPublic:publicPlayer(owner),
    // In SETUP/WAITING_FOR_PLAYERS the other side's chosen Pokémon are
    // physically face-down. Reveal only occupied slot geometry until start.
    opponentPublic:publicPlayer(state.players[1-seat],state.phase===0||state.phase===1),
    ownTurnResources:{
      // Unlike Energy/Stadium last-used global indices, supporterTurn is
      // Twinleaf's count of Supporters used in this owner's current turn.
      supporterPlayedTurn:owner.supporterTurn,
      retreatedTurn:owner.retreatedTurn,
      // Timeless-GX's skipped opponent turn is a public owner-root condition.
      // Expose only the derived active-seat boolean, never the Store internals.
      extraTurnActive:owner.usedTurnSkip===true&&state.activePlayer===seat,
      energyPlayedTurn:owner.energyPlayedTurn,
      stadiumPlayedTurn:owner.stadiumPlayedTurn,
      // Public once-per-turn Stadium Ability usage, distinct from placing a
      // Stadium from hand. Required for legal Beach effect preflight.
      stadiumUsedTurn:owner.stadiumUsedTurn,
      vstarUsed:owner.usedVSTAR===true,
      pokemonPlayLocked:owner.cannotPlayPokemonCards===true,
      abilityPokemonPlayLocked:owner.cannotPlayPokemonWithAbilities===true,
      evolutionPlayLocked:owner.cannotEvolvePokemonCards===true,
      itemPlayLocked:owner.cannotPlayItemCards===true,
      supporterPlayLocked:owner.cannotPlaySupporterCards===true,
      stadiumPlayLocked:owner.cannotPlayStadiumCards===true,
      toolPlayLocked:owner.cannotPlayToolCards===true,
      energyPlayLocked:owner.cannotPlayEnergyCards===true,
      specialEnergyPlayLocked:owner.cannotPlaySpecialEnergyCards===true
    },
    ownerK1:ownK1===null?null:{
      epoch:ownK1.epoch,
      exactMembershipKnown:ownK1.exactMembershipKnown,
      knownPrintings:ownK1.knownPrintings?.map(row=>({
        printing:row.printing,copies:row.copies
      }))??null,
      invalidationReason:ownK1.invalidationReason??null
    }
  };
  return freezeView(result);
}

module.exports={printing,visiblePokemon,publicPlayer,actorObservation};
