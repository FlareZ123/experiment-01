'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseFlexiblePaidRetreatToFundedBench:choose}=
  require('../simulation/twinleaf/agent10-flexible-paid-retreat-frontier.cjs');
const catalog={
  stages:{BASIC:0,STAGE_1:1},
  basicEnergyTypes:{Grass:1,Lightning:4,Darkness:7,Psychic:5,Fairy:8},
  colorlessEnergyType:9,
  specialEnergies:new Set(['Prism Energy ASC','Telepath [P] Energy M3',
    'Double Colorless Energy EVO','Double Dragon Energy ROS']),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set(['Rayquaza V EVS'])
};
function sample(){
  return {
    decisionKind:'owner-root',globalTurn:42,ownHand:[],
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{
      prizeCount:5,stadium:[],publicTurnRestrictions:{},
      active:{printing:'Electrode-GX CES',
        printed:{stage:1,types:[4],retreatCost:[9]},
        energies:['Prism Energy ASC','Darkness Energy MEE'],
        attacks:[{name:'Electro Ball',damage:50,cost:[4,9]}],
        publicRestrictions:{},specialConditions:[]},
      bench:[{printing:'Mega Absol ex M1L',
        printed:{stage:0,types:[7],retreatCost:[9,9]},
        energies:['Telepath [P] Energy M3','Prism Energy ASC',
          'Prism Energy ASC'],
        attacks:[{name:'Claw of Darkness',cost:[7,7,9],damage:200}],
        publicRestrictions:{},specialConditions:[]}]
    },
    opponentPublic:{prizeCount:4,stadium:[]}
  };
}
test('original rank9 Special-funded Mega Absol public Bench line',()=>{
  const p=choose(sample(),catalog);
  assert.equal(p?.kind,'paid-retreat');
  assert.equal(p?.benchIndex,0);
  assert.equal(p?.projectedPrintedDamage,200);
  assert.equal(p?.realNativePaymentVerified,false);
});
test('two special units cannot pay two Darkness plus one Colorless',()=>{
  const v=sample();
  v.ownPublic.bench[0].energies=['Prism Energy ASC',
    'Telepath [P] Energy M3'];
  assert.equal(choose(v,catalog),null);
});
test('Temporal Sinnoh suppression makes Prism unable to pay Darkness',()=>{
  const v=sample();v.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choose(v,catalog),null);
});
test('funded Active 200-damage attack takes precedence',()=>{
  const v=sample();
  v.ownPublic.active.attacks=[{name:'Big Hit',damage:200,cost:[9]}];
  assert.equal(choose(v,catalog),null);
});
test('single Double Colorless attached to Active can pay one Retreat',()=>{
  const v=sample();
  v.ownPublic.active.energies=['Double Colorless Energy EVO'];
  assert.equal(choose(v,catalog)?.kind,'paid-retreat');
});
test('unknown attached Special Energy fails closed',()=>{
  const v=sample();
  v.ownPublic.active.energies=['Unknown Energy NEW'];
  assert.equal(choose(v,catalog),null);
});
test('normal Retreat cap, attack lock, paralysis all veto',()=>{
  const a=sample();a.ownTurnResources.retreatedTurn=42;
  assert.equal(choose(a,catalog),null);
  const b=sample();b.ownPublic.active.specialConditions=[2];
  assert.equal(choose(b,catalog),null);
  const c=sample();c.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(choose(c,catalog),null);
});
test('unsupported recipient attack, GX and printed insufficient damage veto',()=>{
  const a=sample();a.ownPublic.bench[0].attacks=[{
    name:'Tiny',damage:40,cost:[7,7,9]}];
  assert.equal(choose(a,catalog),null);
  const b=sample();b.ownPublic.bench[0].attacks=[{
    name:'Claw of Darkness',damage:200,cost:[7,7,9],gxAttack:true}];
  assert.equal(choose(b,catalog),null);
});
