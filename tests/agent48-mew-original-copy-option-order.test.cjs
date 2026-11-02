'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseNaturalEvolutionIntent}=
  require('../simulation/twinleaf/agent1-actor-evolution-frontier.cjs');
const {chooseActorCopiedAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/** @returns {object} Owner-only fictional situation, never a native game. */
function ownerEvolutionView(globalTurn=3,playedTurn=1){
  return {
    decisionKind:'owner-root',globalTurn,
    ownTurnResources:{pokemonPlayLocked:false,evolutionPlayLocked:false,
      abilityPokemonPlayLocked:false},
    ownHand:['Mew VMAX FST','Double Colorless Energy SUM'],
    ownPublic:{
      active:{printing:'Mew V FST',name:'Mew V',
        printed:{stage:0},lastPlayedOrEvolvedTurn:playedTurn,
        publicRestrictions:{cannotEvolveNextTurn:false}},
      bench:[{printing:'Genesect V FST',name:'Genesect V',
        printed:{stage:0},lastPlayedOrEvolvedTurn:playedTurn,
        publicRestrictions:{}},null,null,null,null]
    }
  };
}

function evolutionCatalog(){
  return {
    evolutions:new Map([['Mew VMAX FST',
      {stage:3,evolvesFrom:'Mew V',hasAbility:false}]]),
    stages:{BASIC:0,RESTORED:10,STAGE_1:1,STAGE_2:2,VMAX:3,VSTAR:4}
  };
}

/** @param {object[]} offered Native-style printed option array. */
function copyInput(offered){
  return {actor:{decisionKind:'owner-prompt',
    ownPublic:{publicTurnRestrictions:{gxUsed:false,
      cannotUseGXAttacks:false}}},
  prompt:{kind:'ChooseAttackPrompt',allowCancel:false,offered}};
}

function source(index,printing,name,damage){
  return {index,printing,attacks:[{index:0,name,
    blocked:false,gxAttack:false,damage}]};
}

test('natural evolution yields eligible original Mew VMAX owner root',()=>{
  assert.deepEqual(
    chooseNaturalEvolutionIntent(ownerEvolutionView(),evolutionCatalog()),
    {kind:'evolve-pokemon',handIndex:0,printing:'Mew VMAX FST',
      slot:'active',index:0,from:'Mew V FST'});
});

test('natural evolution rejects a newly played Mew V and first-turn evolution',()=>{
  assert.equal(chooseNaturalEvolutionIntent(
    ownerEvolutionView(3,3),evolutionCatalog()),null);
  assert.equal(chooseNaturalEvolutionIntent(
    ownerEvolutionView(2,1),evolutionCatalog()),null);
});

test('default copied attack first-choice varies with offered Bench order',()=>{
  const mew=source(0,'Mew V FST','Energy Mix',0);
  const gene=source(1,'Genesect V FST','Techno Blast',210);
  const mewFirst=copyInput([mew,gene]);
  const geneFirst=copyInput([{...gene,index:0},{...mew,index:1}]);
  const a=chooseActorCopiedAttack(mewFirst);
  const b=chooseActorCopiedAttack(geneFirst);
  assert.deepEqual(a,{sourceIndex:0,attackIndex:0});
  assert.deepEqual(b,{sourceIndex:0,attackIndex:0});
  assert.equal(mewFirst.prompt.offered[a.sourceIndex].attacks[a.attackIndex].name,
    'Energy Mix');
  assert.equal(geneFirst.prompt.offered[b.sourceIndex].attacks[b.attackIndex].name,
    'Techno Blast');
});
