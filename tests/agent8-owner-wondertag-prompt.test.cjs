'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerWonderTagPrompts}=require('../simulation/twinleaf/agent8-owner-wondertag-prompt.cjs');

const GameMessage={WANT_TO_USE_ABILITY:'use ability',CHOOSE_CARD_TO_HAND:'choose supporter'};
const types={SuperType:{TRAINER:1},TrainerType:{SUPPORTER:2}};
class ConfirmPrompt{
  constructor(playerId,message){this.playerId=playerId;this.message=message;this.id=1;}
  validate(result){return typeof result==='boolean';}
}
class ChooseCardsPrompt{
  constructor(owner){
    this.playerId=owner.id;
    this.message=GameMessage.CHOOSE_CARD_TO_HAND;
    this.cards=owner.deck;
    this.filter={superType:1,trainerType:2};
    this.options={min:0,max:1,allowCancel:false};
    this.id=2;
  }
  validate(result){return Array.isArray(result)&&result.length<=1&&
    result.every(c=>this.cards.cards.includes(c)&&c.superType===1&&c.trainerType===2);}
}
class PlayPokemonEffect{
  constructor(player,pokemonCard){this.player=player;this.pokemonCard=pokemonCard;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class TapuLeleGX{
  constructor(){this.fullName='Tapu Lele-GX GRI';}
  reduceEffect(store,state,effect){
    if(!(effect instanceof PlayPokemonEffect)||effect.pokemonCard!==this)return state;
    const owner=effect.player;
    return store.prompt(state,new ConfirmPrompt(owner.id,GameMessage.WANT_TO_USE_ABILITY),
      yes=>yes?store.prompt(state,new ChooseCardsPrompt(owner),selected=>{
        for(const c of selected)owner.deck.cards.splice(owner.deck.cards.indexOf(c),1);
        owner.hand.push(...selected);
      }):state);
  }
}
class FakeStore{
  constructor(state){this.state=state;}
  prompt(state,p,callback){p.callback=callback;state.prompts.push(p);return state;}
  dispatch(action){
    const p=this.state.prompts.find(x=>x.id===action.id&&x.result===undefined);
    if(!p||!p.validate(action.result))throw Error('invalid prompt');
    p.result=action.result;p.callback(action.result);
    return this.state;
  }
}
class FakeAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'fallback'};}
}
const dependencies={SimpleTacticsAi:FakeAi,Store:FakeStore,TapuLeleGX,
  PlayPokemonEffect,ConfirmPrompt,ChooseCardsPrompt,ResolvePromptAction,
  GameMessage,types,assertValidPromptAction:(state,action)=>{
    const p=state.prompts.find(p=>p.id===action.id&&p.result===undefined);
    assert.ok(p&&p.validate(action.result));
  }};
