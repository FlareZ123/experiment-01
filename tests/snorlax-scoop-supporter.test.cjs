'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeAll}=require('../simulation/twinleaf/snorlax-scoop-supporter.cjs');

test('Cassius and AZ settle all Store prompts and escape solo Block with a replacement',()=>{
  const report=probeAll();
  assert.equal(report.sourceDeckMatch,false);
  assert.equal(report.competitiveInferenceQualified,false);
  assert.equal(report.cases.length,10);
  const withReplacement=report.cases.filter(x=>x.ownBench);
  assert.equal(withReplacement.length,7);
  const relocating=withReplacement.filter(x=>x.mode!=='draw');
  assert.equal(relocating.length,6);
  for(const x of relocating){
    assert.equal(x.error,null,JSON.stringify(x));
    assert.deepEqual(x.remainingPrompts,[],JSON.stringify(x));
    assert.equal(x.activeAfter,'Latias ex',JSON.stringify(x));
    assert.equal(x.supporterDiscarded,true,JSON.stringify(x));
    assert.equal(x.supporterInPlayZone,false,JSON.stringify(x));
    assert.equal(x.supporterTurn,1,JSON.stringify(x));
  }
  for(const x of relocating.filter(x=>x.supporter==='Cassius')){
    assert.equal(x.targetInDeck,true);
    assert.equal(x.targetInHand,false);
    assert.equal(x.targetInDiscard,false);
    assert.equal(x.energyInDeck,true);
    assert.equal(x.toolInDeck,true);
    assert.equal(x.energyInDiscard,false);
    assert.equal(x.toolInDiscard,false);
    assert.ok(x.prompts.some(p=>p.kind==='ShuffleDeckPrompt'));
  }
  const az=relocating.find(x=>x.supporter==='AZ');
  assert.equal(az.targetInDeck,false);
  assert.equal(az.targetInHand,true);
  assert.equal(az.targetInDiscard,false);
  assert.equal(az.energyInDiscard,true);
  assert.equal(az.toolInDiscard,true);
  assert.equal(az.energyInDeck,false);
  assert.equal(az.toolInDeck,false);
  for(const keeper of relocating.filter(x=>x.supporter==='Bird Keeper')){
    assert.equal(keeper.targetInDeck,false);
    assert.equal(keeper.targetInHand,false);
    assert.equal(keeper.targetOnBench,true);
    assert.equal(keeper.energyOnBench,true);
    assert.equal(keeper.toolOnBench,true);
    assert.equal(keeper.energyInDiscard,false);
    assert.equal(keeper.toolInDiscard,false);
    assert.equal(keeper.handCountAfter,3,'Bird Keeper must draw three after a switch');
  }
  const tateSwitch=relocating.find(x=>x.supporter==='Tate & Liza');
  assert.equal(tateSwitch.targetOnBench,true);
  assert.equal(tateSwitch.energyOnBench,true);
  assert.equal(tateSwitch.toolOnBench,true);
  assert.equal(tateSwitch.handCountAfter,0);
});

test('Tate and Liza draw mode works even when solo Block provides no own Bench',()=>{
  const cases=probeAll().cases.filter(x=>x.supporter==='Tate & Liza'&&x.mode==='draw');
  assert.equal(cases.length,2);
  for(const x of cases){
    assert.equal(x.error,null,JSON.stringify(x));
    assert.deepEqual(x.remainingPrompts,[],JSON.stringify(x));
    assert.equal(x.activeAfter,'Shadow Rider Calyrex V');
    assert.equal(x.energyOnActive,true);
    assert.equal(x.toolOnActive,true);
    assert.equal(x.supporterDiscarded,true);
    assert.equal(x.supporterTurn,1);
    assert.equal(x.handCountAfter,5);
    assert.ok(x.prompts.some(p=>p.kind==='SelectPrompt'));
    assert.ok(x.prompts.some(p=>p.kind==='ShuffleDeckPrompt'));
  }
});

test('Bird Keeper requires a Bench and leaves an illegal attempt unspent',()=>{
  const solo=probeAll().cases.find(x=>x.supporter==='Bird Keeper'&&!x.ownBench);
  assert.equal(solo.activeAfter,'Shadow Rider Calyrex V',JSON.stringify(solo));
  assert.equal(solo.supporterDiscarded,false);
  assert.equal(solo.supporterInPlayZone,false);
  assert.equal(solo.supporterTurn,0);
  assert.ok(solo.error,JSON.stringify(solo));
});

test('solo-own-Pokemon Cassius action is diagnosed separately from a viable escape',()=>{
  const solo=probeAll().cases.find(x=>!x.ownBench);
  assert.equal(solo.supporter,'Cassius');
  assert.equal(solo.targetInDeck,true);
  assert.equal(solo.activeAfter,null);
  assert.equal(solo.energyInDeck,true);
  assert.equal(solo.toolInDeck,true);
  assert.equal(solo.phase,7,'Pinned engine must end after the sole in-play Pokemon leaves');
  assert.equal(solo.error,null,JSON.stringify(solo));
  assert.deepEqual(solo.remainingPrompts,[],JSON.stringify(solo));
});
