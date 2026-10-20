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
  const flags={
    actorOnlyComposition:true,
    sourceFirstRetrospective:true,
    paperSupporterQuota:true,
    mandatoryOptionFallback:true,
    nativePressureWindows:true
  };
  // Control must run without any observer before the source K1 inspection.
  // Both loops receive identical fixed seeds, decklists and policy hooks.
  const control=runDevelopment(flags);
  const observed=withSourceOwnerK1SearchObserver(
    ()=>runDevelopment(flags),
    {sourceSeat:0,sourceTurn:3}
  );
  const dev=observed.result, k1=observed.audit;
  assert.equal(dev.rows.length,4);
  assert.equal(dev.attempted,4);
  assert.equal(dev.sourceFirstRetrospective,true);
  assert.equal(dev.competitiveQualifiedGames,0);
  assert.equal(dev.actorOnlyCellsWithAudits,4);
  assert.equal(dev.sourcePairs[0].sameSourcePhysicalDeal,true);
  assert.equal(control.rows.length,dev.rows.length);
  const rows=dev.rows.map((row,index)=>{
    const baseline=control.rows[index];
    assert.equal(row.trial.id,baseline.trial.id);
    const rootParity=row.rootActionLedgerSha256===
      baseline.rootActionLedgerSha256;
    const sourceDealParity=row.sourceDealFingerprint===
      baseline.sourceDealFingerprint;
    const starterParity=row.actualStarterSeat===baseline.actualStarterSeat;
    const attackParity=JSON.stringify(row.attackDeclarations)===
      JSON.stringify(baseline.attackDeclarations);
    assert.equal(sourceDealParity,true,'K1 observer changed physical source deal');
    assert.equal(starterParity,true,'K1 observer changed true starting seat');
    assert.equal(rootParity,true,'K1 observer changed native root action ledger');
    assert.equal(attackParity,true,'K1 observer changed attack declarations');
    return {
      id:row.trial.id,rank:row.trial.rank,
      sourceFirst:row.sourceActuallyFirst,
      sourceDeal:row.sourceDealFingerprint,
      rootActionLedgerSha256:row.rootActionLedgerSha256,
      controlRootActionLedgerSha256:baseline.rootActionLedgerSha256,
      rootParity,sourceDealParity,starterParity,attackParity,
      sourceLine:row.sourceAudit,sourceReply:row.candidateFollowupStatus,
      nativeActorAcceptances:
        row.actorOnlyDecisionCoverage.nativeDecisionCounts.actorRootsAccepted,
      error:row.error??null
    };
  });
  const out={
    schema:'agent7-rank6-retrospective-source-owner-k1-v1',
    observerVersion:VERSION,enginePin:dev.enginePin,
    researchSha:process.env.GITHUB_SHA??null,
    sourceRegistration:dev.sourceRegistration,
    changedPolicyChoices:false,
    unchangedOriginalDeckAndSeed:true,
    nativeRootLedgerParityAllArms:rows.every(row=>row.rootParity),
    publicAttackDeclarationParityAllArms:rows.every(row=>row.attackParity),
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
