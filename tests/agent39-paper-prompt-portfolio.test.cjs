'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {verdictVoltCyclone,withPaperPromptPortfolio}=
  require('../simulation/twinleaf/agent39-paper-prompt-portfolio.cjs');

const types={PlayerType:{BOTTOM_PLAYER:1,TOP_PLAYER:2},
  SlotType:{ACTIVE:1,BENCH:2},SuperType:{ENERGY:3}};
class AttachEnergyPrompt{
  constructor(playerId,cardList){
    this.id=1;this.playerId=playerId;this.cardList=cardList;
    this.playerType=types.PlayerType.BOTTOM_PLAYER;
    this.slots=[types.SlotType.BENCH];this.result=undefined;
  }
  validate(a){return Array.isArray(a)&&a.length===1;}
}
class AfterAttackEffect{constructor(player,attack){this.player=player;this.attack=attack;}}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class OtherAction{}
class AddPlayerAction{}
class IronThornsex{
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  reduceEffect(store,state,effect){
    if(effect instanceof AfterAttackEffect&&effect.attack===this.attacks[0]){
      state.prompts.push(new AttachEnergyPrompt(effect.player.id,effect.player.active));
    }
  }
}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      prompt.result=action.result; // deliberately reproduce pinned validation bypass
      const row=action.result?.[0];
      if(row){
        const p=this.state.players.find(p=>p.id===prompt.playerId);
        p.active.cards.splice(p.active.cards.indexOf(row.card),1);
        p.bench[row.to.index].cards.push(row.card);
      }
    }
    return this.state;
  }
}
function fixture(ownerIndex=0){
  const energy={superType:types.SuperType.ENERGY};
  const owner={id:ownerIndex+10,active:{cards:[{name:'Iron Thorns ex'},energy]},
    bench:[{cards:[{name:'benched'}]},{cards:[]}]};
  const other={id:ownerIndex+20,active:{cards:[{name:'opponent'}]},bench:[]};
  return {state:{players:ownerIndex===0?[owner,other]:[other,owner],
    prompts:[],turn:5},owner,energy};
}
const to={player:types.PlayerType.BOTTOM_PLAYER,slot:types.SlotType.BENCH,index:0};

test('exact one attached Energy and occupied own Bench',()=>{
  const f=fixture(),prompt=new AttachEnergyPrompt(f.owner.id,f.owner.active);
  assert.equal(verdictVoltCyclone(f.state,prompt,[{card:f.energy,to}],types).valid,true);
  prompt.validate=()=>false;
  assert.equal(verdictVoltCyclone(f.state,prompt,[{card:f.energy,to}],types).valid,true,
    'native validation disagreement must not become a paper-invalid claim');
  for(const bad of [null,[],[{card:{superType:3},to}],
    [{card:f.energy,to:{...to,index:1}}],
    [{card:f.energy,to:{...to,player:2}}],
    [{card:f.energy,to:{...to,index:-1}}],
    [{card:f.energy,to},{card:f.energy,to}]]){
    assert.equal(verdictVoltCyclone(f.state,prompt,bad,types).valid,false);
  }
});
for(const seat of [0,1])test('Store veto before mutation and valid settlement, owner seat '+seat,()=>{
  const f=fixture(seat),store=new Store(f.state),card=new IronThornsex();
  const priorDispatch=Store.prototype.dispatch;
  const priorReduce=IronThornsex.prototype.reduceEffect;
  const result=withPaperPromptPortfolio(()=>{
    card.reduceEffect(store,f.state,new AfterAttackEffect(f.owner,card.attacks[0]));
    const original=JSON.stringify(f.state);
    assert.throws(()=>store.dispatch(new ResolvePromptAction(1,
      [{card:f.energy,to:{...to,index:1}}])),/PAPER_PROMPT_INVALID/);
    assert.equal(JSON.stringify(f.state),original);
    store.dispatch(new ResolvePromptAction(1,[{card:f.energy,to}]));
    assert.equal(f.owner.active.cards.includes(f.energy),false);
    assert.equal(f.owner.bench[0].cards.includes(f.energy),true);
    store.dispatch(new OtherAction());
    return true;
  },{Store,IronThornsex,types,liveStore:store});
  assert.equal(result.result,true);
  assert.equal(result.audit.sourceMarkedPromptCount,1);
  assert.equal(result.audit.paperInvalidVetoed,1);
  assert.equal(result.audit.paperVerifiedNativeAccepted,1);
  assert.equal(Store.prototype.dispatch,priorDispatch);
  assert.equal(IronThornsex.prototype.reduceEffect,priorReduce);
});
test('unattributed prompt remains explicitly unverified',()=>{
  const f=fixture(),store=new Store(f.state);
  f.state.prompts.push(new AttachEnergyPrompt(f.owner.id,f.owner.active));
  const out=withPaperPromptPortfolio(()=>store.dispatch(
    new ResolvePromptAction(1,[{card:f.energy,to}])),{Store,IronThornsex,types,
      liveStore:store});
  assert.equal(out.audit.paperUnverified,1);
  assert.equal(out.audit.paperVerifiedNativeAccepted,0);
});

