'use strict';
const assert = require('node:assert/strict');

/**
 * Extract real native ChooseAttackPrompt decisions from the headless trace.
 * Capture is independent of optional actor prompt-selection adapters.
 * @param {object[]} trace
 * @param {0|1} ownerSeat
 * @returns {object[]}
 */
function nativeCopiedAttackChoiceLedger(trace, ownerSeat) {
  assert.ok(Array.isArray(trace));
  assert.ok(ownerSeat === 0 || ownerSeat === 1);
  let latestSourceAttack = null;
  const selections = [];
  for (const row of trace) {
    if (row.playerSlot !== ownerSeat) continue;
    if (row.action === 'AttackAction') {
      latestSourceAttack = {
        turn: row.turnBefore,
        actionOrdinal: row.actionOrdinal,
        name: row.attack ?? null,
        attacker: row.attacker ?? null
      };
      continue;
    }
    const choice = row.attackChoice;
    if (row.action !== 'ResolvePromptAction' ||
        choice?.schema !== 'choose-attack-reference-v1' ||
        choice.promptKind !== 'ChooseAttackPrompt') continue;
    const preceding = latestSourceAttack?.turn === row.turnBefore &&
      latestSourceAttack.actionOrdinal < row.actionOrdinal ?
      latestSourceAttack : null;
    const selected = choice.selection;
    selections.push({
      turn: row.turnBefore,
      actionOrdinal: row.actionOrdinal,
      sourceAttackActionOrdinal: preceding?.actionOrdinal ?? null,
      sourceAttackName: preceding?.name ?? null,
      sourceAttacker: preceding?.attacker ?? null,
      apexInitiationObserved: preceding?.name === 'Apex Dragon',
      promptMessage: choice.message ?? null,
      sourceOptions: choice.sources,
      selection: selected === null ? null : {
        printing: selected.printing,
        sourceIndex: selected.index,
        attackIndex: selected.attackIndex,
        attackName: selected.attackName
      }
    });
  }
  return selections;
}

module.exports = {nativeCopiedAttackChoiceLedger};
