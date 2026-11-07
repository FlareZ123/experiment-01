'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,createBilateralLillieRunner,runAgent7BilateralLillieV9}=
  require('../simulation/evaluation/agent7-v9-bilateral-lillie-pass-retro.cjs');

const options={
  actorOnlyComposition:true,
  sourceIndependentCommonPolicy:true,
  bilateralKnownDeadAttackRoot:true,
  allowAdditionalOriginalSourceRanks:false,
  registeredTrials:['original-frozen'],
  candidateSlot:'B'
};

test('owner Lillie after Pass composition preserves exact v9 runner options',()=>{
  let called=0;
  const adapter=createBilateralLillieRunner(
    observed=>{
      assert.strictEqual(observed,options);
      called++;
      return {actualStore:true};
    },
    run=>{
      const answer=run();
      assert.deepEqual(answer,{actualStore:true});
      return {result:answer,audit:{acceptedLillieRoots:1,bothPhysicalSeats:true}};
    });
  assert.deepEqual(adapter.run(options),{actualStore:true});
  assert.equal(adapter.audit().acceptedLillieRoots,1);
  assert.equal(called,1);
  assert.equal(Object.hasOwn(options,'ownerLillieAfterPass'),false);
});

test('owner hook refuses single-seat or unrelated historical policies',()=>{
  const w=createBilateralLillieRunner(()=>null,()=>({result:{},audit:{}}));
  assert.throws(()=>w.run({...options,actorOnlyComposition:false}));
  assert.throws(()=>w.run({...options,sourceIndependentCommonPolicy:false}));
  assert.throws(()=>w.run({...options,bilateralKnownDeadAttackRoot:false}));
  assert.throws(()=>w.run({...options,allowAdditionalOriginalSourceRanks:true}));
});

test('retrospective result preserves native terminal, field and independent hash',()=>{
  const output=runAgent7BilateralLillieV9({
    runner:()=>({genuineStore:true}),
    withLillie:run=>({result:run(),audit:{
      bothPhysicalSeats:true,attemptedLillieRoots:2,acceptedLillieRoots:2
    }}),
    runProbe:({runner})=>{
      assert.deepEqual(runner(options),{genuineStore:true});
      return {
        manifest:{
          samePolicyBothSeats:true,
          sourceIndependentCommonPolicy:true,
          actorOnlyComposition:true,
          originalSourceRanks:[11],
          candidateSlot:'B',
          registeredTrialCount:1,competitiveGamesQualified:0,
          policyHash:'original-v9-policy'
        },
        nativeAttempt:{status:'native-terminal-unqualified',finished:true,
          rootActionCount:260,winner:0,finalPrizes:[0,5]},
        nativeAdapterAudit:{},
        qualification:{naturalGameObserved:true,competitiveAdmission:false,
          bilateralMaterialEpisodeQualified:false}
      };
    }
  });
  assert.equal(output.nativeAttempt.finished,true);
  assert.equal(output.nativeAttempt.winner,0);
  assert.deepEqual(output.nativeAttempt.finalPrizes,[0,5]);
  assert.equal(output.qualification.naturalGameObserved,true);
  assert.equal(output.qualification.competitiveAdmission,false);
  assert.equal(output.nativeAdapterAudit.agent7LillieAfterPass.acceptedLillieRoots,2);
  assert.equal(output.manifest.agent7RetrospectiveVariant.schema,VERSION);
  assert.equal(output.manifest.agent7RetrospectiveVariant.composedPolicySha256.length,64);
  assert.equal(output.manifest.agent7RetrospectiveVariant.sourceOwnerHookSha256.length,64);
  assert.equal(output.manifest.confirmatoryTrial,false);
});

test('registration must stay fixed to original rank11 New Moon B',()=>{
  const make=rank=>()=>({
    manifest:{
      samePolicyBothSeats:true,sourceIndependentCommonPolicy:true,
      actorOnlyComposition:true,originalSourceRanks:[rank],
      candidateSlot:'B',registeredTrialCount:1,competitiveGamesQualified:0
    }
  });
  assert.throws(()=>runAgent7BilateralLillieV9({
    runner:()=>({}),
    withLillie:run=>({result:run(),audit:{}}),
    runProbe:make(28)
  }));
});
