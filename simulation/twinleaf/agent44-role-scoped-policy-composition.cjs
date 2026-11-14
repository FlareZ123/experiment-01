'use strict';

const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=require('./agent34-actor-only-root-policy.cjs');

function plainObject(value) {
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&
    (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
}


const DIAGNOSTIC_ONLY_ROLE_FLAGS = Object.freeze([
  'nativeOwnerTrainerFallback','ownerFallbackDiagnosticView'
]);

function assertNoDiagnosticFallbackFlags(source,label) {
  for(const key of DIAGNOSTIC_ONLY_ROLE_FLAGS)
    assert.notEqual(source?.[key],true,
      label+'.'+key+' is diagnostic-only and forbidden in competitive V3 role composition');
}

function inspectActorOnlyExecutionBoundary({candidateAudit,opponentAudit,
  candidateSeat,opponentSeat}) {
  const failures=[];
  function summarize(audit,role,expectedSeat) {
    const summary={role,policyOwnerSeat:audit?.policyOwnerSeat??null,
      version:typeof audit?.version==='string'?audit.version:null,
      origin:typeof audit?.origin==='string'?audit.origin:null,
      observationSchema:typeof audit?.observationSchema==='string'?audit.observationSchema:null,
      nativeOwnerTrainerFallbackEnabled:audit?.nativeOwnerTrainerFallback!==undefined&&
        audit?.nativeOwnerTrainerFallback!==null,
      ownerFallbackDiagnosticViewEnabled:Boolean(audit?.nativeOwnerTrainerFallback&&
        Object.hasOwn(audit.nativeOwnerTrainerFallback,'firstUnsupportedOwnerRoot')),
      nativePolicyMayUseHiddenInformation:
        audit?.nativeOwnerTrainerFallback?.nativePolicyMayUseHiddenInformation===true,
      unsupportedPromptFallbacks:audit?.unsupportedPromptFallbacks??null,
      nonLiveSpeculativeFallbacks:audit?.nonLiveSpeculativeFallbacks??null,
      nonOwnerNativeDelegations:audit?.nonOwnerNativeDelegations??null,
      nonTurnPhaseFallbacks:audit?.nonTurnPhaseFallbacks??null,
      nonOwnerSeatBypassCalls:audit?.nonOwnerSeatBypassCalls??null,
      peerRoleDispatchEnabled:typeof audit?.peerRoleDispatchEnabled==='boolean'?
        audit.peerRoleDispatchEnabled:null,
      ownerDecisionCalls:audit?.ownerDecisionCalls??null,
      peerRoleDelegations:audit?.peerRoleDelegations??null,
      setupStartingBasicPromptsHandled:audit?.setupStartingBasicPromptsHandled??null,
      setupStartingBasicPromptsBySeat:audit?.setupStartingBasicPromptsBySeat??null,
      setupGoFirstPromptsHandled:audit?.setupGoFirstPromptsHandled??null,
      setupGoFirstPromptsBySeat:audit?.setupGoFirstPromptsBySeat??null,
      setupPromptActionsSubmitted:audit?.setupPromptActionsSubmitted??null,
      setupPromptActionsRejected:audit?.setupPromptActionsRejected??null,
      nativeOwnerTrainerFallbackAttemptedUnsupportedPasses:
        audit?.nativeOwnerTrainerFallback?.attemptedUnsupportedPasses??0};
    if(!plainObject(audit)) failures.push(role+'-audit-missing-or-invalid');
    if(summary.policyOwnerSeat!==expectedSeat) failures.push(role+'-policy-owner-seat-mismatch');
    if(!summary.version) failures.push(role+'-wrapper-version-missing');
    if(summary.origin!=='detached-actor-observation') failures.push(role+'-observation-origin-invalid');
    if(summary.observationSchema!=='agent2-public-native-dispatch-diff-v1')
      failures.push(role+'-observation-schema-invalid');
    if(summary.nativeOwnerTrainerFallbackEnabled)
      failures.push(role+'-native-owner-trainer-fallback-enabled');
    if(summary.ownerFallbackDiagnosticViewEnabled)
      failures.push(role+'-owner-fallback-diagnostic-view-enabled');
    if(summary.nativePolicyMayUseHiddenInformation)
      failures.push(role+'-native-policy-may-use-hidden-information');
    for(const key of ['unsupportedPromptFallbacks','nonLiveSpeculativeFallbacks','nonOwnerNativeDelegations','nonTurnPhaseFallbacks','nonOwnerSeatBypassCalls','nativeOwnerTrainerFallbackAttemptedUnsupportedPasses']){
      if(!Number.isSafeInteger(summary[key])||summary[key]<0)
        failures.push(role+'-'+key+'-missing-or-invalid');
      else if(summary[key]!==0) failures.push(role+'-'+key+'-nonzero');
    }
    if(typeof summary.peerRoleDispatchEnabled!=='boolean')
      failures.push(role+'-peerRoleDispatchEnabled-missing-or-invalid');
    for(const key of ['ownerDecisionCalls','peerRoleDelegations']){
      if(!Number.isSafeInteger(summary[key])||summary[key]<0)
        failures.push(role+'-'+key+'-missing-or-invalid');
    }
    return summary;
  }
  const candidate=summarize(candidateAudit,'candidate',candidateSeat);
  const opponent=summarize(opponentAudit,'opponent',opponentSeat);
  if(candidate.peerRoleDispatchEnabled!==true) failures.push('candidate-peer-role-dispatch-disabled');
  if(opponent.peerRoleDispatchEnabled!==false) failures.push('opponent-peer-role-dispatch-enabled');
  if(Number.isSafeInteger(candidate.peerRoleDelegations)&&Number.isSafeInteger(opponent.ownerDecisionCalls)&&candidate.peerRoleDelegations!==opponent.ownerDecisionCalls) failures.push('candidate-peer-role-delegation-count-mismatch');
  if(opponent.peerRoleDelegations!==0) failures.push('opponent-peer-role-delegation-count-nonzero');
  return {schema:'aichi-actor-only-execution-boundary-v2',
    valid:failures.length===0,failures,candidate,opponent};
}

/**
 * Run one synchronous native match with independently configured candidate-
 * and opponent-role actor policies. Role identity remains independent of
 * physical seat: this helper binds each role to the requested seat for this
 * game and returns the two wrapper audits separately.
 *
 * The caller still owns policy hashing/attestation, actual deck-aware policy
 * configuration, the native match, and the V3 application receipt. An invalid
 * boundary is returned with the game result; it must not erase factual outcome
 * evidence, but it cannot establish comparative policy competence.
 */
function candidateOpponentRoleSeats({candidateSeat,opponentSeat}={}) {
  assert.ok((candidateSeat===0||candidateSeat===1)&&
    (opponentSeat===0||opponentSeat===1)&&candidateSeat!==opponentSeat,
  'candidate and opponent must occupy distinct physical seats 0 and 1');
  return Object.freeze({candidate:candidateSeat,opponent:opponentSeat});
}

function withCandidateOpponentPolicyRoles(run,options) {
  assert.equal(typeof run,'function','run must be a synchronous match callback');
  assert.ok(plainObject(options),'role policy options must be a plain object');
  const {
    candidateSeat,opponentSeat,commonDeps,
    candidatePolicyOptions={},opponentPolicyOptions={}
  }=options;
  const roleSeatMap=candidateOpponentRoleSeats({candidateSeat,opponentSeat});
  assert.ok(plainObject(commonDeps),'commonDeps must be a plain object');
  assertNoDiagnosticFallbackFlags(commonDeps,'commonDeps');
  assert.ok(plainObject(candidatePolicyOptions)&&plainObject(opponentPolicyOptions),
    'role-specific policy options must be plain objects');
  const rootProviderConfigured=commonDeps.rootIntentProvider!==undefined||
    commonDeps.createRootSearchCapability!==undefined||
    commonDeps.rootIntentActionKey!==undefined;
  assert.equal(rootProviderConfigured,
    typeof commonDeps.rootIntentProvider==='function'&&
    typeof commonDeps.createRootSearchCapability==='function'&&
    typeof commonDeps.rootIntentActionKey==='function',
    'rootIntentProvider, createRootSearchCapability, and rootIntentActionKey must be supplied together');
  if(rootProviderConfigured){
    assert.ok(plainObject(candidatePolicyOptions.rootIntentBudget)&&
      plainObject(opponentPolicyOptions.rootIntentBudget),
      'both roles must declare the fixed rootIntentBudget in policy options');
    assert.deepEqual(candidatePolicyOptions.rootIntentBudget,
      opponentPolicyOptions.rootIntentBudget,
      'candidate and opponent must receive exactly equal MCTS budgets');
  }
  for(const key of [
    'SimpleTacticsAi','Store','GamePhase','cardActions','gameActions',
    'getCatalog','getNativeTrainerCatalog','observe','promptActions'
  ]) assert.ok(commonDeps[key]!==undefined,'commonDeps is missing '+key);
  assert.equal(typeof commonDeps.observe,'function',
    'one common actor-only observer is required for both roles');
  assert.ok(plainObject(commonDeps.promptActions)&&
    typeof commonDeps.promptActions.ResolvePromptAction==='function',
  'one common native ResolvePromptAction constructor is required');
  assert.ok(commonDeps.stagedStore===undefined||commonDeps.stagedStore===null,
    'production role composition forbids the test-only stagedStore seam');
  assert.equal(commonDeps.policyOwnerSeat,undefined,
    'physical role seats are assigned only by the composer');
  assert.equal(commonDeps.peerRoleDispatch,undefined,
    'peer role dispatch is assigned only by the composer');
  const runtimeBindings=[
    'policyOwnerSeat','SimpleTacticsAi','Store','GamePhase','cardActions','gameActions',
    'getCatalog','getNativeTrainerCatalog','observe','stagedStore','promptActions',
    'setupPromptTypes',
    'arvenTrainerTypes','eriCardTypes','nativeOwnerTrainerFallback',
    'ownerFallbackDiagnosticView','peerRoleDispatch','rootIntentProvider',
    'createRootSearchCapability','rootIntentActionKey'
  ];
  for(const [role,policyOptions] of [
    ['candidate',candidatePolicyOptions],['opponent',opponentPolicyOptions]
  ]) {
    for(const key of runtimeBindings) assert.ok(!Object.hasOwn(policyOptions,key),
      role+' policy options may not override shared runtime binding '+key);
  }

  const candidateDeps={
    ...commonDeps,...candidatePolicyOptions,policyOwnerSeat:roleSeatMap.candidate,peerRoleDispatch:true
  };
  const opponentDeps={
    ...commonDeps,...opponentPolicyOptions,policyOwnerSeat:roleSeatMap.opponent,peerRoleDispatch:false
  };
  const opponentWrapped=withActorOnlyRootPolicy(()=>{
    return withActorOnlyRootPolicy(()=>{
      const result=run();
      if(result&&typeof result.then==='function')
        throw new Error('role-scoped policy composition requires a synchronous native match callback');
      return result;
    },candidateDeps);
  },opponentDeps);
  const candidateWrapped=opponentWrapped.result;
  assert.ok(candidateWrapped&&typeof candidateWrapped==='object',
    'candidate policy wrapper did not return its audit');
  // Seat/audit mismatches are recorded in actorOnlyBoundary below; do not
  // throw away a completed native result merely because the policy audit fails.
  const actorOnlyBoundary=inspectActorOnlyExecutionBoundary({
    candidateAudit:candidateWrapped.audit,opponentAudit:opponentWrapped.audit,
    candidateSeat:roleSeatMap.candidate,opponentSeat:roleSeatMap.opponent
  });
  // Preserve the native match result even when the policy audit is not
  // competence-eligible. The receipt/evaluator bind this failed boundary and
  // withhold comparative policy competence without erasing a factual outcome.
  return {
    actorOnlyBoundary,
    result:candidateWrapped.result,
    candidateAudit:candidateWrapped.audit,
    opponentAudit:opponentWrapped.audit,
    roleSeatMap
  };
}

module.exports={candidateOpponentRoleSeats,withCandidateOpponentPolicyRoles,assertNoDiagnosticFallbackFlags,inspectActorOnlyExecutionBoundary};
