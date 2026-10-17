'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {firstActionDifference,withSourceApexObservation}=
  require('../simulation/twinleaf/rank10-apex-prize-source-pair.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class Store {
  constructor(){
    const p=(id,name)=>({id,
      active:{cards:[{fullName:name}],getPokemonCard:()=>({fullName:name})},
      bench:[],hand:{cards:[]},deck:{cards:[]},
      prizes:Array.from({length:6},()=>({cards:[]}))
    });
    this.state={phase:2,turn:3,activePlayer:0,
      players:[p(101,'Regidrago VSTAR SIT'),p(202,'Shadow Rider Calyrex V CRE')],
      prompts:[]};
  }
  dispatch(action){return action;}
}

test('observer records source copy and damage without speculative Store pollution',()=>{
  const original=Store.prototype.dispatch;
  const source=new Store();
  const observed=withSourceApexObservation(Store,()=>{
    source.dispatch(new AddPlayerAction());
    new Store().dispatch(new AddPlayerAction());
    source.state.prompts=[{id:1,playerId:101,
      constructor:{name:'ChooseAttackPrompt'},
      cards:[{attacks:[{name:'Rolling Iron'},{name:'Phantom Dive'}]}]}];
    source.dispatch(new ResolvePromptAction(1,{name:'Phantom Dive'}));
    source.state.prompts=[{id:2,playerId:101,
      constructor:{name:'PutDamagePrompt'},damage:60}];
    source.dispatch(new ResolvePromptAction(2,[{
      target:{player:1,slot:2,index:0},damage:60
    }]));
    return 'pass';
  });
  assert.equal(observed.result,'pass');
  assert.equal(observed.sourceActions.length,3);
  assert.equal(observed.copyChoices[0].selectedAttack,'Phantom Dive');
  assert.equal(observed.spreadChoices[0].resolution[0].damage,60);
  assert.match(observed.firstNormalTurnZoneDigest,/^[a-f0-9]{64}$/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('first divergence and throw restoration',()=>{
  const left=[{type:'A'},{type:'B'}];
  const right=[{type:'A'},{type:'C'}];
  assert.deepEqual(firstActionDifference(left,right),{
    index:1,control:left[1],experimental:right[1]
  });
  assert.equal(firstActionDifference(left,left),null);
  const original=Store.prototype.dispatch;
  assert.throws(()=>withSourceApexObservation(Store,()=>{throw Error('failure');}),
    /failure/);
  assert.strictEqual(Store.prototype.dispatch,original);
});
