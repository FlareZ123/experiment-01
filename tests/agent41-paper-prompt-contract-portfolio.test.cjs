'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withPaperPromptContractPortfolio,physicalPromptChoiceMetadata,VERSION}=
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
  SlotType:{BENCH:'bench',ACTIVE:'active'},
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

test('foreign physical deck card is paper-invalid even when native validator falsely approves',()=>{
  const s=state(),owner=s.players[0];
  const card={name:'real deck card'},foreign={name:'foreign physical card'};
  owner.deck.cards.push(card);
  const prompt=new ChooseCardsPrompt(20,owner.deck,owner,
    {fullName:'Camping Gear BST'});
  prompt.validate=()=>true;
  s.prompts=[prompt];
  const store=new FakeStore(s);
  const audit=withPaperPromptContractPortfolio(()=>{
    // The generic physical-source guard can correctly reject the foreign
    // selection before Camping Gear's narrower printed-card guard runs.
    assert.throws(()=>store.dispatch(new ResolvePromptAction(20,[foreign])),
      /PAPER_PROMPT_INVALID:.*(SELECTED_CARD_OUTSIDE_PHYSICAL_PROMPT_SOURCE|selected-card-not-in-physical-own-deck)/);
    assert.equal(store.mutations,0);
    return store.dispatch(new ResolvePromptAction(20,[card]));
  },deps).audit;
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,1);
  assert.equal(audit.nativeAccepted,1);
});

test('real own deck search with false native validator remains unverified and separately fails closed',()=>{
  const s=state(),owner=s.players[0],card={name:'physically present'};
  owner.deck.cards.push(card);
  const prompt=new ChooseCardsPrompt(21,owner.deck,owner,
    {fullName:'Camping Gear BST'});
  prompt.validate=()=>false;
  s.prompts=[prompt];
  const store=new FakeStore(s);
  const audit=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(21,[card])),
      /NATIVE_PROMPT_PREFLIGHT_REJECTED/);
    assert.equal(store.mutations,0);
    prompt.validate=()=>true;
    return store.dispatch(new ResolvePromptAction(21,[card]));
  },deps).audit;
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,1);
  assert.equal(audit.nativePreflightVetoed,1);
  assert.equal(audit.vetoedBeforeDispatch,0);
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

