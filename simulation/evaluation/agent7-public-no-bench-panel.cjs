'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent7-public-lone-active-KO-preregistered-rank6-panel-v1';
const manifestPath=path.join(__dirname,
  '../../results/aichi-2026/agent7-public-terminal-rank6-prospective-20261031.json');

/**
 * Reuse the original Store's exact two-seat canonical runner for the
 * preregistered 8-seed, 2-candidate, A/B alternating rank-6 panel.
 * The sole matched difference is the public final-Pokémon KO preference
 * applied to both owner seats. No simulated win counts as competitive.
 * @param {'control'|'selected'} mode
 * @returns {object}
 */
function runPanel(mode){
  assert.ok(mode==='control'||mode==='selected',
    'AGENT7_PANEL_MODE must be control or selected');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  assert.equal(manifest.schema,
    'agent7-registered-public-lone-active-ko-rank6-seed-panel-v1');
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
    sameRootPublicNoBenchTerminal:true,
    registeredTrials:manifest.trials,
    registeredFrameName:manifest.schema
  });
  assert.equal(report.attempted,16);
  assert.equal(report.competitiveQualifiedGames,0);
  return { ...report,preregisteredMode:mode,
    preregisteredManifestVersion:VERSION,
    preregisteredAt:manifest.registeredAt,
    preregisteredCohort:manifest.schema };
}

if(require.main===module){
  const output=runPanel(process.env.AGENT7_PANEL_MODE);
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
}

module.exports={VERSION,manifestPath,runPanel};
