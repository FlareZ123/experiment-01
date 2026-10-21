'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/**
 * Owner-authored printed Mewtwo active snapshot preserving the pinned
 * native card's missing gxAttack marker. No true opponent concealed zones.
 * @param {boolean} usedGx
 * @returns {object}
 */
function mewtwoView(usedGx=false){
  return {
    decisionKind:'owner-root',globalTurn:48,ownHand:[],
    ownPublic:{
      active:{printing:'Mewtwo & Mew-GX UNM',
        name:'Mewtwo & Mew-GX',
        energies:['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'],
        attacks:[{name:'Miraculous Duo-GX',cost:[5,5,9],
          gxAttack:false,damage:200,text:'You cannot use more than 1 GX attack.'}],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{gxUsed:usedGx,
        cannotUseGXAttacks:false,attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[]},
    ownTurnResources:{energyPlayedTurn:48,energyPlayLocked:false,
      pokemonPlayLocked:false,specialEnergyPlayLocked:false}
  };
}

test('unmarked printed Miraculous Duo-GX stays excluded under default root',()=>{
  assert.deepEqual(chooseActorRootIntent(mewtwoView(false),catalog),
    {kind:'pass',reason:'no-supported-owner-visible-root'});
});

test('explicit printed-GX opt-in requires available global GX quota',()=>{
  assert.deepEqual(chooseActorRootIntent(mewtwoView(false),catalog,
    {printedGxRoot:true}),{
    kind:'attack',attackName:'Miraculous Duo-GX'});
  for(const key of ['gxUsed','cannotUseGXAttacks']){
    const blocked=mewtwoView(false);
    blocked.ownPublic.publicTurnRestrictions[key]=true;
    assert.equal(chooseActorRootIntent(blocked,catalog,
      {printedGxRoot:true}).kind,'pass',
      'A spent or disabled GX must never become an actor root');
  }
});

test('GX suffix is sufficient when native gxAttack is false',()=>{
  const blocked=mewtwoView(true);
  assert.equal(chooseActorRootIntent(blocked,catalog).kind,'pass');
  assert.equal(chooseActorRootIntent(blocked,catalog,
    {printedGxRoot:true}).kind,'pass');
});

test('normal attack and genuine gxAttack flag retain original behavior',()=>{
  const normal=mewtwoView(true);
  normal.ownPublic.active.attacks=[
    {name:'Poltergeist',cost:[5,5],gxAttack:false}];
  assert.deepEqual(chooseActorRootIntent(normal,catalog),{
    kind:'attack',attackName:'Poltergeist'});
  const flagged=mewtwoView(true);
  flagged.ownPublic.active.attacks=[
    {name:'Unmarked GX attack name',cost:[5,5],gxAttack:true}];
  assert.equal(chooseActorRootIntent(flagged,catalog).kind,'pass');
  assert.equal(chooseActorRootIntent(flagged,catalog,
    {printedGxRoot:true}).kind,'pass');
});
