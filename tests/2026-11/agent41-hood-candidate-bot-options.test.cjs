'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withHoodCandidateBotOptions,withHoodCandidateBotOptionsBySeat
}=require('../../simulation/twinleaf/hood-candidate-bot-options.cjs');

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

test('seat-ordered Hood options isolate the candidate in either physical seat',()=>{
  class ChooseCardsPromptResolver {}
  class AttachToolTactic {}
  const factories=fixtureFactories(ChooseCardsPromptResolver,AttachToolTactic);
  const base={
    promptResolvers:[ChooseCardsPromptResolver],
    tactics:[AttachToolTactic],
    scores:[{name:'score'}],
    arbiter:{flipMode:'seeded'}
  };
  for(const candidateSeat of [0,1]) {
    const bySeat=withHoodCandidateBotOptionsBySeat(base,candidateSeat,factories);
    const opponentSeat=1-candidateSeat;
    assert.equal(bySeat.length,2);
    assert.notEqual(bySeat[0],bySeat[1]);
    assert.notEqual(bySeat[0].promptResolvers,bySeat[1].promptResolvers);
    assert.notEqual(bySeat[0].tactics,bySeat[1].tactics);
    assert.equal(bySeat[candidateSeat].promptResolvers[0].name,
      'HoodAwareArvenResolver');
    assert.equal(bySeat[candidateSeat].tactics[0].name,
      'HoodAwareAttachToolTactic');
    assert.equal(bySeat[opponentSeat].promptResolvers[0],
      ChooseCardsPromptResolver);
    assert.equal(bySeat[opponentSeat].tactics[0],AttachToolTactic);
    assert.equal(bySeat[candidateSeat].scores[0],base.scores[0]);
    assert.equal(bySeat[opponentSeat].scores[0],base.scores[0]);
  }
  assert.deepEqual(base.promptResolvers,[ChooseCardsPromptResolver]);
  assert.deepEqual(base.tactics,[AttachToolTactic]);
  assert.throws(()=>withHoodCandidateBotOptionsBySeat(base,2,factories),
    /candidateSeat must be physical seat/);
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
