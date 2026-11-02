'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {possibleVInUnobservedZones,chooseRegisteredTreasureEarlyIntent}=
  require('../simulation/twinleaf/agent49-registered-treasure-early-setup.cjs');

const ITEM='Mysterious Treasure FLI';
const VIP='Battle VIP Pass FST';
const DONOR='Dragapult ex TWM';
const V='Regidrago V SIT';
const catalog={dragonPokemonPrintings:new Set([DONOR,V])};
const registered=[ITEM,VIP,DONOR,V,V,V,V,
  ...Array(53).fill('Psychic Energy SVE')];
assert.equal(registered.length,60);

/** @param {object} overrides Optional true owner observation components. */
function observation(overrides={}){
  return {
    actorSeat:0,globalTurn:2,decisionKind:'owner-root',
    ownHand:[ITEM,DONOR],
    ownPublic:{
      active:{name:'Venonat',printing:'Venonat MEW'},
      bench:[null,null,null,null,null],
      deckCount:45,discard:[],lostZone:[],
      publicTurnRestrictions:{itemPlayLocked:false}
    },
    ownTurnResources:{itemPlayLocked:false},
    ...overrides
  };
}

test('registered owner K0 donor plus Item offers Regidrago V search with no already present V',()=>{
  const view=observation();
  assert.equal(possibleVInUnobservedZones(view,registered),4);
  const root=chooseRegisteredTreasureEarlyIntent(view,catalog,registered);
  assert.equal(root.kind,'play-mysterious-treasure');
  assert.equal(root.discardPrinting,DONOR);
  assert.equal(root.targetIntent,'Regidrago V');
  assert.equal(root.ownerListGrounded,true);
  assert.equal(root.targetExactDeckMembershipKnown,false);
  assert.equal(root.reason,'dragon-donor-for-registered-regidrago-v');
  assert.equal(root.handIndex,0);
});

test('known expired VIP is a cheaper donor if turn beyond initial window',()=>{
  const view=observation({globalTurn:3,ownHand:[ITEM,DONOR,VIP]});
  const root=chooseRegisteredTreasureEarlyIntent(view,catalog,registered);
  assert.equal(root?.discardPrinting,VIP);
  assert.equal(root?.reason,'expired-vip-for-registered-regidrago-v');
  const first=chooseRegisteredTreasureEarlyIntent(
    observation({globalTurn:2,ownHand:[ITEM,DONOR,VIP]}),
    catalog,registered);
  assert.equal(first?.discardPrinting,DONOR);
});

test('cannot substitute knowledge of hidden Prize/deck membership for owner list',()=>{
  const base=observation();
  const declaredVCount=registered.filter(x=>x===V).length;
  assert.equal(declaredVCount,4);
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    base,catalog,registered.slice(1)),null);
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    base,catalog,Array(60).fill('Psychic Energy SVE')),null);
  const unknownPrizes=observation({ownPublic:{
    ...base.ownPublic,prizeCount:6}});
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    unknownPrizes,catalog,registered)?.targetExactDeckMembershipKnown,false);
  const allKnownDiscard=observation({ownPublic:{
    ...base.ownPublic,discard:[V,V,V,V]}});
  assert.equal(possibleVInUnobservedZones(allKnownDiscard,registered),0);
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    allKnownDiscard,catalog,registered),null);
});

test('bench full, existing Regidrago and owner Item lock independently veto early setup',()=>{
  const base=observation();
  const occupied={name:'Pidgey',printing:'Pidgey MEW'};
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    observation({ownPublic:{...base.ownPublic,
      bench:Array(5).fill(occupied)}}),catalog,registered),null);
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    observation({ownPublic:{...base.ownPublic,
      bench:[{name:'Regidrago V',printing:V},null,null,null,null]}}),
    catalog,registered),null);
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    observation({ownTurnResources:{itemPlayLocked:true}}),
    catalog,registered),null);
});

test('non-disposable owner hand cannot pay a strategically modeled donor',()=>{
  const view=observation({ownHand:[ITEM,'Forest Seal Stone SIT']});
  assert.equal(chooseRegisteredTreasureEarlyIntent(view,catalog,registered),null);
  assert.equal(chooseRegisteredTreasureEarlyIntent(
    observation({ownHand:[ITEM]}),catalog,registered),null);
});
