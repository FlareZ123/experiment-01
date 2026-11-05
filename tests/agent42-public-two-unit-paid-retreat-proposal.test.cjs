'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,twoUnitPayment,postRetreatPrintedDamage,
  proposeTwoUnitPaidRetreat:choose}=
  require('../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal.cjs');

const P='Psychic Energy MEE';
const catalog={
  stages:{BASIC:0,STAGE_1:1},
  basicEnergies:new Set([P,'Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:5,Darkness:7},
  colorlessEnergyType:9,
  specialEnergies:new Set(['Double Colorless Energy EVO','Prism Energy ASC']),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set()
};
function fixture(){
  const active={
    printing:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',
    printed:{stage:1,types:[5],retreatCost:[9,9]},
    energies:[P,P],tools:[],specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Max Geist',cost:[9,9,9],damage:10}]
  };
  const powered={
    printing:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',
    printed:{stage:1,types:[5],retreatCost:[9,9]},
    energies:[P,P,P],tools:[],specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Max Geist',cost:[9,9,9],damage:10}]
  };
  const girafarig={
    printing:'Girafarig LOT',name:'Girafarig',
    printed:{stage:0,types:[5]},energies:[P,P],
    attacks:[{name:'Get Lost',cost:[9],damage:0}],
    publicRestrictions:{},specialConditions:[]
  };
  const view={
    decisionKind:'owner-root',globalTurn:34,ownHand:[],
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{active,bench:[girafarig,null,powered],
      prizeCount:6,stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{printing:'Lunatone OBF',name:'Lunatone',
      printed:{hp:90},damage:10},bench:[],prizeCount:6,stadium:[]}
  };
  Object.defineProperty(view,'opponentPrivate',{
    get(){throw Error('opponent hidden information must not be accessed');}
  });
  return view;
}

test('original source rank1 funded two-unit paid-retreat is representable',()=>{
  const view=fixture();
  const plan=choose(view,catalog);
  assert.match(VERSION,/agent42/);
  assert.equal(plan?.kind,'two-unit-paid-retreat-proposal');
  assert.equal(plan?.benchIndex,2);
  assert.deepEqual(plan?.discardEnergyIndices,[0,1]);
  assert.deepEqual(plan?.discardEnergyPrintings,[P,P]);
  assert.equal(plan?.projectedPrintedDamage,160);
  assert.equal(plan?.retreatCostUnits,2);
  assert.equal(plan?.nativeStorePaymentVerified,false);
  assert.equal(plan?.subsequentAttackVerified,false);
  assert.equal(plan?.competitiveGameQualified,false);
});

test('Max Geist loses two Psychic when paid Retreat discards two Basics',()=>{
  const view=fixture();
  const attack=view.ownPublic.bench[2].attacks[0];
  assert.equal(postRetreatPrintedDamage(view,
    view.ownPublic.bench[2],attack,[],catalog),220);
  assert.equal(postRetreatPrintedDamage(view,
    view.ownPublic.bench[2],attack,[0,1],catalog),160);
  view.ownPublic.bench[0].energies.push(P);
  assert.equal(postRetreatPrintedDamage(view,
    view.ownPublic.bench[2],attack,[0,1],catalog),190);
});

test('one Double Colorless card can meet a two-unit retreat fee',()=>{
  assert.deepEqual(twoUnitPayment(['Double Colorless Energy EVO',P],
    {isEvolution:true}),{
    indices:[0],printings:['Double Colorless Energy EVO']
  });
});

test('two independent Basic Energy cards are selected in index order',()=>{
  assert.deepEqual(twoUnitPayment([P,'Darkness Energy MEE',P],
    {isEvolution:true}),{
    indices:[0,1],printings:[P,'Darkness Energy MEE']
  });
});

test('unknown Energy and overly large exact-payment state fail closed',()=>{
  assert.equal(twoUnitPayment([P,'Mystery Energy XYZ'],
    {isEvolution:true}),null);
  assert.equal(twoUnitPayment(Array(13).fill(P),
    {isEvolution:true}),null);
});

test('already payable Active attack prevents unmodeled tactical displacement',()=>{
  const view=fixture();
  view.ownPublic.active.energies.push(P);
  assert.equal(choose(view,catalog),null);
});

test('too little Energy to pay two Colorless rejects proposed Retreat',()=>{
  const view=fixture();
  view.ownPublic.active.energies=[P];
  assert.equal(choose(view,catalog),null);
});

test('missing or non-Colorless printed retreat cost rejects',()=>{
  const view=fixture();
  view.ownPublic.active.printed.retreatCost=[9];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.printed.retreatCost=[5,9];
  assert.equal(choose(view,catalog),null);
});

test('Stadium or Tool modifier uncertainty blocks native proposal',()=>{
  const view=fixture();
  view.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.stadium=[];
  view.opponentPublic.stadium=['Dimension Valley PHF'];
  assert.equal(choose(view,catalog),null);
  view.opponentPublic.stadium=[];
  view.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choose(view,catalog),null);
});

test('retreat quota, attack lock, and paralysis deny the branch',()=>{
  const a=fixture();a.ownTurnResources.retreatedTurn=34;
  assert.equal(choose(a,catalog),null);
  const b=fixture();b.ownPublic.active.specialConditions=[2];
  assert.equal(choose(b,catalog),null);
  const c=fixture();
  c.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(choose(c,catalog),null);
});

test('Benched attacker must have payable attack and real projected damage',()=>{
  const view=fixture();
  view.ownPublic.bench[2].energies=[P];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.bench[2].energies=[P,P,P];
  view.ownPublic.bench[2].attacks[0].gxAttack=true;
  assert.equal(choose(view,catalog),null);
});

test('unknown special board Energy cannot inflate Max Geist damage',()=>{
  const view=fixture();
  view.ownPublic.bench[0].energies=['Prism Energy ASC',P];
  assert.equal(choose(view,catalog),null);
});

test('owner-only observation is immutable and opposing secrets untouched',()=>{
  const view=fixture();
  const before=JSON.stringify(view);
  assert.equal(choose(view,catalog)?.benchIndex,2);
  assert.equal(JSON.stringify(view),before);
  view.decisionKind='owner-prompt';
  assert.throws(()=>choose(view,catalog),/owner-root/);
});
