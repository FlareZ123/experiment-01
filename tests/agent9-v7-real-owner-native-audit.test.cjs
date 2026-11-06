'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {makeReadOnlyVoltLayer}=
  require('../simulation/evaluation/agent9-v7-real-owner-native-audit.cjs');

test('composes reversible genuine Volt patch with exact unchanged native result',()=>{
  const native={acceptedRoots:['AttackAction','ResolvePromptAction']};
  const expectedVolt={ownerPromptChoices:1,ownerOwnedPhysicalEnergy:true};
  const observed={actorOwnedRootObservations:2,
    realStoreRootProposals:[{ownerHand:['Energy'],seat:0}]};
  let called=0;
  const layer=makeReadOnlyVoltLayer({
    observer:next=>{called++;const result=next();
      return {result,audit:observed};},
    volt:next=>({result:next(),audit:expectedVolt})
  });
  const output=layer(()=>native);
  assert.strictEqual(output.result,native);
  assert.equal(called,1);
  assert.equal(output.audit.ownerPromptChoices,1);
  assert.strictEqual(output.audit.agent9RealOwnerDecisionAudit,observed);
});

test('keeps the failing native energy-prompt audit and observer error separately',()=>{
  const nativeError=Error('original Store prompt failed');
  nativeError.nativeOwnerVoltAttemptAudit={ownerPromptChoices:2};
  const passive={actorOwnedRootObservations:3};
  const layer=makeReadOnlyVoltLayer({
    observer:next=>{try {return next();} catch(error) {
      error.agent9RealOwnerDecisionAudit=passive;throw error;
    }},
    volt:()=>{throw nativeError;}
  });
  assert.throws(()=>layer(()=>null),/original Store prompt failed/);
  assert.equal(nativeError.nativeOwnerVoltAttemptAudit.ownerPromptChoices,2);
  assert.strictEqual(nativeError.nativeOwnerVoltAttemptAudit.
    agent9RealOwnerDecisionAudit,passive);
});
