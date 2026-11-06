'use strict';

const {
  proposeTwoUnitPaidRetreatV2,
} = require('./agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const VERSION = 'agent20-paid-retreat-alternative-guard-v1';
const FLOAT_STONE_PRINTING = /^Float Stone(?:\s|$)/i;
const TOOL_JAMMER_PRINTING = /^Tool Jammer(?:\s|$)/i;
const BASIC_PSYCHIC_PRINTING = /^Psychic Energy\s/i;

/**
 * @typedef {Object} PaidRetreatGuardAssessment
 * @property {boolean} eligible
 * @property {string[]} reasons
 * @property {string} version
 * @property {Object} diagnostics
 */

/**
 * Apply the remaining opportunity and custody gates after Agent42 v2 has
 * proposed a terminal two-Basic-Psychic retreat.
 *
 * This guard is deliberately conservative. A held, playable Float Stone is a
 * zero-Energy alternative that must be compared before spending two Energy.
 * Until a value comparator exists, the guard refuses the paid route.
 *
 * @param {Object} view Owner-visible actor observation.
 * @param {Object|null} proposal Agent42 v2 proposal.
 * @returns {PaidRetreatGuardAssessment}
 */
function assessPaidRetreatAlternatives(view, proposal) {
  const reasons = [];
  const own = view?.ownPublic;
  const opponent = view?.opponentPublic;
  const active = own?.active;

  if (!proposal || typeof proposal !== 'object') {
    return {
      eligible: false,
      reasons: ['no-v2-proposal'],
      version: VERSION,
      diagnostics: {},
    };
  }

  if (!own || !active || !opponent?.active) {
    reasons.push('missing-public-active-state');
  }

  const ownHandKnown = Array.isArray(view?.ownHand);
  if (!ownHandKnown) reasons.push('unknown-own-hand');

  const ownBenchKnown = Array.isArray(own?.bench);
  if (!ownBenchKnown) reasons.push('unknown-own-bench');

  const restrictions = own?.publicTurnRestrictions;
  const itemLockKnown = typeof restrictions?.itemPlayLocked === 'boolean';
  const toolLockKnown = typeof restrictions?.toolPlayLocked === 'boolean';

  const opponentActiveToolsKnown = Array.isArray(opponent?.active?.tools);

  const floatStoneInHand = ownHandKnown &&
    view.ownHand.some(card =>
      typeof card === 'string' && FLOAT_STONE_PRINTING.test(card));

  let toolJammerOnOpponentActive = false;
  if (opponentActiveToolsKnown) {
    toolJammerOnOpponentActive =
      opponent.active.tools.some(card =>
        typeof card === 'string' && TOOL_JAMMER_PRINTING.test(card));
  }

  if (floatStoneInHand) {
    if (!itemLockKnown || !toolLockKnown) {
      reasons.push('unknown-item-tool-lock-state');
    } else if (!restrictions.itemPlayLocked &&
               !restrictions.toolPlayLocked) {
      if (!opponentActiveToolsKnown) {
        reasons.push('unknown-opponent-active-tools');
      } else if (!toolJammerOnOpponentActive) {
        reasons.push('held-float-stone-alternative-uncompared');
      }
    }
  }

  const ownBoard = own && ownBenchKnown
    ? [own.active, ...own.bench].filter(Boolean)
    : [];
  const skylinerOnOwnBoard = ownBoard.some(pokemon =>
    Array.isArray(pokemon.abilityDetails) &&
    pokemon.abilityDetails.some(ability => ability?.name === 'Skyliner'));

  if (skylinerOnOwnBoard &&
      !Number.isSafeInteger(active?.printed?.stage)) {
    reasons.push('unknown-active-stage-with-skyliner');
  }

  if (proposal.kind !== 'two-unit-paid-retreat-proposal-v2') {
    reasons.push('unexpected-proposal-kind');
  }
  if (proposal.paymentClass !== 'two-distinct-basic-psychic' ||
      proposal.retreatCostUnits !== 2) {
    reasons.push('unsupported-payment-class');
  }

  const indices = proposal.discardEnergyIndices;
  const printings = proposal.discardEnergyPrintings;
  const energies = active?.energies;
  const paymentShapeValid =
    Array.isArray(indices) &&
    indices.length === 2 &&
    new Set(indices).size === 2 &&
    Array.isArray(printings) &&
    printings.length === 2 &&
    Array.isArray(energies) &&
    indices.every((index, position) =>
      Number.isSafeInteger(index) &&
      index >= 0 &&
      index < energies.length &&
      typeof energies[index] === 'string' &&
      BASIC_PSYCHIC_PRINTING.test(energies[index]) &&
      energies[index] === printings[position]);

  if (!paymentShapeValid) reasons.push('unsupported-energy-custody');

  const target = ownBenchKnown &&
    Number.isSafeInteger(proposal.benchIndex)
    ? own.bench[proposal.benchIndex]
    : null;
  if (!target || target.printing !== proposal.printing) {
    reasons.push('proposal-target-mismatch');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    version: VERSION,
    diagnostics: {
      floatStoneInHand,
      itemPlayLocked: itemLockKnown ? restrictions.itemPlayLocked : null,
      toolPlayLocked: toolLockKnown ? restrictions.toolPlayLocked : null,
      toolJammerOnOpponentActive,
      skylinerOnOwnBoard,
      activeStage: Number.isSafeInteger(active?.printed?.stage)
        ? active.printed.stage
        : null,
      paymentPrintings: paymentShapeValid
        ? indices.map(index => energies[index])
        : null,
      targetPrinting: target?.printing ?? null,
    },
  };
}

/**
 * Run Agent42 v2 and apply the supplemental Float Stone/custody guard.
 *
 * @param {Object} view Owner-visible actor observation.
 * @param {Object} catalog Actor card catalog.
 * @returns {{proposal: Object|null, assessment: PaidRetreatGuardAssessment}}
 */
function proposeGuardedTwoUnitPaidRetreatV2(view, catalog) {
  const proposal = proposeTwoUnitPaidRetreatV2(view, catalog);
  const assessment = assessPaidRetreatAlternatives(view, proposal);
  return {
    proposal: assessment.eligible ? proposal : null,
    assessment,
  };
}

module.exports = {
  VERSION,
  assessPaidRetreatAlternatives,
  proposeGuardedTwoUnitPaidRetreatV2,
};
