'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {attestBilateralRootClaims:attest}=
  require('../simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs');

/** Source seat 0 plays turn 1; candidate seat 1 responds on turn 2. */
function fixture(){
  const ledger=[
    {actionOrdinal:0,turnBefore:1,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,turnBefore:1,playerSlot:0,action:'ResolvePromptAction'},
    {actionOrdinal:2,turnBefore:2,playerSlot:1,action:'PlayCardAction'},
    {actionOrdinal:3,turnBefore:2,playerSlot:1,action:'AttackAction'},
    {actionOrdinal:4,turnBefore:3,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:5,turnBefore:3,playerSlot:0,action:'PassTurnAction'}
  ];
  const row={
    rootActionCount:ledger.length,actualStarterSeat:0,
    sourcePressure:{rootActionOrdinal:0,turnBefore:1,
      completionOrdinal:1,completionTurnBefore:1,
      accepted:true,effectVerified:true,traceAuthenticated:true},
    candidateReply:{rootActionOrdinal:2,turnBefore:2,
      observed:true,legal:true,traceAuthenticated:true},
    sourceContinuation:{rootActionOrdinal:4,turnBefore:3,
      observed:true,legal:true,traceAuthenticated:true}
  };
  return {ledger,row};
}

test('actual ordered Store root chain authenticates only its action claims',()=>{
  const {ledger,row}=fixture(),r=attest(row,ledger,1);
  assert.equal(r.checkedRoots,6);
  assert.equal(r.rootClaimsAuthenticated,true);
  assert.equal(r.sourceFirstTurnPressureAuthenticated,true);
  assert.equal(r.effectAndPaperFidelityAuthenticated,false);
  assert.equal(r.hiddenPolicyInformationSetAuthenticated,false);
  assert.ok(Object.isFrozen(r));
});

test('printed positive booleans cannot hide a wrong physical actor',()=>{
  const {ledger,row}=fixture();
  row.candidateReply.rootActionOrdinal=1;
  const r=attest(row,ledger,1);
  assert.equal(r.candidateReply,false);
  assert.equal(r.rootClaimsAuthenticated,false);
  assert.equal(r.sourceFirstTurnPressureAuthenticated,false);
});

test('wrong turn and wrong source continuation fail without inventing an attack',()=>{
  const {ledger,row}=fixture();
  row.sourcePressure.completionTurnBefore=2;
  let r=attest(row,ledger,1);
  assert.equal(r.pressureCompletion,false);
  assert.equal(r.rootClaimsAuthenticated,false);
  row.sourcePressure.completionTurnBefore=1;
  row.sourceContinuation.rootActionOrdinal=3;
  r=attest(row,ledger,1);
  assert.equal(r.sourceContinuation,false);
  assert.equal(r.rootClaimsAuthenticated,false);
});

test('ledger must be contiguous and include every successful root',()=>{
  const {ledger,row}=fixture();
  assert.throws(()=>attest(row,ledger.slice(0,-1),1),
    /every successful Store root/);
  ledger[3].actionOrdinal=5;
  assert.throws(()=>attest(row,ledger,1),
    /consecutive root ordinal/);
});

test('forged native root transcript with reversed or skipped game turns rejects',()=>{
  const {ledger,row}=fixture();
  ledger[5].turnBefore=2;
  assert.throws(()=>attest(row,ledger,1),
    /cannot skip or reverse global turns/);
  ledger[5].turnBefore=3;
  ledger[4].turnBefore=5;
  assert.throws(()=>attest(row,ledger,1),
    /cannot skip or reverse global turns/);
});

test('an extra candidate turn needs its own native grant and next-turn roots',()=>{
  const {ledger,row}=fixture();
  ledger.splice(4,0,
    {actionOrdinal:4,turnBefore:3,playerSlot:1,action:'PassTurnAction'});
  ledger[5].actionOrdinal=5;
  ledger[5].turnBefore=4;
  ledger[6].actionOrdinal=6;
  ledger[6].turnBefore=4;
  row.rootActionCount=7;
  row.sourceContinuation.rootActionOrdinal=5;
  row.sourceContinuation.turnBefore=4;
  let r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,false);
  row.candidateBonusTurn={
    grantRootActionOrdinal:3,grantTurnBefore:2,
    completionOrdinal:3,completionTurnBefore:2,
    nextOwnRootActionOrdinal:4,nextOwnTurnBefore:3
  };
  r=attest(row,ledger,1);
  assert.equal(r.bonusTurnRootChain,true);
  assert.equal(r.rootClaimsAuthenticated,true);
  ledger[4].playerSlot=0;
  assert.equal(attest(row,ledger,1).bonusTurnRootChain,false);
});

test('source-first designation follows real start and source seat',()=>{
  const {ledger,row}=fixture();
  row.actualStarterSeat=1;
  const r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,true);
  assert.equal(r.sourceFirstTurnPressureAuthenticated,false);
});

test('supplying a raw trace never certifies lock effects or paper rules',()=>{
  const {ledger,row}=fixture();
  row.paperRuleAuditPassed=true;
  row.sourcePressure.effectVerified=true;
  row.fullPolicyInformationSetAuditPassed=true;
  const r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,true);
  assert.equal(r.effectAndPaperFidelityAuthenticated,false);
  assert.equal(r.hiddenPolicyInformationSetAuthenticated,false);
});
