'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {screenPlumeriaPayment}=require('../simulation/twinleaf/agent38-plumeria-cost-conservation.cjs');
const {collectOwnerPlumeriaPaymentMenu}=require('../simulation/twinleaf/agent4-plumeria-payment-menu.cjs');

/** @param {string[]} hand */
function view(hand){
  return {decisionKind:'owner-root',globalTurn:3,ownHand:[...hand],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{publicTurnRestrictions:{},resolvingSupporter:[]},
    opponentPublic:{active:{printing:'Opponent Active',
      energies:['Psychic Energy MEE','Psychic Energy MEE']},bench:[]}};
}
function offer(v){
  const x=collectOwnerPlumeriaPaymentMenu(v);
  return {...x.offers[0],paymentTargets:x.targets};
}
test('two Speed Energy cost consumes last printing',()=>{
  const v=view(['Plumeria BUS','Speed Lightning Energy RCL',
    'Speed Lightning Energy RCL','Guzma & Hala CEC','Capture Energy RCL']);
  const before=JSON.stringify(v);
  const x=screenPlumeriaPayment(v,offer(v));
  assert.deepEqual(x.predictedPrintings,
    ['Speed Lightning Energy RCL','Speed Lightning Energy RCL']);
  assert.deepEqual(x.erasedPrintings,['Speed Lightning Energy RCL']);
  assert.equal(x.allow,false);
  assert.equal(JSON.stringify(v),before);
});
test('mixed duplicate payments conserve both card printings',()=>{
  const v=view(['Plumeria BUS','Energy A','Energy A','Energy B','Energy B']);
  const x=screenPlumeriaPayment(v,offer(v));
  assert.equal(x.allow,true);
  assert.equal(x.erasedPrintings.length,0);
  assert.notEqual(x.predictedPrintings[0],x.predictedPrintings[1]);
});
test('only singleton cards cannot pay without erasure',()=>{
  const v=view(['Plumeria BUS','Guzma BUS','Speed Lightning Energy RCL']);
  const x=screenPlumeriaPayment(v,offer(v));
  assert.equal(x.allow,false);
  assert.equal(x.erasedPrintings.length,2);
});
test('outside actor47 eighteen-card hand scope fails closed',()=>{
  const v=view(['Plumeria BUS',...Array.from({length:19},(_,i)=>'Energy '+i)]);
  const x=screenPlumeriaPayment(v,offer(v));
  assert.equal(x.reason,'payment-prompt-outside-actor47-bounded-menu');
  assert.equal(x.allow,false);
});
test('stale physical pair fails closed',()=>{
  const v=view(['Plumeria BUS','Energy A','Energy A','Energy B','Energy B']);
  const x=screenPlumeriaPayment(v,{...offer(v),paymentPairs:[
    {handIndices:[1,2],printings:['Energy A','Energy B']}]});
  assert.equal(x.reason,'invalid-physical-payment-pair');
  assert.equal(x.allow,false);
});
test('second held Plumeria is correctly distinguished from played Plumeria',()=>{
  const v=view(['Plumeria BUS','Plumeria BUS',
    'Energy A','Energy A','Energy B','Energy B']);
  const x=screenPlumeriaPayment(v,offer(v));
  assert.equal(x.allow,true);
  assert.equal(x.handAfterPlayingSupporter,5);
  assert.equal(x.predictedPrintings.includes('Plumeria BUS'),false);
});
