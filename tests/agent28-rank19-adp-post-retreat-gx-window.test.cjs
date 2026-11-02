'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {observeAdpBoostedGxResourceWindow:observe,ADP,DDE,GX}=
  require('../simulation/twinleaf/agent28-adp-post-retreat-gx-window.cjs');

/** @param {object} [change] @returns {object} Detached source-visible view. */
function view(change={}){
  const active={printing:ADP,energies:[DDE,DDE],
    attacks:[{name:'Ultimate Ray',gxAttack:false,cost:['W','M','C']},
      {name:GX,gxAttack:true,cost:['M']}],publicRestrictions:{}};
  const owner={active,stadium:[],publicTurnRestrictions:{
    gxUsed:false,cannotUseGXAttacks:false,attackLockTurnsRemaining:0}};
  return {decisionKind:'owner-root',globalTurn:14,ownPublic:owner,
    opponentPublic:{stadium:[]},...change};
}

test('post-retreat ADP with two DDE exposes a nominal boosted GX option',()=>{
  const v=view();
  const before=JSON.stringify(v);
  const row=observe(v);
  assert.equal(row.globalTurn,14);
  assert.equal(row.ddeAttachedCards,2);
  assert.deepEqual(row.printedCost,['M']);
  assert.equal(row.nominalBoostedResourceWindow,true);
  assert.equal(row.nativePlayableCertified,false);
  assert.equal(JSON.stringify(v),before,'observer must not mutate caller state');
});

test('one DDE is sufficient for printed Metal plus extra Water resource',()=>{
  const v=view();v.ownPublic.active.energies=[DDE];
  assert.equal(observe(v).nominalBoostedResourceWindow,true);
});

test('used GX, GX lock, attack lock and Temple close the simple resource window',()=>{
  const cases=[
    v=>{v.ownPublic.publicTurnRestrictions.gxUsed=true;},
    v=>{v.ownPublic.publicTurnRestrictions.cannotUseGXAttacks=true;},
    v=>{v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;},
    v=>{v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;},
    v=>{v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn=GX;},
    v=>{v.opponentPublic.stadium=['Temple of Sinnoh ASR'];},
    v=>{v.ownPublic.active.energies=[];},
    v=>{v.ownPublic.active.attacks=[{name:'Ultimate Ray',gxAttack:false}];}
  ];
  cases.forEach((mutate,index)=>{
    const v=view();mutate(v);
    assert.equal(observe(v).nominalBoostedResourceWindow,false,`case ${index}`);
  });
});

test('other Active and wrong decision type never yield a GX opportunity',()=>{
  const v=view();v.ownPublic.active.printing='Raging Bolt ex TEF';
  assert.equal(observe(v),null);
  v.decisionKind='owner-prompt';
  assert.throws(()=>observe(v),/owner-root/);
});
