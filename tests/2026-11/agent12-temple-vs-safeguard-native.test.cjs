'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/agent12-temple-mimikyu-versus-safeguard-fresh-20261109.json');
const {verify,compare,compactNative}=
  require('../../simulation/evaluation/2026-11/agent12-temple-vs-safeguard-native.cjs');

function makeBatch(index){
  return {rows:reg.batches[index].registeredTrials.map(trial=>{
    const ownerSeat=trial.candidateSlot==='A'?0:1;
    return {
      trial,finished:true,winner:index===0?ownerSeat:1-ownerSeat,
      actualStarterSeat:ownerSeat,
      sourceDealFingerprint:'source:'+trial.seed,
      fullPhysicalDealFingerprint:'full:'+index+':'+trial.seed,
      rootActionLedger:index===1?[
        {playerSlot:ownerSeat,action:'PlayCardAction',
         card:'Temple of Sinnoh',actionOrdinal:10,turnBefore:4},
        {playerSlot:1-ownerSeat,action:'PassTurnAction',
         actionOrdinal:11,turnBefore:5}
      ]:[],
      candidateAttackSettlement:{attacks:index===1?[
        {attackName:'Ghost Eye',settledPromptChain:{}}]:[]},
      sourceAttackSettlement:{attacks:[]}
    };
  })};
}

test('a single Stadium exchange leaves both frozen Sixties printed 60 cards',()=>{
  assert.deepEqual(verify().changes,[
    {name:"Player's Ceremony",original:1,temple:0},
    {name:'Temple of Sinnoh',original:0,temple:1}
  ]);
});

test('48 native Store-structured rows preserve observable Temple and Ghost Eye roots',()=>{
  const a=makeBatch(0),b=makeBatch(1),result=compare(a,b);
  assert.equal(result.summary.nativeAttempts,48);
  assert.equal(result.summary.matchedSourceDeals,24);
  assert.equal(result.summary.bothTerminalMatched,24);
  assert.deepEqual(result.summary.sharpTempleMinusSafeguardNativeWins,
    {low:-24,high:-24});
  assert.equal(result.summary.firstMirrorsSourceGroups,18);
  assert.equal(result.field[1].templePlays,24);
  assert.equal(result.field[1].ghostEyeSettled,24);
  assert.equal(result.field[1].sourcePassesAfterFirstTemple,24);
  assert.equal(result.byRank.find(x=>x.rank===24).groups,6);
});

test('censored, physically mismatched rows cannot fabricate winner advantage',()=>{
  const a=makeBatch(0),b=makeBatch(1);
  b.rows[0].finished=false;
  b.rows[0].winner=null;
  b.rows[1].sourceDealFingerprint='mismatch';
  const result=compare(a,b);
  assert.equal(result.summary.matchedSourceDeals,23);
  assert.equal(result.summary.bothTerminalMatched,22);
  assert.deepEqual(result.summary.sharpTempleMinusSafeguardNativeWins,
    {low:-23,high:-22});
  assert.equal(result.field[1].caps,1);
  assert.equal(result.groups[1].sharpDelta,null);
});

test('source Pass after Temple is an observation, never attack-denial proof',()=>{
  const r=compactNative(makeBatch(1).rows[0]);
  assert.equal(r.templeNativePlayRoots.length,1);
  assert.equal(r.sourcePassesAfterFirstTemple,1);
  assert.equal(r.sourceVoltCycloneDeclared,0);
  assert.equal(r.ghostEyeDeclared,1);
});
