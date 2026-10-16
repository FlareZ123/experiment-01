'use strict';

const crypto = require('node:crypto');

/** @param {object} list Live CardList, card array, or field absent from a test fixture. */
function printings(list) {
  const cards = Array.isArray(list) ? list : list.cards;
  return cards.map(card => card.fullName);
}

/**
 * Fingerprint only physical card zones, crucial turn restrictions, and public
 * Pokémon state. This is intentionally narrower than serializing all Twinleaf
 * Store closures, game reducers, markers, and transient effects.
 * Both players' hidden zones are observed *after* the bot chooses an action.
 * Nothing from this audit is supplied to either policy.
 *
 * @param {object} slot Live PokemonCardList
 * @returns {object} Detached exact ordered zone evidence.
 */
function pokemonZone(slot) {
  return {
    cards:printings(slot.cards),
    energies:printings(slot.energies),
    tools:printings(slot.tools),
    damage:slot.damage,
    hp:slot.hp,
    pokemonPlayedTurn:slot.pokemonPlayedTurn,
    conditions:slot.specialConditions.slice(),
    poisonDamage:slot.poisonDamage,
    burnDamage:slot.burnDamage,
    attacksThisTurn:slot.attacksThisTurn ?? null,
    cannotAttackNextTurn:slot.cannotAttackNextTurn === true,
    cannotRetreatNextTurn:slot.cannotRetreatNextTurn === true,
    abilityLockActivationOrder:slot.abilityLockActivationOrder ?? 0
  };
}

/**
 * A reproducible, strictly read-only snapshot of both players' private card
 * inventories and selected legal-turn flags at one genuine live Store moment.
 * Counts, order, duplicate printings, and Prize positions are retained.
 * It is a diagnostic source-zone checkpoint, not a full engine State clone.
 *
 * @param {object} state Pinned Twinleaf State.
 * @returns {object}
 */
function sourceZoneSnapshot(state) {
  return {
    schema:'source-zone-and-turn-flags-v1',
    phase:state.phase,turn:state.turn,
    activePlayer:state.activePlayer,winner:state.winner,
    skipOpponentTurn:state.skipOpponentTurn === true,
    previousAttack:Object.keys(state.playerLastAttack || {}).sort()
      .map(id => ({
        playerId:Number(id),
        source:state.playerLastAttack[id].sourceCard?.fullName ?? null,
        attack:state.playerLastAttack[id].attack?.name ?? null
      })),
    pendingPrompts:state.prompts.filter(p => p.result === undefined)
      .map(p => ({id:p.id,name:p.constructor.name,playerId:p.playerId})),
    players:state.players.map(player => ({
      id:player.id,
      deck:printings(player.deck),
      hand:printings(player.hand),
      discard:printings(player.discard),
      lostzone:printings(player.lostzone),
      stadium:printings(player.stadium),
      supporter:printings(player.supporter),
      prizes:player.prizes.map(prize => printings(prize)),
      active:pokemonZone(player.active),
      bench:player.bench.map(pokemonZone),
      usedGX:player.usedGX === true,
      usedVSTAR:player.usedVSTAR === true,
      energyPlayedTurn:player.energyPlayedTurn,
      supporterTurn:player.supporterTurn,
      retreatedTurn:player.retreatedTurn,
      stadiumPlayedTurn:player.stadiumPlayedTurn,
      cannotPlayItemCards:player.cannotPlayItemCards === true,
      cannotPlaySupporterCards:player.cannotPlaySupporterCards === true,
      cannotPlayPokemonCards:player.cannotPlayPokemonCards === true,
      cannotUseGXAttacks:player.cannotUseGXAttacks === true
    }))
  };
}

/** @param {object} snapshot @returns {string} */
function zoneSnapshotDigest(snapshot) {
  return crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
}

/**
 * Capture a single authentic predecision live Store checkpoint, preserving
 * the class's previous dispatch implementation (including any outer recorder).
 * Simulation stores are excluded by object identity: the first Store receiving
 * AddPlayerAction is the root match Store for the pinned headless runner.
 *
 * @template T
 * @param {function} Store Compiled pinned Store constructor.
 * @param {()=>T} work Synchronous real match runner.
 * @param {{turn:number,candidateSeat:0|1}} selector
 * @returns {{result:T,checkpoint:object,digest:string}}
 */
function withSourceZoneCheckpoint(Store, work, selector) {
  const original = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  if (!original || typeof original.value !== 'function') {
    throw new TypeError('Expected compiled Store dispatch method');
  }
  let live = null;
  let checkpoint = null;
  const wrapped = function (...args) {
    const action = args[0];
    if (!live && action?.constructor?.name === 'AddPlayerAction') live = this;
    if (this === live && checkpoint === null &&
        this.state.turn === selector.turn &&
        this.state.activePlayer === selector.candidateSeat &&
        this.state.phase === 2 &&
        this.state.prompts.every(p => p.result !== undefined)) {
      checkpoint = sourceZoneSnapshot(this.state);
    }
    return original.value.apply(this, args);
  };
  Object.defineProperty(Store.prototype, 'dispatch', {...original,value:wrapped});
  let result;
  try {
    result = work();
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch',original);
  }
  if (!checkpoint) throw new Error('Exact source-dealt predecision turn not observed');
  return {result,checkpoint,digest:zoneSnapshotDigest(checkpoint)};
}
module.exports = {printings,pokemonZone,sourceZoneSnapshot,zoneSnapshotDigest,
  withSourceZoneCheckpoint};
