'use strict';

const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy,VERSION:BASE_VERSION}=
  require('./agent34-actor-only-root-policy.cjs');
const {withActorOnlyLillieAfterPass,VERSION:ADDON_VERSION}=
  require('./agent12-actor-only-lillie-after-pass.cjs');
const {runDevelopment}=
  require('../evaluation/agent41-bilateral-v2-development.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('./agent24-native-lillie-settlement-audit.cjs');

/**
 * Same four historical rank6/rank11 frozen physical arms as Agent34's pure
 * actor-root baseline. Candidate and source inventories stay unchanged.
 * The additive same-seat policy substitutes Lillie only AFTER a base Pass.
 * Every remaining native prompt decision is unqualified.
 */
function main(){
  let addonAudit=null;
  const settle=withNativeLillieDrawSettlementAudit(()=>
    withActorOnlyRootPolicy(()=>{
      const added=withActorOnlyLillieAfterPass(()=>runDevelopment({
        paperSupporterQuota:true,mandatoryOptionFallback:true
      }));
      addonAudit=added.audit;
      return added.result;
    }));
  const wrapped=settle.result;
  const dev=wrapped.result;
  const baseAudit=wrapped.audit;
  assert.equal(dev.rows.length,4,'Retain all historical source-dealt arms');
  const report={
    schema:'agent12-common-actor-lillie-fourarm-development-v1',
    enginePin:dev.enginePin,researchSha:process.env.GITHUB_SHA??null,
    baselineVersion:BASE_VERSION,addonVersion:ADDON_VERSION,
    frozenReferenceAndCandidateSixties:true,
    actorRootBase:{
      selectedRootDecisions:baseAudit.selectedRootDecisions,
      acceptedActorRoots:baseAudit.acceptedActorRoots,
      rejectedActorRoots:baseAudit.rejectedActorRoots,
      typedIntentCounts:baseAudit.typedIntentCounts,
      unsupportedPromptFallbacks:baseAudit.unsupportedPromptFallbacks,
      unsupportedPromptTypes:baseAudit.unsupportedPromptTypes
    },
    addon:addonAudit,
    nativeLillieDrawSettlement:settle.audit,
    nativeTreatmentOpportunity:addonAudit.attemptedLillieRoots>0?
      'at-least-one-eligible-owned-lillie':
      'no-eligible-held-lillie-on-four-historical-arms',
    rows:dev.rows.map(row=>({
      trialId:row.trial?.id??null,
      engineStatus:row.status??null,
      actionCount:row.actionCount??null,
      actualStarterSeat:row.actualStarterSeat??null,
      nativeSupporterQuotaQualified:row.nativeSupporterQuotaQualified??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      rootActionLedgerSha256:row.rootActionLedgerSha256??null,
      settledPublicAttackCount:row.settledPublicAttackCount??null,
      attackDeclarations:row.attackDeclarations??null,
      candidateFollowupStatus:row.candidateFollowupStatus??null,
      error:row.error??null
    })),
    competitiveQualifiedGames:0,
    limits:'Historical and seed-selected four arms, no actor-only native prompt policy, many unsupported Trainers/Abilities, source competency unqualified, game clock and full-rule parity unqualified.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.ok(baseAudit.acceptedActorRoots>0,
    'Require actual original Store acceptance of supported actor-only roots');
  assert.equal(baseAudit.rejectedActorRoots,0);
  assert.equal(addonAudit.passRootObservations,
    Object.values(addonAudit.passRootReasonCounts)
      .reduce((sum,count)=>sum+count,0),
    'Every actor Pass opportunity must be classified exactly once');
  assert.equal(addonAudit.attemptedLillieRoots,
    addonAudit.passRootReasonCounts.eligible??0,
    'Only an eligible actor-owned Lillie may become a typed native proposal');
  assert.equal(addonAudit.acceptedLillieRoots+addonAudit.rejectedLillieRoots,
    addonAudit.attemptedLillieRoots,
    'Every proposed native Lillie must produce a Store result');
  assert.equal(addonAudit.rejectedLillieRoots,0,
    'Invalid scripted Lillie proposals must fail closed');
  assert.equal(settle.audit.supportRoots,addonAudit.acceptedLillieRoots,
    'Accepted Lillie must appear on a physical native Store root');
  assert.equal(settle.audit.printedDrawConfirmed,settle.audit.supportRoots,
    'Every native Lillie must settle its full printed shuffle-draw prompts');
  assert.equal(report.competitiveQualifiedGames,0);
  return report;
}
if(require.main===module)main();
module.exports={main};
