'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runLine}=
  require('../simulation/twinleaf/iron-thorns-guzma-hala-line.cjs');

test('pinned Store no-Bench Volt Cyclone retains original physical DCE',()=>{
  const observed=runLine();
  assert.equal(observed.damage,140);
  assert.equal(observed.noBenchedPokemon,true);
  assert.equal(observed.exactDceRetainedAfterNoBenchVoltCyclone,true);
  console.log('AGENT7_NOBENCH_VOLT_DCE_RETENTION '+JSON.stringify({
    attack:'Volt Cyclone',settledDamage:observed.damage,
    noBenchedPokemon:observed.noBenchedPokemon,
    exactDceRetainedAfterNoBenchVoltCyclone:
      observed.exactDceRetainedAfterNoBenchVoltCyclone,
    scope:'injected-card-source-representable-fixture-not-original-seed',
    competitivelyQualifiedGames:0
  }));
});
