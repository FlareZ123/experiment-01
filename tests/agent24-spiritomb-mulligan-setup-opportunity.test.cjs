'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {model,main}=require(
  '../scripts/agent24-spiritomb-mulligan-setup-opportunity.cjs');

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,
  'Expected '+a+' ≈ '+b);
test('genuine 4-Basic original opponent model matches independent exact rational sum',()=>{
  const expected=[
    {copies:1,p:0.15880707796969574,gain:2.337010964821273},
    {copies:2,p:0.29633051639807633,gain:3.92298307708544},
    {copies:3,p:0.4152310320970058,gain:4.905253095429369},
    {copies:4,p:0.5178527297254188,gain:5.407828838463665}
  ];
  for(const e of expected){
    const r=model({lockCopies:e.copies,totalBasics:14,
      opponentBasics:4,bonusDrawLimit:6});
    near(r.setupLockChanceAfterBonusDraws,e.p);
    near(r.percentagePointGain,e.gain);
    near(r.opponentInitialMulliganChance,0.6005003742553344);
    near(r.opponentExpectedFailedInitialHands,1.5031312560956829);
  }
});
test('cap zero and an opponent with 60 Basics recover ordinary setup probability',()=>{
  for(let k=1;k<=4;k++){
    const none=model({lockCopies:k,totalBasics:14,
      opponentBasics:4,bonusDrawLimit:0});
    const never=model({lockCopies:k,totalBasics:14,
      opponentBasics:60,bonusDrawLimit:6});
    near(none.setupLockChanceAfterBonusDraws,none.initialSetupLockChance);
    near(never.setupLockChanceAfterBonusDraws,never.initialSetupLockChance);
    assert.equal(never.opponentInitialMulliganChance,0);
  }
});
test('drawing more legal bonus cards cannot reduce lock access',()=>{
  for(let copies=1;copies<=4;copies++){
    let prev=0;
    for(let cap=0;cap<=6;cap++){
      const result=model({lockCopies:copies,totalBasics:14,
        opponentBasics:4,bonusDrawLimit:cap});
      assert.ok(result.setupLockChanceAfterBonusDraws>=prev);
      prev=result.setupLockChanceAfterBonusDraws;
    }
  }
});
test('29 exact registered opponents and rank 6,24,29 four-Basic source census',()=>{
  const result=main();
  assert.equal(result.sourceOriginalDecks,29);
  assert.deepEqual(result.sourceRanksWithFourBasics,[6,24,29]);
  assert.equal(result.rows.length,29);
  assert.ok(result.rows.every(row=>row.scenarios.length===4));
  assert.equal(result.competitiveQualifiedGames,0);
});
test('invalid basic or bonus counts fail closed',()=>{
  assert.throws(()=>model({lockCopies:15,totalBasics:14,
    opponentBasics:4}));
  assert.throws(()=>model({lockCopies:1,totalBasics:14,
    opponentBasics:0}));
  assert.throws(()=>model({lockCopies:1,totalBasics:14,
    opponentBasics:4,bonusDrawLimit:48}));
});
