'use strict';

const path = require('node:path');
const { makeTempleUnlockTactic } = require('./temple-unlock-tactic.cjs');
const { runMatch } = require('./headless.cjs');

const DEFAULT_PROFILE = 'simple-default-v0';
const REGIDRAGO_PROFILE = 'regidrago-dde-temple-v1';
const ALLOWED_PROFILES = Object.freeze([DEFAULT_PROFILE, REGIDRAGO_PROFILE]);
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Temporarily register a narrow legal two-step Temple response tactic.
 * An independent, tested `doubleDragonRecovery` option is already exposed by
 * the shared runner; this wrapper activates both for a controlled pilot.
 * Both players receive this tactical class; only Regidrago VSTAR states with
 * opposing Temple and an eligible Marshadow can trigger its intervention.
 *
 * @template T
 * @param {()=>T} fn Synchronous bounded headless match.
 * @returns {T}
 */
function withTempleUnlockTactic(fn) {
  const definitions = require(path.join(output, 'simple-bot/simple-bot-definitions'));
  const tactics = definitions.allSimpleTactics;
  const index = tactics.findIndex(tactic => tactic.name === 'UseAbilityTactic');
  if (index < 0) throw new Error('Pinned UseAbilityTactic extension point missing.');
  const Custom = makeTempleUnlockTactic();
  tactics.splice(index, 0, Custom);
  try {
    return fn();
  } finally {
    const active = tactics.indexOf(Custom);
    if (active < 0) throw new Error('Regidrago experimental tactic was not preserved.');
    tactics.splice(active, 1);
  }
}

/**
 * Run an explicitly versioned research policy, preserving standard runner
 * defaults for all untouched decisions. No policy is judged competitive.
 *
 * @param {object} request MatchRequest accepted by headless.runMatch.
 * @param {string} profile Either DEFAULT_PROFILE or REGIDRAGO_PROFILE.
 * @returns {object} Full match record with experimental provenance labels.
 */
function runWithResearchProfile(request, profile) {
  if (!ALLOWED_PROFILES.includes(profile)) {
    throw new Error('Unknown research policy profile: ' + String(profile));
  }
  if (profile === DEFAULT_PROFILE) {
    const result = runMatch({ ...request, isolatePolicyRandomness: true });
    return { ...result, researchPolicyProfile: profile, experimentalTactics: [] };
  }
  const result = withTempleUnlockTactic(() => runMatch({
    ...request, isolatePolicyRandomness: true, doubleDragonRecovery: true
  }));
  return {
    ...result,
    researchPolicyProfile: profile,
    experimentalTactics: ['DoubleDragonAttachTactic-v1', 'TempleUnlockTactic-v1']
  };
}

module.exports = {DEFAULT_PROFILE, REGIDRAGO_PROFILE, ALLOWED_PROFILES,
  withTempleUnlockTactic, runWithResearchProfile};
