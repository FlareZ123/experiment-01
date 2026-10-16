'use strict';

const { withDoubleDragonRecovery } = require('./dde-attach-tactic.cjs');
const { makeTempleUnlockTactic } = require('./temple-unlock-tactic.cjs');

const DEFAULT_PROFILE = 'simple-default-v0';
const REGIDRAGO_PROFILE = 'regidrago-dde-temple-v1';
const ALLOWED_PROFILES = Object.freeze([DEFAULT_PROFILE, REGIDRAGO_PROFILE]);

/**
 * A deliberately narrow, opt-in policy composition for comparing a source
 * Regidrago deck's actual decisions with an unchanged generic simple bot.
 * It does not purport to solve discretionary discard, attack copy targets,
 * Supporter search priorities, prize planning, locks, or competitive play.
 *
 * @param {object} options Immutable baseline SimpleBotOptions.
 * @param {string} profile One of ALLOWED_PROFILES.
 * @returns {object} SimpleBotOptions for one player seat.
 */
function optionsForProfile(options, profile) {
  if (profile === DEFAULT_PROFILE) return options;
  if (profile !== REGIDRAGO_PROFILE) {
    throw new Error('Unknown policy profile: ' + String(profile));
  }
  const withDde = withDoubleDragonRecovery(options);
  const index = withDde.tactics.findIndex(tactic => tactic.name === 'UseAbilityTactic');
  if (index < 0) throw new Error('Pinned UseAbilityTactic extension point missing.');
  return {
    ...withDde,
    tactics: [
      ...withDde.tactics.slice(0, index),
      makeTempleUnlockTactic(),
      ...withDde.tactics.slice(index)
    ]
  };
}

/**
 * @param {string[]|undefined} requested
 * @returns {[string,string]} Validated per-seat profile names.
 */
function resolvePolicyProfiles(requested) {
  const profiles = requested === undefined ?
    [DEFAULT_PROFILE, DEFAULT_PROFILE] : requested;
  if (!Array.isArray(profiles) || profiles.length !== 2 ||
      profiles.some(profile => !ALLOWED_PROFILES.includes(profile))) {
    throw new Error('policyProfiles must contain two supported profile names.');
  }
  return [profiles[0], profiles[1]];
}

module.exports = { DEFAULT_PROFILE, REGIDRAGO_PROFILE, ALLOWED_PROFILES,
  optionsForProfile, resolvePolicyProfiles };
