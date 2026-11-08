'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent47-owner-public-active-position-retreat-veto-v2-equivalent-lock';

// These wordings describe continuous position-dependent Abilities, including
// Initialization, Sentinel, Neutralizing Gas, and Oceanic Curse. A generic
// mobility policy cannot price the lost lock against a single nominal attack.
// Preserve the Active spot until an explicit counterfactual evaluator exists.
const POSITION_CONDITIONS = [
  /\b(?:as long as|while) this pok[eé]mon is (?:in (?:the|your) active spot|your active pok[eé]mon)\b/i,
  /\bif this pok[eé]mon is (?:in (?:the|your) active spot|your active pok[eé]mon)\b/i
];

/**
 * Conservative protection of ongoing Active-dependent Abilities before
 * voluntary retreat or a switch-out proposal. Uses printed Ability text from
 * the acting owner's publicly visible Active Pokémon; no hidden zones.
 *
 * A positive result is a policy veto, not a statement that the Pokémon may
 * never retreat. A dedicated matchup-aware policy may establish a stronger
 * tactical line with a separate native settlement and opponent response.
 *
 * @param {object} view Deeply detached actor-owned observation.
 * @returns {boolean} Whether a generic mobility fallback should abstain.
 */
function hasActivePositionAbilityToPreserve(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  const active = view.ownPublic?.active;
  const details = active?.abilityDetails;
  if (!Array.isArray(details)) return false;
  return details.some(ability =>
    typeof ability?.text === 'string' &&
    POSITION_CONDITIONS.some(pattern => pattern.test(ability.text))
  );
}

// An exact physical-print replacement of these continuously active locks
// retains the same printed effect when it becomes Active. Do not extend this
// exception to condition-dependent or unknown Abilities without native proof.
const POSITION_LOCK_NAMES = new Set([
  'Initialization', 'Sentinel', 'Neutralizing Gas', 'Oceanic Curse'
]);

/**
 * Whether retreating into a specific publicly visible Bench recipient would
 * lose an Active-dependent Ability. Same-print, same-text replacements of
 * explicitly recognized position-only locks preserve the lock. Different
 * abilities or a missing publicly visible recipient fail closed.
 *
 * @param {object} view Detached owner-only decision snapshot.
 * @param {number} benchIndex Physical owner Bench slot.
 * @returns {boolean} True when generic mobility must decline this target.
 */
function wouldLoseActivePositionAbility(view, benchIndex) {
  assert.equal(view?.decisionKind, 'owner-root');
  if (!hasActivePositionAbilityToPreserve(view)) return false;
  const active = view.ownPublic?.active;
  const replacement = view.ownPublic?.bench?.[benchIndex];
  if (!Number.isSafeInteger(benchIndex) || benchIndex < 0 ||
      !active || !replacement || active.printing !== replacement.printing ||
      !Array.isArray(replacement.abilityDetails)) return true;
  const positionAbilities = active.abilityDetails.filter(ability =>
    typeof ability?.text === 'string' &&
    POSITION_CONDITIONS.some(pattern => pattern.test(ability.text))
  );
  return !positionAbilities.every(ability =>
    POSITION_LOCK_NAMES.has(ability.name) &&
    replacement.abilityDetails.some(candidate =>
      candidate?.name === ability.name && candidate?.text === ability.text)
  );
}

module.exports = { VERSION, hasActivePositionAbilityToPreserve,
  wouldLoseActivePositionAbility };
