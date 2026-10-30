'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {sourceFirstOwnedAffordances}=require(
  '../simulation/evaluation/agent1-source-first-owned-affordances.cjs');
const {firstTurnNativeClosureCensus}=require(
  '../simulation/evaluation/agent1-firstturn-native-closure-census.cjs');

/** @param {number} seat @param {number} turn @param {number} ordinal
 * @param {string} action @param {string[]} hand */
function decision(seat,turn,ordinal,action,hand){
  return {playerSlot:seat,turnBefore:turn,actionOrdinal:ordinal,action,
    decisionHandBefore:{perspectiveSeat:seat,ownHandPrintings:hand}};
}

/** @param {string} id @param {boolean} actuallyFirst
 * @param {object[]} decisionTrace @param {object[]} rootActionLedger */
function successfulRow(id,actuallyFirst,decisionTrace,rootActionLedger){
  const sourceSeat=actuallyFirst?1:0;
  return {trial:{id},sourceActuallyFirst:actuallyFirst,
    rootActionLedger,rootActionCount:rootActionLedger.length,
    sourceFirstOwnedAffordances:sourceFirstOwnedAffordances(
      decisionTrace,sourceSeat,actuallyFirst,rootActionLedger)};
}

function fixture(){
  const pass=successfulRow('6:0:A:champion-reference',true,[
    decision(1,1,0,'PassTurnAction',['Speed Lightning Energy RCL'])
  ],[{actionOrdinal:0,playerSlot:1,turnBefore:1,turnAfter:2,
    action:'PassTurnAction'}]);
  const effect=successfulRow('11:0:A:champion-reference',false,[
    decision(0,2,0,'PlayCardAction',['Boost Shake EVS'])
  ],[
    {actionOrdinal:0,playerSlot:0,turnBefore:2,turnAfter:2,
      action:'PlayCardAction',card:'Boost Shake'},
    {actionOrdinal:1,playerSlot:0,turnBefore:2,turnAfter:3,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:0}
  ]);
  const incomplete=successfulRow('6:1:A:champion-reference',false,[
    decision(0,2,0,'PlayCardAction',['Tag Call CEC'])
  ],[{actionOrdinal:0,playerSlot:0,turnBefore:2,turnAfter:2,
    action:'PlayCardAction',card:'Tag Call'}]);
  const error={trial:{id:'11:1:B:new-moon-lockbreaker-v1'},
    status:'engine-error'};
  return {schema:'agent41-preregistered-32-arm-canonical-scout-v1',
    registrationBlob:'test-only-registered',
    summary:{attempts:4},
    developmentResult:{rows:[pass,effect,incomplete,error]}};
}

test('all attempted games kept; native effect closure distinct from Pass',()=>{
  const original=fixture();
  const a=firstTurnNativeClosureCensus(original);
  assert.deepEqual(a.counts,{attempted:4,engineErrors:1,observedPass:1,
    observedNativeNonpass:1,incomplete:1});
  assert.equal(a.receipts[0].firstTurnClosure,'pass');
  assert.equal(a.receipts[1].firstTurnClosure,'native-nonpass-turn-end');
  assert.equal(a.receipts[1].nativeEndAction,'ResolvePromptAction');
  assert.equal(a.receipts[1].terminalOrdinal,1);
  assert.equal(a.receipts[2].status,'incomplete');
  assert.equal(a.receipts[3].status,'engine-error');
  assert.equal(a.competitiveQualifiedGames,0);
  assert.equal(JSON.stringify(a).includes('Speed Lightning Energy RCL'),false);
});

test('owner-seat contamination, mislabeled start and forged native end fail',()=>{
  const a=fixture();
  a.developmentResult.rows[1].rootActionLedger[1].playerSlot=1;
  assert.throws(()=>firstTurnNativeClosureCensus(a),/Expected values to be strictly equal/);
  const b=fixture();
  b.developmentResult.rows[1].sourceActuallyFirst=true;
  assert.throws(()=>firstTurnNativeClosureCensus(b),/Expected values to be strictly equal/);
  const c=fixture();
  c.developmentResult.rows[1].rootActionLedger[1].turnAfter=2;
  assert.throws(()=>firstTurnNativeClosureCensus(c),/Expected values to be strictly equal/);
});

test('first-owner native root mismatch fails even if result says observed',()=>{
  const a=fixture();
  a.developmentResult.rows[1].rootActionLedger[0].action='PassTurnAction';
  assert.throws(()=>firstTurnNativeClosureCensus(a),/Expected values to be strictly equal/);
});

test('reject noncontiguous Store turn and invented Pass on a nonpass path',()=>{
  const a=fixture();
  a.developmentResult.rows[1].rootActionLedger.splice(1,0,{
    actionOrdinal:9,playerSlot:0,turnBefore:3,turnAfter:3,
    action:'PlayCardAction'
  });
  a.developmentResult.rows[1].rootActionCount++;
  assert.throws(()=>firstTurnNativeClosureCensus(a));
  const b=fixture();
  b.developmentResult.rows[1].rootActionLedger[0].action='PassTurnAction';
  assert.throws(()=>firstTurnNativeClosureCensus(b));
});

test('reject mismatched attempt denominator and non-array native ledger',()=>{
  const a=fixture();
  a.summary.attempts=5;
  assert.throws(()=>firstTurnNativeClosureCensus(a));
  const b=fixture();
  b.developmentResult.rows[0].rootActionLedger=null;
  assert.throws(()=>firstTurnNativeClosureCensus(b));
});
