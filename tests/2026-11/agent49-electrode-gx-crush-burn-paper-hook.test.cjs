'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  PINNED_COMMIT,PRINTING,NATIVE_ATTACK,PAPER_ATTACK,
  normalizeElectrodeGXPrintedAttack,wrapElectrodeGXCrushBurnReducer,
  installElectrodeGXCrushBurnWithDependencies
}=require('../../simulation/twinleaf/electrode-gx-crush-burn-paper-hook.cjs');

class AttackEffect{
  constructor(card,damage=30){
    this.attack=card.attacks[1];
    this.damage=damage;
  }
}
class DiscardEnergyPrompt{
  constructor(max){
    this.message='CHOOSE_ENERGIES_TO_DISCARD';
    this.options={min:1,max,allowCancel:false};
  }
}
const GameMessage={CHOOSE_ENERGIES_TO_DISCARD:'CHOOSE_ENERGIES_TO_DISCARD'};
function card(name=NATIVE_ATTACK){
  return {fullName:PRINTING,attacks:[
    {name:'Electro Ball',damage:50},
    {name,gxAttack:true,damage:30,damageCalculation:'+'}
  ]};
}
function pinnedNativeReduce(store,state,effect){
  if(effect.attack!==this.attacks[1])return state;
  const energyCount=state.owner.energyCount;
  return store.prompt(state,new DiscardEnergyPrompt(energyCount),transfers=>{
    if(transfers===null)return;
    for(const transfer of transfers){
      state.owner.moved.push(transfer.card);
      // Exact pinned CES48 source bug: each iteration adds the full count.
      const totalDiscarded=transfers.length;
      effect.damage+=totalDiscarded*50;
      state.owner.usedGX=true;
    }
    return state;
  });
}
function hostSetup(n,seat){
  const el=card();
  const replacements=new Map();
  assert.equal(normalizeElectrodeGXPrintedAttack(el,replacements),true);
  const effect=new AttackEffect(el);
  const state={owner:{seat,energyCount:n,moved:[],usedGX:false}};
  effect.player=state.owner;
  let pending=null;
  const store={prompt(next,prompt,callback){
    pending={next,prompt,callback};
    return next;
  }};
  const wrapped=wrapElectrodeGXCrushBurnReducer(
    pinnedNativeReduce,AttackEffect,DiscardEnergyPrompt,GameMessage
  );
  return {el,effect,state,store,replacements,wrapped,
    pending:()=>pending};
}

