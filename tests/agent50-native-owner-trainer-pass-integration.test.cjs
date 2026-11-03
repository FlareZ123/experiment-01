'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(playerId,handIndex,target){
    Object.assign(this,{playerId,handIndex,target});
  }
}
class AttackAction{}
class PassTurnAction{
  constructor(playerId){this.playerId=playerId;}
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){
    return new PlayCardAction(this.client.id,0,
      {player:0,slot:0,index:0});
  }
}
function player(id){
  const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]});
  return {id,active:empty(),bench:Array.from({length:5},empty),
    hand:{cards:[]},deck:{cards:[]},prizes:[],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]}};
}
class Store{
  constructor(){
    this.state={players:[player(10),player(20)],activePlayer:0,
      prompts:[],turn:2,phase:2};
  }
  dispatch(){return true;}
}
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(),specialEnergies:new Set(),
  basicEnergyTypes:{},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function ownerView(itemPlayLocked=false){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:2,
    ownHand:['Battle VIP Pass FST'],
    ownPublic:{active:{printing:'Mew V FST',energies:[],attacks:[],
      specialConditions:[],publicRestrictions:{},tools:[]},
      bench:[null,null,null,null,null],stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{stadium:[]},
    ownTurnResources:{pokemonPlayLocked:false,
      energyPlayLocked:false,energyPlayedTurn:0,
      itemPlayLocked,supporterPlayedTurn:0,stadiumPlayedTurn:0}
  };
}
function trial(nativeOwnerTrainerFallback,itemPlayLocked=false){
  const savedBot=SimpleTacticsAi.prototype.decodeNextAction;
  const savedStore=Store.prototype.dispatch;
  const result=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(10).decodeNextAction(store.state);
    store.dispatch(action);
    return action.constructor.name;
  },{
    nativeOwnerTrainerFallback,SimpleTacticsAi,Store,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>ownerView(itemPlayLocked),
    getCatalog:()=>catalog,
    getNativeTrainerCatalog:()=>new Map([[
      'Battle VIP Pass FST',{name:'Battle VIP Pass',type:'Item'}
    ]]),
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0,ANY:2},
      SlotType:{ACTIVE:1,BENCH:2,BOARD:0}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,savedBot);
  assert.strictEqual(Store.prototype.dispatch,savedStore);
  return result;
}

test('default actor-only unsupported root remains Pass and audit unchanged',()=>{
  const run=trial(false);
  assert.equal(run.result,'PassTurnAction');
  assert.equal(Object.hasOwn(run.audit,'nativeOwnerTrainerFallback'),false);
});

test('opted-in native proposed Trainer takes actual Store dispatch after unsupported Pass',()=>{
  const run=trial(true);
  assert.equal(run.result,'PlayCardAction');
  const audit=run.audit.nativeOwnerTrainerFallback;
  assert.equal(audit.attemptedUnsupportedPasses,1);
  assert.equal(audit.selectedNativeTrainerRoots,1);
  assert.equal(audit.acceptedNativeTrainerRoots,1);
  assert.equal(audit.rejectedNativeTrainerRoots,0);
  assert.equal(audit.receipts.length,1);
  assert.equal(audit.receipts[0].printing,'Battle VIP Pass FST');
  assert.equal(audit.receipts[0].nativeDispatch,'native-accepted');
  assert.equal(audit.paperPaymentVerified,false);
  assert.equal(audit.competitiveGameQualified,false);
});

test('native proposal cannot override actual public Item lock',()=>{
  const run=trial(true,true);
  assert.equal(run.result,'PassTurnAction');
  const audit=run.audit.nativeOwnerTrainerFallback;
  assert.equal(audit.attemptedUnsupportedPasses,1);
  assert.equal(audit.selectedNativeTrainerRoots,0);
  assert.equal(audit.declinedByReason['generic-public-rule-block'],1);
});