test('live Store denominator excludes accepted auxiliary clone with same id',()=>{
  const live=fixture(0),auxiliary=fixture(1);
  const liveStore=new Store(live.state),auxStore=new Store(auxiliary.state);
  const liveCard=new IronThornsex(),auxCard=new IronThornsex();
  const result=withPaperPromptPortfolio(()=>{
    liveStore.dispatch(new AddPlayerAction());
    liveCard.reduceEffect(liveStore,live.state,
      new AfterAttackEffect(live.owner,liveCard.attacks[0]));
    auxCard.reduceEffect(auxStore,auxiliary.state,
      new AfterAttackEffect(auxiliary.owner,auxCard.attacks[0]));
    liveStore.dispatch(new ResolvePromptAction(1,[{card:live.energy,to}]));
    auxStore.dispatch(new ResolvePromptAction(1,[{card:auxiliary.energy,to}]));
    return true;
  },{Store,IronThornsex,types});
  assert.equal(result.result,true);
  assert.equal(result.audit.liveStoreObserved,true);
  assert.equal(result.audit.resolutionCount,2);
  assert.equal(result.audit.paperVerifiedNativeAccepted,1);
  assert.equal(result.audit.livePaperVerifiedNativeAccepted,1);
  assert.equal(result.audit.liveResolutionCount,1);
  assert.equal(result.audit.livePaperVerifiedNativeAccepted,1);
  assert.equal(result.audit.auxiliaryResolutionCount,1);
  assert.equal(result.audit.sourceMarkedPromptCountByScope.live,1);
  assert.equal(result.audit.sourceMarkedPromptCountByScope.auxiliary,0);
  assert.equal(result.audit.sourceMarkedPromptCount,1);
  assert.deepEqual(result.audit.events.map(e=>e.storeScope),
    ['live','auxiliary']);
  assert.deepEqual(result.audit.events.map(e=>e.status),
    ['PAPER_PROMPT_VERIFIED','AUXILIARY_NOT_SCREENED']);
});

test('speculative invalid prompt cannot veto or contaminate live paper counts',()=>{
  const live=fixture(0),aux=fixture(1);
  const realStore=new Store(live.state),clone=new Store(aux.state);
  const realCard=new IronThornsex(),cloneCard=new IronThornsex();
  const previous=Store.prototype.dispatch;
  const out=withPaperPromptPortfolio(()=>{
    cloneCard.reduceEffect(clone,aux.state,
      new AfterAttackEffect(aux.owner,cloneCard.attacks[0]));
    clone.dispatch(new ResolvePromptAction(1,[]));
    realCard.reduceEffect(realStore,live.state,
      new AfterAttackEffect(live.owner,realCard.attacks[0]));
    assert.throws(()=>realStore.dispatch(new ResolvePromptAction(1,[])),
      /PAPER_PROMPT_INVALID/);
    realStore.dispatch(new ResolvePromptAction(1,[{card:live.energy,to}]));
    return true;
  },{Store,IronThornsex,types,liveStore:realStore});
  assert.equal(out.result,true);
  assert.equal(out.audit.sourceMarkedPromptCount,1);
  assert.equal(out.audit.paperInvalidVetoed,1);
  assert.equal(out.audit.paperVerifiedNativeAccepted,1);
  assert.equal(out.audit.auxiliaryResolutionCount,1);
  assert.equal(out.audit.liveResolutionCount,2);
  assert.equal(out.audit.events[0].status,'AUXILIARY_NOT_SCREENED');
  assert.equal(aux.owner.active.cards.includes(aux.energy),true);
  assert.equal(live.owner.bench[0].cards.includes(live.energy),true);
  assert.strictEqual(Store.prototype.dispatch,previous);
});

