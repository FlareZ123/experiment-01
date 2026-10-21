'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {installTerminalAttackKoBeforeEndTurnHook}=
  require('../simulation/twinleaf/terminal-attack-ko-before-endturn-hook.cjs');

class EndTurnEffect{constructor(player){this.player=player;}}
class CheckHpEffect{
  constructor(player,target){this.player=player;this.hp=target.getPokemonCard().hp+target.hpBonus;}
}
const GamePhase={ATTACK:3,FINISHED:5};

/** @param {string} name @param {number} hp @param {number} damage @param {number} reserve */
function makePlayer(name,hp,damage,reserve=0){
  return {
    id:name,
    active:{damage,hpBonus:0,getPokemonCard:()=>({name,hp})},
    bench:Array.from({length:5},(_,index)=>({
      getPokemonCard:()=>index<reserve?({name:'reserve'}):null
    })),
    prizes:Array.from({length:6},()=>({cards:[{secret:'do not inspect'}]})),
    pendingEndOfTurnEffects:[]
  };
}
function setup(defenderDamage,defenderReserve=0){
  class Store{
    reduceEffect(state,effect){
      if(effect instanceof EndTurnEffect)state.unpatchedEnds++;
      return state;
    }
    hasPrompts(){return false;}
  }
  const source=makePlayer('source',230,0);
  const defender=makePlayer('defender',270,defenderDamage,defenderReserve);
  source.pendingEndOfTurnEffects.push({type:'knock_out',attack:{name:'Pale Moon-GX'}});
  const state={phase:GamePhase.ATTACK,turn:4,players:[defender,source],unpatchedEnds:0};
  const real=new Store(),speculative=new Store();
  let checked=0;
  const hook=installTerminalAttackKoBeforeEndTurnHook({
    Store,EndTurnEffect,CheckHpEffect,GamePhase,rootStore:real,
    checkState(_store,s){checked++;s.phase=GamePhase.FINISHED;return s;}
  });
  return {state,real,speculative,source,hook,getChecked:()=>checked};
}

test('fatal damage to last defender finishes before delayed end-turn KO',()=>{
  const f=setup(280);
  try{
    const out=f.real.reduceEffect(f.state,new EndTurnEffect(f.source));
    assert.equal(out.phase,GamePhase.FINISHED);
    assert.equal(out.unpatchedEnds,0);
    assert.equal(f.getChecked(),1);
    assert.equal(f.hook.evidence().possible,1);
    assert.equal(f.hook.evidence().events[0].defenderDamage,280);
    assert.equal(f.hook.evidence().events[0].defenderEffectiveHp,270);
    assert.equal(f.hook.evidence().events[0].nativeDelayedEffects[0].attack,'Pale Moon-GX');
    assert.equal(JSON.stringify(f.hook.evidence()).includes('do not inspect'),false);
  }finally{f.hook.restore();}
});

test('damage below HP or a surviving Bench skips correction',()=>{
  for(const [damage,reserve] of [[140,0],[280,1]]){
    const f=setup(damage,reserve);
    try{
      f.real.reduceEffect(f.state,new EndTurnEffect(f.source));
      assert.equal(f.state.unpatchedEnds,1);
      assert.equal(f.state.phase,GamePhase.ATTACK);
      assert.equal(f.getChecked(),0);
      assert.equal(f.hook.evidence().possible,0);
    }finally{f.hook.restore();}
  }
});

test('speculative Store remains unchanged and restoration reinstates native reducer',()=>{
  const f=setup(280);
  const {real,speculative,source,state}=f;
  try{
    speculative.reduceEffect(state,new EndTurnEffect(source));
    assert.equal(state.unpatchedEnds,1);
    assert.equal(f.getChecked(),0);
  }finally{f.hook.restore();}
  real.reduceEffect(state,new EndTurnEffect(source));
  assert.equal(state.unpatchedEnds,2);
});
