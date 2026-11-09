'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/2026-11/agent31-hood-arven-paid-owner-search-native-ab-20261109.json');
const {inspect,decode,compare}=
  require('../../simulation/evaluation/agent31/hood-arven-paid-search-native-pair.cjs');

const make=x=>({
  id:x.id,rank:x.rank,seed:x.seed,seat:x.candidateSlot==='A'?0:1,
  fullFingerprint:x.seed.toString(16),sourceFingerprint:x.seed.toString(16),
  actualStarterSeat:0,finished:true,nativeDisposition:'ENGINE_TERMINAL',
  nativeWinner:x.candidateSlot==='A'?0:1,
  candidateWon:true,
  acceptedNativeRoots:1,playedArven:0,playedStealthyHood:0,
  rootActionLedger:[{actionOrdinal:10,playerSlot:0,
    action:'PassTurnAction',turnBefore:1}]
});

test('Arven prospective panel retains 48 fresh authenticated independent physical seeds and exact Hood 60',()=>{
  const trials=inspect();
  assert.equal(trials.length,48);
  assert.equal(new Set(trials.map(t=>t.seed)).size,48);
  assert.equal(registration.nativeArms,96);
  assert.deepEqual(registration.policyArms.map(x=>x.arvenHoodSearch),
    [false,true]);
});

test('Real card-name owner native accepted Play roots are counted accurately',()=>{
  const trial=registration.groups[0],seat=0;
  const result=decode({
    trial,finished:true,endReason:'engine-game-end',
    winner:seat,rootActionLedger:[
      {playerSlot:seat,action:'PlayCardAction',card:'Arven'},
      {playerSlot:seat,action:'ResolvePromptAction'},
      {playerSlot:seat,action:'PlayCardAction',card:'Stealthy Hood'},
      {playerSlot:1,action:'PlayCardAction',card:'Stealthy Hood'},
      {playerSlot:seat,action:'PassTurnAction'}
    ]
  });
  assert.equal(result.finished,true);
  assert.equal(result.playedArven,1);
  assert.equal(result.playedStealthyHood,1);
  assert.equal(result.actualArvenSearchPromptChoices,1);
});

test('Matched full physical deals allow actual native winner attribution and retain missing terminals',()=>{
  const control=registration.groups.map(make);
  const treatment=registration.groups.map(make);
  treatment[0].nativeWinner=1;treatment[0].candidateWon=false;
  treatment[1].finished=false;treatment[1].nativeDisposition='ACTION_CAP';
  treatment[1].nativeWinner=null;treatment[1].candidateWon=false;
  const r=compare(control,treatment);
  assert.equal(r.summary.independentSourceDealGroups,48);
  assert.equal(r.summary.fullPhysicalMatched,48);
  assert.equal(r.summary.fullyComparable,48);
  assert.equal(r.summary.bothNaturallyTerminal,47);
  assert.equal(r.summary.nativeWinnerLosses,1);
  assert.equal(r.summary.nativeWinnerGains,0);
  assert.equal(r.summary.byArm.treatment.rootCaps,1);
  assert.equal(r.summary.paperQualifiedGames,0);
});

test('Same random seed alone does not establish physical comparison',()=>{
  const control=registration.groups.map(make);
  const treatment=registration.groups.map(make);
  treatment[0].fullFingerprint='different starter pokemon';
  treatment[0].candidateWon=false;
  treatment[0].nativeWinner=1;
  const r=compare(control,treatment);
  assert.equal(r.summary.fullPhysicalMatched,47);
  assert.equal(r.summary.fullyComparable,47);
  assert.equal(r.summary.nativeWinnerLosses,0);
});
