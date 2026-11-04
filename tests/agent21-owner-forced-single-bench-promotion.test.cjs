'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerForcedSingleBenchPromotion}=
  require('../simulation/twinleaf/agent21-owner-forced-single-bench-promotion.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
class Bot {
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Native generic scorer executed');}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChoosePokemonPrompt {
  constructor(id,options={}) {
    this.id=83;this.playerId=id;this.result=undefined;
    this.message='CHOOSE_NEW_ACTIVE_POKEMON';
    this.playerType=0;this.slots=[1];
    this.options={min:1,max:1,allowCancel:false,blocked:[],...options};
  }
  getPerspectivePlayerId(){return this.playerId;}
  validate(result) {
    return result.length===1&&result[0].cards.length===1&&
      this.options.blocked.length===0;
  }
}
const deps={
  SimpleTacticsAi:Bot,
  actions:{ResolvePromptAction},
  GameMessage:{CHOOSE_NEW_ACTIVE_POKEMON:'CHOOSE_NEW_ACTIVE_POKEMON'},
  GamePhase:{ATTACK:3},
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{BENCH:1,ACTIVE:0}
};
function fixture(botId,available=1,options={}){
  const players=[{id:17,bench:[]},{id:29,bench:[]}];
  const owner=players.find(p=>p.id===botId);
  owner.bench=Array.from({length:5},(_,i)=>({
    cards:i<available?[{get name(){
      throw Error('Forbidden secret card face was inspected');
    }}]:[]
  }));
  const prompt=new ChoosePokemonPrompt(botId,options);
  return {owner,prompt,state:{turn:6,phase:3,players,prompts:[prompt]}};
}
for(const [id,seat] of [[17,0],[29,1]]){
  test('one physically eligible Bench only is genuine forced promotion seat '+seat,()=>{
    const original=Bot.prototype.decodeNextAction;
    const bot=new Bot(id),x=fixture(id,1);
    const {result,audit}=withOwnerForcedSingleBenchPromotion(
      ()=>bot.decodeNextAction(x.state),deps);
    assert.deepEqual(result.result,[x.owner.bench[0]]);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.records[0].legalDomainSize,1);
    assert.strictEqual(Bot.prototype.decodeNextAction,original);
  });
}
test('multiple benches, empty bench, options, wrong prompt preserve quarantine',()=>{
  const bot=new Bot(17);
  for(const x of [
    fixture(17,2),fixture(17,0),
    fixture(17,1,{allowCancel:true}),
    fixture(17,1,{blocked:[{player:0,slot:1,index:0}]}),
    fixture(17,1,{max:2}),
    fixture(29,1)
  ]){
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerForcedSingleBenchPromotion(
        ()=>bot.decodeNextAction(x.state),deps),
      {SimpleTacticsAi:Bot}),{code:CODE});
  }
});
test('after forced promotion next tactical decision cannot enter native scorer',()=>{
  const bot=new Bot(17),x=fixture(17,1),next=fixture(17,2);
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerForcedSingleBenchPromotion(()=>{
      assert.equal(bot.decodeNextAction(x.state).result.length,1);
      return bot.decodeNextAction(next.state);
    },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.agent21ForcedPromotionAudit.ownerForcedPromotionSubmitted,1);
    return true;
  });
});
