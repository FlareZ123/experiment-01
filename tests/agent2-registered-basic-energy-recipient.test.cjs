'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compareRegisteredBasicEnergyRecipient}=
  require('../simulation/twinleaf/agent2-registered-basic-energy-recipient.cjs');

const DARK=7,PSYCHIC=5,COLORLESS=9,ENERGY='Darkness Energy MEE';
const catalog={
  basicEnergies:new Set([ENERGY]),
  basicEnergyTypes:{Darkness:DARK,Psychic:PSYCHIC},
  colorlessEnergyType:COLORLESS,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
/** Simulated owner registered sixty, no opponent hidden information. */
const sixty=()=>[...Array(52).fill('Other Trainer MEE'),
  ...Array(8).fill(ENERGY)];
const pokemon=(name,cost,energies=[])=>({
  printing:name,printed:{types:[DARK]},
  attacks:[{name:'Damage',cost,damage:20,text:'',
    damageCalculation:null,gxAttack:false}],
  energies,specialConditions:[],publicRestrictions:{}
});
const view=()=>({
  decisionKind:'owner-root',globalTurn:4,
  ownHand:[ENERGY],ownTurnResources:{
    energyPlayLocked:false,energyPlayedTurn:0,
    supporterPlayedTurn:0,supporterPlayLocked:false,
    itemPlayLocked:false
  },
  ownPublic:{
    active:pokemon('Active Mega Absol ex M1L',[DARK],[ENERGY]),
    bench:[pokemon('Garbodor BKP',[PSYCHIC,COLORLESS,COLORLESS,
      COLORLESS],[ENERGY]),null,null,null,null],
    publicTurnRestrictions:{},
    stadium:[]
  },
  opponentPublic:{bench:[],stadium:[]}
});

test('known all-Darkness original 60 vetoes unreachable Garbodor Psychic scorer',()=>{
  const actual=compareRegisteredBasicEnergyRecipient(view(),catalog,sixty());
  assert.equal(actual.status,'registered-basic-only-printed-cost-upper-bound');
  assert.equal(actual.ordinary?.slot,'bench');
  assert.equal(actual.ordinary?.index,0);
  assert.equal(actual.adjusted,null);
  assert.equal(actual.changed,true);
  assert.equal(actual.exclusions.length,1);
  assert.equal(actual.exclusions[0].slot,'bench');
  assert.equal(actual.exclusions[0].attacks[0].name,'Damage');
  assert.equal(actual.gameDecisionCertifiable,false);
});

test('unsupported registered Special or unknown attached Energy fail closed',()=>{
  const mixed=sixty();
  mixed[59]='Double Colorless Energy SUM';
  const r=compareRegisteredBasicEnergyRecipient(view(),catalog,mixed);
  assert.equal(r.status,'registered-basic-energy-supply-unknown');
  assert.equal(r.adjusted,null);
  const v=view();
  v.ownPublic.active.energies=['Double Colorless Energy SUM'];
  const unsupported=compareRegisteredBasicEnergyRecipient(v,catalog,sixty());
  assert.equal(unsupported.status,'non-basic-attached-energy-unknown');
  assert.equal(unsupported.adjusted,null);
});

test('payable ordinary Basic-only routes survive source type filter',()=>{
  const v=view();
  v.ownPublic.bench[0]=pokemon('Oranguru V ASR',
    [COLORLESS,COLORLESS,COLORLESS],[ENERGY]);
  const result=compareRegisteredBasicEnergyRecipient(v,catalog,sixty());
  assert.equal(result.ordinary?.slot,'bench');
  assert.equal(result.adjusted?.slot,'bench');
  assert.equal(result.adjusted?.index,0);
  assert.equal(result.exclusions.length,0);
  assert.equal(result.changed,false);
});
