'use strict';
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy,VERSION:ROOT_VERSION}=
  require('./agent34-actor-only-root-policy.cjs');
const {withActorFogCrystalPrompt,VERSION:FOG_VERSION}=
  require('./agent9-fog-actor-prompt.cjs');
const {runDevelopment}=
  require('../evaluation/agent41-bilateral-v2-development.cjs');

/**
 * Reuse the exact canonical historical four-arm engine and source policy.
 * Insert one additional actor-only Item to owner-deck prompt decision pair.
 * This remains a developmental root/prompt execution test.
 */
function main(){
  const combined=withActorOnlyRootPolicy(()=>withActorFogCrystalPrompt(
    ()=>runDevelopment({
      paperSupporterQuota:true,mandatoryOptionFallback:true
    })));
  const fog=combined.result.audit;
  const root=combined.audit;
  const dev=combined.result.result;
  const rows=dev.rows.map(row=>({
    trialId:row.trial?.id??null,status:row.status??null,
    actualStarterSeat:row.actualStarterSeat??null,
    actionCount:row.actionCount??null,
    firstActualSourceDeal:row.sourceDealFingerprint??null,
    nativeSupporterQuotaQualified:
      row.nativeSupporterQuotaQualified??null,
    settledPublicAttackCount:row.settledPublicAttackCount??null,
    sourceFollowupStatus:row.candidateFollowupStatus??null,
    error:row.error??null
  }));
  const record={
    schema:'agent9-fog-actor-canonical-fourarm-dev-v1',
    sourceRegistration:dev.sourceRegistration??null,
    enginePin:dev.enginePin??null,
    researchRevision:process.env.GITHUB_SHA??null,
    sharedActorRootVersion:ROOT_VERSION,
    newOwnerPromptVersion:FOG_VERSION,
    fogAudit:fog,rootAudit:{
      selectedRootDecisions:root.selectedRootDecisions,
      acceptedActorRoots:root.acceptedActorRoots,
      rejectedActorRoots:root.rejectedActorRoots,
      delegatedGenericPromptCount:root.unsupportedPromptFallbacks,
      nativeRootAcceptances:root.nativeRootAcceptances
    },rows,
    qualifiedCompetitiveGames:0,
    qualification:'development: at least generic prompts remain delegated and playing competence is unverified'
  };
  process.stdout.write(JSON.stringify(record,null,2)+'\n');
  assert.equal(rows.length,4,'Must retain every frozen canonical arm');
  assert.equal(root.rejectedActorRoots,0);
  assert.equal(fog.rejectedNativeChoices,0);
  assert.ok(fog.fogItemRootNativeAccepted<=fog.fogItemRootProposals);
  assert.ok(fog.fogPromptNativeAccepted<=fog.fogPromptProposals);
  return record;
}
if(require.main===module)main();
module.exports={main};