/** @param {number} seat @param {object[]} deckCards */
function fixture(seat,deckCards){
  const players=[0,1].map(id=>({id,deck:{cards:[]},hand:[]}));
  players[seat].deck.cards.push(...deckCards);
  const state={players,prompts:[],turn:2};
  const store=new FakeStore(state),ai=new FakeAi(seat),lele=new TapuLeleGX();
  return {players,state,store,ai,lele};
}
function supporter(name){return {name,fullName:name,superType:1,trainerType:2};}
for(const seat of [0,1]){
  test('seat '+seat+' confirms genuine Wonder Tag and chooses own Supporter',()=>{
    const other={fullName:'Basic Grass Energy',superType:3};
    const wanted=supporter('Guzma & Hala');
    const f=fixture(seat,[other,wanted]);
    const originalBot=FakeAi.prototype.decodeNextAction;
    const originalLele=TapuLeleGX.prototype.reduceEffect;
    const {audit}=withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(f.store,f.state,
        new PlayPokemonEffect(f.players[seat],f.lele));
      const a=f.ai.decodeNextAction(f.state);
      assert.ok(a instanceof ResolvePromptAction);
      assert.equal(a.result,true);
      f.store.dispatch(a);
      const b=f.ai.decodeNextAction(f.state);
      assert.ok(b instanceof ResolvePromptAction);
      assert.deepEqual(b.result,[wanted]);
      f.store.dispatch(b);
      assert.deepEqual(f.players[seat].hand,[wanted]);
      assert.equal(f.players[1-seat].deck.cards.length,0);
    },dependencies);
    assert.equal(audit.confirmed,1);
    assert.equal(audit.selectedSupporters,1);
    assert.equal(audit.nativeAccepted,2);
    assert.equal(audit.bySeat[seat],2);
    assert.equal(FakeAi.prototype.decodeNextAction,originalBot);
    assert.equal(TapuLeleGX.prototype.reduceEffect,originalLele);
  });
  test('seat '+seat+' accepts empty legal Supporter search',()=>{
    const f=fixture(seat,[{fullName:'Energy',superType:3}]);
    const {audit}=withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(f.store,f.state,
        new PlayPokemonEffect(f.players[seat],f.lele));
      f.store.dispatch(f.ai.decodeNextAction(f.state));
      const b=f.ai.decodeNextAction(f.state);
      assert.deepEqual(b.result,[]);
      f.store.dispatch(b);
    },dependencies);
    assert.equal(audit.emptySearches,1);
    assert.equal(audit.selectedSupporters,0);
  });
}
test('unrelated ConfirmPrompt delegates and never accesses hidden deck',()=>{
  const f=fixture(0,[supporter('Arven')]);
  f.state.prompts.push(new ConfirmPrompt(0,GameMessage.WANT_TO_USE_ABILITY));
  const {audit}=withOwnerWonderTagPrompts(()=>{
    assert.deepEqual(f.ai.decodeNextAction(f.state),{kind:'fallback'});
  },dependencies);
  assert.equal(audit.unrelatedDelegated,1);
  assert.equal(audit.confirmed,0);
});


test('affirmative Wonder Tag decision is independent of both hidden decks',()=>{
  const supporterA=supporter('Guzma & Hala');
  const worlds=[];
  for(const secret of [0,1]){
    const f=fixture(0,[supporterA,{fullName:'Basic Grass Energy',superType:3}]);
    f.players[1].deck.cards=[{privateName:secret?'Dragon':'Psychic'},
      {privateName:secret?'Darkness':'Water'}];
    const {result,audit}=withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(f.store,f.state,
        new PlayPokemonEffect(f.players[0],f.lele));
      const confirm=f.ai.decodeNextAction(f.state);
      assert.equal(confirm.result,true);
      f.store.dispatch(confirm);
      const search=f.ai.decodeNextAction(f.state);
      assert.deepEqual(search.result,[supporterA]);
      f.store.dispatch(search);
      return {confirm:confirm.result,chosen:search.result.map(c=>c.fullName)};
    },dependencies);
    worlds.push({result,audit:{confirmed:audit.confirmed,
      selectedSupporters:audit.selectedSupporters,bySeat:audit.bySeat}});
  }
  assert.deepEqual(worlds[0],worlds[1]);
});
test('exceptions restore all patched prototypes',()=>{
  const previous=[FakeAi.prototype.decodeNextAction,
    FakeStore.prototype.dispatch,TapuLeleGX.prototype.reduceEffect];
  assert.throws(()=>withOwnerWonderTagPrompts(()=>{
    throw new Error('controlled aborted native match');
  },dependencies),/controlled aborted native match/);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,previous[0]);
  assert.strictEqual(FakeStore.prototype.dispatch,previous[1]);
  assert.strictEqual(TapuLeleGX.prototype.reduceEffect,previous[2]);
});


test('owner-confirm resolution bypasses an unrelated earlier opponent prompt',()=>{
  const f=fixture(0,[supporter('Carmine')]);
  const opponentPrompt=new ConfirmPrompt(1,GameMessage.WANT_TO_USE_ABILITY);
  opponentPrompt.id=99;
  f.state.prompts.push(opponentPrompt);
  const {audit}=withOwnerWonderTagPrompts(()=>{
    f.lele.reduceEffect(f.store,f.state,
      new PlayPokemonEffect(f.players[0],f.lele));
    const ownerAction=f.ai.decodeNextAction(f.state);
    assert.equal(ownerAction.id,1);
    assert.equal(ownerAction.result,true);
    f.store.dispatch(ownerAction);
    const searchAction=f.ai.decodeNextAction(f.state);
    assert.equal(searchAction.id,2);
    assert.deepEqual(searchAction.result.map(c=>c.fullName),['Carmine']);
    f.store.dispatch(searchAction);
    assert.equal(opponentPrompt.result,undefined);
  },dependencies);
  assert.equal(audit.nativeAccepted,2);
});


