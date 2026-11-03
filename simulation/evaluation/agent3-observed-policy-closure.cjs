'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent3-observed-actor-policy-closure-v1';

/**
 * Stable recursive object ordering for separately archived JSON values.
 * Arrays preserve their actual order, especially handler precedence.
 * @param {unknown} value
 * @returns {unknown}
 */
function canonical(value){
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object'){
    return Object.fromEntries(Object.keys(value).sort().filter(
      key=>value[key]!==undefined
    ).map(key=>[key,canonical(value[key])]));
  }
  return value;
}

/** @param {unknown} value @returns {string} */
function digest(value){
  return createHash('sha256').update(JSON.stringify(canonical(value)))
    .digest('hex');
}

/**
 * Audit the *runtime-observed* actor policy closure in one archival mode.
 * Top-level opt-ins cannot capture environment-selected actor subpolicies.
 * A missing actor receipt remains missing even if the run's static options
 * and all other rows contain the expected version.
 *
 * @param {object} mode Archived development mode with native.rows.
 * @param {{manifestBlob:string,enginePin:string}} provenance
 * @returns {object}
 */
function auditMode(mode,provenance){
  assert.ok(typeof mode?.id==='string'&&mode.id.length>0);
  const native=mode.native;
  assert.ok(native&&Array.isArray(native.rows)&&native.rows.length>0);
  const flags=Object.fromEntries(Object.entries(native).filter(
    ([key,value])=>key.endsWith('OptIn')&&typeof value==='boolean'
  ));
  assert.ok(Object.keys(flags).length>0,'No observable top-level flags');
  assert.equal(typeof native.actorOnlyCompositionVersion,'string',
    'Missing top-level actor policy version');
  const runtimeClosures=new Map();
  const missing=[];
  const observedSeats={0:0,1:0};
  let covered=0;
  for(const row of native.rows){
    const id=row?.trial?.id;
    assert.ok(typeof id==='string'&&id.length>0,
      'Each native row needs an original trial identifier');
    const coverage=row.actorOnlyDecisionCoverage;
    if(!coverage){
      missing.push({
        trialId:id,reason:'NO_ACTOR_RUNTIME_COVERAGE',
        nativeStatus:row.status??'unknown',
        physicalAbortSidecarAvailable:
          row.nativeAbortEvidence?.sourceDealFingerprint!=null
      });
      continue;
    }
    assert.equal(typeof coverage.version,'string',
      'Actor runtime coverage missing version');
    assert.equal(coverage.version,row.actorOnlyPolicyVersion,
      'Row actor policy version disagrees with emitted actor coverage');
    assert.equal(coverage.version,native.actorOnlyCompositionVersion,
      'Row actor version disagrees with emitted mode version');
    assert.ok(Array.isArray(coverage.selectedHandlerPriority)&&
      coverage.selectedHandlerPriority.length>0,
    'Actor runtime handler precedence not available');
    assert.ok(coverage.componentVersions&&
      typeof coverage.componentVersions==='object'&&
      !Array.isArray(coverage.componentVersions),
    'Runtime component versions missing');
    assert.equal(typeof coverage.ownerVipAfterPassOptIn,'boolean',
      'Runtime owner VIP selection missing');
    const closure={
      actorVersion:coverage.version,
      priority:coverage.selectedHandlerPriority,
      components:coverage.componentVersions,
      ownerVipAfterPassOptIn:coverage.ownerVipAfterPassOptIn
    };
    const fingerprint=digest(closure);
    if(!runtimeClosures.has(fingerprint))runtimeClosures.set(fingerprint,{
      fingerprint,closure,observedRows:0,firstTrialId:id
    });
    runtimeClosures.get(fingerprint).observedRows++;
    assert.ok(row.candidateSeat===0||row.candidateSeat===1,
      'Missing physical candidate seat for actor runtime receipt');
    observedSeats[row.candidateSeat]++;
    covered++;
  }
  const closures=[...runtimeClosures.values()];
  const selected=closures.length===1?closures[0]:null;
  const status=missing.length>0?'PARTIAL_RUNTIME_COVERAGE':
    closures.length===1?'OBSERVED_CLOSURE_CONSISTENT':
    'DIVERGENT_RUNTIME_CLOSURES';
  return {
    modeId:mode.id,policyStatus:status,
    topLevelFlagCount:Object.keys(flags).length,
    topLevelEnabledFlags:Object.keys(flags).filter(key=>flags[key]).sort(),
    topLevelFlagDigest:digest(flags),
    runtimeObservedRows:covered,runtimeMissingRows:missing.length,
    physicalCandidateSeatCoverage:observedSeats,
    missing,
    uniqueObservedClosures:closures.length,
    observedClosures:closures,
    // This identifier is deliberately empty if no single runtime closure
    // exists across all observed rows.
    observedRuntimeDigest:selected?.fingerprint??null,
    observedModeClosureDigest:selected?digest({
      manifestBlob:provenance.manifestBlob,
      enginePin:provenance.enginePin,flags,runtime:selected.closure
    }):null,
    admittedWholeMode:status==='OBSERVED_CLOSURE_CONSISTENT',
    competitivelyQualifiedGames:0
  };
}

/**
 * Audit the two frozen Agent23 selected-v2 modes without certifying games.
 * The two-mode field must be the original archived comparison, and each
 * recorded native row must be accounted for even if a game aborted.
 *
 * @param {object} archive Raw Agent23 52-arm JSON.
 * @returns {object}
 */
function auditFrozenSelectedV2(archive){
  assert.ok(Array.isArray(archive?.modes)&&archive.modes.length===2);
  assert.equal(typeof archive.selectedManifestGitBlobSha,'string');
  assert.equal(typeof archive.pinnedVendorGitRevision,'string');
  const provenance={
    manifestBlob:archive.selectedManifestGitBlobSha,
    enginePin:archive.pinnedVendorGitRevision
  };
  const modes=archive.modes.map(mode=>auditMode(mode,provenance));
  const originalTrials=archive.modes.map(x=>x.native.rows.map(
    row=>row.trial?.id));
  assert.deepEqual(originalTrials[0],originalTrials[1],
    'Archived modes must preserve identical registered trial identities');
  const equalFlags=modes[0].topLevelFlagDigest===
    modes[1].topLevelFlagDigest;
  const distinctRuntime=modes[0].observedModeClosureDigest!==null&&
    modes[1].observedModeClosureDigest!==null&&
    modes[0].observedModeClosureDigest!==
      modes[1].observedModeClosureDigest;
  return {
    schema:VERSION,manifestBlob:provenance.manifestBlob,
    enginePin:provenance.enginePin,attempts:originalTrials[0].length*2,
    modes,topLevelFlagsSameAcrossModes:equalFlags,
    observedActorClosureDifferentAcrossModes:distinctRuntime,
    status:modes.every(x=>x.admittedWholeMode)?
      'BOTH_MODES_RUNTIME_COVERED':'INCOMPLETE_RUNTIME_ACTOR_COVERAGE',
    // A runtime closure digest is an audit of action-controller identity,
    // not proof that any choice was legal, strategically competent or won.
    competitiveQualifiedGames:0
  };
}

module.exports={VERSION,canonical,digest,auditMode,auditFrozenSelectedV2};
