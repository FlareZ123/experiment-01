'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {sourceCompressorRoots,runExperiment}=
  require('../simulation/evaluation/agent1-rank17-compressor-printing-transport.cjs');

test('only genuine owner-root Compressor plays count',()=>{
 const roots=[
  {playerSlot:1,action:'PlayCardAction',card:'Battle Compressor PHF'},
  {playerSlot:0,action:'PlayCardAction',card:'Battle Compressor'},
  {playerSlot:0,action:'PlayCardAction',card:'Battle Compressor PHF'},
  {playerSlot:0,action:'PassTurnAction',card:'Battle Compressor PHF'},
  {playerSlot:0,action:'PlayCardAction',card:'Counter Catcher PAR'}
 ];
 assert.equal(sourceCompressorRoots(roots,0).length,2);
 assert.equal(sourceCompressorRoots(roots,1).length,1);
});
const setup={reg:{schema:'pure-fixture',
 originalPrintingFingerprint:'fake',enginePin:'fake',
 seedGroups:[11,22,33,44],sourceSeats:[0,1]}};
/** @param {object} ignored */
function fake(_ignored,seed,seat,enabled){
 const key=seed+':'+seat;
 return {error:null,deckAHash:'A',deckBHash:'B',
  physicalDealHash:key,sourceDealHash:key,started:seat,
  sourceCompressorCount:enabled?1:0};
}
test('missing root ledger fails rather than reporting zero',()=>{
 assert.throws(()=>sourceCompressorRoots(null,0),/Root ledger required/);
});
test('eight source contexts and 16 actual attempted arms are retained',()=>{
 const r=runExperiment(fake,setup);
 assert.equal(r.attempted,16);
 assert.equal(r.completedPairs,8);
 assert.equal(r.matchedPairs,8);
 assert.equal(r.controlCompressor,0);
 assert.equal(r.treatmentCompressor,8);
 assert.ok(r.pairs.every(x=>x.physicalMatch));
 assert.equal(r.competitiveQualifiedGames,0);
});
test('physical-deal mismatch explicitly blocks matched comparisons',()=>{
 const r=runExperiment((s,seed,seat,enabled)=>{
  const a=fake(s,seed,seat,enabled);
  if(enabled)a.physicalDealHash='mismatch';
  return a;
 },setup);
 assert.equal(r.attempted,16);
 assert.equal(r.completedPairs,8);
 assert.equal(r.matchedPairs,0);
 assert.ok(r.pairs.every(x=>!x.physicalMatch));
});
test('native failure remains a registered arm and censors the pair',()=>{
 const r=runExperiment((s,seed,seat,enabled)=>{
  const a=fake(s,seed,seat,enabled);
  if(seed===11&&seat===0&&enabled)a.error='native error';
  return a;
 },setup);
 assert.equal(r.attempted,16);
 assert.equal(r.completedPairs,7);
 assert.equal(r.matchedPairs,7);
 assert.equal(r.competitiveQualifiedGames,0);
});
