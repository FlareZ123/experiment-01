'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {observeBotDecisionSourceZones}=
  require('../simulation/twinleaf/decision-source-zone-observer.cjs');
test('read-only bot source-zone snapshot',()=>{
  const z={cards:[]},s={cards:[],energies:z,tools:[],damage:0,hp:0,
    pokemonPlayedTurn:0,specialConditions:[],poisonDamage:0,burnDamage:0};
  const p={id:1,active:s,bench:[],deck:z,hand:z,discard:z,lostzone:z,
    stadium:z,supporter:z,prizes:[z]};
  const state={phase:2,turn:3,activePlayer:0,winner:null,
    players:[p,p],prompts:[],playerLastAttack:{}};
  class Bot {decodeNextAction(){return 'pass';}}
  const original=Bot.prototype.decodeNextAction;
  const observer=observeBotDecisionSourceZones(Bot);
  try {
    assert.equal(new Bot().decodeNextAction(state),'pass');
    assert.equal(observer.report.decisions.length,1);
    assert.match(observer.report.decisions[0].digest,/^[a-f0-9]{64}$/);
  } finally {observer.restore();}
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
