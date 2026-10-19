'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeBunnelbyReadiness,FIELDS}=require(
  '../scripts/aichi-rank15-bunnelby-readiness-audit.cjs');

/** @returns {object} Synthetic matched physical games, not engine evidence. */
function fixture() {
  const stage=(turn,targets=1)=>({
    turn,opponentBoard:['Bunnelby PRC',
      ...Array.from({length:targets},(_,i)=>
        i===0?'Oddish UNB':'Gloom UNB')]
  });
  const arm=(i,boosted)=>{
    const active=boosted?i<4:i%2===0;
    const tm=boosted?i<3:i===0||i===2;
    const ready=boosted?i<2:i===0;
    return {
      first:{
        sourceBunnelbyActive:active?stage(3):null,
        sourceBunnelbyActiveWithTM:tm?stage(5):null,
        sourceBunnelbyActiveWithTMAndEnergy:ready?stage(7,
          boosted&&i===1?0:2):null,
        twoSourceStageLineSlots:i===0?stage(9):null,
        fullSourceBenchBelowTwoStageLines:i===7?stage(4):null
      },
      firstNormalTurnPrizeGate:{beforeTakingPrizesEligible:i<5},
      policyActions:{nativeSourceAttackDeclarations:{evolutionAnnouncements:0}}
    };
  };
  return {
    schema:'newmoon-rank15-authentic-bunnelby-opponent-policy-pair-v1',
    opportunityPairs:8,sourceDeckAndInitialDealMatchedInEveryPair:true,
    qualifiedForCompetitiveInference:false,
    rows:Array.from({length:8},(_,i)=>({
      repeat:Math.floor(i/2),candidateSeat:i%2,actualFirstSlot:i%2,
      originalSourceDealDigest:'test-digest-'+i,
      identicalPrepolicySourceDeal:true,
      generic:arm(i,false),bunnelbyEvolution:arm(i,true)
    }))
  };
}

test('counts all actual-root physical readiness stages without claiming attacks',()=>{
  const output=summarizeBunnelbyReadiness(fixture());
  assert.equal(output.sourceTrialCount,8);
  assert.equal(output.qualifiedForCompetitiveInference,false);
  const g=output.aggregate.generic;
  const e=output.aggregate.bunnelbyEvolution;
  assert.equal(g.initialPrizeEligible,5);
  assert.equal(g.eventCounts.sourceBunnelbyActive,4);
  assert.equal(g.eventCounts.sourceBunnelbyActiveWithTM,2);
  assert.equal(g.eventCounts.sourceBunnelbyActiveWithTMAndEnergy,1);
  assert.equal(e.eventCounts.sourceBunnelbyActive,4);
  assert.equal(e.eventCounts.sourceBunnelbyActiveWithTM,3);
  assert.equal(e.eventCounts.sourceBunnelbyActiveWithTMAndEnergy,2);
  assert.equal(e.readyWithAtLeastOneEvolutionTarget,1);
  assert.equal(e.declaredEvolutionTotal,0);
});

test('refuses legacy root observers lacking critical physical readiness fields',()=>{
  const source=fixture();
  delete source.rows[0].generic.first.sourceBunnelbyActiveWithTM;
  assert.throws(()=>summarizeBunnelbyReadiness(source),
    /Missing current root observer field sourceBunnelbyActiveWithTM/);
});

test('refuses inconsistent root physical signal containment',()=>{
  const source=fixture();
  source.rows[0].generic.first.sourceBunnelbyActive=null;
  assert.throws(()=>summarizeBunnelbyReadiness(source),/AssertionError/);
});

test('requires identical original physical deals and never infers win rate',()=>{
  const source=fixture();
  source.rows[1].identicalPrepolicySourceDeal=false;
  assert.throws(()=>summarizeBunnelbyReadiness(source),/AssertionError/);
  assert.deepEqual(FIELDS.slice(0,3),[
    'sourceBunnelbyActive','sourceBunnelbyActiveWithTM',
    'sourceBunnelbyActiveWithTMAndEnergy'
  ]);
});
