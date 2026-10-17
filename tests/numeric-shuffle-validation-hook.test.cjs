'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {ShuffleDeckPrompt}=require(path.join(output,'game/store/prompts/shuffle-prompt'));
const {State}=require(path.join(output,'game/store/state/state'));
const {Player}=require(path.join(output,'game/store/state/player'));
const {installNumericShuffleValidationHook}=
  require('../simulation/twinleaf/numeric-shuffle-validation-hook.cjs');

test('pinned shuffle validator rejects a valid 12-index permutation; hook fixes it',()=>{
  const state=new State(),player=new Player();
  player.id=17;
  player.deck.cards=Array.from({length:12},(_,i)=>({id:i}));
  state.players=[player];
  const prompt=new ShuffleDeckPrompt(17);
  const identity=Array.from({length:12},(_,i)=>i);
  assert.equal(prompt.validate(identity,state),false,
    'Pinned baseline no longer exhibits the lexicographic-sort defect');
  const restore=installNumericShuffleValidationHook();
  try {
    assert.equal(prompt.validate(identity,state),true);
    assert.equal(prompt.validate(identity.slice().reverse(),state),true);
    assert.equal(prompt.validate(identity.slice(1),state),false);
    assert.equal(prompt.validate([...identity.slice(0,11),0],state),false);
    assert.equal(prompt.validate([...identity.slice(0,11),11.5],state),false);
    assert.equal(prompt.validate(null,state),false);
    assert.equal(prompt.validate('not an array',state),false);
  } finally {
    restore();
  }
  assert.equal(prompt.validate(identity,state),false,'Restoration must be exact');
});

test('shuffle hook retains prompt perspective and does not accept alien deck size',()=>{
  const state=new State(),owner=new Player(),controller=new Player();
  owner.id=7;
  controller.id=8;
  owner.deck.cards=Array.from({length:14},(_,i)=>({id:i}));
  controller.deck.cards=Array.from({length:2},(_,i)=>({id:i}));
  state.players=[owner,controller];
  const prompt=new ShuffleDeckPrompt(controller.id);
  prompt.perspectivePlayerId=owner.id;
  const restore=installNumericShuffleValidationHook();
  try {
    assert.equal(prompt.validate(Array.from({length:14},(_,i)=>i),state),true);
    assert.equal(prompt.validate([0,1],state),false);
  } finally {
    restore();
  }
});
