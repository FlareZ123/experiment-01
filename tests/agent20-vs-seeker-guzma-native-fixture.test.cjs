'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,createSyntheticActorObservation
}=require('../simulation/evaluation/agent20-vs-seeker-guzma-native-fixture.cjs');

function fixtureView(state,seat){
  const owner=state.players[seat];
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:owner.hand.cards.map(card=>card.fullName),
    ownPublic:{
      bench:[{printing:'Bench attacker'}],
      discard:owner.discard.cards.map(card=>card.fullName),
      resolvingSupporter:[]
    },
    opponentPublic:{bench:[{printing:'Opponent target'}]},
    ownTurnResources:{
      supporterPlayedTurn:owner.supporterTurn,
      itemPlayLocked:false,supporterPlayLocked:false
    }
  };
}

test('injects exact physical VS Seeker and Guzma cards once at a valid owner root',()=>{
  const guzma={fullName:'Guzma BUS',physicalId:'g1'};
  const seeker={fullName:'VS Seeker PHF',physicalId:'v1'};
  const owner={
    id:101,supporterTurn:0,
    hand:{cards:[guzma]},
    deck:{cards:[seeker]},
    discard:{cards:[]}
  };
  const opponent={id:202};
  const state={players:[owner,opponent]};
  const fixture=createSyntheticActorObservation({baseObservation:fixtureView});
  const view=fixture.observe(state,0);
  assert.equal(fixture.audit.version,VERSION);
  assert.equal(fixture.audit.injections.length,1);
  assert.equal(fixture.audit.injections[0].vsSeekerSource,'deck');
  assert.equal(fixture.audit.injections[0].guzmaSource,'hand');
  assert.ok(owner.hand.cards.includes(seeker));
  assert.ok(!owner.hand.cards.includes(guzma));
  assert.ok(owner.discard.cards.includes(guzma));
  assert.deepEqual(view.ownHand,['VS Seeker PHF']);
  assert.deepEqual(view.ownPublic.discard,['Guzma BUS']);
  fixture.observe(state,0);
  assert.equal(fixture.audit.injections.length,1);
});

test('does not inject while the owner has already used the Supporter',()=>{
  const owner={
    id:101,supporterTurn:1,
    hand:{cards:[]},
    deck:{cards:[
      {fullName:'VS Seeker PHF'},
      {fullName:'Guzma BUS'}
    ]},
    discard:{cards:[]}
  };
  const state={players:[owner,{id:202}]};
  const fixture=createSyntheticActorObservation({baseObservation:fixtureView});
  fixture.observe(state,0);
  assert.equal(fixture.audit.injections.length,0);
  assert.equal(fixture.audit.injectionAttempts,0);
  assert.equal(owner.hand.cards.length,0);
  assert.equal(owner.discard.cards.length,0);
});
