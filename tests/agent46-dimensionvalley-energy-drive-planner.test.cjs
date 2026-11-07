'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const types={GRASS:1,FIRE:2,WATER:3,LIGHTNING:4,PSYCHIC:5,
  FIGHTING:6,DARK:7,METAL:8,COLORLESS:9,FAIRY:10,DRAGON:11};
const {
  VERSION,MIN_DAMAGE,costUnderStadium,estimatedAttackDamage,
  chooseFundedStadiumAttack
}=require('../simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs');
const {opponentStadiumAttackEntitlement}=
  require('../simulation/twinleaf/agent5-opponent-stadium-attack-entitlement.cjs');

const refs={
  cardTypes:types,
  stageBasic:2,
  specialConditions:{ASLEEP:3,PARALYZED:4},
  trainerCatalog:new Map([
    ['Dimension Valley PHF',{name:'Dimension Valley',type:'Stadium'}],
    ['Wondrous Labyrinth Prism Star TEU',
      {name:'Wondrous Labyrinth Prism Star',type:'Stadium'}],
    ['Thunder Mountain Prism Star LOT',
      {name:'Thunder Mountain Prism Star',type:'Stadium'}],
    ['Sky Field ROS',{name:'Sky Field',type:'Stadium'}],
    ['Path to the Peak CRE',{name:'Path to the Peak',type:'Stadium'}],
    ['Silent Lab PRC',{name:'Silent Lab',type:'Stadium'}]
  ])
};

/** @returns {object} Public owner-root shaped after the rank1 turn16 source. */
function energyDriveView(){
  return {
    decisionKind:'owner-root',
    actorSeat:0,
    globalTurn:16,
    ownHand:['Dimension Valley PHF'],
    ownPublic:{
      active:{
        printing:'Tapu Lele-GX GRI',
        name:'Tapu Lele-GX',
        printed:{stage:refs.stageBasic,types:[types.PSYCHIC]},
        energies:['Psychic Energy SVE'],
        attacks:[{
          name:'Energy Drive',
          cost:[types.COLORLESS,types.COLORLESS],
          damage:0,
          gxAttack:false
        }],
        publicRestrictions:{
          cannotAttackNextTurn:false,
          cannotUseAttacksNextTurn:[]
        },
        specialConditions:[]
      },
      stadium:[],
      bench:[null,null,null,null,null],
      prizeCount:6,
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      stadium:[],
      active:{
        hp:210,damage:0,printing:'Latias ex SSP',
        printed:{stage:refs.stageBasic,types:[types.PSYCHIC]},
        attacks:[{
          name:'Eon Blade',
          cost:[types.PSYCHIC,types.PSYCHIC,types.COLORLESS],
          damage:200,gxAttack:false
        }],
        energies:[
          'Psychic Energy SVE',
          'Psychic Energy SVE',
          'Psychic Energy SVE'
        ]
      },
      prizeCount:6
    },
    ownTurnResources:{stadiumPlayLocked:false,stadiumPlayedTurn:0}
  };
}

test('Dimension Valley funds Tapu Lele Energy Drive from one Psychic Energy',()=>{
  assert.equal(VERSION,'agent7-owner-funded-attack-stadium-paper-preflight-v2');
  assert.equal(MIN_DAMAGE,80);
  const view=energyDriveView();
  const proposal=chooseFundedStadiumAttack(view,refs);
  assert.ok(proposal);
  assert.equal(proposal.kind,'play-funded-stadium');
  assert.equal(proposal.printing,'Dimension Valley PHF');
  assert.equal(proposal.name,'Dimension Valley');
  assert.equal(proposal.originalStadium,null);
  assert.equal(proposal.attackName,'Energy Drive');
  assert.equal(proposal.baseDamage,80);
  assert.equal(proposal.damageModel,'energy-drive-20x-both-actives');
  assert.deepEqual(proposal.modeledOldCost,['C','C']);
  assert.deepEqual(proposal.modeledNewCost,['C']);
  assert.equal(proposal.availableModeledEnergyUnits,1);
  assert.equal(proposal.printedPotentialKnockout,false);
});

test('Energy Drive estimate uses both public Active Energy counts only',()=>{
  const view=energyDriveView();
  const attack=view.ownPublic.active.attacks[0];
  assert.equal(estimatedAttackDamage(
    attack,view.ownPublic.active,view.opponentPublic.active),80);
  assert.equal(estimatedAttackDamage(
    attack,view.ownPublic.active,{energies:[]}),20);
  assert.equal(estimatedAttackDamage(
    attack,view.ownPublic.active,{}),null);
  assert.equal(estimatedAttackDamage(
    {name:'Unknown dynamic attack',damage:0},
    view.ownPublic.active,view.opponentPublic.active),0);
});

test('Dimension Valley cannot fund the same line without Psychic typing or Energy',()=>{
  const nonPsychic=energyDriveView();
  nonPsychic.ownPublic.active.printed.types=[types.LIGHTNING];
  nonPsychic.ownPublic.active.energies=['Lightning Energy SVE'];
  assert.equal(chooseFundedStadiumAttack(nonPsychic,refs),null);

  const noEnergy=energyDriveView();
  noEnergy.ownPublic.active.energies=[];
  assert.equal(chooseFundedStadiumAttack(noEnergy,refs),null);
});

test('an existing Dimension Valley means the attack is already payable, so no replacement is proposed',()=>{
  const view=energyDriveView();
  view.ownPublic.stadium=['Dimension Valley PHF'];
  view.ownHand=['Thunder Mountain Prism Star LOT'];
  assert.equal(chooseFundedStadiumAttack(view,refs),null);
});

test('Dimension Valley cost modifier removes one Colorless only for Psychic Pokémon',()=>{
  assert.deepEqual(costUnderStadium(
    [types.COLORLESS,types.COLORLESS],
    [types.PSYCHIC],'Dimension Valley',types
  ),[types.COLORLESS]);
  assert.deepEqual(costUnderStadium(
    [types.COLORLESS,types.COLORLESS],
    [types.LIGHTNING],'Dimension Valley',types
  ),[types.COLORLESS,types.COLORLESS]);
});


test('Dimension Valley does not newly enable Eon Blade on the source root with three Psychic Energy',()=>{
  const view=energyDriveView();
  const result=opponentStadiumAttackEntitlement(
    view,null,'Dimension Valley',refs);
  assert.equal(result.status,'public-printed-attack-costs-compared');
  assert.deepEqual(result.newlyPayable,[]);
  const eonBlade=result.unchanged.find(attack=>attack.attackName==='Eon Blade');
  assert.ok(eonBlade);
  assert.equal(eonBlade.beforePayable,true);
  assert.equal(eonBlade.afterPayable,true);
  assert.deepEqual(eonBlade.beforeSymbols,['P','P','C']);
  assert.deepEqual(eonBlade.afterSymbols,['P','P']);
});

test('Dimension Valley can newly enable opponent Eon Blade with only two Psychic Energy',()=>{
  const view=energyDriveView();
  view.opponentPublic.active.energies=
    view.opponentPublic.active.energies.slice(0,2);
  const result=opponentStadiumAttackEntitlement(
    view,null,'Dimension Valley',refs);
  assert.deepEqual(result.newlyPayable.map(attack=>attack.attackName),['Eon Blade']);
  assert.equal(result.rows[0].beforePayable,false);
  assert.equal(result.rows[0].afterPayable,true);
});
