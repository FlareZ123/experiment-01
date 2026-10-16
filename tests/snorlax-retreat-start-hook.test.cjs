'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { characterizeAll, characterizeRetreat } =
  require('../simulation/twinleaf/snorlax-retreat-action-characterization.cjs');

test('pinned interactive retreat bypasses unprotected Block before opt-in correction',()=>{
  const report = characterizeAll();
  assert.equal(report.cases.length,8);
  assert.equal(report.correctedCases.length,8);
  for (const row of report.cases) {
    const shouldPass = row.interface === 'start' || (row.hood && !row.jammer);
    assert.equal(row.switched, shouldPass,
      'Upstream characterization changed: '+JSON.stringify(row));
    assert.equal(row.zeroEnergyRetreatCost,true);
    if (row.interface === 'start') {
      assert.equal(row.promptKind,'ChoosePokemonPrompt');
    }
  }
  for (const row of report.correctedCases) {
    const shouldPass = row.hood && !row.jammer;
    assert.equal(row.switched, shouldPass,
      'Corrected Block permission differs from card text: '+JSON.stringify(row));
    assert.equal(row.zeroEnergyRetreatCost,true);
    if (!shouldPass) {
      assert.match(row.exception || '', /BLOCKED_BY_EFFECT/);
      assert.equal(row.activeAfter,'Shadow Rider Calyrex V');
    } else {
      assert.equal(row.activeAfter,'Latias ex');
    }
  }
});

test('the opt-in correction is fully reversible within the same process',()=>{
  const options={hood:false,jammer:false,interface:'start'};
  const before=characterizeRetreat(options);
  const during=characterizeRetreat({...options,startBlockCorrection:true});
  const after=characterizeRetreat(options);
  assert.deepEqual([before.switched,during.switched,after.switched],
    [true,false,true]);
  assert.equal(during.exception,'BLOCKED_BY_EFFECT');
});

test('headless runner labels opt-in Block gate and restores the unmodified policy',()=>{
  const {runMatch,upstreamSmokeDeck} = require('../simulation/twinleaf/headless.cjs');
  const deck=upstreamSmokeDeck();
  const shared={deckA:deck,deckB:deck,seed:20261016,maxActions:3};
  const corrected=runMatch({...shared,snorlaxRetreatStartCorrection:true});
  assert.equal(corrected.snorlaxRetreatStartCorrection,true);
  assert.match(corrected.policy,/SnorlaxBlockStartGate-v1/);
  const baseline=runMatch(shared);
  assert.equal(baseline.snorlaxRetreatStartCorrection,false);
  assert.doesNotMatch(baseline.policy,/SnorlaxBlockStartGate-v1/);
});
