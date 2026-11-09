'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../../simulation/twinleaf/agent5-owner-root-slice.cjs');
const {publicSkylinerSuppressionReason}=
  require('../../simulation/twinleaf/agent6-skyliner-ability-suppression-guard.cjs');

const ROOT=path.resolve(__dirname,'../..');

/** A source-independent, detached owner-only reproduction of the rank5 board. */
function publicView(opponentActive={printing:'Genesect V FST',abilities:[]}){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:13,
    ownHand:[],
    ownTurnResources:{retreatedTurn:0,pokemonPlayLocked:false},
    ownPublic:{
      active:{
        printing:'Mimikyu GRI',
        printed:{stage:1,retreatCost:[9]},
        energies:['Psychic Energy MEE'],
        attacks:[
          {name:'Filch',damage:0,cost:[9]},
          {name:'Copycat',damage:null,cost:[5,9]}
        ],
        publicRestrictions:{},specialConditions:[]
      },
      bench:[
        {
          printing:'Latias ex SSP',
          abilities:['Skyliner'],energies:[],attacks:[],
          publicRestrictions:{},specialConditions:[]
        },
        {
          printing:'Trevenant & Dusknoir-GX SMP',
          abilities:[],
          energies:['Psychic Energy MEE','Psychic Energy MEE',
            'Psychic Energy MEE'],
          attacks:[{name:'Night Watch',damage:150,cost:[5,5,5],
            damageCalculation:null,gxAttack:false}],
          publicRestrictions:{},specialConditions:[]
        }
      ],
      publicTurnRestrictions:{}
    },
    opponentPublic:{active:opponentActive,bench:[],stadium:[]}
  };
}

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  stages:{BASIC:1},basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:3,PARALYZED:4}
};

test('opt-in shared actor selects genuine free Skyliner pivot to three-Psychic Night Watch',()=>{
  const view=publicView();
  assert.equal(publicSkylinerSuppressionReason(view),null);
  const choice=chooseActorRootIntent(view,catalog,{
    skylinerFundedBenchRetreatRoot:true
  });
  assert.equal(choice.kind,'skyliner-free-retreat');
  assert.equal(choice.benchIndex,1);
  assert.equal(choice.attackName,'Night Watch');
  assert.equal(choice.baseDamage,150);
  assert.equal(choice.printing,'Trevenant & Dusknoir-GX SMP');
  assert.equal(choice.calculatedNativeRetreatCost,null);
});

test('known opponent Iron Thorns suppression blocks the new opt-in even if Latias is printed on Bench',()=>{
  const view=publicView({
    printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
    abilities:['Initialization']
  });
  assert.equal(publicSkylinerSuppressionReason(view),
    'opponent-active-iron-thorns-initialization');
  const choice=chooseActorRootIntent(view,catalog,{
    skylinerFundedBenchRetreatRoot:true
  });
  assert.notEqual(choice.kind,'skyliner-free-retreat');
});

test('Store physical witness recognizes Skyliner free retreat and conserves Energy',()=>{
  const intent={kind:'skyliner-free-retreat',benchIndex:2,
    printing:'Shadow Rider Calyrex VMAX CRE'};
  const before={turn:22,publicSkylinerPresent:true,
    activePokemonPrinting:'Tapu Lele-GX GRI',
    targetPokemonPrinting:intent.printing,
    activeEnergies:['Psychic Energy MEE']};
  const after={activePokemonPrinting:intent.printing,
    targetPokemonPrinting:before.activePokemonPrinting,
    targetEnergies:['Psychic Energy MEE'],retreatedTurn:22};
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,
    {...after,targetEnergies:[]},{}),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,
    {...before,publicSkylinerPresent:false},after,{}),
    'no-confirmed-public-effect');
});

test('native decision plumbing is default-off and candidate/source symmetric',()=>{
  const root=fs.readFileSync(path.join(ROOT,
    'simulation/twinleaf/agent34-actor-only-root-policy.cjs'),'utf8');
  const runner=fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/agent41-bilateral-v2-development.cjs'),'utf8');
  assert.match(root,/if\(options\.skylinerFundedBenchRetreatRoot===true&&/);
  assert.match(root,/publicSkylinerSuppressionReason\(view\)===null/);
  assert.match(root,/case 'skyliner-free-retreat':/);
  assert.match(root,/skylinerFundedBenchRetreatRootOptIn:deps\.skylinerFundedBenchRetreatRoot===true/);
  assert.match(runner,/actorSkylinerFundedBenchRetreatRoot=false/);
  assert.match(runner,/skylinerFundedBenchRetreatRoot:true/);
});
