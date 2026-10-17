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

/** @param {object} state @returns {object} */
function sourceEffectSnapshot(state) {
  return {
    schema:'source-selected-effect-fields-v1',
    state:selectedFields(state,stateFields),
    players:state.players.map(player=>({
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
