'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  HANDIWORK_PRINTING,ownerZoneSnapshot,withOwnerZoneAudit
}=require('../simulation/twinleaf/agent1-owner-zone-observer.cjs');

function card(fullName){
  const bunnelby=fullName==='Bunnelby PRC';
  return {
    fullName,
    name:fullName.replace(/ [A-Z0-9]+$/,''),
    hp:bunnelby?60:210,
    attacks:bunnelby?[
      {name:'Rototiller',cost:['COLORLESS'],damage:0},
      {name:'Burrow',cost:['COLORLESS'],damage:0}
    ]:[{name:'Printed Attack',cost:['PSYCHIC','COLORLESS'],damage:100}],
    powers:[]
  };
}
function pokemon(fullName){
  const c=fullName?card(fullName):null;
  return {
    getPokemonCard:()=>c,
    cards:fullName?[c]:[],
    damage:0,hp:c?.hp??0,pokemonPlayedTurn:1,
    energies:{cards:fullName==='Bunnelby PRC'?[card('Water Energy MEE')]:[]},
    tools:[],specialConditions:[],poisonDamage:0,burnDamage:0,
    attacksThisTurn:fullName==='Bunnelby PRC'?1:0,
    cannotAttackNextTurn:false,cannotRetreatNextTurn:false,
    abilityLockActivationOrder:0
  };
}
function player(id,activeName){
  return {
    id,
    deck:{cards:[card('Forest Seal Stone SIT'),card('Trainers Mail ROS')]},
    hand:{cards:[card('Arven OBF')]},
    discard:{cards:[card(HANDIWORK_PRINTING)]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    prizes:[{cards:[card('Water Energy MEE')]},{cards:[card('Capture Energy RCL')]}],
    active:pokemon(activeName),bench:[pokemon(null),pokemon(null)],
    usedGX:false,usedVSTAR:false,energyPlayedTurn:0,
    supporterTurn:0,retreatedTurn:0,stadiumPlayedTurn:0,stadiumUsedTurn:0,
    cannotPlayItemCards:false,cannotPlaySupporterCards:false,
    cannotPlayStadiumCards:false
  };
}
function fixture(){
  return {
    phase:2,turn:8,activePlayer:0,prompts:[],
    playerLastAttack:{101:{sourceCard:card('Bunnelby PRC'),attack:{name:'Burrow'}}},
    players:[player(101,'Bunnelby PRC'),player(202,'Garbodor BKP')]
  };
}
function poison(length){
  return new Proxy({length},{get(target,key){
    if(key==='length')return target.length;
    throw new Error('Opponent hidden identity read: '+String(key));
  }});
}
function hiddenPrizes(count){
  return {length:count,reduce(_callback,initial){return initial+count;}};
}

test('owner-only snapshot captures source hidden zones and public opponent state',()=>{
  const state=fixture();
  const snapshot=ownerZoneSnapshot(state,0,2);
  assert.ok(snapshot);
  assert.equal(snapshot.observerOnly,true);
  assert.equal(snapshot.notPolicyInput,true);
  assert.equal(snapshot.opponentHiddenZonesInspected,false);
  assert.deepEqual(snapshot.owner.zones.deck,[
    'Forest Seal Stone SIT','Trainers Mail ROS'
  ]);
  assert.deepEqual(snapshot.owner.zones.hand,['Arven OBF']);
  assert.deepEqual(snapshot.owner.zones.discard,[HANDIWORK_PRINTING]);
  assert.deepEqual(snapshot.owner.zones.prizes,[
    ['Water Energy MEE'],['Capture Energy RCL']
  ]);
  assert.deepEqual(snapshot.owner.handiworkLocations,['discard']);
  assert.equal(snapshot.owner.bunnelbyActive,true);
  assert.equal(snapshot.owner.bunnelbyAttachedEnergyCount,1);
  assert.equal(snapshot.owner.bunnelbyAttacksThisTurn,1);
  assert.equal(snapshot.owner.hasRototiller,true);
  assert.equal(snapshot.owner.structuralRototillerCandidate,true);
  assert.equal(snapshot.opponentPublic.active.printing,'Garbodor BKP');
  assert.equal(snapshot.opponentPublic.deckCount,2);
  assert.equal(snapshot.opponentPublic.handCount,1);
  assert.equal(snapshot.previousOwnerAttack.attack,'Burrow');
  assert.notStrictEqual(snapshot.owner.zones.deck,state.players[0].deck.cards);
});

test('opponent hidden identities are never read or reflected in the owner snapshot',()=>{
  const left=fixture(),right=fixture();
  left.players[1].hand.cards=poison(4);
  left.players[1].deck.cards=poison(31);
  left.players[1].prizes=hiddenPrizes(6);
  right.players[1].hand.cards=poison(4);
  right.players[1].deck.cards=poison(31);
  right.players[1].prizes=hiddenPrizes(6);
  const a=ownerZoneSnapshot(left,0,2);
  const b=ownerZoneSnapshot(right,0,2);
  assert.deepEqual(a,b);
  assert.equal(a.opponentPublic.handCount,4);
  assert.equal(a.opponentPublic.deckCount,31);
  assert.equal(a.opponentPublic.prizeCount,6);
  right.players[1].active=pokemon('Garbodor LTR');
  assert.notDeepEqual(ownerZoneSnapshot(left,0,2),ownerZoneSnapshot(right,0,2),
    'public opponent printing changes remain visible');
});

test('owner hidden identities affect the retrospective snapshot',()=>{
  const a=fixture(),b=fixture();
  b.players[0].deck.cards[0]=card('Ultra Ball SVI');
  assert.notDeepEqual(ownerZoneSnapshot(a,0,2),ownerZoneSnapshot(b,0,2));
  const c=fixture();
  c.players[0].prizes[0].cards[0]=card('Psychic Energy MEE');
  assert.notDeepEqual(ownerZoneSnapshot(a,0,2),ownerZoneSnapshot(c,0,2));
});

test('only the first live Store and source-owner roots or prompts are captured',()=>{
  class AddPlayerAction{}
  class Move{}
  class Store{
    constructor(){this.state={phase:0,turn:0,activePlayer:0,players:[],prompts:[]};}
    dispatch(action){
      if(action instanceof AddPlayerAction)this.state=fixture();
      return action.constructor.name;
    }
  }
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const live=new Store(),simulated=new Store();
  const result=withOwnerZoneAudit(Store,0,()=>{
    live.dispatch(new AddPlayerAction());
    simulated.state=fixture();
    simulated.dispatch(new Move());
    live.state.activePlayer=1;
    live.dispatch(new Move());
    live.state.activePlayer=0;
    live.dispatch(new Move());
    live.state.prompts=[{
      constructor:{name:'ChooseCardsPrompt'},
      playerId:202,cards:live.state.players[1].hand,result:undefined
    }];
    live.dispatch(new Move());
    live.state.prompts=[{
      constructor:{name:'ChooseCardsPrompt'},
      playerId:101,cards:live.state.players[0].discard,result:undefined,
      message:'CHOOSE_CARD_TO_DECK',options:{min:1,max:2,allowCancel:false}
    }];
    live.dispatch(new Move());
    return 'complete';
  },{playerTurnPhase:2});
  assert.equal(result.result,'complete');
  assert.equal(result.audit.liveStoreFound,true);
  assert.equal(result.audit.liveStoreDispatches,5);
  assert.equal(result.audit.ownerRootDecisions,1);
  assert.equal(result.audit.ownerPromptDecisions,1);
  assert.equal(result.audit.handiworkInDiscard,2);
  assert.equal(result.audit.structuralRototillerCandidates,2);
  assert.equal(result.audit.opponentHiddenZonesInspected,false);
  const prompt=result.snapshots.find(row=>
    row.snapshot.pendingPrompt?.message==='CHOOSE_CARD_TO_DECK');
  assert.ok(prompt);
  assert.deepEqual(prompt.snapshot.pendingPrompt.offeredOwnDiscardPrintings,
    [HANDIWORK_PRINTING]);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),
    original);
});

test('opponent-owned pending prompts are excluded',()=>{
  const state=fixture();
  state.prompts=[{
    constructor:{name:'ChooseCardsPrompt'},playerId:202,
    cards:state.players[1].deck,result:undefined
  }];
  assert.equal(ownerZoneSnapshot(state,0,2),null);
});

test('dispatcher descriptor is restored when native execution throws',()=>{
  class Store{
    constructor(){this.state=fixture();}
    dispatch(){throw new Error('native-dispatch-failed');}
  }
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.throws(()=>withOwnerZoneAudit(Store,0,()=>{
    new Store().dispatch({});
  },{playerTurnPhase:2}),/native-dispatch-failed/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),
    original);
});
