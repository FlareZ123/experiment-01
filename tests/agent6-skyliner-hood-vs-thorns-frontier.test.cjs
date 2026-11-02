'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,publicHoodAwareSkylinerSuppressionReason,
  choosePublicHoodAwareSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-skyliner-hood-vs-thorns-frontier.cjs');
const {choosePublicLockGuardedSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-skyliner-ability-suppression-guard.cjs');

const catalog={
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:11,PARALYZED:12}
};
function fixture(){
  const pidgey=()=>({printing:'Pidgey MEW',abilities:[],tools:[]});
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{printing:'Latias ex SSP',abilities:['Skyliner'],
        tools:['Stealthy Hood UNB'],energies:[],attacks:[],
        specialConditions:[],publicRestrictions:{}},
      bench:[{
        printing:"Lillie's Clefairy ex JTG",
        energies:['Psychic Energy MEE','Psychic Energy MEE'],
        attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
        specialConditions:[],publicRestrictions:{}
      },pidgey(),pidgey(),pidgey(),pidgey()]
    },
    opponentPublic:{
      stadium:[],active:{printing:'Iron Thorns ex TWM',
        abilities:['Initialization'],hp:230,damage:20,tools:[]},
      bench:[pidgey(),pidgey(),pidgey(),pidgey(),pidgey()]
    }
  };
}
test('opt-in Hood restores exact nominal Rondo when only Active Thorns suppresses',()=>{
  const v=fixture();
  assert.match(VERSION,/hood/);
  assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(v,catalog),null);
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),null);
  assert.equal(choosePublicHoodAwareSkylinerRondoRetreat(v,catalog)
    ?.kind,'skyliner-rondo-retreat');
});
test('opponent Active Tool Jammer disables own Active Stealthy Hood',()=>{
  const v=fixture();
  v.opponentPublic.active.tools=['Tool Jammer BST'];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'opponent-active-tool-jammer-disables-stealthy-hood');
  assert.equal(choosePublicHoodAwareSkylinerRondoRetreat(v,catalog),null);
});
test('opponent Benched Tool Jammer does not silence own Active Hood',()=>{
  const v=fixture();
  v.opponentPublic.bench[0].tools=['Tool Jammer BST'];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),null);
  assert.equal(choosePublicHoodAwareSkylinerRondoRetreat(v,catalog)
    ?.kind,'skyliner-rondo-retreat');
});
test('Jamming Tower disables Hood and Path independently suppresses Skyliner',()=>{
  const v=fixture();
  v.opponentPublic.stadium=['Jamming Tower TWM'];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'jamming-tower-disables-stealthy-hood');
  v.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'path-to-peak-rule-box-ability-lock');
});
test('unverified other foe Ability and own Garbotoxin remain blocked',()=>{
  const v=fixture();
  v.opponentPublic.bench[0].abilities=['Power of Alchemy'];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'other-opponent-bench-ability-not-certified');
  v.opponentPublic.bench[0].abilities=[];
  v.ownPublic.bench[2].abilities=['Garbotoxin'];
  v.ownPublic.bench[2].tools=['Float Stone BKT'];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'tool-equipped-garbotoxin');
});
test('missing Hood and Hood on a different Active do not claim protection',()=>{
  const v=fixture();
  v.ownPublic.active.tools=[];
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'opponent-active-iron-thorns-initialization');
  v.ownPublic.active.tools=['Stealthy Hood UNB'];
  v.ownPublic.active.printing='Mimikyu GRI';
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),
    'opponent-active-iron-thorns-initialization');
});
test('frozen observation untouched, opponent hidden fields not accessed',()=>{
  const v=fixture(),before=JSON.stringify(v);
  const hidden=new Proxy({},{get(){throw Error('hidden access');}});
  v.opponentSecret=hidden;
  assert.equal(publicHoodAwareSkylinerSuppressionReason(v),null);
  assert.equal(JSON.stringify(v),before);
});
