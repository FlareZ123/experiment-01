'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent38-arven-shake-store-canary.cjs');

/**
 * Requires a pinned compiled Twinleaf build and research adapter installed.
 * This is a staged Store mechanics acceptance test, never a game win.
 */
test('printed Arven / Float Stone / Boost Shake / Garbotoxin effect on both seats',()=>{
  const evidence=run();
  assert.equal(evidence.schema,'agent38-arven-shake-staged-native-mechanics-v1');
  assert.equal(evidence.rows.length,2);
  assert.deepEqual(evidence.rows.map(row=>row.candidateSeat),[0,1]);
  for(const row of evidence.rows){
    assert.equal(row.source,'staged owner visible hand/deck, no deal');
    assert.equal(row.arvenTurnCostPaid,true);
    assert.equal(row.searchedItemAndToolHeld,true);
    assert.equal(row.targetWasBench,true);
    assert.equal(row.benchedGarbodorWithTool,true);
    assert.equal(row.opponentAbilityBlocked,true);
    assert.equal(row.noOutstandingStorePrompt,true);
    assert.equal(row.physicalCustodyAfterLine.benchedEvolutionPhysicalId,
      row.physicalCardIds.garbodor);
    assert.equal(row.physicalCustodyAfterLine.benchedToolPhysicalId,
      row.physicalCardIds.stone);
    assert.equal(row.physicalCustodyAfterLine.benchedBasicPhysicalId,
      row.physicalCardIds.trubbish);
    assert.equal(row.physicalCustodyAfterLine.searchedItemStillInHand,false);
    assert.equal(row.physicalCustodyAfterLine.searchedToolStillInHand,false);
    assert.equal(row.physicalCustodyAfterLine.searchedEvolutionStillInDeck,false);
    assert.ok(row.steps.some(action=>
      action.label==='Arven searches Item and Tool'));
    assert.ok(row.steps.some(action=>
      action.label==='Boost Shake own-deck Garbodor search'));
  }
  assert.equal(evidence.claim,
    'opt-in staged Store card-mechanics probe; no opponent game win');
});
