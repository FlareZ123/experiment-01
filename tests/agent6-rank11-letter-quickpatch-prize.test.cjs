'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {rank11LetterQuickPatchWindow:run}=
  require('../scripts/agent6-rank11-letter-quickpatch-prize.cjs');
test('all three source Items plus non-Mega starter and searchable Mega',()=>{
 const r=run();
 assert.equal(r.totalPrerequisiteNumerator,'214349648');
 assert.equal(r.eighthMegaNumerator,'9506352');
 assert.equal(r.noEighthMegaNumerator,'204843296');
 assert.equal(r.prizeAllThreeMegaNumerator,'18424');
 assert.equal(r.prizeDenominator,'20358520');
 assert.equal(r.possibleNumerator,'4360067562915456');
 assert.equal(r.possibleDenominator,'324031005021884160');
 assert.ok(Math.abs(r.withAvailableMegaProbability-
   0.01345571101327476)<1e-14);
 assert.equal(r.nativeActionsPlayed,0);
});
