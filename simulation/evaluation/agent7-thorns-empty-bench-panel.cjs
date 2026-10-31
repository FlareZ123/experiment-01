'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent7-thorns-empty-bench-printed-volt-cyclone-rank6-panel-v1';
const filename=path.join(__dirname,
  '../../results/aichi-2026/agent7-thorns-empty-bench-20261031.json');

/**
 * Independently sealed eight-seed original Store test of a single
 * source-independent actor-owned public printed-attack condition.
 * @param {'control'|'selected'} mode
 * @returns {object}
 */
function runPanel(mode){
  assert.ok(mode==='control'||mode==='selected');
  const manifest=JSON.parse(fs.readFileSync(filename,'utf8'));
  assert.equal(manifest.schema,
    'agent7-registered-thorns-empty-bench-attack-20261031');
  assert.equal(manifest.trials.length,16);
  assert.equal(new Set(manifest.trials.map(t=>t.seed)).size,8);
  for(const trial of manifest.trials)assert.equal(trial.rank,6);
  const report=runDevelopment({
    actorOnlyComposition:true,
    mandatoryOptionFallback:true,
    paperSupporterQuota:true,
    nativePressureWindows:true,
    nativeAcceptedTargets:true,
    sameRootProposalChoice:true,
    sameRootChoiceApply:mode==='selected',
    sameRootThornsEmptyBench:true,
    registeredTrials:manifest.trials,
    registeredFrameName:manifest.schema
  });
  assert.equal(report.attempted,16);
  assert.equal(report.competitiveQualifiedGames,0);
  return {...report,preregisteredMode:mode,
    preregisteredManifestVersion:VERSION,
    preregisteredAt:manifest.registeredAt,
    preregisteredCohort:manifest.schema};
}

if(require.main===module){
  process.stdout.write(JSON.stringify(
    runPanel(process.env.AGENT7_PANEL_MODE),null,2)+'\n');
}

module.exports={VERSION,filename,runPanel};
