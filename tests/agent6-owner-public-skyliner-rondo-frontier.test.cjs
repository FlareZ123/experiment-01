'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const psy='Psychic Energy MEE';
const catalog={
  basicEnergies:new Set([psy]),
  basics:new Set(),abilityBasics:new Set(),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:11,PARALYZED:12}
};

/** @returns {object} Detached owner-only public decision mock. */
function state(){
  const bench=[
    {printing:"Lillie's Clefairy ex JTG",energies:[psy,psy],
      attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
      publicRestrictions:{},specialConditions:[]},
    {printing:'Mimikyu SM12',energies:[],attacks:[]},
    {printing:'Dedenne-GX UNB',energies:[],attacks:[]},
    {printing:'Unown LOT',energies:[],attacks:[]},
    {printing:'Unown LOT',energies:[],attacks:[]}
  ];
  return {decisionKind:'owner-root',globalTurn:30,ownHand:[],
    ownTurnResources:{retreatedTurn:11,energyPlayedTurn:30,
      pokemonPlayLocked:false},
    ownPublic:{active:{printing:'Latias ex SSP',name:'Latias ex',
      abilities:['Skyliner'],energies:[],
      attacks:[{name:'Eon Blade',cost:[5,5,9],damage:200}],
      publicRestrictions:{},specialConditions:[]},
    bench,publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{bench:[{printing:'Latias ex SSP'},null,null,null,null]}
  };
}

test('owner-visible Skyliner offers funded Rondo mobility and damage estimate',()=>{
  const view=state();
  assert.deepEqual(chooseOwnerSkylinerRondoRetreat(view,catalog),{
    kind:'skyliner-rondo-retreat',benchIndex:0,
    printing:"Lillie's Clefairy ex JTG",
    attackName:'Full Moon Rondo',estimatedBaseDamage:140,
    reason:'owner-public-free-retreat-into-funded-rondo'
  });
  assert.equal(chooseActorRootIntent(view,catalog,{
    skylinerRondoRetreat:true}).kind,'skyliner-rondo-retreat');
});

test('default-off canonical first-return root stays unchanged',()=>{
  const view=state();
  const control=chooseActorRootIntent(view,catalog);
  assert.notEqual(control.kind,'skyliner-rondo-retreat');
});

test('reject used retreat, early turn and blocked status',()=>{
  const view=state();view.ownTurnResources.retreatedTurn=30;
  assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog),null);
  view.ownTurnResources.retreatedTurn=11;view.globalTurn=1;
  assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog),null);
  view.globalTurn=30;
  view.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP];
  assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog),null);
});

test('preserve Active energy investment, and disallow unsupported ability',()=>{
  const withEnergy=state();withEnergy.ownPublic.active.energies=[psy];
  assert.equal(chooseOwnerSkylinerRondoRetreat(withEnergy,catalog),null);
  const withoutSkyliner=state();
  withoutSkyliner.ownPublic.active.abilities=[];
  assert.equal(chooseOwnerSkylinerRondoRetreat(withoutSkyliner,catalog),null);
});

test('requires printed Rondo, payable exact Basic Energy, and positive position',()=>{
  const one=state();one.ownPublic.bench[0].energies=[psy];
  assert.equal(chooseOwnerSkylinerRondoRetreat(one,catalog),null);
  const other=state();other.ownPublic.bench[0].attacks=[];
  assert.equal(chooseOwnerSkylinerRondoRetreat(other,catalog),null);
  const noActive=state();noActive.ownPublic.active=null;
  assert.equal(chooseOwnerSkylinerRondoRetreat(noActive,catalog),null);
});

test('does not read any concealed opponent state or own hidden deck',()=>{
  const view=state();
  const unknown=new Proxy({}, {get(){throw Error('hidden data accessed');}});
  view.ownPublic.deck=unknown;view.ownPublic.prizes=unknown;
  view.opponentPublic.deck=unknown;view.opponentPublic.hand=unknown;
  assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog)?.benchIndex,0);
});

test('owner-visible lock and retreat restrictions veto route',()=>{
  for(const field of [
    'cannotRetreatNextTurn','cannotRetreatWhileActive']){
    const view=state();view.ownPublic.active.publicRestrictions[field]=true;
    assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog),null);
  }
  const locked=state();
  locked.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseOwnerSkylinerRondoRetreat(locked,catalog),null);
});

test('native public-zone witness confirms only actual zero-cost swap',()=>{
  const {rootPhysicalWitness}=require(
    '../simulation/twinleaf/agent5-owner-root-slice.cjs');
  const intent={kind:'skyliner-rondo-retreat',
    benchIndex:0,printing:"Lillie's Clefairy ex JTG"};
  const before={turn:30,publicSkylinerPresent:true,
    activePokemonPrinting:'Latias ex SSP',
    targetPokemonPrinting:"Lillie's Clefairy ex JTG",
    activeEnergies:[],retreatedTurn:11};
  const after={...before,
    activePokemonPrinting:"Lillie's Clefairy ex JTG",
    targetPokemonPrinting:'Latias ex SSP',
    targetEnergies:[],retreatedTurn:30};
  assert.equal(rootPhysicalWitness(intent,before,after,{FINISHED:9}),
    'confirmed-public-effect');
  const noMove={...before,targetEnergies:[],retreatedTurn:30};
  assert.equal(rootPhysicalWitness(intent,before,noMove,{FINISHED:9}),
    'no-confirmed-public-effect');
  const lostEnergy={...after,targetEnergies:['Telepathic Psychic Energy']};
  assert.equal(rootPhysicalWitness(intent,before,lostEnergy,{FINISHED:9}),
    'no-confirmed-public-effect');
});
