'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerVsSeekerGuzmaRoot}=require('../simulation/twinleaf/agent48-owner-vs-seeker-guzma-root.cjs');

function view(overrides={}){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:3,
    ownHand:['VS Seeker PHF'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,itemPlayLocked:false},
    ownPublic:{discard:['Guzma BUS'],bench:[null,'Mewtwo EX NXD'],resolvingSupporter:[]},
    opponentPublic:{bench:['Shaymin EX ROS',null]},
    ...overrides
  };
}

test('adapts Guzma opportunity to a native-neutral owner root intent',()=>{
  const root=chooseOwnerVsSeekerGuzmaRoot(view());
  assert.equal(root.kind,'play-seeker-get-supporter');
  assert.equal(root.handIndex,0);
  assert.equal(root.target,'Guzma BUS');
  assert.equal(root.supportItemPrinting,'VS Seeker PHF');
  assert.equal(root.opportunity.kind,'unqualified-owner-vsseeker-guzma-opportunity');
  assert.equal(Object.isFrozen(root),true);
});

test('does not propose while a Supporter is resolving',()=>{
  assert.equal(chooseOwnerVsSeekerGuzmaRoot(view({
    ownPublic:{discard:['Guzma BUS'],bench:[null,'Mewtwo EX NXD'],resolvingSupporter:['Guzma BUS']}
  })),null);
});

test('does not propose when the underlying public frontier is unavailable',()=>{
  assert.equal(chooseOwnerVsSeekerGuzmaRoot(view({ownHand:['Quick Ball SSH']})),null);
});
