'use strict';

const assert = require('node:assert/strict');
const {withActorOnlyRootPolicy, VERSION: ROOT_VERSION} =
  require('./agent34-actor-only-root-policy.cjs');
const {withActorFogCrystalPrompt, VERSION: FOG_VERSION} =
  require('./agent9-fog-actor-prompt.cjs');
const {runDevelopment} =
  require('../evaluation/agent41-bilateral-v2-development.cjs');

/**
 * Preserve source-first native Store outcomes for the same two fixed physical
 * candidate 60s under one identical, actor-observation-limited root policy.
 * Genuine owner-deck Fog Crystal prompts run through Agent 9's extension.
 * All other prompts and unsupported roots remain openly unqualified.
 *
 * Both source-first seeds were chosen retrospectively; this is an honest
 * development stress check and produces no competition outcome evidence.
 * @returns {object}
 */
function main() {
  const installed = withActorOnlyRootPolicy(
    () => withActorFogCrystalPrompt(
      () => runDevelopment({
        sourceFirstRetrospective: true,
        paperSupporterQuota: true,
        mandatoryOptionFallback: true,
        nativePressureWindows: true
      })
    )
  );
  const nativeRoots = installed.audit;
  const fog = installed.result.audit;
  const dev = installed.result.result;
  const rows = dev.rows.map(row => {
    const rank = row.trial?.rank;
    const sourceLine = rank === 6 ? {
      sourceTurn2Completed: row.sourceAudit?.turn2?.completed === true,
      sourceTurn3Completed: row.sourceAudit?.turn3?.completed === true,
    } : {
      sourceToolLineCompleted: row.sourceAudit?.completed === true,
      sourceOpportunityTurn: row.sourceAudit?.opportunityTurn ?? null
    };
    return {
      trial: row.trial?.id ?? null,
      candidateId: row.trial?.candidateId ?? null,
      rank,
      status: row.status ?? null,
      actualSourceFirst: row.sourceActuallyFirst ?? null,
      nativeVerifiedFirstTurn: row.verifiedFirstTurn ?? false,
      nativeSupporterQuotaQualified: row.nativeSupporterQuotaQualified ?? null,
      sourceDealFingerprint: row.sourceDealFingerprint ?? null,
      nativeActionCount: row.actionCount ?? null,
      candidateReplyStatus: row.candidateFollowupStatus ?? null,
      acceptedPrintedAttacks: row.attackDeclarations ?? null,
      sourceLine,
      error: row.error ?? null,
    };
  });

  const report = {
    schema: 'agent17-actor-root-fog-sourcefirst-development-v1',
    fixedSourceRegistration: dev.sourceRegistration,
    enginePin: dev.enginePin,
    rootPolicy: ROOT_VERSION,
    ownerDeckPrompt: FOG_VERSION,
    originalNativeStore: true,
    bothPhysicalActorsUseSameActorOnlyRootPolicy: true,
    retrospectiveSourceFirst: true,
    nativeRootAudit: {
      selected: nativeRoots.selectedRootDecisions,
      accepted: nativeRoots.acceptedActorRoots,
      rejected: nativeRoots.rejectedActorRoots,
      intents: nativeRoots.typedIntentCounts,
      unsupportedPrompts: nativeRoots.unsupportedPromptFallbacks,
      nonOwnerNativeDelegations: nativeRoots.nonOwnerNativeDelegations,
      boundedFirstNativeAcceptances: nativeRoots.nativeRootAcceptances.slice(0, 20),
      boundedFirstIntentRows: nativeRoots.ownerRootIntents.slice(0, 20),
    },
    fogAudit: {
      played: fog.fogItemRootNativeAccepted,
      ownerDeckPromptAccepted: fog.fogPromptNativeAccepted,
      nativeRejected: fog.rejectedNativeChoices,
      unsupportedPrompts: fog.unsupportedPrompts,
      physicallySelectedCardPlayed: fog.postSearchPhysicalCardPlays,
      boundedEvents: fog.events.slice(0, 20)
    },
    pairedSourceDeals: dev.sourcePairs,
    rows,
    errorCount: dev.errors,
    competitiveQualifiedGames: 0,
    caveat: 'Retrospective source-first seeds; actor root and Fog search are partial, ' +
      'all remaining native prompt fallbacks and weak source policies are unqualified. ' +
      'No official clock or full paper-rules verification.'
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  assert.equal(rows.length, 4, 'Every fixed source-first development arm must be retained');
  assert.ok(nativeRoots.selectedRootDecisions > 0, 'Require actual actor-visible owner decisions');
  assert.ok(nativeRoots.acceptedActorRoots > 0, 'Require real Store acceptance');
  assert.equal(nativeRoots.rejectedActorRoots, 0, 'No invalid actor-root dispatch');
  assert.equal(fog.rejectedNativeChoices, 0, 'No invalid authentic search action');
  assert.equal(report.competitiveQualifiedGames, 0);
  return report;
}

if (require.main === module) main();
module.exports = {main};
