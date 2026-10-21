'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {skipEmptyTrubbishCallForFamily}=require('../simulation/twinleaf/agent39-fullbench-call-for-family.cjs');
const DARK=7,COLORLESS=9;
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Darkness Energy MEE']),
  basicEnergyTypes:{Darkness:DARK},colorlessEnergyType:COLORLESS,
  specialConditions:{ASLEEP:2,PARALYZED:0}};

/** @returns {object} Detached owner-readable turn-48 fixture. */
function view(){
  return {decisionKind:'owner-root',globalTurn:48,ownHand:[],
    ownTurnResources:{pokemonPlayLocked:false,energyPlayLocked:false,energyPlayedTurn:48},
    ownPublic:{
      active:{name:'Trubbish',printing:'Trubbish FST',
        energies:['Darkness Energy MEE'],specialConditions:[],
        publicRestrictions:{},printed:{types:[DARK]},attacks:[
          {name:'Call for Family',cost:[DARK],damage:0},
          {name:'Super Poison Breath',cost:[DARK,COLORLESS],damage:20}]},
      bench:Array(5).fill({name:'public Bench Pokémon'}),stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{damage:0,hp:190},handCount:4,discard:[],stadium:[]}};
}
test('legacy picks first payable Call for Family',()=>{
  assert.deepEqual(chooseActorRootIntent(view(),{}),
    {kind:'attack',attackName:'Call for Family'});
});
test('full-Bench opt-in skips empty exact-print setup attack',()=>{
  const v=view();
  assert.equal(skipEmptyTrubbishCallForFamily(v,v.ownPublic.active.attacks[0]),true);
  assert.deepEqual(chooseActorRootIntent(v,{fullBenchCallForFamilyRoot:true}),{kind:'pass'});
});
test('one free Bench space allows printed Call for Family',()=>{
  const v=view();v.ownPublic.bench[3]=null;
  assert.equal(chooseActorRootIntent(v,{fullBenchCallForFamilyRoot:true}).attackName,'Call for Family');
});
test('other printing preserves first payable attack',()=>{
  const v=view();v.ownPublic.active.printing='Trubbish OTHER';
  assert.equal(chooseActorRootIntent(v,{fullBenchCallForFamilyRoot:true}).attackName,'Call for Family');
});
test('two Energy permits second damaging attack after filter',()=>{
  const v=view();v.ownPublic.active.energies.push('Darkness Energy MEE');
  assert.equal(chooseActorRootIntent(v,{fullBenchCallForFamilyRoot:true}).attackName,'Super Poison Breath');
});
test('opponent concealed fields do not change actor intent',()=>{
  const a=view(),b=view();b.opponentPublic.handCount=15;
  b.opponentPublic.unknownPrizeCard='secret';
  assert.deepEqual(chooseActorRootIntent(a,{fullBenchCallForFamilyRoot:true}),
    chooseActorRootIntent(b,{fullBenchCallForFamilyRoot:true}));
});
