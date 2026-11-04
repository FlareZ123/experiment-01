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

test('public opponent Active Tool Jammer prevents Float Stone mobility even when Store accepts it',()=>{
  const view=sample();
  view.opponentPublic.active={tools:['Tool Jammer BST']};
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null,
    'do not equip a Float Stone that cannot grant free retreat');
  view.ownPublic.active.tools=[FLOAT_STONE];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null,
    'already attached Float Stone remains suppressed on paper');
  view.opponentPublic.active.tools=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone');
});

test('Tool Jammer only functions on opponent Active; printed free retreat survives',()=>{
  const view=sample();
  view.opponentPublic.active={tools:[]};
  view.opponentPublic.bench=[{tools:['Tool Jammer BST']}];
  view.ownPublic.active.tools=[FLOAT_STONE];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone',
    'Jammer on the opponent Bench has no effect');
  view.opponentPublic.active.tools=['Tool Jammer BST'];
  view.ownPublic.active.printed.retreatCost=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone',
    'printed zero Retreat Cost is unaffected by Tool suppression');
});

test('opponent hidden zones never affect public Tool Jammer decisions',()=>{
  const view=sample();
  const inaccessible=new Proxy({},{get(){throw Error('hidden data read');}});
  view.opponentPublic.active={tools:['Tool Jammer BST']};
  view.opponentPublic.hand=inaccessible;
  view.opponentPublic.prizes=inaccessible;
  view.opponentPublic.deck=inaccessible;
  view.ownPublic.prizes=inaccessible;
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.opponentPublic.active.tools=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'attach-emergency-floatstone');
});

test('Galar Mine makes printed free retreat require a real Float Stone',()=>{
  const view=sample();
  view.ownPublic.active.printed.retreatCost=[];
  view.opponentPublic.stadium=['Galar Mine RCL'];
  view.ownHand=[];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
  view.ownHand=[FLOAT_STONE];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'attach-emergency-floatstone');
  view.ownPublic.active.tools=[FLOAT_STONE];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone');
});

test('opposing Spidops Trap Territory increases printed free Retreat Cost',()=>{
  const view=sample();
  view.ownPublic.active.printed.retreatCost=[];
  view.opponentPublic.bench=[{printing:'Spidops ex SVI',
    abilities:['Trap Territory']}];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'attach-emergency-floatstone');
  view.opponentPublic.bench=[{printing:'Spidops ex SVI',abilities:[]}];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone');
});

test('opposing Ariados Big Net affects Evolution Active only',()=>{
  const view=sample();
  view.ownPublic.active.printed.retreatCost=[];
  view.ownPublic.active.printed.stage=3;
  catalog.stages={BASIC:1,RESTORED:2,STAGE_1:3};
  view.opponentPublic.bench=[{printing:'Ariados TWM',
    abilities:['Big Net']}];
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'attach-emergency-floatstone');
  view.ownPublic.active.printed.stage=1;
  assert.equal(chooseOwnerFloatStoneMobility(view,catalog)?.kind,
    'retreat-emergency-floatstone');
  delete catalog.stages;
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
