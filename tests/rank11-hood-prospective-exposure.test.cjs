'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {fixedSeedFrame,observe}=
  require('../simulation/twinleaf/rank11-hood-prospective-exposure.cjs');

test('precommitted eight-repeat frame covers both physical source seats',()=>{
  const a=fixedSeedFrame(),b=fixedSeedFrame();
  assert.deepEqual(a,b);
  assert.equal(a.length,16);
  assert.equal(a.filter(row=>row.sourceSeat===0).length,8);
  assert.equal(a.filter(row=>row.sourceSeat===1).length,8);
  assert.equal(new Set(a.map(row=>row.seed)).size,16);
  assert.ok(a.every(row=>row.sourceSeat+row.candidateSeat===1));
});
test('authentic resolved Door uses Store action/effect ledger separately',()=>{
  const item={seed:1,sourceSeat:0,candidateSeat:1,repeat:1};
  const game={verifiedByDrawLog:true,firstTurnSlot:0,deckHashes:['a','b'],
    rank11AutonomousPolicy:{opportunityDetected:true,
      completeAtDecisionBoundary:true,nextTurnLockWitness:{equippedGarbodor:true}},
    attackDeclarationTrace:[],abilityTrace:[{seat:1,name:'Underworld Door'}],
    finished:false,prizesRemaining:[6,6],actions:44};
  const hood={events:[{kind:'selected-root-play',turn:2}]};
  const door={selected:true,events:[{kind:'verified-real-store-effect',
    attached:true,drawnTwo:true,garbodorStillTooled:true,hoodStillAttached:true}]};
  const r=observe(game,hood,door,item);
  assert.equal(r.actualSourceStartedFirst,true);
  assert.equal(r.sourceEquippedGarbodorWitness,true);
  assert.equal(r.rootDoorDeclarations,1);
  assert.equal(r.verifiedDoorEffects,1);
  assert.equal(r.engineReachedTerminal,false);
  assert.equal(r.qualifiedCompetitiveGame,false);
});
test('cannot infer positive Door resolution from selection without effects',()=>{
  const game={verifiedByDrawLog:true,firstTurnSlot:1,deckHashes:['a','b'],
    attackDeclarationTrace:[],abilityTrace:[],actions:12};
  const r=observe(game,{events:[]},{selected:true,events:[]},
    {seed:2,sourceSeat:0,candidateSeat:1,repeat:1});
  assert.equal(r.actualSourceStartedFirst,false);
  assert.equal(r.selectedDoorAbility,true);
  assert.equal(r.rootDoorDeclarations,0);
  assert.equal(r.verifiedDoorEffects,0);
});
test('draw log missing fails closed',()=>{
  assert.throws(()=>observe({verifiedByDrawLog:false}, {events:[]},
    {events:[]},{candidateSeat:1}),/True start order required/);
});