test('optional owner-only strategy callback may select a different legal supporter',()=>{
  const first=supporter('Carmine'),second=supporter('Marnie');
  const f=fixture(1,[first,second]);
  const seen=[];
  const {audit}=withOwnerWonderTagPrompts(()=>{
    f.lele.reduceEffect(f.store,f.state,
      new PlayPokemonEffect(f.players[1],f.lele));
    f.store.dispatch(f.ai.decodeNextAction(f.state));
    const action=f.ai.decodeNextAction(f.state);
    assert.deepEqual(action.result,[second]);
    f.store.dispatch(action);
    assert.deepEqual(f.players[1].hand,[second]);
  },{...dependencies,selectSupporterIndex:context=>{
    seen.push(context);
    assert.equal(Object.isFrozen(context),true);
    assert.equal(Object.isFrozen(context.choices),true);
    assert.equal(context.globalTurn,2);
    assert.deepEqual(context.choices.map(c=>c.name),['Carmine','Marnie']);
    assert.deepEqual(Object.keys(context).sort(),['choices','globalTurn']);
    return 1;
  }});
  assert.equal(seen.length,1);
  assert.equal(audit.customSelectorInstalled,true);
  assert.equal(audit.selectedSupporters,1);
});
test('unoffered custom Supporter index fails closed before Store mutation',()=>{
  const f=fixture(0,[supporter('Carmine')]);
  const original=FakeAi.prototype.decodeNextAction;
  assert.throws(()=>withOwnerWonderTagPrompts(()=>{
    f.lele.reduceEffect(f.store,f.state,
      new PlayPokemonEffect(f.players[0],f.lele));
    f.store.dispatch(f.ai.decodeNextAction(f.state));
    f.ai.decodeNextAction(f.state);
  },{...dependencies,selectSupporterIndex:()=>2}),
  /unoffered index/);
  assert.equal(FakeAi.prototype.decodeNextAction,original);
  assert.equal(f.players[0].hand.length,0);
  assert.equal(f.players[0].deck.cards.length,1);
});


/** Simulate the existing generic owner-modal policy that declines Confirm. */
function withGenericModalDecline(run){
  const original=Object.getOwnPropertyDescriptor(FakeAi.prototype,
    'decodeNextAction');
  function genericModal(state){
    const prompt=state.prompts.find(p=>p.playerId===this.client.id&&
      p.result===undefined);
    if(prompt instanceof ConfirmPrompt&&
       prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      return new ResolvePromptAction(prompt.id,false);
    }
    return original.value.call(this,state);
  }
  Object.defineProperty(FakeAi.prototype,'decodeNextAction',{
    ...original,value:genericModal
  });
  try{return run();}
  finally{
    assert.strictEqual(FakeAi.prototype.decodeNextAction,genericModal);
    Object.defineProperty(FakeAi.prototype,'decodeNextAction',original);
  }
}
test('specific Wonder Tag installed after generic modal overrides false with true',()=>{
  const f=fixture(0,[supporter('Carmine')]);
  const original=FakeAi.prototype.decodeNextAction;
  const selected=withGenericModalDecline(()=>
    withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(f.store,f.state,
        new PlayPokemonEffect(f.players[0],f.lele));
      const first=f.ai.decodeNextAction(f.state);
      assert.equal(first.result,true);
      f.store.dispatch(first);
      f.store.dispatch(f.ai.decodeNextAction(f.state));
      assert.equal(f.players[0].hand.length,1);
    },dependencies));
  assert.equal(selected.audit.confirmed,1);
  assert.equal(selected.audit.selectedSupporters,1);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});
