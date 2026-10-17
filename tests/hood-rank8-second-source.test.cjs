'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {selectFirstSecondSeed,summarizeGame,digest} =
  require('../simulation/twinleaf/hood-rank8-second-source.cjs');

function proof(seed, slot, winner = null) {
  return {seed,firstTurnSlot:slot,firstTurnPlayerId:slot===0?101:202,
    firstDrawLogName:slot===0?'research-A':'research-B',
    verifiedByDrawLog:true,winner};
}

test('first actual candidate-second seed is independent of winner', () => {
  const requested = [];
  const chosen = selectFirstSecondSeed(seed=>{
    requested.push(seed);
    return proof(seed,seed===4168858075?0:1,seed%2);
  });
  assert.deepEqual(requested,[4168858074,4168858075]);
  assert.equal(chosen.seed,4168858075);
  assert.equal(chosen.probes[0].candidateActualTurn,'first');
  assert.equal(chosen.probes[1].candidateActualTurn,'second');
  assert.deepEqual(Object.keys(chosen.probes[0]).sort(),
    ['candidateActualTurn','firstTurnSlot','seed']);
});

test('missing draw-log proof fails closed', () => {
  assert.throws(()=>selectFirstSecondSeed(seed=>({...proof(seed,0,1),
    verifiedByDrawLog:false})),/lacks validated draw-log/);
});

test('bounded seed search refuses expansion and overflow', () => {
  assert.throws(()=>selectFirstSecondSeed(seed=>proof(seed,1),4168858073,2),
    /No candidate-second seed/);
  assert.throws(()=>selectFirstSecondSeed(seed=>proof(seed,0),4294967295,1),
    /Invalid bounded seed/);
});

test('summary assigns physical B outcome without private hands', () => {
  const game={finished:true,winner:1,turns:9,actions:50,
    firstTurnSlot:0,verifiedByDrawLog:true,prizesRemaining:[2,0],
    cardsPlayedBySeat:[{'Float Stone':1},{'Stealthy Hood':1}],
    attackTrace:[{seat:0},{seat:1},{seat:1}],
    decisionTrace:[
      {actionOrdinal:14,turnBefore:2,playerSlot:1,action:'PlayCardAction',
        card:'Stealthy Hood',decisionHandBefore:{ownHandPrintings:['hidden']}},
      {actionOrdinal:15,turnBefore:2,playerSlot:1,action:'PlayCardAction',
        card:'Fog Crystal',decisionHandBefore:{ownHandPrintings:['hidden']}},
      {actionOrdinal:19,turnBefore:3,playerSlot:0,action:'AttackAction',attack:'Night Watch'}
    ]};
  const summary=summarizeGame(game);
  assert.equal(summary.candidateOutcome,'candidate');
  assert.deepEqual(summary.attackCounts,[1,2]);
  assert.equal(summary.keyChronology.length,2);
  assert.equal(summary.keyChronology[0].card,'Stealthy Hood');
  assert.ok(!JSON.stringify(summary).includes('hidden'));
  assert.equal(digest({a:1}),digest({a:1}));
});
