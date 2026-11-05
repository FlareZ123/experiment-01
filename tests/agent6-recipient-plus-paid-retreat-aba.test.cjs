'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {paidRetreatReceipt}=require('../simulation/evaluation/agent6-recipient-plus-paid-retreat-aba.cjs');
function scenario(){
  const energies=['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'];
  return {storeAccepted:true,action:'RetreatAction',playerSlot:1,turnBefore:15,
    visibility:'public-after-dispatch',rootActionOrdinal:80,
    declared:{kind:'retreat',status:'captured',benchIndex:0},
    publicBoardChanges:[
      {seat:1,position:'active',index:0,
        before:{pokemon:'Dialga-GX UPR',energies},
        after:{pokemon:'Shadow Rider Calyrex V CRE',energies:[]}},
      {seat:1,position:'bench',index:0,
        before:{pokemon:'Shadow Rider Calyrex V CRE',energies:[]},
        after:{pokemon:'Dialga-GX UPR',energies:[]}}
    ]};
}
test('physical three-Basic retreat can be witnessed without paper legality certification',()=>{
  const x=paidRetreatReceipt(scenario());
  assert.equal(x?.observedNativePaidBasicRetreat,true);
  assert.equal(x?.energyCardDelta,3);
  assert.equal(x?.ownerSeat,1);
  assert.equal(x?.paperFullLegalityCertified,false);
});
test('Store no-op, rejection and invisible action cannot count',()=>{
  const a=scenario();a.storeAccepted=false;
  assert.equal(paidRetreatReceipt(a),null);
  const b=scenario();b.publicBoardChanges=[];
  assert.equal(paidRetreatReceipt(b),null);
  const c=scenario();c.visibility='target-unobserved';
  assert.equal(paidRetreatReceipt(c),null);
});
test('no physical cost or Special Energy makes payment unknown',()=>{
  const a=scenario();a.publicBoardChanges[1].after.energies=
    a.publicBoardChanges[0].before.energies;
  assert.equal(paidRetreatReceipt(a)?.observedNativePaidBasicRetreat,false);
  const b=scenario();b.publicBoardChanges[0].before.energies[1]='Prism Energy NVI';
  assert.equal(paidRetreatReceipt(b)?.observedNativePaidBasicRetreat,false);
});
test('must find old Active on own Bench after dispatch',()=>{
  const a=scenario();a.publicBoardChanges[1].after.pokemon='Other';
  assert.equal(paidRetreatReceipt(a),null);
  const b=scenario();b.publicBoardChanges[1].seat=0;
  assert.equal(paidRetreatReceipt(b),null);
});
