'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent47-owner-public-active-position-retreat-veto-v1';

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

module.exports = { VERSION, hasActivePositionAbilityToPreserve };
