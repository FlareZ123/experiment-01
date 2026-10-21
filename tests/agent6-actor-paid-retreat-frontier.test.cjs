'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePaidRetreatToDamagingBench,projectedPrintedDamage,
  MIN_PROJECTED_DAMAGE,VERSION}=
  require('../simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs');

function fixture(){
  const catalog={
    basicEnergies:new Set(['Psychic Energy MEE']),
    basicEnergyTypes:{Psychic:5},
    colorlessEnergyType:9,
    specialConditions:{ASLEEP:1,PARALYZED:2}
  };
  const active={
    printing:'Girafarig LOT',name:'Girafarig',
    printed:{retreatCost:[9]},energies:['Psychic Energy MEE'],
    attacks:[{name:'Get Lost',cost:[9],damage:0}],
    publicRestrictions:{},specialConditions:[]
  };
  const clefairy={
    printing:"Lillie's Clefairy ex JTG",name:"Lillie's Clefairy ex",
    energies:['Psychic Energy MEE','Psychic Energy MEE'],
    attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
    publicRestrictions:{},specialConditions:[]
  };
  const calyrex={
    printing:'Shadow Rider Calyrex V CRE',name:'Shadow Rider Calyrex V',
    energies:['Psychic Energy MEE'],
    attacks:[{name:'Shadow Mist',cost:[5],damage:10}],
    publicRestrictions:{},specialConditions:[]
  };
  const view={
    decisionKind:'owner-root',globalTurn:9,ownHand:[],
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{active,bench:[calyrex,clefairy,null],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{active:{name:'Mega Absol ex'},bench:[{name:'Trubbish'},{name:'Squawkabilly ex'}]}
  };
  Object.defineProperty(view,'opponentPrivate',{
    get(){throw Error('Illegal opponent hidden-state access');}
  });
  return {view,catalog,active,clefairy,calyrex};
}

test('prefers a fully paid damage line over a zero-damage Active attack',()=>{
  const {view,catalog}=fixture();
  assert.match(VERSION,/agent6/);
  assert.equal(MIN_PROJECTED_DAMAGE,80);
  assert.deepEqual(choosePaidRetreatToDamagingBench(view,catalog),{
    kind:'paid-retreat',benchIndex:1,
    printing:"Lillie's Clefairy ex JTG",
    attackName:'Full Moon Rondo',baseDamage:20,
    projectedPrintedDamage:100,retreatCostUnits:1
  });
});
test('retreat remains one per turn and impossible on opening turn',()=>{
  const {view,catalog}=fixture();
  view.ownTurnResources.retreatedTurn=9;
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  view.ownTurnResources.retreatedTurn=0;view.globalTurn=1;
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
});
test('requires exactly one known Basic Energy to pay printed cost',()=>{
  const {view,catalog,active}=fixture();
  active.energies=[];
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  active.energies=['Double Colorless Energy NXD'];
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  active.energies=['Psychic Energy MEE'];
  active.printed.retreatCost=[9,9];
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
});
test('no readiness or no real damage means no tactical retreat',()=>{
  const {view,catalog,clefairy,calyrex}=fixture();
  clefairy.energies=['Psychic Energy MEE'];
  calyrex.energies=[];
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  clefairy.energies=['Psychic Energy MEE','Psychic Energy MEE'];
  clefairy.attacks[0].damage=0;
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
});
test('does not force a pivot while Active can make a positive-damage attack',()=>{
  const {view,catalog,active}=fixture();
  active.attacks.push({name:'Scratch',cost:[9],damage:10});
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
});
test('respects observed retreat, attack and special-condition locks',()=>{
  const {view,catalog,active,clefairy}=fixture();
  active.specialConditions.push(1);
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  active.specialConditions=[];active.publicRestrictions.cannotRetreatNextTurn=true;
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  active.publicRestrictions.cannotRetreatNextTurn=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  clefairy.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
});
test('rejects premature weak Shadow Mist pivot, then values verified Rondo Bench scaling',()=>{
  const {view,catalog,clefairy}=fixture();
  clefairy.energies=[];
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
  clefairy.energies=['Psychic Energy MEE','Psychic Energy MEE'];
  assert.equal(projectedPrintedDamage(view,clefairy,clefairy.attacks[0]),100);
  view.opponentPublic.bench=[];
  assert.equal(projectedPrintedDamage(view,clefairy,clefairy.attacks[0]),60);
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog),null);
});
test('no owner revelation of hidden cards, no mutation of observation',()=>{
  const {view,catalog}=fixture();
  const before=JSON.stringify(view);
  assert.equal(choosePaidRetreatToDamagingBench(view,catalog)?.benchIndex,1);
  assert.equal(JSON.stringify(view),before);
  view.decisionKind='owner-prompt';
  assert.throws(()=>choosePaidRetreatToDamagingBench(view,catalog),/owner-root/);
});
