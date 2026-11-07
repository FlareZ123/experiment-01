'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,bilateralKnownDeadOffRunner,runAgent7KnownDeadV9}=
  require('../simulation/evaluation/agent7-v9-bilateral-known-dead-retro.cjs');

const base={
  actorOnlyComposition:true,
  sourceIndependentCommonPolicy:true,
  bilateralKnownDeadAttackRoot:true,
  allowAdditionalOriginalSourceRanks:false,
  nativeRootActionLimit:260,
  physicalZoneGate:true,
  seed:626469135
};

test('A-prime control disables known-dead policy in both seats without input mutation',()=>{
  let calls=0;
  const runner=bilateralKnownDeadOffRunner(options=>{
    calls++;
    assert.deepEqual(options,{
      ...base,bilateralKnownDeadAttackRoot:false,
      candidateOnlyKnownDeadRoot:false
    });
    return {accepted:true};
  });
  assert.deepEqual(runner(base),{accepted:true});
  assert.equal(calls,1);
  assert.equal(base.bilateralKnownDeadAttackRoot,true);
  assert.equal(Object.hasOwn(base,'candidateOnlyKnownDeadRoot'),false);
});

test('A-prime control refuses non-symmetric and unregistered expansion',()=>{
  const runner=bilateralKnownDeadOffRunner(()=>({accepted:true}));
  assert.throws(()=>runner({...base,actorOnlyComposition:false}));
  assert.throws(()=>runner({...base,sourceIndependentCommonPolicy:false}));
  assert.throws(()=>runner({...base,allowAdditionalOriginalSourceRanks:true}));
  assert.throws(()=>runner({...base,candidateOnlyKnownDeadRoot:true}));
});

test('retrospective output preserves native result and marks unqualified evidence',()=>{
  let seen=null;
  const output=runAgent7KnownDeadV9({
    runner:options=>{
      seen=options;
      return {mockNative:true};
    },
    runProbe:({runner})=>{
      assert.deepEqual(runner(base),{mockNative:true});
      return {
        manifest:{
          samePolicyBothSeats:true,
          sourceIndependentCommonPolicy:true,
          actorOnlyComposition:true,
          registeredTrialCount:1,
          originalSourceRanks:[11],
          candidateSlot:'B',
          competitiveGamesQualified:0
        },
        qualification:{
          naturalGameObserved:true,
          bilateralMaterialEpisodeQualified:false,
          competitiveAdmission:false
        },
        nativeAttempt:{id:'11:1000:B:new-moon-lockbreaker-v1',
          rootActionCount:123,finished:true,finalPrizes:[6,0]},
        agent45ArchiveScreen:{}
      };
    }
  });
  assert.equal(seen.bilateralKnownDeadAttackRoot,false);
  assert.equal(seen.candidateOnlyKnownDeadRoot,false);
  assert.equal(output.nativeAttempt.finished,true);
  assert.equal(output.qualification.naturalGameObserved,true);
  assert.deepEqual(output.nativeAttempt.finalPrizes,[6,0]);
  assert.equal(output.qualification.competitiveAdmission,false);
  assert.equal(output.manifest.agent7RetrospectiveVariant.version,VERSION);
  assert.equal(output.manifest.agent7RetrospectiveVariant.sourceIndependentBothSeats,true);
  assert.equal(output.manifest.agent7RetrospectiveVariant.bilateralKnownDeadAttackRoot,false);
  assert.equal(output.manifest.agent7RetrospectiveVariant.wrapperSha256.length,64);
  assert.equal(output.manifest.confirmatoryTrial,false);
  assert.equal(output.manifest.prospective,false);
});

test('no admission of invented complete field or certified-game fixture',()=>{
  assert.throws(()=>runAgent7KnownDeadV9({
    runner:()=>null,
    runProbe:()=>({
      manifest:{
        samePolicyBothSeats:true,
        sourceIndependentCommonPolicy:true,
        actorOnlyComposition:true,
        registeredTrialCount:1,
        originalSourceRanks:[23],
        candidateSlot:'B',
        competitiveGamesQualified:0
      },
      qualification:{},nativeAttempt:{},agent45ArchiveScreen:{}
    })
  }),/Expected values to be strictly deep-equal/);
});
