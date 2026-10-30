'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceBoard}=require('../simulation/twinleaf/agent1-rank11-six-original-policy-control.cjs');
const {compare}=require('../simulation/twinleaf/agent1-rank11-six-source-policy-pair.cjs');

test('public source-board snapshot requires only face-up cards and public counts',()=>{
  const source={
    active:{getPokemonCard:()=>({fullName:'Oranguru V ASR'})},
    bench:[
      {getPokemonCard:()=>({name:'Garbodor'}),tools:[{name:'Float Stone'}]},
      {getPokemonCard:()=>({name:'Garbodor'}),tools:[{name:'Forest Seal Stone'}]},
      {getPokemonCard:()=>null,tools:[]}
    ],
    usedVSTAR:true,prizes:[{cards:[{}]},{cards:[{}]}]
  };
  assert.deepEqual(sourceBoard(source,3),{
    turn:3,active:'Oranguru V ASR',equippedGarbodorCount:1,
    usedVSTAR:true,remainingPrizes:2
  });
});

function fixture(){
  const treatment={
    schema:'agent1-rank11-six-native-opponent-return-v1',
    registrationSha256:'frozen-six-original-deals',
    engineRevision:'pinned-original-engine',scheduled:6,attempted:6,
    rows:Array.from({length:6},(_,index)=>({
      index,seed:index+10,originalK0Replayed:true,
      witness:{atOpponentOriginalRoot:true,sourceEquippedGarbodor:true},
      status:'native-opponent-turn-returned-to-source-root',
      opponentFirstRootObserved:true,sourceReturnObserved:true,
      opponentRootProposals:[{kind:'PassTurnAction'}],
      afterOpponentPublic:{
        sourceEquippedGarbodorCount:1,sourceRemainingPrizes:6}
    }))
  };
  const control={
    version:'agent1-rank11-six-unaltered-bot-source-reply-v1',
    frameSha256:'frozen-six-original-deals',
    engineRevision:'pinned-original-engine',scheduled:6,attempted:6,
    rows:treatment.rows.map(row=>({
      index:row.index,seed:row.seed,originalK0Replayed:true,
      status:'native-unmodified-opponent-turn-returned-source-root',
      opponentFirstRoot:true,sourceReturnRoot:true,
      opponentRootProposals:[{kind:'PassTurnAction'}],
      atOpponentFirstRoot:{equippedGarbodorCount:0},
      afterOpponentPublic:{equippedGarbodorCount:0,remainingPrizes:6}
    }))
  };
  return {treatment,control};
}

test('paired six seeds preserve native outcome taxonomy and source board difference',()=>{
  const {treatment,control}=fixture();
  const report=compare(treatment,control);
  assert.equal(report.sameOriginalSeedAndK0Pairs,6);
  assert.equal(report.treatmentSourceReturns,6);
  assert.equal(report.controlSourceReturns,6);
  assert.equal(report.treatmentEquippedAfter,6);
  assert.equal(report.controlEquippedAfter,0);
  assert.equal(report.competitiveQualifiedGames,0);
  assert.deepEqual(report.rows.map(x=>x.seed),[10,11,12,13,14,15]);
});

test('different physical source seed blocks pairing',()=>{
  const {treatment,control}=fixture();
  control.rows[0].seed=999;
  assert.throws(()=>compare(treatment,control),/Different original physical deal seeds/);
});

test('missing original first owner hand replay blocks pairing',()=>{
  const {treatment,control}=fixture();
  control.rows[2].originalK0Replayed=false;
  assert.throws(()=>compare(treatment,control));
});
