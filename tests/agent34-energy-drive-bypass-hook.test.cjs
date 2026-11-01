'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {installEnergyDrivePaperBypass,withEnergyDrivePaperBypass,
  withFirstLiveStoreEnergyDrivePaperBypass}=
  require('../simulation/twinleaf/agent34-energy-drive-bypass-hook.cjs');

class Store {
  constructor(){this.calls=[];}
  dispatch(action){return action;}
  reduceEffect(state,effect){
    this.calls.push({weakness:effect.ignoreWeakness,
      resistance:effect.ignoreResistance,
      embeddedWeakness:effect.attackEffect?.ignoreWeakness,
      embeddedResistance:effect.attackEffect?.ignoreResistance});
    return effect;
  }
}
class ApplyWeaknessEffect{
  constructor(attackEffect){
    this.attackEffect=attackEffect;
    this.ignoreWeakness=false;this.ignoreResistance=false;
  }
}
class ApplyResistanceEffect extends ApplyWeaknessEffect {}
const context=(printing='Tapu Lele-GX GRI',
  attack='Energy Drive')=>({
    attack:{name:attack},player:{id:101},
    source:{getPokemonCard:()=>({fullName:printing})},
    ignoreWeakness:false,ignoreResistance:false
  });
test('paper ignore modifiers only during the original Store reducer call',()=>{
  const store=new Store(),old=Store.prototype.reduceEffect;
  const ctx=context(),fx=new ApplyWeaknessEffect(ctx);
  const hook=installEnergyDrivePaperBypass({Store,rootStore:store});
  try{
    assert.strictEqual(store.reduceEffect({players:[ctx.player]},fx),fx);
    assert.deepEqual(store.calls[0],{
      weakness:true,resistance:true,
      embeddedWeakness:true,embeddedResistance:true});
    assert.equal(fx.ignoreWeakness,false);
    assert.equal(fx.ignoreResistance,false);
    assert.equal(ctx.ignoreWeakness,false);
    assert.equal(ctx.ignoreResistance,false);
    assert.equal(hook.evidence().interceptedNativeDamagePhases,1);
  }finally{hook.restore();}
  assert.strictEqual(Store.prototype.reduceEffect,old);
});
test('the native Resistance phase is also covered',()=>{
  const store=new Store();
  const fx=new ApplyResistanceEffect(context());
  const hook=installEnergyDrivePaperBypass({Store,rootStore:store});
  try{
    store.reduceEffect({players:[]},fx);
    assert.equal(store.calls[0].embeddedResistance,true);
    assert.equal(hook.evidence().events[0].effectClass,
      'ApplyResistanceEffect');
  }finally{hook.restore();}
});
test('unrelated card, attack and cloned Store remain untouched',()=>{
  const real=new Store(),clone=new Store();
  const hook=installEnergyDrivePaperBypass({Store,rootStore:real});
  try{
    real.reduceEffect({players:[]},
      new ApplyWeaknessEffect(context('Tapu Lele-GX SUM')));
    real.reduceEffect({players:[]},
      new ApplyWeaknessEffect(context('Tapu Lele-GX GRI','Tapu Cure-GX')));
    clone.reduceEffect({players:[]},
      new ApplyWeaknessEffect(context()));
    assert.deepEqual([...real.calls,...clone.calls].map(x=>x.weakness),
      [false,false,false]);
    assert.equal(hook.evidence().events.length,0);
  }finally{hook.restore();}
});
test('restore after synchronous gameplay throw',()=>{
  const root=new Store(),prior=Store.prototype.reduceEffect;
  const ctx=context();
  assert.throws(()=>withEnergyDrivePaperBypass(()=>{
    root.reduceEffect({players:[]},new ApplyWeaknessEffect(ctx));
    throw new Error('native failure');
  },{Store,rootStore:root}),/native failure/);
  assert.strictEqual(Store.prototype.reduceEffect,prior);
});

class AddPlayerAction {}
class PassTurnAction {}
test('first original AddPlayerAction Store receives exact effect correction; clone excluded',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const originalReducer=Store.prototype.reduceEffect;
  const real=new Store(),clone=new Store(),ctx=context();
  const {result,audit}=withFirstLiveStoreEnergyDrivePaperBypass(()=>{
    real.dispatch(new AddPlayerAction());
    clone.dispatch(new PassTurnAction());
    real.reduceEffect({players:[ctx.player]},new ApplyWeaknessEffect(ctx));
    clone.reduceEffect({players:[ctx.player]},new ApplyWeaknessEffect(context()));
    return 7;
  },{Store});
  assert.equal(result,7);
  assert.equal(audit.firstOriginalStoreCaptured,true);
  assert.equal(audit.originalDispatches,1);
  assert.equal(audit.auxiliaryDispatches,1);
  assert.equal(audit.printedDamageBypass.interceptedNativeDamagePhases,1);
  assert.equal(real.calls[0].embeddedWeakness,true);
  assert.equal(clone.calls[0].embeddedWeakness,false);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.strictEqual(Store.prototype.reduceEffect,originalReducer);
});
test('no fake root can produce a paper-certified effect',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const {audit}=withFirstLiveStoreEnergyDrivePaperBypass(()=>{
    new Store().dispatch(new PassTurnAction());
  },{Store});
  assert.equal(audit.firstOriginalStoreCaptured,false);
  assert.equal(audit.printedDamageBypass,null);
  assert.equal(audit.competitiveGameQualified,false);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});
