'use strict';

const assert = require('node:assert/strict');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {withSourceOwnerK1SearchObserver,VERSION} =
  require('../twinleaf/agent7-rank6-source-k1-search-observer.cjs');

/**
 * Replay only the already-selected canonical four historical source-first arms.
 * The outer read-only hook captures the FIRST native rank-6 source owner
 * searched-deck prompt after its G&H script delegates on failure.
 * No fresh seeds, altered printed lists, or policy choices are introduced.
 *
 * @returns {object} Diagnostic evidence, never competitive performance.
 */
function main() {
  const observed=withSourceOwnerK1SearchObserver(
    ()=>runDevelopment({
      actorOnlyComposition:true,
      sourceFirstRetrospective:true,
      paperSupporterQuota:true,
      mandatoryOptionFallback:true,
      nativePressureWindows:true
    }),
    {sourceSeat:0,sourceTurn:3}
  );
  const dev=observed.result, k1=observed.audit;
  assert.equal(dev.rows.length,4);
  assert.equal(dev.attempted,4);
  assert.equal(dev.sourceFirstRetrospective,true);
  assert.equal(dev.competitiveQualifiedGames,0);
  assert.equal(dev.actorOnlyCellsWithAudits,4);
  assert.equal(dev.sourcePairs[0].sameSourcePhysicalDeal,true);
  const rows=dev.rows.map(row=>({
    id:row.trial.id,rank:row.trial.rank,sourceFirst:row.sourceActuallyFirst,
    sourceDeal:row.sourceDealFingerprint,
    sourceLine:row.sourceAudit,sourceReply:row.candidateFollowupStatus,
    nativeActorAcceptances:
      row.actorOnlyDecisionCoverage.nativeDecisionCounts.actorRootsAccepted,
    error:row.error??null
  }));
  const out={
    schema:'agent7-rank6-retrospective-source-owner-k1-v1',
    observerVersion:VERSION,enginePin:dev.enginePin,
    researchSha:process.env.GITHUB_SHA??null,
    sourceRegistration:dev.sourceRegistration,
    changedPolicyChoices:false,
    unchangedOriginalDeckAndSeed:true,
    observation:k1,
    rows,competitiveQualifiedGames:0,
    caveat:'Authentic acting-source own-deck prompt only, source-first seed selected retrospectively. No Prize identity read or altered action. A G&H search abort remains an invalid source-pressure exposure regardless of cause.'
  };
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  assert.ok(k1.authenticPromptsSeen>0,'No genuine source-own-deck prompt observed');
  assert.ok(k1.ownerSearches.some(x=>
    x.resolvingSupporters.includes('Guzma & Hala')),
    'No authentic G&H owner-deck search was inspected');
  return out;
}

if(require.main===module) main();
module.exports={main};
