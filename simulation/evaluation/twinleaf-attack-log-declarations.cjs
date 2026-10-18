'use strict';

/**
 * Read newly appended pinned Twinleaf log records after one real Store action.
 * This detects attack declarations that entered through either ATTACK_ACTION
 * or the Perfection USE_ABILITY_ACTION -> RESOLVE_PROMPT copy pathway.
 *
 * It cannot independently prove the logged attack completed its effects or
 * that speculative bot cloning left the source Store untouched. Callers must
 * keep those validation gates separate.
 */

/** @typedef {{message:string,params:{name?:string,attack?:string}}} TwinleafLog */

/**
 * @param {TwinleafLog[]} logs Real Store state.logs after dispatch.
 * @param {number} startingIndex Saved state.logs.length just before dispatch.
 * @param {{actionOrdinal:number,turnBefore:number,triggerAction:string}} context
 * @returns {{logIndex:number,actionOrdinal:number,turnBefore:number,triggerAction:string,playerName:string,attackName:string,kind:string}[]}
 */
function newlyLoggedAttackDeclarations(logs, startingIndex, context) {
  if (!Array.isArray(logs) || !Number.isSafeInteger(startingIndex) ||
      startingIndex < 0 || startingIndex > logs.length) {
    throw new TypeError('Need unchanged-prefix real Store logs and a valid starting index');
  }
  return logs.slice(startingIndex).flatMap((event, i) =>
    event.message === 'LOG_PLAYER_USES_ATTACK' ? [{
      kind: 'engine-attack-declaration',
      logIndex: startingIndex + i,
      actionOrdinal: context.actionOrdinal,
      turnBefore: context.turnBefore,
      triggerAction: context.triggerAction,
      playerName: event.params.name,
      attackName: event.params.attack
    }] : []);
}

module.exports = {newlyLoggedAttackDeclarations};
