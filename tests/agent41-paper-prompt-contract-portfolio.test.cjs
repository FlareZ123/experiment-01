'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withPaperPromptContractPortfolio,VERSION}=
  require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {runFrozenV2PaperPortfolio}=
  require('../simulation/evaluation/agent41-frozen-v2-paper-contract-portfolio.cjs');

class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt {
  constructor(id,cards,player,sourceCard){
    this.id=id;this.cards=cards;this.player=player;
    this.playerId=player.id;this.sourceCard=sourceCard;
    this.options={allowCancel:false,min:1,max:1};
    this.filter={};
  }
  validate(cards){return Array.isArray(cards)&&cards.length===1;}
}
class PutDamagePrompt {
  constructor(id,player,options,maxAllowedDamage){
    this.id=id;this.playerId=player.id;this.options=options;
    this.maxAllowedDamage=maxAllowedDamage;
  }
  validate(answer){return Array.isArray(answer);}
}
class AttachEnergyPrompt {
  constructor(id,player){
    this.id=id;this.playerId=player.id;
    this.cardList=player.active;
    this.playerType='bottom';
    this.slots=['bench'];
  }
  validate(answer){return Array.isArray(answer)&&answer.length===1;}
}
class AfterAttackEffect {
  constructor(player,attack){this.player=player;this.attack=attack;}
}
class WaitPrompt {constructor(id,player){this.id=id;this.playerId=player.id;}}
class FakeStore {
  constructor(state){this.state=state;this.mutations=0;}
  dispatch(action){
    this.mutations++;
    const p=this.state.prompts.find(x=>x.id===action.id);
    if(p)p.result=action.result;
    return {accepted:true};
  }
}
class IronThornsex {
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  reduceEffect(store,state,effect){
    state.prompts.push(new AttachEnergyPrompt(99,effect.player));
  }
}
const types={
  PlayerType:{BOTTOM_PLAYER:'bottom'},
  SlotType:{BENCH:'bench'},
  SuperType:{ENERGY:'energy'}
};
const deps={Store:FakeStore,IronThornsex,types,currentTrialId:()=> '6:0:A:champion-reference'};
function state(){
  const owner={id:0,deck:{cards:[]},hand:{cards:[]},
    active:{cards:[]},bench:[{cards:[{name:'bench pokemon'}]}]};
  const opponent={id:1,deck:{cards:[]},hand:{cards:[]},
    active:{cards:[]},bench:[]};
  return {turn:4,players:[owner,opponent],prompts:[]};
}

test('one boundary rejects an invalid Camping Gear count before Store mutation, accepts valid selection and restores',()=>{
  const d=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const r=Object.getOwnPropertyDescriptor(IronThornsex.prototype,'reduceEffect');
  const s=state(),owner=s.players[0],card={name:'card'};
  owner.deck.cards.push(card);
  s.prompts=[new ChooseCardsPrompt(1,owner.deck,owner,{fullName:'Camping Gear BST'})];
  const store=new FakeStore(s);
  const observed=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(1,[])),
      /PAPER_PROMPT_INVALID/);
    assert.equal(store.mutations,0);
    assert.equal(s.prompts[0].result,undefined);
    return store.dispatch(new ResolvePromptAction(1,[card]));
  },deps);
  assert.deepEqual(observed.result,{accepted:true});
  assert.equal(observed.audit.schema,VERSION);
  assert.equal(observed.audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(observed.audit.statusCounts.PAPER_PROMPT_VERIFIED,1);
  assert.equal(observed.audit.vetoedBeforeDispatch,1);
  assert.equal(observed.audit.byTrial['6:0:A:champion-reference'].nativeAccepted,1);
  assert.equal(observed.audit.storeCount,1);
  assert.strictEqual(FakeStore.prototype.dispatch,d.value);
  assert.strictEqual(IronThornsex.prototype.reduceEffect,r.value);
});

test('zero-cap and nonwhole packet PutDamage answers are predispatch vetoes; valid remains paper-unverified',()=>{
  const s=state(),owner=s.players[0];
  const target={player:1,slot:'bench',index:0};
  s.prompts=[new PutDamagePrompt(2,owner,{damageMultiple:20},
    [{target,damage:0}])];
  const store=new FakeStore(s);
  const audit=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(2,[
      {target,damage:20}])),/PRINTED_TARGET_ZERO_CAP/);
    assert.throws(()=>store.dispatch(new ResolvePromptAction(2,[
      {target,damage:15}])),/INVALID_PRINTED_DAMAGE_PACKET/);
    assert.equal(store.mutations,0);
    return store.dispatch(new ResolvePromptAction(2,[{target,damage:0}]));
  },deps).audit;
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,2);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(audit.nativeAccepted,1);
});

