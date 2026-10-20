'use strict';
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=require(
  './agent34-actor-only-root-policy.cjs');
const {withActorFogCrystalPrompt}=require(
  './agent9-fog-actor-prompt.cjs');
const {withActorMysteriousTreasure}=require(
  './agent9-mysterious-actor-chain.cjs');
const {runDevelopment}=require(
  '../evaluation/agent41-bilateral-v2-development.cjs');

/**
 * The same original four canonical Aichi trials, adding one payable
 * K0 discard -> hand prompt -> owner K1 deck search chain.
 * Every result and nonexposure is retained, including errors and fallback.
 */
function main(){
  const all=withActorOnlyRootPolicy(()=>withActorMysteriousTreasure(
    ()=>withActorFogCrystalPrompt(()=>runDevelopment({
      paperSupporterQuota:true,mandatoryOptionFallback:true
    }))));
  const root=all.audit,treasure=all.result.audit;
  const fog=all.result.result.audit;
  const development=all.result.result.result;
  const rows=development.rows.map(x=>({
    id:x.trial?.id??null,status:x.status??null,
    actions:x.actionCount??null,
    sourceDeal:x.sourceDealFingerprint??null,
    nativePaperSupporterQualified:x.nativeSupporterQuotaQualified??null,
    attacks:x.settledPublicAttackCount??null,
    error:x.error??null
  }));
  const report={
    schema:'agent9-actor-owned-paid-search-canonical-development-v1',
    enginePin:development.enginePin,
    sourceRegistration:development.sourceRegistration,
    revision:process.env.GITHUB_SHA??null,
    root:{accepted:root.acceptedActorRoots,
      rejected:root.rejectedActorRoots,
      unsupportedPrompts:root.unsupportedPromptFallbacks},
    treasure, fog:{
      item: fog.fogItemRootNativeAccepted,
      search: fog.fogPromptNativeAccepted,
      searchedPhysicalCardUsed: fog.postSearchPhysicalCardPlays,
      rejected:fog.rejectedNativeChoices,
      selectedPhysicalEvents:fog.postSearchPhysicalEvents
    },rows,competitiveQualifiedGames:0,
    note:'One Item discard/search connection tested; generic prompt fallbacks, source policy and entire match competence remain unqualified.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(rows.length,4);
  assert.equal(treasure.nativeRejected,0);
  assert.equal(root.rejectedActorRoots,0);
  assert.equal(report.competitiveQualifiedGames,0);
  return report;
}
if(require.main===module)main();
module.exports={main};
