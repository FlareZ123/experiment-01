'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {plannedTrials,REGISTRATION_BLOB}=
  require('../simulation/evaluation/agent41-prospective-canonical-scout.cjs');
const {auditRegisteredSourceDeals}=
  require('../simulation/evaluation/agent8-prospective-source-deal-audit.cjs');
const {auditSourceOpeningRecipients}=
  require('../simulation/evaluation/agent8-source-firstturn-physical-recipients.cjs');
const {originalSourcePlayCoverage}=
  require('../simulation/evaluation/agent8-original-source-control-play-coverage.cjs');

const root=path.resolve(__dirname,'..');
const registrationPath=path.join(root,
  'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');

/**
 * Verify the precommitted plan, then audit a complete existing prospective
 * archive without executing a fresh native match or changing prior outcomes.
 * @param {object} archive One original 32-arm JSON scout packet.
 * @returns {object} Independently checked pair provenance.
 */
function auditOriginalScout(archive){
  const bytes=fs.readFileSync(registrationPath);
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB);
  const plan=JSON.parse(bytes.toString('utf8'));
  assert.equal(archive.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
  assert.equal(archive.registrationBlob,blob);
  assert.equal(archive.developmentResult?.enginePin,plan.enginePin);
  const trials=plannedTrials(plan);
  const sourceDealAudit=auditRegisteredSourceDeals(
    trials,archive.developmentResult);
  const sourceFirstTurnAudit=auditSourceOpeningRecipients(
    trials,archive.developmentResult);
  const sourcePlayCoverage=originalSourcePlayCoverage(
    archive.developmentResult.rows);
  return {registrationBlob:blob,enginePin:plan.enginePin,
    sourceDealAudit,sourceFirstTurnAudit,sourcePlayCoverage,
    competitiveQualifiedGames:0,
    provenance:'Read-only registered source-deal alignment; not an additional native experiment'};
}

if(require.main===module){
  const filename=process.argv[2];
  assert.ok(filename,'Supply an existing 32-arm native JSON scout archive');
  const archive=JSON.parse(fs.readFileSync(filename,'utf8'));
  process.stdout.write(JSON.stringify(auditOriginalScout(archive),null,2)+'\n');
}

module.exports={auditOriginalScout};