test('independent PutDamage zero target is still vetoed when native prompt validator is false',()=>{
  const s=state(),owner=s.players[0];
  const target={player:1,slot:'bench',index:0};
  const prompt=new PutDamagePrompt(8,owner,{damageMultiple:10},
    [{target,damage:0}]);
  prompt.validate=()=>false;
  s.prompts=[prompt];
  const store=new FakeStore(s);
  const audit=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(8,[
      {target,damage:10}])),/PRINTED_TARGET_ZERO_CAP/);
    assert.equal(store.mutations,0);
    return store.dispatch(new ResolvePromptAction(8,[{target,damage:0}]));
  },deps).audit;
  assert.equal(audit.vetoedBeforeDispatch,1);
  assert.equal(audit.nativeAccepted,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
});

test('positively reducer-marked original Volt Cyclone accepts only one own Active Energy moved to occupied Bench',()=>{
  const s=state(),owner=s.players[0],energy={superType:'energy'};
  owner.active.cards.push(energy);
  const store=new FakeStore(s),pokemon=new IronThornsex();
  const audit=withPaperPromptContractPortfolio(()=>{
    pokemon.reduceEffect(store,s,new AfterAttackEffect(owner,pokemon.attacks[0]));
    assert.throws(()=>store.dispatch(new ResolvePromptAction(99,[
      {card:energy,to:{player:'bottom',slot:'bench',index:5}}])),
    /recipient-not-occupied-own-bench/);
    assert.equal(store.mutations,0);
    return store.dispatch(new ResolvePromptAction(99,[
      {card:energy,to:{player:'bottom',slot:'bench',index:0}}]));
  },deps).audit;
  assert.equal(audit.markedVoltCyclonePrompts,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,1);
  assert.equal(audit.nativeAccepted,1);
});

test('Night Watch-like opponent concealed hand selections and unrelated prompts remain explicitly unverified',()=>{
  const s=state(),owner=s.players[0],opponent=s.players[1];
  opponent.hand.cards=[{name:'hidden 1'},{name:'hidden 2'}];
  const night=new ChooseCardsPrompt(3,opponent.hand,owner,null);
  night.options={allowCancel:false,isSecret:true,min:2,max:2};
  s.prompts=[night,new WaitPrompt(4,owner)];
  const store=new FakeStore(s);
  const audit=withPaperPromptContractPortfolio(()=>{
    store.dispatch(new ResolvePromptAction(3,opponent.hand.cards));
    store.dispatch(new ResolvePromptAction(4,null));
  },deps).audit;
  assert.equal(audit.nativeAccepted,2);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,2);
  assert.equal(audit.examples[0].reason,
    'paper-randomness-not-independently-sampled-or-attributed');
  assert.equal(JSON.stringify(audit).includes('hidden 1'),false);
});

test('frozen v2 wrapper records exact original root prompt counts and restores headless export',()=>{
  const fakeHeadless={
    runMatch(request){return {label:request.label};}
  };
  const original=fakeHeadless.runMatch;
  const id='6:0:A:champion-reference';
  const row={trial:{id},
    rootActionLedger:[{action:'ResolvePromptAction'}]};
  const result=runFrozenV2PaperPortfolio({
    headless:fakeHeadless,
    run:()=>{fakeHeadless.runMatch({
      label:'agent41-bilateral-v2-common-policy-development-'+id
    });return {rows:[row],attemptedComplete:true};},
    portfolio:(run,dep)=>{
      const result=run();
      return {result,audit:{byTrial:{
        [dep.currentTrialId()??id]:{nativeAccepted:1,attempted:1}
      }}};
    }
  });
  assert.strictEqual(fakeHeadless.runMatch,original);
  assert.equal(result.nativeTrialPromptCountBinding.counts[0].status,'COUNT_MATCH');
  assert.equal(result.nativeTrialPromptCountBinding.allCountsMatched,false);
  assert.equal(result.competitiveQualifiedGames,0);
});
