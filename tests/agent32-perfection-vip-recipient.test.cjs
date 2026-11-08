'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preferPerfectionMewtwoDonorVipRecipient}=
  require('../simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs');

const BASIC=0,POKEMON=0;
const mewtwo={fullName:'Mewtwo & Mew-GX UNM',stage:BASIC,superType:POKEMON};
const donor={fullName:'Gengar & Mimikyu-GX TEU',stage:BASIC,superType:POKEMON};
const competing={fullName:'Duskull VIV',stage:BASIC,superType:POKEMON};

/** @returns {object} Detached owner-only prompt observation. */
function view(){
  return {decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
    ownPublic:{active:{printing:'Galarian Articuno V CRE'},
      bench:[null,null,null,null,null]},
    opponentPublic:{handCount:7,hiddenDeck:['DO-NOT-READ']}};
}

/** @param {object[]} cards @param {boolean} [accept] */
function pending(cards,accept=true){
  return {cards:{cards},validate:selection=>accept&&
    selection.length<=2&&selection.every(card=>cards.includes(card))};
}

test('select physical Mewtwo plus Gengar donor only from authorized owner search',()=>{
  const v=view(),p=pending([competing,mewtwo,donor]);
  const original=structuredClone(v);
  const found=preferPerfectionMewtwoDonorVipRecipient(p,v,
    {BASIC,POKEMON});
  assert.deepEqual(found,[mewtwo,donor]);
  assert.deepEqual(v,original);
});

test('missing either physical source and fewer than two owner Bench spaces veto',()=>{
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([mewtwo,competing]),view(),{BASIC,POKEMON}),null);
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([donor,competing]),view(),{BASIC,POKEMON}),null);
  const v=view();v.ownPublic.bench=[competing,competing,competing,competing,null];
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([mewtwo,donor]),v,{BASIC,POKEMON}),null);
});

test('do not select duplicate already deployed Mewtwo or donor and obey exact native validator',()=>{
  const v=view();v.ownPublic.bench[0]={printing:mewtwo.fullName};
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([mewtwo,donor]),v,{BASIC,POKEMON}),null);
  v.ownPublic.bench[0]={printing:donor.fullName};
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([mewtwo,donor]),v,{BASIC,POKEMON}),null);
  v.ownPublic.bench[0]=null;
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([mewtwo,donor],false),v,{BASIC,POKEMON}),null);
});

test('nonbasic donor and non-Pokémon representations cannot masquerade as valid pair',()=>{
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([mewtwo,{...donor,stage:1}]),view(),{BASIC,POKEMON}),null);
  assert.equal(preferPerfectionMewtwoDonorVipRecipient(
    pending([{...mewtwo,superType:1},donor]),view(),{BASIC,POKEMON}),null);
});

test('opponent hidden fields cannot affect owner-authorized physical selection',()=>{
  const a=view(),b=view();
  b.opponentPublic.hiddenDeck=['EVERY-OTHER-CARD'];
  b.opponentPublic.handCount=1;
  assert.deepEqual(preferPerfectionMewtwoDonorVipRecipient(
    pending([competing,mewtwo,donor]),a,{BASIC,POKEMON}),
  preferPerfectionMewtwoDonorVipRecipient(
    pending([competing,mewtwo,donor]),b,{BASIC,POKEMON}));
});
