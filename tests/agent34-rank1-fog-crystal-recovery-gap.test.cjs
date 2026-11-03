'use strict';

/**
 * ISOLATED INNER ROOT UNIT ONLY: full canonical actor composition installs
 * Agent9's genuine Fog Crystal Item/search wrapper ahead of this helper.
 * A Pass result here is expected delegation, not a live missed Item action.
 * Original rank1 held-out archives have 127/125 genuine accepted Fog roots.
 */
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

test('isolated inner root delegates held Fog Crystal to canonical outer Fog adapter',()=>{
  const v=position();
  const choice=chooseActorRootIntent(v,catalog,{
    underworldDoorRoot:true,
    underworldMarkerReceipt:{activeUnspent:false,
      benchUnspent:[true,false,false,false,false]}
  });
  assert.deepEqual(choice,{
    kind:'pass',reason:'no-supported-owner-visible-root'
  },'Inner helper has no Fog branch because canonical wrapper owns this Item');
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

test('inner helper does not inspect opponent hidden zones on delegated Fog state',()=>{
  const v=position();
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(v.opponentPublic,key,{get(){
      throw Error('Opponent concealed zone accessed');
    }});
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
});
