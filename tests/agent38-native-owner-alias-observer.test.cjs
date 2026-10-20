'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectNativeOwnerAliases,installNativeOwnerAliasObserver:install}=
  require('../simulation/twinleaf/agent38-native-owner-alias-observer.cjs');
function state(){
  const actor={id:101,active:{cards:[{fullName:'Calyrex V'}],tools:[]}};
  return {turn:2,activePlayer:0,players:[actor],
    prompts:[{player:actor}]};
}
test('detect mutation aliased to genuine live player at entry',()=>{
  const s=state();
  const result=inspectNativeOwnerAliases(s,()=>{
    s.prompts[0].player.active.tools.push({name:'Tool'});
    return 'attack';
  });
  assert.equal(result.selected,'attack');
  assert.ok(result.audit.changedFields>0);
  assert.ok(result.audit.liveAliasMutatedObjects>=1);
  assert.ok(result.audit.examples.some(x=>
    x.livePlayerPath.includes('active.tools')));
});
test('isolated old prompt mutation does not falsely mark live player',()=>{
  const s=state();
  s.prompts.push({ghost:{cards:[]}});
  const r=inspectNativeOwnerAliases(s,()=>{
    s.prompts[1].ghost.cards.push({name:'ghost'});return 'pass';
  });
  assert.ok(r.audit.changedFields>0);
  assert.equal(r.audit.liveAliasMutatedObjects,0);
});
test('read-only wrapper preserves action and restores original method',()=>{
  class Bot{
    decodeNextAction(s){s.players[0].active.cards[0].cached=true;return 'chosen';}
  }
  const saved=Bot.prototype.decodeNextAction;
  const hook=install(Bot);
  try{
    assert.equal(new Bot().decodeNextAction(state()),'chosen');
    assert.equal(hook.report.decisions,1);
    assert.equal(hook.report.ownerAliasDecisions,1);
  }finally{hook.restore();}
  assert.strictEqual(Bot.prototype.decodeNextAction,saved);
});
