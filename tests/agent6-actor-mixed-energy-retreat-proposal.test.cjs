'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,proposeMixedEnergyPaidRetreat}=
  require('../simulation/twinleaf/agent6-actor-mixed-energy-retreat-proposal.cjs');

function sample(){
  const catalog={
    basicEnergies:new Set(['Darkness Energy MEE']),
    basicEnergyTypes:{Darkness:7,Psychic:5,Lightning:4},
    colorlessEnergyType:10,
    stages:{BASIC:1,STAGE_1:2},
    specialEnergies:new Set(['Prism Energy ASC',
      'Telepath [P] Energy M3']),
    specialConditions:{ASLEEP:1,PARALYZED:2}
  };
  const active={
    printing:'Electrode-GX CES',
    printed:{retreatCost:[10],stage:2,types:[4]},
    energies:['Prism Energy ASC','Darkness Energy MEE'],
    tools:[],attacks:[{name:'Electro Ball',cost:[4,10],damage:50,
      gxAttack:false},{name:'Crash and Burn-GX',cost:[4,10],damage:30,
      gxAttack:true}],specialConditions:[],publicRestrictions:{}
  };
  const mega={
    printing:'Mega Absol ex M1L',
    printed:{stage:1,types:[7]},
    energies:['Telepath [P] Energy M3','Prism Energy ASC',
      'Prism Energy ASC'],
    attacks:[{name:'Claw of Darkness',cost:[7,7,10],
      damage:200,gxAttack:false}],
    publicRestrictions:{}
  };
  const view={
    decisionKind:'owner-root',globalTurn:42,
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{
      active,bench:[mega,null],
      stadium:[],prizeCount:4,
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{printing:'Basic Foe'},bench:[],
      stadium:[],prizeCount:4}
  };
  Object.defineProperty(view,'opponentHidden',{
    get(){throw Error('Hidden opponent access prohibited');}
  });
  return {catalog,view,active,mega};
}

test('proposes rank9-shaped mixed payment with explicit Basic discard',()=>{
  const {catalog,view}=sample();
  assert.match(VERSION,/agent6/);
  assert.deepEqual(proposeMixedEnergyPaidRetreat(view,catalog),{
    kind:'mixed-energy-paid-retreat-proposal',benchIndex:0,
    printing:'Mega Absol ex M1L',attackName:'Claw of Darkness',
    projectedPrintedDamage:200,retreatCostUnits:1,
    preferredDiscardPrinting:'Darkness Energy MEE',
    validation:'UNVERIFIED_NATIVE_PROMPT_AND_ATTACK'
  });
});

test('Stage-1 Electrode Prism is Colorless, while Basic Absol Prism pays Darkness',()=>{
  const {catalog,view}=sample();
  const {publicSpecialAttackPayable}=
    require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');
  assert.equal(publicSpecialAttackPayable(view,catalog,view.ownPublic.active,
    view.ownPublic.active.attacks[0]),false);
  assert.equal(publicSpecialAttackPayable(view,catalog,view.ownPublic.bench[0],
    view.ownPublic.bench[0].attacks[0]),true);
  assert.ok(proposeMixedEnergyPaidRetreat(view,catalog));
});

test('refuses unsupported source cost and no Basic payment',()=>{
  const {catalog,view,active}=sample();
  active.energies=['Prism Energy ASC'];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
  active.energies=['Prism Energy ASC','Darkness Energy MEE'];
  active.printed.retreatCost=[10,10];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
  active.printed.retreatCost=[7];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
});

test('refuses inadequate or special-effect-suppressed Bench energy',()=>{
  const {catalog,view,mega}=sample();
  mega.energies=['Prism Energy ASC','Telepath [P] Energy M3'];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
  mega.energies=['Prism Energy ASC','Prism Energy ASC',
    'Telepath [P] Energy M3'];
  view.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
});

test('refuses spent retreat, status lock, Stadium and Tool modifiers',()=>{
  const {catalog,view,active}=sample();
  view.ownTurnResources.retreatedTurn=42;
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
  view.ownTurnResources.retreatedTurn=0;
  active.specialConditions=[1];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
  active.specialConditions=[];
  active.tools=['Float Stone BKT'];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
  active.tools=[];
  view.opponentPublic.stadium=['Galar Mine RCL'];
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
});

test('preserves an already payable Active attack',()=>{
  const {catalog,view,active}=sample();
  active.attacks.push({name:'Live attack',cost:[7,10],damage:100,
    gxAttack:false});
  assert.equal(proposeMixedEnergyPaidRetreat(view,catalog),null);
});

test('preserves immutable owner observation and rejects prompt-phase use',()=>{
  const {catalog,view}=sample();
  const before=JSON.stringify(view);
  assert.ok(proposeMixedEnergyPaidRetreat(view,catalog));
  assert.equal(JSON.stringify(view),before);
  view.decisionKind='owner-prompt';
  assert.throws(()=>proposeMixedEnergyPaidRetreat(view,catalog),
    /owner-root/);
});
