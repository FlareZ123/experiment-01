'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {bilateralStadiumEntitlement,VERSION}=
  require('../simulation/twinleaf/agent7-bilateral-stadium-energy-entitlement.cjs');

const type={
  GRASS:1,FIRE:2,WATER:3,LIGHTNING:4,PSYCHIC:5,
  FIGHTING:6,DARK:7,METAL:8,COLORLESS:9,FAIRY:10,DRAGON:11
};
const refs={
  cardTypes:type,stageBasic:2,
  trainerCatalog:new Map([
    ['Wondrous Labyrinth Prism Star TEU',{
      name:'Wondrous Labyrinth Prism Star',type:'Stadium'}],
    ['Thunder Mountain Prism Star LOT',{
      name:'Thunder Mountain Prism Star',type:'Stadium'}],
    ['Path to the Peak CRE',{name:'Path to the Peak',type:'Stadium'}]
  ])
};

/** @returns {object} Detached public roots, no opponent hidden zone. */
function source(){
  return {
    decisionKind:'owner-root',globalTurn:10,actorSeat:0,
    ownHand:['Thunder Mountain Prism Star LOT'],
    ownTurnResources:{
      stadiumPlayedTurn:2,stadiumPlayLocked:false
    },
    ownPublic:{
      stadium:['Wondrous Labyrinth Prism Star TEU'],
      prizeCount:6,
      active:{
        printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
        printed:{stage:2,types:[type.LIGHTNING]},
        energies:[
          'Speed Lightning Energy RCL',
          'Capture Energy RCL',
          'Speed Lightning Energy RCL'
        ],
        attacks:[{
          name:'Volt Cyclone',
          cost:[type.LIGHTNING,type.COLORLESS,type.COLORLESS],
          damage:140,gxAttack:false
        }]
      }
    },
    opponentPublic:{
      stadium:[],prizeCount:6,
      active:{
        printing:'Unown AOR',name:'Unown',
        printed:{stage:2,types:[type.PSYCHIC]},
        energies:['Prism Energy ASC'],
        attacks:[{
          name:'Hidden Power',
          cost:[type.COLORLESS],damage:10,gxAttack:false
        }]
      }
    }
  };
}

test('rank6 Wondrous to Thunder funds source Volt Cyclone and opponent Unown Hidden Power',()=>{
  const delta=bilateralStadiumEntitlement(source(),
    'Thunder Mountain Prism Star LOT',refs);
  assert.equal(delta.version,VERSION);
  assert.equal(delta.status,'public-bilateral-printed-cost-comparison');
  assert.deepEqual(delta.owner.newlyPayable.map(x=>x.attackName),
    ['Volt Cyclone']);
  assert.deepEqual(delta.opponent.newlyPayable.map(x=>x.attackName),
    ['Hidden Power']);
  assert.deepEqual(delta.opponent.attackDeltas[0].beforeCost,['C','C']);
  assert.deepEqual(delta.opponent.attackDeltas[0].afterCost,['C']);
  assert.equal(delta.opponent.attackDeltas[0].beforePayable,false);
  assert.equal(delta.opponent.attackDeltas[0].afterPayable,true);
  assert.equal(delta.flags.simultaneousOwnerOpponentUnlock,true);
});

test('counter Energy uses the opposing seat Prize perspective',()=>{
  const state=source();
  state.ownPublic.prizeCount=4;
  state.opponentPublic.prizeCount=6;
  state.opponentPublic.active={
    printing:'Girafarig LOT',name:'Girafarig',
    printed:{stage:2,types:[type.PSYCHIC]},
    energies:['Counter Energy CIN'],
    attacks:[{
      name:'Mind Shock',cost:[type.PSYCHIC,type.COLORLESS],
      damage:70,gxAttack:false
    }]
  };
  const result=bilateralStadiumEntitlement(state,
    'Thunder Mountain Prism Star LOT',refs);
  assert.deepEqual(result.opponent.newlyPayable.map(x=>x.attackName),
    ['Mind Shock']);
  assert.equal(result.opponent.attackDeltas[0].beforePayable,false);
  assert.equal(result.opponent.attackDeltas[0].afterPayable,true);
  // When the opposing seat is not behind, Counter Energy supplies only C.
  state.opponentPublic.prizeCount=3;
  const notBehind=bilateralStadiumEntitlement(state,
    'Thunder Mountain Prism Star LOT',refs);
  assert.deepEqual(notBehind.opponent.newlyPayable,[]);
  assert.equal(notBehind.opponent.attackDeltas[0].afterPayable,false);
});

test('model explicitly handles zero-damage attack effects without granting attack permission',()=>{
  const state=source();
  state.opponentPublic.active.attacks=[{
    name:'Item Lock',cost:[type.COLORLESS],
    damage:0,gxAttack:false
  }];
  const result=bilateralStadiumEntitlement(state,
    'Thunder Mountain Prism Star LOT',refs);
  assert.deepEqual(result.opponent.newlyPayable.map(x=>x.attackName),
    ['Item Lock']);
  assert.equal(result.opponent.attackDeltas[0].printedDamage,0);
  assert.match(result.caveat,/GX quota/);
});

test('no unavailable Stadium triggers an opponent computation',()=>{
  const state=source();
  state.ownHand=[];
  const result=bilateralStadiumEntitlement(state,
    'Thunder Mountain Prism Star LOT',refs);
  assert.equal(result.status,'paper-candidate-unavailable');
  assert.equal(result.opponent.status,'not-evaluated-unavailable-stadium');
});

test('no opposing printing is recorded as unknown, not a clean opponent state',()=>{
  const state=source();
  state.opponentPublic.active={printing:'Unknown'};
  const result=bilateralStadiumEntitlement(state,
    'Thunder Mountain Prism Star LOT',refs);
  assert.equal(result.bothSidesReady,false);
  assert.equal(result.opponent.status,'opponent-active-printing-unknown');
});

test('opposing hidden-zone accessors are never accessed',()=>{
  const state=source();
  for(const forbidden of ['hiddenHand','hiddenDeck','hiddenPrizes']){
    Object.defineProperty(state.opponentPublic,forbidden,{
      get(){throw new Error('Unauthorized hidden opponent zone: '+forbidden);}
    });
  }
  const result=bilateralStadiumEntitlement(state,
    'Thunder Mountain Prism Star LOT',refs);
  assert.equal(result.flags.opponentGainsPrintedEnergyOption,true);
});

test('missing public Prize or stage data cannot certify conditional Energy',()=>{
  const missingPrize=source();
  delete missingPrize.opponentPublic.prizeCount;
  const first=bilateralStadiumEntitlement(missingPrize,
    'Thunder Mountain Prism Star LOT',refs);
  assert.equal(first.opponent.status,'opponent-active-printing-unknown');
  assert.equal(first.bothSidesReady,false);
  const missingStage=source();
  delete missingStage.opponentPublic.active.printed.stage;
  const second=bilateralStadiumEntitlement(missingStage,
    'Thunder Mountain Prism Star LOT',refs);
  assert.equal(second.opponent.status,'opponent-active-printing-unknown');
  assert.equal(second.flags.opponentGainsPrintedEnergyOption,false);
});
