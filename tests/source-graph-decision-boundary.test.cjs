'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeSourceGraphDecision}=
  require('../simulation/twinleaf/source-graph-decision-boundary.cjs');

function zone(cards=[]) {return {cards};}
function state() {
  const active={
    ...zone([{fullName:'Regidrago VSTAR SIT',damageTakenLastTurn:0}]),
    energies:zone([{fullName:'Double Dragon Energy ROS'}]),
    tools:zone(),damage:0,hp:280,pokemonPlayedTurn:0,
    specialConditions:[],poisonDamage:0,burnDamage:0
  };
  return {turn:5,phase:2,activePlayer:0,prompts:[],
    playerLastAttack:{},winner:null,players:[{
      id:10,deck:zone(),hand:zone(),discard:zone(),lostzone:zone(),
      stadium:zone(),supporter:zone(),prizes:[zone()],
      active,bench:[],usedGX:false,usedVSTAR:false,
      energyPlayedTurn:0,supporterTurn:0,retreatedTurn:0,
      stadiumPlayedTurn:0
    }]};
}

test('reports source graph mutation only at requested original bot decision',()=>{
  class Bot{
    decodeNextAction(s) {
      s.players[0].active.cards[0].damageTakenLastTurn++;
      return {name:'Apex Dragon'};
    }
  }
  const original=Bot.prototype.decodeNextAction;
  const monitor=observeSourceGraphDecision(Bot,2);
  try {
    const bot=new Bot(),s=state();
    bot.decodeNextAction(s);
    assert.equal(monitor.report.witness,null);
    bot.decodeNextAction(s);
    assert.equal(monitor.report.witness.ordinal,2);
    assert.equal(monitor.report.witness.chosenName,'Apex Dragon');
    assert.equal(monitor.report.witness.changedGraph.changedFields,1);
    assert.equal(monitor.report.witness.changedGraph.byKind['scalar-value'],1);
    assert.equal(monitor.report.witness.entryZoneDigest,
      monitor.report.witness.exitZoneDigest);
  } finally {monitor.restore();}
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});

test('captures sync error while restoring bot method',()=>{
  class Bot {
    decodeNextAction(s){
      s.players[0].active.damage=100;
      throw new Error('policy failure');
    }
  }
  const monitor=observeSourceGraphDecision(Bot,1);
  try {
    assert.throws(()=>new Bot().decodeNextAction(state()),/policy failure/);
    assert.equal(monitor.report.witness.chosenAction,'<threw>');
    assert.equal(monitor.report.witness.changedGraph.changedFields,1);
  } finally {monitor.restore();}
});
