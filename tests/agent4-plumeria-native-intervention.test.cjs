'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withOwnerPlumeriaAfterPass}=
  require('../simulation/twinleaf/agent4-plumeria-after-pass.cjs');

/**
 * Four selected historical source-first development arms, with an isolated
 * rank6 source-seat after-Pass Plumeria policy. Physical input pairing is
 * certified only for original unchanged source deck and same seed/seat.
 * No results qualify as competitive outcomes.
 */
test('real source-first Store accepts and settles owner Plumeria after Pass',()=>{
  const baseline=runDevelopment({
    sourceFirstRetrospective:true,actorOnlyComposition:true
  });
  const treated=withOwnerPlumeriaAfterPass(()=>runDevelopment({
    sourceFirstRetrospective:true,actorOnlyComposition:true
  }),{sourceSeat:0});
  const changed=treated.result,audit=treated.audit;
  assert.equal(baseline.attempted,4);
  assert.equal(changed.attempted,4);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(changed.competitiveQualifiedGames,0);
  assert.equal(audit.anyGameCompetitivelyQualified,false);
  assert.equal(audit.policyStrategicallyValidated,false);
  assert.ok(audit.nativeStores>=4);
  for(let i=0;i<4;i++){
    const first=baseline.rows[i],second=changed.rows[i];
    assert.equal(first.trial.id,second.trial.id);
    assert.equal(first.trial.seed,second.trial.seed);
    assert.equal(first.trial.candidateSlot,second.trial.candidateSlot);
    assert.equal(first.sourceDealFingerprint,second.sourceDealFingerprint);
    assert.equal(first.actualStarterSeat,second.actualStarterSeat);
    assert.equal(second.qualifiesForCompetitiveInference,false);
  }
  console.log('AGENT4_PLUMERIA_AFTER_PASS_NATIVE',
    JSON.stringify({audit,original:baseline.rows.map(x=>({
      id:x.trial.id,finished:x.finished,winner:x.winner,
      root:x.rootActionLedgerSha256})),
      treated:changed.rows.map(x=>({
        id:x.trial.id,finished:x.finished,winner:x.winner,
        root:x.rootActionLedgerSha256})),
      competitiveQualifiedGames:0}));
  assert.ok(audit.viablePassRoots>0,'No real source-side held Plumeria opportunity');
  assert.ok(audit.acceptedPlumeria>0,'Native Store rejected every Plumeria replacement');
  assert.ok(audit.settledEnergyDiscards>0,
    'Native Store never completed the three-prompt Plumeria line');
});
