'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {withActualStoreActorObservation}=
  require('../twinleaf/actor-observation-live-audit.cjs');

/**
 * Two complete executions of the exact canonical historical four-arm pilot,
 * control followed by actor-view observation. Every Store decision, source
 * physical deal, accepted card effect and terminal/cap must stay unchanged.
 * This is a compiled-native input API smoke, NEVER a competitive experiment.
 * @returns {object}
 */
function runCompiledActorObservation(){
  initializeCards();
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const original=runDevelopment();
  const observed=withActualStoreActorObservation(Store,()=>runDevelopment());
  assert.deepEqual(observed.result,original,
    'Read-only actor projection changed canonical source-dealt Store games');
  assert.equal(original.rows.length,4);
  assert.ok(original.rows.every(row=>row.status!=='engine-error'),
    'Original canonical developmental fixture had an engine error');
  assert.equal(observed.audit.games,4);
  assert.ok(observed.audit.observedActorDecisions>0);
  assert.ok(observed.audit.ownerPrompts>0);
  return {
    schema:'agent21-native-actor-view-observation-v1',
    evidence:'retrospective 4-arm physical source-deal Store noninterference',
    originalCandidates:original.rows.map(row=>row.trial?.id),
    unchangedPhysicalDeals:original.sourcePairs.every(pair=>
      pair.sameSourcePhysicalDeal===true),
    sameCompleteCanonicalRows:true,
    actorProjectionAudit:observed.audit,
    enginePin:original.enginePin,
    competitiveQualifiedGames:0,
    policyInformationSetQualified:false,
    remark:'This constrains one new prospective safe view. The original '+
      'SimpleTacticsAi remains an unsafe full-State user.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(runCompiledActorObservation(),null,2)+'\n');
module.exports={runCompiledActorObservation};
