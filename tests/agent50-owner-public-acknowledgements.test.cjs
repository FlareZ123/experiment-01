'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withOwnerPublicAcknowledgements:withAcks}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');

const CODES={SETUP_PLAYER_NO_BASIC:'OWN_MULLIGAN',
  SETUP_OPPONENT_NO_BASIC:'OPP_MULLIGAN'};
class FakeAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'native-unsupported'};}
}
class ShowMulliganPrompt{
  constructor(id,message){
    this.playerId=id;
    this.message=message;
    this.id=8;
    this.result=undefined;
    this.hands=[['hidden opponent sample']];
  }
}
class WaitPrompt{
  constructor(id){
    this.playerId=id;
    this.id=9;
    this.result=undefined;
    this.message='wait';
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
const modules={
  'simple-bot/simple-tactics-ai':{SimpleTacticsAi:FakeAi},
  'game/store/prompts/show-mulligan-prompt':{ShowMulliganPrompt},
  'game/store/prompts/wait-prompt':{WaitPrompt},
  'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
  'game/game-message':{GameMessage:CODES},
  'game/store/state/state':{GamePhase:{SETUP:1}}
};
const engine=name=>modules[name];
function state(seat,prompt,turn=0,phase=1){
  return {players:[{id:101,hand:{cards:['alpha','beta']}},
    {id:202,hand:{cards:['secret-a','secret-b']}}],
    prompts:[prompt],activePlayer:seat,turn,phase};
}
test('both seats: required public mulligan reveal acknowledges true without hidden-card dependence',()=>{
  for(const seat of [0,1]){
    for(const code of Object.values(CODES)){
      const id=seat===0?101:202;
      const p=new ShowMulliganPrompt(id,code);
      const s=state(seat,p);
      let first,second;
      const wrapped=withAcks(()=>{
        const bot=new FakeAi(id);
        first=bot.decodeNextAction(s);
        s.players[1-seat].hand.cards.reverse();
        p.hands=[['different disclosed card order']];
        second=bot.decodeNextAction(s);
      },{engine});
      assert.equal(first.constructor,ResolvePromptAction);
      assert.equal(first.result,true);
      assert.equal(second.result,first.result);
      assert.equal(wrapped.audit.mulliganAcks,2);
      assert.equal(wrapped.audit.waitAcks,0);
      assert.ok(wrapped.audit.events.every(x=>x.seat===seat));
    }
  }
});
test('either seat: WaitPrompt resolves void with no native preference',()=>{
  for(const seat of [0,1]){
    const id=seat===0?101:202;
    const wrapped=withAcks(()=>
      new FakeAi(id).decodeNextAction(
        state(seat,new WaitPrompt(id),1,8)),{engine});
    assert.equal(wrapped.result.result,null);
    assert.equal(wrapped.audit.waitAcks,1);
    assert.equal(wrapped.audit.mulliganAcks,0);
  }
});
test('wrong owner, message, or phase still delegates with unchanged state',()=>{
  for(const cfg of [
    {id:101,p:new ShowMulliganPrompt(202,CODES.SETUP_PLAYER_NO_BASIC)},
    {id:101,p:new ShowMulliganPrompt(101,'UNKNOWN')},
    {id:101,p:new ShowMulliganPrompt(101,CODES.SETUP_PLAYER_NO_BASIC),phase:2}
  ]){
    const s=state(0,cfg.p,0,cfg.phase??1);
    const before=JSON.stringify(s);
    const wrapped=withAcks(()=>
      new FakeAi(cfg.id).decodeNextAction(s),{engine});
    assert.deepEqual(wrapped.result,{kind:'native-unsupported'});
    assert.equal(wrapped.audit.mulliganAcks,0);
    assert.equal(wrapped.audit.waitAcks,0);
    assert.equal(JSON.stringify(s),before);
  }
});
