'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {FLOAT_STONE,chooseOwnerFloatStoneMobility}=
  require('../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs');

/** @returns {object} Minimal detached actor-only native public view. */
function sample(){
  return {
    decisionKind:'owner-root',globalTurn:7,
    ownHand:['Crispin SCR',FLOAT_STONE],
    ownTurnResources:{retreatedTurn:5,toolPlayLocked:false},
    ownPublic:{
      active:{
        printing:'Garbodor BKP',name:'Garbodor',
        energies:[],tools:[],specialConditions:[],
        printed:{retreatCost:[0,0]},
        publicRestrictions:{},
        attacks:[{name:'Offensive Bomb',cost:[1,1,1,1],damage:60}]
      },
      bench:[
        null,
        {printing:'Oranguru V ASR',energies:['Darkness Energy SVE','Darkness Energy SVE'],publicRestrictions:{}},
        {printing:'Trubbish FST',energies:['Darkness Energy SVE'],publicRestrictions:{}}
      ],
      stadium:[],publicTurnRestrictions:{toolPlayLocked:false,attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[]}
  };
}
const catalog={specialConditions:{ASLEEP:9,PARALYZED:10}};

test('unfunded active and funded Bench offer held Float Stone owner root',()=>{
  const view=sample();
  assert.deepEqual(chooseOwnerFloatStoneMobility(view,catalog),{
    kind:'attach-emergency-floatstone',handIndex:1,benchIndex:1,
    printing:'Oranguru V ASR'
  });
  assert.equal(view.ownHand[1],FLOAT_STONE);
});

test('confirmed attached Float Stone permits next owner retreat intent',()=>{
  const view=sample();view.ownPublic.active.tools=[FLOAT_STONE];
  assert.deepEqual(chooseOwnerFloatStoneMobility(view,catalog),{
    kind:'retreat-emergency-floatstone',benchIndex:1,
    printing:'Oranguru V ASR'
  });
});

test('printed no-retreat-cost uses no Tool and prefers highest card count',()=>{
  const view=sample();view.ownHand=[];
  view.ownPublic.active.printed.retreatCost=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone');
});

test('cannot assert Tool mobility under known public Jamming Tower',()=>{
  const view=sample();
  view.opponentPublic.stadium=['Jamming Tower TWM'];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownPublic.active.tools=[FLOAT_STONE];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
});

test('preserves a funded active, positive free attack, or used retreat',()=>{
  const view=sample();
  view.ownPublic.active.energies=['Darkness Energy SVE'];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownPublic.active.energies=[];
  view.ownPublic.active.attacks=[{cost:[],damage:20}];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownPublic.active.attacks=[];
  view.ownTurnResources.retreatedTurn=7;
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
});

test('respects public Tool locks, retreat effects and another Tool',()=>{
  const view=sample();
  view.ownTurnResources.toolPlayLocked=true;
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownTurnResources.toolPlayLocked=false;
  view.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=true;
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=false;
  view.ownPublic.active.tools=['Stealthy Hood UNB'];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
});

test('declines absent held printing, no charged Bench, or immobilization',()=>{
  const view=sample();view.ownHand=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownHand=[FLOAT_STONE];
  view.ownPublic.bench[1].energies=[];
  view.ownPublic.bench[2].energies=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownPublic.bench[1].energies=['Darkness Energy SVE'];
  view.ownPublic.active.specialConditions=[catalog.specialConditions.PARALYZED];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
});

test('pure planner ignores opponent unknown zones and does not mutate view',()=>{
  const view=sample();
  const before=JSON.stringify(view);
  chooseOwnerFloatStoneMobility(view,catalog);
  assert.equal(JSON.stringify(view),before);
});
