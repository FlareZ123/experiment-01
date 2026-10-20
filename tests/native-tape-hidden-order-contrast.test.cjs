'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareNativeHiddenDeckOrder}=
  require('../simulation/twinleaf/native-tape-hidden-order-contrast.cjs');

const {digest}=require('../simulation/twinleaf/native-policy-random-tape.cjs');

const makeInput=(overrides={})=>{
  const root={turn:3,activePlayer:0,players:[
    {hand:['A'],deck:{cards:['topX','topY','topZ']}},
    {hand:['hidden'],deck:{cards:['other']}}
  ]};
  const input={
    parity:{
      schema:'native-same-world-tape-parity-v1',
      sameWorldDecisionParityQualified:true,
      actualAction:{kind:'PlayCardAction',name:'A'},
      rootAtEntry:JSON.stringify(root),rootAtExit:JSON.stringify(root),
      tapeSha256:digest([0.25]),tapeDraws:1,consumed:1,
      sourceRootUnchanged:true,physicalCloneMatched:true,
      selectedActionMatched:true,replayError:null
    },
    root,seat:0,tape:[0.25],
    cloneState:structuredClone,
    fingerprint:JSON.stringify,
    actorView:(state,seat)=>({
      turn:state.turn,
      ownHand:state.players[seat].hand.slice(),
      ownDeckSize:state.players[seat].deck.cards.length
    }),
    replayDecision:state=>{
      assert.equal(Math.random(),0.25);
      assert.deepEqual(state.players[0].deck.cards,
        ['topZ','topY','topX']);
      return {kind:'PassTurnAction'};
    },
    actionSignature:action=>action,
    ...overrides
  };
  Object.defineProperty(input.parity,'replayDecisionRef',{
    value:input.replayDecision,enumerable:false
  });
  return input;
};

test('executable action reversal is explicitly unqualified without owner knowledge',()=>{
  const source=makeInput(),snapshot=JSON.stringify(source.root);
  const report=compareNativeHiddenDeckOrder(source);
  assert.equal(report.contrastExecutable,true);
  assert.equal(report.permutationChangedPhysicalOrder,true);
  assert.equal(report.actorObservationMatched,true);
  assert.equal(report.selectedActionChanged,true);
  assert.equal(report.informationSetLeakQualified,false);
  assert.equal(report.ownerDeckKnownTopAuthenticated,false);
  assert.equal(report.ownerK0K1HistoryAuthenticated,false);
  assert.equal(report.competitiveGameQualified,false);
  assert.equal(JSON.stringify(source.root),snapshot);
});


test('authenticated known top is preserved while unknown suffix is reversed',()=>{
  const args=makeInput({
    knownTopCount:1,knownTopVerified:true,
    actorView:(state,seat)=>({
      ownHand:state.players[seat].hand.slice(),
      observedTop:state.players[seat].deck.cards[0],
      ownDeckSize:state.players[seat].deck.cards.length
    }),
    replayDecision:state=>{
      assert.equal(Math.random(),0.25);
      assert.deepEqual(state.players[0].deck.cards,
        ['topX','topZ','topY']);
      return {kind:'PassTurnAction'};
    }
  });
  const snapshot=JSON.stringify(args.root);
  const report=compareNativeHiddenDeckOrder(args);
  assert.equal(report.contrastExecutable,true);
  assert.equal(report.actorObservationMatched,true);
  assert.equal(report.permutationChangedPhysicalOrder,true);
  assert.equal(report.preservedKnownTopCount,1);
  assert.equal(report.ownerDeckKnownTopAuthenticated,true);
  assert.equal(report.informationSetLeakQualified,false);
  assert.equal(JSON.stringify(args.root),snapshot);
});

test('known-top assertions require authenticated observed prefix',()=>{
  for(const opts of [
    {knownTopCount:1},
    {knownTopCount:1,knownTopVerified:false},
    {knownTopCount:-1,knownTopVerified:true},
    {knownTopCount:0.5,knownTopVerified:true}
  ]){
    assert.throws(()=>compareNativeHiddenDeckOrder(
      makeInput(opts)),/authenticated observation|nonnegative safe integer/);
  }
});

