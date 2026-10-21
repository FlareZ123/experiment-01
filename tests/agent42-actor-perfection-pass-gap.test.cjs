'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {ownerVisibleCopyOptions}=
  require('../simulation/twinleaf/owner-visible-perfection-pass-bridge.cjs');

/**
 * The compiled source-dealt rank11 turn50 owner-visible situation is recorded
 * in results/aichi-2026/rank11-turn50-newmoon-owner-visible-pass-audit.md.
 * This minimal owner observation preserves its relevant public features.
 * It is a policy-decision contract, not a replay of the original native game.
 */
function archivedPublicRoot(){
  return {
    decisionKind:'owner-root',globalTurn:50,
    ownHand:[
      'Battle Compressor PHF','Canceling Cologne ASR',
      'Ace Trainer AOR','Path to the Peak CRE','Fog Crystal CRE'
    ],
    ownTurnResources:{
      pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
      energyPlayLocked:false,energyPlayedTurn:50,
      supporterPlayedTurn:50,stadiumPlayedTurn:50
    },
    ownPublic:{
      active:{
        printing:'Mewtwo & Mew-GX UNM',name:'Mewtwo & Mew-GX',
        damage:200,energies:[
          'Telepathic Psychic Energy MEG','Telepathic Psychic Energy MEG'
        ],
        attacks:[{name:'Miracle Twin-GX',gxAttack:true,
          cost:[7,7,7]}],
        publicRestrictions:{
          cannotAttackNextTurn:false,
          blockedAttackNameNextTurn:null,
          blockedAttackNameUntilLeavesActive:null,
          cannotUseAttacksNextTurn:[],
          onlyAllowedAttackNameNextTurn:null
        },
        specialConditions:[]
      },
      bench:[{
        printing:'Gengar & Mimikyu-GX TEU',
        name:'Gengar & Mimikyu-GX',energies:[
          'Psychic Energy MEE','Psychic Energy MEE'
        ],
        attacks:[{
          name:'Poltergeist',gxAttack:false,cost:[7,7]
        },{
          name:'Horror House-GX',gxAttack:true,cost:[7]
        }]
      },null,null,null,null,null,null],
      stadium:['Sky Field ROS'],publicTurnRestrictions:{
        gxUsed:false,attackLockTurnsRemaining:0,
        cannotUseGXAttacks:false
      }
    },
    opponentPublic:{
      active:{name:'Mega Absol ex',hp:280,damage:0},
      stadium:[],bench:[]
    }
  };
}
const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  basicEnergyTypes:{Lightning:4,Psychic:7},
  colorlessEnergyType:0,
  specialConditions:{ASLEEP:1,PARALYZED:2}
};

test('current generic actor root passes despite own public Perfection donor',()=>{
  const input=archivedPublicRoot();
  const intent=chooseActorRootIntent(input,catalog);
  assert.deepEqual(intent,{
    kind:'pass',reason:'no-supported-owner-visible-root'
  });
  assert.deepEqual(chooseActorRootIntent(input,catalog,{
    printedGxRoot:true
  }),intent);
});

test('same public donor provides a GX and non-GX Perfection option independently',()=>{
  const donor={
    fullName:'Gengar & Mimikyu-GX TEU'
  };
  const owner={
    active:{getPokemonCard:()=>({
      fullName:'Mewtwo & Mew-GX UNM'
    })},
    bench:[{getPokemonCard:()=>donor}],
    discard:{cards:[]},
    usedGX:false
  };
  const available=ownerVisibleCopyOptions(owner);
  assert.deepEqual(available,[
    {source:'Gengar & Mimikyu-GX TEU',attack:'Horror House-GX'},
    {source:'Gengar & Mimikyu-GX TEU',attack:'Poltergeist'}
  ]);
  owner.usedGX=true;
  assert.deepEqual(ownerVisibleCopyOptions(owner),[
    {source:'Gengar & Mimikyu-GX TEU',attack:'Poltergeist'}
  ]);
  assert.deepEqual(chooseActorRootIntent(archivedPublicRoot(),catalog),{
    kind:'pass',reason:'no-supported-owner-visible-root'
  });
});
