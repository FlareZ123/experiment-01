'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withHoodCandidateBotOptions}=
  require('../../simulation/twinleaf/hood-candidate-bot-options.cjs');

function fixtureFactories(NativeResolver,NativeAttach) {
  return {
    hoodAwareArvenResolverClass(Base=NativeResolver) {
      return class HoodAwareArvenResolver extends Base {};
    },
    hoodAwareAttachToolTacticClass(Base=NativeAttach) {
      return class HoodAwareAttachToolTactic extends Base {};
    }
  };
}

test('Hood options wrap existing candidate resolver/tactic subclasses without mutating opponent options',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  class ExistingResolver extends ChooseCardsPromptResolver {}
  class ExistingAttachTactic extends AttachToolTactic {}
  class OtherResolver {}
  class OtherTactic {}
  const factories=fixtureFactories(ChooseCardsPromptResolver,AttachToolTactic);
  const sharedBase={
    promptResolvers:[ExistingResolver,OtherResolver],
    tactics:[ExistingAttachTactic,OtherTactic],
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
  const HoodResolver=candidateOptions.promptResolvers[0];
  const HoodTactic=candidateOptions.tactics[0];
  assert.equal(HoodResolver.name,'HoodAwareArvenResolver');
  assert.equal(HoodTactic.name,'HoodAwareAttachToolTactic');
  assert.equal(Object.getPrototypeOf(HoodResolver),ExistingResolver);
  assert.equal(Object.getPrototypeOf(HoodTactic),ExistingAttachTactic);
  assert.deepEqual(candidateOptions.promptResolvers.slice(1),[OtherResolver]);
  assert.deepEqual(candidateOptions.tactics.slice(1),[OtherTactic]);
  assert.equal(candidateOptions.scores,sharedBase.scores);
  assert.equal(candidateOptions.arbiter,sharedBase.arbiter);

  assert.deepEqual(candidateInput.promptResolvers,[ExistingResolver,OtherResolver]);
  assert.deepEqual(candidateInput.tactics,[ExistingAttachTactic,OtherTactic]);
  assert.deepEqual(opponentOptions.promptResolvers,[ExistingResolver,OtherResolver]);
  assert.deepEqual(opponentOptions.tactics,[ExistingAttachTactic,OtherTactic]);
});

test('Hood bot-options composer is idempotent when already installed',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  const factories=fixtureFactories(ChooseCardsPromptResolver,AttachToolTactic);
  const options={
    promptResolvers:[ChooseCardsPromptResolver],
    tactics:[AttachToolTactic]
  };
  const once=withHoodCandidateBotOptions(options,factories);
  const twice=withHoodCandidateBotOptions(once,factories);
  assert.equal(twice.promptResolvers[0],once.promptResolvers[0]);
  assert.equal(twice.tactics[0],once.tactics[0]);
});

test('Hood bot-options composer fails closed when a pinned base class is absent',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  class Other {}
  const factories=fixtureFactories(ChooseCardsPromptResolver,AttachToolTactic);
  assert.throws(()=>withHoodCandidateBotOptions({
    promptResolvers:[Other],tactics:[AttachToolTactic]
  },factories),/Pinned ChooseCardsPromptResolver missing/);
  assert.throws(()=>withHoodCandidateBotOptions({
    promptResolvers:[ChooseCardsPromptResolver],tactics:[Other]
  },factories),/Pinned AttachToolTactic missing/);
});
