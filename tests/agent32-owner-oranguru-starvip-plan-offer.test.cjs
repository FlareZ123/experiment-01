'use strict';

const assert=require('node:assert/strict');
const {VERSION,PRINT,offerOranguruStarVip}=
  require('../simulation/twinleaf/agent32-owner-oranguru-starvip-plan-offer.cjs');

/** @param {object} [overrides] */
function actor(overrides={}){
  const base={
    decisionKind:'owner-root',actorSeat:0,globalTurn:1,
    ownHand:[PRINT.shake,'Darkness Energy MEE','Carmine TWM',
      'Quick Ball FST','Mega Absol ex M1L','Marnie SSH',
      'Temple of Sinnoh ASR'],
    ownPublic:{
      active:{printing:PRINT.oranguru,name:'Oranguru V',
        tools:[],abilities:['Back Order']},
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{vstarUsed:false}
    },
    opponentPublic:{
      active:{printing:'Radiant Eternatus CRZ',
        name:'Radiant Eternatus',tools:[],abilities:['Climactic Gate']},
      bench:[null,null,null,null,null],stadium:[],
    },
    ownTurnResources:{
      vstarUsed:false,itemPlayLocked:false,toolPlayLocked:false,
      pokemonPlayLocked:false,evolutionPlayLocked:false
    }
  };
  return {...base,...overrides};
}
const first=offerOranguruStarVip(actor());
assert.equal(first.eligible,true);
assert.equal(first.blocker,null);
assert.equal(first.version,VERSION);
assert.deepEqual(first.missingTools,[PRINT.forest,PRINT.float]);
assert.equal(first.firstActionHint,
  'consider-back-order-before-any-active-tool-attachment');
assert.equal(first.nativeLegality,'unverified');
assert.ok(first.requiredFutureNativePromptChain.includes(
  'Opponent real owner-root response'));
const seat1=offerOranguruStarVip(actor({actorSeat:1,globalTurn:2}));
assert.deepEqual(seat1,first,
  'The same actor-owned printed-card policy must apply to either physical seat');
const ownBothTools=offerOranguruStarVip(actor({
  ownHand:[...actor().ownHand,PRINT.forest,PRINT.float]
}));
assert.equal(ownBothTools.eligible,true);
assert.deepEqual(ownBothTools.missingTools,[]);
assert.equal(ownBothTools.firstActionHint,
  'consider-forest-seal-stone-to-active-before-star-alchemy');
const blocked=[
  [actor({ownPublic:{...actor().ownPublic,
    active:{...actor().ownPublic.active,tools:[PRINT.float]}}}),
    'oranguru-active-tool-slot-already-spent'],
  [actor({ownPublic:{...actor().ownPublic,
    bench:[{printing:'Trubbish FST'},null,null,null,null]}}),
    'other-existing-vip-or-trubbish-route'],
  [actor({ownHand:[...actor().ownHand,PRINT.vip]}),
    'other-existing-vip-or-trubbish-route'],
  [actor({ownHand:[...actor().ownHand,PRINT.garbodor,PRINT.garbodor]}),
    'both-searchable-garbodor-already-held'],
  [actor({ownTurnResources:{...actor().ownTurnResources,
    vstarUsed:true}}),'vstar-power-already-spent'],
  [actor({ownTurnResources:{...actor().ownTurnResources,
    itemPlayLocked:true}}),'known-own-play-lock'],
  [actor({ownPublic:{...actor().ownPublic,
    bench:Array.from({length:5},()=>({printing:'Mega Absol ex M1L'}))}}),
    'no-open-bench-slot'],
  [actor({opponentPublic:{...actor().opponentPublic,
    active:{name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
      abilities:['Initialization'],tools:[]}}}),
    'opposing-active-initialization'],
  [actor({opponentPublic:{...actor().opponentPublic,
    active:{name:'Galarian Weezing',printing:'Galarian Weezing RCL',
      abilities:['Neutralizing Gas'],tools:[]}}}),
    'opposing-active-neutralizing-gas'],
  [actor({opponentPublic:{...actor().opponentPublic,
    stadium:['Path to the Peak CRE']}}),
    'path-to-the-peak-ability-lock'],
  [actor({opponentPublic:{...actor().opponentPublic,
    bench:[{name:'Garbodor',printing:'Garbodor BKP',
      tools:[PRINT.float],abilities:['Garbotoxin']},null,null,null,null]}}),
    'opposing-equipped-garbotoxin']
];
for(const [view,expected] of blocked){
  const r=offerOranguruStarVip(view);
  assert.equal(r.eligible,false);
  assert.equal(r.blocker,expected);
}
const altered=actor({
  secretOwnerDeck:['Battle VIP Pass FST'],
  secretOwnerPrizes:['Garbodor BKP'],
  opponentPrivateHand:['Battle VIP Pass FST'],
  opponentFutureTurn:'loss',
});
assert.deepEqual(offerOranguruStarVip(altered),first,
  'Actor-only offer may not branch on hidden deck, Prizes or opponent hand');
assert.throws(()=>offerOranguruStarVip(
  actor({decisionKind:'owner-prompt'})));
console.log('Agent32 owner-observable Star-VIP plan: K0, two seats, 11 blockers, and hidden-order isolation OK');
