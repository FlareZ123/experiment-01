'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,ownerVsSeekerGuzmaOpportunity
}=require('../simulation/twinleaf/agent2-vs-seeker-guzma-recovery-frontier.cjs');

function view(overrides={}){
  return {
    decisionKind:'owner-root',
    actorSeat:0,
    globalTurn:3,
    ownHand:['VS Seeker PHF','Quick Ball SSH'],
    ownTurnResources:{
      supporterPlayedTurn:0,
      supporterPlayLocked:false,
      itemPlayLocked:false
    },
    ownPublic:{
      discard:['Guzma BUS'],
      bench:[null,'Mewtwo EX NXD'],
      publicTurnRestrictions:{
        supporterPlayLocked:false,
        itemPlayLocked:false
      }
    },
    opponentPublic:{
      bench:['Shaymin EX ROS',null]
    },
    ...overrides
  };
}

test('offers an owner-public VS Seeker to Guzma recovery opportunity',()=>{
  const result=ownerVsSeekerGuzmaOpportunity(view());
  assert.equal(result.kind,'unqualified-owner-vsseeker-guzma-opportunity');
  assert.equal(result.actorSeat,0);
  assert.equal(result.supportItemPrinting,'VS Seeker PHF');
  assert.equal(result.supportItemHandIndex,0);
  assert.equal(result.desiredDiscardSupporterPrinting,'Guzma BUS');
  assert.deepEqual(result.ownerBenchOptions,[1]);
  assert.deepEqual(result.opponentBenchOptions,[0]);
  assert.equal(result.promptResolutionRequired,true);
  assert.equal(result.supporterPlayStillRequired,true);
  assert.equal(Object.isFrozen(result),true);
  assert.equal('nativeAction' in result,false);
});

test('requires a genuine owner root after the first turn',()=>{
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({decisionKind:'opponent-root'})),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({globalTurn:1})),null);
});

test('requires unused and unlocked Supporter and Item resources',()=>{
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownTurnResources:{supporterPlayedTurn:1}
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:true}
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownTurnResources:{supporterPlayedTurn:0,itemPlayLocked:true}
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownPublic:{discard:['Guzma BUS'],bench:[null,'Mewtwo EX NXD'],
      publicTurnRestrictions:{supporterPlayLocked:true}}
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownPublic:{discard:['Guzma BUS'],bench:[null,'Mewtwo EX NXD'],
      publicTurnRestrictions:{itemPlayLocked:true}}
  })),null);
});

test('requires VS Seeker in hand, Guzma in own discard, and Guzma absent from hand',()=>{
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownHand:['Quick Ball SSH']
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownPublic:{discard:[],bench:[null,'Mewtwo EX NXD']}
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownHand:['Guzma BUS','VS Seeker PHF']
  })),null);
});

test('requires at least one own and opponent Benched Pokemon',()=>{
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    ownPublic:{discard:['Guzma BUS'],bench:[null,null]}
  })),null);
  assert.equal(ownerVsSeekerGuzmaOpportunity(view({
    opponentPublic:{bench:[null,null]}
  })),null);
});

test('uses only public opponent board information',()=>{
  const baseline=ownerVsSeekerGuzmaOpportunity(view());
  const altered=ownerVsSeekerGuzmaOpportunity(view({
    opponentHand:['Guzma BUS'],
    opponentDiscard:['VS Seeker PHF'],
    opponentDeck:['Guzma BUS'],
    opponentPrizes:['Guzma BUS'],
    opponentPublic:{
      bench:['Shaymin EX ROS',null],
      active:'Mewtwo EX NXD'
    }
  }));
  assert.deepEqual(altered,baseline);
});

test('exposes a stable version for experiment provenance',()=>{
  assert.equal(VERSION,'agent2-owner-vs-seeker-guzma-resource-frontier-v1');
});
