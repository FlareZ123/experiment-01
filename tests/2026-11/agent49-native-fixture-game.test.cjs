'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  seededRandom,deckPermutation,projectActionPayload,runNativeFixtureGame,normalizeSeed32
}=require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

const GamePhase=Object.freeze({
  SETUP:'setup',PLAYER_TURN:'player-turn',FINISHED:'finished'
});
const Format=Object.freeze({EXPANDED:'expanded'});

class GameSettings {
  constructor(){this.rules={};}
}
class AddPlayerAction {
  constructor(id,name,deck){Object.assign(this,{id,name,deck});}
}
class ResolvePromptAction {
  constructor(id,result){Object.assign(this,{id,result});}
}
class ShuffleDeckPrompt {
  constructor(id,playerId){Object.assign(this,{id,playerId,result:undefined});}
  getPerspectivePlayerId(){return this.playerId;}
}
class CoinFlipPrompt {
  constructor(id,playerId){Object.assign(this,{id,playerId,result:undefined});}
}
class RootAction {
  constructor(seat){this.seat=seat;this.type='ROOT';}
}
let lastStore=null;
class Store {
  constructor(options){
    this.options=options;
    this.rootActions=0;
    this.state={
      phase:GamePhase.SETUP,turn:0,activePlayer:null,
      players:[],prompts:[],winner:null
    };
    lastStore=this;
  }
  dispatch(action){
    if(action instanceof AddPlayerAction){
      this.state.players.push({
        id:action.id,name:action.name,
        deck:{cards:action.deck.map(fullName=>({fullName}))},
        hand:[],prizes:[],discard:[],
        active:{getPokemonCard:()=>null},bench:[]
      });
      if(this.state.players.length===2){
        this.state.prompts=[
          new ShuffleDeckPrompt(1,101),
          new CoinFlipPrompt(2,202)
        ];
      }
      return;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(item=>item.id===action.id);
      assert.ok(prompt,'resolved prompt must exist');
      prompt.result=action.result;
      if(this.state.prompts.every(item=>item.result!==undefined)){
        this.state.phase=GamePhase.PLAYER_TURN;
        this.state.activePlayer=0;
        this.state.turn=1;
      }
      return;
    }
    if(action instanceof RootAction){
      this.rootActions++;
      if(this.rootActions===1){
        this.state.activePlayer=1;
        this.state.turn=2;
      }else{
        this.state.phase=GamePhase.FINISHED;
        this.state.winner=101;
      }
      return;
    }
    throw new Error('unexpected action '+action?.constructor?.name);
  }
}
class SimpleTacticsAi {
  constructor(identity,options,deck){
    this.id=identity.id;
    this.options=options;
    this.deck=deck;
  }
  decodeNextAction(){
    return new RootAction(this.id===101?0:1);
  }
}

function native(){
  return {
    Store,GameSettings,SimpleTacticsAi,AddPlayerAction,ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,GamePhase,Format
  };
}
function deck(prefix){
  return Array.from({length:60},(_,i)=>prefix+' card '+i);
}
function input(overrides={}){
  return {
    native:native(),
    deckA:deck('A'),
    deckB:deck('B'),
    botOptionsBySeat:[{},{}],
    seed:0x12345678,
    candidateSeat:0,
    originalSourceSeat:1,
    ...overrides
  };
}

test('action payload projection distinguishes same-class decisions and terminates cycles',()=>{
  const first=projectActionPayload(new RootAction(0));
  const second=projectActionPayload(new RootAction(1));
  assert.equal(first.actionName,'RootAction');
  assert.equal(first.fields.seat,0);
  assert.equal(second.fields.seat,1);
  assert.notDeepEqual(first,second);

  const cyclic={};
  cyclic.self=cyclic;
  const projected=projectActionPayload({type:'TEST',payload:cyclic});
  assert.equal(projected.fields.payload.self.cycle,true);
});

test('fixture PRNG and deck permutation are deterministic and complete',()=>{
  const a=seededRandom(123),b=seededRandom(123);
  assert.deepEqual(Array.from({length:8},()=>a()),
    Array.from({length:8},()=>b()));
  const p=deckPermutation(60,seededRandom(456));
  assert.equal(p.length,60);
  assert.deepEqual([...p].sort((x,y)=>x-y),Array.from({length:60},(_,i)=>i));
});

