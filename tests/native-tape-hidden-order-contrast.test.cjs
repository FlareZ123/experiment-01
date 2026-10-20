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
  return {
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
