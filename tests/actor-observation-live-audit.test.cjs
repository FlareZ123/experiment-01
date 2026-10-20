'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {obscureHiddenIdentities,withActualStoreActorObservation}=
  require('../simulation/twinleaf/actor-observation-live-audit.cjs');

/** @param {string} fullName */
function card(fullName){
  return {fullName,name:fullName,hp:200,
    attacks:[{name:'Attack',cost:['PSYCHIC']}],powers:[]};
}
/** @param {string} fullName */
function slot(fullName){
  const c=card(fullName);
  return {cards:[c],getPokemonCard:()=>c,damage:0,
    energies:{cards:[]},tools:[]};
}
/** @param {number} id @param {string} label */
function player(id,label){
  return {id,active:slot(label),bench:[],
    hand:{cards:[card('Known hand '+label)]},
    deck:{cards:[card('Secret deck '+label)]},
    prizes:[{cards:[card('Secret prize '+label)]}],
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,usedVSTAR:false};
}
function state(){return {players:[player(101,'Alpha'),player(202,'Beta')],
  turn:3,phase:5,activePlayer:0,prompts:[]};}

test('opaque shadow preserves genuine own search-prompt reference and view parity',()=>{
  const s=state();
  s.prompts=[{constructor:{name:'ChooseCardsPrompt'},playerId:202,
    cards:s.players[1].deck,result:undefined}];
  const masked=obscureHiddenIdentities(s,1);
  assert.notStrictEqual(masked,s);
  assert.strictEqual(masked.prompts[0].cards,masked.players[1].deck);
  assert.equal(masked.players[0].hand.cards.length,1);
  assert.equal(masked.players[0].hand.cards.map,undefined);
  assert.deepEqual(actorObservation(s,1),actorObservation(masked,1));
  assert.strictEqual(masked.players[1].hand,s.players[1].hand);
});

test('Store observer leaves decisions intact and ignores speculative unregistered Stores',()=>{
  class AddPlayerAction {}
  class PlayCardAction {}
  class MockStore {
    constructor(s){this.state=s;this.received=[];}
    dispatch(action){this.received.push(action.constructor.name);return true;}
  }
  const original=MockStore.prototype.dispatch;
  const originalState=state();
  const run=()=>{
    const genuine=new MockStore(originalState);
    genuine.dispatch(new AddPlayerAction());
    genuine.dispatch(new AddPlayerAction());
    genuine.dispatch(new PlayCardAction());
    const speculative=new MockStore(state());
    speculative.dispatch(new PlayCardAction());
    assert.deepEqual(genuine.received,
      ['AddPlayerAction','AddPlayerAction','PlayCardAction']);
    return {accepted:true};
  };
  const {result,audit}=withActualStoreActorObservation(MockStore,run);
  assert.deepEqual(result,{accepted:true});
  assert.equal(audit.games,1);
  assert.equal(audit.actualRootDispatches,3);
  assert.equal(audit.observedActorDecisions,3);
  assert.equal(audit.allShadowParityChecksPassed,true);
  assert.strictEqual(MockStore.prototype.dispatch,original);
  assert.deepEqual(originalState.players[0].deck.cards.map(x=>x.fullName),
    ['Secret deck Alpha']);
});

test('observer restores the original dispatch prototype after rejected game',()=>{
  class AddPlayerAction {}
  class Store {
    constructor(){this.state=state();}
    dispatch(){return true;}
  }
  const original=Store.prototype.dispatch;
  assert.throws(()=>withActualStoreActorObservation(Store,()=>{
    new Store().dispatch(new AddPlayerAction());
    throw new Error('simulated native reducer failure');
  }),/simulated native reducer failure/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('first native owner K1 is captured once, after authenticated deck prompt',()=>{
  class AddPlayerAction {}
  class ResolvePromptAction {}
  class Store {
    constructor(s){this.state=s;}
    dispatch(){return true;}
  }
  const s=state();
  s.players[0].deck.cards=[
    card('Mewtwo & Mew-GX UNM'),
    card('Mewtwo & Mew-GX UNM'),
    card('Psychic Energy SVE')];
  const prompt={constructor:{name:'ChooseCardsPrompt'},id:17,
    playerId:s.players[0].id,cards:s.players[0].deck,
    result:undefined,
    validate:chosen=>chosen.length===1&&
      chosen[0].fullName==='Mewtwo & Mew-GX UNM'};
  const {audit}=withActualStoreActorObservation(Store,()=>{
    const native=new Store(s);
    native.dispatch(new AddPlayerAction());
    assert.equal(s.prompts.length,0,'Unsearched K0 owner cannot inspect deck');
    s.prompts=[prompt];
    native.dispatch(new ResolvePromptAction());
    native.dispatch(new ResolvePromptAction());
    return true;
  },{captureFirstOwnerK1:true});
  assert.equal(audit.firstOwnerK1Searches.length,1);
  const record=audit.firstOwnerK1Searches[0];
  assert.equal(record.turn,3);
  assert.equal(record.game,1);
  assert.equal(record.seat,0);
  assert.equal(record.targetCounts['Mewtwo & Mew-GX UNM'],2);
  assert.equal(record.legalSingletonChoice['Mewtwo & Mew-GX UNM'],true);
  assert.equal(record.legalSingletonChoice['Psychic Energy SVE'],false);
});
