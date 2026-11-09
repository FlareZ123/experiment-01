'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {inspect,compare}=
  require('../../simulation/evaluation/2026-11/agent22-temple-paid-denial-pair.cjs');
const registration=
  require('../../results/aichi-2026/registrations/agent22-temple-paid-denial-rank13-20261109.json');

/** @param {object} trial @param {'win'|'lose'|'cap'} result */
function row(trial,result='win'){
  const seat=trial.candidateSlot==='A'?0:1;
  return {trial,status:result==='cap'?'action-cap':'engine-terminal',
    finished:result!=='cap',
    endReason:result==='cap'?'action-limit':'engine-game-end',
    winner:result==='cap'?null:result==='win'?seat:1-seat,
    actualStarterSeat:seat,
    sourceDealFingerprint:'source-'+trial.seed,
    fullPhysicalDealFingerprint:'complete-'+trial.seed,
    rootActionLedger:[{action:'PassTurnAction',playerSlot:seat,turnBefore:2}],
    error:null};
}

test('prospective experiment has original rank13 16 groups and a single unchanged candidate 60',()=>{
  const result=inspect();
  assert.equal(result.registeredGroups,16);
  assert.equal(result.expectedNativeAttempts,32);
  assert.equal(result.paperQualifiedGames,0);
  assert.equal(new Set(registration.registeredTrials.map(x=>x.seed)).size,16);
  assert.ok(registration.registeredTrials.every(x=>x.rank===13&&
    x.candidateId==='temple-shadow-rider-v1'));
});

test('both arms share physical decks, and only genuine status and source starts can be compared',()=>{
  const control=registration.registeredTrials.map(trial=>row(trial));
  const treated=registration.registeredTrials.map(trial=>row(trial));
  treated[0].fullPhysicalDealFingerprint='different';
  treated[1].actualStarterSeat=1-treated[1].actualStarterSeat;
  const result=compare(control,treated);
  assert.equal(result.all.groups,16);
  assert.equal(result.matched.groups,14);
  assert.deepEqual(result.excluded,[
    registration.registeredTrials[0].id,
    registration.registeredTrials[1].id]);
  assert.equal(result.comparison?.paperQualifiedGames,undefined);
  assert.equal(result.paperQualifiedGames,0);
});

test('censored root-limited results widen native possible delta, never award fabricated wins',()=>{
  const control=registration.registeredTrials.map(trial=>row(trial,'lose'));
  const treated=registration.registeredTrials.map(trial=>row(trial,'lose'));
  control[0]=row(control[0].trial,'cap');
  treated[0]=row(treated[0].trial,'win');
  control[1]=row(control[1].trial,'lose');
  treated[1]=row(treated[1].trial,'cap');
  const result=compare(control,treated);
  assert.equal(result.all.treatmentWins,1);
  assert.equal(result.all.controlWins,0);
  assert.deepEqual(result.all.treatmentMinusControlWinBounds,[0,2]);
});
