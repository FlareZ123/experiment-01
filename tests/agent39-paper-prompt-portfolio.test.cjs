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
  },{Store,IronThornsex,types});
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
    new ResolvePromptAction(1,[{card:f.energy,to}])),{Store,IronThornsex,types});
  assert.equal(out.audit.paperUnverified,1);
  assert.equal(out.audit.paperVerifiedNativeAccepted,0);
});
