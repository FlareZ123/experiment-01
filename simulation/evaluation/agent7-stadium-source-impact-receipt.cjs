'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent7-stadium-source-impact-receipt-v1';

/** @param {object} record */
function identity(record) {
  return [
    record.actionOrdinal, record.turnBefore, record.playerSlot,
    record.action, record.pendingPrompt ?? null,
    record.card ?? null, record.attack ?? null,
    record.ability ?? null
  ];
}

/**
 * Compare every actual native action up to the first difference without
 * treating a post-divergence state-dependent action ordinal as a matched root.
 * Only public after-choice traces and dispatch receipts enter this analysis.
 *
 * @param {object} fixture Fixed original physical source registration.
 * @param {object} control Native first control result.
 * @param {object} selected Actual one-action selected result.
 * @param {object} audit Native selected actual owner Store witness.
 */
function auditSourceImpact(fixture, control, selected, audit) {
  assert.ok(fixture && control && selected && audit);
  assert.ok(Array.isArray(control.rootActionLedger));
  assert.ok(Array.isArray(selected.rootActionLedger));
  const left = control.rootActionLedger;
  const right = selected.rootActionLedger;
  let prefix = 0;
  while (prefix < left.length && prefix < right.length &&
      JSON.stringify(identity(left[prefix])) ===
        JSON.stringify(identity(right[prefix]))) prefix++;
  const oldRoot = left[prefix] ?? null;
  const selectedRoot = right[prefix] ?? null;
  const selectedNativeStore = audit.selectedNativeStore;
  const selectedAction = audit.dispatches?.[0] ?? null;
  const firstActualSourceDivergence = !!oldRoot && !!selectedRoot &&
    prefix === selectedRoot.actionOrdinal &&
    oldRoot.actionOrdinal === selectedRoot.actionOrdinal &&
    oldRoot.turnBefore === fixture.sourceTurn &&
    selectedRoot.turnBefore === fixture.sourceTurn &&
    oldRoot.playerSlot === fixture.sourceSeat &&
    selectedRoot.playerSlot === fixture.sourceSeat &&
    oldRoot.action === 'PassTurnAction' &&
    selectedRoot.action === 'PlayCardAction' &&
    selectedNativeStore === 'accepted' &&
    selectedAction?.globalTurn === fixture.sourceTurn &&
    selectedAction?.replacement === fixture.ownerHeldReplacement &&
    selectedAction?.originalStadium === fixture.sourceOriginal &&
    selectedAction?.handIndex === fixture.heldPhysicalHandIndex &&
    selectedAction?.replacementOnOwnStadium === true;
  const treatmentNextSourceAttacks =
    (selected.decisionTrace ?? []).filter(row =>
      row.action === 'AttackAction' &&
      row.playerSlot === fixture.sourceSeat &&
      row.turnBefore >= fixture.sourceTurn).map(row => ({
        turn: row.turnBefore,
        name: row.attack ?? null,
        actionOrdinal: row.actionOrdinal,
        prizesAfter: row.prizesAfter ?? null
      }));
  const controlNextSourceAttacks =
    (control.decisionTrace ?? []).filter(row =>
      row.action === 'AttackAction' &&
      row.playerSlot === fixture.sourceSeat &&
      row.turnBefore >= fixture.sourceTurn).map(row => ({
        turn: row.turnBefore,
        name: row.attack ?? null,
        actionOrdinal: row.actionOrdinal,
        prizesAfter: row.prizesAfter ?? null
      }));
  const opponentFollowUp = right.slice(prefix + 1)
    .filter(row => row.playerSlot === 1 - fixture.sourceSeat &&
      ['PlayCardAction','UseAbilityAction','AttackAction',
        'RetreatAction','PassTurnAction'].includes(row.action))
    .slice(0, 15).map(row => ({
      actionOrdinal: row.actionOrdinal, turn: row.turnBefore,
      action: row.action,
      card: row.card ?? null, attack: row.attack ?? null,
      ability: row.ability ?? null
    }));
  const finalPrizes = game =>
    game.decisionTrace?.at(-1)?.prizesAfter ?? null;
  return {
    version: VERSION,
    fixtureId: fixture.id,
    actualSourceActionsCompared: [left.length, right.length],
    firstDifferenceIndex: prefix,
    strictlyMatchingSourcePrefix: prefix > 0,
    before: oldRoot,
    selected: selectedRoot,
    firstActualSourceDivergence,
    sourceNativeStore: selectedNativeStore,
    originalStadiumMovedCorrectly:
      selectedAction?.originalInOwnLostZone === true ||
      selectedAction?.originalInOwnDiscard === true,
    selectedSourceAttackActionsAfterDivergence: treatmentNextSourceAttacks,
    controlSourceAttackActionsAfterDivergence: controlNextSourceAttacks,
    actualOpponentFollowup: opponentFollowUp,
    controlFinalPrizeCountsWithinCap: finalPrizes(control),
    selectedFinalPrizeCountsWithinCap: finalPrizes(selected),
    conclusionScope:
      'Authentic native source Store action and capped continuation only; no paper clock, competitive outcome or win-rate proof'
  };
}

module.exports = { VERSION, identity, auditSourceImpact };
