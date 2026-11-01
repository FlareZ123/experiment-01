'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runMatch,upstreamSmokeDeck}=require(
  '../simulation/twinleaf/headless.cjs');
const {withFirstLiveStoreEnergyDrivePaperBypass}=require(
  '../simulation/twinleaf/agent34-energy-drive-bypass-hook.cjs');
const {Store}=require('../vendor/twinleaf/ptcg-server/output/game/store/store');

test('first native Store paper adapter remains inert when printing is absent',()=>{
  const deck=upstreamSmokeDeck();
  const request={deckA:deck,deckB:deck,seed:20261019,
    maxActions:80,isolatePolicyRandomness:true,captureDecisionTrace:true};
  const baseline=runMatch(request);
  const priorDispatch=Store.prototype.dispatch;
  const priorReducer=Store.prototype.reduceEffect;
  const observed=withFirstLiveStoreEnergyDrivePaperBypass(
    ()=>runMatch(request),{Store});
  assert.strictEqual(Store.prototype.dispatch,priorDispatch);
  assert.strictEqual(Store.prototype.reduceEffect,priorReducer);
  assert.equal(observed.audit.firstOriginalStoreCaptured,true);
  assert.equal(observed.audit.printedDamageBypass.interceptedNativeDamagePhases,0);
  for(const key of ['actions','turns','finished','winner','deckHashes',
    'rootActionLedger','attackDeclarationTrace']){
    assert.deepEqual(observed.result[key],baseline[key],
      'Unrelated native transcript changed: '+key);
  }
});
