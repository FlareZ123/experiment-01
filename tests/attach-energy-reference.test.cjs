'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureAttachEnergyReference,restoreAttachEnergyReference}=
  require('../simulation/twinleaf/attach-energy-reference.cjs');

class AttachEnergyPrompt {
  constructor(cards) {
    this.message='ATTACH_ENERGY';this.playerType=2;this.slots=[2];
    this.cardList={cards};
  }
}
class ResolvePromptAction {constructor(result){this.result=result;}}
function fixture() {
  const cards=[
    {fullName:'Psychic Energy MEE'},
    {fullName:'Psychic Energy MEE'},
    {fullName:'Double Dragon Energy ROS'}
  ];
  return {cards,prompt:new AttachEnergyPrompt(cards)};
}

test('preserves exact duplicate physical source with target enum',()=>{
  const {cards,prompt}=fixture();
  const action=new ResolvePromptAction([{card:cards[1],
    to:{player:2,slot:2,index:3}}]);
  const record=captureAttachEnergyReference(prompt,action);
  assert.deepEqual(record.selections,[{
    index:1,printing:'Psychic Energy MEE',
    to:{player:2,slot:2,index:3}
  }]);
  const replica=fixture();
  const restored=restoreAttachEnergyReference(replica.prompt,record);
  assert.equal(restored[0].card,replica.cards[1]);
  assert.notEqual(restored[0].card,replica.cards[0]);
});

test('null cancellation remains null and order-sensitive pool is checked',()=>{
  const {prompt}=fixture();
  const cancel=captureAttachEnergyReference(prompt,new ResolvePromptAction(null));
  assert.equal(restoreAttachEnergyReference(fixture().prompt,cancel),null);
  const mismatched=fixture();
  mismatched.cards.reverse();
  assert.throws(()=>restoreAttachEnergyReference(mismatched.prompt,cancel),
    /pool differs/);
});

test('unknown same-print Energy and malformed targets are rejected',()=>{
  const {prompt}=fixture();
  assert.throws(()=>captureAttachEnergyReference(prompt,
    new ResolvePromptAction([{card:{fullName:'Psychic Energy MEE'},
      to:{player:2,slot:2,index:1}}])),/absent/);
  assert.throws(()=>captureAttachEnergyReference(prompt,
    new ResolvePromptAction([{card:prompt.cardList.cards[0],
      to:{player:2,slot:2}}])),/CardTarget/);
});
