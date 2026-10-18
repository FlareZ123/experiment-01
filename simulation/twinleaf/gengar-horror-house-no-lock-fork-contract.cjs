'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {probe}=require('./gengar-horror-house-rainbow-fidelity.cjs');
const {withHorrorHouseNoHandLockFork,FIELDS}=
  require('./gengar-horror-house-no-hand-lock-fork.cjs');

function run(){
  const {GengarMimikyuGX}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx'));
  const original=GengarMimikyuGX.prototype.reduceEffect;
  const raw=probe('basic');
  const {result:counterfactual,observed}=withHorrorHouseNoHandLockFork(
    ()=>probe('basic'),202);
  assert.equal(raw.sourceUsedGX,true);
  assert.equal(raw.opponentItemLocked,true);
  assert.equal(raw.sourceHandCount,7);
  assert.equal(counterfactual.sourceUsedGX,true);
  assert.equal(counterfactual.opponentItemLocked,false);
  assert.equal(counterfactual.sourceHandCount,raw.sourceHandCount);
  assert.equal(counterfactual.opponentHandCount,raw.opponentHandCount);
  assert.equal(observed.length,1);
  for(const key of FIELDS){
    assert.equal(observed[0].restored[key],observed[0].previous[key],
      'Counterfactual must restore '+key);
  }
  assert.equal(observed[0].printedApplied.cannotPlayPokemonCards,true);
  assert.equal(observed[0].printedApplied.cannotPlayEnergyCards,true);
  assert.equal(observed[0].printedApplied.cannotPlaySupporterCards,true);
  assert.equal(observed[0].printedApplied.cannotPlayItemCards,true);
  assert.equal(GengarMimikyuGX.prototype.reduceEffect,original,
    'Temporary counterfactual must restore prototype identity');
  assert.equal(probe('basic').opponentItemLocked,true,
    'Subsequent legal Store should still apply printed full hand lock');
  return {
    schema:'staged-gengar-native-no-hand-lock-counterfactual-contract-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    original:raw,counterfactual,observed,restored:true,
    classification:'intentionally invalid-paper-rule intervention for causal bot diagnosis; no competitive inference'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
