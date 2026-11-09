'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/2026-11/agent31-lockbridge-hybrid-owner-counterpolicy-ab-20261109.json');
const {inspect,compare,diagnosis}=
  require('../../simulation/evaluation/agent31/lockbridge-paid-counterpolicy-paired.cjs');

const row=trial=>({
  id:trial.id,rank:trial.rank,seed:trial.seed,
  seat:trial.candidateSlot==='A'?0:1,
  fullPhysicalDealFingerprint:trial.seed.toString(16),
  sourceDealFingerprint:trial.seed.toString(16),
  actualStarterSeat:0,finished:true,
  nativeDisposition:'ENGINE_TERMINAL',
  winner:trial.candidateSlot==='A'?0:1,
  nativeCandidateWin:true, nativeRootCount:3,rootActionLedger:[],
  attemptedHoodPlayRoots:0,attemptedTemplePlayRoots:0,
  attemptedArvenPlayRoots:0
});

test('Fresh frozen 32 source physical groups are four ranks times both seats times four independent deals',()=>{
  const groups=inspect();
  assert.equal(groups.length,32);
  assert.equal(new Set(groups.map(g=>g.seed)).size,32);
  assert.deepEqual([...new Set(groups.map(g=>g.rank))],[6,11,13,24]);
  assert.equal(registration.nativeArms,64);
  assert.deepEqual(registration.policyArms.map(a=>a.id),['control','treatment']);
});

test('Native row diagnosis counts physical tool and stadium plays using bare card names',()=>{
  const trial=registration.groups[0];
  const seat=0;
  const actual={
    trial,finished:true,endReason:'engine-game-end',
    winner:seat,rootActionLedger:[
      {action:'PlayCardAction',playerSlot:seat,card:'Temple of Sinnoh'},
      {action:'PlayCardAction',playerSlot:seat,card:'Stealthy Hood'},
      {action:'PlayCardAction',playerSlot:seat,card:'Arven'},
      {action:'PlayCardAction',playerSlot:1,card:'Stealthy Hood'},
      {action:'PassTurnAction',playerSlot:seat}
    ]};
  const dx=diagnosis(actual);
  assert.equal(dx.finished,true);
  assert.equal(dx.attemptedTemplePlayRoots,1);
  assert.equal(dx.attemptedHoodPlayRoots,1);
  assert.equal(dx.attemptedArvenPlayRoots,1);
  assert.equal(dx.nativeCandidateWin,true);
});

test('Actual same-deck control/test treatment pairing retains all censored and root differences',()=>{
  const control=registration.groups.map(row);
  const treatment=registration.groups.map(row);
  const changed=treatment.find(x=>x.rank===13&&x.seat===1);
  changed.winner=0;changed.nativeCandidateWin=false;
  const capped=treatment.find(x=>x.rank===11&&x.seat===1);
  capped.finished=false;capped.nativeDisposition='ACTION_CAP';
  capped.winner=null;capped.nativeCandidateWin=false;
  const actual=compare(control,treatment);
  assert.equal(actual.summary.registeredPhysicalGroups,32);
  assert.equal(actual.summary.nativeGameAttempts,64);
  assert.equal(actual.summary.matchedFullPhysicalInitialDeals,32);
  assert.equal(actual.summary.matchedBothNaturallyTerminal,31);
  assert.equal(actual.summary.treatmentNativeWinnerLosses,1);
  assert.equal(actual.summary.treatmentNativeWinnerGains,0);
  assert.equal(actual.summary.byArm.treatment.actionCaps,1);
  assert.equal(actual.summary.paperQualifiedGames,0);
  assert.equal(actual.summary.competitiveWinRateClaim,null);
});

test('Mismatched full physical deal and starter veto same-seed causal contrasts',()=>{
  const control=registration.groups.map(row);
  const treatment=registration.groups.map(row);
  treatment[0].fullPhysicalDealFingerprint='DIFFERENT-CANDIDATE-PHYSICAL-DEAL';
  treatment[1].actualStarterSeat=1;
  treatment[0].nativeCandidateWin=false;treatment[0].winner=1;
  treatment[1].nativeCandidateWin=false;treatment[1].winner=1;
  const result=compare(control,treatment);
  assert.equal(result.summary.matchedFullPhysicalInitialDeals,31);
  assert.equal(result.summary.matchedStarterSeat,31);
  assert.equal(result.summary.comparableMatchedPhysicalGroups,30);
  assert.equal(result.summary.treatmentNativeWinnerLosses,0);
});
