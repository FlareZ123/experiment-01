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
const EXPANDED_SOURCE_PROFILE = 'expanded-source-k0-stage-gh-v2';
const EXPANDED_GH_SEARCH_PROFILE = 'expanded-gh-root-search-v3';
const RANK11_AUTONOMOUS_PROFILE = 'rank11-autonomous-boostshake-v1';
const RANK11_OWN_FIRST_PROFILE = 'rank11-autonomous-first-own-turn-v2';
const RANK11_SUPPORTER_PROFILE = 'rank11-autonomous-boostshake-supporter-v2';
const RANK11_K1_HYBRID_PROFILE = 'rank11-k1-direct-vstar-v3';
const RANK11_K0_K1_HYBRID_PROFILE = 'rank11-k0-k1-direct-vstar-v4';
const RANK26_COLOGNE_PROFILE = 'rank26-autonomous-cologne-v1';
const RANK26_COLOGNE_PUMP_PROFILE = 'rank26-autonomous-cologne-pump-v2';
const RANK26_PROPAGATION_PROFILE = 'rank26-autonomous-cologne-pump-propagation-v3';
const ALLOWED_PROFILES = Object.freeze([
  DEFAULT_PROFILE, REGIDRAGO_PROFILE,
  SUPPORTER_PROFILE, REGIDRAGO_SUPPORTER_PROFILE,
  EXPANDED_PROFILE, EXPANDED_SOURCE_PROFILE, EXPANDED_GH_SEARCH_PROFILE,
  RANK11_AUTONOMOUS_PROFILE, RANK11_OWN_FIRST_PROFILE,
  RANK11_SUPPORTER_PROFILE, RANK11_K1_HYBRID_PROFILE,
  RANK11_K0_K1_HYBRID_PROFILE,
  RANK26_COLOGNE_PROFILE, RANK26_COLOGNE_PUMP_PROFILE,
  RANK26_PROPAGATION_PROFILE
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
 * @param {{sourceK0Bunnelby?:boolean}} [configuration] Omit the deck-peeking
 *   Bunnelby policy when the headless runner installs its per-seat source-60
 *   K0-safe replacement. This flag alone does not certify policy quality.
 * @returns {T}
 */
function withExpandedActionOptions(fn, {sourceK0Bunnelby = false} = {}) {
  const definitions = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const originalTactics = definitions.allSimpleTactics.slice();
  const originalResolvers = definitions.allPromptResolvers.slice();
  let options = {tactics: originalTactics, promptResolvers: originalResolvers};
  options = withTempleUnlockRecovery(options);
  options = withToolAttackAwareness(options);
  if (!sourceK0Bunnelby) options = withBunnelbyEvolutionLine(options);
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
  if (profile === RANK11_K1_HYBRID_PROFILE ||
      profile === RANK11_K0_K1_HYBRID_PROFILE) {
    const {rank11SourceSeat, ...matchRequest} = shared;
    if (![0, 1].includes(rank11SourceSeat)) {
      throw new Error('Combined rank11 K1 opponent profile needs the source physical seat.');
    }
    const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
    const {withRank11AutonomousOpener} = require('./rank11-autonomous-opener.cjs');
    const direct = withRank11DirectBoostShake(rank11SourceSeat,
      () => withRank11AutonomousOpener(rank11SourceSeat,
        () => runMatch(matchRequest),
        {allowSecondGlobalTurn: true,
          version: 'rank11-original-vstar-first-own-v2'}),
      {k1AvoidMissingGarbodor: true,
        k0AvoidAllGarbodorHeld: profile === RANK11_K0_K1_HYBRID_PROFILE});
    return {
      ...direct.result.result,
      researchPolicyProfile: profile,
      experimentalTactics: [
        profile === RANK11_K0_K1_HYBRID_PROFILE ?
          'Rank11DirectBoostShakeK0K1-v3' : 'Rank11DirectBoostShakeK1-v2',
        'Rank11FirstOwnTurnVSTAR-v2'
      ],
      rank11DirectPolicy: direct.policyAudit,
      rank11AutonomousPolicy: direct.result.policyAudit,
      competitiveGameQualified: false
    };
  }
  if ([RANK11_AUTONOMOUS_PROFILE, RANK11_OWN_FIRST_PROFILE,
      RANK11_SUPPORTER_PROFILE].includes(profile)) {
    const {rank11SourceSeat, ...matchRequest} = shared;
    if (![0, 1].includes(rank11SourceSeat)) {
      throw new Error('Rank-11 autonomous opener requires the actual source seat.');
    }
    const {withRank11AutonomousOpener} = require('./rank11-autonomous-opener.cjs');
    const v2 = profile === RANK11_OWN_FIRST_PROFILE;
    const supporter = profile === RANK11_SUPPORTER_PROFILE;
    const audit = withRank11AutonomousOpener(rank11SourceSeat,
      () => runMatch({...matchRequest, supporterDecisionCorrection: supporter}), {
        allowSecondGlobalTurn: v2,
        version: profile
      });
    return {
      ...audit.result,
      researchPolicyProfile: profile,
      policy: String(audit.result.policy || 'unqualified-simple-bot') +
        (v2 ? '+Rank11FirstOwnTurn-v2' : '+Rank11AutonomousOpener-v1'),
      experimentalTactics: [v2 ? 'Rank11FirstOwnTurn-v2' :
        'Rank11AutonomousOpener-v1',
        ...(supporter ? ['SupporterDecisionGuard-v1'] : [])],
      rank11AutonomousPolicy: audit.policyAudit
    };
  }
  if (profile === RANK26_PROPAGATION_PROFILE) {
    const {rank26SourceSeat, ...matchRequest} = shared;
    if (![0, 1].includes(rank26SourceSeat)) {
      throw new Error('Rank-26 propagation profile requires its source physical seat.');
    }
    const {withRank26CologneOpener} = require('./rank26-cologne-opener.cjs');
    const {withRank26ExeggcutePump} = require('./rank26-exeggcute-pump-policy.cjs');
    const {withRank26PropagationLoop} = require('./rank26-propagation-loop.cjs');
    const {installDamagePumpSingleSourceHook} =
      require('./damage-pump-single-source-hook.cjs');
    const restorePump = installDamagePumpSingleSourceHook();
    try {
      const combined = withRank26CologneOpener(rank26SourceSeat,
        () => withRank26ExeggcutePump(rank26SourceSeat,
          () => withRank26PropagationLoop(rank26SourceSeat,
            () => runMatch(matchRequest))));
      const game = combined.result.result.result;
      return {
        ...game,
        researchPolicyProfile: profile,
        policy: String(game.policy || 'unqualified-simple-bot') +
          '+Rank26ColognePumpPropagation-v3',
        experimentalTactics: ['Rank26CologneOpener-v1',
          'Rank26PrizeCappedPump-v2', 'Rank26PropagationLoop-v1'],
        rank26ColognePolicy: combined.policyAudit,
        rank26PumpPolicy: combined.result.policyAudit,
        rank26PropagationPolicy: combined.result.result.policyAudit,
        damagePumpSingleSourceCorrection: true,
        competitiveGameQualified: false
      };
    } finally {
      restorePump();
    }
  }
  if (profile === RANK26_COLOGNE_PUMP_PROFILE) {
    const {rank26SourceSeat, ...matchRequest} = shared;
    if (![0, 1].includes(rank26SourceSeat)) {
      throw new Error('Rank-26 first-turn policy requires its source seat.');
    }
    const {withRank26CologneOpener} = require('./rank26-cologne-opener.cjs');
    const {withRank26ExeggcutePump} = require('./rank26-exeggcute-pump-policy.cjs');
    const {installDamagePumpSingleSourceHook} =
      require('./damage-pump-single-source-hook.cjs');
    const restorePump=installDamagePumpSingleSourceHook();
    try {
      const combined=withRank26CologneOpener(rank26SourceSeat,
        () => withRank26ExeggcutePump(rank26SourceSeat,
          () => runMatch(matchRequest)));
      return {
        ...combined.result.result,
        researchPolicyProfile: profile,
        policy: String(combined.result.result.policy || 'unqualified-simple-bot') +
          '+Rank26ColognePump-v2',
        experimentalTactics:['Rank26CologneOpener-v1',
          'Rank26SingleSourcePump-v1'],
        rank26ColognePolicy:combined.policyAudit,
        rank26PumpPolicy:combined.result.policyAudit,
        damagePumpSingleSourceCorrection:true
      };
    }finally{
      restorePump();
    }
  }
  if (profile === RANK26_COLOGNE_PROFILE) {
    const {rank26SourceSeat, ...matchRequest} = shared;
    if (![0, 1].includes(rank26SourceSeat)) {
      throw new Error('Rank-26 Cologne research requires a source seat.');
    }
    const {withRank26CologneOpener} = require('./rank26-cologne-opener.cjs');
    const audit = withRank26CologneOpener(rank26SourceSeat,
      () => runMatch(matchRequest));
    return {
      ...audit.result,
      researchPolicyProfile: profile,
      policy: String(audit.result.policy || 'unqualified-simple-bot') +
        '+Rank26CologneOpener-v1',
      experimentalTactics: ['Rank26CologneOpener-v1'],
      rank26ColognePolicy: audit.policyAudit
    };
  }
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
  if (profile === EXPANDED_SOURCE_PROFILE || profile === EXPANDED_GH_SEARCH_PROFILE) {
    // Keep the earlier Expanded probe stable. Defer Bunnelby registration to
    // headless, which constructs one printing-aware source-60 policy per seat.
    // Source-K0 possibilities must not inspect the actual hidden deck/Prizes.
    const result = withExpandedActionOptions(() => runMatch({
      ...shared,
      doubleDragonRecovery: true,
      supporterDecisionCorrection: true,
      bunnelbyK0SafeEvolution: true,
      bunnelbyTargetAwareEvolution: true,
      bunnelbyGuzmaHalaMode1: true,
      bunnelbyGuzmaHalaSearch: profile === EXPANDED_GH_SEARCH_PROFILE
    }), {sourceK0Bunnelby: true});
    const globalCorrections = [
      'TempleUnlockTactic-v1', 'ToolAwareAttackTactic-v1',
      'MandatoryOptionResolver-v1'
    ];
    return {
      ...result,
      researchPolicyProfile: profile,
      policy: result.policy + '+' + globalCorrections.join('+'),
      experimentalTactics: [
        'DoubleDragonAttachTactic-v1', 'SupporterDecisionGuard-v1',
        ...globalCorrections,
        'BunnelbyEvolutionTactic-v1', 'BarrageEvolutionResolver-v1',
        'BunnelbySourceK0PossibleEvolution-v1',
        'BunnelbyStageTargetResolver-v1', 'BunnelbyGuzmaHalaMode1-v1',
        ...(profile === EXPANDED_GH_SEARCH_PROFILE ? ['BunnelbyGHRootSearch-v1'] : [])
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

module.exports = {RANK11_K1_HYBRID_PROFILE, RANK11_K0_K1_HYBRID_PROFILE,
  DEFAULT_PROFILE, REGIDRAGO_PROFILE, SUPPORTER_PROFILE,
  REGIDRAGO_SUPPORTER_PROFILE, EXPANDED_PROFILE, EXPANDED_SOURCE_PROFILE,
  EXPANDED_GH_SEARCH_PROFILE, RANK11_AUTONOMOUS_PROFILE,
  RANK11_OWN_FIRST_PROFILE, RANK11_SUPPORTER_PROFILE,
  RANK26_COLOGNE_PROFILE,
  RANK26_COLOGNE_PUMP_PROFILE, RANK26_PROPAGATION_PROFILE, ALLOWED_PROFILES,
  withTempleUnlockTactic, withExpandedActionOptions, runWithResearchProfile};
