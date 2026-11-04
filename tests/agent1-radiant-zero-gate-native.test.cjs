'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeZeroClimacticGate:probe}=
  require('../simulation/twinleaf/agent1-radiant-zero-gate-native.cjs');
const {VERSION}=require('../simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs');

test('unmodified native Climactic Gate zero VMAX choice leaves turn incorrectly live; repair ends turn',()=>{
  for(const seat of [0,1]){
    const raw=probe(seat,0);
    const fixed=probe(seat,0,{repaired:true});
    console.log('AGENT1_GATE_EMPTY_NATIVE '+JSON.stringify({seat,raw,fixed}));
    assert.equal(raw.after.turn,4);
    assert.equal(raw.after.activePlayer,seat);
    assert.equal(raw.events.length,2);
    assert.equal(raw.events[1].validated,true);
    assert.equal(fixed.after.turn,5);
    assert.equal(fixed.after.activePlayer,1-seat);
    assert.equal(fixed.radiantBenched,true);
    assert.equal(fixed.vmaxBenched,false);
    assert.equal(fixed.vmaxInDeck,true);
    assert.deepEqual(fixed.pendingPrompts,[]);
    assert.equal(fixed.hookAudit.version,VERSION);
    assert.equal(fixed.hookAudit.observedUseConfirmations,1);
    assert.equal(fixed.hookAudit.observedSearchChoices,1);
    assert.equal(fixed.hookAudit.zeroSelections,1);
    assert.equal(fixed.hookAudit.repairedShuffles,1);
    assert.equal(fixed.hookAudit.repairedTurnEnds,1);
    assert.equal(fixed.hookAudit.paperQualifiedGames,0);
    assert.equal(fixed.events.filter(x=>x.prompt==='ShuffleDeckPrompt').length,1);
    assert.ok(fixed.events.every(x=>x.error===null));
  }
});

test('real positive one-VMAX choice behaves as original native, both seats',()=>{
  for(const seat of [0,1]){
    const raw=probe(seat,1),fixed=probe(seat,1,{repaired:true});
    console.log('AGENT1_GATE_ONE_NATIVE '+JSON.stringify({seat,raw,fixed}));
    for(const row of [raw,fixed]){
      assert.equal(row.after.turn,5);
      assert.equal(row.after.activePlayer,1-seat);
      assert.equal(row.radiantBenched,true);
      assert.equal(row.vmaxBenched,true);
      assert.equal(row.vmaxInDeck,false);
      assert.deepEqual(row.pendingPrompts,[]);
      assert.equal(row.events.filter(x=>x.prompt==='ShuffleDeckPrompt').length,1);
      assert.ok(row.events.every(x=>x.error===null));
    }
    assert.equal(fixed.hookAudit.observedSearchChoices,1);
    assert.equal(fixed.hookAudit.nonzeroNativeSelections,1);
    assert.equal(fixed.hookAudit.zeroSelections,0);
    assert.equal(fixed.hookAudit.repairedShuffles,0);
    assert.equal(fixed.hookAudit.repairedTurnEnds,0);
  }
});

test('native decline of Climactic Gate remains out of repair scope',()=>{
  const {withRadiantZeroGateHook}=require('../simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs');
  // The exact native positive and empty paths above already restore both
  // prototypes. A fake no-op scope proves the wrapper itself is reversible.
  const path=require('node:path');
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(root,'game/store/store'));
  const {RadiantEternatus}=require(path.join(root,
    'sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus'));
  const oldPrompt=Object.getOwnPropertyDescriptor(Store.prototype,'prompt');
  const oldReduce=Object.getOwnPropertyDescriptor(RadiantEternatus.prototype,'reduceEffect');
  const {result,audit}=withRadiantZeroGateHook(()=>42);
  assert.equal(result,42);
  assert.equal(audit.zeroSelections,0);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'prompt'),oldPrompt);
  assert.deepEqual(Object.getOwnPropertyDescriptor(RadiantEternatus.prototype,'reduceEffect'),oldReduce);
});
