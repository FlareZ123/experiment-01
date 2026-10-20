'use strict';
const assert=require('node:assert/strict');
const {withActorOnlySelectOption,VERSION:OPTION_VERSION}=
  require('./agent13-actor-only-select-option.cjs');
const {withActorOnlyChooseAttack,VERSION:ATTACK_VERSION}=
  require('./agent13-actor-only-choose-attack.cjs');
const {runDevelopment}=
  require('../evaluation/agent41-bilateral-v2-development.cjs');
/**
 * Same four historical source-dealt, immutable decks/physical seeds with
 * two actor-only prompt adapters. Genuine Store remains final authority.
 * No root policy replacement, opponent competence, clock or game qualification.
 */
function main(){
  const option=withActorOnlySelectOption(()=>
    withActorOnlyChooseAttack(()=>runDevelopment({
      mandatoryOptionFallback:true,paperSupporterQuota:true,
      sourceFirstRetrospective:true
    })));
  const attack=option.result,dev=attack.result;
  const rows=dev.rows.map(row=>({
    trialId:row.trial?.id??null,
    status:row.status??(row.finished?'engine-finished':'bounded-game'),
    error:row.error??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    candidateFollowupStatus:row.candidateFollowupStatus??null,
    sourceAttackDeclarations:row.attackDeclarations?.source??null,
    candidateAttackDeclarations:row.attackDeclarations?.candidate??null,
    actionCount:row.actionCount??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null
  }));
  const output={
    schema:'agent13-actor-both-prompt-native-store-dev-v1',
    pinnedEngine:dev.enginePin,researchSha:process.env.GITHUB_SHA??null,
    optionVersion:OPTION_VERSION,attackVersion:ATTACK_VERSION,
    originalSourceRegistration:dev.sourceRegistration,
    deckAndSeedIdentityUnchanged:true,
    attempted:dev.attempted,rows,
    optionAudit:option.audit,chooseAttackAudit:attack.audit,
    competitiveGamesQualified:0,
    scope:'Historical four-arm native development only; prompt fallback, hidden-State generic root, untimed engine, source competence and card/rule parity unqualified'
  };
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  assert.equal(rows.length,4);
  assert.equal(option.audit.rejectedPromptActions,0);
  assert.equal(attack.audit.rejected,0);
  assert.equal(output.competitiveGamesQualified,0);
  return output;
}
if(require.main===module)main();
module.exports={main};
