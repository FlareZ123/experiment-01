'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent20-rank7-turnend-original60-pair.cjs');

test('same original rank7 conserved 60 offers both native turn-ending choices in both seats',()=>{
  const out=run();
  assert.equal(out.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(out.searchShuffleNumericValidationCorrected,true);
  assert.equal(out.fullOriginalOpponentUsed,false);
  assert.equal(out.competitiveQualifiedGames,0);
  assert.equal(out.rows.length,2);
  for(const {seat,palace,stevenSameDraw,stevenIllustrative} of out.rows){
    assert.equal(seat,palace.seat);
    assert.equal(palace.printedSourceCard,'Palace Book SMP');
    assert.equal(stevenSameDraw.printedSourceCard,"Steven's Resolve CES");
    assert.equal(stevenIllustrative.printedSourceCard,"Steven's Resolve CES");
    for(const row of [palace,stevenSameDraw,stevenIllustrative]){
      assert.equal(row.rank,7);
      assert.equal(row.initialDeck46,46);
      assert.equal(row.initialHand7,7);
      assert.equal(row.ownerDeckAfter,43,JSON.stringify(row));
      assert.equal(row.ownerReceivedPrintings.length,3);
      assert.equal(row.completeTurnHandoff,true,JSON.stringify(row));
      assert.equal(row.sourceCardsConserved,60);
    }
    assert.equal(palace.initialPhysicalZonesFingerprint,
      stevenSameDraw.initialPhysicalZonesFingerprint);
    assert.equal(palace.initialPhysicalZonesFingerprint,
      stevenIllustrative.initialPhysicalZonesFingerprint);
    assert.deepEqual(
      [...palace.ownerReceivedPrintings].sort(),
      [...stevenSameDraw.ownerReceivedPrintings].sort());
    assert.deepEqual(stevenIllustrative.searchedPrintings,
      ['VS Seeker PHF','Counter Catcher PAR','Capture Energy RCL']);
    assert.equal(palace.promptTrace.some(p=>
      p.family==='ChooseCardsPrompt'),false);
    assert.equal(stevenSameDraw.promptTrace.some(p=>
      p.family==='ChooseCardsPrompt'),true);
  }
});
