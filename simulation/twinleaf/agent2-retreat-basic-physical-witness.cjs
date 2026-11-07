'use strict';

const assert = require('node:assert/strict');

const BASIC_NAMES = new Set([
  'Grass Energy', 'Fire Energy', 'Water Energy',
  'Lightning Energy', 'Psychic Energy', 'Fighting Energy',
  'Darkness Energy', 'Metal Energy', 'Fairy Energy'
]);
const VERSION = 'agent2-retreat-basic-physical-identity-witness-v1';

/**
 * Capture only the acting player's publicly visible cards before an actual
 * RetreatAction. Physical card object identity is retained only in this
 * process, never serialized. This is a narrow settlement check for an
 * unmodified, Basic-only printed retreat cost. It does not certify that
 * retreat was legally allowed or that effective cost modifiers were absent.
 *
 * @param {object} state Actual pre-dispatch Twinleaf State.
 * @param {0|1} seat Actor seat.
 * @param {number} benchIndex Native RetreatAction benchIndex.
 * @returns {{verify:(after:object)=>object, printedFeeUnits:number}}
 */
function captureBasicRetreatPhysicalWitness(state, seat, benchIndex) {
  assert.ok(seat === 0 || seat === 1);
  assert.ok(Number.isSafeInteger(benchIndex) && benchIndex >= 0);
  const player = state.players[seat];
  const from = player.active;
  const target = player.bench[benchIndex];
  const sourcePokemon = from.getPokemonCard();
  const targetPokemon = target?.getPokemonCard();
  assert.ok(sourcePokemon && targetPokemon, 'both exact physical Pokemon required');
  const printedFeeUnits = sourcePokemon.retreat?.length;
  const paid = from.energies.cards.slice();
  assert.ok(Number.isSafeInteger(printedFeeUnits) && printedFeeUnits >= 2);
  assert.equal(paid.length, printedFeeUnits,
    'restricted receipt requires the exact Basic-only printed fee');
  assert.ok(paid.every(card => BASIC_NAMES.has(card.name)),
    'restricted receipt excludes Special Energy');
  assert.equal(from.tools.length, 0,
    'restricted receipt excludes Tools with potential cost modifiers');

  const beforeDiscard = new Set(player.discard.cards);
  const originalTargetEnergies = target.energies.cards.slice();
  const originalTargetTools = target.tools.slice();
  const originalTargetDamage = target.damage;
  const originalSourceDamage = from.damage;
  const turn = state.turn;

  function verify(after) {
    const owner = after.players[seat];
    const movedToActive = owner.active.getPokemonCard() === targetPokemon;
    const oldActiveSlots = owner.bench.filter(slot =>
      slot.getPokemonCard() === sourcePokemon);
    const exactOldActive = oldActiveSlots.length === 1 ?
      oldActiveSlots[0] : null;
    const freshDiscard = owner.discard.cards.filter(card =>
      !beforeDiscard.has(card));
    const cardsPaidExactly = freshDiscard.length === paid.length &&
      paid.every(card => freshDiscard.includes(card)) &&
      paid.every(card => !exactOldActive?.energies.cards.includes(card));
    const recipientPreserved = originalTargetEnergies.length ===
      owner.active.energies.cards.length &&
      originalTargetEnergies.every(card =>
        owner.active.energies.cards.includes(card)) &&
      originalTargetTools.length === owner.active.tools.length &&
      originalTargetTools.every(card => owner.active.tools.includes(card)) &&
      owner.active.damage === originalTargetDamage;
    const outgoingPreserved = exactOldActive !== null &&
      exactOldActive.damage === originalSourceDamage &&
      exactOldActive.energies.cards.length === 0;
    const valid = after.turn === turn && movedToActive &&
      outgoingPreserved && recipientPreserved && cardsPaidExactly;
    return {
      version: VERSION, valid, actorSeat: seat,
      printedFeeUnits, nativeTurnUnchanged: after.turn === turn,
      exactRecipientPhysicalIdentity: movedToActive,
      exactOutgoingPhysicalIdentity: exactOldActive !== null,
      originalPokemonDamagePreserved: outgoingPreserved,
      originalTargetAttachmentsPreserved: recipientPreserved,
      exactBasicPaymentToOwnDiscard: cardsPaidExactly
    };
  }
  return {verify, printedFeeUnits};
}

module.exports = {VERSION, captureBasicRetreatPhysicalWitness};