test('generic modal installed after specific Wonder Tag shadows true search',()=>{
  const f=fixture(1,[supporter('Marnie')]);
  const selected=withOwnerWonderTagPrompts(()=>withGenericModalDecline(()=>{
    f.lele.reduceEffect(f.store,f.state,
      new PlayPokemonEffect(f.players[1],f.lele));
    const first=f.ai.decodeNextAction(f.state);
    assert.equal(first.result,false);
    f.store.dispatch(first);
    assert.equal(f.state.prompts.length,1);
    assert.equal(f.players[1].hand.length,0);
  }),dependencies);
  assert.equal(selected.audit.confirmOffers,1);
  assert.equal(selected.audit.confirmed,0);
});


class SilentPromptStore extends FakeStore{
  dispatch(){return this.state;}
}
test('silent native prompt no-op fails closed before being counted accepted',()=>{
  const f=fixture(0,[supporter('Carmine')]);
  const silent=new SilentPromptStore(f.state);
  let thrown;
  try{
    withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(silent,f.state,
        new PlayPokemonEffect(f.players[0],f.lele));
      silent.dispatch(f.ai.decodeNextAction(f.state));
    },{...dependencies,Store:SilentPromptStore});
  }catch(error){thrown=error;}
  assert.match(thrown?.message??'',/without resolving the prompt/);
  assert.equal(thrown.agent8WonderTagAudit.nativeUnsettled,1);
  assert.equal(thrown.agent8WonderTagAudit.nativeAccepted,0);
  assert.equal(f.state.prompts[0].result,undefined);
  assert.equal(f.players[0].hand.length,0);
});
class MissingTransferStore extends FakeStore{
  dispatch(action){
    if(action?.id===2){
      const p=this.state.prompts.find(p=>p.id===2&&p.result===undefined);
      assert.ok(p);
      assert.ok(p.validate(action.result));
      p.result=action.result;
      return this.state;
    }
    return super.dispatch(action);
  }
}
test('settled search without physical Supporter movement fails closed',()=>{
  const f=fixture(1,[supporter('Marnie')]);
  const bad=new MissingTransferStore(f.state);
  let thrown;
  try{
    withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(bad,f.state,
        new PlayPokemonEffect(f.players[1],f.lele));
      bad.dispatch(f.ai.decodeNextAction(f.state));
      bad.dispatch(f.ai.decodeNextAction(f.state));
    },{...dependencies,Store:MissingTransferStore});
  }catch(error){thrown=error;}
  assert.match(thrown?.message??'',/did not transfer the exact chosen Supporter/);
  assert.equal(thrown.agent8WonderTagAudit.nativeCustodyFailures,1);
  assert.equal(thrown.agent8WonderTagAudit.nativeAccepted,1);
  assert.equal(thrown.agent8WonderTagAudit.selectedSupporters,0);
  assert.equal(f.players[1].hand.length,0);
  assert.equal(f.players[1].deck.cards.length,1);
});


class MissingFollowupStore extends FakeStore{
  dispatch(action){
    if(action?.id===1){
      const p=this.state.prompts.find(p=>p.id===1&&p.result===undefined);
      assert.ok(p);
      assert.ok(p.validate(action.result));
      p.result=action.result;
      return this.state;
    }
    return super.dispatch(action);
  }
}
test('settled Wonder Tag confirmation without native owner-deck search fails closed',()=>{
  const f=fixture(0,[supporter('Guzma')]);
  const bad=new MissingFollowupStore(f.state);
  let thrown;
  try{
    withOwnerWonderTagPrompts(()=>{
      f.lele.reduceEffect(bad,f.state,
        new PlayPokemonEffect(f.players[0],f.lele));
      bad.dispatch(f.ai.decodeNextAction(f.state));
    },{...dependencies,Store:MissingFollowupStore});
  }catch(error){thrown=error;}
  assert.match(thrown?.message??'',/without owner Supporter-search followup/);
  assert.equal(thrown.agent8WonderTagAudit.nativeMissingSearchFollowup,1);
  assert.equal(thrown.agent8WonderTagAudit.confirmed,0);
  assert.equal(thrown.agent8WonderTagAudit.nativeAccepted,0);
  assert.equal(f.state.prompts.length,1);
});
