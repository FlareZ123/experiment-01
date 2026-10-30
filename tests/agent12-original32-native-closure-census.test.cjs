'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {original32NativeClosures,frozenOriginal32NativeClosures} =
  require('../simulation/evaluation/agent12-original32-native-closure-census.cjs');

const root=(ordinal,turnBefore,turnAfter,action,playerSlot,extra={})=>({
  actionOrdinal:ordinal,turnBefore,turnAfter,action,playerSlot,...extra
});

function trial(id,ledger,sourceSeat){
  return {trial:{id,rank:11},rootActionCount:ledger.length,
    rootActionLedger:ledger,sourceSeat,sourceActuallyFirst:false};
}

function example(){
  const first=[
    root(0,0,1,'ResolvePromptAction',0),
    root(1,1,1,'PassTurnAction',0),
    root(2,1,2,'ResolvePromptAction',0,{initiatingRootActionOrdinal:1}),
    root(3,2,2,'PlayCardAction',1,{card:'Boost Shake'}),
    root(4,2,3,'ResolvePromptAction',-1,{initiatingRootActionOrdinal:3})
  ];
  const second=[
    root(0,0,1,'ResolvePromptAction',0),
    root(1,1,1,'PassTurnAction',0),
    root(2,1,2,'ResolvePromptAction',0,{initiatingRootActionOrdinal:1}),
    root(3,2,2,'AttackAction',1,{attack:'Rolling Iron'}),
    root(4,2,3,'ResolvePromptAction',-1,{initiatingRootActionOrdinal:3})
  ];
  return {schema:'agent41-preregistered-32-arm-canonical-scout-v1',
    summary:{attempts:2},developmentResult:{rows:[
      trial('11:1:A:champion-reference',first,1),
      trial('11:1:A:new-moon-lockbreaker-v1',second,1)]}};
}

test('all attempted arms retained; original prompt closed Item is attributed',()=>{
  const r=original32NativeClosures(example());
  assert.equal(r.totals.attempts,2);
  assert.equal(r.totals.nativeTurnEnds,4);
  assert.equal(r.totals.acceptedPassRoots,2);
  assert.equal(r.totals.acceptedAttackRoots,1);
  assert.equal(r.totals.terminalCardPlays,1);
  assert.equal(r.totals.unboundEnds,0);
  assert.equal(r.sourceTerminalCardPlays[0].cardName,'Boost Shake');
  assert.equal(r.sourceTerminalCardPlays[0].isSourceActor,true);
  assert.equal(r.competitiveQualifiedGames,0);
  console.log('PASS: physical source, native prompt, all roots retained');
});

test('strict expected arm count blocks selective skipping',()=>{
  const changed=example();changed.summary.attempts=3;
  assert.throws(()=>original32NativeClosures(changed));
  console.log('PASS: no dropped opponent arms');
});

test('repeated trial ID is refused',()=>{
  const changed=example();changed.developmentResult.rows[1].trial.id=
    changed.developmentResult.rows[0].trial.id;
  assert.throws(()=>original32NativeClosures(changed));
  console.log('PASS: no duplicate replay as independent sample');
});

test('a truncated root ledger fails acceptance',()=>{
  const changed=example();changed.developmentResult.rows[0].rootActionCount=6;
  assert.throws(()=>original32NativeClosures(changed));
  console.log('PASS: cap or incomplete run still needs intact accepted-root transcript');
});

test('an unverified archive can never borrow frozen original SHA identity',()=>{
  assert.throws(()=>frozenOriginal32NativeClosures(Buffer.from('{}')));
  console.log('PASS: immutable artifact source authentication is mandatory');
});
