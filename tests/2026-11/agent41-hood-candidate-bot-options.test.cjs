'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withHoodCandidateBotOptions}=
  require('../../simulation/twinleaf/hood-candidate-bot-options.cjs');

test('Hood options replace only candidate resolver/tactic and preserve baseline opponent options',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  class OtherResolver {}
  class OtherTactic {}
  class HoodAwareArvenResolver extends ChooseCardsPromptResolver {}
  class HoodAwareAttachToolTactic extends AttachToolTactic {}
  const factories={HoodAwareArvenResolver,HoodAwareAttachToolTactic};
  const sharedBase={
    promptResolvers:[ChooseCardsPromptResolver,OtherResolver],
    tactics:[AttachToolTactic,OtherTactic],
    scores:[{name:'baseline'}],
    arbiter:{flipMode:'seeded'}
  };
  const candidateInput={
    ...sharedBase,
    promptResolvers:[...sharedBase.promptResolvers],
    tactics:[...sharedBase.tactics]
  };
  const opponentOptions={
    ...sharedBase,
    promptResolvers:[...sharedBase.promptResolvers],
    tactics:[...sharedBase.tactics]
  };

  const candidateOptions=withHoodCandidateBotOptions(candidateInput,factories);
  assert.notEqual(candidateOptions,candidateInput);
  assert.deepEqual(candidateOptions.promptResolvers,
    [HoodAwareArvenResolver,OtherResolver]);
  assert.deepEqual(candidateOptions.tactics,
    [HoodAwareAttachToolTactic,OtherTactic]);
  assert.equal(candidateOptions.scores,sharedBase.scores);
  assert.equal(candidateOptions.arbiter,sharedBase.arbiter);

  assert.deepEqual(candidateInput.promptResolvers,
    [ChooseCardsPromptResolver,OtherResolver]);
  assert.deepEqual(candidateInput.tactics,[AttachToolTactic,OtherTactic]);
  assert.deepEqual(opponentOptions.promptResolvers,
    [ChooseCardsPromptResolver,OtherResolver]);
  assert.deepEqual(opponentOptions.tactics,[AttachToolTactic,OtherTactic]);
});

test('Hood bot-options composer is idempotent for an already composed candidate',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  class HoodAwareArvenResolver extends ChooseCardsPromptResolver {}
  class HoodAwareAttachToolTactic extends AttachToolTactic {}
  const factories={HoodAwareArvenResolver,HoodAwareAttachToolTactic};
  const options={
    promptResolvers:[ChooseCardsPromptResolver],
    tactics:[AttachToolTactic]
  };
  const once=withHoodCandidateBotOptions(options,factories);
  const twice=withHoodCandidateBotOptions(once,factories);
  assert.deepEqual(twice.promptResolvers,[HoodAwareArvenResolver]);
  assert.deepEqual(twice.tactics,[HoodAwareAttachToolTactic]);
});

test('Hood bot-options composer fails closed when pinned base classes are absent',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  class HoodAwareArvenResolver extends ChooseCardsPromptResolver {}
  class HoodAwareAttachToolTactic extends AttachToolTactic {}
  const factories={HoodAwareArvenResolver,HoodAwareAttachToolTactic};
  assert.throws(()=>withHoodCandidateBotOptions({
    promptResolvers:[],tactics:[AttachToolTactic]
  },factories),/Pinned ChooseCardsPromptResolver missing/);
  assert.throws(()=>withHoodCandidateBotOptions({
    promptResolvers:[ChooseCardsPromptResolver],tactics:[]
  },factories),/Pinned AttachToolTactic missing/);
});
