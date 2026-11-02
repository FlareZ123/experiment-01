'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SUPPORTERS,captureSourcePass,withSourcePassHandCensus}=
  require('../simulation/twinleaf/agent9-rank5-pass-hand-census.cjs');

class AddPlayerAction{}
class PassTurnAction{
  /** @param {number} clientId */
  constructor(clientId){this.clientId=clientId;}
}
class PlayCardAction{
  /** @param {number} clientId */
  constructor(clientId){this.clientId=clientId;}
}
const GamePhase={PLAYER_TURN:'PLAYER_TURN'};
function slot(name,energies=[]){
  return {getPokemonCard(){return {fullName:name};},
    energies:{cards:energies.map(fullName=>({fullName}))},
    cannotAttackNextTurn:true,cannotAttackNextTurnPending:false};
}
function fixture(){
  const source={id:101,hand:{cards:[
    {fullName:'Guzma BUS'}, {fullName:'Marnie SSH'},
    {fullName:'Double Colorless Energy SUM'},
    {fullName:'Float Stone BKT'}]},
  active:slot('Mew VMAX FST',['Double Colorless Energy SUM']),
  bench:[slot('Genesect V FST'),slot('Crobat V DAA')],
  supporter:{cards:[]},supporterTurn:0,retreatedTurn:52};
  const opponent={id:102,hand:{cards:[{fullName:'Guzma BUS'}]},
    active:slot('Trevenant & Dusknoir-GX UNM'),
    bench:[],supporter:{cards:[]},supporterTurn:0};
  return {state:{players:[opponent,source],activePlayer:1,
    phase:GamePhase.PLAYER_TURN,turn:54,prompts:[]},source,opponent};
}
test('registered source Pass captures exact held Supporter and cooldown facts',()=>{
  const x=fixture(),v=captureSourcePass(x.state,
    new PassTurnAction(x.source.id),1,[1],GamePhase);
  assert.ok(SUPPORTERS.has('Pokémon Ranger STS'));
  assert.deepEqual(v.heldSupporterPrintings,['Guzma BUS','Marnie SSH']);
  assert.equal(v.hasHeldGuzma,true);
  assert.equal(v.hasHeldSupporter,true);
  assert.equal(v.sourceActiveCannotAttackNextTurn,true);
  assert.equal(v.sourceBench[0].pokemon,'Genesect V FST');
  assert.equal(v.ownerSupporterTurn,0);
  assert.equal(v.nativeGameOrdinal,1);
  assert.equal(v.sourceSeat,1);
});

test('never read and report opponent private hand as source',()=>{
  const x=fixture();
  assert.equal(captureSourcePass(x.state,
    new PassTurnAction(x.opponent.id),1,[1],GamePhase),null);
  assert.equal(captureSourcePass(x.state,
    new PassTurnAction(x.source.id),1,[0],GamePhase),null);
  assert.equal(captureSourcePass(x.state,
    new PassTurnAction(x.source.id),2,[1],GamePhase),null);
});

test('non-Pass, wrong phase or pending prompt is excluded',()=>{
  const x=fixture();
  assert.equal(captureSourcePass(x.state,new PlayCardAction(x.source.id),
    1,[1],GamePhase),null);
  x.state.phase='ATTACK';
  assert.equal(captureSourcePass(x.state,new PassTurnAction(x.source.id),
    1,[1],GamePhase),null);
  x.state.phase=GamePhase.PLAYER_TURN;
  x.state.prompts.push({result:undefined});
  assert.equal(captureSourcePass(x.state,new PassTurnAction(x.source.id),
    1,[1],GamePhase),null);
});

test('observes actual Store Pass roots and leaves all action choices untouched',()=>{
  const x=fixture();
  class Store{
    constructor(state){this.state=state;this.actions=[];}
    dispatch(action){this.actions.push(action.constructor.name);return action;}
  }
  const store=new Store(x.state);
  const desc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const output=withSourcePassHandCensus(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction(x.source.id));
    store.dispatch(new PlayCardAction(x.source.id));
    store.dispatch(new PassTurnAction(x.source.id));
    return 'completed';
  },{Store,GamePhase,sourceSeatByGame:[1]});
  assert.equal(output.result,'completed');
  assert.deepEqual(store.actions,[
    'AddPlayerAction','PassTurnAction','PlayCardAction','PassTurnAction']);
  assert.equal(output.audit.actualNativeGamesStarted,1);
  assert.equal(output.audit.matchedToRegistration,true);
  assert.equal(output.audit.sourceNativePassRoots,2);
  assert.equal(output.audit.sourcePassesHoldingPrintedSupporter,2);
  assert.equal(output.audit.sourcePassesHoldingGuzma,2);
  assert.equal(output.audit.records.length,2);
  assert.equal(output.audit.competitiveQualifiedGames,0);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),desc);
});

test('candidate Pass roots and extra native Store instances stay outside source data',()=>{
  const x=fixture();
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){return action;}
  }
  const s1=new Store(x.state),s2=new Store(x.state);
  const o=withSourcePassHandCensus(()=>{
    s1.dispatch(new AddPlayerAction());
    s1.dispatch(new PassTurnAction(x.opponent.id));
    s2.dispatch(new AddPlayerAction());
    s2.dispatch(new PassTurnAction(x.source.id));
  },{Store,GamePhase,sourceSeatByGame:[1]});
  assert.equal(o.audit.actualNativeGamesStarted,2);
  assert.equal(o.audit.matchedToRegistration,false);
  assert.equal(o.audit.sourceNativePassRoots,0);
  assert.equal(o.audit.records.length,0);
});
