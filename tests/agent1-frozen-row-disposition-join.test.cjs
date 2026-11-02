'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit}=require('../simulation/evaluation/agent1-frozen-row-disposition-join.cjs');
test('frozen release terminal uses real row fields and remains unqualified',()=>{
 const a={rawNativeResult:{rows:[{trial:{id:'x'},sourceSeat:1,candidateSeat:0,finished:true,winner:1,endReason:'engine-game-end'}]},releaseDisposition:{attempts:[{trialId:'x',nativeStatus:'UNREPORTED',observedEngineTerminal:null}],firstBlocker:'PAPER_PAYMENT_UNVERIFIED'}};
 const v=audit(a);
 assert.equal(v.rows[0].status,'NATIVE_TERMINAL');
 assert.equal(v.rows[0].nativeWinnerRole,'original-source');
 assert.equal(v.rows[0].statusMismatch,true);
 assert.equal(v.rows[0].terminalMismatch,true);
 assert.equal(v.competitiveGameQualified,false);
 assert.equal(v.firstBlocker,'PAPER_PAYMENT_UNVERIFIED');
});
