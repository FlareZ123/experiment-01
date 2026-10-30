'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseTropicalBeachLastChance}=
  require('../simulation/twinleaf/agent33-tropical-beach-lastchance.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
function view(){return {decisionKind:'owner-root',globalTurn:6,
  ownHand:['P','Q','R'],ownPublic:{active:{printing:'Dratini OBF',
    energies:[],attacks:[]},bench:[],stadium:['Tropical Beach BWP'],
    deckCount:25,handCount:3},opponentPublic:{stadium:[],handCount:4},
  ownTurnResources:{stadiumUsedTurn:0,energyPlayLocked:true,
    pokemonPlayLocked:true}};}
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(),specialConditions:{ASLEEP:-1,PARALYZED:-2}};
test('offers last-chance Beach with four draws and safe remaining deck',()=>{
  assert.deepEqual(chooseTropicalBeachLastChance(view()),{
    kind:'use-tropical-beach',cardsToDraw:4,
    reason:'otherwise-pass-draw-before-ending-turn'});
});
test('works with opponent-placed visible Beach',()=>{
  const x=view();x.opponentPublic.stadium=x.ownPublic.stadium;
  x.ownPublic.stadium=[];
  assert.equal(chooseTropicalBeachLastChance(x)?.kind,'use-tropical-beach');
});
test('cannot use twice in same global turn',()=>{
  const x=view();x.ownTurnResources.stadiumUsedTurn=6;
  assert.equal(chooseTropicalBeachLastChance(x),null);
});
test('unknown Stadium-use clock fails closed',()=>{
  const x=view();delete x.ownTurnResources.stadiumUsedTurn;
  assert.equal(chooseTropicalBeachLastChance(x),null);
});
test('one-card draw and no draw preserve deck',()=>{
  const x=view();x.ownHand=Array(6).fill('X');
  assert.equal(chooseTropicalBeachLastChance(x),null);
  x.ownHand=Array(7).fill('X');
  assert.equal(chooseTropicalBeachLastChance(x),null);
});
test('thin deck is conserved rather than greedily drawn',()=>{
  const x=view();x.ownPublic.deckCount=9;
  assert.equal(chooseTropicalBeachLastChance(x),null);
  x.ownPublic.deckCount=10;
  assert.equal(chooseTropicalBeachLastChance(x)?.cardsToDraw,4);
});
test('non-Beach Stadium and terminal board do not propose use',()=>{
  const x=view();x.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseTropicalBeachLastChance(x),null);
  x.ownPublic.stadium=['Tropical Beach BWP'];x.ownPublic.active=null;
  assert.equal(chooseTropicalBeachLastChance(x),null);
});
test('opponent hidden cards and prizes cannot affect owner proposal',()=>{
  const a=view(),b=view();b.opponentSecret={hand:['injected'],deck:['X']};
  assert.deepEqual(chooseTropicalBeachLastChance(a),
    chooseTropicalBeachLastChance(b));
});
test('default root remains Pass; only explicit opt-in gives Beach action',()=>{
  const x=view();
  assert.equal(chooseActorRootIntent(x,catalog).kind,'pass');
  assert.deepEqual(chooseActorRootIntent(x,catalog,{
    tropicalBeachLastChance:true}),chooseTropicalBeachLastChance(x));
});
