'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PRINTS}=require('../simulation/evaluation/agent6-copycat-source-zone-observer.cjs');
const {createOriginalSevenCopycatCapture}=
  require('../simulation/evaluation/agent6-copycat-original-seven-capture.cjs');
const card=fullName=>({fullName});
const zone=(cards=[])=>({cards});
const SEP='ChooseStarting';
const originalSourceBasics=new Set([PRINTS.mimikyu,PRINTS.shadowRiderV]);
const setup=()=>{
 const player={id:101,
  hand:zone([card(PRINTS.mimikyu),card(PRINTS.seal),card(PRINTS.shadowRiderV),
    card('Psychic Energy'),card('Mysterious Treasure'),card('Fog Crystal'),card('Ultra Ball')]),
  active:zone(),bench:[],
  prizes:Array.from({length:6},()=>zone()),
  deck:zone([card(PRINTS.dialga),card(PRINTS.ball),card(PRINTS.shadowRiderV),card(PRINTS.shadowRiderV)]),
  discard:zone(),lostzone:zone(),stadium:zone(),supporter:zone()
 };
 return {state:{phase:1,turn:0,
   prompts:[{id:15,message:SEP,playerId:101}],players:[player,{id:202}]},
   calls:[],dispatch(a){this.calls.push(a);return a;}};
};
function transition(st){
 const p=st.state.players[0];
 p.active=zone([p.hand.cards.splice(2,1)[0]]);
 p.bench=[zone([p.hand.cards.splice(0,1)[0]])];
 p.prizes[0].cards.push(p.deck.cards.splice(0,1)[0]);
 p.prizes[1].cards.push(card('Other Prize 1'));
 p.prizes[2].cards.push(card('Other Prize 2'));
 p.prizes[3].cards.push(card('Other Prize 3'));
 p.prizes[4].cards.push(card('Other Prize 4'));
 p.prizes[5].cards.push(card('Other Prize 5'));
 p.hand.cards.push(card('Additional Turn Draw'));
 st.state.phase=2;st.state.turn=1;st.state.prompts=[];
}
test('reads original seven from actual source prompt and reconstructs initial tagged H/P/D',()=>{
 const st=setup(),orig=st.dispatch;
 const cap=createOriginalSevenCopycatCapture(0,3,SEP,originalSourceBasics);
 cap.onRootStoreCreated(st);
 st.dispatch('starting');transition(st);
 st.dispatch('first normal action');
 const v=cap.result();
 assert.equal(st.dispatch,orig);
 assert.equal(v.initialSeven.size,7);
 assert.equal(v.originalTaggedZones.mimikyu,'hand');
 assert.equal(v.originalTaggedZones.dialga,'prizes');
 assert.equal(v.originalTaggedZones.ball,'deck');
 assert.equal(v.originalTaggedZones.seal,'hand');
 assert.equal(v.initialSeven.shadowRiderVCount,1);
 assert.equal(v.oneCorePrizedBallDeck,true);
 assert.equal(v.directInitialSealAndV,true);
 assert.equal(v.exactInitialSevenComparable,true);
 assert.equal(cap.audit().sourceStartingPromptsSeen,1);
 assert.deepEqual(st.calls,['starting','first normal action']);
});
test('first stable root without previous source choose-starting prompt must fail',()=>{
 const st=setup(),cap=createOriginalSevenCopycatCapture(0,3,SEP,originalSourceBasics);
 cap.onRootStoreCreated(st);
 transition(st);
 assert.throws(()=>st.dispatch('action'),/No valid seven-card hand/);
 assert.equal(cap.result(),null);
});
test('other physical-seat prompt cannot enter source starting hand',()=>{
 const st=setup(),cap=createOriginalSevenCopycatCapture(0,3,SEP,originalSourceBasics);
 cap.onRootStoreCreated(st);
 st.state.prompts[0].playerId=202;
 st.dispatch('other choice');
 assert.equal(cap.audit().originalSevenCaptured,false);
});
test('multiple calls after successful copy do not change prior frozen snapshot',()=>{
 const st=setup(),cap=createOriginalSevenCopycatCapture(0,3,SEP,originalSourceBasics);
 cap.onRootStoreCreated(st);
 st.dispatch('setup');transition(st);st.dispatch('root');
 const got=cap.result();
 st.state.players[0].hand.cards[0].fullName='MUTATED';
 st.dispatch('later');
 assert.equal(cap.result(),got);
 assert.ok(Object.isFrozen(got));
 assert.ok(Object.isFrozen(got.originalTaggedZones));
});

test('mulligan seven is skipped, next accepted seven is captured',()=>{
 const st=setup(),cap=createOriginalSevenCopycatCapture(0,3,SEP,originalSourceBasics);
 cap.onRootStoreCreated(st);
 const source=st.state.players[0];
 source.hand.cards=Array.from({length:7},(_,i)=>card('Trainer '+i));
 st.dispatch('invalid-starting-seven');
 assert.equal(cap.result(),null);
 assert.equal(cap.audit().rejectedInvalidSevenPromptsSeen,1);
 source.hand.cards=[card(PRINTS.mimikyu),card(PRINTS.seal),
  card(PRINTS.shadowRiderV),card('Trainer1'),card('Trainer2'),
  card('Trainer3'),card('Trainer4')];
 st.dispatch('valid-starting-seven');
 transition(st);
 st.dispatch('initial-root');
 assert.equal(cap.result().initialSeven.startingBasicCount,2);
 assert.equal(cap.audit().sourceStartingPromptsSeen,2);
 assert.equal(cap.audit().rejectedInvalidSevenPromptsSeen,1);
});
