'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerShowCardsAcknowledgment}=
  require('../simulation/twinleaf/agent21-owner-showcards-acknowledgment.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

class Bot {
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Unqualified native state scorer executed');}
}
class ShowCardsPrompt {
  constructor(playerId,message){
    this.id=17;this.playerId=playerId;this.message=message;
    this.result=undefined;this.options={allowCancel:false};
    Object.defineProperty(this,'cards',{get(){
      throw Error('owner ack read revealed opponent card identities');
    }});
  }
}
class ConfirmPrompt {
  constructor(playerId,message){this.playerId=playerId;this.message=message;}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
const deps={
  SimpleTacticsAi:Bot,
  actions:{ResolvePromptAction},
  GameMessage:{SETUP_OPPONENT_NO_BASIC:'SETUP_OPPONENT_NO_BASIC'}
};
function fixture(id,message='CARDS_SHOWED_BY_EFFECT',handSize=7){
  const players=[{id:1,hand:{cards:new Array(id===1?handSize:0)}},
    {id:2,hand:{cards:new Array(id===2?handSize:0)}}];
  const prompt=new ShowCardsPrompt(id,message);
  return {phase:2,turn:2,prompts:[prompt],players,
    get opponentDeck(){throw Error('Hidden deck read');}};
}
for(const [id,seat] of [[1,0],[2,1]]){
  test('native information reveal ack reads no card identity, seat '+seat,()=>{
    const original=Bot.prototype.decodeNextAction;
    const bot=new Bot(id),state=fixture(id);
    const {result,audit}=withOwnerShowCardsAcknowledgment(
      ()=>bot.decodeNextAction(state),deps);
    assert.deepEqual(result,new ResolvePromptAction(17,true));
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.records[0].readRevealedCardIdentities,false);
    assert.strictEqual(Bot.prototype.decodeNextAction,original);
  });
}
test('mulligan reveal implements exact native hand-size threshold',()=>{
  const bot=new Bot(1);
  for(const [size,answer] of [[14,true],[15,null],[16,null]]){
    const {result,audit}=withOwnerShowCardsAcknowledgment(
      ()=>bot.decodeNextAction(fixture(1,'SETUP_OPPONENT_NO_BASIC',size)),
      deps);
    assert.equal(result.result,answer);
    assert.equal(audit.setupMulliganSpecialCases,1);
    assert.equal(audit.nullMulliganResponses,answer===null?1:0);
  }
});
test('no response to wrong-owner prompt or non-ShowCards prompt',()=>{
  const bot=new Bot(1);
  const wrongOwner=fixture(2);
  const wrongKind=fixture(1);
  wrongKind.prompts=[new ConfirmPrompt(1,'GO_FIRST')];
  for(const state of [wrongOwner,wrongKind]){
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerShowCardsAcknowledgment(
        ()=>bot.decodeNextAction(state),deps),
      {SimpleTacticsAi:Bot}),{code:CODE});
  }
});
test('after owner acknowledgments the next unsupported prompt remains quarantined',()=>{
  const bot=new Bot(2),state=fixture(2),other=fixture(2);
  other.prompts=[new ConfirmPrompt(2,'GO_FIRST')];
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerShowCardsAcknowledgment(()=>{
      assert.equal(bot.decodeNextAction(state).result,true);
      return bot.decodeNextAction(other);
    },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.agent21OwnerShowCardsAudit.showCardsAcknowledged,1);
    return true;
  });
});
