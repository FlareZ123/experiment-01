'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerNonvisualPhaseWait}=
  require('../simulation/twinleaf/agent21-owner-nonvisual-phase-wait.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
class Bot {
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Unsafe native scorer executed');}
}
class WaitPrompt {
  constructor(playerId,message=undefined,showVisual=false){
    this.id=19;this.playerId=playerId;this.message=message;
    this.showVisual=showVisual;this.result=undefined;
  }
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
const deps={SimpleTacticsAi:Bot,
  actions:{ResolvePromptAction},
  GamePhase:{DRAW:8,BETWEEN_TURNS:6,SETUP:1,PLAYER_TURN:2}};
function fixture(botId,phase=8,message=undefined,showVisual=false){
  return {phase,turn:1,players:[{id:3},{id:7}],
    prompts:[new WaitPrompt(botId,message,showVisual)],
    get hiddenDeck(){throw Error('unseen cards read');}
  };
}
for(const [botId,seat] of [[3,0],[7,1]])for(const phase of [8,6]){
  test('owner nonvisual transition null is legal seat '+seat+' phase '+phase,()=>{
    const original=Bot.prototype.decodeNextAction,bot=new Bot(botId);
    const {result,audit}=withOwnerNonvisualPhaseWait(
      ()=>bot.decodeNextAction(fixture(botId,phase)),deps);
    assert.deepEqual(result,new ResolvePromptAction(19,null));
    assert.equal(audit.nativePendingWaitHandled,1);
    assert.equal(audit.bySeat[seat],1);
    assert.strictEqual(Bot.prototype.decodeNextAction,original);
  });
}
test('owner wait adapter never bypasses forbidden prompts or phases',()=>{
  const bot=new Bot(3),original=Bot.prototype.decodeNextAction;
  const invalid=[
    fixture(3,8,'Draw animation',false),
    fixture(3,8,undefined,true),
    fixture(3,1),
    fixture(3,2),
    fixture(7,8)
  ];
  for(const state of invalid){
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerNonvisualPhaseWait(()=>bot.decodeNextAction(state),deps),
      {SimpleTacticsAi:Bot}),{code:CODE});
  }
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
test('safe wait is resolved first and next native decision is still fail-closed',()=>{
  const bot=new Bot(7);
  const allowed=fixture(7),blocked=fixture(7,2);
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerNonvisualPhaseWait(()=>{
      assert.deepEqual(bot.decodeNextAction(allowed),
        new ResolvePromptAction(19,null));
      return bot.decodeNextAction(blocked);
    },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.agent21OwnerWaitAudit.nativePendingWaitHandled,1);
    assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
    return true;
  });
});

test('exact visual ATTACK animation null is opt-in and owner-only',()=>{
  const original=Bot.prototype.decodeNextAction;
  const bot=new Bot(7),state=fixture(7,3,'Attack animation',true);
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerNonvisualPhaseWait(()=>bot.decodeNextAction(state),deps),
    {SimpleTacticsAi:Bot}),{code:CODE});
  const {result,audit}=withOwnerNonvisualPhaseWait(
    ()=>bot.decodeNextAction(state),
    {...deps,GamePhase:{...deps.GamePhase,ATTACK:3},
      allowVisualAttackWait:true});
  assert.deepEqual(result,new ResolvePromptAction(19,null));
  assert.equal(audit.visualAttackWaitHandled,1);
  assert.equal(audit.records[0].exactVisualAttackAnimation,true);
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
test('visual attack wait cannot silently handle other animations',()=>{
  const bot=new Bot(3);
  for(const state of [
    fixture(3,3,'Different animation',true),
    fixture(3,8,'Attack animation',true),
    fixture(3,3,'Attack animation',false),
    fixture(7,3,'Attack animation',true)
  ]){
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerNonvisualPhaseWait(()=>bot.decodeNextAction(state),
        {...deps,GamePhase:{...deps.GamePhase,ATTACK:3},
          allowVisualAttackWait:true}),
      {SimpleTacticsAi:Bot}),{code:CODE});
  }
});
