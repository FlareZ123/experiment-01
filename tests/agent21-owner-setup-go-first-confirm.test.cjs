'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withOwnerSetupGoFirstConfirm
}=require('../simulation/twinleaf/agent21-owner-setup-go-first-confirm.cjs');
const {
  CODE,withNativeRawStateFallbackQuarantine
}=require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

class FakeAi {
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Unsafe original decoder executed');}
}
class ConfirmPrompt {
  constructor(id,message,playerId){
    this.id=id;this.message=message;this.playerId=playerId;
    this.result=undefined;
  }
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
const phases={SETUP:1,PLAYER_TURN:2};
const messages={GO_FIRST:'GO_FIRST',WANT_TO_DRAW_CARDS:'WANT_TO_DRAW_CARDS'};
const deps={SimpleTacticsAi:FakeAi,
  actions:{ResolvePromptAction},GamePhase:phases,GameMessage:messages};
function fixture(playerId,phase=phases.SETUP,message=messages.GO_FIRST){
  const left={id:1},right={id:2};
  return {phase,turn:0,players:[left,right],
    prompts:[new ConfirmPrompt(73,message,playerId)],
    get deck(){throw Error('owner decision accessed hidden deck');},
    get prizes(){throw Error('owner decision accessed hidden prizes');}
  };
}

for(const [botId,seat] of [[1,0],[2,1]]) {
  test('owner-only setup GO_FIRST false on seat '+seat,()=>{
    const original=FakeAi.prototype.decodeNextAction;
    const bot=new FakeAi(botId),state=fixture(botId);
    const result=withOwnerSetupGoFirstConfirm(
      ()=>bot.decodeNextAction(state),deps);
    assert.deepEqual(result.result,new ResolvePromptAction(73,false));
    assert.equal(result.audit.ownerGoFirstHandled,1);
    assert.equal(result.audit.ownerGoFirstBySeat[seat],1);
    assert.equal(result.audit.otherRootOrPromptDelegated,0);
    assert.equal(result.audit.records[0].unobservedDeckRead,false);
    assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
  });
}

test('guard installed before owner adapter lets exact owner setup pass and blocks next prompt',()=>{
  const bot=new FakeAi(1),original=FakeAi.prototype.decodeNextAction;
  const first=fixture(1);
  const second=fixture(1,phases.SETUP,messages.WANT_TO_DRAW_CARDS);
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerSetupGoFirstConfirm(()=>{
      assert.deepEqual(bot.decodeNextAction(first),new ResolvePromptAction(73,false));
      return bot.decodeNextAction(second);
    },deps),{SimpleTacticsAi:FakeAi}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
    assert.equal(error.agent21OwnerGoFirstAudit.ownerGoFirstHandled,1);
    return true;
  });
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});

test('other player cannot decide their opponent setup choice',()=>{
  const bot=new FakeAi(1),state=fixture(2);
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerSetupGoFirstConfirm(
      ()=>bot.decodeNextAction(state),deps),
    {SimpleTacticsAi:FakeAi}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.agent21OwnerGoFirstAudit.ownerGoFirstHandled,0);
    return true;
  });
});

test('wrong phase and wrong message never bypass decoder quarantine',()=>{
  const bot=new FakeAi(1);
  for(const s of [fixture(1,phases.PLAYER_TURN),
    fixture(1,phases.SETUP,messages.WANT_TO_DRAW_CARDS)]){
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerSetupGoFirstConfirm(()=>bot.decodeNextAction(s),deps),
      {SimpleTacticsAi:FakeAi}),{code:CODE});
  }
});

test('malformed setup seat aborts and restores original method',()=>{
  const original=FakeAi.prototype.decodeNextAction;
  const bot=new FakeAi(3),s=fixture(3);
  assert.throws(()=>withOwnerSetupGoFirstConfirm(
    ()=>bot.decodeNextAction(s),deps),/Authenticated setup bot seat required/);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});
