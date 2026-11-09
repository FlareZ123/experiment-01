'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerHeldArven,ARVEN}=
  require('../../simulation/twinleaf/agent1-owner-held-arven-choice.cjs');

/** @returns {object} Detached actor view. */
function view(){
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:['Mysterious Treasure FLI',ARVEN],
    ownPublic:{deckCount:35,
      publicTurnRestrictions:{supporterPlayLocked:false}},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    opponentPublic:{deckCount:45}};
}

test('finds original Arven without requiring Mail identity',()=>{
  assert.deepEqual(chooseOwnerHeldArven(view()),{
    kind:'play-original-held-arven',handIndex:1,printing:ARVEN});
  const x=view();x.ownHand=['Forest Seal Stone SIT'];
  assert.equal(chooseOwnerHeldArven(x),null);
});

test('declines setup, spent quota, lock and empty owner deck',()=>{
  const x=view();x.globalTurn=1;
  assert.equal(chooseOwnerHeldArven(x),null);
  x.globalTurn=2;x.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseOwnerHeldArven(x),null);
  x.ownTurnResources.supporterPlayedTurn=0;
  x.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseOwnerHeldArven(x),null);
  x.ownTurnResources.supporterPlayLocked=false;
  x.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseOwnerHeldArven(x),null);
  x.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  x.ownPublic.deckCount=0;
  assert.equal(chooseOwnerHeldArven(x),null);
});

test('never reads hidden opponent hand, deck or Prizes',()=>{
  const x=view();
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(x.opponentPublic,key,{
      get(){throw Error('hidden opponent read');}
    });
  assert.equal(chooseOwnerHeldArven(x)?.handIndex,1);
});
