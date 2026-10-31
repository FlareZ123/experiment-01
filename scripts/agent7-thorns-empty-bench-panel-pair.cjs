'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {comparePositiveAttackPanel}=require(
  './agent7-positive-attack-pass-panel-pair.cjs');

const VERSION='agent7-thorns-own-bench-zero-printed-volt-cyclone-native-pair-v1';
const COHORT='agent7-registered-thorns-empty-bench-attack-20261031';

/**
 * Preserve all source seeds, physical deals and Store first-divergence
 * evidence under an exact printed-attack narrowing, with the same strict
 * matched-groups comparator used for the wider attack preference.
 * @param {object} control
 * @param {object} selected
 * @returns {object}
 */
function compareNarrowThornsPanel(control,selected){
  for(const report of [control,selected]){
    assert.equal(report.sameRootPositiveAttackOverPassOptIn,false);
    assert.equal(report.sameRootPublicNoBenchTerminalOptIn,false);
    assert.equal(report.sameRootThornsEmptyBenchOptIn,true);
  }
  const result=comparePositiveAttackPanel(control,selected,{
    cohort:COHORT,
    policyFlag:'sameRootThornsEmptyBenchOptIn',
    version:VERSION
  });
  for(const trial of result.details){
    if(trial.firstDivergenceIndex<0)continue;
    assert.equal(trial.selectedFirstEvent.attack,'Volt Cyclone');
    assert.equal(trial.selectedFirstEvent.turnBefore>=2,true);
  }
  return result;
}

if(require.main===module){
  assert.equal(process.argv.length,4);
  const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const report=compareNarrowThornsPanel(
    load(process.argv[2]),load(process.argv[3]));
  process.stdout.write('REGISTERED_NARROW_THORNS_NATIVE_PAIR '+
    JSON.stringify(report)+'\n');
}

module.exports={VERSION,COHORT,compareNarrowThornsPanel};
