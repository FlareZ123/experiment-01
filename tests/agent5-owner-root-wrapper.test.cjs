'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerRootSlice}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

class AddPlayerAction{
  constructor(id){this.id=id;}
}
class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class AttackAction{
  constructor(id,name){this.id=id;this.name=name;}
}
class PassTurnAction{
  constructor(id){this.id=id;}
}
class FakeStore{
  constructor(state){this.state=state;this.accepted=[];}
  dispatch(action){this.accepted.push(action);return true;}
}
class FakeAi{
  decodeNextAction(state){
    return new PassTurnAction(state.players[state.activePlayer].id);
  }
}

function card(fullName,{superType='POKEMON',stage='BASIC',powers=[]}={}){
  return {fullName,name:fullName.replace(/ [A-Z]{3}$/,''),
    superType,stage,powers,
    cardType:['PSYCHIC'],hp:210,retreat:[],weakness:[],resistance:[],
    attacks:[{name:'Psy Bolt',cost:['PSYCHIC'],gxAttack:false}]
  };
}
function slot(pokemon){
  return {
    cards:pokemon?[pokemon]:[],
    getPokemonCard:()=>pokemon??null,
    damage:0,energies:{cards:[]},tools:[],specialConditions:[]
  };
}
function player(id,active,held){
  return {
    id,active:slot(active),bench:Array.from({length:5},()=>slot(null)),
    hand:{cards:held},deck:{cards:[]},prizes:Array.from({length:6},
      ()=>({cards:[{}]})),discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},usedGX:false,usedVSTAR:false,
    supporterTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0
  };
}
function state(){
  return {
    turn:2,activePlayer:0,phase:5,prompts:[],
    players:[
      player(101,card('Mewtwo & Mew-GX UNM'),[card('Crobat V DAA')]),
      player(202,card('Garbodor BKP'),[])
    ]
  };
}
function deps(){
  return {
    SimpleTacticsAi:FakeAi,Store:FakeStore,
    GamePhase:{GamePhase:{PLAYER_TURN:5}},
    actionClasses:{PlayCardAction,AttackAction,PassTurnAction},
    enums:{
      SuperType:{POKEMON:'POKEMON',ENERGY:'ENERGY'},
      Stage:{BASIC:'BASIC'},EnergyType:{BASIC:'BASIC'},
      CardType:{COLORLESS:9,PSYCHIC:5},
      PowerType:{ABILITY:'ABILITY'},
      PlayerType:{BOTTOM_PLAYER:1},SlotType:{BENCH:2,ACTIVE:3}
    }
  };
}

test('only the registered live Store receives actor-owned proposal',()=>{
  const originalBot=FakeAi.prototype.decodeNextAction;
  const originalStore=FakeStore.prototype.dispatch;
  const s=state(),store=new FakeStore(s),bot=new FakeAi();
  const result=withOwnerRootSlice(0,()=>{
    store.dispatch(new AddPlayerAction(101));
    const action=bot.decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    store.dispatch(action);
    const fakeClone={...s};
    assert.ok(bot.decodeNextAction(fakeClone) instanceof PassTurnAction);
    s.activePlayer=1;
    assert.ok(bot.decodeNextAction(s) instanceof PassTurnAction);
    return 'completed';
  },deps());
  assert.equal(result.result,'completed');
  assert.equal(result.audit.authenticatedLiveStore,true);
  assert.equal(result.audit.ownerRootProposals,1);
  assert.equal(result.audit.acceptedByLiveStore,1);
  assert.equal(result.audit.nonLiveSpeculativeFallbacks,1);
  assert.equal(result.audit.sourceGenericFallbacks,1);
  assert.equal(result.audit.records[0].intent.kind,'bench-basic');
  assert.strictEqual(FakeAi.prototype.decodeNextAction,originalBot);
  assert.strictEqual(FakeStore.prototype.dispatch,originalStore);
});
test('prototype hooks restore on a thrown live Store failure',()=>{
  const originalBot=FakeAi.prototype.decodeNextAction;
  const originalStore=FakeStore.prototype.dispatch;
  assert.throws(()=>withOwnerRootSlice(0,()=>{
    throw Error('deliberate native failure');
  },deps()),/deliberate native failure/);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,originalBot);
  assert.strictEqual(FakeStore.prototype.dispatch,originalStore);
});
