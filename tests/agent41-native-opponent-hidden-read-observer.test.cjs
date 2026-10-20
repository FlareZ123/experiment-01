'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeOpponentHiddenReadObserver,VERSION}=
  require('../simulation/twinleaf/agent41-native-opponent-hidden-read-observer.cjs');

function makeState(turn=3) {
  return {
    turn,activePlayer:0,prompts:[],
    players:[
      {id:101,hand:{cards:[]},deck:{cards:[]},prizes:[]},
      {id:202,hand:{cards:['PRIVATE-HAND']},
        deck:{cards:['PRIVATE-DECK']},
        prizes:[{cards:['PRIVATE-PRIZE']}]}
    ]
  };
}

test('genuine actor proposal reads separated from native Simulator validation',()=>{
  class Bot{
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      assert.equal(state.players[1].deck.cards.length,1);
      this.isValidAction(state);
      assert.equal(state.players[1].prizes[0].cards.length,1);
      return {kind:'pass'};
    }
    isValidAction(state){
      assert.equal(state.players[1].hand.cards.length,1);
      return true;
    }
  }
  const state=makeState();
  const bot=new Bot();
  const originalDecode=Object.getOwnPropertyDescriptor(Bot.prototype,
    'decodeNextAction');
  const originalValidate=Object.getOwnPropertyDescriptor(Bot.prototype,
    'isValidAction');
  const originalDeck=Object.getOwnPropertyDescriptor(state.players[1].deck,
    'cards');
  const {result,audit}=withNativeOpponentHiddenReadObserver(
    Bot,()=>bot.decodeNextAction(state),{seat:0,turn:3});
  assert.deepEqual(result,{kind:'pass'});
  assert.equal(audit.version,VERSION);
  assert.equal(audit.observedNativeRoot,true);
  assert.equal(audit.proposalReads,2);
  assert.equal(audit.validationReads,1);
  assert.equal(audit.countsByPrivateZone['opponent-deck'].proposal,1);
  assert.equal(audit.countsByPrivateZone['opponent-hand'].validation,1);
  assert.equal(audit.nativeRootChangedDuringDecision,false);
  assert.equal(audit.actorInformationSetCertified,false);
  assert.equal(audit.competitiveGameQualified,false);
  assert.deepEqual(Object.getOwnPropertyDescriptor(state.players[1].deck,
    'cards'),originalDeck);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Bot.prototype,
    'decodeNextAction'),originalDecode);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Bot.prototype,
    'isValidAction'),originalValidate);
  assert.ok(!JSON.stringify(audit).includes('PRIVATE-'));
});

test('no qualifying root remains explicitly unobserved',()=>{
  class Bot{
    constructor(){this.client={id:101};}
    decodeNextAction(){return 'pass';}
    isValidAction(){return true;}
  }
  const {audit}=withNativeOpponentHiddenReadObserver(Bot,
    ()=>new Bot().decodeNextAction(makeState(4)),{seat:0,turn:3});
  assert.equal(audit.observedNativeRoot,false);
  assert.equal(audit.proposalReads,0);
  assert.equal(audit.nativeRootChangedDuringDecision,null);
});

test('real decision exceptions restore all native methods and hidden zones',()=>{
  class Bot{
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      assert.equal(state.players[1].deck.cards.length,1);
      throw new Error('native decision failure');
    }
    isValidAction(){return true;}
  }
  const state=makeState();
  const descriptor=Object.getOwnPropertyDescriptor(state.players[1].deck,
    'cards');
  const oldDecode=Bot.prototype.decodeNextAction;
  const oldValidate=Bot.prototype.isValidAction;
  assert.throws(()=>withNativeOpponentHiddenReadObserver(Bot,
    ()=>new Bot().decodeNextAction(state),{seat:0,turn:3}),
  error=>{
    assert.equal(error.message,'native decision failure');
    assert.equal(error.nativeHiddenReadEvidence.proposalReads,1);
    assert.equal(error.nativeHiddenReadEvidence.actorInformationSetCertified,
      false);
    return true;
  });
  assert.deepEqual(Object.getOwnPropertyDescriptor(state.players[1].deck,
    'cards'),descriptor);
  assert.strictEqual(Bot.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(Bot.prototype.isValidAction,oldValidate);
});

test('real bot writes are preserved, and explicitly reported as mutation',()=>{
  class Bot{
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      state.players[1].hand.cards=['REPLACED'];
      return 'pass';
    }
    isValidAction(){return true;}
  }
  const state=makeState();
  const {audit}=withNativeOpponentHiddenReadObserver(Bot,
    ()=>new Bot().decodeNextAction(state),{seat:0,turn:3});
  assert.equal(audit.nativeRootChangedDuringDecision,true);
  assert.deepEqual(state.players[1].hand.cards,['REPLACED']);
  assert.equal(Object.getOwnPropertyDescriptor(state.players[1].hand,
    'cards').get,undefined);
});
