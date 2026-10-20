'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeSameWorldTapeParity,VERSION}=
  require('../simulation/twinleaf/native-same-world-tape-parity.cjs');

const signature=action=>action;
const fingerprint=state=>JSON.stringify(state);
const clone=state=>structuredClone(state);
const input=(overrides={})=>({
  root:{activePlayer:1,players:[{hand:['A'],deck:['X','Y']}]},
  actualAction:{name:'play-A'},
  tape:[0.25,0.75],
  cloneState:clone,
  fingerprint,
  actionSignature:signature,
  replayDecision:world=>{
    assert.equal(Math.random(),0.25);
    assert.equal(Math.random(),0.75);
    assert.equal(world.players[0].hand[0],'A');
    return {name:'play-A'};
  },
  ...overrides
});

test('exact authentic tape, root and decision admit same-world parity only',()=>{
  const real=input();
  const sourceBefore=fingerprint(real.root);
  const previous=Math.random;
  const result=verifyNativeSameWorldTapeParity(real);
  assert.equal(result.schema,VERSION);
  assert.equal(result.tapeDraws,2);
  assert.equal(result.consumed,2);
  assert.equal(result.physicalCloneMatched,true);
  assert.equal(result.sourceRootUnchanged,true);
  assert.equal(result.selectedActionMatched,true);
  assert.equal(result.sameWorldDecisionParityQualified,true);
  assert.equal(result.counterfactualHiddenStateComparisonPermitted,true);
  assert.equal(result.competitiveGameQualified,false);
  assert.equal(fingerprint(real.root),sourceBefore);
  assert.strictEqual(Math.random,previous);
});


test('missing real action or omitted action signature cannot certify parity',()=>{
  const cases=[
    {actualAction:undefined,
      replayDecision:()=>{Math.random();Math.random();return undefined;}},
    {actualAction:null,
      replayDecision:()=>{Math.random();Math.random();return null;}},
    {actualAction:{name:'play-A'},
      actionSignature:()=>undefined}
  ];
  for(const opts of cases) {
    const result=verifyNativeSameWorldTapeParity(input(opts));
    assert.equal(result.sameWorldDecisionParityQualified,false);
    assert.equal(result.counterfactualHiddenStateComparisonPermitted,false);
    assert.equal(result.selectedActionMatched,false);
    assert.match(result.replayError,/genuine selected action/);
    assert.equal(result.sourceRootUnchanged,true);
  }
});

test('same source, same RNG, distinct selected action vetoes counterfactual',()=>{
  const result=verifyNativeSameWorldTapeParity(input({
    replayDecision:()=>{Math.random();Math.random();return {name:'pass'};}
  }));
  assert.equal(result.consumed,2);
  assert.equal(result.selectedActionMatched,false);
  assert.equal(result.sameWorldDecisionParityQualified,false);
  assert.equal(result.counterfactualHiddenStateComparisonPermitted,false);
});

test('short tape and swallowed exhaustion both fail closed',()=>{
  const bad=input({
    tape:[0.25],
    replayDecision:()=>{
      assert.equal(Math.random(),0.25);
      try {Math.random();} catch(error) {
        assert.match(error.message,/exhausted/);
      }
      return {name:'play-A'};
    }
  });
  const result=verifyNativeSameWorldTapeParity(bad);
  assert.match(result.replayError,/exhaustion was swallowed/);
  assert.equal(result.selectedActionMatched,false);
  assert.equal(result.sameWorldDecisionParityQualified,false);
});

test('unused authentic draws veto same-world replay',()=>{
  const result=verifyNativeSameWorldTapeParity(input({
    replayDecision:()=>{Math.random();return {name:'play-A'};}
  }));
  assert.match(result.replayError,/consumption mismatch/);
  assert.equal(result.sameWorldDecisionParityQualified,false);
});

test('unfaithful clone is rejected before constructing speculative policy',()=>{
  let decisions=0;
  const result=verifyNativeSameWorldTapeParity(input({
    cloneState:root=>({ ...clone(root),turn:999 }),
    replayDecision:()=>{decisions++;return {name:'play-A'};}
  }));
  assert.equal(decisions,0);
  assert.equal(result.physicalCloneMatched,false);
  assert.match(result.replayError,/differs from genuine physical State/);
  assert.equal(result.sameWorldDecisionParityQualified,false);
});

test('source-graph alias mutation vetoes parity even if action matches',()=>{
  const args=input({
    replayDecision:()=>{
      Math.random();Math.random();
      args.root.players[0].deck.reverse();
      return {name:'play-A'};
    }
  });
  const result=verifyNativeSameWorldTapeParity(args);
  assert.equal(result.selectedActionMatched,true);
  assert.equal(result.sourceRootUnchanged,false);
  assert.equal(result.sameWorldDecisionParityQualified,false);
});


test('object-valued fingerprint is snapped before any source mutation',()=>{
  const args=input({fingerprint:state=>state});
  args.replayDecision=()=>{
    Math.random();Math.random();
    args.root.players[0].hand[0]='ILLEGAL';
    return {name:'play-A'};
  };
  const report=verifyNativeSameWorldTapeParity(args);
  assert.equal(report.selectedActionMatched,true);
  assert.equal(report.sourceRootUnchanged,false);
  assert.equal(report.sameWorldDecisionParityQualified,false);
  assert.deepEqual(report.rootAtEntry.players[0].hand,['A']);
  assert.deepEqual(report.rootAtExit.players[0].hand,['ILLEGAL']);
});

test('a thrown detached policy action is archived as unqualified',()=>{
  const before=Math.random;
  const result=verifyNativeSameWorldTapeParity(input({
    replayDecision:()=>{throw new Error('speculative policy failure');}
  }));
  assert.match(result.replayError,/speculative policy failure/);
  assert.equal(result.sameWorldDecisionParityQualified,false);
  assert.strictEqual(Math.random,before);
});

test('a detached tactic mutation is separately reported without corrupting source',()=>{
  const result=verifyNativeSameWorldTapeParity(input({
    replayDecision:world=>{
      Math.random();Math.random();
      world.turn=999;
      return {name:'play-A'};
    }
  }));
  assert.equal(result.sameWorldDecisionParityQualified,true);
  assert.equal(result.replayModifiedClonedState,true);
  assert.equal(result.sourceRootUnchanged,true);
});
