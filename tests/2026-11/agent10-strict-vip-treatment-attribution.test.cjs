'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,VIP_PRINTING,firstDivergence,strictVipTreatmentAttribution,
  firstTreatmentDifferenceIsVip
}=require('../../simulation/evaluation/agent10-strict-vip-treatment-attribution.cjs');

function fixture(){
  const controlLedger=[{
    action:'PassTurnAction',playerSlot:1,turnBefore:1,actionOrdinal:0
  }];
  const treatmentLedger=[{
    action:'PlayCardAction',card:VIP_PRINTING,
    playerSlot:1,turnBefore:1,actionOrdinal:0
  }];
  const vipAudit={
    policyRecorded:true,
    examples:[
      {kind:'vip-item',seat:1,turn:1,printing:VIP_PRINTING,accepted:true},
      {kind:'vip-search',seat:1,turn:1,
        printings:['Duskull VIV','Galarian Articuno VIV'],
        accepted:true,nativeBenchConfirmed:true,
        benchBefore:1,benchAfter:3,deckBefore:50,deckAfter:48}
    ]
  };
  return {controlLedger,treatmentLedger,vipAudit};
}

test('exact Pass to VIP play plus accepted physical owner search is attributed',()=>{
  const data=fixture();
  const result=strictVipTreatmentAttribution(
    data.controlLedger,data.treatmentLedger,data.vipAudit);
  assert.equal(VERSION,'agent10-strict-vip-treatment-attribution-v1');
  assert.equal(result.attributed,true);
  assert.equal(result.divergenceIndex,1);
  assert.equal(result.seat,1);
  assert.equal(result.turn,1);
  assert.equal(result.physicalSearch.selectedBasicCount,2);
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),true);
});

test('wrong-seat native item and search receipts fail closed',()=>{
  const data=fixture();
  data.vipAudit.examples.forEach(event=>{event.seat=0;});
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('wrong-turn native item and search receipts fail closed',()=>{
  const data=fixture();
  data.vipAudit.examples.forEach(event=>{event.turn=2;});
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('missing accepted item receipt fails closed',()=>{
  const data=fixture();
  data.vipAudit.examples=data.vipAudit.examples.filter(
    event=>event.kind!=='vip-item');
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('wrong VIP printing fails closed despite a matching substring',()=>{
  const data=fixture();
  data.vipAudit.examples[0].printing='Battle VIP Pass';
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
  data.treatmentLedger[0].card='Battle VIP Pass SWSH';
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('missing accepted search receipt fails closed',()=>{
  const data=fixture();
  data.vipAudit.examples=data.vipAudit.examples.filter(
    event=>event.kind!=='vip-search');
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('unconfirmed native search fails closed',()=>{
  const data=fixture();
  data.vipAudit.examples[1].nativeBenchConfirmed=false;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('search without physical deck and Bench deltas fails closed',()=>{
  const data=fixture();
  data.vipAudit.examples[1].deckAfter=49;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
  data.vipAudit.examples[1].deckAfter=48;
  data.vipAudit.examples[1].benchAfter=2;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('zero-card search cannot certify a physical VIP treatment',()=>{
  const data=fixture();
  Object.assign(data.vipAudit.examples[1],{
    printings:[],benchAfter:1,deckAfter:50
  });
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('search must follow its accepted VIP item in the native event sequence',()=>{
  const data=fixture();
  data.vipAudit.examples.reverse();
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('first changed root must itself be the exact VIP play',()=>{
  const data=fixture();
  data.treatmentLedger[0].card='Quick Ball FST';
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
  data.treatmentLedger[0].card=VIP_PRINTING;
  data.treatmentLedger[0].action='UseAbilityAction';
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('first control root must be PassTurnAction',()=>{
  const data=fixture();
  data.controlLedger[0].action='AttackAction';
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('first changed root must retain the same physical seat and turn',()=>{
  const data=fixture();
  data.treatmentLedger[0].playerSlot=0;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
  data.treatmentLedger[0].playerSlot=1;
  data.treatmentLedger[0].turnBefore=2;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('a later VIP event cannot rescue an earlier unrelated root divergence',()=>{
  const data=fixture();
  data.controlLedger.unshift({
    action:'PassTurnAction',playerSlot:1,turnBefore:1,actionOrdinal:0
  });
  data.treatmentLedger.unshift({
    action:'PlayCardAction',card:'Quick Ball FST',
    playerSlot:1,turnBefore:1,actionOrdinal:0
  });
  data.controlLedger[1].actionOrdinal=1;
  data.treatmentLedger[1].actionOrdinal=1;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('conflicting seat aliases and mismatched root ordinals fail closed',()=>{
  const data=fixture();
  data.treatmentLedger[0].seat=0;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
  delete data.treatmentLedger[0].seat;
  data.treatmentLedger[0].actionOrdinal=1;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
});

test('unrecorded audit, missing ledger and unchanged control fail closed',()=>{
  const data=fixture();
  data.vipAudit.policyRecorded=false;
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.treatmentLedger,data.vipAudit),false);
  data.vipAudit.policyRecorded=true;
  assert.equal(firstDivergence(null,data.treatmentLedger),null);
  assert.equal(firstTreatmentDifferenceIsVip(
    data.controlLedger,data.controlLedger,data.vipAudit),false);
});
