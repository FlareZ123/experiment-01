'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compare}=require('../scripts/agent5-rank6-directline-paired-census.cjs');

function sample(flag){
  const rows=[0,1,2,3].map((i)=>({
    trial:{id:'sourcefirst-'+i,rank:i<2?6:11,
      candidateId:i%2?'new-moon-lockbreaker-v1':'champion-reference',
      candidateSlot:'B'},
    status:i===3?'engine-error':'censored',
    actionCount:i===3?null:100,
    error:i===3?'Retained native abort':null,
    sourceDealFingerprint:'same-source-'+Math.floor(i/2),
    actualStarterSeat:0,
    actorOnlyDecisionCoverage:{
      detailedComponentAudits:{
        root:{
          thornsDirectLineOptIn:flag,
          selectedRootDecisions:10,
          typedIntentCounts:{'play-thunder-mountain':flag&&i===0?1:0},
          nativeRootAcceptances:flag&&i===0?
            [{globalTurn:2,seat:0,kind:'play-thunder-mountain',
              intent:{kind:'play-thunder-mountain'},
              accepted:true,nativePhysicalEffect:'confirmed-public-effect'}]:[]
        }
      }
    }
  }));
  return {sourceFirstRetrospective:true,actorOnlyCompositionOptIn:true,
    enginePin:'pinned',attempted:4,rows};
}
test('physical paired native root accounting retains errors and exact seats',()=>{
  const report=compare(sample(false),sample(true));
  assert.equal(report.completeActorRootAudits,true);
  assert.equal(report.physicalSourcePairsCertified,true);
  assert.equal(report.actualStarterPairsCertified,true);
  assert.equal(report.observedTreatmentStadiumSelections,1);
  assert.equal(report.rows.length,4);
  assert.equal(report.rows[3].nativeErrors[0],'Retained native abort');
  assert.equal(report.rows[3].nativeErrors[1],'Retained native abort');
  assert.equal(report.rows[0].stadiumRootWitnessesInFirst64[0].physicalEffect,
    'confirmed-public-effect');
  assert.equal(report.qualifiedCompetitiveGames,0);
});
test('absent event key means zero only when full actor audit exists',()=>{
  const a=sample(false),b=sample(true);
  delete a.rows[0].actorOnlyDecisionCoverage
    .detailedComponentAudits.root.typedIntentCounts['play-thunder-mountain'];
  delete b.rows[1].actorOnlyDecisionCoverage
    .detailedComponentAudits.root.typedIntentCounts['play-thunder-mountain'];
  const x=compare(a,b);
  assert.deepEqual(x.rows[0].typedStadiumRootSelections,[0,1]);
  assert.deepEqual(x.rows[1].typedStadiumRootSelections,[0,0]);
  assert.equal(x.rows[0].firstCappedNativeRootDifference.index,0);
  assert.equal(x.rows[0].firstCappedNativeRootDifference.baseline,null);
  assert.equal(x.rows[0].firstCappedNativeRootDifference.treatment.kind,
    'play-thunder-mountain');
  assert.deepEqual(x.rows[0].terminals,[{
    finished:null,winner:null,endReason:null,finalPrizes:null
  },{
    finished:null,winner:null,endReason:null,finalPrizes:null
  }]);
});

test('missing physical witness stays unknown and seed alteration is rejected',()=>{
  const a=sample(false),b=sample(true);
  a.rows[0].sourceDealFingerprint=null;
  b.rows[1].sourceDealFingerprint='different';
  const observed=compare(a,b);
  assert.equal(observed.physicalSourcePairsCertified,false);
  assert.equal(observed.rows[0].sameSourcePhysicalDeal,null);
  assert.equal(observed.rows[1].sameSourcePhysicalDeal,false);
  b.rows[2].trial.id='other-fingerprint';
  assert.throws(()=>compare(a,b),/source physical deal/);
});
test('missing actor audit never gets silently promoted',()=>{
  const a=sample(false),b=sample(true);
  delete b.rows[2].actorOnlyDecisionCoverage;
  const observed=compare(a,b);
  assert.equal(observed.completeActorRootAudits,false);
  assert.equal(observed.rows[2].typedStadiumRootSelections[1],null);
  assert.equal(observed.rows[2].qualifiedCompetitiveGame,false);
});
