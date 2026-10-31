'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent7-preregistered-positive-print-attack-pass-rank6-v1';
const manifestPath=path.join(__dirname,
  '../../results/aichi-2026/agent7-positive-attack-pass-prospective-20261031.json');

/**
 * Run a sealed 8-seed rank6 native A/B panel. Both seats receive identical
 * actor-root decision code and same source/candidate 60s under each mode.
 *
 * @param {'control'|'selected'} mode
 * @returns {object} Raw original Store evidence, never competitive game wins.
 */
function runPanel(mode){
  assert.ok(mode==='control'||mode==='selected');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  assert.equal(manifest.schema,
    'agent7-registered-positive-print-attack-over-pass-rank6-v1');
  assert.equal(manifest.trials.length,16);
  assert.equal(new Set(manifest.trials.map(r=>r.seed)).size,8);
  for(const trial of manifest.trials)assert.equal(trial.rank,6);
  const output=runDevelopment({
    actorOnlyComposition:true,
    mandatoryOptionFallback:true,
    paperSupporterQuota:true,
    nativePressureWindows:true,
    nativeAcceptedTargets:true,
    sameRootProposalChoice:true,
    sameRootChoiceApply:mode==='selected',
    sameRootPositiveAttackOverPass:true,
    registeredTrials:manifest.trials,
    registeredFrameName:manifest.schema
  });
  assert.equal(output.attempted,16);
  assert.equal(output.competitiveQualifiedGames,0);
  return {...output,
    preregisteredMode:mode,
    preregisteredManifestVersion:VERSION,
    preregisteredAt:manifest.registeredAt,
    preregisteredCohort:manifest.schema};
}

if(require.main===module){
  process.stdout.write(JSON.stringify(
    runPanel(process.env.AGENT7_PANEL_MODE),null,2)+'\n');
}

module.exports={VERSION,manifestPath,runPanel};
