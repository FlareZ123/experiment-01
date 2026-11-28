'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  createKnockoutTurnTracker,installStoreKnockoutTurnTracker
}=require('./agent8-ko-turn-tracker.cjs');
const {previousTurnResponseOptions}=
  require('./agent8-ko-supporter-options.cjs');

const GamePhase={PLAYER_TURN:1,ATTACK:2};
class KnockOutEffect{
  constructor(player){
    this.player=player;
    this.target={getPokemonCard:()=>({})};
    this.preventDefault=false;
  }
}
class EndTurnEffect{
  constructor(player){this.player=player;}
}
function player(id){
  return {
    id,DAMAGE_DEALT_MARKER:'DAMAGE_DEALT',
    pokemonKnockedOutLastTurnEntries:[],
    marker:{hasMarker:name=>name==='DAMAGE_DEALT'}
  };
}
function storeAt(turn=0){
  const a=player('A'),b=player('B');
  const state={turn,activePlayer:0,phase:GamePhase.PLAYER_TURN,players:[a,b]};
  const store={
    state,
    reduceEffect(stateArg,effect){
      if(effect instanceof KnockOutEffect&&effect.preventDefault!==true){
        const victim=effect.player;
        const actor=stateArg.players[stateArg.activePlayer];
        if(actor!==victim&&
           [GamePhase.PLAYER_TURN,GamePhase.ATTACK].includes(stateArg.phase)&&
           effect.target.getPokemonCard()){
          victim.pokemonKnockedOutLastTurnEntries.push([]);
          victim.pokemonKnockedOutDuringOpponentsLastTurn=true;
          if(stateArg.phase===GamePhase.ATTACK&&
             victim.marker.hasMarker(victim.DAMAGE_DEALT_MARKER))
            victim.pokemonKnockedOutByAttackDuringOpponentsLastTurn=true;
        }
      }
      if(effect instanceof EndTurnEffect)stateArg.turn++;
      return stateArg;
    }
  };
  return {store,a,b};
}

test('tracker separates a turn-2 KO from the no-KO extra turn 3',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true});
  tracker.completeTurn(2);
  tracker.completeTurn(3);
  assert.deepEqual(tracker.snapshot('B','A',3),[
    {turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true}
  ]);
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
});

test('mid-turn installation and incomplete or uncertain turns fail closed',()=>{
  const tracker=createKnockoutTurnTracker(2);
  tracker.completeTurn(2);
  assert.equal(tracker.snapshot('B','A',3),null);
  tracker.completeTurn(3);
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
  tracker.markUncertain(4);
  tracker.completeTurn(4);
  assert.equal(tracker.snapshot('B','A',5),null);
});

test('instance Store hook stamps the actual KO turn and restores the reducer',()=>{
  const {store,a,b}=storeAt(0);
  const original=store.reduceEffect;
  const {tracker,uninstall}=installStoreKnockoutTurnTracker(store,{
    KnockOutEffect,EndTurnEffect,GamePhase
  });
  store.state.turn=2;
  store.state.phase=GamePhase.ATTACK;
  store.reduceEffect(store.state,new KnockOutEffect(b));
  store.reduceEffect(store.state,new EndTurnEffect(a));
  store.state.phase=GamePhase.PLAYER_TURN;
  store.reduceEffect(store.state,new EndTurnEffect(a));
  assert.deepEqual(tracker.snapshot('B','A',3),[
    {turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true}
  ]);
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
  uninstall();
  assert.strictEqual(store.reduceEffect,original);
});

test('a prevented KO effect makes its turn unknown rather than known-empty',()=>{
  const {store,a,b}=storeAt(0);
  const {tracker,uninstall}=installStoreKnockoutTurnTracker(store,{
    KnockOutEffect,EndTurnEffect,GamePhase
  });
  store.state.turn=2;
  store.state.phase=GamePhase.ATTACK;
  const prevented=new KnockOutEffect(b);
  prevented.preventDefault=true;
  store.reduceEffect(store.state,prevented);
  store.reduceEffect(store.state,new EndTurnEffect(a));
  assert.equal(tracker.snapshot('B','A',3),null);
  uninstall();
});

test('non-attack opponent-turn KO is recorded as any but not byAttack',()=>{
  const {store,a,b}=storeAt(0);
  const {tracker,uninstall}=installStoreKnockoutTurnTracker(store,{
    KnockOutEffect,EndTurnEffect,GamePhase
  });
  store.state.turn=3;
  store.state.phase=GamePhase.PLAYER_TURN;
  store.reduceEffect(store.state,new KnockOutEffect(b));
  store.reduceEffect(store.state,new EndTurnEffect(a));
  assert.deepEqual(tracker.snapshot('B','A',4),[
    {turn:3,victimPlayerId:'B',attackerPlayerId:'A',byAttack:false}
  ]);
  uninstall();
});

