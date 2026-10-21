'use strict';
const {withNativeEvolutionOpportunityAudit}=
  require('../twinleaf/agent1-native-evolution-opportunity-audit.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');

/**
 * Repeat only the frozen historical source-deal four-arm diagnostic.
 * A passive Store wrapper enumerates native accepted Pass roots where a
 * public-board/owner-hand natural evolution was still apparently eligible.
 * Same roster, registered seeds and unchanged candidate 60s.
 *
 * @returns {object} Machine-readable development-only evidence.
 */
function runMissedEvolutionCensus(){
  const observed=withNativeEvolutionOpportunityAudit(()=>
    runDevelopment({
      mandatoryOptionFallback:true,
      nativePressureWindows:true,
      paperSupporterQuota:true,
      actorOnlyComposition:true,
      actorGenericFallbackAttribution:true
    }));
  const {result,audit}=observed;
  return {
    schema:'agent1-native-pinned-actor-missed-evolution-pass-census-v1',
    enginePin:result.enginePin,
    actorNaturalEvolutionRootOptIn:
      process.env.AGENT1_NATURAL_EVOLUTION_ROOT_DEV==='true',
    actorOnlyComposition:result.actorOnlyCompositionOptIn,
    attempted:result.attempted,competitiveQualifiedGames:0,
    auditedPasses:audit,
    rows:result.rows.map(row=>({
      trial:row.trial?.id??null,
      status:row.status??null,
      nativeClockError:row.nativeEpochBoundaryEvidence??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      actualStarterSeat:row.actualStarterSeat??null,
      sourceActuallyFirst:row.sourceActuallyFirst??null,
      finished:row.finished??null,
      winner:row.winner??null,
      acceptedActorRoots:row.actorOnlyDecisionCoverage?.
        nativeDecisionCounts.actorRootsAccepted??null,
      typedRootIntents:row.actorOnlyDecisionCoverage?.
        detailedComponentAudits.root.typedIntentCounts??null,
      rootVersion:row.actorOnlyDecisionCoverage?.
        detailedComponentAudits.root.version??null,
      recordedSourceReply:row.candidateFollowupStatus??null,
      qualifiesForCompetitiveInference:false
    }))
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(runMissedEvolutionCensus(),null,2)+'\n');
}
module.exports={runMissedEvolutionCensus};
