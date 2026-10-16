'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {stageRank2SourceK0,auditFullSourceK0}=
  require('../simulation/twinleaf/rank2-full-source-k0-sampler.cjs');
const {hasBenchEvolutionTarget}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');

test('exact rank-2 60-card physical K0 pair differs only in unobserved Gloom allocation',()=>{
  const available=stageRank2SourceK0(false);
  const prized=stageRank2SourceK0(true);
  assert.equal(available.sourceCount,60);
  assert.equal(prized.sourceCount,60);
  assert.deepEqual(available.observed,prized.observed);
  assert.equal(available.observed.deckCount,46);
  assert.equal(available.observed.prizeCount,6);
  assert.equal(hasBenchEvolutionTarget(available.player),true);
  assert.equal(hasBenchEvolutionTarget(prized.player),false);
});

test('pinned complete source-60 K0 posterior is invariant under hidden Prize swap',()=>{
  const report=auditFullSourceK0();
  assert.equal(report.sourceRank,2);
  assert.equal(report.sourcePrintCards,60);
  assert.equal(report.remainingDeck,46);
  assert.equal(report.unobservedPrizes,6);
  assert.deepEqual(report.physicallyPrizedGloom,[0,2]);
  assert.equal(report.pairedPosteriorScores.length,2);
  assert.equal(report.pairedPosteriorScores[0],report.pairedPosteriorScores[1]);
  assert.equal(report.liveSourceZonesPreserved,true);
});
