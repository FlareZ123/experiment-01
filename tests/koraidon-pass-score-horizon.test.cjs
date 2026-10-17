'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withKoraidonPassScore}=require('../simulation/twinleaf/koraidon-pass-score-horizon.cjs');
class AddPlayerAction {}
class PassTurnAction {constructor(id){this.clientId=id;}}
class Store {constructor(state){this.state=state;}dispatch(action){return action.constructor.name;}}
class AttackTactic {
  constructor(){this.options={scores:{tactics:{attackBonus:100}}};this.calls=[];}
  useTactic(){return undefined;}
  getStateScore(){return -99;}
  evaluateAction(_state,_id,action){this.calls.push(action.constructor.name);return -2130;}
}
const fixture=()=>({turn:5,phase:2,activePlayer:1,players:[]});
const player=name=>({id:202,active:{
  getPokemonCard:()=>({fullName:name}),
  energies:{cards:[{fullName:'Double Dragon Energy ROS'}]}
}});
test('real Store decision probes the implicit Pass exactly once',()=>{
  const s=fixture(),store=new Store(s),tactic=new AttackTactic();
  const old=Store.prototype.dispatch;
  const r=withKoraidonPassScore({Store,AttackTactic,PassTurnAction},()=>{
    store.dispatch(new AddPlayerAction());
    return tactic.useTactic(s,player('Koraidon ex TEF'));
  });
  assert.equal(r.result,undefined);
  assert.deepEqual(tactic.calls,['PassTurnAction']);
  assert.equal(r.observations[0].hypotheticalEndTurnPassScore,-2130);
  assert.equal(r.observations[0].attackSelectionThreshold,-199);
  assert.equal(r.observations[0].liveStateChangedDuringProbe,false);
  assert.equal(Store.prototype.dispatch,old);
});
test('the genuine Store identity and named Active gate prevent unrelated probes',()=>{
  const s=fixture(),store=new Store(s),tactic=new AttackTactic();
  const original=AttackTactic.prototype.useTactic;
  const result=withKoraidonPassScore({Store,AttackTactic,PassTurnAction},()=>{
    store.dispatch(new AddPlayerAction());
    tactic.useTactic({...s},player('Koraidon ex TEF'));
    return tactic.useTactic(s,player('Regidrago V SIT'));
  });
  assert.deepEqual(result.observations,[]);
  assert.deepEqual(tactic.calls,[]);
  assert.equal(AttackTactic.prototype.useTactic,original);
});
