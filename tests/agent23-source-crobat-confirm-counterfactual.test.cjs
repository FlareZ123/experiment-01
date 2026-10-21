'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceCrobatConfirmYes}=
  require('../simulation/twinleaf/agent23-source-crobat-confirm-counterfactual.cjs');
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ConfirmPrompt{
  constructor(yesLegal=true){
    this.id=33;this.playerId=101;this.message='WANT_TO_USE_ABILITY';
    this.result=undefined;this.yesLegal=yesLegal;
  }
  validate(result){return result===false||
    (result===true&&this.yesLegal);}
}
function state(yesLegal=true){
  const card=fullName=>({fullName});
  const slot=(name,energies=[],tools=[])=>({
    energies:{cards:energies.map(card)},tools:tools.map(card),
    getPokemonCard:()=>name?card(name):null
  });
  return {turn:7,activePlayer:0,
    players:[
      {id:101,hand:{cards:Array(5).fill('own')},
        active:slot('Garbodor BKP'),bench:[
          slot('Oranguru V ASR'),slot('Crobat V DAA')
        ]},
      {id:202,hand:{cards:['SECRET_200']},
        active:slot('Galarian Articuno V CRE')}
    ],
    prompts:[new ConfirmPrompt(yesLegal)]};
}
function fixture(yesLegal=true){
  class Bot{
    constructor(){this.client={id:101};this.calls=0;}
    decodeNextAction(state){
      this.calls++;
      return new ResolvePromptAction(state.prompts[0].id,false);
    }
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){
      const prompt=this.state.prompts[0];
      prompt.result=action.result;
      if(action.result===true)this.state.players[0].hand.cards.push('DRAWN');
      return action;
    }
  }
  const active=state(yesLegal);
  const bot=new Bot(),store=new Store(active);
  const headless={runMatch:()=>{
    const chosen=bot.decodeNextAction(active);
    return store.dispatch(chosen);
  }};
  return {Bot,Store,active,headless,bot,store};
}
test('one owner-visible Crobat prompt is natively accepted as true',()=>{
  const f=fixture();
  const origDecode=f.Bot.prototype.decodeNextAction;
  const origDispatch=f.Store.prototype.dispatch;
  const originalRun=f.headless.runMatch;
  const {result,audit}=withSourceCrobatConfirmYes(
    ()=>f.headless.runMatch(),{
      SimpleTacticsAi:f.Bot,Store:f.Store,
      headless:f.headless,ResolvePromptAction
    });
  assert.equal(result.result,true);
  assert.equal(audit.eligiblePrompts,1);
  assert.equal(audit.originalBotDeclines,1);
  assert.equal(audit.nativeYesProposals,1);
  assert.equal(audit.nativeYesAccepted,1);
  assert.equal(audit.nativeYesRejected,0);
  assert.equal(audit.postDispatch.sourceHandSize,6);
  assert.equal(f.bot.calls,1);
  assert.equal(f.active.players[1].hand.cards[0],'SECRET_200');
  assert.strictEqual(f.Bot.prototype.decodeNextAction,origDecode);
  assert.strictEqual(f.Store.prototype.dispatch,origDispatch);
  assert.strictEqual(f.headless.runMatch,originalRun);
});
test('native yes veto leaves original bot false response in Store',()=>{
  const f=fixture(false);
  const {result,audit}=withSourceCrobatConfirmYes(
    ()=>f.headless.runMatch(),{
      SimpleTacticsAi:f.Bot,Store:f.Store,
      headless:f.headless,ResolvePromptAction
    });
  assert.equal(result.result,false);
  assert.equal(audit.eligiblePrompts,1);
  assert.equal(audit.nativeYesProposals,0);
  assert.equal(audit.originalPromptsDelegated,1);
});
test('wrong turn never substitutes a confirmation',()=>{
  const f=fixture();
  f.active.turn=9;
  const {result,audit}=withSourceCrobatConfirmYes(
    ()=>f.headless.runMatch(),{
      SimpleTacticsAi:f.Bot,Store:f.Store,
      headless:f.headless,ResolvePromptAction
    });
  assert.equal(result.result,false);
  assert.equal(audit.eligiblePrompts,0);
});
test('native Store failure still restores all monkeypatches',()=>{
  const f=fixture();
  const origDecode=f.Bot.prototype.decodeNextAction;
  const origDispatch=f.Store.prototype.dispatch;
  const run=f.headless.runMatch;
  f.Store.prototype.dispatch=function(){throw Error('Store abort');};
  const changedDispatch=f.Store.prototype.dispatch;
  try{
    assert.throws(()=>withSourceCrobatConfirmYes(
      ()=>f.headless.runMatch(),{
        SimpleTacticsAi:f.Bot,Store:f.Store,
        headless:f.headless,ResolvePromptAction
      }),/Store abort/);
    assert.strictEqual(f.Bot.prototype.decodeNextAction,origDecode);
    assert.strictEqual(f.Store.prototype.dispatch,changedDispatch);
    assert.strictEqual(f.headless.runMatch,run);
  }finally{
    f.Store.prototype.dispatch=origDispatch;
  }
});
