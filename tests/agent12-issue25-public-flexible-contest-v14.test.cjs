'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  KEY,withScopedPublicFlexibleContest,runPublicFlexibleContestIssue25V14
}=require('../simulation/evaluation/agent12-issue25-public-flexible-contest-v14.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

function pureLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}

test('scoped experimental flag restores an initially absent key',()=>{
  const fake={};
  const output=withScopedPublicFlexibleContest(()=>{
    assert.equal(fake[KEY],'true');
    return 47;
  },fake);
  assert.equal(output,47);
  assert.equal(Object.hasOwn(fake,KEY),false);
});

test('scoped flag restores pre-existing false and exceptions',()=>{
  const fake={[KEY]:'false'};
  assert.throws(()=>withScopedPublicFlexibleContest(()=>{
    assert.equal(fake[KEY],'true');
    throw new Error('injected-runner-error');
  },fake),/injected-runner-error/);
  assert.deepEqual(fake,{[KEY]:'false'});
});

test('v14 selects existing flexible contest at both seats under unchanged v13 registration',()=>{
  const present=Object.hasOwn(process.env,KEY),previous=process.env[KEY];
  let received=null;
  try{
    const out=runPublicFlexibleContestIssue25V14({
      layers:pureLayers(),
      attackLayer:next=>({result:next(),audit:{}}),
      runner:options=>{
        assert.equal(process.env[KEY],'true');
        received=options;
        return {
          sourceIndependentCommonPolicyOptIn:true,
          rows:options.registeredTrials.map(trial=>({
            trial,status:'synthetic-development',finished:false,
            sourceSeat:trial.candidateSlot==='A'?1:0,
            rootActionLedger:[],
            bilateralPublicContextSpecialProfile:{mode:'both',sharedPolicy:true},
            actorOnlyDecisionCoverage:{detailedComponentAudits:{
              root:{
                publicContextSpecialEnergyOptIn:true,
                publicFlexibleEnergyContestOptIn:process.env[KEY]==='true'
              },
              ownerVipAfterPass:{originalPassRoots:0,acceptedItems:0,
                acceptedSearches:0}
            }}
          }))
        };
      }
    });
    assert.equal(received.registeredTrials.length,8);
    assert.equal(received.nativeRootActionLimit,48);
    assert.equal(received.actorOnlyComposition,true);
    assert.equal(received.sourceIndependentCommonPolicy,true);
    assert.equal(received.bilateralPublicContextSpecialEnergy,true);
    assert.equal(out.diagnostic.actorContestSelectedRows,8);
    assert.equal(out.manifest.bothSeatOwnerPublicFlexibleContestSelected,true);
    assert.equal(out.manifest.sameEightFrozenV13RegisteredArms,true);
    assert.equal(out.manifest.competitiveGamesQualified,0);
    assert.equal(out.diagnostic.competitiveGamesQualified,0);
    assert.equal(out.diagnostic.publicSpecialSourceEvidence.length,8);
  }finally{
    assert.equal(Object.hasOwn(process.env,KEY),present);
    assert.equal(process.env[KEY],previous);
  }
});

test('v14 preserves missing native evidence rather than inventing source attacks',()=>{
  const out=runPublicFlexibleContestIssue25V14({
    layers:pureLayers(),
    attackLayer:next=>({result:next(),audit:{}}),
    runner:options=>({
      sourceIndependentCommonPolicyOptIn:true,
      rows:options.registeredTrials.map(trial=>({
        trial,status:'synthetic-censored',sourceSeat:null,
        rootActionLedger:null,finished:false
      }))
    })
  });
  assert.equal(out.diagnostic.actorContestSelectedRows,0);
  assert.ok(out.diagnostic.perAttemptContestFlag.every(row=>
    row.actorFlexibleContestSelected===null));
  assert.ok(out.diagnostic.publicSpecialSourceEvidence.every(row=>
    row.nativeSourceAttackRoots===null&&
    row.nativeSourceEnergyPlayRootCount===null));
  assert.equal(out.manifest.releaseQualified,false);
});
