'use strict';

const assert = require('node:assert/strict');

/**
 * Comparable public/root-action observation from an archived decision row.
 * This deliberately excludes hands, deck contents, previous-state snapshots,
 * scores, post-action Prizes, and other state information. Pinned root traces
 * are incomplete: omitted ability recipients and other unrecorded choices
 * cannot be compared, and no missing choice is imputed.
 * @param {object} action Archived root decision row.
 * @returns {object} Canonical observed decision fields.
 */
function observedDecision(action) {
  assert.ok(action && typeof action === 'object');
  const selection = action.cardSelection;
  const retreat = action.retreatTransition;
  return {
    seat: action.playerSlot ?? null,
    kind: action.action ?? null,
    card: action.card ?? null,
    attack: action.attack ?? null,
    attacker: action.attacker ?? null,
    ability: action.ability ?? null,
    cardSelection: selection == null ? null : {
      promptKind: selection.promptKind ?? null,
      sourceZone: selection.sourceZone ?? null,
      sourceSeat: selection.sourcePlayerSlot ?? null,
      message: selection.message ?? null,
      selectedCards: selection.selectedCards ?? null,
      selectedIndices: selection.selectedIndices ?? null,
      unmappedSelectedCards: selection.unmappedSelectedCards ?? null
    },
    retreatDestination: retreat == null ? null : {
      benchIndex: retreat.destinationBenchIndex ?? null,
      pokemonName: retreat.intendedActive?.name ?? null
    }
  };
}

/**
 * Locate the first *represented* decision difference in paired source logs.
 * An unchanged action class is insufficient to establish an unchanged choice:
 * the same ResolvePromptAction can select different cards. Conversely, this
 * routine cannot compare choices excluded from the source decisionTrace.
 * @param {readonly object[]} control Actual original source decisions.
 * @param {readonly object[]} treatment Exact same-source treated decisions.
 * @returns {{index:number,originalOrdinal:number|null,treatedOrdinal:number|null,original:object|null,treated:object|null}|null}
 */
function firstObservedDecisionDifference(control, treatment) {
  assert.ok(Array.isArray(control) && Array.isArray(treatment));
  const size = Math.max(control.length, treatment.length);
  for (let index = 0; index < size; index++) {
    const original = control[index] ? observedDecision(control[index]) : null;
    const treated = treatment[index] ? observedDecision(treatment[index]) : null;
    if (JSON.stringify(original) !== JSON.stringify(treated)) {
      return {
        index,
        originalOrdinal: control[index]?.actionOrdinal ?? null,
        treatedOrdinal: treatment[index]?.actionOrdinal ?? null,
        original,
        treated
      };
    }
  }
  return null;
}

module.exports = {observedDecision, firstObservedDecisionDifference};
