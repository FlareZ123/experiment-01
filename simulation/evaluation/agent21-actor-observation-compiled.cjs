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
  const observed=withActualStoreActorObservation(Store,()=>runDevelopment(),
    {captureFirstOwnerK1:true});
  assert.deepEqual(observed.result,original,
    'Read-only actor projection changed canonical source-dealt Store games');
  assert.equal(original.rows.length,4);
  assert.ok(original.rows.every(row=>row.status!=='engine-error'),
    'Original canonical developmental fixture had an engine error');
  assert.equal(observed.audit.games,4);
  assert.ok(observed.audit.observedActorDecisions>0);
  assert.ok(observed.audit.ownerPrompts>0);
  const nativeK1=observed.audit.firstOwnerK1Searches.map(event=>({
    ...event,trialId:observed.result.rows[event.game-1].trial.id,
    candidateSeat:observed.result.rows[event.game-1].candidateSeat
  }));
  const rank6NewMoon=nativeK1.filter(event=>
    event.trialId.startsWith('6:0:A:new-moon-lockbreaker-v1:') &&
    event.seat===0);
  assert.equal(rank6NewMoon.length,1,
    'Historical rank6 New Moon must have exactly one first candidate K1 search');
  assert.ok(rank6NewMoon[0].targetCounts['Mewtwo & Mew-GX UNM']>=0);
  return {
    schema:'agent21-native-actor-view-plus-k1-observation-v2',
    evidence:'retrospective 4-arm physical source-deal Store noninterference',
    originalCandidates:original.rows.map(row=>row.trial?.id),
    unchangedPhysicalDeals:original.sourcePairs.every(pair=>
      pair.sameSourcePhysicalDeal===true),
    sameCompleteCanonicalRows:true,
    actorProjectionAudit:observed.audit,
    nativeFirstOwnerK1:nativeK1,
    rank6NewMoonFirstOwnerK1:rank6NewMoon[0],
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
