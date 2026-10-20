'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent7-canonical-actor-five-component-v2';

/**
 * Install one ordered actor-observation-only root/prompt decision chain around
 * the unchanged canonical bilateral development executable. The last-installed
 * handler sees decisions first. Copied-attack, SelectOption and Select prompts take
 * precedence over Fog Crystal's Item/search channel, which precedes the
 * generic Basic/Energy/printed-attack root choice.
 *
 * Fallbacks remain observable and unqualified. A source-specific scripted
 * pressure wrapper inside the canonical executor is also not evidence of
 * an independent competent opposing policy.
 *
 * @template T
 * @param {()=>T} execute Synchronous genuine pinned-Store workload.
 * @param {{root?:Function,fog?:Function,select?:Function,option?:Function,attack?:Function}} [adapters]
 *   Test injection only. Real components have their own pinned-Store tests.
 * @returns {{result:T,audit:object}}
 */
function withCanonicalActorOnlyPolicy(execute, adapters = {}) {
  assert.equal(typeof execute, 'function');
  const root = adapters.root ??
    require('../twinleaf/agent34-actor-only-root-policy.cjs')
      .withActorOnlyRootPolicy;
  const fog = adapters.fog ??
    require('../twinleaf/agent9-fog-actor-prompt.cjs')
      .withActorFogCrystalPrompt;
  const select = adapters.select ??
    require('../twinleaf/agent8-actor-only-select-prompt.cjs')
      .withActorOnlySelectPrompt;
  const option = adapters.option ??
    require('../twinleaf/agent13-actor-only-select-option.cjs')
      .withActorOnlySelectOption;
  const attack = adapters.attack ??
    require('../twinleaf/agent13-actor-only-choose-attack.cjs')
      .withActorOnlyChooseAttack;
  for (const component of [root, fog, select, option, attack]) {
    assert.equal(typeof component, 'function');
  }

  const rooted = root(() => fog(() => select(() => option(() => attack(execute)))));
  const fogged = rooted.result;
  const selected = fogged.result;
  const optioned = selected.result;
  const attacked = optioned.result;
  const rootAudit = rooted.audit;
  const fogAudit = fogged.audit;
  const selectAudit = selected.audit;
  const optionAudit = optioned.audit;
  const attackAudit = attacked.audit;
  for (const audit of [rootAudit, fogAudit, selectAudit, optionAudit, attackAudit]) {
    assert.ok(audit && typeof audit === 'object',
      'Each actor-only adapter must return its own audit');
  }

  const finalGenericPromptFallbacks =
    rootAudit.unsupportedPromptFallbacks ?? null;
  const audit = {
    version: VERSION,
    selectedHandlerPriority: [
      'ChooseAttackPrompt', 'SelectOptionPrompt', 'SelectPrompt',
      'FogCrystalRootAndOwnerDeckSearch', 'ActorOnlyRoot'
    ],
    componentVersions: {
      root: rootAudit.version ?? null,
      fog: fogAudit.version ?? null,
      select: selectAudit.version ?? null,
      selectOption: optionAudit.version ?? null,
      chooseAttack: attackAudit.version ?? null
    },
    nativeDecisionCounts: {
      actorRootsSelected: rootAudit.selectedRootDecisions ?? null,
      actorRootsAccepted: rootAudit.acceptedActorRoots ?? null,
      actorRootsRejected: rootAudit.rejectedActorRoots ?? null,
      actorRootPublicTransitionChanges:
        rootAudit.publicTransitionChanges ?? null,
      actorRootsPhysicallyConfirmed:
        rootAudit.nativePhysicalConfirmed ?? null,
      fogRootAccepted: fogAudit.fogItemRootNativeAccepted ?? null,
      fogOwnerPromptAccepted: fogAudit.fogPromptNativeAccepted ?? null,
      selectAccepted: selectAudit.accepted ?? null,
      selectOptionAccepted: optionAudit.acceptedPromptActions ?? null,
      chooseAttackAccepted: attackAudit.accepted ?? null,
      lastChanceGenericPromptFallbacks: finalGenericPromptFallbacks
    },
    // Every upstream interceptor also counts events it delegates downstream.
    // These counters overlap and cannot be added into a decision denominator.
    overlappingDelegationObservations: {
      chooseAttack: attackAudit.nativeFallbacks ?? null,
      selectOption: optionAudit.unsupportedPromptDelegations ?? null,
      select: selectAudit.unsupportedPromptFallbacks ?? null,
      fog: fogAudit.unsupportedPrompts ?? null,
      lastChanceRoot: finalGenericPromptFallbacks,
      warning: 'Nested delegation counters overlap. The root is the final fallback.'
    },
    detailedComponentAudits: {
      root: rootAudit,
      fog: fogAudit,
      select: selectAudit,
      selectOption: optionAudit,
      chooseAttack: attackAudit
    },
    qualification: {
      fullyActorOnly: false,
      sourcePolicyCompetenceEstablished: false,
      candidatePolicyCompetenceEstablished: false,
      paperClockQualified: false,
      competitiveGames: 0,
      caveat: 'Accepted roots and prompts are development witnesses. Remaining generic fallback, source-specific intervention, limited root decision space and unmodeled clock prohibit competitive inference.'
    }
  };
  return {result: attacked.result, audit};
}

module.exports = {VERSION, withCanonicalActorOnlyPolicy};
