'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {BASE,RANK,REPEATS,ACTION_CAP,fixedFrame,sha,summarizeGame,auditPair}=
  require('../simulation/twinleaf/rank8-hood-pressure-registered-v1.cjs');

test('fixed 16-deal frame matches frozen Agent15 preregistration exactly',()=>{
  assert.equal(BASE,20261019);
  assert.equal(RANK,8);
  assert.equal(REPEATS,8);
  assert.equal(ACTION_CAP,200);
  const a=[3580313645,3305309984,2227001189,3188254129,
    3609036223,3613796106,2209810282,161120940];
  const b=[1296269687,3900365967,4288638436,1506605601,
    2180029452,1619250289,4120584197,1218517344];
  const rows=fixedFrame();
  assert.deepEqual(rows,fixedFrame());
  assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(row=>row.seed)).size,16);
  for(let repeat=0;repeat<8;repeat++){
    assert.deepEqual(rows[2*repeat],
      {repeat,seed:a[repeat],candidateSeat:0,sourceSeat:1});
    assert.deepEqual(rows[2*repeat+1],
      {repeat,seed:b[repeat],candidateSeat:1,sourceSeat:0});
  }
});

test('actual-start and meaningful decision SHA are explicit and unqualified',()=>{
  const game={verifiedByDrawLog:true,firstTurnSlot:1,finished:false,
    actions:42,prizesRemaining:[6,4],decisionTrace:[{action:'PassTurnAction'}]};
  const result=summarizeGame(game);
  assert.equal(result.actualFirstTurnSlot,1);
  assert.equal(result.engineFinished,false);
  assert.equal(result.engineWinnerDiagnosticOnly,null);
  assert.equal(result.meaningfulDecisionTraceSha256,
    sha([{action:'PassTurnAction'}]));
  assert.equal(result.qualifiedCompetitiveGame,false);
  assert.throws(()=>summarizeGame({...game,verifiedByDrawLog:false}),
    /first-player proof missing/);
});

test('no-event control parity detects changes without inventing victories',()=>{
  const game={verifiedByDrawLog:true,firstTurnSlot:0,
    deckHashes:['source','candidate'],decisionTrace:[{action:'PassTurnAction'}]};
  const source={attempted:false},candidate={triggered:false};
  assert.equal(auditPair(game,game,source,candidate).noOpParityViolation,false);
  const altered={...game,decisionTrace:[{action:'PlayCardAction'}]};
  assert.equal(auditPair(game,altered,source,candidate).noOpParityViolation,true);
  assert.equal(auditPair(game,altered,{attempted:true},candidate)
    .noOpParityViolation,false);
});

test('reject divergent draw-log starts and deck identities independently',()=>{
  const a={verifiedByDrawLog:true,firstTurnSlot:0,
    deckHashes:['a','b'],decisionTrace:[]};
  const b={...a,firstTurnSlot:1,deckHashes:['b','a']};
  const r=auditPair(a,b,{attempted:false},{triggered:false});
  assert.equal(r.sameProvenStart,false);
  assert.equal(r.sameResolved60,false);
});
