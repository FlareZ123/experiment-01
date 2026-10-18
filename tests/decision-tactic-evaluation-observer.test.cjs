'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeOneDecisionTacticEvaluations}=
  require('../simulation/twinleaf/decision-tactic-evaluation-observer.cjs');

function zone(cards=[]) {return {cards};}
function state() {
  const p={id:101,deck:zone(),hand:zone([{fullName:'Ultra Ball'}]),
    discard:zone(),lostzone:zone(),stadium:zone(),supporter:zone(),
    active:{...zone([{fullName:'Regidrago VSTAR'}]),
      energies:zone([{fullName:'Double Dragon Energy'}]),
      tools:zone(),damage:0,hp:280,pokemonPlayedTurn:0,
      specialConditions:[],poisonDamage:0,burnDamage:0,
      getPokemonCard(){return this.cards[0];}},
    bench:[],prizes:[zone()],usedGX:false,usedVSTAR:false,
    energyPlayedTurn:0,supporterTurn:0,retreatedTurn:0,
    stadiumPlayedTurn:0};
  return {turn:13,phase:2,activePlayer:0,players:[p],
    prompts:[],playerLastAttack:{},winner:null};
}

test('one decision records original tactic score and validity, preserving decisions',()=>{
  class Tactic {
    getStateScore(){return 17;}
    evaluateAction(_state,_playerId,action) {
      return action.name==='Apex Dragon'?30:11;
    }
  }
  class Bot {
    decodeNextAction(s) {
      const tactic=new Tactic();
      const action={name:'Apex Dragon'};
      tactic.getStateScore(s,101);
      tactic.evaluateAction(s,101,action,0);
      return this.isValidAction(s,action)?action:undefined;
    }
    isValidAction(){return true;}
  }
  const base=Bot.prototype.decodeNextAction;
  const monitor=observeOneDecisionTacticEvaluations(Bot,Tactic,2);
  try {
    const bot=new Bot();
    assert.equal(bot.decodeNextAction(state()).name,'Apex Dragon');
    assert.equal(bot.decodeNextAction(state()).name,'Apex Dragon');
    const d=monitor.report.selectedDecision;
    assert.equal(d.index,2);
    assert.equal(d.evaluations.length,1);
    assert.equal(d.evaluations[0].score,30);
    assert.equal(d.baseScores[0].score,17);
    assert.equal(d.validations[0].accepted,true);
    assert.equal(d.ownHand[0],'Ultra Ball');
    assert.match(d.predecisionZoneDigest,/^[a-f0-9]{64}$/);
    assert.equal(d.selected.name,'Apex Dragon');
  } finally {monitor.restore();}
  assert.equal(monitor.report.decisionsObserved,2);
  assert.strictEqual(Bot.prototype.decodeNextAction,base);
});

test('failure unwinds observer context and preserves original descriptors',()=>{
  class Tactic {
    getStateScore(){return 0;}
    evaluateAction(){throw new Error('evaluation failed');}
  }
  class Bot {
    decodeNextAction(s){return new Tactic().evaluateAction(s,101,{});}
    isValidAction(){return true;}
  }
  const saved=Object.getOwnPropertyDescriptor(Tactic.prototype,'evaluateAction');
  const monitor=observeOneDecisionTacticEvaluations(Bot,Tactic,1);
  try {
    assert.throws(()=>new Bot().decodeNextAction(state()),/evaluation failed/);
    assert.equal(monitor.report.selectedDecision.selected,null);
  } finally {monitor.restore();}
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Tactic.prototype,'evaluateAction'),saved);
});

test('invalid ordinal fails before any method patch',()=>{
  class Tactic {
    getStateScore(){return 0;}
    evaluateAction(){return 0;}
  }
  class Bot {
    decodeNextAction(){return undefined;}
    isValidAction(){return false;}
  }
  const original=Bot.prototype.decodeNextAction;
  assert.throws(()=>observeOneDecisionTacticEvaluations(
    Bot,Tactic,0),/positive/);
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