test('Volt Cyclone positive physical transfer with false native validator is an unverified native veto',()=>{
  const s=state(),owner=s.players[0],energy={superType:'energy'};
  owner.active.cards.push(energy);
  const store=new FakeStore(s),pokemon=new IronThornsex();
  const audit=withPaperPromptContractPortfolio(()=>{
    pokemon.reduceEffect(store,s,new AfterAttackEffect(owner,pokemon.attacks[0]));
    const prompt=s.prompts[0];
    prompt.validate=()=>false;
    const choice=[{card:energy,to:{player:'bottom',slot:'bench',index:0}}];
    assert.throws(()=>store.dispatch(new ResolvePromptAction(99,choice)),
      /NATIVE_PROMPT_PREFLIGHT_REJECTED/);
    assert.equal(store.mutations,0);
    prompt.validate=()=>true;
    return store.dispatch(new ResolvePromptAction(99,choice));
  },deps).audit;
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
  assert.equal(audit.nativePreflightVetoed,1);
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

test('only each real AddPlayerAction Store supplies prompt denominators across two original trials',()=>{
  class AddPlayerAction {}
  let trial='first';
  const first=state(),firstOwner=first.players[0],firstCard={name:'first'};
  firstOwner.deck.cards.push(firstCard);
  first.prompts=[new ChooseCardsPrompt(10,firstOwner.deck,firstOwner,
    {fullName:'Camping Gear BST'})];
  const second=state(),secondOwner=second.players[0],
    secondCard={name:'second'};
  secondOwner.deck.cards.push(secondCard);
  second.prompts=[new ChooseCardsPrompt(11,secondOwner.deck,secondOwner,
    {fullName:'Camping Gear BST'})];
  const aux=state(),auxOwner=aux.players[0];
  aux.prompts=[new ChooseCardsPrompt(12,auxOwner.deck,auxOwner,
    {fullName:'Camping Gear BST'})];
  const liveFirst=new FakeStore(first),liveSecond=new FakeStore(second),
    auxiliary=new FakeStore(aux);
  const audit=withPaperPromptContractPortfolio(()=>{
    liveFirst.dispatch(new AddPlayerAction());
    auxiliary.dispatch(new ResolvePromptAction(12,[]));
    assert.equal(auxiliary.mutations,1,'Auxiliary answer not modified');
    assert.throws(()=>liveFirst.dispatch(new ResolvePromptAction(10,[])),
      /PAPER_PROMPT_INVALID/);
    liveFirst.dispatch(new ResolvePromptAction(10,[firstCard]));
    trial='second';
    liveSecond.dispatch(new AddPlayerAction());
    liveSecond.dispatch(new ResolvePromptAction(11,[secondCard]));
  },{...deps,requireLiveStore:true,currentTrialId:()=>trial}).audit;
  assert.equal(audit.liveSourceTrialCount,2);
  assert.equal(audit.storeCount,2);
  assert.equal(audit.auxiliaryPromptAttempts,1);
  assert.equal(audit.resolvedNativeReplies,3);
  assert.equal(audit.nativeAccepted,2);
  assert.equal(audit.vetoedBeforeDispatch,1);
  assert.equal(audit.byTrial.first.events.length,2);
  assert.equal(audit.byTrial.second.events.length,1);
  assert.equal(audit.byTrial.first.events[1].nativeAccepted,true);
  assert.equal(audit.byTrial.first.events[1].sourcePrinting,'Camping Gear BST');
  assert.equal(audit.byTrial.second.events[0].status,'PAPER_PROMPT_VERIFIED');
});

test('both Store and reducer descriptors are restored after a thrown native run',()=>{
  const beforeStore=Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch');
  const beforeReducer=Object.getOwnPropertyDescriptor(
    IronThornsex.prototype,'reduceEffect');
  assert.throws(()=>withPaperPromptContractPortfolio(()=>{
    throw new Error('intentional-native-abort');
  },deps),/intentional-native-abort/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch'),beforeStore);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    IronThornsex.prototype,'reduceEffect'),beforeReducer);
});

test('physical ChoosePokemon selection reports only actor-target geometry; duplicates and foreigners rejected',()=>{
  class ChoosePokemonPrompt{
    constructor(id,player,playerType,slots){
      this.id=id;this.playerId=player.id;this.playerType=playerType;
      this.slots=slots;this.options={min:1,max:1,allowCancel:false};
    }
    getPerspectivePlayerId(){return this.playerId;}
  }
  const s=state(),owner=s.players[0],opponent=s.players[1];
  opponent.bench.push({cards:[{name:'concealed test pokemon'}]});
  const p=new ChoosePokemonPrompt(27,owner,'bottom',['bench']);
  assert.equal(physicalPromptChoiceMetadata(
    s,p,[owner.bench[0]],types).nativeDeclaredGeometry,true);
  assert.equal(physicalPromptChoiceMetadata(
    s,p,[owner.active],types).nativeDeclaredGeometry,false);
  assert.equal(physicalPromptChoiceMetadata(
    s,p,[opponent.bench[0]],types).nativeDeclaredGeometry,false);
  const multi=new ChoosePokemonPrompt(27,owner,'any',['bench']);
  multi.options={min:2,max:2};
  assert.equal(physicalPromptChoiceMetadata(
    s,multi,[owner.bench[0],owner.bench[0]],types)
    .nativeDeclaredGeometry,false);
  const receipt=physicalPromptChoiceMetadata(
    s,p,[opponent.bench[0]],types);
  assert.equal(receipt.containsPhysicalCardIdentities,false);
  assert.equal(JSON.stringify(receipt).includes('concealed test pokemon'),false);
  assert.equal(receipt.printedPaperEffectQualified,false);
});

test('physical prize, option and order receipts distinguish true native geometry without exporting hidden choices',()=>{
  class ChoosePrizePrompt{
    constructor(owner,options){
      this.playerId=owner.id;this.options=options;
    }
    getPerspectivePlayerId(){return this.playerId;}
  }
  class SelectPrompt{
    constructor(){this.values=['hidden donor 1','hidden donor 2'];
      this.options={allowCancel:false};}
  }
  class OrderCardsPrompt{
    constructor(){this.cards={cards:[{name:'hidden A'},
      {name:'hidden B'}, {name:'hidden C'}]};this.options={};}
  }
  const s=state(),owner=s.players[0],opponent=s.players[1];
  owner.prizes=[{cards:[{name:'secret prize 1'}]},
    {cards:[{name:'secret prize 2'}]}];
  opponent.prizes=[{cards:[{name:'secret opponent prize'}]}];
  const prize=new ChoosePrizePrompt(owner,{count:1,blocked:[0]});
  const valid=physicalPromptChoiceMetadata(
    s,prize,[owner.prizes[1]],types);
  assert.equal(valid.nativeDeclaredGeometry,true);
  assert.equal(physicalPromptChoiceMetadata(
    s,prize,[owner.prizes[0]],types).nativeDeclaredGeometry,false);
  assert.equal(physicalPromptChoiceMetadata(
    s,prize,[opponent.prizes[0]],types).nativeDeclaredGeometry,false);
  const reversed=new ChoosePrizePrompt(owner,{
    count:1,useOpponentPrizes:true,blocked:[]});
  assert.equal(physicalPromptChoiceMetadata(
    s,reversed,[opponent.prizes[0]],types).nativeDeclaredGeometry,true);
  assert.equal(physicalPromptChoiceMetadata(
    s,new SelectPrompt(),1,types).nativeDeclaredGeometry,true);
  assert.equal(physicalPromptChoiceMetadata(
    s,new SelectPrompt(),2,types).nativeDeclaredGeometry,false);
  assert.equal(physicalPromptChoiceMetadata(
    s,new OrderCardsPrompt(),[2,0,1],types).nativeDeclaredGeometry,true);
  assert.equal(physicalPromptChoiceMetadata(
    s,new OrderCardsPrompt(),[2,0,0],types).nativeDeclaredGeometry,false);
  for(const receipt of [
    valid,physicalPromptChoiceMetadata(s,new SelectPrompt(),1,types),
    physicalPromptChoiceMetadata(s,new OrderCardsPrompt(),[2,0,1],types)
  ]){
    assert.equal(receipt.containsPhysicalCardIdentities,false);
    assert.equal(JSON.stringify(receipt).includes('hidden '),false);
    assert.equal(JSON.stringify(receipt).includes('secret '),false);
  }
});

test('physical geometry observer leaves unprinted native prompt decisions unverified and does not alter Store acceptance',()=>{
  class ChoosePokemonPrompt{
    constructor(owner){this.id=51;this.playerId=owner.id;
      this.playerType='bottom';this.slots=['bench'];
      this.options={min:1,max:1};}
    getPerspectivePlayerId(){return this.playerId;}
  }
  const s=state(),owner=s.players[0];
  s.prompts=[new ChoosePokemonPrompt(owner)];
  const store=new FakeStore(s);
  const audit=withPaperPromptContractPortfolio(()=>{
    return store.dispatch(new ResolvePromptAction(51,[owner.active]));
  },deps).audit;
  assert.equal(store.mutations,1);
  assert.equal(audit.nativeAccepted,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(audit.physicalChoiceShapeCounts.outsideDeclaredGeometry,1);
  assert.equal(audit.examples[0].choiceGeometry.nativeDeclaredGeometry,false);
  assert.equal(audit.examples[0].status,'PAPER_PROMPT_UNVERIFIED');
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

/** Reproduce native Store's nonthrowing stale-prompt path without mutation. */
class SilentPromptStore extends FakeStore{
  dispatch(){
    this.mutations++;
    return {accepted:true};
  }
}

for(const seat of [0,1]){
  test('unified paper prompt portfolio rejects silent nonthrowing original seat '+seat+' settlement',()=>{
    const s=state(),owner=s.players[seat],card={name:'real deck physical'};
    owner.deck.cards.push(card);
    const prompt=new ChooseCardsPrompt(77,owner.deck,owner,
      {fullName:'Camping Gear BST'});
    s.prompts=[prompt];
    const store=new SilentPromptStore(s);
    const initial=SilentPromptStore.prototype.dispatch;
    const audit=withPaperPromptContractPortfolio(()=>
      store.dispatch(new ResolvePromptAction(77,[card])),
      {...deps,Store:SilentPromptStore}).audit;
    assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,1);
    assert.equal(audit.nativeReturnedWithoutThrow,1);
    assert.equal(audit.nativePromptSettled,0);
    assert.equal(audit.nativeSilentNoop,1);
    assert.equal(audit.nativeAccepted,0);
    assert.equal(audit.stores[0].acceptedPromptReplies,0);
    assert.equal(audit.byTrial['6:0:A:champion-reference'].nativeAccepted,0);
    assert.equal(audit.events[0].nativeSilentNoop,true);
    assert.equal(audit.events[0].physicalEffectVerified,false);
    assert.equal(prompt.result,undefined);
    assert.strictEqual(SilentPromptStore.prototype.dispatch,initial);
  });
}

test('undefined submitted answer cannot make unresolved prompt appear settled',()=>{
  const s=state(),owner=s.players[0];
  s.prompts=[new WaitPrompt(80,owner)];
  const store=new SilentPromptStore(s);
  const audit=withPaperPromptContractPortfolio(()=>
    store.dispatch(new ResolvePromptAction(80,undefined)),
    {...deps,Store:SilentPromptStore}).audit;
  assert.equal(audit.nativeReturnedWithoutThrow,1);
  assert.equal(audit.nativePromptSettled,0);
  assert.equal(audit.nativeSilentNoop,1);
  assert.equal(audit.nativeAccepted,0);
  assert.equal(audit.events[0].status,'PAPER_PROMPT_UNVERIFIED');
});

test('stale source prompt ID is no-throw but cannot count native acceptance',()=>{
  const s=state(),owner=s.players[1];
  s.prompts=[new WaitPrompt(81,owner)];
  const store=new SilentPromptStore(s);
  const audit=withPaperPromptContractPortfolio(()=>
    store.dispatch(new ResolvePromptAction(999,true)),
    {...deps,Store:SilentPromptStore}).audit;
  assert.equal(audit.nativeReturnedWithoutThrow,1);
  assert.equal(audit.nativeSilentNoop,0);
  assert.equal(audit.nativeSettlementUnverified,1);
  assert.equal(audit.nativeAccepted,0);
  assert.equal(audit.events[0].nativeSettlementUnverified,true);
});
