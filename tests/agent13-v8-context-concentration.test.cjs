"use strict";

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION, summarizeContextCoverage} =
  require('../simulation/evaluation/agent13-v8-context-concentration.cjs');

/** @param {number} n @param {number} settled @param {number} prizes */
function events(n, settled, prizes) {
  const declarations = [], settlements = [];
  for (let i = 0; i < n; i++) {
    const ok = i < settled;
    declarations.push({originatingActionOrdinal:i * 10,
      attack:'printed-attack',settledPromptChain:ok});
    settlements.push({ordinal:i * 10,attack:'printed-attack',
      publicSettlement:ok,nextOpponentSameEpochCertified:ok,
      nextOpponentRoot:ok?{ordinal:i*10+1,turn:i+1,
        action:'PlayCardAction'}:null,
      ...(ok ? {prizeBefore:[6,6],prizeAfter:[6-(i<prizes?1:0),6]} : {})});
  }
  return {declarations,settlements};
}

/** @param {string} id @param {number|null} n @param {number} settled @param {number} prizes */
function row(id,n,settled=0,prizes=0){
  const [rank,,slot,candidateId] = id.split(':');
  const sourceSeat = slot==='A'?1:0;
  const e=n===null?null:events(n,settled,prizes);
  if(e)for(const x of e.settlements){
    if(!x.publicSettlement)continue;
    x.prizeBefore[sourceSeat]=6;
    x.prizeAfter[sourceSeat]=6-(x.ordinal/10<prizes?1:0);
  }
  return {id,rank:Number(rank),sourceSeat,candidateId,
    nativeDisposition:n===null?'engine-error':'root-cap-unqualified',
    acceptedRoots:n===null?100:128,
    publicRootHashPass:true,actualSourceSeatAuthenticated:true,
    candidateSeatAuthenticated:true,competitiveGameQualified:false,
    sourceOpeningFingerprint:'same-'+rank,
    sourceStoreAttackDeclarations:e?.declarations??null,
    actualAttackSettlements:e?.settlements??null,
    settledSourceAttackCount:e?settled:null};
}

function fixture(){
  const rows=[
    row('6:210:B:champion-reference',2,2,1),
    row('6:210:B:new-moon-lockbreaker-v1',null),
    row('11:211:A:champion-reference',13,13,2),
    row('11:211:A:new-moon-lockbreaker-v1',null),
    row('1:212:B:champion-reference',null),
    row('1:212:B:new-moon-lockbreaker-v1',5,4,0),
    row('3:213:A:champion-reference',null),
    row('3:213:A:new-moon-lockbreaker-v1',null)
  ];
  // One rank11 Knock Out took two Prizes after repeated Motivate attacks.
  for(const e of rows[2].actualAttackSettlements)e.prizeAfter[1]=6;
  rows[2].actualAttackSettlements[8].prizeAfter[1]=4;
  rows[3].sourceOpeningFingerprint='different-rank11';
  // The real v8 first follow-up actions: eight Pass, seven plays, four attacks.
  const replies=rows[2].actualAttackSettlements;
  for(let i=0;i<replies.length;i++)
    replies[i].nextOpponentRoot.action=i<8?'PassTurnAction':'PlayCardAction';
  for(const e of rows[5].actualAttackSettlements)
    if(e.publicSettlement)e.nextOpponentRoot.action='AttackAction';
  rows[0].actualAttackSettlements[0].nextOpponentRoot.action='PlayCardAction';
  rows[0].actualAttackSettlements[1].nextOpponentRoot.action='PlayCardAction';
  return {schema:'agent36-prospective-v8-original-field-native-census-v1',
    allNativeRootLedgersDigestVerified:true,rows,registeredAttempts:8,
    actualAttempts:8,competitiveGameQualifiedCount:0};
}

