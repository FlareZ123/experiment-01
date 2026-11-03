'use strict';

const assert = require('node:assert/strict');
const { printedEnergyPayability } =
  require('./actor-energy-payability.cjs');
const { costUnderStadium, toEnergySymbols, publicEnergyContext } =
  require('./agent7-funded-stadium-attack-planner.cjs');

const VERSION = 'agent5-opponent-public-stadium-attack-entitlement-v1';

/**
 * Read-only opposing Active printed-Energy attack-cost comparison after a
 * proposed Stadium change. No card is selected or played by this module.
 * Caller must independently certify the user's physical held Stadium,
 * printed name, once-per-turn Stadium quota, public lock and actual Store
 * resolution before treating the proposal as playable.
 *
 * This compares public printed Energy under the two verified cost-modifier
 * Stadiums (Wondrous Labyrinth and Thunder Mountain) or no Stadium. Other
 * Stadiums, damage modifiers, GX permission, Special Conditions, attack
 * effects, Weakness/Resistance, card-effect immunity and future responses
 * remain unresolved.
 *
 * @param {object} view Detached genuine owner-root actorObservation.
 * @param {string|null} previousName Printed name currently affecting board.
 * @param {string|null} replacementName Printed name after proposed action.
 * @param {{cardTypes:object,stageBasic:number}} refs Native public enums.
 * @returns {object} Public opponent potential, not actual action legality.
 */
function opponentStadiumAttackEntitlement(
  view, previousName, replacementName, refs
) {
  assert.equal(view?.decisionKind, 'owner-root');
  const active = view.opponentPublic?.active;
  const base = {
    version: VERSION,
    source: 'opponent-public-active-only',
    actorSeat: view.actorSeat,
    beforeStadium: previousName,
    afterStadium: replacementName,
    opponentActive: active?.printing ?? null,
    unknown: [],
    newlyPayable: [],
    newlyUnpayable: [],
    unchanged: [],
    scope: 'Public printed Active Energy only; opponent must survive and have attack permission on its turn'
  };
  if (!active) return { ...base, status: 'no-opponent-active' };
  if (!Array.isArray(active.printed?.types) ||
      !Array.isArray(active.energies) ||
      !Array.isArray(active.attacks)) {
    return { ...base, status: 'unavailable-public-printed-context' };
  }

  // The original actor is NOT the opponent. Reorient the two public Prize
  // counts before resolving opponent-conditioned Reversal/Counter Energy.
  // This constructed view contains no concealed opponent hand or Prize cards.
  const opposingPerspective = {
    ownPublic: view.opponentPublic,
    opponentPublic: view.ownPublic
  };
  const context = publicEnergyContext(
    opposingPerspective, active, refs.cardTypes, refs.stageBasic
  );
  const rows = [];
  for (const attack of active.attacks) {
    if (!Array.isArray(attack.cost)) {
      rows.push({ name: attack.name, classification: 'unknown',
        reason: 'unavailable-printed-attack-cost' });
      continue;
    }
    const oldCost = costUnderStadium(
      attack.cost, active.printed.types, previousName, refs.cardTypes
    );
    const newCost = costUnderStadium(
      attack.cost, active.printed.types, replacementName, refs.cardTypes
    );
    const oldSymbols = oldCost === null ? null :
      toEnergySymbols(oldCost, refs.cardTypes);
    const newSymbols = newCost === null ? null :
      toEnergySymbols(newCost, refs.cardTypes);
    const before = oldSymbols === null ? null :
      printedEnergyPayability(oldSymbols, active.energies, context);
    const after = newSymbols === null ? null :
      printedEnergyPayability(newSymbols, active.energies, context);
    const oldPayable = before?.payable ?? null;
    const newPayable = after?.payable ?? null;
    const classification = oldPayable === null || newPayable === null ?
      'unknown' : !oldPayable && newPayable ?
      'newly-payable' : oldPayable && !newPayable ?
      'newly-unpayable' : 'unchanged';
    rows.push({
      name: attack.name,
      printedDamage: Number.isFinite(attack.damage) ?
        attack.damage : null,
      beforeSymbols: oldSymbols, afterSymbols: newSymbols,
      beforePayable: oldPayable, afterPayable: newPayable,
      classification
    });
  }
  return {
    ...base, status: 'public-printed-attack-costs-compared',
    newlyPayable: rows.filter(x => x.classification === 'newly-payable'),
    newlyUnpayable: rows.filter(x => x.classification === 'newly-unpayable'),
    unchanged: rows.filter(x => x.classification === 'unchanged'),
    unknown: rows.filter(x => x.classification === 'unknown'),
    rows
  };
}

module.exports = { VERSION, opponentStadiumAttackEntitlement };
