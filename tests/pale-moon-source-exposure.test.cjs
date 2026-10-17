'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {queuedPaleMoon,classifyPaleMoonExit}=
  require('../simulation/twinleaf/pale-moon-source-exposure.cjs');
const {observePaleMoonReplay}=
  require('../simulation/twinleaf/pale-moon-replay-observer.cjs');
class AddPlayerAction {}
class RetreatAction {}
class Store {
  constructor(player){this.state={turn:5,players:[player]};}
  dispatch(action) {
    if(action instanceof RetreatAction) {
      const p=this.state.players[0];
      const previous=p.active;
      p.active=p.bench[0];p.bench[0]=previous;
      if(action.clear) p.pendingEndOfTurnEffects=[];
    }
  }
}
function fixture(clear=false,withEffect=true){
  const active={getPokemonCard:()=>({fullName:'Koraidon ex TEF'})};
  const bench={getPokemonCard:()=>({fullName:'Regidrago VSTAR SIT'})};
  const p={active,bench:[bench],pendingEndOfTurnEffects:withEffect?
    [{type:'knock_out',attack:{name:'Pale Moon-GX'},target:active}]:[]};
  const store=new Store(p);
  const result=observePaleMoonReplay(Store,()=>{
    store.dispatch(new AddPlayerAction());
    const action=new RetreatAction();action.clear=clear;
    store.dispatch(action);
    return 'unchanged';
  });
  return result;
}
test('root queued Pale Moon is exposed by real retreat',()=>{
  const x=fixture();
  assert.equal(x.result,'unchanged');
  assert.equal(x.arms.length,1);
  assert.equal(x.arms[0].dispatches,2);
  assert.equal(x.arms[0].status,'exercised-failing');
  assert.equal(x.arms[0].events[0].step,1);
});
test('cleaned effect, absent effect, and wrapper restoration',()=>{
  assert.equal(fixture(true).arms[0].status,'exercised-cleared');
  assert.equal(fixture(false,false).arms[0].status,'not-exercised');
  assert.equal(Object.hasOwn(Store.prototype,'dispatch'),true);
});
