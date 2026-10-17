'use strict';

const assert=require('node:assert/strict');
const {publicTurnLedger,responseTurnEndingActionObserved,publicPrizeTransitions}=
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
const deferredPass=publicTurnLedger([{
  actionOrdinal:77,turnBefore:3,turnAfter:3,playerSlot:0,
  action:'PassTurnAction',prizesAfter:[6,6],decksAfter:[44,44]
}],{seat:0,turn:3});
assert.equal(deferredPass[0].observedTurnNumberAdvanced,false);
assert.equal(deferredPass[0].turnEndingActionAccepted,true);
assert.equal(responseTurnEndingActionObserved(deferredPass),true);
assert.throws(()=>publicTurnLedger(trace,{seat:0,turn:3,limit:2}),
  /exceeding cap/);
assert.throws(()=>publicTurnLedger(trace,{seat:0,turn:0}));
const beforePrizes=[
  {before:{turn:5,prizesRemaining:[6,6]},
    after:{prizesRemaining:[6,6]},action:'AttackAction'},
  {before:{turn:5,prizesRemaining:[6,6]},
    after:{prizesRemaining:[6,4]},action:'ResolvePromptAction',
    pendingPrompt:{kind:'ChoosePrizePrompt'},hiddenCard:'HIDDEN_PRIZE'}
];
const projected=publicPrizeTransitions(beforePrizes);
assert.equal(projected.length,1);
assert.equal(projected[0].rootActionOrdinal,1);
assert.deepEqual(projected[0].prizesBefore,[6,6]);
assert.deepEqual(projected[0].prizesAfter,[6,4]);
assert.equal(JSON.stringify(projected).includes('HIDDEN_PRIZE'),false);
process.stdout.write('rank6 public response projection: 19 assertions passed\n');
