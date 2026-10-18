'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {swapHiddenPrize}=require('../simulation/twinleaf/prize-membership-live-probe.cjs');

const card=(name,id)=>({fullName:name,id});
function state(secret=true) {
  return {players:[{id:101,deck:{cards:[card('A',1),card('B',2)]},
    prizes:[{isSecret:secret,cards:[card('C',3)]}]},
    {id:202,deck:{cards:[card('D',4)]},prizes:[]}]};
}
const fingerprint=s=>JSON.stringify(s);
const choose=s=>s.players[0].deck.cards[0].fullName;

test('face-down Prize swaps one owned physical card without altering source',()=>{
  const source=state(),before=structuredClone(source);
  const probe=swapHiddenPrize(source,101,structuredClone,choose,fingerprint);
  assert.equal(probe.exposed,true);
  assert.equal(probe.originalAction,'A');
  assert.equal(probe.swappedAction,'C');
  assert.equal(probe.actionChanged,true);
  assert.equal(probe.sourceStatePreserved,true);
  assert.deepEqual(source,before);
});

test('observed Prize cannot be swapped by the hidden-state probe',()=>{
  const probe=swapHiddenPrize(state(false),101,structuredClone,choose,fingerprint);
  assert.equal(probe.exposed,false);
  assert.equal(probe.reason,'no facedown prize slot');
});

test('physically identical printing does not admit a meaningful card swap',()=>{
  const a=state();
  a.players[0].deck.cards=[card('C',4)];
  assert.equal(swapHiddenPrize(a,101,structuredClone,choose,fingerprint).exposed,false);
});
