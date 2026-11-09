'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseUnderworldDoorRoot}=
  require('../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');

const PSYCHIC=4;
const catalog={
  basicEnergyTypes:{Psychic:PSYCHIC},
  basicEnergies:new Set(['Psychic Energy SVE'])
};
const source={
  name:'Shadow Rider Calyrex VMAX',
  printing:'Shadow Rider Calyrex VMAX CRE',
  abilities:['Underworld Door'],
  tools:[],
  printed:{types:[PSYCHIC]}
};
const target={
  name:'Mew',
  printing:'Mew UNB',
  abilities:[],
  printed:{types:[PSYCHIC]},
  tools:[]
};

function view(active){
  return {
    decisionKind:'owner-root',
    ownHand:['Psychic Energy SVE'],
    ownPublic:{active:source,bench:[target]},
    opponentPublic:{active}
  };
}
const markers={activeUnspent:true,benchUnspent:[false]};

test('visible Iron Thorns Initialization prevents an illegal VMAX Underworld Door action',()=>{
  assert.equal(chooseUnderworldDoorRoot(view({
    name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
    abilities:['Initialization'],tools:[]
  }),catalog,markers),null);
});

test('unlocked opponent still permits the owner-visible funded Underworld Door',()=>{
  const proposal=chooseUnderworldDoorRoot(view({
    name:'Snorlax',printing:'Snorlax PGO',
    abilities:['Block'],tools:[]
  }),catalog,markers);
  assert.equal(proposal?.kind,'use-underworld-door');
  assert.equal(proposal?.sourcePrinting,'Shadow Rider Calyrex VMAX CRE');
  assert.equal(proposal?.position,'active');
});

test('the active check is exact: a benched Iron Thorns does not cause a false lock',()=>{
  const o=view({
    name:'Snorlax',printing:'Snorlax PGO',
    abilities:['Block'],tools:[]
  });
  o.opponentPublic.bench=[{
    name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
    abilities:['Initialization'],tools:[]
  }];
  assert.equal(chooseUnderworldDoorRoot(o,catalog,markers)?.kind,
    'use-underworld-door');
});
