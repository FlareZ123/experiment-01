'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  physicalTerminalSnapshot,
  withNativeTerminalPhysicalPredicates
}=require('../simulation/twinleaf/agent7-native-terminal-physical-predicates.cjs');
class AddPlayerAction {}
class PassTurnAction {}
class NativeErrorAction {}
const GamePhase={PLAYER_TURN:'turn',FINISHED:'finished'};
function side(id,deckCount,prizes,pokemon){
  return {id,hand:{cards:[{},{}]},deck:{cards:Array(deckCount).fill({})},
    prizes:Array.from({length:6},(_,i)=>({cards:i<prizes?[{}]:[]})),
    active:{getPokemonCard:()=>pokemon?{fullName:'Iron Thorns ex TWM'}:null},
    bench:Array.from({length:5},()=>({getPokemonCard:()=>null}))};
}
class Store{
  constructor(sourceWin=true){
    this.state={phase:GamePhase.PLAYER_TURN,turn:17,activePlayer:0,
      winner:null,players:[side(101,0,6,true),
        side(202,19,6,true)]};
    this.sourceWin=sourceWin;
  }
  dispatch(action){
    if(action instanceof NativeErrorAction)throw Error('native refuses');
    if(action instanceof PassTurnAction){
      this.state.phase=GamePhase.FINISHED;
      this.state.winner=this.sourceWin?1:0;
    }
    return action.constructor.name;
  }
}
test('genuine first native finish captures deck zero and zero Prize change',()=>{
  const x=withNativeTerminalPhysicalPredicates(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    store.dispatch(new PassTurnAction());
    return 'finished';
  },{Store,GamePhase});
  assert.equal(x.result,'finished');
  assert.equal(x.audit.observedGames,1);
  assert.equal(x.audit.nativeTerminalTransitions,1);
  const event=x.audit.events[0];
  assert.equal(event.before.phase,GamePhase.PLAYER_TURN);
  assert.equal(event.after.phase,GamePhase.FINISHED);
  assert.equal(event.after.winnerSeat,1);
  assert.deepEqual(event.compatibleTerminalPredicates,{
    winnerAllPrizesTaken:false,
    losingSideHasNoPokemon:false,
    losingSideDeckEmpty:true
  });
  assert.equal(event.exactEngineTerminalRuleEstablished,false);
  assert.equal(x.audit.competitiveGameQualified,false);
});
test('a detached Store without AddPlayer never generates terminal evidence',()=>{
  const x=withNativeTerminalPhysicalPredicates(()=>{
    const store=new Store();
    store.dispatch(new PassTurnAction());
  },{Store,GamePhase});
  assert.equal(x.audit.nativeTerminalTransitions,0);
  assert.equal(x.audit.observedGames,0);
});
test('native failure propagates and Store prototype restores',()=>{
  const orig=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.throws(()=>withNativeTerminalPhysicalPredicates(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new NativeErrorAction());
  },{Store,GamePhase}),/native refuses/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),orig);
});
test('snapshot classifies public board and owner counts without private card identity',()=>{
  const snapshot=physicalTerminalSnapshot(new Store(false).state);
  assert.equal(snapshot.sides[0].deckRemaining,0);
  assert.equal(snapshot.sides[1].deckRemaining,19);
  assert.equal(snapshot.sides[0].pokemonInPlay,1);
  assert.equal(snapshot.sides[0].prizesRemaining,6);
  assert.ok(!('handPrintings' in snapshot.sides[0]));
});
