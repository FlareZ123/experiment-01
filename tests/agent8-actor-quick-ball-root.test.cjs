'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,QUICK_BALL,QUICK_BALL_PRINTINGS,chooseQuickBallRootIntent}=
  require('../simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
/** @returns {object} Fully detached actor root fixture. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:[QUICK_BALL,'Switch SVI','Switch SVI'],
    ownTurnResources:{itemPlayLocked:false,pokemonPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,energyPlayedTurn:0},
    ownPublic:{active:{name:'Regidrago V',energies:[],attacks:[],
      specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],deckCount:21,stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{stadium:[]}
  };
}
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(),specialEnergies:new Set(),
  basicEnergyTypes:{},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}};
test('existing root unchanged until explicit Item opt-in',()=>{
  const v=view();
  assert.equal(VERSION,'agent8-actor-quick-ball-root-v2-fst-printing-parity');
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
  const wanted={kind:'play-quick-ball',handIndex:0,printing:'Quick Ball SSH'};
  assert.deepEqual(chooseQuickBallRootIntent(v),wanted);
  assert.deepEqual(chooseActorRootIntent(v,catalog,{quickBallRoot:true}),wanted);
});
test('Aichi FST Quick Ball is an exact-printing native root, default policy unchanged',()=>{
  const v=view();
  v.ownHand=['Quick Ball FST','Switch SVI','Switch SVI'];
  assert.deepEqual(QUICK_BALL_PRINTINGS,[QUICK_BALL,'Quick Ball FST']);
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
  const expected={kind:'play-quick-ball',handIndex:0,printing:'Quick Ball FST'};
  assert.deepEqual(chooseQuickBallRootIntent(v),expected);
  assert.deepEqual(chooseActorRootIntent(v,catalog,{quickBallRoot:true}),expected);
  v.ownHand=['Switch SVI','Switch SVI','Quick Ball FST'];
  assert.deepEqual(chooseQuickBallRootIntent(v),{
    ...expected,handIndex:2
  });
});

test('alternate Quick Ball printing cannot satisfy discard-surplus condition',()=>{
  const v=view();
  v.ownHand=['Quick Ball FST','Quick Ball SSH','Boss Orders PAL'];
  assert.equal(chooseQuickBallRootIntent(v),null);
  v.ownHand=['Quick Ball FST','Quick Ball SSH','Switch SVI','Switch SVI'];
  assert.deepEqual(chooseQuickBallRootIntent(v),{
    kind:'play-quick-ball',handIndex:0,printing:'Quick Ball FST'
  });
  v.ownHand=['Quick Ball FST','Switch SVI','Mysterious Treasure FLI'];
  assert.equal(chooseQuickBallRootIntent(v),null);
});

test('a distinct redundant printing is required before Item discard',()=>{
  const v=view();
  v.ownHand=[QUICK_BALL,'Ultra Ball SVI','Forest Seal Stone SIT'];
  assert.equal(chooseQuickBallRootIntent(v),null);
  v.ownHand=[QUICK_BALL,QUICK_BALL,'Ultra Ball SVI'];
  assert.equal(chooseQuickBallRootIntent(v),null);
  v.ownHand=['Switch SVI','Switch SVI',QUICK_BALL];
  assert.deepEqual(chooseQuickBallRootIntent(v),
    {kind:'play-quick-ball',handIndex:2,printing:QUICK_BALL});
});
test('Item, Pokémon locks, zero deck and full Bench block Item',()=>{
  const v=view();
  v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseQuickBallRootIntent(v),null);
  v.ownTurnResources.itemPlayLocked=false;
  v.ownTurnResources.pokemonPlayLocked=true;
  assert.equal(chooseQuickBallRootIntent(v),null);
  v.ownTurnResources.pokemonPlayLocked=false;
  v.ownPublic.deckCount=0;
  assert.equal(chooseQuickBallRootIntent(v),null);
  v.ownPublic.deckCount=2;
  v.ownPublic.bench.fill({name:'Occupied'});
  assert.equal(chooseQuickBallRootIntent(v),null);
});
test('concealed opponent hand and Prize identity cannot affect Item intent',()=>{
  const a=view(),b=view();
  a.unknownOpponentHand=['Boss'];b.unknownOpponentHand=['Hood'];
  a.unknownPrizes=['A'];b.unknownPrizes=['B'];
  assert.deepEqual(chooseQuickBallRootIntent(a),chooseQuickBallRootIntent(b));
});
test('physical witness verifies native Item movement before search settlement',()=>{
  const intent={kind:'play-quick-ball',printing:QUICK_BALL};
  const before={turn:4,phase:2,handCount:3,quickBallSpent:0};
  const after={turn:4,phase:2,handCount:2,quickBallSpent:1};
  assert.equal(rootPhysicalWitness(intent,before,after,{FINISHED:7}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,
    {...after,quickBallSpent:0},{FINISHED:7}),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,
    {...after,handCount:3},{FINISHED:7}),
    'no-confirmed-public-effect');
});
