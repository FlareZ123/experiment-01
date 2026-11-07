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
const goodAudit={
  version:'agent12-actor-only-lillie-after-pass-v1',
  bothPhysicalSeats:true,passRootObservations:16,
  attemptedLillieRoots:1,acceptedLillieRoots:1,rejectedLillieRoots:0
};

test('canonical Lillie option is bilateral, separate and caller options unchanged',()=>{
  let calls=0;
  const adapter=createBilateralLillieRunner(observed=>{
    calls++;
    assert.deepEqual(observed,{...options,actorBilateralLillieAfterPass:true});
    return {rows:[{ownerBilateralLillieAfterPassAudit:goodAudit}]};
  });
  assert.deepEqual(adapter.run(options),{
    rows:[{ownerBilateralLillieAfterPassAudit:goodAudit}]
  });
  assert.equal(adapter.audit(),goodAudit);
  assert.equal(calls,1);
  assert.equal(Object.hasOwn(options,'actorBilateralLillieAfterPass'),false);
});

test('canonical hook rejects non-bilateral and mutated original registration',()=>{
  const w=createBilateralLillieRunner(()=>
    ({rows:[{ownerBilateralLillieAfterPassAudit:goodAudit}]}));
  assert.throws(()=>w.run({...options,actorOnlyComposition:false}));
  assert.throws(()=>w.run({...options,sourceIndependentCommonPolicy:false}));
  assert.throws(()=>w.run({...options,bilateralKnownDeadAttackRoot:false}));
  assert.throws(()=>w.run({...options,allowAdditionalOriginalSourceRanks:true}));
  assert.throws(()=>createBilateralLillieRunner(()=>({rows:[{}]})).run(options));
});

test('retrospective preserves Store outcome and requires a positive native Lillie',()=>{
  const output=runAgent7BilateralLillieV9({
    runner:observed=>{
      assert.equal(observed.actorBilateralLillieAfterPass,true);
      return {rows:[{ownerBilateralLillieAfterPassAudit:goodAudit}]};
    },
    runProbe:({runner})=>{
      runner(options);
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
  assert.equal(output.nativeAdapterAudit.agent7LillieAfterPass.acceptedLillieRoots,1);
  assert.equal(output.manifest.agent7RetrospectiveVariant.schema,VERSION);
  assert.equal(output.manifest.agent7RetrospectiveVariant.composedPolicySha256.length,64);
  assert.equal(output.manifest.agent7RetrospectiveVariant.sourceOwnerHookSha256.length,64);
  assert.equal(output.manifest.confirmatoryTrial,false);
});

test('no observed Pass or no Store accepted Lillie makes opt-in fail closed',()=>{
  for(const bad of [
    {...goodAudit,passRootObservations:0},
    {...goodAudit,acceptedLillieRoots:0}
  ]){
    assert.throws(()=>runAgent7BilateralLillieV9({
      runner:()=>({rows:[{ownerBilateralLillieAfterPassAudit:bad}]}),
      runProbe:({runner})=>{
        runner(options);
        return {
          manifest:{samePolicyBothSeats:true,sourceIndependentCommonPolicy:true,
            actorOnlyComposition:true,originalSourceRanks:[11],candidateSlot:'B',
            registeredTrialCount:1,competitiveGamesQualified:0},
          nativeAttempt:{},nativeAdapterAudit:{},qualification:{}
        };
      }
    }));
  }
});
