'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {canonical,digest,auditMode,auditFrozenSelectedV2}=
  require('../simulation/evaluation/agent3-observed-policy-closure.cjs');

const priority=['ChoosePokemonPrompt','ActorOnlyRoot'];
const components={root:'actor-roots-v1',choosePokemon:'prompt-v1'};

/**
 * A compact synthetic actor-returned row; this stands for archived audit
 * metadata, never a reconstructed live Store or competitive outcome.
 * @param {string} trialId
 * @param {string} version
 * @param {boolean} vip
 * @param {0|1} seat
 * @returns {object}
 */
function row(trialId,version,vip,seat){
  return {
    trial:{id:trialId},candidateSeat:seat,
    actorOnlyPolicyVersion:version,
    actorOnlyDecisionCoverage:{
      version,selectedHandlerPriority:[...priority],
      componentVersions:{...components},
      ownerVipAfterPassOptIn:vip
    }
  };
}

/**
 * Two modes whose top-level flags are identical despite a separately
 * installed, owner-selected environment component in actor coverage.
 * @param {boolean} missing
 * @returns {object}
 */
function archive(missing=false){
  const make=(id,version,vip)=>({
    id,native:{
      actorOnlyCompositionVersion:version,
      actorOnlyCompositionOptIn:true,
      actorMewGenesectTechnoBlastOptIn:true,
      actorHandDiscardOptIn:false,
      rows:[row('5:0:A:reference',version,vip,0),
        missing?{
          trial:{id:'5:0:B:reference'},candidateSeat:1,
          status:'engine-error',nativeAbortEvidence:{
            sourceDealFingerprint:'SHA256_SOURCE_DEAL'
          }
        }:row('5:0:B:reference',version,vip,1)]
    }
  });
  return {
    selectedManifestGitBlobSha:'frozen-manifest-blob',
    pinnedVendorGitRevision:'frozen-vendor-commit',
    modes:[make('control','actor-v1',false),
      make('selected','actor-v1+vip-after-pass',true)]
  };
}

test('canonical object ordering leaves ordered policy priority intact',()=>{
  assert.deepEqual(canonical({z:2,a:{y:3,b:1}}),
    {a:{b:1,y:3},z:2});
  assert.equal(digest({b:2,a:1}),digest({a:1,b:2}));
  assert.notEqual(digest(['A','B']),digest(['B','A']));
});

test('identical top-level flags conceal changed executing actor closure',()=>{
  const result=auditFrozenSelectedV2(archive());
  assert.equal(result.topLevelFlagsSameAcrossModes,true);
  assert.equal(result.observedActorClosureDifferentAcrossModes,true);
  assert.equal(result.status,'BOTH_MODES_RUNTIME_COVERED');
  assert.equal(result.competitiveQualifiedGames,0);
  for(const mode of result.modes){
    assert.equal(mode.topLevelFlagCount,3);
    assert.equal(mode.runtimeObservedRows,2);
    assert.equal(mode.runtimeMissingRows,0);
    assert.equal(mode.uniqueObservedClosures,1);
    assert.equal(mode.admittedWholeMode,true);
    assert.deepEqual(mode.physicalCandidateSeatCoverage,{0:1,1:1});
  }
  assert.equal(result.modes[0].topLevelFlagDigest,
    result.modes[1].topLevelFlagDigest);
  assert.notEqual(result.modes[0].observedModeClosureDigest,
    result.modes[1].observedModeClosureDigest);
});

test('failed trial remains in denominator and cannot inherit closure',()=>{
  const result=auditFrozenSelectedV2(archive(true));
  assert.equal(result.attempts,4);
  assert.equal(result.status,'INCOMPLETE_RUNTIME_ACTOR_COVERAGE');
  for(const mode of result.modes){
    assert.equal(mode.runtimeObservedRows,1);
    assert.equal(mode.runtimeMissingRows,1);
    assert.equal(mode.admittedWholeMode,false);
    assert.equal(mode.missing[0].trialId,'5:0:B:reference');
    assert.equal(mode.missing[0].nativeStatus,'engine-error');
    assert.equal(mode.missing[0].physicalAbortSidecarAvailable,true);
    assert.equal(mode.observedClosures.length,1);
  }
});

test('inconsistent observed actor versions reject rather than hash',()=>{
  const modified=archive();
  modified.modes[1].native.rows[0].actorOnlyPolicyVersion='other';
  assert.throws(()=>auditFrozenSelectedV2(modified),
    /Row actor policy version disagrees/);
});

test('row-varying handler precedence is a distinct observed policy',()=>{
  const x=archive().modes[0];
  x.native.rows[1].actorOnlyDecisionCoverage.selectedHandlerPriority
    =['ActorOnlyRoot','ChoosePokemonPrompt'];
  const result=auditMode(x,{manifestBlob:'x',enginePin:'y'});
  assert.equal(result.policyStatus,'DIVERGENT_RUNTIME_CLOSURES');
  assert.equal(result.uniqueObservedClosures,2);
  assert.equal(result.observedRuntimeDigest,null);
  assert.equal(result.admittedWholeMode,false);
});

test('registered physical trial ordering must match across both modes',()=>{
  const changed=archive();
  changed.modes[1].native.rows[1].trial.id='5:1:B:reference';
  assert.throws(()=>auditFrozenSelectedV2(changed),
    /identical registered trial identities/);
});