test('missing live identity cannot certify a staged prompt',()=>{
  const f=fixture(),store=new Store(f.state),card=new IronThornsex();
  const out=withPaperPromptPortfolio(()=>{
    card.reduceEffect(store,f.state,new AfterAttackEffect(f.owner,card.attacks[0]));
    store.dispatch(new ResolvePromptAction(1,[]));
  },{Store,IronThornsex,types});
  assert.equal(out.audit.liveStoreObserved,false);
  assert.equal(out.audit.paperVerifiedNativeAccepted,0);
  assert.equal(out.audit.paperInvalidVetoed,0);
  assert.equal(out.audit.unattributedResolutionCount,1);
});

for(const seat of [0,1]){
  for(const mode of ['silent-noop','removed-unresolved','assigned-without-effect']){
    test('source Volt settlement rejects return-only '+mode+' seat '+seat,()=>{
      const f=fixture(seat);
      class FakeStore extends Store{
        dispatch(action){
          if(action instanceof ResolvePromptAction){
            const p=this.state.prompts.find(x=>x.id===action.id);
            if(mode==='removed-unresolved'){
              this.state.prompts.splice(this.state.prompts.indexOf(p),1);
            }else if(mode==='assigned-without-effect'){
              p.result=action.result;
            }
            return this.state;
          }
          return super.dispatch(action);
        }
      }
      const store=new FakeStore(f.state),card=new IronThornsex();
      const output=withPaperPromptPortfolio(()=>{
        card.reduceEffect(store,f.state,
          new AfterAttackEffect(f.owner,card.attacks[0]));
        store.dispatch(new ResolvePromptAction(1,[{card:f.energy,to}]));
        return true;
      },{Store:FakeStore,IronThornsex,types,liveStore:store});
      assert.equal(output.result,true);
      assert.equal(output.audit.liveNativeReturnedWithoutThrow,1);
      assert.equal(output.audit.paperVerifiedNativeAccepted,0);
      assert.equal(output.audit.livePaperVerifiedPhysicalEffect,0);
      assert.equal(output.audit.livePaperVerifiedWithoutPhysicalEffect,1);
      assert.equal(f.owner.active.cards.includes(f.energy),true);
      assert.equal(f.owner.bench[0].cards.includes(f.energy),false);
      assert.equal(output.audit.events[0].nativeAccepted,false);
      assert.equal(output.audit.events[0].nativeReturnedWithoutThrow,true);
      assert.equal(output.audit.events[0].physicalEffectVerified,false);
      const settled=(mode==='assigned-without-effect');
      assert.equal(output.audit.events[0].nativePromptSettled,settled);
      assert.equal(output.audit.liveNativeSilentNoop,settled?0:1);
      assert.equal(output.audit.liveNativePromptSettled,settled?1:0);
      assert.equal(output.audit.events[0].status,settled?
        'PAPER_PROMPT_SETTLED_EFFECT_UNVERIFIED':
        'PAPER_PROMPT_NATIVE_UNSETTLED');
    });
  }
}
for(const seat of [0,1])test('live Volt physical transfer positive receipts seat '+seat,()=>{
  const f=fixture(seat),store=new Store(f.state),card=new IronThornsex();
  const observed=withPaperPromptPortfolio(()=>{
    card.reduceEffect(store,f.state,
      new AfterAttackEffect(f.owner,card.attacks[0]));
    store.dispatch(new ResolvePromptAction(1,[{card:f.energy,to}]));
  },{Store,IronThornsex,types,liveStore:store});
  assert.equal(observed.audit.liveNativeReturnedWithoutThrow,1);
  assert.equal(observed.audit.liveNativePromptSettled,1);
  assert.equal(observed.audit.liveNativeSilentNoop,0);
  assert.equal(observed.audit.livePaperVerifiedPhysicalEffect,1);
  assert.equal(observed.audit.paperVerifiedNativeAccepted,1);
  assert.equal(observed.audit.events[0].nativeAccepted,true);
  assert.equal(observed.audit.events[0].physicalEffectVerified,true);
});
