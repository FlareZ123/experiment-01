'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent7-canonical-actor-five-component-v2';
const OWNER_SEARCH_VERSION = 'agent41-canonical-actor-six-component-v3-owner-single-search';

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
 * @param {{root?:Function,fog?:Function,select?:Function,option?:Function,attack?:Function,ownerSearch?:Function}} [adapters]
 *   Test injection only. Real components have their own pinned-Store tests.
 * @param {{ownerSingleSearch?:boolean}} [options] Default preserves v2.
 * @returns {{result:T,audit:object}}
 */
function withCanonicalActorOnlyPolicy(execute, adapters = {}, options = {}) {
  assert.equal(typeof execute, 'function');
  const ownerSingleSearch = options.ownerSingleSearch===true;
  const ownerSearch = ownerSingleSearch?(adapters.ownerSearch??
    require('../twinleaf/agent41-actor-owner-single-search.cjs')
      .withActorOwnerSingleSearch):null;
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
  for (const component of [root, fog, select, option, attack,
    ...(ownerSingleSearch?[ownerSearch]:[])]) {
    assert.equal(typeof component, 'function');
  }

  const runFog = () => fog(() => select(() => option(() => attack(execute))));
  // Fog's already-owned deck search is the higher-priority actor handler.
  const rooted = root(() => ownerSingleSearch?ownerSearch(runFog):runFog());
  const searchOrFog = rooted.result;
  const fogged = ownerSingleSearch?searchOrFog.result:searchOrFog;
  const ownerSearchAudit = ownerSingleSearch?searchOrFog.audit:null;
  const selected = fogged.result;
  const optioned = selected.result;
  const attacked = optioned.result;
  const rootAudit = rooted.audit;
  const fogAudit = fogged.audit;
  const selectAudit = selected.audit;
  const optionAudit = optioned.audit;
  const attackAudit = attacked.audit;
  for (const audit of [rootAudit, fogAudit, selectAudit, optionAudit,
    attackAudit,...(ownerSingleSearch?[ownerSearchAudit]:[])]) {
    assert.ok(audit && typeof audit === 'object',
      'Each actor-only adapter must return its own audit');
  }

  const finalGenericPromptFallbacks =
    rootAudit.unsupportedPromptFallbacks ?? null;
  const audit = {
    version: ownerSingleSearch?OWNER_SEARCH_VERSION:VERSION,
    selectedHandlerPriority: [
      'ChooseAttackPrompt', 'SelectOptionPrompt', 'SelectPrompt',
      'FogCrystalRootAndOwnerDeckSearch',
      ...(ownerSingleSearch?['ActorOwnerSingleSearchPrompt']:[]),
      'ActorOnlyRoot'
    ],
    componentVersions: {
      root: rootAudit.version ?? null,
      fog: fogAudit.version ?? null,
      ...(ownerSingleSearch?{ownerSearch:ownerSearchAudit.version??null}:{}),
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
      ...(ownerSingleSearch?{
        ownerSearchAccepted:ownerSearchAudit.accepted??null,
        ownerSearchSettled:ownerSearchAudit.nativePromptPostconditionsConfirmed??null,
        ownerSearchUnverified:ownerSearchAudit.nativePromptPostconditionsUnverified??null
      }:{}),
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
      ...(ownerSingleSearch?{ownerSearch:ownerSearchAudit.nativeFallbacks??null}:{}),
      lastChanceRoot: finalGenericPromptFallbacks,
      warning: 'Nested delegation counters overlap. The root is the final fallback.'
    },
    detailedComponentAudits: {
      root: rootAudit,
      fog: fogAudit,
      ...(ownerSingleSearch?{ownerSearch:ownerSearchAudit}:{}),
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

module.exports = {VERSION, OWNER_SEARCH_VERSION, withCanonicalActorOnlyPolicy};
