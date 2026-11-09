'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseUnderworldDoorRoot}=
  require('../../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');

const PSYCHIC=5;
const catalog={
  basicEnergyTypes:{Psychic:PSYCHIC},
  basicEnergies:new Set(['Psychic Energy SVE'])
};
const marker={activeUnspent:true,benchUnspent:[false]};
const vmax={
  printing:'Shadow Rider Calyrex VMAX CRE',
  name:'Shadow Rider Calyrex VMAX',
  abilities:['Underworld Door'],
  printed:{types:[PSYCHIC]}
};
const recipient={
  printing:'Mew UNB',name:'Mew',
  abilities:[],printed:{types:[PSYCHIC]}
};

/** @param {0|1} seat @param {string[]} ownStadium @param {string[]} opposingStadium */
function ownerView(seat,ownStadium=[],opposingStadium=[]){
  return {
    decisionKind:'owner-root',actorSeat:seat,
    ownHand:['Psychic Energy SVE'],
    ownPublic:{
      active:vmax,bench:[recipient],stadium:ownStadium,discard:[]
    },
    opponentPublic:{
      active:{
        printing:'Snorlax PGO',name:'Snorlax',
        abilities:['Block'],printed:{types:[PSYCHIC]}
      },
      bench:[],stadium:opposingStadium,discard:[]
    }
  };
}

for(const seat of [0,1]){
  test('live Path in either public Stadium zone vetoes Underworld Door seat '+seat,()=>{
    for(const [own,opponent] of [
      [['Path to the Peak CRE'],[]],
      [[],['Path to the Peak CRE']],
      [['Path to the Peak ASR'],[]],
      [[],['Path to the Peak']]
    ]){
      const view=ownerView(seat,own,opponent);
      assert.equal(chooseUnderworldDoorRoot(view,catalog,marker),null);
    }
  });

  test('held or discarded Path is not a live Stadium lock seat '+seat,()=>{
    const view=ownerView(seat);
    view.ownHand.push('Path to the Peak CRE');
    view.opponentPublic.discard.push('Path to the Peak CRE');
    assert.equal(chooseUnderworldDoorRoot(view,catalog,marker)?.kind,
      'use-underworld-door');
    view.ownPublic.stadium=['Tropical Beach PR-BLW'];
    assert.equal(chooseUnderworldDoorRoot(view,catalog,marker)?.kind,
      'use-underworld-door');
  });
}

test('an unspent marker and Psychic Energy remain required when Path is absent',()=>{
  const view=ownerView(0);
  assert.equal(chooseUnderworldDoorRoot(view,catalog),null);
  view.ownHand=[];
  assert.equal(chooseUnderworldDoorRoot(view,catalog,marker),null);
});
