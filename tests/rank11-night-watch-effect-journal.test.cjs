'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withNightWatchEffectJournal}=
  require('../simulation/twinleaf/rank11-night-watch-effect-journal.cjs');

const mockCard={fullName:'Absol ex',hp:210};
function setup() {
  const state={turn:4,phase:7,winner:null,logs:[],prompts:[],players:[
    {name:'research-A',hand:{cards:[1,2,3,4]},deck:{cards:[1]},discard:{cards:[]},
      prizes:[{cards:[1]}],active:{getPokemonCard:()=>mockCard,damage:0},bench:[]},
    {name:'research-B',hand:{cards:[1]},deck:{cards:[1]},discard:{cards:[]},
      prizes:[{cards:[1]}],active:{getPokemonCard:()=>mockCard,damage:0},bench:[]}
  ]};
  class Store { constructor(){this.state=state;} dispatch(action){
    if(action.type==='attack') {
      state.logs.push({message:'LOG_PLAYER_USES_ATTACK',
        params:{name:'research-B',attack:'Night Watch'}});
      state.prompts=[{constructor:{name:'ChooseCardsPrompt'},result:undefined}];
    }
    if(action.type==='resolve') {
      state.players[0].hand.cards.splice(0,2);
      state.players[0].deck.cards.push(1,2);
      state.players[0].active.damage=150;
      state.prompts=[];
    }
  }}
  return {Store,state};
}

test('record one real logged attack after prompt resolution with detached source/target counts',()=>{
  const {Store}=setup();
  const original=Store.prototype.dispatch;
  const value=withNightWatchEffectJournal(()=>{
    const real=new Store();
    real.dispatch({type:'attack'});
    real.dispatch({type:'resolve'});
    return 'ok';
  },Store);
  assert.equal(value.result,'ok');
  assert.equal(Store.prototype.dispatch,original);
  assert.equal(value.records.length,1);
  assert.equal(value.records[0].stages.length,2);
  assert.equal(value.records[0].before.players[0].hand,4);
  assert.equal(value.records[0].after.players[0].hand,2);
  assert.equal(value.records[0].after.players[0].deck,3);
  assert.equal(value.records[0].after.players[0].active.damage,150);
  assert.equal(value.qualification,false);
});

test('speculative nonroot Store dispatch cannot fabricate effects in journal',()=>{
  const {Store}=setup();
  const value=withNightWatchEffectJournal(()=>{
    const real=new Store();
    real.dispatch({type:'noop'});
    const speculative=new Store();
    speculative.dispatch({type:'attack'});
    return null;
  },Store);
  assert.deepEqual(value.records,[]);
  assert.equal(value.rootDispatches,1);
});

test('prototype is restored after a failing source replay',()=>{
  const {Store}=setup();
  const old=Store.prototype.dispatch;
  assert.throws(()=>withNightWatchEffectJournal(()=>{
    const real=new Store();real.dispatch({type:'attack'});throw new Error('source fail');
  },Store),/source fail/);
  assert.equal(Store.prototype.dispatch,old);
});
