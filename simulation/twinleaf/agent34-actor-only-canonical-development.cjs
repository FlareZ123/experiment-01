'use strict';
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy,VERSION}=
  require('./agent34-actor-only-root-policy.cjs');
const {runDevelopment}=
  require('../evaluation/agent41-bilateral-v2-development.cjs');

/**
 * Run the existing canonical historical rank6/rank11 champion/New Moon
 * four-arm registration, with both native seats handled by the exact same
 * actor-only root policy. Native prompt fallback is explicitly unqualified.
 */
function main(){
  const observed=withActorOnlyRootPolicy(()=>runDevelopment({
    paperSupporterQuota:true,mandatoryOptionFallback:true
  }));
  const dev=observed.result,audit=observed.audit;
  const rows=dev.rows.map(row=>({
    trialId:row.trial?.id??null,
    status:row.status??null,
    actualStarterSeat:row.actualStarterSeat??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    nativeSupporterQuotaQualified:row.nativeSupporterQuotaQualified??null,
    settledPublicAttackCount:row.settledPublicAttackCount??null,
    actionCount:row.actionCount??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    candidateFollowupStatus:row.candidateFollowupStatus??null,
    attackDeclarations:row.attackDeclarations??null,
    error:row.error??null
  }));
  const report={
    schema:'agent34-actor-only-native-root-canonical-development-v1',
    enginePin:dev.enginePin,researchSha:process.env.GITHUB_SHA??null,
    policyVersion:VERSION,
    canonicalSourceRegistration:dev.sourceRegistration,
    exactSameFrozenCandidateAndSource60:true,
    audit,rows,
    ownerRootAcceptedNative:audit.acceptedActorRoots>0,
    promptDecisionPrivacyQualified:audit.unsupportedPromptFallbacks===0,
    competitiveQualifiedGames:0,
    limitation:'Basic bench, basic Energy, payable printed attacks and Pass are actor-only roots. Native prompt fallback, missing ability/evolution/search policy, source decision competence and paper clock remain unqualified.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(rows.length,4,'Retain all historical canonical arms');
  assert.ok(audit.selectedRootDecisions>0,'Require actual actor-only root decisions');
  assert.ok(audit.acceptedActorRoots>0,'Require genuine Store-accepted typed actor-only action');
  assert.equal(audit.rejectedActorRoots,0,'An invalid actor-only native root must fail closed');
  assert.equal(report.competitiveQualifiedGames,0);
  return report;
}
if(require.main===module)main();
module.exports={main};
