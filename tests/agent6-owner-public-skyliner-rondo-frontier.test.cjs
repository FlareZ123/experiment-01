'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const psy='Psychic Energy MEE';
const tele='Telepath [P] Energy M3';
const catalog={basicEnergies:new Set([psy]),
  basics:new Set(),abilityBasics:new Set(),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:11,PARALYZED:12}};

/** @returns {object} Detached original B source/public game state. */
function state(){
  const bench=[
    {printing:"Lillie's Clefairy ex JTG",energies:[psy,psy],
      attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
      publicRestrictions:{},specialConditions:[]},
    {printing:"Lillie's Clefairy ex JTG",energies:[],attacks:[]},
    {printing:'Unown LOT',energies:[],attacks:[]},
    {printing:'Latias ex SSP',energies:[],attacks:[],
      abilities:['Skyliner']},
    {printing:"Lillie's Clefairy ex JTG",energies:[],attacks:[]}
  ];
  return {decisionKind:'owner-root',globalTurn:33,ownHand:[],
    ownTurnResources:{retreatedTurn:0,energyPlayedTurn:33,
      pokemonPlayLocked:false},
    ownPublic:{active:{printing:'Mimikyu GRI',name:'Mimikyu',
      abilities:[],energies:[tele],
      attacks:[{name:'Filch',cost:[9],damage:0},
        {name:'Copycat',cost:[5,9],damage:0}],
      publicRestrictions:{},specialConditions:[]},
    bench,publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{active:{printing:'Duskull VIV',hp:60,damage:0,
      abilities:[],specialConditions:[]},
      bench:[{printing:'Mewtwo & Mew-GX UNM'},
        {printing:'Squawkabilly ex PAL'},
        {printing:'Unown LOT'},{printing:'Solrock PGO'},
        {printing:'Unown LOT'}]}
  };
}

test('Bench Latias Skyliner enables immediate full-bench Rondo nominal KO',()=>{
  const view=state();
  assert.deepEqual(chooseOwnerSkylinerRondoRetreat(view,catalog),{
    kind:'skyliner-rondo-retreat',benchIndex:0,
    printing:"Lillie's Clefairy ex JTG",
    attackName:'Full Moon Rondo',estimatedBaseDamage:220,
    nominalPrizeOpportunity:true,
    reason:'owner-public-skyliner-funded-rondo-nominal-active-ko'
  });
  assert.equal(chooseActorRootIntent(view,catalog,{
    skylinerRondoRetreat:true}).kind,'skyliner-rondo-retreat');
});

test('canonical default-off remains unchanged',()=>{
  const view=state();
  assert.notEqual(chooseActorRootIntent(view,catalog).kind,
    'skyliner-rondo-retreat');
});

test('does not spend a retreat when Rondo would miss a nominal KO',()=>{
  const view=state();
  view.opponentPublic.active.hp=300;
  assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog),null);
  const latias=state();
  latias.ownPublic.active={...latias.ownPublic.bench[3],
    printing:'Latias ex SSP',energies:[],attacks:[{
      name:'Eon Blade',cost:[5,5,9],damage:200
    }],publicRestrictions:{},specialConditions:[]};
  latias.opponentPublic.active.hp=300;
  assert.equal(chooseOwnerSkylinerRondoRetreat(latias,catalog),null);
});

test('retreat once, phase/stun status and Ability locks veto',()=>{
  const used=state();used.ownTurnResources.retreatedTurn=33;
  assert.equal(chooseOwnerSkylinerRondoRetreat(used,catalog),null);
  const early=state();early.globalTurn=1;
  assert.equal(chooseOwnerSkylinerRondoRetreat(early,catalog),null);
  const sleep=state();
  sleep.ownPublic.active.specialConditions=[
    catalog.specialConditions.ASLEEP];
  assert.equal(chooseOwnerSkylinerRondoRetreat(sleep,catalog),null);
  const locked=state();
  locked.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseOwnerSkylinerRondoRetreat(locked,catalog),null);
});

test('only verified exact Active source print and Energy are permitted',()=>{
  const wrong=state();wrong.ownPublic.active.printing='Mimikyu CEC';
  assert.equal(chooseOwnerSkylinerRondoRetreat(wrong,catalog),null);
  const wrongEnergy=state();wrongEnergy.ownPublic.active.energies=[psy];
  assert.equal(chooseOwnerSkylinerRondoRetreat(wrongEnergy,catalog),null);
  const withoutSkyliner=state();
  withoutSkyliner.ownPublic.bench[3].abilities=[];
  assert.equal(chooseOwnerSkylinerRondoRetreat(withoutSkyliner,catalog),null);
});

test('requires real payable Rondo and owner-public opponent HP',()=>{
  const one=state();one.ownPublic.bench[0].energies=[psy];
  assert.equal(chooseOwnerSkylinerRondoRetreat(one,catalog),null);
  const other=state();other.ownPublic.bench[0].attacks=[];
  assert.equal(chooseOwnerSkylinerRondoRetreat(other,catalog),null);
  const unknown=state();delete unknown.opponentPublic.active.hp;
  assert.equal(chooseOwnerSkylinerRondoRetreat(unknown,catalog),null);
});

test('does not inspect concealed own or opponent zones',()=>{
  const view=state();
  const unknown=new Proxy({},{get(){throw Error('hidden zone read');}});
  view.ownPublic.deck=unknown;view.ownPublic.prizes=unknown;
  view.opponentPublic.deck=unknown;view.opponentPublic.hand=unknown;
  assert.equal(chooseOwnerSkylinerRondoRetreat(view,catalog)?.benchIndex,0);
});

test('native public receipt confirms genuine energy-preserving retreat only',()=>{
  const intent={kind:'skyliner-rondo-retreat',
    benchIndex:0,printing:"Lillie's Clefairy ex JTG"};
  const before={turn:33,publicSkylinerPresent:true,
    activePokemonPrinting:'Mimikyu GRI',
    targetPokemonPrinting:"Lillie's Clefairy ex JTG",
    activeEnergies:[tele],retreatedTurn:0};
  const after={...before,activePokemonPrinting:"Lillie's Clefairy ex JTG",
    targetPokemonPrinting:'Mimikyu GRI',
    targetEnergies:[tele],retreatedTurn:33};
  assert.equal(rootPhysicalWitness(intent,before,after,{FINISHED:9}),
    'confirmed-public-effect');
  const lost={...after,targetEnergies:[]};
  assert.equal(rootPhysicalWitness(intent,before,lost,{FINISHED:9}),
    'no-confirmed-public-effect');
  const noSwap={...before,targetEnergies:[tele],retreatedTurn:33};
  assert.equal(rootPhysicalWitness(intent,before,noSwap,{FINISHED:9}),
    'no-confirmed-public-effect');
});
