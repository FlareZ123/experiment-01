'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {verify}=require('../../simulation/evaluation/2026-11/agent12-psychic-reserve-v3-native.cjs');
const {compare}=require('../../simulation/evaluation/2026-11/agent12-psychic-reserve-v3-compare.cjs');
const reg=require('../../results/aichi-2026/registrations/agent12-psychic-reserve-v3-prospective-20261109.json');

test('frozen exact 60 and one-Stadium-to-Psychic substitution',()=>{
 assert.equal(verify(),true);
 assert.equal(new Set(reg.groups.map(x=>x.seed)).size,24);
 assert.equal(reg.expectedNativeAttempts,48);
});

test('source mismatch and censored outcomes never become native wins',()=>{
 const make=(id,index,finished,wins)=>{
  const g=reg.groups[index],seat=g.candidateSlot==='A'?0:1;
  return {trial:{...g,candidateId:id,id:[g.rank,g.repeat,g.candidateSlot,id].join(':')},
   actualStarterSeat:0,sourceDealFingerprint:index===0&&id===reg.candidateIds[1]?'mismatch':('deal'+index),
   finished,winner:finished?(wins?seat:1-seat):null,rootActionLedger:[],
   candidateAttackSettlement:{attacks:[]}};
 };
 const a={rows:reg.groups.map((g,i)=>make(reg.candidateIds[0],i,i!==1,false))};
 const b={rows:reg.groups.map((g,i)=>make(reg.candidateIds[1],i,i!==2,true))};
 const c=compare(a,b,reg);
 assert.equal(c.summary.registeredGroups,24);
 assert.equal(c.summary.physicallySourceMatched,23);
 assert.equal(c.summary.sourceUnmatched,1);
 assert.equal(c.summary.bothNativeTerminalMatched,21);
 assert.equal(c.field.v1.wins,0);
 assert.equal(c.field.v3.wins,23);
 assert.deepEqual(c.summary.sharpReserveMinusV1NativeWinCount,{low:22,high:23});
 assert.equal(c.summary.competitivePaperQualifiedGames,0);
});
