'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {twoPsychicPayment,postRetreatPrintedDamage}=require('../../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const P='Psychic Energy MEE';
const catalog={basicEnergies:new Set([P])};

test('exactly two basic Psychic Energy pay the two-unit retreat',()=>{
  assert.deepEqual(twoPsychicPayment({energies:[P,P]},catalog),{
    indices:[0,1],printings:[P,P]
  });
});

test('surplus basic Psychic Energy remains attached after selecting two units',()=>{
  assert.deepEqual(twoPsychicPayment({energies:[P,P,P]},catalog),{
    indices:[0,1],printings:[P,P]
  });
  assert.deepEqual(twoPsychicPayment({energies:[P,P,P,P]},catalog),{
    indices:[0,1],printings:[P,P]
  });
});

test('fewer than two attached Energy units cannot pay the retreat',()=>{
  assert.equal(twoPsychicPayment({energies:[P]},catalog),null);
  assert.equal(twoPsychicPayment({energies:[]},catalog),null);
});

test('unknown or non-Psychic Energy remains unsupported',()=>{
  assert.equal(twoPsychicPayment({energies:[P,P]},{}),null);
  assert.equal(twoPsychicPayment({energies:[P,'Double Dragon Energy ROS']},catalog),null);
});


test('surplus Psychic Energy remains in the Max Geist board-energy projection',()=>{
  const active={energies:[P,P,P]};
  const benchAttacker={printing:'Shadow Rider Calyrex VMAX CRE'};
  const view={ownPublic:{
    active,bench:[{energies:[P,P,P,P]}]
  }};
  const payment=twoPsychicPayment(active,catalog);
  assert.deepEqual(payment,{indices:[0,1],printings:[P,P]});
  assert.equal(postRetreatPrintedDamage(view,benchAttacker,{
    name:'Max Geist',damageCalculation:null
  },payment,catalog),160);
});
