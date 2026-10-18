'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {accrueActualStarts}=require('../scripts/aichi-outcome-blind-start-accrual.cjs');

const candidates=[0,0,0,1,0,1,0,1,0,1];
const registration={candidateEngineSlot:'B',quotas:{first:2,second:3},
  attempts:candidates.map((_,i)=>({gameId:'rank11-prospective-'+i,seed:9000+i}))};
/** @param {number} index @param {object} [extra] */
function row(index,extra={}) {
  const slot=candidates[index];
  const name=slot===0?'research-A':'research-B';
  return {gameId:registration.attempts[index].gameId,
    seed:registration.attempts[index].seed,firstTurnSlot:slot,
    verifiedByDrawLog:true,firstTurnPlayerId:slot===0?101:202,
    firstTurnPlayerName:name,firstDrawLogName:name,...extra};
}

test('actual engine first seat is stratified relative to the frozen candidate physical seat',()=>{
  const r=accrueActualStarts(registration,candidates.slice(0,5).map((_,i)=>row(i)));
  assert.equal(r.complete,false);
  assert.deepEqual(r.remainingQuotas,{first:1,second:0});
  assert.deepEqual(r.selectedPlannedTrials.map(x=>x.startingSeat),
    ['second','second','second','first']);
  assert.equal(r.retainedAttempts[3].selected,true);
  assert.equal(r.retainedAttempts[1].selected,true);
  assert.equal(r.retainedAttempts[4].selected,false);
});

test('fixed chronological quotas select earliest eligible starts and retain every rejected overflow seed',()=>{
  const r=accrueActualStarts(registration,candidates.slice(0,6).map((_,i)=>row(i)));
  assert.equal(r.complete,true);
  assert.equal(r.consumedAttempts,6);
  assert.deepEqual(r.selectedPlannedTrials.map(x=>x.gameId),
    ['rank11-prospective-0','rank11-prospective-1','rank11-prospective-2',
      'rank11-prospective-3','rank11-prospective-5']);
  assert.equal(r.retainedAttempts[4].reason,'surplus-start-stratum');
  assert.deepEqual(r.remainingQuotas,{first:0,second:0});
  assert.equal(r.qualifiedForCompetitiveInference,false);
});

test('selection cannot depend on winner, output, action count or other outcome metadata',()=>{
  const neutral=candidates.slice(0,6).map((_,i)=>row(i));
  const reversed=neutral.map((attempt,i)=>({...attempt,
    winner:i%2?'candidate':'opponent',finished:i%3===0,
    prizeDifference:i%2?6:-6,attackCount:30-i}));
  assert.deepEqual(accrueActualStarts(registration,neutral),
    accrueActualStarts(registration,reversed));
});

test('a missing first draw blocks accrual, preserves the failed attempt, and forbids later skip',()=>{
  const observed=[row(0),row(1,{verifiedByDrawLog:false})];
  const r=accrueActualStarts(registration,observed);
  assert.equal(r.blocked,true);
  assert.equal(r.complete,false);
  assert.equal(r.consumedAttempts,2);
  assert.equal(r.retainedAttempts[1].reason,'draw-log-qualification-blocked');
  const later=[...observed,row(2)];
  assert.throws(()=>accrueActualStarts(registration,later),
    /unverified first draw/);
});

test('the observer rejects silently reordered, duplicated and rewritten registered identities',()=>{
  assert.throws(()=>accrueActualStarts(registration,[row(1)]),/in order/);
  assert.throws(()=>accrueActualStarts(registration,[row(0,{seed:42})]),/in order/);
  assert.throws(()=>accrueActualStarts({...registration,
    attempts:[registration.attempts[0],registration.attempts[0]]},[]),/unique/);
  assert.equal(accrueActualStarts(registration,
    [row(0,{firstDrawLogName:'research-B'})]).blocked,true);
});

test('start order and seat name are tied to actual observed draw logs',()=>{
  const r=accrueActualStarts(registration,[row(0,{firstTurnPlayerId:202})]);
  assert.equal(r.blocked,true);
  assert.equal(r.retainedAttempts[0].actualStart,'unverified');
  assert.equal(r.selectedPlannedTrials.length,0);
});

test('fails closed on extraneous attempts after quota, unverified slot and prefix omissions',()=>{
  assert.throws(()=>accrueActualStarts(registration,
    candidates.slice(0,7).map((_,i)=>row(i))),/after the fixed quota/);
  assert.equal(accrueActualStarts(registration,[row(0,{firstTurnSlot:null})]).blocked,true);
  assert.throws(()=>accrueActualStarts(registration,[row(0),row(2)]),/in order/);
});

test('does not even access outcome-bearing properties on observations',()=>{
  const observed=candidates.slice(0,6).map((_,i)=>{
    const attempt=row(i);
    for(const name of ['outcome','winner','finished','actions','prizes']) {
      Object.defineProperty(attempt,name,{get(){throw new Error('Outcome read: '+name);}});
    }
    return attempt;
  });
  assert.equal(accrueActualStarts(registration,observed).complete,true);
});
