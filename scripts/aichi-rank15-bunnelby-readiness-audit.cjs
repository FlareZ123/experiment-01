'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const FIELDS = Object.freeze([
  'sourceBunnelbyActive',
  'sourceBunnelbyActiveWithTM',
  'sourceBunnelbyActiveWithTMAndEnergy',
  'twoSourceStageLineSlots',
  'fullSourceBenchBelowTwoStageLines'
]);
const ARMS = Object.freeze(['generic', 'bunnelbyEvolution']);

/**
 * Audits actual post-dispatch source physical states recorded by the current
 * root Store observer, without speculating about legal engine attacks.
 * Old artifacts predate the source-readiness fields and are rejected.
 *
 * @param {object} source Pair-campaign output from pinned headless runner.
 * @returns {object} Root-only physical readiness counts and failure boundaries.
 */
function summarizeBunnelbyReadiness(source) {
  assert.equal(source.schema,
    'newmoon-rank15-authentic-bunnelby-opponent-policy-pair-v1');
  assert.equal(source.sourceDeckAndInitialDealMatchedInEveryPair, true);
  assert.equal(source.opportunityPairs, 8);
  assert.equal(source.rows.length, 8);
  assert.equal(source.qualifiedForCompetitiveInference, false);
  const rows = source.rows.map(r => {
    assert.equal(r.identicalPrepolicySourceDeal, true);
    assert.equal(typeof r.originalSourceDealDigest, 'string');
    assert.equal(r.generic.firstNormalTurnPrizeGate.beforeTakingPrizesEligible,
      r.bunnelbyEvolution.firstNormalTurnPrizeGate.beforeTakingPrizesEligible);
    const arms = {};
    for (const armName of ARMS) {
      const arm = r[armName];
      const first = arm.first;
      for (const name of FIELDS) {
        assert.ok(Object.hasOwn(first, name),
          'Missing current root observer field ' + name + ' on ' +
          r.repeat + '/' + r.candidateSeat + '/' + armName);
      }
      const present = Object.fromEntries(FIELDS.map(name =>
        [name, first[name] !== null]));
      assert.ok(!present.sourceBunnelbyActiveWithTM ||
        present.sourceBunnelbyActive);
      assert.ok(!present.sourceBunnelbyActiveWithTMAndEnergy ||
        present.sourceBunnelbyActiveWithTM);
      const ready = first.sourceBunnelbyActiveWithTMAndEnergy;
      const targets = ready ? ready.opponentBoard.slice(1).filter(
        name => name === 'Oddish UNB' || name === 'Gloom UNB') : [];
      assert.ok(targets.length <= 2);
      arms[armName] = {
        ...present,
        firstBunnelbyActiveTurn:first.sourceBunnelbyActive?.turn??null,
        firstToolAttachedActiveTurn:first.sourceBunnelbyActiveWithTM?.turn??null,
        firstPoweredToolActiveTurn:ready?.turn??null,
        stageEligibleBenchTargetCountAtFirstPoweredTool:ready?targets.length:null,
        nativeEvolutionAnnouncements:
          arm.policyActions.nativeSourceAttackDeclarations.evolutionAnnouncements
      };
    }
    return {
      repeat:r.repeat,candidateSeat:r.candidateSeat,
      actualFirstSlot:r.actualFirstSlot,
      eligibleWithoutInitialPrizeRetrieval:
        r.generic.firstNormalTurnPrizeGate.beforeTakingPrizesEligible,
      physicalOriginalDealMatched:true,
      arms
    };
  });
  const aggregate={};
  for(const arm of ARMS) {
    aggregate[arm]={
      total:rows.length,
      initialPrizeEligible:rows.filter(r=>
        r.eligibleWithoutInitialPrizeRetrieval).length,
      eventCounts:Object.fromEntries(FIELDS.map(field => [
        field, rows.filter(r=>r.arms[arm][field]).length
      ])),
      readyWithAtLeastOneEvolutionTarget:rows.filter(r=>
        r.arms[arm].stageEligibleBenchTargetCountAtFirstPoweredTool>=1).length,
      declaredEvolutionTotal:rows.reduce((sum,r)=>
        sum+r.arms[arm].nativeEvolutionAnnouncements,0)
    };
  }
  return {
    schema:'aichi-rank15-root-bunnelby-physical-readiness-v1',
    sourceTrialCount:rows.length,
    comparison:'Identical eight initial true physical source deals, generic vs enhanced source policy',
    sourceField:'published Aichi rank15 original 60',
    unit:'one source-dealt game per row per arm, count any qualifying genuine Store post-dispatch snapshot while both players still have exactly six Prize cards',
    qualifiedForCompetitiveInference:false,
    claimLimit:'Genuine Store source observer filters out all post-Prize-changing board states. Recorded physical positions do not certify a legal attack, its available choice, or a win rate.',
    aggregate,rows
  };
}

if(require.main===module) {
  assert.equal(process.argv.length,3,
    'Provide one existing source-paired JSON file as the argument');
  const value=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(summarizeBunnelbyReadiness(value),null,2)+'\n');
}

module.exports={FIELDS,ARMS,summarizeBunnelbyReadiness};
