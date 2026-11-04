'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerSetupStartingBasics}=
  require('../simulation/twinleaf/agent21-owner-setup-starting-basics.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

class Bot {
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Inherited scorer read concealed state');}
}
class ChooseCardsPrompt {
  constructor(owner, cards,blocked=[],message='CHOOSE_STARTING_POKEMONS'){
    this.id=73;this.playerId=owner.id;this.cards=cards;this.message=message;
    this.options={min:1,max:6,allowCancel:false,blocked};
    this.result=undefined;
  }
  validate(cards) {
    return cards.length>=this.options.min&&
      cards.length<=this.options.max&&
      cards.every(c=>this.cards.cards.includes(c)&&
        !this.options.blocked.includes(this.cards.cards.indexOf(c)));
  }
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
const deps={
  SimpleTacticsAi:Bot,
  actions:{ResolvePromptAction},
  GamePhase:{SETUP:1},
  GameMessage:{CHOOSE_STARTING_POKEMONS:'CHOOSE_STARTING_POKEMONS'},
  cardTypes:{SuperType:{POKEMON:1,TRAINER:2},
    Stage:{BASIC:2,STAGE_1:3},
    CardTag:{PLAY_DURING_SETUP:'Play During Setup'}}
};
const p=name=>({fullName:name,superType:1,stage:2,tags:[]});
const item=name=>({fullName:name,superType:2,tags:[]});
function state(seat,{blocked=[],otherMessage=false,
  foreignList=false}={}){
  const players=[{id:1,hand:{cards:[p('Mew V FST'),item('Ultra Ball SUM'),p('Genesect V FST')]}},
    {id:2,hand:{cards:[p('Regidrago V SIT'),p('Crobat V DAA')]}}];
  const owner=players[seat],cards=foreignList?{cards:[...owner.hand.cards]}:owner.hand;
  const prompt=new ChooseCardsPrompt(owner,cards,blocked,
    otherMessage?'CHOOSE_EVOLUTION':'CHOOSE_STARTING_POKEMONS');
  return {state:{phase:1,turn:0,players,prompts:[prompt],
    get opponentDeck(){throw Error('Hidden deck identity read');}},
    prompt,owner};
}
for(const seat of [0,1]){
  test('owner Basic setup selects only its own eligible hand, seat '+seat,()=>{
    const x=state(seat,{blocked:seat===0?[1]:[]});
    const bot=new Bot(x.owner.id),original=Bot.prototype.decodeNextAction;
    const {result,audit}=withOwnerSetupStartingBasics(
      ()=>bot.decodeNextAction(x.state),deps);
    const expected=seat===0?['Mew V FST','Genesect V FST']:
      ['Regidrago V SIT','Crobat V DAA'];
    assert.deepEqual(result.result.map(c=>c.fullName),expected);
    assert.strictEqual(result.result[0],x.owner.hand.cards[0]);
    assert.equal(audit.setupBasicSelections,1);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.records[0].allFromOwnHand,true);
    assert.strictEqual(Bot.prototype.decodeNextAction,original);
  });
}
test('native quarantine remains effective after safe owner Basic action',()=>{
  const x=state(0),bot=new Bot(1);
  const bad=state(0,{otherMessage:true});
  const original=Bot.prototype.decodeNextAction;
  assert.throws(()=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerSetupStartingBasics(()=>{
      assert.equal(bot.decodeNextAction(x.state).result.length,2);
      return bot.decodeNextAction(bad.state);
    },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.agent21OwnerStartingAudit.setupBasicSelections,1);
    assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
    return true;
  });
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
test('foreign hand list, wrong message and blocked required starter fail closed',()=>{
  const bot=new Bot(1);
  for(const input of [{foreignList:true},{otherMessage:true},{blocked:[0,2]}]){
    const x=state(0,input);
    assert.throws(()=>withNativeRawStateFallbackQuarantine(
      ()=>withOwnerSetupStartingBasics(()=>bot.decodeNextAction(x.state),deps),
      {SimpleTacticsAi:Bot}),{code:CODE});
  }
});
test('special setup tagged Pokémon remains eligible even if non-Basic',()=>{
  const x=state(0);
  x.owner.hand.cards[0]={fullName:'special setup',superType:1,
    stage:3,tags:['Play During Setup']};
  const bot=new Bot(1);
  const {result}=withOwnerSetupStartingBasics(
    ()=>bot.decodeNextAction(x.state),deps);
  assert.equal(result.result[0].fullName,'special setup');
});
