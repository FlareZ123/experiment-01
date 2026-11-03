'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { chooseFundedStadiumAttack, costUnderStadium,
  toEnergySymbols, VERSION } =
  require('../simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs');

const types={GRASS:1,FIRE:2,WATER:3,LIGHTNING:4,PSYCHIC:5,
  FIGHTING:6,DARK:7,METAL:8,COLORLESS:9,FAIRY:10,DRAGON:11};
const refs={
  cardTypes:types,stageBasic:2,specialConditions:{ASLEEP:3,PARALYZED:4},
  trainerCatalog:new Map([
    ['Wondrous Labyrinth Prism Star TEU',
      {name:'Wondrous Labyrinth Prism Star',type:'Stadium'}],
    ['Thunder Mountain Prism Star LOT',
      {name:'Thunder Mountain Prism Star',type:'Stadium'}],
    ['Sky Field ROS',{name:'Sky Field',type:'Stadium'}],
    ['Path to the Peak CRE',{name:'Path to the Peak',type:'Stadium'}],
    ['Silent Lab PRC',{name:'Silent Lab',type:'Stadium'}]
  ])
};

function view(){
  return {
    decisionKind:'owner-root',
    actorSeat:0,globalTurn:10,
    ownHand:['Thunder Mountain Prism Star LOT','Sky Field ROS'],
    ownPublic:{
      active:{
        printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
        printed:{stage:2,types:[types.LIGHTNING]},
        energies:['Speed Lightning Energy RCL','Capture Energy RCL',
          'Speed Lightning Energy RCL'],
        attacks:[{name:'Volt Cyclone',
          cost:[types.LIGHTNING,types.COLORLESS,types.COLORLESS],
          damage:140,gxAttack:false}],
        publicRestrictions:{
          cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[]
        },
        specialConditions:[]
      },
      stadium:['Wondrous Labyrinth Prism Star TEU'],
      bench:[null,null,null,null,null],
      prizeCount:6,
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      stadium:[],active:{hp:60,damage:0,printing:'Unown AOR'},
      prizeCount:6
    },
    ownTurnResources:{
      stadiumPlayLocked:false,stadiumPlayedTurn:2
    }
  };
}

test('printed source 6 Wondrous to Thunder makes Volt Cyclone payable',()=>{
  assert.equal(typeof VERSION,'string');
  const proposal=chooseFundedStadiumAttack(view(),refs);
  assert.ok(proposal);
  assert.equal(proposal.kind,'play-funded-stadium');
  assert.equal(proposal.printing,'Thunder Mountain Prism Star LOT');
  assert.equal(proposal.handIndex,0);
  assert.equal(proposal.attackName,'Volt Cyclone');
  assert.equal(proposal.baseDamage,140);
  assert.deepEqual(proposal.modeledOldCost,['L','C','C','C']);
  assert.deepEqual(proposal.modeledNewCost,['C','C']);
  assert.equal(proposal.availableModeledEnergyUnits,3);
  assert.equal(proposal.printedPotentialKnockout,true);
});

test('same printed attack non-Thunder alternative never gets fake cost credit',()=>{
  const a=view();
  a.ownHand=['Sky Field ROS'];
  assert.equal(chooseFundedStadiumAttack(a,refs),null);
});

test('no positive change for rank5 Path to Sky Field even when legal',()=>{
  const a=view();
  a.ownPublic.stadium=['Path to the Peak CRE'];
  a.ownHand=['Sky Field ROS'];
  assert.equal(chooseFundedStadiumAttack(a,refs),null);
});

test('owner public lock, turn quota, attack lock and insufficient energy veto',()=>{
  for(const modify of [
    a=>{a.ownTurnResources.stadiumPlayLocked=true;},
    a=>{a.ownTurnResources.stadiumPlayedTurn=10;},
    a=>{a.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;},
    a=>{a.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;},
    a=>{a.ownPublic.active.specialConditions=[refs.specialConditions.ASLEEP];},
    a=>{a.ownPublic.active.energies=['Capture Energy RCL'];}
  ]){
    const a=view();modify(a);
    assert.equal(chooseFundedStadiumAttack(a,refs),null);
  }
});

test('native CardType costs keep type-constrained Energy distinct',()=>{
  assert.deepEqual(toEnergySymbols(
    [types.LIGHTNING,types.COLORLESS,types.PSYCHIC],types),['L','C','P']);
  assert.deepEqual(costUnderStadium([types.LIGHTNING,types.COLORLESS],
    [types.LIGHTNING],'Wondrous Labyrinth Prism Star',types),
  [types.LIGHTNING,types.COLORLESS,types.COLORLESS]);
  assert.deepEqual(costUnderStadium([types.LIGHTNING,types.COLORLESS],
    [types.LIGHTNING],'Thunder Mountain Prism Star',types),
    [types.COLORLESS]);
  assert.deepEqual(costUnderStadium([types.LIGHTNING],
    [types.LIGHTNING],'Silent Lab',types),[types.LIGHTNING]);
  assert.equal(costUnderStadium([types.LIGHTNING],
    [types.LIGHTNING],'Unknown Stadium',types),null);
});

test('hidden opponent hand and deck are never inspected by chooser',()=>{
  const a=view();
  Object.defineProperty(a.opponentPublic,'hiddenDeck',{get(){
    throw new Error('Forbidden concealed deck read');
  }});
  Object.defineProperty(a.opponentPublic,'hiddenHand',{get(){
    throw new Error('Forbidden concealed hand read');
  }});
  assert.ok(chooseFundedStadiumAttack(a,refs));
});
