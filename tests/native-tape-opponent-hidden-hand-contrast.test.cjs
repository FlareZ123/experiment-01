'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeSameWorldTapeParity}=
  require('../simulation/twinleaf/native-same-world-tape-parity.cjs');
const {compareNativeOpponentHiddenHand}=
  require('../simulation/twinleaf/native-tape-opponent-hidden-hand-contrast.cjs');

const card=(fullName,id,kind)=>({fullName,id,
  ...(kind==='trainer'?{trainerType:'ITEM'}:{energyType:'BASIC'})});
function source(samePrintings=false){
  return {
    turn:3,phase:3,activePlayer:0,prompts:[],
    players:[
      {id:101,hand:{cards:[card('Own Psychic 1',1,'energy')]},
        deck:{cards:[]}},
      {id:202,hand:{cards:[card('Opponent Darkness 1',2,'energy')]},
        deck:{cards:[samePrintings?
          card('Opponent Darkness 1',3,'energy'):
          card('Opponent VIP Pass 1',3,'trainer')]}}
    ]
  };
}
const clone=state=>structuredClone(state);
const fingerprint=state=>JSON.stringify(state);
const actorView=(state,seat)=>({
  turn:state.turn,seat,ownHand:state.players[seat].hand.cards.map(x=>x.fullName),
  otherHandCount:state.players[1-seat].hand.cards.length,
  otherDeckCount:state.players[1-seat].deck.cards.length
});
const signature=action=>action;
const tape=[0.25];
const replayDecision=world=>{
  Math.random();
  return {type:world.players[1].hand.cards[0].trainerType!==undefined?
    'hidden-trainer-path':'hidden-energy-path'};
};
function argumentsFor(root=source(),callback=replayDecision,
  expected={type:'hidden-energy-path'}){
  const parity=verifyNativeSameWorldTapeParity({
    root,actualAction:expected,tape,
    cloneState:clone,replayDecision:callback,
    actionSignature:signature,fingerprint
  });
  assert.equal(parity.sameWorldDecisionParityQualified,true);
  return {root,parity,seat:0,tape,cloneState:clone,
    replayDecision:callback,actionSignature:signature,
    fingerprint,actorView};
}
test('authentic same-world parity gates a changed hidden-opponent-hand action',()=>{
  const args=argumentsFor();
  const before=fingerprint(args.root);
  const report=compareNativeOpponentHiddenHand(args);
  assert.equal(report.contrastExecutable,true);
  assert.equal(report.selectedActionChanged,true);
  assert.equal(report.actorObservationMatched,true);
  assert.equal(report.opponentHiddenInventoryConserved,true);
  assert.equal(report.sourceRootUnchanged,true);
  assert.equal(fingerprint(args.root),before);
  assert.equal(report.consumed,1);
  assert.equal(report.opponentHandCount,1);
  assert.equal(report.opponentDeckCount,1);
  assert.equal(report.informationSetLeakQualified,false);
  assert.equal(report.opponentRevealHistoryAuthenticated,false);
  assert.equal(report.competitiveGameQualified,false);
});
test('no alternate printing stays a censored no-opportunity case',()=>{
  const report=compareNativeOpponentHiddenHand(
    argumentsFor(source(true)));
  assert.equal(report.contrastExecutable,false);
  assert.match(report.error,/No distinct-printing/);
  assert.equal(report.sourceRootUnchanged,true);
});
test('caller observation that exposes concealed identities rejects exchange',()=>{
  const args=argumentsFor();
  args.actorView=(state,seat)=>({
    ...actorView(state,seat),
    hiddenHand:state.players[1-seat].hand.cards[0].fullName
  });
  const report=compareNativeOpponentHiddenHand(args);
  assert.equal(report.actorObservationMatched,false);
  assert.equal(report.contrastExecutable,false);
  assert.match(report.error,/actor-visible observation/);
});
test('alternative path exhausting original policy RNG tape is censored',()=>{
  const callback=world=>{
    Math.random();
    const trainer=world.players[1].hand.cards[0].trainerType!==undefined;
    if(trainer)Math.random();
    return {type:trainer?'trainer':'energy'};
  };
  const args=argumentsFor(source(),callback,{type:'energy'});
  const report=compareNativeOpponentHiddenHand(args);
  assert.equal(report.contrastExecutable,false);
  assert.match(report.error,/RNG replay exhausted/);
  assert.equal(report.informationSetLeakQualified,false);
});
test('different replay callback is rejected before reading a hidden card',()=>{
  const args=argumentsFor();
  args.replayDecision=world=>replayDecision(world);
  assert.throws(()=>compareNativeOpponentHiddenHand(args),
    /different policy replay callback/);
});
test('stale physical root, RNG tape and failed parity each veto',()=>{
  const a=argumentsFor();
  const changed={...a,root:source()};
  changed.root.turn=4;
  assert.throws(()=>compareNativeOpponentHiddenHand(changed),
    /different physical root/);
  assert.throws(()=>compareNativeOpponentHiddenHand({...a,tape:[0.1]}),
    /different native RNG tape/);
  assert.throws(()=>compareNativeOpponentHiddenHand({...a,
    parity:{...a.parity,sameWorldDecisionParityQualified:false}}),
    /parity required/);
});
