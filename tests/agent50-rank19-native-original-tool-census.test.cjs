'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {publicOwnerBoard,sourcePublicAttackInventory}=require(
  '../simulation/twinleaf/agent28-rank19-native-source-root-readonly.cjs');

/**
 * Native PokemonCardList.tools is an array of Tool objects, while its
 * energies are under .energies.cards. The old observer incorrectly used
 * .tools.cards, silently manufacturing zero attached-Tool observations.
 */
test('rank19 original source census observes actual native Tool array',()=>{
  const card=fullName=>({fullName});
  const slot=(name,energies=[],tools=[])=>({
    getPokemonCard:()=>name?card(name):null,
    energies:{cards:energies.map(card)},
    tools:tools.map(card)
  });
  const owner={
    active:slot('Ho-Oh EX DRX',[],['Float Stone BKT']),
    bench:[slot('Raging Bolt ex TEF',['Double Dragon Energy ROS'])]
  };
  const view=publicOwnerBoard(owner);
  assert.equal(view.activePrinting,'Ho-Oh EX DRX');
  assert.deepEqual(view.activeTools,['Float Stone BKT']);
  assert.deepEqual(view.activeEnergy,[]);
  assert.deepEqual(view.bench[0].attachedEnergy,
    ['Double Dragon Energy ROS']);
});
test('empty tool array is represented as empty list',()=>{
  const owner={
    active:{getPokemonCard:()=>({fullName:'Ho-Oh EX DRX'}),
      energies:{cards:[]},tools:[]},
    bench:[]
  };
  assert.deepEqual(publicOwnerBoard(owner).activeTools,[]);
});

test('promoted public attack inventory preserves original Basic and Special energy distinctions',()=>{
  const attack=(name,cost)=>({name,cost,damage:0,
    damageCalculation:null,gxAttack:false});
  const view={
    ownPublic:{
      active:{printing:'Arceus & Dialga & Palkia GX CEC',energies:[
        'Double Dragon Energy ROS','Double Dragon Energy ROS'
      ],damage:0,attacks:[attack('Ultimate Ray',['W','M','C'])]},
      bench:[
        {printing:'Raging Bolt ex TEF',energies:[
          'Double Dragon Energy ROS','Lightning Energy MEE'
        ],damage:0,attacks:[
          attack('Bellowing Thunder',['F','L'])]
        },
        {printing:'Ho-Oh EX DRX',energies:[],damage:0,attacks:[]},
        null
      ]
    }
  };
  const audit=sourcePublicAttackInventory(view);
  assert.equal(audit.totalSourceAttachedBasicEnergyCards,1);
  assert.equal(audit.candidates.length,3);
  assert.equal(audit.candidates[0].active,true);
  assert.equal(audit.candidates[1].active,false);
  assert.deepEqual(audit.candidates[0].attacks[0].cost,['W','M','C']);
  assert.deepEqual(audit.candidates[1].energies,[
    'Double Dragon Energy ROS','Lightning Energy MEE']);
  assert.equal(audit.candidates[1].attacks[0].name,'Bellowing Thunder');
});
