'use strict';

const path = require('node:path');
const { makeTempleUnlockTactic } = require('./temple-unlock-tactic.cjs');
const { runMatch } = require('./headless.cjs');
const {withTempleUnlockRecovery} = require('./temple-unlock-tactic.cjs');
const {withToolAttackAwareness} = require('./tool-attack-policy.cjs');
const {withBunnelbyEvolutionLine} = require('./bunnelby-evolution-policy.cjs');
const {withMandatoryOptionFallback} = require('./mandatory-option-policy.cjs');

const DEFAULT_PROFILE = 'simple-default-v0';
const REGIDRAGO_PROFILE = 'regidrago-dde-temple-v1';
const SUPPORTER_PROFILE = 'simple-supporter-guard-v1';
const REGIDRAGO_SUPPORTER_PROFILE = 'regidrago-dde-temple-supporter-v2';
const EXPANDED_PROFILE = 'expanded-action-fidelity-probe-v1';
const ALLOWED_PROFILES = Object.freeze([
  DEFAULT_PROFILE, REGIDRAGO_PROFILE,
  SUPPORTER_PROFILE, REGIDRAGO_SUPPORTER_PROFILE, EXPANDED_PROFILE
]);
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
 * Temporarily compose independent, opt-in Expanded action-policy corrections.
 * The default compiled tactics/resolvers are restored even after a thrown
 * engine error, and the actual pinned game rules remain untouched.
 *
 * @template T
 * @param {()=>T} fn Synchronous bounded experimental match.
 * @returns {T}
 */
function withExpandedActionOptions(fn) {
  const definitions = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const originalTactics = definitions.allSimpleTactics.slice();
  const originalResolvers = definitions.allPromptResolvers.slice();
  let options = {tactics: originalTactics, promptResolvers: originalResolvers};
  options = withTempleUnlockRecovery(options);
  options = withToolAttackAwareness(options);
  options = withBunnelbyEvolutionLine(options);
  options = withMandatoryOptionFallback(options);
  definitions.allSimpleTactics.splice(0, definitions.allSimpleTactics.length, ...options.tactics);
  definitions.allPromptResolvers.splice(0, definitions.allPromptResolvers.length, ...options.promptResolvers);
  try {
    return fn();
  } finally {
    definitions.allSimpleTactics.splice(0, definitions.allSimpleTactics.length, ...originalTactics);
    definitions.allPromptResolvers.splice(0, definitions.allPromptResolvers.length, ...originalResolvers);
  }
}

/**
 * Run an explicitly versioned research policy, preserving standard runner
 * defaults for all untouched decisions. No policy is judged competitive.
 *
 * @param {object} request MatchRequest accepted by headless.runMatch.
 * @param {string} profile A name from ALLOWED_PROFILES.
 * @returns {object} Full match record with experimental provenance labels.
 */
function runWithResearchProfile(request, profile) {
  if (!ALLOWED_PROFILES.includes(profile)) {
    throw new Error('Unknown research policy profile: ' + String(profile));
  }
  const shared = {
    ...request,
    isolatePolicyRandomness: true,
    doubleDragonRecovery: false,
    supporterDecisionCorrection: false
  };
  if (profile === DEFAULT_PROFILE || profile === SUPPORTER_PROFILE) {
    const guarded = profile === SUPPORTER_PROFILE;
    const result = runMatch({...shared, supporterDecisionCorrection: guarded});
    return {
      ...result, researchPolicyProfile: profile,
      experimentalTactics: guarded ? ['SupporterDecisionGuard-v1'] : []
    };
  }
  if (profile === EXPANDED_PROFILE) {
    const result = withExpandedActionOptions(() => runMatch({
      ...shared, doubleDragonRecovery: true, supporterDecisionCorrection: true
    }));
    const extra = [
      'TempleUnlockTactic-v1','ToolAwareAttackTactic-v1',
      'BunnelbyEvolutionTactic-v1','BarrageEvolutionResolver-v1',
      'MandatoryOptionResolver-v1'
    ];
    return {
      ...result,
      researchPolicyProfile: profile,
      policy: result.policy + '+' + extra.join('+'),
      experimentalTactics: [
        'DoubleDragonAttachTactic-v1','SupporterDecisionGuard-v1',...extra
      ]
    };
  }
  const guarded = profile === REGIDRAGO_SUPPORTER_PROFILE;
  const result = withTempleUnlockTactic(() => runMatch({
    ...shared,
    doubleDragonRecovery: true,
    supporterDecisionCorrection: guarded
  }));
  return {
    ...result,
    researchPolicyProfile: profile,
    experimentalTactics: [
      'DoubleDragonAttachTactic-v1', 'TempleUnlockTactic-v1',
      ...(guarded ? ['SupporterDecisionGuard-v1'] : [])
    ]
  };
}

module.exports = {DEFAULT_PROFILE, REGIDRAGO_PROFILE, SUPPORTER_PROFILE,
  REGIDRAGO_SUPPORTER_PROFILE, EXPANDED_PROFILE, ALLOWED_PROFILES,
  withTempleUnlockTactic, withExpandedActionOptions, runWithResearchProfile};
