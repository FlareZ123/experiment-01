'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {holdSoloThornsBench,VERSION}=
  require('../simulation/twinleaf/agent14-thorns-solo-energy-retention.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const THORNS='Iron Thorns ex TWM';
const DCE='Double Colorless Energy SUM';
const LIGHTNING=4;
const COLORLESS=9;
const catalog={
  basics:new Set([THORNS]),
  abilityBasics:new Set([THORNS]),
  basicEnergies:new Set(),
  specialEnergies:new Set([DCE]),
  basicEnergyTypes:{Lightning:LIGHTNING,Fairy:8},
  colorlessEnergyType:COLORLESS,
  specialConditions:{ASLEEP:2,PARALYZED:3},
  stages:{BASIC:0},
  dragonPokemonPrintings:new Set()
};

/** @returns {object} Full detached actor observation test fixture. */
function fixture(){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:[THORNS],
    ownTurnResources:{
      pokemonPlayLocked:false,energyPlayedTurn:2,energyPlayLocked:false,
      stadiumPlayedTurn:0,stadiumPlayLocked:false
    },
    opponentPublic:{
      stadium:[],prizeCount:6
    },
    ownPublic:{
      active:{
        name:'Iron Thorns ex',printing:THORNS,
        energies:[DCE],specialConditions:[],
        publicRestrictions:{},printed:{stage:0,types:[LIGHTNING]},
        attacks:[{name:'Volt Cyclone',cost:[LIGHTNING,COLORLESS,COLORLESS]}]
      },
      bench:[null,null,null,null,null],
      stadium:['Thunder Mountain Prism Star LOT'],
      prizeCount:6,publicTurnRestrictions:{
        attackLockTurnsRemaining:0
      }
    }
  };
}

test('actual actor root retains DCE when voluntarily preserving no Bench',()=>{
  const view=fixture();
  assert.equal(VERSION,'agent14-solo-thorns-energy-retention-v2-hand-funded');
  assert.equal(holdSoloThornsBench(view,catalog),true);
  assert.equal(chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true
  }).kind,'bench-basic');
  assert.deepEqual(chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true,thornsSoloEnergyRetention:true
  }),{kind:'attack',attackName:'Volt Cyclone'});
});

test('held Thunder and DCE allow a complete source-turn solo attack before auto-Bench',()=>{
  const view=fixture();
  view.ownPublic.active.energies=[];
  view.ownPublic.stadium=[];
  view.ownHand=[THORNS,DCE,'Thunder Mountain Prism Star LOT'];
  view.ownTurnResources.specialEnergyPlayLocked=false;
  view.ownTurnResources.energyPlayedTurn=0;
  assert.equal(holdSoloThornsBench(view,catalog),true);
  assert.equal(chooseActorRootIntent(view,catalog,{thornsDirectLine:true}).kind,
    'bench-basic','baseline still benches the spare Thorns before setup');
  const options={thornsDirectLine:true,thornsSoloEnergyRetention:true};
  assert.deepEqual(chooseActorRootIntent(view,catalog,options),{
    kind:'play-thunder-mountain',handIndex:2,
    printing:'Thunder Mountain Prism Star LOT'
  });
  view.ownHand.pop();
  view.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  assert.deepEqual(chooseActorRootIntent(view,catalog,options),{
    kind:'attach-dce',handIndex:1,printing:DCE
  });
  view.ownHand.splice(1,1);
  view.ownPublic.active.energies=[DCE];
  view.ownTurnResources.energyPlayedTurn=view.globalTurn;
  assert.deepEqual(chooseActorRootIntent(view,catalog,options),{
    kind:'attack',attackName:'Volt Cyclone'
  });
  assert.ok(view.ownPublic.bench.every(x=>x===null));
});

test('only genuinely currently attachable held Special Energy enables hand-funded hold',()=>{
  const view=fixture();
  view.ownPublic.active.energies=[];
  view.ownPublic.stadium=[];
  view.ownHand=[THORNS,DCE,'Thunder Mountain Prism Star LOT'];
  view.ownTurnResources.specialEnergyPlayLocked=false;
  view.ownTurnResources.energyPlayedTurn=2;
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.ownTurnResources.energyPlayedTurn=0;
  view.ownTurnResources.stadiumPlayedTurn=2;
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.ownTurnResources.stadiumPlayedTurn=0;
  view.ownTurnResources.stadiumPlayLocked=true;
  assert.equal(holdSoloThornsBench(view,catalog),false);
});

test('no Thunder, no attacking Energy, or existing Bench leaves default admission unchanged',()=>{
  const view=fixture();
  view.ownPublic.stadium=[];
  assert.equal(holdSoloThornsBench(view,catalog),false);
  assert.equal(chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true,thornsSoloEnergyRetention:true
  }).kind,'bench-basic');
  view.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  view.ownPublic.active.energies=[];
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.ownPublic.active.energies=[DCE];
  view.ownPublic.bench[0]={name:'Iron Thorns ex'};
  assert.equal(holdSoloThornsBench(view,catalog),false);
});

test('owner lock, status and native turn gate block solo inference',()=>{
  const view=fixture();
  view.globalTurn=1;
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.globalTurn=2;
  view.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP];
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.ownPublic.active.specialConditions=[];
  view.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.ownPublic.active.publicRestrictions.cannotAttackNextTurn=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(holdSoloThornsBench(view,catalog),false);
});

test('unrecognized Energy and exact opponent concealed zones cannot authorize hold',()=>{
  const view=fixture();
  view.ownPublic.active.energies=['Unmodeled Energy XXX'];
  assert.equal(holdSoloThornsBench(view,catalog),false);
  view.ownPublic.active.energies=[DCE];
  view.opponentPublic=new Proxy(view.opponentPublic,{get(target,key){
    if(['hand','deck','prizes'].includes(key))
      throw Error('illegal opponent private zone access');
    return target[key];
  }});
  assert.equal(holdSoloThornsBench(view,catalog),true);
});

test('actor-independent default untouched and retains long-run survival choice',()=>{
  const view=fixture();
  assert.equal(chooseActorRootIntent(view,catalog).kind,'bench-basic');
  view.ownHand=[];
  assert.equal(chooseActorRootIntent(view,catalog,{
    thornsSoloEnergyRetention:true,thornsDirectLine:true
  }).kind,'attack');
});
