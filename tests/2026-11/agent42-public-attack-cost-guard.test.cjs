'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {attackBlocked}=require('../../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const attack={name:'Full Moon Rondo',cost:['Psychic','Colorless']};
const player={attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0};

function slot(extra={}){
  return {publicRestrictions:{
    cannotAttackNextTurn:false,
    cannotUseAttacksNextTurn:[],
    blockedAttackNameNextTurn:null,
    blockedAttackNameUntilLeavesActive:null,
    onlyAllowedAttackNameNextTurn:null,
    attackCostIncreaseNextTurn:0,
    attackCostIncreaseWhileActive:0,
    ...extra
  }};
}

test('zero public cost modifiers permit the printed attack gate',()=>{
  assert.equal(attackBlocked(slot(),attack,player),false);
});

test('ordinary named attack restrictions remain represented',()=>{
  assert.equal(attackBlocked(slot({
    blockedAttackNameNextTurn:attack.name
  }),attack,player),true);
  assert.equal(attackBlocked(slot({
    cannotAttackNextTurn:true
  }),attack,player),true);
});

test('next-turn attack cost increase fails closed',()=>{
  assert.equal(attackBlocked(slot({
    attackCostIncreaseNextTurn:1
  }),attack,player),null);
});

test('while-active attack cost increase fails closed after promotion',()=>{
  assert.equal(attackBlocked(slot({
    attackCostIncreaseWhileActive:1
  }),attack,player),null);
});

test('missing per-Pokemon modifier metadata fails closed',()=>{
  const p=slot();
  delete p.publicRestrictions.attackCostIncreaseWhileActive;
  assert.equal(attackBlocked(p,attack,player),null);
});

test('active player attack-max-energy restriction fails closed',()=>{
  assert.equal(attackBlocked(slot(),attack,{
    attackMaxEnergy:1,attackMaxEnergyTurnsRemaining:1
  }),null);
});

test('inactive stale attack-max-energy value does not veto',()=>{
  assert.equal(attackBlocked(slot(),attack,{
    attackMaxEnergy:1,attackMaxEnergyTurnsRemaining:0
  }),false);
});

test('missing or inconsistent player restriction metadata fails closed',()=>{
  assert.equal(attackBlocked(slot(),attack,null),null);
  assert.equal(attackBlocked(slot(),attack,{
    attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:1
  }),null);
  assert.equal(attackBlocked(slot(),attack,{
    attackMaxEnergy:1,attackMaxEnergyTurnsRemaining:-1
  }),null);
});
