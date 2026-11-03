'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {stadiumEntitlementDelta,VERSION}=
  require('../simulation/twinleaf/agent7-stadium-entitlement-delta.cjs');

const type={GRASS:1,FIRE:2,WATER:3,LIGHTNING:4,PSYCHIC:5,
  FIGHTING:6,DARK:7,METAL:8,COLORLESS:9,FAIRY:10,DRAGON:11};
const refs={
  cardTypes:type,stageBasic:2,
  trainerCatalog:new Map([
    ['Wondrous Labyrinth Prism Star TEU',{name:'Wondrous Labyrinth Prism Star',type:'Stadium'}],
    ['Thunder Mountain Prism Star LOT',{name:'Thunder Mountain Prism Star',type:'Stadium'}],
    ['Path to the Peak CRE',{name:'Path to the Peak',type:'Stadium'}],
    ['Path to the Peak ASR',{name:'Path to the Peak',type:'Stadium'}],
    ['Dimension Valley PHF',{name:'Dimension Valley',type:'Stadium'}],
    ['Sky Field ROS',{name:'Sky Field',type:'Stadium'}],
    ['Unknown Stadium XYZ',{name:'Unknown Stadium',type:'Stadium'}]
  ])
};
function source(){
  return {
    decisionKind:'owner-root',globalTurn:10,actorSeat:0,
    ownHand:['Thunder Mountain Prism Star LOT','Path to the Peak CRE',
      'Dimension Valley PHF','Sky Field ROS','Unknown Stadium XYZ'],
    ownTurnResources:{stadiumPlayedTurn:2,stadiumPlayLocked:false},
    ownPublic:{
      stadium:['Wondrous Labyrinth Prism Star TEU'],
      prizeCount:6,
      active:{
        printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
        printed:{stage:2,types:[type.LIGHTNING]},
        energies:['Speed Lightning Energy RCL','Capture Energy RCL',
          'Speed Lightning Energy RCL'],
        attacks:[{
          name:'Volt Cyclone',
          cost:[type.LIGHTNING,type.COLORLESS,type.COLORLESS],
          damage:140,gxAttack:false
        }]
      }
    },
    opponentPublic:{stadium:[],prizeCount:6}
  };
}

test('rank6 source Wondrous→Thunder is a positive same-owner attack entitlement flip',()=>{
  assert.equal(typeof VERSION,'string');
  const row=stadiumEntitlementDelta(source(),'Thunder Mountain Prism Star LOT',refs);
  assert.equal(row.riskCategory,'funds-new-attack');
  assert.deepEqual(row.newlyPayable.map(x=>x.attackName),['Volt Cyclone']);
  assert.deepEqual(row.newlyUnpayable,[]);
  assert.deepEqual(row.attackDeltas[0].beforeCost,['L','C','C','C']);
  assert.deepEqual(row.attackDeltas[0].afterCost,['C','C']);
  assert.equal(row.attackDeltas[0].beforePayable,false);
  assert.equal(row.attackDeltas[0].afterPayable,true);
});

test('Agent20 public Thunder→Path and Thunder→Dimension with two Speed units lose next attack',()=>{
  const a=source();
  a.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  a.ownHand=['Path to the Peak CRE','Dimension Valley PHF'];
  a.ownPublic.active.energies=[
    'Speed Lightning Energy RCL','Speed Lightning Energy RCL'
  ];
  for(const target of a.ownHand){
    const d=stadiumEntitlementDelta(a,target,refs);
    assert.equal(d.riskCategory,'loses-existing-funded-attack',target);
    assert.deepEqual(d.newlyUnpayable.map(x=>x.attackName),
      ['Volt Cyclone']);
    assert.deepEqual(d.attackDeltas[0].beforeCost,['C','C']);
    assert.deepEqual(d.attackDeltas[0].afterCost,['L','C','C']);
    assert.equal(d.attackDeltas[0].beforePayable,true);
    assert.equal(d.attackDeltas[0].afterPayable,false);
  }
});

test('Path→Sky with two Colorless does not alter printed attack entitlement',()=>{
  const a=source();
  a.ownPublic.stadium=['Path to the Peak CRE'];
  a.ownHand=['Sky Field ROS'];
  a.ownPublic.active.printed.types=[type.PSYCHIC];
  a.ownPublic.active.attacks=[{
    name:'Neutral Attack',cost:[type.COLORLESS,type.COLORLESS],
    damage:100,gxAttack:false
  }];
  a.ownPublic.active.energies=['Double Colorless Energy SUM'];
  const result=stadiumEntitlementDelta(a,'Sky Field ROS',refs);
  assert.equal(result.riskCategory,'no-printed-energy-entitlement-change');
  assert.equal(result.attackDeltas[0].beforePayable,true);
  assert.equal(result.attackDeltas[0].afterPayable,true);
});

test('unknown Stadium effect remains unresolved, not upgraded to playable',()=>{
  const a=source();
  const result=stadiumEntitlementDelta(a,'Unknown Stadium XYZ',refs);
  assert.equal(result.riskCategory,'unknown-cost-semantics');
  assert.deepEqual(result.newlyPayable,[]);
  assert.deepEqual(result.newlyUnpayable,[]);
  assert.equal(result.attackDeltas[0].afterPayable,null);
});

test('printed same-name alternate print and spent quota are vetoed',()=>{
  const a=source();
  a.ownPublic.stadium=['Path to the Peak ASR'];
  assert.equal(stadiumEntitlementDelta(a,'Path to the Peak CRE',refs).status,
    'paper-candidate-unavailable');
  a.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  a.ownTurnResources.stadiumPlayedTurn=10;
  assert.equal(stadiumEntitlementDelta(a,'Thunder Mountain Prism Star LOT',refs)
    .status,'paper-candidate-unavailable');
});

test('opponent hidden zones are never read',()=>{
  const a=source();
  Object.defineProperty(a.opponentPublic,'hiddenHand',{get(){
    throw new Error('Opponent hidden hand exposed');
  }});
  assert.equal(stadiumEntitlementDelta(a,
    'Thunder Mountain Prism Star LOT',refs).riskCategory,'funds-new-attack');
});
