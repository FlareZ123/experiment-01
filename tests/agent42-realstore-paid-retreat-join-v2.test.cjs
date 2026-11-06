'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {visiblePaidRetreat,join}=
  require('../simulation/evaluation/agent42-realstore-paid-retreat-join-v2.cjs');
const P='Psychic Energy MEE',VMAX='Shadow Rider Calyrex VMAX CRE';
function zone(pokemon,count,tools=[]){
  return {pokemon,energies:Array(count).fill(P),tools};
}
function setup(seat=1,target='Latias ex SSP',attack='Eon Blade'){
  const event={rootActionOrdinal:131,playerSlot:seat,
    action:'RetreatAction',storeAccepted:true,declared:{benchIndex:1},
    publicBoardChanges:[
      {seat,position:'active',index:0,
        before:zone(VMAX,2),after:zone(target,3)},
      {seat,position:'bench',index:1,
        before:zone(target,3),after:zone(VMAX,0)}
    ]};
  const row={trial:{id:'rank1-v4-original'},
    rootActionLedger:[
      {actionOrdinal:131,playerSlot:seat,turnBefore:22,action:'RetreatAction'},
      {actionOrdinal:132,playerSlot:seat,turnBefore:22,action:'AttackAction'}],
    nativeAcceptedTargetSidecar:{events:[event]},
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:132,turnBefore:22,attackName:attack,
      settledPromptChain:true,settlementCrossesClockReset:false,
      prizesBefore:seat===1?[6,1]:[1,6],
      prizesAfter:seat===1?[6,0]:[0,6],
      nextSourceSameEpochProven:true}]},
    finished:true,winner:seat,finalPrizes:seat===1?[6,0]:[0,6]};
  const wrapper={exactPhysicalPaidRetreats:1,receipts:[{
    status:'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT',
    turn:22,sourceSeat:seat,benchIndex:1,targetPrinting:target,
    physicalPaymentObjectCustodyConfirmed:true}]};
  return {event,row,wrapper};
}
for(const seat of [0,1]){
  test('rank1 VMAX to Latias Eon Blade joins public root and physical custody seat '+seat,()=>{
    const f=setup(seat);
    assert.equal(visiblePaidRetreat(f.event,seat),true);
    const r=join(f.row,f.wrapper,seat);
    assert.equal(r.certifiedRealStorePublicPaidRetreatRoots,1);
    assert.equal(r.physicallyCustodiedPaidRetreatRoots,1);
    assert.equal(r.results[0].targetPrinting,'Latias ex SSP');
    assert.equal(r.results[0].nextSettledSourceAttackName,'Eon Blade');
    assert.equal(r.results[0].nextSettledAttackTookPrize,true);
    assert.equal(r.results[0].sourceNativeTerminalWin,true);
    assert.equal(r.paperQualifiedGames,0);
  });
}
test('VMAX target and Max Geist remain supported',()=>{
  const f=setup(1,VMAX,'Max Geist');
  const r=join(f.row,f.wrapper,1);
  assert.equal(r.results[0].targetPrinting,VMAX);
  assert.equal(r.results[0].nextSettledSourceAttackName,'Max Geist');
});
test('unbound global receipt never upgrades public root to physical custody',()=>{
  const f=setup();
  f.wrapper.receipts=[];
  const r=join(f.row,f.wrapper,1);
  assert.equal(r.certifiedRealStorePublicPaidRetreatRoots,1);
  assert.equal(r.physicallyCustodiedPaidRetreatRoots,0);
});
test('missing attack, wrong target transition, and duplicate sidecar fail their gates',()=>{
  const a=setup();
  a.row.sourceAttackSettlement.attacks[0].settledPromptChain=false;
  assert.equal(join(a.row,a.wrapper,1).settledAttackFollowingPaidRetreat,0);
  const b=setup();
  b.event.publicBoardChanges[0].after.energies=[P];
  assert.equal(join(b.row,b.wrapper,1).certifiedRealStorePublicPaidRetreatRoots,0);
  const c=setup();
  c.row.nativeAcceptedTargetSidecar.events.push(c.event);
  assert.equal(join(c.row,c.wrapper,1).certifiedRealStorePublicPaidRetreatRoots,0);
});
