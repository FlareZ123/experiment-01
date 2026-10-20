'use strict';

const assert=require('node:assert/strict');
const {withActorOnlySelectOption,VERSION}=
  require('./agent13-actor-only-select-option.cjs');
const {runDevelopment}=
  require('../evaluation/agent41-bilateral-v2-development.cjs');

/**
 * Development-only native Store smoke using the existing canonical historical
 * four-arm registration. It reports accepted owner-visible option responses,
 * keeps every failed/censored arm, and never promotes untimed bot outcomes to
 * competitive strength. This diagnostic does not replace the common root bot.
 *
 * @returns {object} Restricted audit report.
 */
function main(){
  const observed=withActorOnlySelectOption(()=>runDevelopment({
    mandatoryOptionFallback:true,
    paperSupporterQuota:true,
    sourceFirstRetrospective:true
  }));
  const dev=observed.result;
  const rows=dev.rows.map(row=>({
    id:row.trial?.id??null,rank:row.trial?.rank??null,
    status:row.status??(row.finished?'engine-finished':'bounded-game'),
    error:row.error??null,sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    nativeSupporterQuotaQualified:row.nativeSupporterQuotaQualified??null,
    sourceLineReplyStatus:row.sourceLinePacket?.status??null,
    candidateFollowupStatus:row.candidateFollowupStatus??null,
    sourceAttackDeclarations:row.attackDeclarations?.source??null,
    candidateAttackDeclarations:row.attackDeclarations?.candidate??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    actionCount:row.actionCount??null
  }));
  const report={
    schema:'agent13-actor-option-real-store-development-v1',
    researchSha:process.env.GITHUB_SHA??null,enginePin:dev.enginePin,
    policyVersion:VERSION,
    registration:dev.sourceRegistration,
    candidateAndSourceListsUnchanged:true,attempted:dev.attempted,
    selectedNativeOptions:observed.audit.selectedPrompts,
    acceptedNativeOptions:observed.audit.acceptedPromptActions,
    actorOptionAudit:observed.audit,rows,
    competitiveQualifiedGames:0,
    limits:'Generic fallback remains for all unsupported prompts and root choices. Four retrospectively selected bounded games, not performance samples.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(dev.attempted,4,'retain all four canonical historical arms');
  assert.equal(report.rows.length,4);
  assert.equal(observed.audit.rejectedPromptActions,0);
  assert.equal(report.competitiveQualifiedGames,0);
  return report;
}

if(require.main===module)main();
module.exports={main};