test('cannot permute a suffix containing fewer than two cards',()=>{
  const args=makeInput({
    knownTopCount:2,knownTopVerified:true,
    replayDecision:()=>{throw new Error('must not be called');}
  });
  const report=compareNativeHiddenDeckOrder(args);
  assert.equal(report.contrastExecutable,false);
  assert.equal(report.preservedKnownTopCount,2);
  assert.match(report.error,/Not enough unknown deck suffix/);
});

test('entire-deck reversal is rejected when known top is exposed',()=>{
  const args=makeInput({
    actorView:(state,seat)=>({
      exposedTop:state.players[seat].deck.cards[0],
      ownDeckSize:state.players[seat].deck.cards.length
    })
  });
  const report=compareNativeHiddenDeckOrder(args);
  assert.equal(report.contrastExecutable,false);
  assert.equal(report.actorObservationMatched,false);
});

test('actual same-world parity is mandatory before any hidden contrast',()=>{
  assert.throws(()=>compareNativeHiddenDeckOrder(makeInput({
    parity:{sameWorldDecisionParityQualified:false}
  })),/mandatory/);
});

test('owner deck below two cards yields no comparison',()=>{
  const args=makeInput();
  args.root.players[0].deck.cards=['only'];
  args.parity.rootAtEntry=JSON.stringify(args.root);
  args.parity.rootAtExit=JSON.stringify(args.root);
  const report=compareNativeHiddenDeckOrder(args);
  assert.equal(report.contrastExecutable,false);
  assert.match(report.error,/Not enough/);
});

test('actor-observable identity change vetoes counterfactual',()=>{
  const args=makeInput();
  args.actorView=(s,seat)=>({
    firstDeckCard:s.players[seat].deck.cards[0]
  });
  const report=compareNativeHiddenDeckOrder(args);
  assert.equal(report.actorObservationMatched,false);
  assert.equal(report.contrastExecutable,false);
  assert.match(report.error,/actor-visible/);
});

test('RNG tape overread and underread veto the hypothetical comparison',()=>{
  for(const replayDecision of [
    ()=>{Math.random();Math.random();return {kind:'PassTurnAction'};},
    ()=>({kind:'PassTurnAction'})
  ]){
    const report=compareNativeHiddenDeckOrder(makeInput({replayDecision}));
    assert.equal(report.contrastExecutable,false);
    assert.match(report.error,/exhausted|consumption mismatch/);
  }
});

test('source alias mutation invalidates an otherwise matching hidden contrast',()=>{
  const args=makeInput();
  args.replayDecision=()=>{
    Math.random();
    args.root.players[0].hand.push('ILLEGAL');
    return {kind:'PassTurnAction'};
  };
  // This particular fixture intentionally tests post-authentication alias
  // interference, so bind its changed synthetic callback to fresh metadata.
  args.parity={...args.parity};
  Object.defineProperty(args.parity,'replayDecisionRef',{
    value:args.replayDecision,enumerable:false
  });
  const report=compareNativeHiddenDeckOrder(args);
  assert.equal(report.sourceRootUnchanged,false);
  assert.equal(report.contrastExecutable,false);
  assert.match(report.error,/mutated original/);
});

test('different native source roots fail before comparison',()=>{
  const input=makeInput();
  input.root.players[0].hand.push('unexpected');
  assert.throws(()=>compareNativeHiddenDeckOrder(input),/Native parity root/);
});

test('different native RNG tapes fail before comparison',()=>{
  const input=makeInput();
  input.tape=[0.75];
  assert.throws(()=>compareNativeHiddenDeckOrder(input),/Native parity RNG tape/);
});

test('a success flag without a parity record is insufficient',()=>{
  const input=makeInput();
  input.parity={sameWorldDecisionParityQualified:true};
  assert.throws(()=>compareNativeHiddenDeckOrder(input),/parity provenance schema/);
});

test('native replay callback identity must remain the same',()=>{
  const input=makeInput();
  input.replayDecision=()=>({kind:'PassTurnAction'});
  assert.throws(()=>compareNativeHiddenDeckOrder(input),
    /Native parity replay-policy callback identity mismatch/);
});
