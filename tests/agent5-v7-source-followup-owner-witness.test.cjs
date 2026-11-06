'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceFollowupOwnerWitness,VERSION}=
  require('../simulation/twinleaf/agent5-v7-source-followup-owner-witness.cjs');

class AddPlayerAction{}
class AttackAction {
  constructor(clientId,name){this.clientId=clientId;this.name=name;}
}
class PassTurnAction {
  constructor(clientId){this.clientId=clientId;}
}
class PlayCardAction {
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
function slot(name){
  return {getPokemonCard:()=>name?{name,fullName:name}:null,
    energies:{cards:[]},tools:[],damage:0};
}
function player(id){
  return {id,hand:{cards:[{fullName:'Spiky Energy JTG'}]},
    active:slot('Iron Thorns ex TWM'),bench:[slot('Iron Thorns ex TWM')],
    stadium:{cards:[]},energyPlayedTurn:0,stadiumPlayedTurn:0,
    cannotPlayEnergyCards:false,cannotPlayStadiumCards:false};
}
class Store{
  constructor(){
    const opposite=player('opponent');
    Object.defineProperty(opposite,'hand',{get(){
      throw Error('Opponent private hand was read');
    }});
    this.state={players:[player('owner'),opposite],
      activePlayer:0,turn:2,prompts:[]};
  }
  dispatch(action){
    if(action instanceof PlayCardAction){
      this.state.players[0].hand.cards.splice(action.handIndex,1);
    }
    if(action instanceof AttackAction||action instanceof PassTurnAction){
      this.state.turn++;
      this.state.activePlayer=1-this.state.activePlayer;
    }
    return true;
  }
}
function run(actions,sourceSeat=0){
  const store=new Store();
  const observed=withSourceFollowupOwnerWitness(()=>{
    store.dispatch(new AddPlayerAction());
    for(const action of actions)store.dispatch(action);
    return 17;
  },{Store,sourceSeat,trialId:'mock-v7-original'});
  assert.equal(observed.result,17);
  return observed.audit;
}
test('first source post-Volt turn has real accepted Pass with owner hand',()=>{
  const audit=run([
    new AttackAction('owner','Volt Cyclone'),
    new PassTurnAction('opponent'),
    new PassTurnAction('owner')
  ]);
  assert.equal(audit.schema,VERSION);
  assert.equal(audit.acceptedSourceVoltDeclarations,1);
  assert.equal(audit.acceptedSourceVoluntaryAfterVolt.length,1);
  const root=audit.acceptedSourceVoluntaryAfterVolt[0];
  assert.equal(root.globalTurn,4);
  assert.equal(root.actionKind,'PassTurnAction');
  assert.deepEqual(root.sourceOwnerView.hand,['Spiky Energy JTG']);
  assert.equal(audit.opponentConcealedZoneRead,false);
  assert.equal(audit.unopenedDeckRead,false);
});
test('owner played card then Pass captures both true physical owner states',()=>{
  const audit=run([
    new AttackAction('owner','Volt Cyclone'),
    new PassTurnAction('opponent'),
    new PlayCardAction('owner',0),
    new PassTurnAction('owner')
  ]);
  assert.deepEqual(audit.acceptedSourceVoluntaryAfterVolt
    .map(x=>x.actionKind),['PlayCardAction','PassTurnAction']);
  assert.equal(audit.acceptedSourceVoluntaryAfterVolt[0].cardPlayed,
    'Spiky Energy JTG');
  assert.deepEqual(audit.acceptedSourceVoluntaryAfterVolt[1]
    .sourceOwnerView.hand,[]);
});
test('before any source Volt attack, even a source Pass is excluded',()=>{
  const audit=run([new PassTurnAction('owner'),
    new PassTurnAction('opponent')]);
  assert.equal(audit.acceptedSourceVoltDeclarations,0);
  assert.deepEqual(audit.acceptedSourceVoluntaryAfterVolt,[]);
});
test('other source seat cannot be misattributed as audited source',()=>{
  const audit=run([
    new AttackAction('owner','Volt Cyclone'),
    new PassTurnAction('opponent'),
    new PassTurnAction('owner')
  ],1);
  assert.equal(audit.acceptedSourceVoltDeclarations,0);
  assert.equal(audit.acceptedSourceVoluntaryAfterVolt.length,0);
});
test('the installed Store method is always restored on native throw',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withSourceFollowupOwnerWitness(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    throw Error('genuine native abort');
  },{Store,sourceSeat:0,trialId:'error-arm'}),/genuine native abort/);
  assert.strictEqual(Store.prototype.dispatch,original);
});
test('unsupported owner views cannot silently count hidden opponent hand',()=>{
  const audit=run([
    new AttackAction('owner','Volt Cyclone'),
    new PassTurnAction('opponent'),
    new PassTurnAction('owner')
  ]);
  assert.equal(audit.noNativeActionMutation,true);
  assert.equal(audit.attacksSettledIndependentlyVerified,false);
  assert.equal(audit.competitiveGamesQualified,0);
});
