'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectAttackCarryover,inspectNativeGameCarryover,SCHEMA}=
  require('../../simulation/evaluation/2026-11/agent43-native-attack-damage-carryover.cjs');

/** @param {number} ordinal @param {number} before @param {number|null} after @param {number} prizeBefore @param {number} prizeAfter */
function attack(ordinal,before,after,prizeBefore,prizeAfter) {
  return {
    actionOrdinal:ordinal,turnBefore:ordinal,
    attackName:'Sample Attack',settledPromptChain:true,
    settlementCrossesClockReset:false,
    publicBoardBefore:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Target',damage:before}}],
    publicBoardAfter:[{active:{printing:'Source',damage:0}},
      {active:after===null?null:{printing:'Target',damage:after}}],
    prizesBefore:[prizeBefore,6],prizesAfter:[prizeAfter,6]
  };
}
test('zero-Prize chip damage followed by same printed defender KO is provisional credit',()=>{
  const r=inspectAttackCarryover([
    attack(10,0,210,3,3),attack(20,210,null,3,0)],0);
  assert.equal(r.schema,SCHEMA);
  assert.equal(r.noPrizePositiveDamageCandidates.length,1);
  assert.equal(r.candidateTwoHitLinks.length,1);
  assert.equal(r.zeroPrizeDamageCountersBeforeLinkedKOs,21);
  assert.equal(r.linkedLaterNativePrizes,3);
  assert.equal(r.candidateTwoHitLinks[0].samePhysicalDefenderIndependentlyVerified,false);
  assert.equal(r.candidateTwoHitLinks[0].printedAttackPaperLegalityVerified,false);
  assert.equal(r.candidateTwoHitLinks[0].priorDamageCausallyProven,false);
});
test('two independent two-hit lines are counted once apiece',()=>{
  const a=attack(10,0,110,6,6),b=attack(20,110,null,6,4);
  const c=attack(30,0,110,4,4),d=attack(40,110,null,4,2);
  assert.equal(inspectAttackCarryover([a,b,c,d],0).candidateTwoHitLinks.length,2);
});
test('damage changed between roots, printing switched or healed breaks continuity',()=>{
  for(const mutate of [
    a=>{a[1].publicBoardBefore[1].active.damage=90;},
    a=>{a[1].publicBoardBefore[1].active.printing='Other';},
    a=>{a[0].publicBoardAfter[1].active.printing='Other';},
    a=>{a[1].publicBoardAfter[1].active={printing:'Target',damage:0};},
    a=>{a[1].prizesAfter[0]=6;},
    a=>{a[0].settledPromptChain=false;},
    a=>{a[1].settlementCrossesClockReset=true;}
  ]){
    const pair=[attack(10,0,110,6,6),attack(20,110,null,6,4)];
    mutate(pair);
    assert.equal(inspectAttackCarryover(pair,0).candidateTwoHitLinks.length,0);
  }
});
test('the setup attack must be positive damage and immediately take zero prizes',()=>{
  for(const mutate of [
    a=>{a[0].publicBoardAfter[1].active.damage=0;},
    a=>{a[0].publicBoardAfter[1].active.damage=15;},
    a=>{a[0].prizesAfter[0]=5;}
  ]){
    const pair=[attack(10,0,110,6,6),attack(20,110,null,6,4)];
    mutate(pair);
    assert.equal(inspectAttackCarryover(pair,0).noPrizePositiveDamageCandidates.length,0);
  }
});
test('only the immediately next same-player attack can receive any carryover link',()=>{
  const pair=[
    attack(10,0,110,6,6),
    attack(12,110,130,6,6),
    attack(20,130,null,6,4)
  ];
  const result=inspectAttackCarryover(pair,0);
  assert.equal(result.candidateTwoHitLinks.length,1);
  assert.equal(result.candidateTwoHitLinks[0].noPrizeAttackOrdinal,12);
  assert.equal(result.candidateTwoHitLinks[0].nextAttackOrdinal,20);
});
test('native two-player source/candidate summaries remain separate and unqualified',()=>{
  const source=[attack(10,0,210,3,3),attack(20,210,null,3,0)];
  const invert=attack(30,0,110,6,6);
  const invert2=attack(40,110,null,6,4);
  for(const item of [invert,invert2]){
    const a=item.publicBoardBefore[1].active;
    const b=item.publicBoardAfter[1].active;
    item.publicBoardBefore[0].active=a;
    item.publicBoardAfter[0].active=b;
    item.publicBoardBefore[1].active={printing:'Candidate',damage:0};
    item.publicBoardAfter[1].active={printing:'Candidate',damage:0};
    item.prizesBefore=[6,item.prizesBefore[0]];
    item.prizesAfter=[6,item.prizesAfter[0]];
  }
  const result=inspectNativeGameCarryover({
    trial:{id:'test'},sourceSeat:0,candidateSeat:1,
    sourceAttackSettlement:{attacks:source},
    candidateAttackSettlement:{attacks:[invert,invert2]}
  });
  assert.equal(result.source.candidateTwoHitLinks.length,1);
  assert.equal(result.candidate.candidateTwoHitLinks.length,1);
  assert.equal(result.totalCandidateTwoHitLinks,2);
  assert.equal(result.competitiveGameQualified,false);
});
