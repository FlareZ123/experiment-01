'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerFirstPrizeReveal}=
  require('../simulation/twinleaf/agent21-owner-first-prize-reveal.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
class Bot {
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Inherited generic scorer should not execute');}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChoosePrizePrompt {
  constructor(owner,options={}) {
    this.id=31;this.playerId=owner.id;this.message='CHOOSE_PRIZE_CARD';
    this.result=undefined;
    this.options={count:1,allowCancel:false,useOpponentPrizes:false,
      blocked:[],...options};
  }
  getPerspectivePlayerId(){return this.playerId;}
  validate(selected,state) {
    const owner=state.players.find(p=>p.id===this.playerId);
    const occupied=owner.prizes.filter(p=>p.cards.length>0);
    return selected.length===Math.min(this.options.count,occupied.length)&&
      selected.every(p=>occupied.includes(p));
  }
}
const deps={SimpleTacticsAi:Bot,
  actions:{ResolvePromptAction},
  GameMessage:{CHOOSE_PRIZE_CARD:'CHOOSE_PRIZE_CARD'}};
function slots(){
  return Array.from({length:6},(_,i)=>{
    const concealed=[];
    if(i!==2&&i!==4)concealed.push('private');
    return {cards:new Proxy(concealed,{get(target,prop){
      if(prop==='0')throw Error('Private Prize identity read');
      return Reflect.get(target,prop);
    }})};
  });
}
function fixture(actorId,opts={}) {
  const players=[{id:11,prizes:slots(),hand:{cards:[]}},
    {id:22,prizes:slots(),hand:{cards:[]}}];
  const owner=players.find(p=>p.id===actorId);
  const prompt=new ChoosePrizePrompt(owner,{destination:owner.hand,...opts});
  return {state:{phase:3,turn:6,players,prompts:[prompt]},
    owner,prompt};
}
for(const [actorId,seat] of [[11,0],[22,1]]) {
  test('native first occupied Prize selector uses no concealed face, seat '+seat,()=>{
    const x=fixture(actorId,{count:2}),bot=new Bot(actorId);
    const original=Bot.prototype.decodeNextAction;
    const {result,audit}=withOwnerFirstPrizeReveal(
      ()=>bot.decodeNextAction(x.state),deps);
    assert.equal(result.id,31);
    assert.strictEqual(result.result[0],x.owner.prizes[0]);
    assert.strictEqual(result.result[1],x.owner.prizes[1]);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.nativePrizeValidationPassed,1);
    assert.equal(audit.records[0].selectedCount,2);
    assert.strictEqual(Bot.prototype.decodeNextAction,original);
  });
}
test('genuinely forbidden/foreign Prize prompts remain quarantined',()=>{
  const bot=new Bot(11);
  for(const opts of [
    {blocked:[0]},{useOpponentPrizes:true},{allowCancel:true},
    {count:0},{count:7},{destination:undefined},
    {destination:null},{destination:{cards:[]}}
  ]){
    const x=fixture(11,opts);
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerFirstPrizeReveal(()=>bot.decodeNextAction(x.state),deps),
      {SimpleTacticsAi:Bot}),{code:CODE});
  }
  const x=fixture(22);
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerFirstPrizeReveal(()=>bot.decodeNextAction(x.state),deps),
    {SimpleTacticsAi:Bot}),{code:CODE});
});
test('non-Prize informational decisions never bypass native fallback',()=>{
  const bot=new Bot(11),x=fixture(11);
  x.prompt.message='CHOOSE_PRIZE_CARD_TO_DISCARD';
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerFirstPrizeReveal(()=>bot.decodeNextAction(x.state),deps),
    {SimpleTacticsAi:Bot}),{code:CODE});
});
test('after physically valid Prize proposal, next root still fails closed',()=>{
  const bot=new Bot(11),x=fixture(11);
  const bad=fixture(11,{blocked:[0]});
  const original=Bot.prototype.decodeNextAction;
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerFirstPrizeReveal(()=>{
      assert.equal(bot.decodeNextAction(x.state).result.length,1);
      return bot.decodeNextAction(bad.state);
    },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.agent21OwnerPrizeAudit.ownerPrizeChoiceSubmitted,1);
    assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
    return true;
  });
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});

for(const [actorId,seat] of [[11,0],[22,1]]) {
  test('non-KO same-message Prize reveal, swap or Burst-GX cannot borrow KO fallback seat '+seat,()=>{
    const bot=new Bot(actorId);
    const x=fixture(actorId,{destination:undefined});
    const p=x.prompt;
    assert.equal(p.message,'CHOOSE_PRIZE_CARD');
    assert.equal(p.options.count,1);
    assert.equal(p.options.allowCancel,false);
    assert.equal(p.options.useOpponentPrizes,false);
    assert.deepEqual(p.options.blocked,[]);
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerFirstPrizeReveal(()=>bot.decodeNextAction(x.state),deps),
      {SimpleTacticsAi:Bot}),{code:CODE});
    const ko=fixture(actorId);
    const good=withOwnerFirstPrizeReveal(
      ()=>bot.decodeNextAction(ko.state),deps);
    assert.equal(good.result.id,31);
    assert.equal(good.audit.bySeat[seat],1);
  });
}
