'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeSameWorldTapeParity}=
  require('../simulation/twinleaf/native-same-world-tape-parity.cjs');
const {compareNativeOpponentHiddenHand}=
  require('../simulation/twinleaf/native-tape-opponent-hidden-hand-contrast.cjs');
const {compareNativeOpponentHiddenHandBounded}=
  require('../simulation/twinleaf/agent23-native-tape-bounded-opponent-hand.cjs');

const energy=(id,name)=>({id,fullName:name,energyType:'BASIC'});
const trainer=(id,name)=>({id,fullName:name,trainerType:'ITEM'});
const clone=structuredClone;
const fingerprint=world=>JSON.stringify(world);
const signature=value=>value;
const tape=[0.25];
const actorView=(world,seat)=>({
  turn:world.turn,actorSeat:seat,
  ownHand:world.players[seat].hand.cards.map(c=>c.fullName),
  opponentHandCount:world.players[1-seat].hand.cards.length,
  opponentDeckCount:world.players[1-seat].deck.cards.length
});

function state(){
  return {turn:3,phase:3,activePlayer:0,prompts:[],players:[
    {id:101,hand:{cards:[energy(1,'Own Psychic')]},
      deck:{cards:[]}},
    {id:202,hand:{cards:[energy(2,'Opponent Darkness')]},
      deck:{cards:[trainer(3,'Inert Trainer'),trainer(4,'Critical Trainer')]}}
  ]};
}

function readCritical(world){
  Math.random();
  const found=world.players[1].hand.cards.some(x=>
    x.fullName==='Critical Trainer');
  return {type:found?'hidden-critical-path':'owner-pass'};
}

/** @param {object} root @param {Function} [decision] */
function makeArgs(root=state(),decision=readCritical){
  const actual=decision(root);
  const parity=verifyNativeSameWorldTapeParity({
    root,actualAction:actual,tape,cloneState:clone,
    replayDecision:decision,actionSignature:signature,fingerprint
  });
  assert.equal(parity.sameWorldDecisionParityQualified,true);
  return {parity,root,seat:0,tape,cloneState:clone,
    replayDecision:decision,actionSignature:signature,
    fingerprint,actorView};
}

test('native tape second hidden exchange reveals old single-swap false negative',()=>{
  const args=makeArgs(),original=fingerprint(args.root);
  const old=compareNativeOpponentHiddenHand(args);
  assert.equal(old.contrastExecutable,true);
  assert.equal(old.selectedActionChanged,false);
  const out=compareNativeOpponentHiddenHandBounded(args,{limit:2});
  assert.equal(out.eligibleSingleExchanges,2);
  assert.equal(out.attemptedSingleExchanges,2);
  assert.equal(out.successfulSingleExchanges,2);
  assert.equal(out.failedSingleExchanges,0);
  assert.equal(out.exhaustiveSingleExchangeCoverage,true);
  assert.equal(out.contrastExecutable,true);
  assert.equal(out.selectedActionChanged,true);
  assert.equal(out.actionReversals,1);
  assert.equal(out.cases[0].actionChanged,false);
  assert.equal(out.cases[1].actionChanged,true);
  assert.equal(out.baselineReplayStable,true);
  assert.equal(out.actorObservationMatched,true);
  assert.equal(out.opponentHiddenInventoryConserved,true);
  assert.equal(out.sourceRootUnchanged,true);
  assert.equal(out.informationSetLeakQualified,false);
  assert.equal(out.competitiveGameQualified,false);
  assert.equal(fingerprint(args.root),original);
});

test('bounded one-world budget is an explicit incomplete negative',()=>{
  const args=makeArgs();
  const out=compareNativeOpponentHiddenHandBounded(args,{limit:1});
  assert.equal(out.eligibleSingleExchanges,2);
  assert.equal(out.attemptedSingleExchanges,1);
  assert.equal(out.exhaustiveSingleExchangeCoverage,false);
  assert.equal(out.contrastExecutable,true);
  assert.equal(out.actionReversals,0);
  assert.equal(out.selectedActionChanged,false);
});