test('CES48 printed name is corrected in-place with exact source and reversible original',()=>{
  assert.equal(PINNED_COMMIT,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const a=card(),b=card(),other={fullName:'Voltorb CES',attacks:[]};
  const replacements=new Map();
  const attackIdentity=a.attacks[1];
  assert.equal(normalizeElectrodeGXPrintedAttack(a,replacements),true);
  assert.equal(a.attacks[1],attackIdentity);
  assert.equal(a.attacks[1].name,PAPER_ATTACK);
  assert.equal(a.attacks[1].gxAttack,true);
  assert.equal(a.attacks[0].name,'Electro Ball');
  assert.equal(replacements.get(a),NATIVE_ATTACK);
  assert.equal(normalizeElectrodeGXPrintedAttack(a,replacements),false);
  assert.equal(normalizeElectrodeGXPrintedAttack(other,replacements),false);
  assert.equal(normalizeElectrodeGXPrintedAttack(b,replacements),true);
  for(const [object,old] of replacements)object.attacks[1].name=old;
  assert.equal(a.attacks[1].name,NATIVE_ATTACK);
  assert.equal(b.attacks[1].name,NATIVE_ATTACK);
});

test('fixed GX multiplier counts physical Energy cards once, both seats, n=1..5',()=>{
  for(const seat of [0,1])for(const n of [1,2,3,4,5]){
    const f=hostSetup(n,seat);
    assert.equal(f.wrapped.call(f.el,f.store,f.state,f.effect),f.state);
    const pending=f.pending();
    assert.ok(pending);
    assert.equal(pending.prompt.options.max,n);
    const cards=Array.from({length:n},(_,i)=>({
      from:{player:0,slot:0,index:0},
      card:{fullName:'Lightning Energy SVE',identity:'energy-'+seat+'-'+i}
    }));
    assert.equal(pending.callback(cards),f.state);
    assert.equal(f.state.owner.moved.length,n);
    for(let i=0;i<n;i++)assert.equal(f.state.owner.moved[i],cards[i].card);
    assert.equal(f.state.owner.usedGX,true);
    assert.equal(f.effect.damage,30+50*n);
  }
});

test('control: unmodified native produces quadratic damage in the exact same fixture',()=>{
  for(const n of [2,3,5]){
    const f=hostSetup(n,0);
    pinnedNativeReduce.call(f.el,f.store,f.state,f.effect);
    const cards=Array.from({length:n},()=>({card:{name:'Psychic Energy'}}));
    f.pending().callback(cards);
    assert.equal(f.effect.damage,30+50*n*n);
    assert.notEqual(f.effect.damage,30+50*n);
  }
});

test('wrong attack, attack identity or wrong printing leaves the reducer untouched',()=>{
  const f=hostSetup(4,0);
  const wrong=new AttackEffect(f.el);
  wrong.attack={...f.el.attacks[1]};
  f.wrapped.call(f.el,f.store,f.state,wrong);
  assert.equal(f.pending(),null);
  assert.equal(wrong.damage,30);
  const wrongPrinting={...f.el,fullName:'Electrode-GX LOT'};
  const e=new AttackEffect(wrongPrinting);
  f.wrapped.call(wrongPrinting,f.store,f.state,e);
  assert.ok(f.pending(),'nonmatching printing uses the native reducer untouched');
  f.pending().callback(Array.from({length:4},()=>({card:{name:'Lightning Energy'}})));
  assert.equal(e.damage,30+50*4*4,
    'other source printing retains its own original reducer calculation');
});

test('reject null, over-max and malformed native transfer counts without moving cards',()=>{
  for(const bad of [null,Array.from({length:4},()=>({card:{name:'Energy'}}))]){
    const f=hostSetup(3,0);
    f.wrapped.call(f.el,f.store,f.state,f.effect);
    assert.throws(()=>f.pending().callback(bad),
      /Malformed CES48 physical Energy transfer count/);
    assert.equal(f.state.owner.moved.length,0);
    assert.equal(f.effect.damage,30);
  }
});

test('reject changed pinned native callback algebra rather than silently mis-score',()=>{
  const f=hostSetup(2,0);
  const upstreamChanged=function(store,state,effect){
    return store.prompt(state,new DiscardEnergyPrompt(2),transfers=>{
      effect.damage+=50*transfers.length; // hypothetical upstream fix
      return state;
    });
  };
  const wrapped=wrapElectrodeGXCrushBurnReducer(
    upstreamChanged,AttackEffect,DiscardEnergyPrompt,GameMessage
  );
  wrapped.call(f.el,f.store,f.state,f.effect);
  assert.throws(()=>f.pending().callback([{card:{}},{card:{}}]),
    /Pinned CES48 native damage equation changed/);
});

test('reject absent GX prompt and unsupported shape without partial modification',()=>{
  const f=hostSetup(2,0);
  const silent=wrapElectrodeGXCrushBurnReducer(
    (store,state)=>state,AttackEffect,DiscardEnergyPrompt,GameMessage
  );
  assert.throws(()=>silent.call(f.el,f.store,f.state,f.effect),
    /discard prompt not emitted/);
  assert.throws(()=>wrapElectrodeGXCrushBurnReducer(null,AttackEffect,
    DiscardEnergyPrompt,GameMessage),/Pinned GX reducer dependencies/);
  assert.throws(()=>normalizeElectrodeGXPrintedAttack(
    {...f.el,attacks:[{name:'Electro Ball'}]},new Map()
  ),/Unexpected pinned CES48 attack shape/);
});



test('dependency-injected install is idempotent, patches clones, and truly restores all instances',()=>{
  class FakeElectrode {
    constructor(){
      this.fullName=PRINTING;
      this.attacks=[
        {name:'Electro Ball',damage:50},
        {name:NATIVE_ATTACK,gxAttack:true,damage:30,damageCalculation:'+'}
      ];
    }
    reduceEffect(store,state,effect){
      return pinnedNativeReduce.call(this,store,state,effect);
    }
  }
  class FakeManager {
    constructor(){this.template=new FakeElectrode()}
    getAllCards(){return [this.template]}
    getCardByName(name){
      if(name!==PRINTING)return undefined;
      const clone=new FakeElectrode();
      clone.attacks=this.template.attacks.map(x=>({...x}));
      return clone;
    }
    static getInstance(){return FakeManager.single}
  }
  FakeManager.single=new FakeManager();
  const originalReducer=FakeElectrode.prototype.reduceEffect;
  const originalGet=FakeManager.prototype.getCardByName;
  const restore=installElectrodeGXCrushBurnWithDependencies({
    ElectrodeGX:FakeElectrode,CardManager:FakeManager,
    AttackEffect,DiscardEnergyPrompt,GameMessage
  });
  assert.equal(installElectrodeGXCrushBurnWithDependencies({
    ElectrodeGX:FakeElectrode,CardManager:FakeManager,
    AttackEffect,DiscardEnergyPrompt,GameMessage
  }),restore,'idempotent reinstallation must not stack wrappers');
  assert.equal(FakeManager.single.template.attacks[1].name,PAPER_ATTACK);
  const first=FakeManager.single.getCardByName(PRINTING);
  const second=FakeManager.single.getCardByName(PRINTING);
  assert.equal(first.attacks[1].name,PAPER_ATTACK);
  assert.equal(second.attacks[1].name,PAPER_ATTACK);
  assert.notEqual(first.attacks[1],FakeManager.single.template.attacks[1]);
  const effect=new AttackEffect(first);
  const state={owner:{seat:1,energyCount:3,moved:[],usedGX:false}};
  let pending=null;
  const store={prompt(next,prompt,callback){pending={prompt,callback};return next}};
  assert.equal(first.reduceEffect(store,state,effect),state);
  assert.ok(pending);
  const chosen=Array.from({length:3},(_,i)=>({card:{id:i,energy:'Lightning'}}));
  pending.callback(chosen);
  assert.equal(effect.damage,180);
  assert.equal(state.owner.moved.length,3);
  assert.equal(state.owner.usedGX,true);
  restore();
  assert.equal(FakeManager.single.template.attacks[1].name,NATIVE_ATTACK);
  assert.equal(first.attacks[1].name,NATIVE_ATTACK);
  assert.equal(second.attacks[1].name,NATIVE_ATTACK);
  assert.equal(FakeElectrode.prototype.reduceEffect,originalReducer);
  assert.equal(FakeManager.prototype.getCardByName,originalGet);
  const after=FakeManager.single.getCardByName(PRINTING);
  assert.equal(after.attacks[1].name,NATIVE_ATTACK);
  // A second independent installation/restore is safe.
  const again=installElectrodeGXCrushBurnWithDependencies({
    ElectrodeGX:FakeElectrode,CardManager:FakeManager,
    AttackEffect,DiscardEnergyPrompt,GameMessage
  });
  assert.equal(FakeManager.single.template.attacks[1].name,PAPER_ATTACK);
  again();
  assert.equal(FakeManager.single.template.attacks[1].name,NATIVE_ATTACK);
});



test('failed install on an unexpected CES48 template restores previously edited cards atomically',()=>{
  class Expected {
    constructor(){
      this.fullName=PRINTING;
      this.attacks=[{name:'Electro Ball'},{
        name:NATIVE_ATTACK,gxAttack:true,damage:30
      }];
    }
    reduceEffect(store,state,effect){return state}
  }
  class Manager {
    constructor(){this.good=new Expected();
      this.bad={fullName:PRINTING,attacks:[{name:'Electro Ball'}]}}
    getAllCards(){return [this.good,this.bad]}
    getCardByName(){return this.good}
    static getInstance(){return Manager.instance}
  }
  Manager.instance=new Manager();
  const beforeReducer=Expected.prototype.reduceEffect;
  const beforeGet=Manager.prototype.getCardByName;
  assert.throws(()=>installElectrodeGXCrushBurnWithDependencies({
    ElectrodeGX:Expected,CardManager:Manager,
    AttackEffect,DiscardEnergyPrompt,GameMessage
  }),/Unexpected pinned CES48 attack shape/);
  assert.equal(Manager.instance.good.attacks[1].name,NATIVE_ATTACK,
    'a pre-validation failure must rollback the already-modified template');
  assert.equal(Expected.prototype.reduceEffect,beforeReducer);
  assert.equal(Manager.prototype.getCardByName,beforeGet);
});



test('printed any amount permits zero transfers and still consumes GX once per game',()=>{
  for(const seat of [0,1]){
    const f=hostSetup(2,seat);
    f.effect.player=f.state.owner;
    assert.equal(f.wrapped.call(f.el,f.store,f.state,f.effect),f.state);
    assert.equal(f.pending().prompt.options.min,0);
    assert.equal(f.pending().prompt.options.max,2);
    const empty=f.pending().callback([]);
    assert.equal(empty,f.state);
    assert.equal(f.state.owner.moved.length,0);
    assert.equal(f.effect.damage,30,'the zero-discard attack retains only 30 printed damage');
    assert.equal(f.state.owner.usedGX,true,
      'zero physical transfers may never leave a GX attack available again');
  }
});
