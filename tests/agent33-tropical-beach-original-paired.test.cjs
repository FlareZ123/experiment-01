'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compare,attempt,publicBeachLedgerCounts}=
  require('../simulation/evaluation/agent33-tropical-beach-original-paired.cjs');
const X='a'.repeat(64),Y='b'.repeat(64),Z='c'.repeat(64);
const trial={id:'6:A',rank:6,candidateSlot:'A',seed:2348713281};
function row(treated=false){
 return {trial,treated,status:'native-capped-unqualified',
   engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
   fullDealSha256:X,sourceDealSha256:Y,
   candidateSixtySha256:Z,sourceSixtySha256:X,actualFirstPlayer:1,
   rootActionLedger:[{actionOrdinal:0,action:'PassTurnAction'}],
   beachProposalCounts:{use:treated?1:0},
   beachNativeConfirmed:{use:treated?1:0}};
}
test('real matching full physical starts are explicitly unqualified',()=>{
 const r=compare(row(),row(true));
 assert.equal(r.registeredPairedPhysicalStart,true);
 assert.equal(r.competitivelyQualified,false);
 assert.equal(r.treatmentBeachNativeConfirmed,1);
});
test('native errors never count as a matching physical start',()=>{
 const a=row();a.status='native-error-unqualified';
 const b=row(true);b.status='native-error-unqualified';
 const r=compare(a,b);
 assert.equal(r.firstPlayerMatch,false);
 assert.equal(r.registeredPairedPhysicalStart,false);
});
test('different original physical deal hash refuses paired comparison',()=>{
 const b=row(true);b.fullDealSha256=Y;
 assert.equal(compare(row(),b).registeredPairedPhysicalStart,false);
});
test('different source or candidate printed sixty refuses paired comparison',()=>{
 const b=row(true);b.candidateSixtySha256=Y;
 assert.equal(compare(row(),b).registeredPairedPhysicalStart,false);
});
test('missing first-player proof cannot become equality from undefined',()=>{
 const a=row(),b=row(true);
 a.actualFirstPlayer=undefined;b.actualFirstPlayer=undefined;
 assert.equal(compare(a,b).firstPlayerMatch,false);
});
test('one native exception retains an attempted error row in denominator',()=>{
 const a=attempt(trial,null,true,()=>{throw new Error('synthetic native error')});
 assert.equal(a.status,'native-error-unqualified');
 assert.equal(a.competitiveQualified,false);
 assert.ok('nativeAbortEvidence' in a);
});

test('generic PlayCardAction must never count as placing Tropical Beach',()=>{
  assert.deepEqual(publicBeachLedgerCounts([
    {action:'PlayCardAction',card:'Quick Ball'},
    {action:'PlayCardAction',card:'Temple of Sinnoh'},
    {action:'PlayCardAction',card:'Tropical Beach'},
    {action:'UseStadiumAction'}
  ]),{nativeStadiumUseActions:1,nativeBeachCardPlacements:1});
});
