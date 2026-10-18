'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeSelectedCardFields,matchingDescriptor}=
  require('../simulation/twinleaf/selected-source-card-field-rollback.cjs');

class Card {
  constructor(fullName) {
    this.fullName=fullName;
    this.damageTakenLastTurn=0;
    this.movedToActiveThisTurn=false;
  }
}
function stateFor(card) {
  const zone=cards=>({cards});
  return {turn:3,activePlayer:0,players:[{
    active:zone([card]),bench:[],hand:zone([card]),deck:zone([]),
    discard:zone([]),lostzone:zone([]),prizes:[zone([])]
  }]};
}

test('descriptor equality detects primitive changes, additions and deletions',()=>{
  assert.equal(matchingDescriptor(undefined,undefined),true);
  const a={value:false,configurable:true,enumerable:true,writable:true};
  assert.equal(matchingDescriptor(a,{...a}),true);
  assert.equal(matchingDescriptor(a,{...a,value:true}),false);
  assert.equal(matchingDescriptor(undefined,a),false);
  assert.equal(matchingDescriptor(a,undefined),false);
});

test('restores exact own descriptors, including a previously absent field',()=>{
  class Bot {
    decodeNextAction(state) {
      const card=state.players[0].active.cards[0];
      card.movedToActiveThisTurn=true;
      card.cannotUseAttackUntilLeavesPlay=true;
      card.damageTakenLastTurn=160;
      return {name:'Apex Dragon',handIndex:0};
    }
  }
  const card=new Card('Regidrago VSTAR SIT');
  const initial=Object.getOwnPropertyDescriptor(card,'movedToActiveThisTurn');
  const original=Bot.prototype.decodeNextAction;
  const monitor=observeSelectedCardFields(Bot,Card,[
    'movedToActiveThisTurn','cannotUseAttackUntilLeavesPlay'
  ],{restoreFields:true});
  try {
    assert.equal(new Bot().decodeNextAction(stateFor(card)).name,'Apex Dragon');
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      card,'movedToActiveThisTurn'),initial);
    assert.equal(Object.hasOwn(card,'cannotUseAttackUntilLeavesPlay'),false);
    assert.equal(card.damageTakenLastTurn,160);
    assert.equal(monitor.report.changedProperties,2);
    assert.equal(monitor.report.changedDecisions,1);
    assert.equal(monitor.report.firstChangedDecision,1);
    assert.equal(monitor.report.decisionActions[0].handPrinting,card.fullName);
    assert.deepEqual(monitor.report.changesByField,{
      movedToActiveThisTurn:1,cannotUseAttackUntilLeavesPlay:1
    });
  } finally {monitor.restore();}
  assert.equal(Bot.prototype.decodeNextAction,original);
});

test('read-only observation leaves live Card changes intact',()=>{
  class Bot {
    decodeNextAction(state) {
      state.players[0].active.cards[0].whileInPlayOpponentWeakness='Psychic';
      return {name:'Pass'};
    }
  }
  const card=new Card('Gardevoir');
  const monitor=observeSelectedCardFields(Bot,Card,
    ['whileInPlayOpponentWeakness']);
  try {
    new Bot().decodeNextAction(stateFor(card));
    assert.equal(card.whileInPlayOpponentWeakness,'Psychic');
    assert.equal(monitor.report.changedProperties,1);
  } finally {monitor.restore();}
});

test('exception restores Card fields and inherited method descriptor',()=>{
  class Parent {
    decodeNextAction(state) {
      state.players[0].active.cards[0].movedToActiveThisTurn=true;
      throw new Error('bot failure');
    }
  }
  class Bot extends Parent {}
  const card=new Card('Mewtwo');
  const monitor=observeSelectedCardFields(Bot,Card,
    ['movedToActiveThisTurn'],{restoreFields:true});
  try {
    assert.throws(()=>new Bot().decodeNextAction(stateFor(card)),/bot failure/);
    assert.equal(card.movedToActiveThisTurn,false);
  } finally {monitor.restore();}
  assert.equal(Object.hasOwn(Bot.prototype,'decodeNextAction'),false);
});

test('rejects duplicates before modifying bot methods',()=>{
  class Bot {decodeNextAction(){return null;}}
  const original=Bot.prototype.decodeNextAction;
  assert.throws(()=>observeSelectedCardFields(
    Bot,Card,['damageTakenLastTurn','damageTakenLastTurn']),/distinct/);
  assert.equal(Bot.prototype.decodeNextAction,original);
});
