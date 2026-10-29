'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {LILLIE}=require('../simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs');
const {chooseLowHandLillieBeforeAttack}=require('../simulation/twinleaf/agent25-lowhand-lillie-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
const ownerView=()=>({
  decisionKind:'owner-root',actorSeat:0,globalTurn:4,
  ownHand:[LILLIE],
  ownPublic:{
    active:{
      energies:['Psychic Energy MEE'],
      attacks:[{name:'Shadow Mist',cost:[5],gxAttack:false}],
      specialConditions:[],publicRestrictions:{}
    },
    bench:[{},null,null,null,null],
    deckCount:32,prizeCount:6,resolvingSupporter:[],
    publicTurnRestrictions:{supporterPlayLocked:false,attackLockTurnsRemaining:0}
  },
  ownTurnResources:{
    energyPlayedTurn:4,energyPlayLocked:false,pokemonPlayLocked:false,
    supporterPlayedTurn:0,supporterPlayLocked:false
  }
});

test('Lillie opportunity preempts a payable attack only under explicit opt-in',()=>{
  const view=ownerView();
  assert.deepEqual(chooseActorRootIntent(view,catalog),{
    kind:'attack',attackName:'Shadow Mist'
  });
  assert.deepEqual(chooseLowHandLillieBeforeAttack(view),{
    kind:'play-lowhand-lillie',handIndex:0,printing:LILLIE
  });
  assert.deepEqual(chooseActorRootIntent(view,catalog,{lowHandLillieRoot:true}),
    {kind:'play-lowhand-lillie',handIndex:0,printing:LILLIE});
});

test('paper first turn, quota, locks, deck floor and higher hand preserve attack',()=>{
  const modifications=[
    view=>{view.globalTurn=1;},
    view=>{view.ownTurnResources.supporterPlayedTurn=1;},
    view=>{view.ownTurnResources.supporterPlayLocked=true;},
    view=>{view.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;},
    view=>{view.ownPublic.deckCount=7;},
    view=>{view.ownPublic.resolvingSupporter=['Iono PAL'];},
    view=>{view.ownHand.push('A','B','C');},
    view=>{view.ownHand=["Lillie's Determination OTHER"];},
    view=>{view.ownTurnResources.supporterPlayedTurn=undefined;}
  ];
  for(const modify of modifications){
    const view=ownerView();modify(view);
    assert.equal(chooseLowHandLillieBeforeAttack(view),null);
    assert.notEqual(chooseActorRootIntent(view,catalog,{
      lowHandLillieRoot:true
    }).kind,'play-lowhand-lillie');
  }
});

test('opponent hidden hand and own unknown deck order do not affect selection',()=>{
  const a=ownerView();
  const b=structuredClone(a);
  a.opponentHiddenHand=['Iono PAL','Boss\'s Orders PAL'];
  b.opponentHiddenHand=['No known printings'];
  a.ownUnknownDeckOrder=['Secret Box TWM'];
  b.ownUnknownDeckOrder=['Lillie\'s Clefairy ex JTG'];
  assert.deepEqual(chooseLowHandLillieBeforeAttack(a),
    chooseLowHandLillieBeforeAttack(b));
});

test('public Supporter expenditure and turn quota require two independent witnesses',()=>{
  const card={fullName:LILLIE};
  const active={energies:{cards:[]},tools:[],getPokemonCard:()=>null};
  const owner={hand:{cards:[card]},active,bench:[],
    stadium:{cards:[]},discard:{cards:[]},supporter:{cards:[]},
    supporterTurn:0};
  const state={turn:4,phase:3,players:[owner,{}]};
  const intent={kind:'play-lowhand-lillie',printing:LILLIE,handIndex:0};
  const before=rootPhysicalSnapshot(state,0,intent);
  owner.hand.cards.pop();
  owner.supporter.cards.push(card);
  let after=rootPhysicalSnapshot(state,0,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'no-confirmed-public-effect');
  owner.supporterTurn=1;
  after=rootPhysicalSnapshot(state,0,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'confirmed-public-effect');
  assert.equal(after.supporterSpent,1);
  assert.equal(after.marnieSpent,undefined);
});

test('existing Marnie witness retains its original field after extension',()=>{
  const card={fullName:'Marnie SSH'};
  const owner={hand:{cards:[card]},active:{
    energies:{cards:[]},tools:[],getPokemonCard:()=>null
  },bench:[],stadium:{cards:[]},discard:{cards:[]},
  supporter:{cards:[]},supporterTurn:0};
  const snap=rootPhysicalSnapshot({turn:4,phase:3,players:[owner,{}]},
    0,{kind:'play-stranded-marnie',printing:card.fullName});
  assert.equal(snap.marnieSpent,0);
  assert.equal(snap.supporterSpent,0);
});
