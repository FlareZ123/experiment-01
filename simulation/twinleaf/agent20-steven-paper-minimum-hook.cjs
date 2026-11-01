'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

let installed = null;

/**
 * Reversible, independently narrow paper-rules guard for the original
 * Steven's Resolve CES printing used in rank-7 Aichi.
 *
 * The pinned card creates ChooseCardsPrompt with min 0 even though its
 * unrestricted "up to 3 cards" Trainer search must choose at least one.
 * The Store can dispatch a response without requiring the card's printed
 * minimum. This guard rejects only empty responses for the actual
 * source-stamped, owner-deck search before any Store mutation.
 *
 * @returns {() => void} Restore the exact prior Store dispatch implementation.
 */
function installStevenPaperMinimumHook() {
  if (installed !== null) {
    throw new Error('Steven search paper guard is already installed');
  }
  const {Store} = require(path.join(output, 'game/store/store'));
  const {ResolvePromptAction} = require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  const original = Store.prototype.dispatch;
  const audit={sourceStampedOwnDeckPrompts:0,nonemptyAccepted:0,
    emptyVetoed:0};

  /** @param {object} action @param {...unknown} args */
  function guardedDispatch(action, ...args) {
    if (action instanceof ResolvePromptAction) {
      const state = this.state;
      const prompt = state.prompts.find(p =>
        p.id === action.id && p.result === undefined);
      const owner = prompt && state.players.find(p =>
        p.id === prompt.playerId);
      const stampedSource = prompt?.sourceCard?.fullName ===
        "Steven's Resolve CES";
      const isPrintedOwnDeckSearch = stampedSource &&
        prompt.constructor.name === 'ChooseCardsPrompt' &&
        owner && prompt.cards === owner.deck;
      if (isPrintedOwnDeckSearch) {
        audit.sourceStampedOwnDeckPrompts++;
        if (!Array.isArray(action.result) || action.result.length === 0) {
          audit.emptyVetoed++;
          throw new Error('PAPER_STEVEN_CES_SEARCH_REQUIRES_ONE_CARD');
        }
        const outcome=original.call(this, action, ...args);
        audit.nonemptyAccepted++;
        return outcome;
      }
    }
    return original.call(this, action, ...args);
  }

  Store.prototype.dispatch = guardedDispatch;
  installed = {Store, original, guardedDispatch};
  const restore = function restoreStevenPaperMinimumHook() {
    if (installed === null) return;
    if (Store.prototype.dispatch === guardedDispatch) {
      Store.prototype.dispatch = original;
    }
    installed = null;
  };
  restore.audit=audit;
  return restore;
}

module.exports = {installStevenPaperMinimumHook};
