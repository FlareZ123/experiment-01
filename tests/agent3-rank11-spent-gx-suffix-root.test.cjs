'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @param {boolean} spent @param {boolean} blocked @param {boolean|undefined} gxFlag */
function ownerView(spent=false,blocked=false,gxFlag=undefined){
  const attack={name:'Miraculous Duo-GX',cost:[5,9],damage:200};
  if(gxFlag!==undefined)attack.gxAttack=gxFlag;
  return {
    decisionKind:'owner-root',globalTurn:3,ownHand:[],
    ownPublic:{
      active:{
        name:'Mewtwo & Mew-GX',
        energies:['Psychic Energy MEE','Psychic Energy MEE'],
        printed:{types:[5]},attacks:[attack],
        specialConditions:[],publicRestrictions:{}
      },
      bench:[null,null,null,null,null],
      stadium:[],
      publicTurnRestrictions:{
        gxUsed:spent,cannotUseGXAttacks:blocked,attackLockTurnsRemaining:0
      }
    },
    opponentPublic:{stadium:[]},
    ownTurnResources:{
      energyPlayedTurn:3,energyPlayLocked:false,
      pokemonPlayLocked:false,specialEnergyPlayLocked:false
    }
  };
}

test('unflagged printed GX suffix remains payable on an unspent historical owner turn',()=>{
  for(const flag of [undefined,false]){
    assert.deepEqual(chooseActorRootIntent(ownerView(false,false,flag),catalog),{
      kind:'attack',attackName:'Miraculous Duo-GX'
    });
  }
});

test('spent GX vetoes native-name GX even when attack.gxAttack is absent or false',()=>{
  for(const flag of [undefined,false]){
    assert.equal(chooseActorRootIntent(ownerView(true,false,flag),catalog).kind,'pass');
  }
});

test('explicit GX prohibition vetoes name-only GX before the allowance is spent',()=>{
  assert.equal(chooseActorRootIntent(ownerView(false,true,false),catalog).kind,'pass');
});

test('previous metadata-flag gating remains unchanged',()=>{
  assert.equal(chooseActorRootIntent(ownerView(false,false,true),catalog).kind,'pass');
  assert.deepEqual(
    chooseActorRootIntent(ownerView(false,false,true),catalog,{printedGxRoot:true}),
    {kind:'attack',attackName:'Miraculous Duo-GX'}
  );
});
