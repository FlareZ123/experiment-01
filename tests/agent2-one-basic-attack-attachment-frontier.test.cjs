'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyOneBasicAttachmentAtPass:classify}=
  require('../simulation/twinleaf/agent2-one-basic-attack-attachment-frontier.cjs');

const P='Psychic Energy MEG',D='Darkness Energy MEG';
const catalog={
  basicEnergies:new Set([P,D]),
  basicEnergyTypes:{Psychic:5,Darkness:7},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:1,PARALYZED:2}
};

/** @returns {object} Detached synthetic actor observation. */
function view(){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:8,
    ownHand:[P,'Guzma Hala',D],
    ownTurnResources:{energyPlayedTurn:5,energyPlayLocked:false},
    ownPublic:{
      publicTurnRestrictions:{energyPlayLocked:false,attackLockTurnsRemaining:0,
        gxUsed:false},
      active:{printing:'Psychic Active',energies:[P],specialConditions:[],
        publicRestrictions:{},attacks:[{name:'Two-Psychic',cost:[5,5],
          damage:100,gxAttack:false}]},
      bench:[{printing:'One-Energy Bench',energies:[],
        publicRestrictions:{},specialConditions:[],
        attacks:[{name:'Free-Next-Psychic',cost:[5],damage:0,
          damageCalculation:'dynamic'}]}]
    },
    opponentPublic:{active:{printing:'Opposing Active'}}
  };
}
test('separates already-unfunded Active and future-only Bench one-Basic paths',()=>{
  const input=view(),before=structuredClone(input);
  const r=classify(input,catalog);
  assert.equal(r.anyOneBasicShortfall,true);
  assert.equal(r.anyQuotaAllowedActive,true);
  assert.equal(r.anyQuotaAllowedBench,true);
  assert.equal(r.activeShortfallCount,1);
  assert.equal(r.benchShortfallCount,1);
  assert.equal(r.examples.find(x=>x.kind==='active').heldBasicPrinting,P);
  assert.equal(r.examples.find(x=>x.kind==='bench').requiresFutureSwitch,true);
  assert.deepEqual(input,before,'diagnostic must not modify owner view');
});
test('no ordinary Energy quota means a raw shortfall but zero payable proposals',()=>{
  const input=view();
  input.ownTurnResources.energyPlayedTurn=8;
  const r=classify(input,catalog);
  assert.equal(r.anyOneBasicShortfall,true);
  assert.equal(r.anyQuotaAllowedActive,false);
  assert.equal(r.anyQuotaAllowedBench,false);
  assert.equal(r.openEnergyQuota,false);
});
test('Energy lock and first-turn window separately veto nominal opportunities',()=>{
  const a=view();a.ownPublic.publicTurnRestrictions.energyPlayLocked=true;
  const b=view();b.globalTurn=1;
  const ar=classify(a,catalog),br=classify(b,catalog);
  assert.equal(ar.energyPlayLocked,true);
  assert.equal(ar.anyQuotaAllowedBench,false);
  assert.equal(br.eligibleTurn,false);
  assert.equal(br.anyQuotaAllowedActive,false);
});
test('missing two Energy and special-energy complexities are not invented',()=>{
  const a=view();a.ownPublic.active.energies=[];
  a.ownPublic.active.attacks[0].cost=[5,5];
  a.ownPublic.bench[0].energies=['Double Dragon Energy RSK'];
  const r=classify(a,catalog);
  assert.equal(r.anyOneBasicShortfall,false);
  assert.equal(r.offeredBasicCount,0);
});
test('owner-only contract excludes opposing hidden hand as signal',()=>{
  const a=view(),b=view();
  b.opponentPublic.hiddenHand=['Unseen Psychic Energy'];
  assert.deepEqual(classify(a,catalog),classify(b,catalog));
});
test('printed GX usage and attack flags veto nominal attack without hiding raw shortfall',()=>{
  const a=view();
  a.ownPublic.publicTurnRestrictions.gxUsed=true;
  a.ownPublic.active.attacks[0].gxAttack=true;
  a.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn=true;
  const r=classify(a,catalog);
  assert.equal(r.anyOneBasicShortfall,true);
  assert.equal(r.anyQuotaAllowedActive,false);
  assert.equal(r.anyQuotaAllowedBench,false);
});
