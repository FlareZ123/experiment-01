'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {auditHeavyBallExposure} = require('../scripts/aichi-rank10-heavy-ball-exposure.cjs');

/** @param {string} card */
function arm(card) {
  return {
    fullLiveDispatchTrace:[{action:'AddPlayerAction'},
      {action:'AddPlayerAction'},{action:'PlayCardAction'}],
    result:{decisionTrace:[{action:'PlayCardAction',card,playerSlot:1,
      turnBefore:7,actionOrdinal:3}],
    cardsPlayedBySeat:[{}, {[card]:1}]}
  };
}
test('detects root-store Heavy Ball from name-bearing card ledger', () => {
  const result=auditHeavyBallExposure({
    schema:'rank10-source-branch-live-dispatch-v1',trial:{id:'sample'},
    control:arm('Fog Crystal'),alternate:arm('Hisuian Heavy Ball')
  });
  assert.equal(result.arms[0].status,'not-played-in-this-deal');
  assert.deepEqual(result.arms[1].heavyBallPlays,[{turn:7,seat:1,ordinal:3}]);
});
test('refuses missing names, omitted plays and mismatched per-seat accounting', () => {
  const record={schema:'rank10-source-branch-live-dispatch-v1',
    trial:{id:'sample'},control:arm('Fog Crystal'),alternate:arm('Fog Crystal')};
  record.control.result.decisionTrace=[];
  assert.throws(()=>auditHeavyBallExposure(record));
  record.control=arm('Fog Crystal');
  record.alternate.result.cardsPlayedBySeat[1]={'Hisuian Heavy Ball':1};
  assert.throws(()=>auditHeavyBallExposure(record));
});
