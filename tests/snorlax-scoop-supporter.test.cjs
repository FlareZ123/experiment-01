'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeAll}=require('../simulation/twinleaf/snorlax-scoop-supporter.cjs');

test('Cassius and AZ settle all Store prompts and escape solo Block with a replacement',()=>{
  const report=probeAll();
  assert.equal(report.sourceDeckMatch,false);
  assert.equal(report.competitiveInferenceQualified,false);
  assert.equal(report.cases.length,4);
  const withReplacement=report.cases.filter(x=>x.ownBench);
  assert.equal(withReplacement.length,3);
  for(const x of withReplacement){
    assert.equal(x.error,null,JSON.stringify(x));
    assert.deepEqual(x.remainingPrompts,[],JSON.stringify(x));
    assert.equal(x.activeAfter,'Latias ex',JSON.stringify(x));
    assert.equal(x.supporterDiscarded,true,JSON.stringify(x));
    assert.equal(x.supporterInPlayZone,false,JSON.stringify(x));
    assert.equal(x.supporterTurn,1,JSON.stringify(x));
  }
  for(const x of withReplacement.filter(x=>x.supporter==='Cassius')){
    assert.equal(x.targetInDeck,true);
    assert.equal(x.targetInHand,false);
    assert.equal(x.targetInDiscard,false);
    assert.ok(x.prompts.some(p=>p.kind==='ShuffleDeckPrompt'));
  }
  const az=withReplacement.find(x=>x.supporter==='AZ');
  assert.equal(az.targetInDeck,false);
  assert.equal(az.targetInHand,true);
  assert.equal(az.targetInDiscard,false);
});

test('solo-own-Pokemon Cassius action is diagnosed separately from a viable escape',()=>{
  const solo=probeAll().cases.find(x=>!x.ownBench);
  assert.equal(solo.supporter,'Cassius');
  assert.equal(solo.targetInDeck,true);
  assert.equal(solo.activeAfter,null);
  assert.equal(solo.error,null,JSON.stringify(solo));
  assert.deepEqual(solo.remainingPrompts,[],JSON.stringify(solo));
});
