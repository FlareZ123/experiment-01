'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {prizeMovement,reciprocalStallCensus}=
  require('../simulation/evaluation/agent5-reciprocal-stall-census.cjs');

/** @param {number} n @param {object} [options] */
function fixture(n,options={}){
  const roots=[],attacks=[];
  for(let i=0;i<n;i++){
    const t=11+2*i;
    roots.push({
      turnBefore:t-1,playerSlot:1,action:'PassTurnAction'
    },{
      turnBefore:t,playerSlot:0,action:'AttackAction',
      attack:i===options.changedAt?'Other Attack':'Joust'
    });
    if(i!==options.missingAt){
      attacks.push({
        turnBefore:t,
        attackName:i===options.changedAt?'Other Attack':'Joust',
        publicBoardBefore:[
          {active:{name:'Klefki'}},{active:{name:'Electrode-GX'}}
        ],
        prizesBefore:[6,6],prizesAfter:
          i===n-1?[4,6]:[6,6],
        settledPromptChain:true
      });
    }
  }
  return {
    trial:{id:'9:0:A:new-moon-lockbreaker-v1'},
    sourceSeat:1,candidateSeat:0,
    rootActionLedger:roots,
    candidateAttackSettlement:{attacks},
    sourceAttackSettlement:{attacks:[]},
    finished:true,qualifiesForCompetitiveInference:false
  };
}

test('19 authentic-shaped Joust roots versus 19 prior passes are counted once',()=>{
  const out=reciprocalStallCensus(fixture(19));
  assert.equal(out.streaks.length,1);
  assert.equal(out.policyReviewTriggered,true);
  assert.equal(out.bySeat[0].attackRoots,19);
  assert.equal(out.bySeat[1].passRoots,19);
  assert.deepEqual(out.streaks[0],{
    passSeat:1,attackSeat:0,attackName:'Joust',attackerActive:'Klefki',
    firstPassTurn:10,lastPassTurn:46,
    firstAttackTurn:11,lastAttackTurn:47,
    consecutivePairs:19,confirmedNoPrizeCount:18,
    unresolvedPrizeCount:0,finalAttackPrizeMovement:true,
    allBeforeFinalPrizeStable:true,sourcePasses:19,
    requiresPolicyReview:true
  });
});

test('a changing named attack splits the repeated-action window',()=>{
  const out=reciprocalStallCensus(fixture(19,{changedAt:9}));
  assert.equal(out.streaks.length,2);
  assert.deepEqual(out.streaks.map(s=>s.consecutivePairs),[9,9]);
  assert.equal(out.policyReviewTriggered,false);
});

test('an unverified attack settlement does not certify a stall',()=>{
  const out=reciprocalStallCensus(fixture(19,{missingAt:8}));
  assert.equal(out.streaks[0].consecutivePairs,19);
  assert.equal(out.streaks[0].unresolvedPrizeCount,1);
  assert.equal(out.streaks[0].requiresPolicyReview,false);
});

test('missing turn and switched seat break a contiguous actor cycle',()=>{
  const x=fixture(19);
  x.rootActionLedger=x.rootActionLedger.filter(
    row=>row.turnBefore!==24);
  assert.deepEqual(
    reciprocalStallCensus(x).streaks.map(s=>s.consecutivePairs),[7,11]);
});

test('a missing full-game ledger produces an unqualified empty census',()=>{
  const out=reciprocalStallCensus({});
  assert.deepEqual(out.streaks,[]);
  assert.equal(out.policyReviewTriggered,false);
  assert.equal(out.actualOutcomeUnqualified,true);
});

test('a valid settled Prize change is distinguished from unverifiable data',()=>{
  assert.equal(prizeMovement({settledPromptChain:true,prizesBefore:[6,6],prizesAfter:[5,6]}),true);
  assert.equal(prizeMovement({settledPromptChain:true,prizesBefore:[6,6],prizesAfter:[6,6]}),false);
  assert.equal(prizeMovement({settledPromptChain:true,prizesBefore:[],prizesAfter:[]}),null);
  assert.equal(prizeMovement(undefined),null);
  assert.throws(()=>reciprocalStallCensus({},{
    minPairs:10,reviewPairs:9
  }),RangeError);
});


test('unresolved or cross-episode Prize arrays never count as settled',()=>{
  const pseudo={prizesBefore:[6,6],prizesAfter:[6,6]};
  assert.equal(prizeMovement(pseudo),null);
  assert.equal(prizeMovement({...pseudo,settledPromptChain:false}),null);
  assert.equal(prizeMovement({...pseudo,settledPromptChain:true,
    settlementCrossesClockReset:true}),null);
  const unresolved=fixture(19);
  unresolved.candidateAttackSettlement.attacks[8].settledPromptChain=false;
  assert.equal(reciprocalStallCensus(unresolved).streaks[0].unresolvedPrizeCount,1);
  assert.equal(reciprocalStallCensus(unresolved).policyReviewTriggered,false);
  const crossEpoch=fixture(19);
  crossEpoch.candidateAttackSettlement.attacks[8].settlementCrossesClockReset=true;
  assert.equal(reciprocalStallCensus(crossEpoch).policyReviewTriggered,false);
});
