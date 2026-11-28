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
  tracker.completeTurn(2,'A');
  tracker.completeTurn(3,'A');
  assert.deepEqual(tracker.snapshot('B','A',3),[
    {turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true}
  ]);
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
});

test('mid-turn installation and incomplete or uncertain turns fail closed',()=>{
  const tracker=createKnockoutTurnTracker(2);
  tracker.completeTurn(2,'A');
  assert.equal(tracker.snapshot('B','A',3),null);
  tracker.completeTurn(3,'A');
  assert.deepEqual(tracker.snapshot('B','A',4),[]);
  tracker.markUncertain(4);
  tracker.completeTurn(4,'A');
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
    actorSeat:0,turn:4,opponentLastTurnTurn:3,
    opponentLastTurnOwnerCertified:true,
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


test('opponent extra turn supersedes an earlier KO without carrying stale true',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true});
  tracker.completeTurn(1,'B'); // pre-hook: deliberately outside coverage
  tracker.completeTurn(2,'A'); // opponent KO and Timeless-GX
  tracker.completeTurn(3,'A'); // same opponent extra turn, no KO
  assert.equal(tracker.lastCompletedOpponentTurn('B','A',4),3);
  assert.deepEqual(tracker.snapshotWithTurn('B','A',4),{turn:3,events:[]});
});

test('actor extra turn preserves the last opponent KO, even if not globalTurn-1',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'A',attackerPlayerId:'B',byAttack:true});
  tracker.completeTurn(2,'B'); // B knocked out A's Pokémon
  tracker.completeTurn(3,'A'); // A took Timeless-GX and an extra turn
  assert.equal(tracker.lastCompletedOpponentTurn('A','B',4),2);
  assert.deepEqual(tracker.snapshotWithTurn('A','B',4),{
    turn:2,events:[{turn:2,victimPlayerId:'A',attackerPlayerId:'B',byAttack:true}]
  });
});

test('missing intermediate owner receipt and mismatched owner fail closed',()=>{
  const tracker=createKnockoutTurnTracker(0);
  tracker.record({turn:2,victimPlayerId:'B',attackerPlayerId:'A',byAttack:true});
  tracker.completeTurn(2,'A');
  assert.equal(tracker.snapshotWithTurn('B','A',4),null); // turn 3 missing
  tracker.completeTurn(3,'A');
  assert.deepEqual(tracker.snapshotWithTurn('B','A',4),{turn:3,events:[]});
  tracker.completeTurn(3,'B'); // conflicting native owner reports
  assert.equal(tracker.snapshotWithTurn('B','A',4),null);
});

test('response options admit a certified older opponent turn on actor extra turn',()=>{
  const view={actorSeat:0,globalTurn:4,decisionKind:'owner-root',
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{deckCount:20,discard:['Basic Psychic Energy']},
    ownHand:['Teammates PRC 141','Raihan EVS 152']};
  const receipt={actorSeat:0,turn:4,opponentLastTurnTurn:2,
    opponentLastTurnOwnerCertified:true,
    priorOpponentTurnKO:{turn:2,any:true,byAttack:true}};
  assert.equal(previousTurnResponseOptions(view,receipt,()=>true).length,2);
  receipt.opponentLastTurnOwnerCertified=false;
  assert.deepEqual(previousTurnResponseOptions(view,receipt,()=>true),[]);
});
