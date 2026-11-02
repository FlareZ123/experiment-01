'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOriginalSourcePowerReply,originalSourceGarbotoxinPowerSnapshot}=
  require('../simulation/twinleaf/agent39-rank16-original-power-reply.cjs');

const PHASE={PLAYER_TURN:2};
/** @param {string} name @param {string[]} powerNames @param {string[]} tools */
function slot(name,powerNames=[],tools=[]){
  const pokemon=name?{
    name,fullName:name+(name==='Garbodor'?' BKP':' DAA'),
    powers:powerNames.map(n=>({name:n}))
  }:null;
  return {getPokemonCard:()=>pokemon,tools:tools.map(t=>({name:t,fullName:t+' BKT'}))};
}
function owner(active,bench=[]){
  return {active,bench,stadium:{cards:[]}};
}
class FakeStore{
  constructor(state){this.state=state;this.actions=[];}
  dispatch(action){this.actions.push(action);return action;}
}
class AddPlayerAction{}
class PassTurnAction{}
/** @param {object} state */
function noPrompts(state){return {...state,prompts:[]};}
function stateAt(turn,seat,source,candidate){
  return noPrompts({turn,activePlayer:seat,phase:PHASE.PLAYER_TURN,
    players:[source,candidate]});
}

test('native abilities witnessed at next owner root with source-tooled Garbodor',()=>{
  const src=owner(slot('Trubbish'),[slot('Garbodor',['Garbotoxin'],['Float Stone'])]);
  const cand=owner(slot('Mewtwo & Mew-GX',['Perfection']),[slot('Crobat V',['Dark Asset'])]);
  const state=stateAt(1,0,src,cand);
  const store=new FakeStore(state);
  const original=FakeStore.prototype.dispatch;
  const played=withOriginalSourcePowerReply(FakeStore,0,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    state.turn=2;state.activePlayer=1;
    store.dispatch(new PassTurnAction());
    return 'native-done';
  },{GamePhase:PHASE,isBlocked:(_store,_state,_owner,pokemon)=>
    pokemon.name==='Mewtwo & Mew-GX'});
  assert.equal(played.result,'native-done');
  assert.equal(played.audit.sourceFirstTurn,1);
  assert.equal(played.audit.firstOpponentRootSeen,true);
  assert.equal(played.audit.opposingPowerSnapshot.globalTurn,2);
  assert.deepEqual(played.audit.opposingPowerSnapshot.candidatePowers.map(p=>
    [p.powerName,p.nativeBlocked]),
  [['Perfection',true],['Dark Asset',false]]);
  assert.equal(played.audit.opposingPowerSnapshot.originalSourceTooledGarbodorActive,true);
  assert.equal(played.audit.opposingPowerSnapshot.candidateBlockedPowerCount,1);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
  assert.equal(store.actions.length,3);
});

test('source going second only observes candidate root after source own turn',()=>{
  const src=owner(slot('Trubbish'));
  const cand=owner(slot('Crobat V',['Dark Asset']));
  const state=stateAt(1,0,cand,src);
  const store=new FakeStore(state);
  const p=withOriginalSourcePowerReply(FakeStore,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    state.turn=2;state.activePlayer=1;store.dispatch(new PassTurnAction());
    state.turn=3;state.activePlayer=0;store.dispatch(new PassTurnAction());
    return 'untouched';
  },{GamePhase:PHASE,isBlocked:()=>false});
  assert.equal(p.result,'untouched');
  assert.equal(p.audit.sourceFirstTurn,2);
  assert.equal(p.audit.opposingPowerSnapshot.globalTurn,3);
  assert.equal(p.audit.opposingPowerSnapshot.candidateBlockedPowerCount,0);
});

test('read-only observer does not report first opponent reply before source turn',()=>{
  const src=owner(slot('Trubbish'));
  const cand=owner(slot('Crobat V',['Dark Asset']));
  const state=stateAt(1,0,cand,src);
  const store=new FakeStore(state);
  const p=withOriginalSourcePowerReply(FakeStore,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    return 9;
  },{GamePhase:PHASE,isBlocked:()=>false});
  assert.equal(p.audit.firstOpponentRootSeen,false);
  assert.equal(p.audit.opposingPowerSnapshot,null);
  assert.equal(p.audit.sourceFirstTurn,null);
});

test('public snapshot refuses fabricated seat and reports untooled source',()=>{
  const state=stateAt(3,1,
    owner(slot('Trubbish'),[slot('Garbodor',['Garbotoxin'])]),
    owner(slot('Crobat V',['Dark Asset'])));
  assert.throws(()=>originalSourceGarbotoxinPowerSnapshot(
    {},state,2,()=>false));
  const observed=originalSourceGarbotoxinPowerSnapshot(
    {},state,0,()=>false);
  assert.equal(observed.originalSourceTooledGarbodorActive,false);
  assert.equal(observed.candidatePrintedPowerCount,1);
  assert.equal(observed.candidateBlockedPowerCount,0);
  assert.equal(observed.nativeEnginePowerQuestionOnly,true);
  assert.equal(observed.paperLegalityQualified,false);
});

test('snapshot never reads concealed candidate hand or deck identities',()=>{
  const src=owner(slot('Garbodor',['Garbotoxin'],['Float Stone']));
  const cand=owner(slot('Crobat V',['Dark Asset']));
  Object.defineProperty(cand,'hand',{get(){throw Error('hidden candidate hand read');}});
  Object.defineProperty(cand,'deck',{get(){throw Error('hidden candidate deck read');}});
  Object.defineProperty(cand,'prizes',{get(){throw Error('concealed prize read');}});
  const state=stateAt(2,1,src,cand);
  const got=originalSourceGarbotoxinPowerSnapshot({},state,0,()=>true);
  assert.equal(got.candidateBlockedPowerCount,1);
  assert.equal(got.equippedGarbodor.length,1);
});
