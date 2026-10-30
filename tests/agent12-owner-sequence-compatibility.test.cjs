'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {ownerSequenceCompatibility} =
  require('../simulation/twinleaf/agent12-owner-sequence-compatibility.cjs');

/** @returns {object} Fresh authenticated-owner-shaped input. */
function view(turn=2){
  return {actorSeat:0,decisionKind:'owner-root',globalTurn:turn,
    ownHand:['Lillie\'s Determination MEG','Carmine TWM',
      'Double Dragon Energy ROS','Boost Shake EVS','Battle VIP Pass FST',
      'Grass Energy SVE','Quick Ball SSH','Trubbish FST'],
    ownPublic:{bench:[null,null,null,null,null]},
    ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0,
      energyPlayedTurn:0,stadiumPlayedTurn:0,
      supporterPlayLocked:false,itemPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      pokemonPlayLocked:false,evolutionPlayLocked:false,
      stadiumPlayLocked:false,toolPlayLocked:false}};
}
const held=(kind,handIndex,v)=>({kind,handIndex,printing:v.ownHand[handIndex]});
function order(r,a,b){return r.orders.find(x=>x.first===a&&x.then===b);}

test('attack vs Bench Special Energy distinguishes terminal from provisional continuation',()=>{
  const v=view(),a={kind:'attack',attackName:'Apex Dragon'},
    b={...held('attach-special-energy',2,v),slot:'bench',index:0};
  const r=ownerSequenceCompatibility(v,[a,b]);
  assert.equal(order(r,0,1).reason,'first-action-ends-turn');
  assert.equal(order(r,1,0).status,'requires-native-settlement-and-fresh-owner-root');
  assert.equal(order(r,1,0).nativeAccepted,false);
  assert.equal(order(r,1,0).secondActionObserved,false);
  console.log('PASS: attack->energy excluded, energy->attack requires native reobservation');
});

test('Boost Shake terminates turn although it is an Item',()=>{
  const v=view(),boost=held('play-boost-shake',3,v),
    quick=held('play-quick-ball',6,v);
  const r=ownerSequenceCompatibility(v,[boost,quick]);
  assert.equal(order(r,0,1).reason,'first-action-ends-turn');
  assert.equal(order(r,1,0).status,'requires-native-settlement-and-fresh-owner-root');
  assert.equal(r.offers[0].quota,'item');
  console.log('PASS: first Boost Shake consumes entire turn, unlike Quick Ball');
});

test('Supporter contention, Item sequencing, and correct first-turn Carmine exception',()=>{
  const v=view(),lillie=held('play-lowhand-lillie',0,v),
    carmine=held('play-carmine-first',1,v),
    quick=held('play-quick-ball',6,v);
  const r=ownerSequenceCompatibility(v,[lillie,carmine,quick]);
  assert.equal(order(r,0,1).reason,'same-turn-supporter-quota');
  assert.equal(order(r,1,0).reason,'same-turn-supporter-quota');
  assert.equal(order(r,2,1).status,'requires-native-settlement-and-fresh-owner-root');
  const first=ownerSequenceCompatibility(view(1),[lillie,carmine]);
  assert.equal(first.offers[0].reason,'ordinary-supporter-on-first-turn');
  assert.equal(first.offers[1].rootStatus,'not-native-verified');
  assert.equal(order(first,1,0).status,'excluded');
  console.log('PASS: two Supporters collide; first-player Carmine exception retained');
});

test('Energy quota and physical hand reuse block impossible same-turn orders',()=>{
  const v=view(),grass=held('attach-basic-energy',5,v),
    doubleDragon=held('attach-special-energy',2,v);
  const r=ownerSequenceCompatibility(v,[grass,doubleDragon]);
  assert.equal(order(r,0,1).reason,'same-turn-energy-quota');
  assert.equal(order(r,1,0).reason,'same-turn-energy-quota');
  const quick=held('play-quick-ball',6,v);
  const reused=ownerSequenceCompatibility(v,[quick,quick]);
  assert.equal(order(reused,0,1).reason,'same-physical-owner-hand-card');
  const v2=view();v2.ownTurnResources.energyPlayedTurn=2;
  const blocked=ownerSequenceCompatibility(v2,[grass]);
  assert.equal(blocked.offers[0].reason,'energy-already-attached');
  console.log('PASS: energy quota, physical card consumption, native-root gate');
});

test('Competing Bench installations and unsupported intents are excluded',()=>{
  const v=view();
  const p=held('bench-basic',7,v);
  const a={...p,benchIndex:0};
  const b={...p,benchIndex:1};
  assert.equal(ownerSequenceCompatibility(v,[a,b]).orders[0].reason,
    'same-physical-owner-hand-card');
  const u=ownerSequenceCompatibility(v,[{kind:'unknown-unimplemented-action'}]);
  assert.equal(u.offers[0].reason,'unknown-action-family');
  assert.equal(u.offers[0].rootStatus,'excluded');
  console.log('PASS: same physical Basic cannot be Benched twice; unknown actions fail closed');
});

test('Opponent concealed identities do not enter the decision matrix',()=>{
  const a=view(),b=view();
  a.opponentSecret={hand:['Carmine','Guzma'],prizes:['A']};
  b.opponentSecret={hand:['Energy','Item'],prizes:['Z']};
  const offers=[{kind:'attack',attackName:'Rolling Iron'},
    held('play-lowhand-lillie',0,a)];
  assert.deepEqual(ownerSequenceCompatibility(a,offers),
    ownerSequenceCompatibility(b,offers));
  console.log('PASS: distinct opponent private configurations yield the same output');
});

test('Missing or mismatched owner physical printing is not called playable',()=>{
  const v=view();
  const r=ownerSequenceCompatibility(v,[
    {kind:'play-quick-ball',handIndex:6,printing:'Ultra Ball SVI'},
    {kind:'play-quick-ball',handIndex:99,printing:'Quick Ball SSH'}]);
  assert.deepEqual(r.offers.map(x=>x.reason),[
    'owner-hand-printing-unmatched','owner-hand-printing-unmatched']);
  console.log('PASS: both invalid physical hand locations rejected');
});
