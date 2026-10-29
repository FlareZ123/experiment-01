'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {ownerCensus,SCHEMA}=
  require('../simulation/evaluation/agent25-registered-scout-owner-census.cjs');

function fixture(){
  const rows=Array.from({length:32},(_,i)=>{
    const held=i%3,eligible=held?1:0;
    const source= i%2;
    const bySeat={
      0:{ownerRoots:source===0?2:0,
        heldRoots:source===0?held:0,eligibleRoots:source===0?eligible:0},
      1:{ownerRoots:source===1?2:0,
        heldRoots:source===1?held:0,eligibleRoots:source===1?eligible:0}
    };
    return {
      trial:{id:String(i),rank:i%2===0?6:11,
        candidateId:i%2?'champion-reference':'new-moon-lockbreaker-v1'},
      candidateSeat:source,sourceActuallyFirst:Boolean(i%2),
      sourceDealFingerprint:'src-'+i,actualStarterSeat:source,
      rootActionLedgerSha256:'digest-'+i,
      rootActionCount:100,finished:true,
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        root:{lowHandLillieCensusOptIn:true,
          lowHandLillieRootCensus:{
            ownerRoots:2,heldRoots:held,eligibleRoots:eligible,
            bySeat,reasonCounts:{eligible:eligible,
              'lillie-not-held':2-eligible},
            heldReasonCounts:{eligible:eligible,
              'hand-too-large':held-eligible},
            heldSamples:[],sampleLimit:40
          }
        }
      }}
    };
  });
  return {schema:'agent41-preregistered-32-arm-canonical-scout-v1',
    registrationBlob:'test-only',summary:{
      attempts:32,engineTerminals:32,censored:0,exceptions:0
    },developmentResult:{
      attempted:32,rows,enginePin:'test-pin',
      competitiveQualifiedGames:0
    }
  };
}
test('full 32 original failures-inclusive policy-independent owner-root census',()=>{
  const out=ownerCensus(fixture());
  assert.equal(out.schema,SCHEMA);
  assert.equal(out.attempted,32);
  assert.equal(out.observedArms,32);
  assert.equal(out.ownerRootReads,64);
  assert.equal(out.competitiveQualifiedGames,0);
  assert.equal(Object.values(out.byRank).reduce((n,x)=>n+x.arms,0),32);
  assert.equal(Object.values(out.byCandidate).reduce((n,x)=>n+x.arms,0),32);
});
test('native error retained instead of silently removing one attempted arm',()=>{
  const data=fixture();
  data.summary.engineTerminals=31;
  data.summary.exceptions=1;
  const x=data.developmentResult.rows[3];
  delete x.actorOnlyDecisionCoverage;delete x.finished;
  x.status='engine-error';x.error='native prompt abort';
  const out=ownerCensus(data);
  assert.equal(out.attempted,32);
  assert.equal(out.observedArms,31);
  assert.equal(out.rows[3].status,'engine-error');
  assert.equal(out.rows[3].nativeError,'native prompt abort');
  assert.equal(out.exceptionArms,1);
  assert.equal(out.competitiveQualifiedGames,0);
});
test('never accept mismatched root denominators, duplicate or missing arms',()=>{
  const data=fixture();
  data.developmentResult.rows[1].trial.id='0';
  assert.throws(()=>ownerCensus(data),/duplicate source trial/);
  data.developmentResult.rows[1].trial.id='1';
  data.developmentResult.rows[2].actorOnlyDecisionCoverage
    .detailedComponentAudits.root.lowHandLillieRootCensus.heldRoots=99;
  assert.throws(()=>ownerCensus(data));
  data.developmentResult.rows.pop();
  assert.throws(()=>ownerCensus(data));
});
