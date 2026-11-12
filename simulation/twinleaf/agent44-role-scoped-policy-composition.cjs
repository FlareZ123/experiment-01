'use strict';

const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=require('./agent34-actor-only-root-policy.cjs');

function plainObject(value) {
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&
    (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
}

/**
 * Run one synchronous native match with independently configured candidate-
 * and opponent-role actor policies. Role identity remains independent of
 * physical seat: this helper binds each role to the requested seat for this
 * game and returns the two wrapper audits separately.
 *
 * The caller still owns policy hashing/attestation, actual deck-aware policy
 * configuration, the native match, and the V3 application receipt.
 */
function withCandidateOpponentPolicyRoles(run,options) {
  assert.equal(typeof run,'function','run must be a synchronous match callback');
  assert.ok(plainObject(options),'role policy options must be a plain object');
  const {
    candidateSeat,opponentSeat,commonDeps,
    candidatePolicyOptions={},opponentPolicyOptions={}
  }=options;
  assert.ok((candidateSeat===0||candidateSeat===1)&&
    (opponentSeat===0||opponentSeat===1)&&candidateSeat!==opponentSeat,
  'candidate and opponent must occupy distinct physical seats 0 and 1');
  assert.ok(plainObject(commonDeps),'commonDeps must be a plain object');
  assert.ok(plainObject(candidatePolicyOptions)&&plainObject(opponentPolicyOptions),
    'role-specific policy options must be plain objects');
  for(const key of ['SimpleTacticsAi','Store','GamePhase','cardActions','gameActions','getCatalog','getNativeTrainerCatalog'])
    assert.ok(commonDeps[key]!==undefined,'commonDeps is missing '+key);
  for(const [role,policyOptions] of [
    ['candidate',candidatePolicyOptions],['opponent',opponentPolicyOptions]
  ]) {
    for(const key of [
      'policyOwnerSeat','SimpleTacticsAi','Store','GamePhase','cardActions','gameActions','getCatalog','getNativeTrainerCatalog'
    ]) assert.ok(!Object.hasOwn(policyOptions,key),
      role+' policy options may not override shared runtime binding '+key);
  }

  const candidateDeps={
    ...commonDeps,...candidatePolicyOptions,policyOwnerSeat:candidateSeat
  };
  const opponentDeps={
    ...commonDeps,...opponentPolicyOptions,policyOwnerSeat:opponentSeat
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
  assert.equal(candidateWrapped.audit.policyOwnerSeat,candidateSeat);
  assert.equal(opponentWrapped.audit.policyOwnerSeat,opponentSeat);
  return {
    result:candidateWrapped.result,
    candidateAudit:candidateWrapped.audit,
    opponentAudit:opponentWrapped.audit,
    roleSeatMap:{candidate:candidateSeat,opponent:opponentSeat}
  };
}

module.exports={withCandidateOpponentPolicyRoles};