test('a KO during the opponent extra turn is fresh on the next owner turn',()=>{
  const {store,a,b}=storeAt(0);
  const {tracker,uninstall}=installStoreKnockoutTurnTracker(store,{
    KnockOutEffect,EndTurnEffect,GamePhase
  });
  store.state.turn=3;
  store.state.phase=GamePhase.ATTACK;
  store.reduceEffect(store.state,new KnockOutEffect(b));
  store.reduceEffect(store.state,new EndTurnEffect(a));
  assert.deepEqual(tracker.snapshot('B','A',4),[
    {turn:3,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true}
  ]);
  uninstall();
});

test('KO Supporter alternatives require the exact preceding-turn stamp',()=>{
  const view={
    actorSeat:0,globalTurn:4,decisionKind:'owner-root',
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{deckCount:20,discard:['Basic Psychic Energy']},
    ownHand:['Teammates PRC 141','Raihan EVS 152']
  };
  const receipt={
    actorSeat:0,turn:4,
    priorOpponentTurnKO:{turn:3,any:true,byAttack:false}
  };
  const basic=()=>true;
  assert.equal(previousTurnResponseOptions(view,receipt,basic).length,2);
  receipt.priorOpponentTurnKO.turn=2;
  assert.deepEqual(previousTurnResponseOptions(view,receipt,basic),[]);
  receipt.priorOpponentTurnKO={any:true,byAttack:true};
  assert.deepEqual(previousTurnResponseOptions(view,receipt,basic),[]);
  receipt.priorOpponentTurnKO={turn:3,any:null,byAttack:null};
  assert.deepEqual(previousTurnResponseOptions(view,receipt,basic),[]);
});

test('opponent extra turn without a KO supersedes the earlier KO despite stale native Boolean',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true});
  tracker.completeTurn(2,'A');
  tracker.completeTurn(3,'A'); // A receives a second, empty turn.
  assert.deepEqual(tracker.snapshotLastOpponentTurn('B','A',4),
    {turn:3,events:[]});
  // Chronological legacy snapshot remains known-empty, too.
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
});

test('owner extra turn retains the last completed opponent-owned KO, not currentTurn minus one',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true});
  tracker.completeTurn(2,'A');
  tracker.completeTurn(3,'B'); // B receives a subsequent extra turn.
  assert.deepEqual(tracker.snapshotLastOpponentTurn('B','A',4),
    {turn:2,events:[{turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true}]});
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
});

test('multiple owner turns and an older opponent turn preserve correct last-opponent evidence',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:false});
  tracker.completeTurn(2,'A');
  tracker.completeTurn(3,'B');
  tracker.completeTurn(4,'B');
  assert.deepEqual(tracker.snapshotLastOpponentTurn('B','A',5),
    {turn:2,events:[{turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:false}]});
});

test('unaccounted-for intervening turn, uncertain turn or unknown owner fails closed',()=>{
  const incomplete=createKnockoutTurnTracker(0);
  incomplete.completeTurn(2,'A');
  assert.equal(incomplete.snapshotLastOpponentTurn('B','A',4),null);
  const unknown=createKnockoutTurnTracker(0);
  unknown.completeTurn(2,'A');
  unknown.completeTurn(3); // Legacy callers do not supply trusted actor.
  assert.equal(unknown.snapshotLastOpponentTurn('B','A',4),null);
  const uncertain=createKnockoutTurnTracker(0);
  uncertain.completeTurn(2,'A');
  uncertain.completeTurn(3,'B');
  uncertain.markUncertain(3);
  assert.equal(uncertain.snapshotLastOpponentTurn('B','A',4),null);
  const foreign=createKnockoutTurnTracker(0);
  foreign.completeTurn(2,'A');
  foreign.completeTurn(3,'unexpected-seat');
  assert.equal(foreign.snapshotLastOpponentTurn('B','A',4),null);
});

test('native EndTurn hook binds pre-reducer actor even after reducer switches active seat',()=>{
  const {store,a,b}=storeAt(0);
  const original=store.reduceEffect;
  store.reduceEffect=function(stateArg,effect){
    const result=original.call(this,stateArg,effect);
    if(effect instanceof EndTurnEffect)stateArg.activePlayer=1-stateArg.activePlayer;
    return result;
  };
  const {tracker,uninstall}=installStoreKnockoutTurnTracker(store,{
    KnockOutEffect,EndTurnEffect,GamePhase});
  store.state.turn=2;
  store.state.activePlayer=0;
  store.state.phase=GamePhase.ATTACK;
  store.reduceEffect(store.state,new KnockOutEffect(b));
  store.reduceEffect(store.state,new EndTurnEffect(a)); // A ends and B starts.
  store.state.phase=GamePhase.PLAYER_TURN;
  store.reduceEffect(store.state,new EndTurnEffect(b)); // B ends and A starts.
  assert.deepEqual(tracker.snapshotLastOpponentTurn('B','A',4),
    {turn:2,events:[{turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true}]});
  assert.equal(tracker.audit().completedActorKnownTurns,2);
  uninstall();
});

test('turn-ownership receipt cannot be silently reassigned after completion',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.completeTurn(2,'A');
  assert.throws(()=>tracker.completeTurn(2,'B'),/ownership cannot change/);
  assert.deepEqual(tracker.audit().completedTurns,[2]);
});
