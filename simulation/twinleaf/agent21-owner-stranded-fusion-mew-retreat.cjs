'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent21-owner-stranded-mew-dce-retreat-from-pass-v1';
const DCE = 'Double Colorless Energy SUM';
const MEW_VMAX = 'Mew VMAX FST';
const GENESECT_V = 'Genesect V FST';
const STRANDED_ACTIVE = new Map([
  ['Dedenne-GX UNB', 1],
  ["Lillie's Clefairy ex JTG", 1],
  ['Genesect V FST', 2]
]);

/**
 * A mechanically grounded owner-only possible paid retreat, when an off-axis
 * Active has printed DCE and a distinct DCE-fed Mew VMAX is waiting on Bench.
 * An offered action must subsequently be approved by the original native
 * Store and verified to create a source Cross Fusion Strike opportunity.
 *
 * No hidden draw-deck, Prize composition, opponent hand, or other private
 * player state is inspected. Owner/public state restriction flags are not
 * guaranteed exhaustive, so this selector is an intent, not a legality oracle.
 *
 * @param {object} view Detached actorObservation, owner's genuine root.
 * @param {object} catalog Public fixed card types/status enums.
 * @returns {object|null} Native-neutral, paper-specific paid retreat intent.
 */
function chooseStrandedFusionMewRetreat(view, catalog) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic;
  const active = own?.active;
  const resources = view.ownTurnResources;
  if (!active || !Array.isArray(own?.bench) || !resources ||
    !Number.isSafeInteger(view.globalTurn) || view.globalTurn < 2 ||
    !Number.isSafeInteger(resources.retreatedTurn) ||
    resources.retreatedTurn === view.globalTurn) return null;
  const printedCost = STRANDED_ACTIVE.get(active.printing);
  if (!printedCost) return null;
  const colorless = catalog.colorlessEnergyType;
  const actualCost = active.printed?.retreatCost;
  if (!Number.isSafeInteger(colorless) || !Array.isArray(actualCost) ||
    actualCost.length !== printedCost ||
    actualCost.some(t => t !== colorless)) return null;
  if (!Array.isArray(active.energies) || active.energies.length !== 1 ||
    active.energies[0] !== DCE) return null;
  if (active.publicRestrictions?.cannotRetreatNextTurn === true ||
    active.publicRestrictions?.cannotRetreatWhileActive === true ||
    active.publicRestrictions?.cannotRetreat === true ||
    active.specialConditions?.some(s =>
      s === catalog.specialConditions?.ASLEEP ||
      s === catalog.specialConditions?.PARALYZED)) return null;
  if (own.publicTurnRestrictions?.attackLockTurnsRemaining > 0) return null;
  const stadiums = [
    ...(Array.isArray(own.stadium) ? own.stadium : []),
    ...(Array.isArray(view.opponentPublic?.stadium) ?
      view.opponentPublic.stadium : [])
  ];
  if (stadiums.some(name => name.startsWith('Temple of Sinnoh '))) return null;
  if (!own.bench.some(p => p?.printing === GENESECT_V)) return null;

  for (let i = 0; i < own.bench.length; i++) {
    const target = own.bench[i];
    if (target?.printing !== MEW_VMAX || !Array.isArray(target.energies) ||
      target.energies.length !== 1 || target.energies[0] !== DCE ||
      target.publicRestrictions?.cannotAttackNextTurn === true ||
      target.specialConditions?.some(s =>
        s === catalog.specialConditions?.ASLEEP ||
        s === catalog.specialConditions?.PARALYZED)) continue;
    const strike = target.attacks?.find(a =>
      a.name === 'Cross Fusion Strike' &&
      Array.isArray(a.cost) && a.cost.length === 2 &&
      a.cost.every(t => t === colorless));
    if (!strike ||
      target.publicRestrictions?.blockedAttackNameNextTurn === strike.name ||
      target.publicRestrictions?.blockedAttackNameUntilLeavesActive === strike.name ||
      target.publicRestrictions?.cannotUseAttacksNextTurn?.includes(strike.name) ||
      (target.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
        target.publicRestrictions.onlyAllowedAttackNameNextTurn !== strike.name))
      continue;
    return {
      kind: 'paid-retreat', benchIndex: i,
      activePrinting: active.printing, printing: MEW_VMAX,
      attackName: strike.name, retreatCostUnits: printedCost,
      paymentPrinting: DCE, source: VERSION,
      nativePlayability: 'requires-original-Store-acceptance'
    };
  }
  return null;
}

module.exports = {VERSION, DCE, MEW_VMAX, GENESECT_V,
  STRANDED_ACTIVE, chooseStrandedFusionMewRetreat};