test('v8 authenticated settlement concentration is per context, not per root',()=>{
  const result=summarizeContextCoverage(fixture());
  assert.equal(result.schema,VERSION);
  assert.equal(result.originalNativeAttempts,8);
  assert.equal(result.sourceAttackTraceKnownContexts,3);
  assert.equal(result.sourceAttackTraceUnknownContexts,5);
  assert.equal(result.observedSettledAttackContexts,3);
  assert.equal(result.observedPrizeTakingContexts,2);
  assert.equal(result.totalKnownSourceDeclarations,20);
  assert.equal(result.totalKnownSourceSettlements,19);
  assert.equal(result.totalKnownSameEpochOpponentRoots,19);
  assert.deepEqual(result.immediateOpponentActionCounts,
    {AttackAction:4,PassTurnAction:8,PlayCardAction:7});
  assert.equal(result.totalObservedSourcePrizeTakingAttacks,2);
  assert.equal(result.totalObservedSourcePrizesTaken,3);
  assert.deepEqual(result.attackConcentration.map(x=>x.settledAttacks),[13,4,2]);
  assert.equal(result.highestSingleContextShare,13/19);
  assert.equal(result.pairedSourceDeals.filter(x=>x.physicalSameSourceDeal===false).length,1);
  assert.equal(result.estimatedWinRate,null);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.ok(result.rows.every(x=>x.independentGameSamples===0));
});

test('aborted missing trace is UNKNOWN, not recorded as zero attacks',()=>{
  const result=summarizeContextCoverage(fixture());
  const aborted=result.rows.filter(x=>x.attackTraceStatus.startsWith('unknown'));
  assert.equal(aborted.length,5);
  assert.ok(aborted.every(x=>x.attackDeclarations===null && x.settledAttacks===null));
});

test('a complete genuine zero-attack trace is distinct from an abort',()=>{
  const x=fixture();x.rows[0]=row('6:210:B:champion-reference',0,0);
  const out=summarizeContextCoverage(x);
  assert.equal(out.rows[0].settledAttacks,0);
  assert.equal(out.rows[0].attackTraceStatus,'observed-root-joined-store-trace');
  assert.equal(out.observedSettledAttackContexts,2);
});

test('inconsistent source attempt counts and unverified root ledgers reject',()=>{
  const x=fixture();x.registeredAttempts=7;
  assert.throws(()=>summarizeContextCoverage(x));
  const y=fixture();y.rows[0].publicRootHashPass=false;
  assert.throws(()=>summarizeContextCoverage(y));
});

test('tampered root to attack declaration association rejects',()=>{
  const x=fixture();x.rows[0].actualAttackSettlements[0].ordinal=44;
  assert.throws(()=>summarizeContextCoverage(x));
});

test('an unclosed attack declaration does not become a Prize award',()=>{
  const x=fixture();x.rows[5].actualAttackSettlements[4].prizeBefore=[6,6];
  x.rows[5].actualAttackSettlements[4].prizeAfter=[0,0];
  const result=summarizeContextCoverage(x);
  assert.equal(result.rows[5].sourcePrizesTaken,0);
});

test('invalid Prize increase and opponent-root assertion reject',()=>{
  const x=fixture();x.rows[0].actualAttackSettlements[0].prizeAfter=[7,7];
  assert.throws(()=>summarizeContextCoverage(x),/Prize transition/);
  const y=fixture();y.rows[0].actualAttackSettlements[0].nextOpponentRoot=null;
  assert.throws(()=>summarizeContextCoverage(y));
  const z=fixture();z.rows[0].actualAttackSettlements[0].nextOpponentRoot={action:'AttackAction'};
  assert.throws(()=>summarizeContextCoverage(z),/opponent action/);
});

test('duplicate registered IDs reject despite unchanged row count',()=>{
  const x=fixture();x.rows[1].id=x.rows[0].id;
  assert.throws(()=>summarizeContextCoverage(x));
});

test('missing source fingerprint remains null instead of being presumed paired',()=>{
  const x=fixture();x.rows[0].sourceOpeningFingerprint=null;
  const out=summarizeContextCoverage(x);
  const six=out.pairedSourceDeals.find(x=>x.group==='6:210:B');
  assert.equal(six.physicalSameSourceDeal,null);
});

test('empty but known traces expose no concentration ratio',()=>{
  const x=fixture();for(const r of x.rows){
    r.sourceStoreAttackDeclarations=[];r.actualAttackSettlements=[];
    r.settledSourceAttackCount=0;
  }
  const out=summarizeContextCoverage(x);
  assert.equal(out.totalKnownSourceSettlements,0);
  assert.equal(out.observedSettledAttackContexts,0);
  assert.equal(out.highestSingleContextShare,null);
});
