'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOriginalFlarePhysicalWitness,VERSION,FLARE}=
  require('../simulation/twinleaf/agent5-v7-teamflare-physical-witness.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class PassTurnAction{
  constructor(clientId){this.clientId=clientId;}
}
const energy=(name)=>({fullName:name});
const slot=(fullName,energies=[])=>({
  getPokemonCard:()=>fullName?{fullName}:null,
  energies:{cards:energies},tools:[],damage:0
});
function player(id,active,hand){
  return {id,active,bench:[slot(null)],hand:{cards:hand},
    stadium:{cards:[]},discard:{cards:[]},supporterTurn:0};
}
class Store{
  constructor(reject=false){
    this.reject=reject;
    this.energy=energy('Psychic Energy MEE');
    const owner=player('owner',slot('Iron Thorns ex TWM'),
      [{fullName:FLARE}]);
    const opp=player('opponent',slot('Tapu Lele-GX GRI',[this.energy]),[]);
    Object.defineProperty(opp,'hand',{get(){
      throw Error('Observer touched concealed opponent hand');
    }});
    this.state={players:[owner,opp],turn:5,
      activePlayer:0,prompts:[]};
  }
  dispatch(action){
    if(action instanceof PlayCardAction){
      if(this.reject)throw Error('Store physically rejected action');
      const source=this.state.players[0],opp=this.state.players[1];
      const card=source.hand.cards.splice(action.handIndex,1)[0];
      source.discard.cards.push(card);
      source.supporterTurn=5;
      const moved=opp.active.energies.cards.pop();
      opp.discard.cards.push(moved);
    }
    return true;
  }
}
function execute(reject=false){
  const store=new Store(reject);
  const old=Store.prototype.dispatch;
  try{
    return withOriginalFlarePhysicalWitness(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction('owner',0));
      return store;
    },{Store,seat:0,turn:5,trialId:'test:source'});
  }finally{
    assert.strictEqual(Store.prototype.dispatch,old);
  }
}
test('native Store settling held original Flare moves exact opposing Energy',()=>{
  const sample=execute();
  const a=sample.audit;
  assert.equal(a.schema,VERSION);
  assert.equal(a.acceptedStoreFlareRoots,1);
  assert.equal(a.trueActorFlareAttempts,1);
  assert.equal(a.nativeRejectedFlareRoots,0);
  assert.equal(a.physicalOriginalFlareLeftHand,true);
  assert.equal(a.physicalFlareReachedOwnerDiscard,true);
  assert.deepEqual(a.opponentActiveEnergyBefore,['Psychic Energy MEE']);
  assert.deepEqual(a.exactOpponentEnergyMovedToDiscard,['Psychic Energy MEE']);
  assert.equal(a.exactOriginalOpponentEnergyCountAfter,0);
  assert.equal(a.sourceSupporterTurnBefore,0);
  assert.equal(a.sourceSupporterTurnAfter,5);
  assert.equal(a.observerReadOnly,true);
  assert.equal(a.paperCompetitiveGameQualified,false);
});
test('real engine rejection stays a rejection and always restores Store',()=>{
  const old=Store.prototype.dispatch;
  assert.throws(()=>execute(true),e=>{
    assert.match(String(e),/Store physically rejected action/);
    assert.equal(e.agent5V7FlarePhysicalAudit.acceptedStoreFlareRoots,0);
    assert.equal(e.agent5V7FlarePhysicalAudit.nativeRejectedFlareRoots,1);
    return true;
  });
  assert.strictEqual(Store.prototype.dispatch,old);
});
test('actor-seat mismatch never captures the original source held card',()=>{
  const store=new Store();
  const r=withOriginalFlarePhysicalWitness(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction('owner',0));
  },{Store,seat:1,turn:5,trialId:'test:other'});
  assert.equal(r.audit.trueActorFlareAttempts,0);
});
test('phase without the target turn cannot attribute unrelated trainer',()=>{
  const store=new Store();
  const r=withOriginalFlarePhysicalWitness(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction('owner',0));
  },{Store,seat:0,turn:7,trialId:'test:wrong-turn'});
  assert.equal(r.audit.trueActorFlareAttempts,0);
});
