'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {observePaleMoonReplay}=
  require('../simulation/twinleaf/pale-moon-replay-observer.cjs');

class AddPlayerAction {}
class RetreatAction {}

/**
 * Two different targets with identical card print names. The root reducer
 * clears the departing Active target and introduces an unrelated orphan
 * Bench queue. This is an auditor negative control, not a legal paper action.
 */
class Store {
  constructor() {
    const active={getPokemonCard:()=>({fullName:'Koraidon ex TEF'})};
    const other={getPokemonCard:()=>({fullName:'Koraidon ex TEF'})};
    const replacement={getPokemonCard:()=>({fullName:'Regidrago VSTAR SIT'})};
    this.state={turn:5,players:[{
      active,bench:[other,replacement],pendingEndOfTurnEffects:[
        {type:'knock_out',attack:{name:'Pale Moon-GX'},target:active}
      ]
    }]};
  }

  dispatch(action) {
    if(!(action instanceof RetreatAction))return;
    const p=this.state.players[0];
    const previous=p.active;
    p.active=p.bench[1];
    p.bench[1]=previous;
    p.pendingEndOfTurnEffects=p.pendingEndOfTurnEffects.filter(
      effect=>effect.target!==previous);
    p.pendingEndOfTurnEffects.push({
      type:'knock_out',attack:{name:'Pale Moon-GX'},target:p.bench[0]
    });
  }
}

test('a cleared Active target cannot mask a different Bench target with the same printed name',()=>{
  const original=Store.prototype.dispatch;
  const root=new Store();
  const observed=observePaleMoonReplay(Store,()=>{
    root.dispatch(new AddPlayerAction());
    root.dispatch(new RetreatAction());
  });
  assert.equal(Store.prototype.dispatch,original);
  assert.equal(observed.arms.length,1);
  assert.equal(observed.arms[0].dispatches,2);
  assert.equal(observed.arms[0].status,'unresolved');
  assert.deepEqual(observed.arms[0].events.map(event=>event.finding),
    ['exercised-cleared','unresolved']);
  assert.deepEqual(observed.arms[0].events.map(event=>event.step),[1,1]);
});
