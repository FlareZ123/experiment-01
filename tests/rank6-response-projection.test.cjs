'use strict';

const assert=require('node:assert/strict');
const {publicTurnLedger,responseTurnEndingActionObserved}=
  require('../simulation/twinleaf/rank6-response-projection.cjs');
const hidden='SECRET_PRIZE_AND_HAND_CARD';
const trace=[
  {actionOrdinal:10,turnBefore:2,turnAfter:2,playerSlot:1,
    action:'PlayCardAction',card:'Guzma & Hala CEC',
    decisionHandBefore:[hidden]},
  {actionOrdinal:11,turnBefore:3,turnAfter:3,playerSlot:0,
    action:'PlayCardAction',card:'Shadow Rider Calyrex V',
    decisionHandBefore:[hidden],cardSelection:[hidden],
    prizesAfter:[6,6],decksAfter:[34,35]},
  {actionOrdinal:12,turnBefore:3,turnAfter:3,playerSlot:0,
    action:'AttackAction',attack:'Astral Barrage',
    cardSelection:[hidden],optionSelection:[hidden],
    prizesAfter:[6,6],decksAfter:[34,35]},
  {actionOrdinal:13,turnBefore:3,turnAfter:4,playerSlot:0,
    action:'PassTurnAction',decisionHandBefore:[hidden],
    prizesAfter:[6,6],decksAfter:[34,35]},
  {actionOrdinal:14,turnBefore:4,turnAfter:4,playerSlot:1,
    action:'PlayCardAction',card:hidden}
];
const before=JSON.stringify(trace);
const ledger=publicTurnLedger(trace,{seat:0,turn:3});
assert.deepEqual(ledger.map(x=>x.action),
  ['PlayCardAction','AttackAction','PassTurnAction']);
assert.equal(ledger[0].playedCard,'Shadow Rider Calyrex V');
assert.equal(ledger[1].announcedAttack,'Astral Barrage');
assert.equal(responseTurnEndingActionObserved(ledger),true);
assert.equal(ledger[2].turnEndingActionAccepted,true);
assert.equal(ledger[2].observedTurnNumberAdvanced,true);
assert.equal(JSON.stringify(ledger).includes(hidden),false);
assert.equal(JSON.stringify(trace),before);
assert.deepEqual(publicTurnLedger(trace,{seat:0,turn:2}),[]);
assert.equal(responseTurnEndingActionObserved([]),false);
assert.throws(()=>publicTurnLedger(trace,{seat:0,turn:3,limit:2}),
  /exceeding cap/);
assert.throws(()=>publicTurnLedger(trace,{seat:0,turn:0}));
process.stdout.write('rank6 public response projection: 10 assertions passed\n');
