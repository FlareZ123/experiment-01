'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditDetachedOwnDeck}=require('../simulation/twinleaf/detached-own-deck-audit.cjs');
test('pinned Store scores K1 paired hidden-order states on cloned Card graphs',()=>{
  const report=auditDetachedOwnDeck();
  assert.equal(report.mode,'opt-in-detached-full-state-own-deck-sampling');
  assert.equal(report.pairedScores[0],report.pairedScores[1]);
  assert.equal(report.sourceZonesPreserved,true);
});

// Keep the compiled, root-dispatched Heavy Ball K1 test beside the
// existing pinned Store hidden-information audit in manual CI.
require('./root-k1-unlocated-heavy-ball-sampling.test.cjs');

// Source-printed owner search and Peonia reveal the known-position K1 boundary.
require('./root-k1-peonia-prize-sampling.test.cjs');
