'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {verify,compare,candidateJetReceipts}=
  require('../../simulation/evaluation/2026-11/agent12-jet-conservation-v1-native.cjs');
const reg=require('../../results/aichi-2026/registrations/agent12-jet-conservation-v1-prospective-20261109.json');

test('policy blobs, immutable 60, frozen new seeds and 48 trials',()=>{
  assert.equal(verify(),true);
  assert.equal(reg.expectedNativeAttempts,48);
  assert.equal(new Set(reg.groups.map(g=>g.seed)).size,24);
});
test('actual accepted Store target is required for bench Jet evidence',()=>{
  const one=candidateJetReceipts({candidateSeat:1,nativeAcceptedTargetSidecar:{
    events:[{playerSlot:1,action:'PlayCardAction',storeAccepted:true,
      declared:{ownerHandPrinting:'Jet Energy PAL'},
      rootActionOrdinal:4,turnBefore:8,
      publicBoardChanges:[{seat:1,position:'bench',index:0,
        after:{pokemon:'Mimikyu PAL',energies:['Jet Energy PAL']}}]},
    {playerSlot:1,action:'PlayCardAction',storeAccepted:false,
      declared:{ownerHandPrinting:'Jet Energy PAL'}}]
  }});
  assert.equal(one.length,1);
  assert.equal(one[0].acceptedPositions[0].pokemon,'Mimikyu PAL');
});
test('source mismatch and uncertain winner remain explicit sharp bounds',()=>{
 const make=(i,id,win,finished=true)=>{const g=reg.groups[i];
   const seat=g.candidateSlot==='A'?0:1;
   return {trial:{...g,candidateId:id,id:[g.rank,g.repeat,g.candidateSlot,id].join(':')},
     actualStarterSeat:0,
     sourceDealFingerprint:i===0&&id===reg.candidateIds[1]?'other':('source'+i),
     finished,winner:finished?(win?seat:1-seat):null,
     rootActionLedger:[],candidateAttackSettlement:{attacks:[]},
     nativeAcceptedTargetSidecar:{events:[]}};
 };
 const c={rows:reg.groups.map((g,i)=>make(i,reg.candidateIds[0],false,i!==1))};
 const t={rows:reg.groups.map((g,i)=>make(i,reg.candidateIds[1],true))};
 const report=compare(c,t);
 assert.equal(report.summary.registeredSourceGroups,24);
 assert.equal(report.summary.actualNativeAttempts,48);
 assert.equal(report.summary.physicallyMatched,23);
 assert.equal(report.summary.matchedDoubleTerminals,22);
 assert.deepEqual(report.summary.sharpTreatmentMinusControlNativeWins,
   {low:22,high:23});
 assert.equal(report.summary.competitivePaperQualifiedGames,0);
});
