'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const PSY='Psychic Energy MEE';
const FOG='Fog Crystal CRE';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([PSY]),basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** Owner-only staged situation; deck card identities never exposed. */
function position(hand=[FOG]){
  return {
    decisionKind:'owner-root',globalTurn:12,ownHand:hand,
    ownPublic:{
      active:{
        printing:VMAX,name:'Shadow Rider Calyrex VMAX',
        energies:[PSY,PSY],
        specialConditions:[],publicRestrictions:{},
        printed:{types:[5],retreatCost:[9,9]},
        attacks:[{name:'Max Geist',cost:[9,9,9],gxAttack:false}]
      },
      bench:[{
        printing:VMAX,name:'Shadow Rider Calyrex VMAX',
        energies:[],abilities:['Underworld Door'],
        printed:{types:[5],retreatCost:[9,9]},
        attacks:[{name:'Max Geist',cost:[9,9,9],gxAttack:false}],
        specialConditions:[],publicRestrictions:{}
      },null,null,null,null],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    ownTurnResources:{
      energyPlayedTurn:0,energyPlayLocked:false,pokemonPlayLocked:false,
      supporterPlayedTurn:0,supporterPlayLocked:false,
      itemPlayLocked:false,retreatedTurn:0
    },
    opponentPublic:{stadium:[],bench:[null,null,null,null,null]}
  };
}

test('current owner-only source root cannot offer held Fog Crystal toward missing Psychic',()=>{
  const v=position();
  const choice=chooseActorRootIntent(v,catalog,{
    underworldDoorRoot:true,
    underworldMarkerReceipt:{activeUnspent:false,
      benchUnspent:[true,false,false,false,false]}
  });
  assert.deepEqual(choice,{
    kind:'pass',reason:'no-supported-owner-visible-root'
  },'This is a missing policy channel, not a declaration that Fog Crystal is paper-illegal');
});

test('same public Active is one legal Basic Psychic attachment from Max Geist',()=>{
  const v=position([PSY]);
  const proposal=chooseActorRootIntent(v,catalog,{
    underworldDoorRoot:true,
    underworldMarkerReceipt:{activeUnspent:false,
      benchUnspent:[false,false,false,false,false]}
  });
  assert.equal(proposal.kind,'attach-basic-energy');
  assert.equal(proposal.printing,PSY);
  assert.equal(proposal.handIndex,0);
});

test('no opponent concealed zones needed to establish the missing owner action',()=>{
  const v=position();
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(v.opponentPublic,key,{get(){
      throw Error('Opponent concealed zone accessed');
    }});
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
});