test('native fixture loop resolves setup prompts, drives both seats and records a natural terminal',()=>{
  const originalRandom=Math.random;
  let agentsCreated=0;
  const result=runNativeFixtureGame(input({
    onRootAgentsCreated:seats=>{agentsCreated=seats.length;}
  }));

  assert.equal(Math.random,originalRandom);
  assert.equal(agentsCreated,2);
  assert.equal(result.schema,'aichi-native-fixture-game-v1');
  assert.equal(result.seed,0x12345678);
  assert.equal(result.randomizationProtocol,'xorshift32-physical-and-seat-policy-streams-v1');
  assert.deepEqual(result.policySeedBySeat,[
    (0x12345678^0x6a09e667)>>>0,
    (0x12345678^0xbb67ae85)>>>0
  ]);
  assert.equal(result.fixtureOnly,true);
  assert.equal(result.admissionEligible,false);
  assert.equal(result.competitiveGameQualified,false);
  assert.equal(result.finished,true);
  assert.equal(result.endReason,'engine-game-end');
  assert.equal(result.actualFirstPlayerSeat,0);
  assert.equal(result.candidateSeat,0);
  assert.equal(result.originalSourceSeat,1);
  assert.equal(result.winner,101);
  assert.equal(result.winnerSeat,0);
  assert.equal(result.actions,4);
  assert.deepEqual(result.actionCountsBySeat,[2,2]);
  assert.equal(result.decisionTrace.length,4);
  assert.equal(result.rootActionLedger.length,4);
  assert.equal(result.decisionTrace[0].pendingPromptType,'ShuffleDeckPrompt');
  assert.equal(result.decisionTrace[0].actionName,'ResolvePromptAction');
  assert.equal(result.decisionTrace[0].actionPayload.fields.result.length,60);
  assert.equal(typeof result.decisionTrace[1].actionPayload.fields.result,'boolean');
  assert.notEqual(result.decisionTrace[2].actionPayloadSha256,
    result.decisionTrace[3].actionPayloadSha256);
  assert.equal(result.rootActionLedger[0].actionPayloadSha256,
    result.decisionTrace[0].actionPayloadSha256);
  assert.equal(result.decisionTrace[0].promptResolution.kind,'shuffle');
  assert.equal(result.decisionTrace[0].promptResolution.ownerSeat,0);
  assert.equal(result.decisionTrace[0].promptResolution.cardCount,60);
  assert.match(result.decisionTrace[0].promptResolution.permutationSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.decisionTrace[1].promptResolution.kind,'coin-flip');
  assert.equal(typeof result.decisionTrace[1].promptResolution.result,'boolean');
  assert.equal(result.decisionTrace[0].publicStateAfter.pendingPrompts.length,1);
  assert.equal(result.decisionTrace[1].pendingPromptType,'CoinFlipPrompt');
  assert.equal(result.decisionTrace[1].publicStateAfter.phase,GamePhase.PLAYER_TURN);
  assert.equal(result.rootActionLedger[0].playerSlot,0);
  assert.equal(result.rootActionLedger[0].pendingPrompt,'ShuffleDeckPrompt');
  assert.equal(result.rootActionLedger[1].playerSlot,1);
  assert.equal(result.rootActionLedger[1].pendingPrompt,'CoinFlipPrompt');
  assert.equal(result.rootActionLedger[2].isRootDecision,true);
  assert.equal(result.rootActionLedger[3].isRootDecision,true);
  assert.match(result.decisionTraceSha256,/^[a-f0-9]{64}$/);
  assert.match(result.rootActionLedgerSha256,/^[a-f0-9]{64}$/);
  assert.match(result.finalPublicStateSha256,/^[a-f0-9]{64}$/);
  assert.equal(lastStore.state.gameSettings.format,Format.EXPANDED);
  assert.equal(lastStore.state.gameSettings.recordingEnabled,false);
  assert.equal(lastStore.state.rules.firstTurnDrawCard,true);
  assert.equal(lastStore.state.rules.firstTurnUseSupporter,false);
  assert.equal(lastStore.state.rules.attackFirstTurn,false);
  const shuffle=result.decisionTrace[0].publicStateAfter;
  assert.equal(shuffle.players[0].deckCount,60);
  assert.deepEqual([...lastStore.state.prompts[0].result].sort((a,b)=>a-b),
    Array.from({length:60},(_,i)=>i));
  assert.equal(typeof lastStore.state.prompts[1].result,'boolean');
});

test('native fixture loop rejects incomplete decks and restores Math.random on failure',()=>{
  const originalRandom=Math.random;
  assert.throws(()=>runNativeFixtureGame(input({deckA:deck('A').slice(1)})),
    /deckA must contain exactly 60/);
  assert.equal(Math.random,originalRandom);
});

test('native fixture loop refuses to treat an action cap as a natural game end',()=>{
  const originalRandom=Math.random;
  assert.throws(()=>runNativeFixtureGame(input({maxActions:1})),
    /exceeded maxActions without a natural terminal state/);
  assert.equal(Math.random,originalRandom);
});

test('stable string seeds map to the same uint32 value', () => {
  const seed = 'agent36-v3-fixture-hood-rank1-20261112-01';
  assert.equal(normalizeSeed32(seed), normalizeSeed32(seed));
  assert.notEqual(normalizeSeed32(seed), 0);
});