test('owner-observation-only policy remains invariant across every single swap',()=>{
  const neutral=world=>{
    Math.random();
    return {type:world.players[0].hand.cards.length>0?'owner-has-hand':'owner-no-hand'};
  };
  const args=makeArgs(state(),neutral);
  const out=compareNativeOpponentHiddenHandBounded(args);
  assert.equal(out.contrastExecutable,true);
  assert.equal(out.successfulSingleExchanges,2);
  assert.equal(out.actionReversals,0);
  assert.equal(out.baselineReplayStable,true);
});

test('RNG overrun is separately censored, preserving other successful cases',()=>{
  const decision=world=>{
    Math.random();
    const critical=world.players[1].hand.cards.some(x=>
      x.fullName==='Critical Trainer');
    if(critical)Math.random();
    return {type:critical?'critical':'base'};
  };
  const args=makeArgs(state(),decision);
  const out=compareNativeOpponentHiddenHandBounded(args);
  assert.equal(out.successfulSingleExchanges,1);
  assert.equal(out.failedSingleExchanges,1);
  assert.equal(out.cases[0].executable,true);
  assert.equal(out.cases[1].executable,false);
  assert.match(out.cases[1].error,/RNG replay exhausted/);
  assert.equal(out.contrastExecutable,false);
  assert.equal(out.selectedActionChanged,false);
  assert.equal(out.baselineReplayStable,true);
  assert.equal(out.sourceRootUnchanged,true);
});

test('leaky observation projection rejects the altered worlds',()=>{
  const args=makeArgs();
  args.actorView=(world,seat)=>({
    ...actorView(world,seat),
    hiddenOpponentHand:world.players[1-seat].hand.cards[0].fullName
  });
  const out=compareNativeOpponentHiddenHandBounded(args);
  assert.equal(out.successfulSingleExchanges,0);
  assert.equal(out.failedSingleExchanges,2);
  assert.equal(out.contrastExecutable,false);
  assert.equal(out.actorObservationMatched,false);
  assert.match(out.cases[0].error,/owner-visible observation/);
});

test('missing distinct-printing alternatives do not masquerade as invariance',()=>{
  const root=state();
  root.players[1].deck.cards=[energy(5,'Opponent Darkness')];
  const out=compareNativeOpponentHiddenHandBounded(makeArgs(root));
  assert.equal(out.eligibleSingleExchanges,0);
  assert.equal(out.attemptedSingleExchanges,0);
  assert.equal(out.contrastExecutable,false);
  assert.equal(out.selectedActionChanged,false);
  assert.equal(out.baselineReplayStable,true);
});

test('stale native parity and different policy callback are preflight vetoes',()=>{
  const args=makeArgs();
  assert.throws(()=>compareNativeOpponentHiddenHandBounded({
    ...args,tape:[0.2]}),/different native RNG tape/);
  assert.throws(()=>compareNativeOpponentHiddenHandBounded({
    ...args,replayDecision:world=>readCritical(world)
  }),/different policy replay callback/);
  assert.throws(()=>compareNativeOpponentHiddenHandBounded({
    ...args,parity:{...args.parity,sameWorldDecisionParityQualified:false}
  }),/parity required/);
});

test('shallow cloned cards are rejected with original source untouched',()=>{
  const args=makeArgs(),before=fingerprint(args.root);
  args.cloneState=world=>({
    ...world,players:world.players.map(p=>({...p}))
  });
  const out=compareNativeOpponentHiddenHandBounded(args);
  assert.equal(out.contrastExecutable,false);
  assert.equal(out.successfulSingleExchanges,0);
  assert.equal(out.failedSingleExchanges,2);
  assert.match(out.cases[0].error,/Detached world reused an opponent concealed zone/);
  assert.equal(out.sourceRootUnchanged,true);
  assert.equal(fingerprint(args.root),before);
});

test('independent hidden-world replays must preserve original policy decision',()=>{
  let calls=0;
  const decision=world=>{
    Math.random();
    calls++;
    return {type:calls>3?'drift':'stable'};
  };
  const args=makeArgs(state(),decision);
  const out=compareNativeOpponentHiddenHandBounded(args);
  assert.equal(out.baselineReplayStable,false);
  assert.equal(out.contrastExecutable,false);
  assert.equal(out.selectedActionChanged,false);
  assert.match(out.error,/action drifted/);
});
