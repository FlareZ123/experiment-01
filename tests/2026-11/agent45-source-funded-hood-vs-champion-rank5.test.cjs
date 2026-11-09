'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/agent45-source-funded-hood-vs-champion-rank5-20261109.json');
const {verifyRegistration,compact,sourceMatched,winnerRange,compare}=
  require('../../simulation/evaluation/2026-11/agent45-source-funded-hood-vs-champion-rank5.cjs');

/** @param {object} batch @param {number} i @param {object} [overrides] */
function mockRow(batch,i,overrides={}){
  const group=reg.groups[i],slot=group.candidateSlot==='A'?0:1;
  const source=1-slot;
  return {
    trial:{...batch.registeredTrials[i]},
    finished:true,winner:slot,actionCount:120,
    error:null,actualStarterSeat:source,
    sourceDealFingerprint:'source-deal-'+i,
    fullPhysicalDealFingerprint:'full-deal-'+i+'-'+batch.candidateId,
    physicalZoneQualification:{status:'VERIFIED-NATIVE-ONLY'},
    rootActionLedger:[{actionOrdinal:0,turnBefore:1,playerSlot:source,
      action:'AttackAction',attack:'Cross Fusion Strike'}],
    ...overrides
  };
}

/** @returns {object[]} */
function fakeBatches(){
  return reg.batches.map(b=>({...b,rows:reg.groups.map((_,i)=>mockRow(b,i))}));
}

test('six fresh rank5 source deals are frozen before native execution',()=>{
  const x=verifyRegistration();
  assert.equal(x.registration.expectedNativeAttempts,24);
  assert.equal(x.registration.groups.filter(r=>r.candidateSlot==='A').length,3);
  assert.equal(x.registration.groups.filter(r=>r.candidateSlot==='B').length,3);
  assert.equal(x.hood.cards.reduce((n,c)=>n+c.count,0),60);
});
test('two different candidate full deals can share the same actual source deal',()=>{
  const b=fakeBatches();const a=compact(b[0].rows[0]);
  const h=compact(b[2].rows[0]);
  assert.notEqual(a.fullPhysicalDeal,h.fullPhysicalDeal);
  assert.equal(sourceMatched(a,h),true);
  h.actualStarterSeat=1-h.actualStarterSeat;
  assert.equal(sourceMatched(a,h),false);
});
test('all 24 native attempts are retained and no field claim is made',()=>{
  const x=compare(fakeBatches());
  assert.equal(x.status,'SOURCE-PHYSICALLY-MATCHED-DEVELOPMENT-ONLY');
  assert.equal(x.summary.returnedGames,24);
  assert.equal(x.summary.nativeTerminals,24);
  assert.equal(x.summary.sourceCrossFusionStrikes,24);
  assert.deepEqual(x.comparison.funded.sharpDifferenceBound,[0,0]);
  assert.equal(x.competitivelyQualifiedGames,0);
  assert.equal(x.finalDeckSelection,'none');
});
test('a genuine matched contender winner reversal changes signed native contrast',()=>{
  const batches=fakeBatches();
  batches[1].rows[0].winner=1;
  batches[3].rows[0].winner=0;
  const x=compare(batches);
  assert.equal(x.rows[0].funded.observedDelta,1);
  assert.deepEqual(x.comparison.funded.sharpDifferenceBound,[1,1]);
});
test('censored game preserves sharp candidate bound rather than counting a loss',()=>{
  const batches=fakeBatches();
  batches[3].rows[0]={...batches[3].rows[0],finished:false,winner:null,
    rootActionLedger:Array.from({length:260},(_,i)=>({
      actionOrdinal:i,playerSlot:0,turnBefore:i+1,action:'PassTurnAction'
    }))};
  const x=compare(batches);
  assert.equal(x.summary.nativeCaps,1);
  assert.equal(x.comparison.funded.bothTerminal,5);
  assert.deepEqual(x.comparison.funded.sharpDifferenceBound,[-1,0]);
  assert.equal(x.rows[0].arms[3].winner,null);
});
test('engine errors never become losses, and matched flag is kept separate',()=>{
  const batches=fakeBatches();
  batches[2].rows[0]={...batches[2].rows[0],error:'CANNOT_USE_POWER',
    finished:false};
  const x=compare(batches);
  assert.equal(x.summary.nativeErrors,1);
  assert.equal(x.summary.nativeTerminals,23);
  assert.equal(x.rows[0].baseline.bothTerminal,false);
  assert.equal(x.rows[0].arms[2].candidateNativeWin,false);
});
test('source physical mismatches invalidate aggregate even with 24 completed roots',()=>{
  const batches=fakeBatches();
  batches[3].rows[2].sourceDealFingerprint='different-source';
  const x=compare(batches);
  assert.equal(x.status,'INVALID-SOURCE-PHYSICAL-MISMATCHES');
  assert.equal(x.summary.allFourSourceMatchedGroups,5);
  assert.equal(x.comparison.funded.comparableGroups,5);
});
test('missing source physical fingerprint never supplies a paired comparison',()=>{
  const batches=fakeBatches();
  batches[1].rows[1].sourceDealFingerprint=null;
  const x=compare(batches);
  assert.equal(x.summary.allFourSourceMatchedGroups,5);
  assert.equal(x.rows[1].sourceFundingChangesChampion,null);
});
test('winner ranges distinguish known native winners from unresolved games',()=>{
  assert.deepEqual(winnerRange({status:'native-terminal',candidateNativeWin:true}),[1,1]);
  assert.deepEqual(winnerRange({status:'native-terminal',candidateNativeWin:false}),[0,0]);
  assert.deepEqual(winnerRange({status:'engine-error',candidateNativeWin:false}),[0,1]);
});
