'use strict';
const crypto=require('node:crypto');

/**
 * Selected effect-bearing State fields currently absent from sourceZoneSnapshot.
 * This deliberately supplements, rather than replaces, the historical zone
 * fingerprint. It is not a complete State/reducer or reference-graph audit.
 * All selected values in the pinned engine are scalar or plain structured data.
 */
const stateFields=[
  'isSuddenDeath','benchSizeChangeHandled',
  'abilityLockOrderCounter','promptControllerId'
];
const playerFields=[
  'cannotPlayStadiumCards','cannotPlayToolCards',
  'cannotPlaySpecialEnergyCards','cannotPlayEnergyCards',
  'cannotPlayPokemonWithAbilities','cannotEvolvePokemonCards',
  'playLocksTurnsRemaining','attackPowerSuppressions',
  'cannotAttackTurnsRemaining','cannotAttackMaxEnergy',
  'cannotAttackMaxEnergyTurnsRemaining','cannotDrawAtStartOfTurn',
  'stadiumAndToolHaveNoEffectTurnsRemaining',
  'coinFlipCancelTrainerPlayTurnsRemaining',
  'ignoreAttackCostCardTypes','ignoreAttackCostTurnsRemaining',
  'ancientPokemonAttackedLastTurn','usedTurnSkipClearArmed',
  'legacyEnergyUsed','stadiumUsedTurn'
];
const pokemonFields=[
  'boardEffect','damageReductionNextTurn','damageReductionNextTurnFilter',
  'damageReductionBeforeWeaknessNextTurn','preventDamageNextTurn',
  'preventDamageNextTurnPending','preventEffectsOfAttacksNextTurn',
  'preventEffectsOfAttacksNextTurnPending','cannotUseAttacksNextTurn',
  'cannotUseAttacksNextTurnPending','outgoingAttackDamageBonusNextTurn',
  'outgoingAttackDamageBonusNextTurnPending','attackCostIncreaseNextTurn',
  'retreatCostIncreaseNextTurn','cannotRetreatWhileActive',
  'knockOutIfDamagedNextTurn','healedThisTurn'
];

/** @param {object} source @param {string[]} names @returns {object} */
function selectedFields(source,names) {
  const out={};
  for(const name of names) {
    const value=source[name];
    out[name]=value===undefined?null:structuredClone(value);
  }
  return out;
}

/**
 * Copy every own primitive data field without traversing an engine prototype,
 * getter, Card attack object, or event/reducer closure. Optional undefined
 * fields retain their presence independently of missing properties.
 * @param {object} source
 * @returns {Array<[string,unknown]>}
 */
function primitiveOwnFields(source) {
  const fields=[];
  for(const name of Object.getOwnPropertyNames(source).sort()) {
    const descriptor=Object.getOwnPropertyDescriptor(source,name);
    if(!descriptor || !Object.hasOwn(descriptor,'value')) continue;
    const value=descriptor.value;
    if(value===null || ['string','number','boolean','undefined','bigint'].includes(typeof value)) {
      fields.push([name,typeof value==='undefined'?{undefined:true}:
        typeof value==='bigint'?{bigint:value.toString()}:
        typeof value==='number'&&!Number.isFinite(value)?{nonfinite:String(value)}:
        value]);
    }
  }
  return fields;
}

/** @param {object[]|{cards:object[]}} list @returns {Array<Array<[string,unknown]>>} */
function primitiveCards(list) {
  const cards=Array.isArray(list)?list:list.cards;
  return cards.map(primitiveOwnFields);
}

/** @param {object} slot @returns {object} */
function pokemonPrimitiveEvidence(slot) {
  return {
    fields:primitiveOwnFields(slot),
    cards:primitiveCards(slot.cards),
    tools:primitiveCards(slot.tools),
    energies:primitiveCards(slot.energies)
  };
}

/** @param {object} player @returns {object} */
function playerPrimitiveEvidence(player) {
  return {
    fields:primitiveOwnFields(player),
    deck:primitiveCards(player.deck),
    hand:primitiveCards(player.hand),
    discard:primitiveCards(player.discard),
    lostzone:primitiveCards(player.lostzone),
    stadium:primitiveCards(player.stadium),
    supporter:primitiveCards(player.supporter),
    prizes:player.prizes.map(primitiveCards),
    active:pokemonPrimitiveEvidence(player.active),
    bench:player.bench.map(pokemonPrimitiveEvidence)
  };
}

/** @param {object} state @returns {object} */
function sourceEffectSnapshot(state) {
  return {
    schema:'source-selected-effect-and-primitive-fields-v2',
    state:selectedFields(state,stateFields),
    statePrimitiveFields:primitiveOwnFields(state),
    players:state.players.map(player=>({
      primitive:playerPrimitiveEvidence(player),
      fields:selectedFields(player,playerFields),
      active:selectedFields(player.active,pokemonFields),
      bench:player.bench.map(slot=>selectedFields(slot,pokemonFields))
    }))
  };
}

/** @param {object} state @returns {string} */
function sourceEffectDigest(state) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(sourceEffectSnapshot(state))).digest('hex');
}
module.exports={sourceEffectSnapshot,sourceEffectDigest};
